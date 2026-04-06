package controller

import (
	"fmt"
	"math"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/smartwalle/alipay/v3"
	"github.com/songquanpeng/one-api/common/config"
	"github.com/songquanpeng/one-api/common/ctxkey"
	"github.com/songquanpeng/one-api/common/logger"
	"github.com/songquanpeng/one-api/model"
)

type AlipayCheckoutRequest struct {
	Amount float64 `json:"amount"` // Amount in RMB, e.g. 10.0 for ¥10
}

func alipayClient() (*alipay.Client, error) {
	if config.AlipayAppId == "" || config.AlipayPrivateKey == "" {
		return nil, fmt.Errorf("alipay credentials not configured")
	}
	// The 3rd parameter must be true for production environment. false means sandbox.
	client, err := alipay.New(config.AlipayAppId, config.AlipayPrivateKey, true)
	if err != nil {
		return nil, err
	}
	if config.AlipayPublicKey != "" {
		// Used to verify Alipay Webhooks
		err = client.LoadAliPayPublicKey(config.AlipayPublicKey)
		if err != nil {
			return nil, fmt.Errorf("failed to load alipay public key: %w", err)
		}
	}
	return client, nil
}

func CreateAlipayCheckoutSession(c *gin.Context) {
	if config.AlipayAppId == "" {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "管理员尚未配置支付宝，请联系管理员开通在线支付。",
		})
		return
	}

	var req AlipayCheckoutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "请求参数错误"})
		return
	}

	if req.Amount < 0.1 {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "充值金额最低为 ¥0.1"})
		return
	}
	if req.Amount > 100000 {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "单次充值金额不能超过 ¥100,000"})
		return
	}

	userId := c.GetInt(ctxkey.Id)
	tradeNo := fmt.Sprintf("alipay_%d_%d", userId, time.Now().UnixNano())

	client, err := alipayClient()
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "初始化支付宝客户端失败"})
		return
	}

	var p = alipay.TradePagePay{}
	p.NotifyURL = config.ServerAddress + "/api/user/pay/alipay/webhook"
	p.ReturnURL = config.ServerAddress + "/topup?success=true"
	p.Subject = "账户充值"
	p.OutTradeNo = tradeNo
	p.TotalAmount = fmt.Sprintf("%.2f", req.Amount)
	p.ProductCode = "FAST_INSTANT_TRADE_PAY"

	// PassbackParams strictly expects URL-encoded, simple string is fine
	p.PassbackParams = fmt.Sprintf("userid-%d", userId)

	url, err := client.TradePagePay(p)
	if err != nil {
		logger.Error(c.Request.Context(), "alipay pgpay creation failed: "+err.Error())
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "创建支付宝账单失败，请稍后重试",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    url.String(),
	})
}

func AlipayWebhook(c *gin.Context) {
	client, err := alipayClient()
	if err != nil {
		c.String(http.StatusBadRequest, "fail")
		return
	}

	noti, err := client.GetTradeNotification(c.Request)
	if err != nil {
		logger.Error(c.Request.Context(), "alipay webhook signature verification failed: "+err.Error())
		c.String(http.StatusBadRequest, "fail")
		return
	}

	if noti.TradeStatus != "TRADE_SUCCESS" && noti.TradeStatus != "TRADE_FINISHED" {
		c.String(http.StatusOK, "success") // Ack so it stops retrying
		return
	}

	// Parse passback params
	var userId int
	if _, err := fmt.Sscanf(noti.PassbackParams, "userid-%d", &userId); err != nil || userId <= 0 {
		logger.Error(c.Request.Context(), "alipay webhook invalid userId")
		c.String(http.StatusBadRequest, "fail")
		return
	}

	// Calculate quota equivalent (RMB -> equivalent quota)
	amountRMB, _ := strconv.ParseFloat(noti.TotalAmount, 64)

	rate := config.PayRateRMB
	if rate <= 0 {
		rate = 7.2 // Default failover
	}

	amountUSD := amountRMB / rate
	amountCents := int64(math.Round(amountUSD * 100))

	// quota = amountUSD * (config.QuotaPerUnit / 0.002)
	quota := int64(math.Round(amountUSD * (config.QuotaPerUnit / 0.002)))

	sessionId := noti.OutTradeNo

	if model.IsStripeSessionProcessed(sessionId) {
		logger.SysLog(fmt.Sprintf("alipay webhook session %s already processed, skipping", sessionId))
		c.String(http.StatusOK, "success")
		return
	}

	if err := model.CreateStripePaymentRecord(sessionId, userId, amountCents, quota); err != nil {
		if strings.Contains(err.Error(), "duplicate") {
			c.String(http.StatusOK, "success")
			return
		}
		logger.Error(c.Request.Context(), "alipay webhook failed to record payment: "+err.Error())
		c.String(http.StatusInternalServerError, "fail")
		return
	}

	if err := model.IncreaseUserQuota(userId, quota); err != nil {
		logger.Error(c.Request.Context(), fmt.Sprintf("alipay webhook failed to credit quota for user %d: %s", userId, err.Error()))
		c.String(http.StatusOK, "success")
		return
	}

	model.RecordTopupLog(
		c.Request.Context(),
		userId,
		fmt.Sprintf("Alipay 扫码充值 ¥%.2f，到账 %d 配额", amountRMB, quota),
		int(quota),
	)

	logger.SysLog(fmt.Sprintf("alipay webhook successfully credited %d quota to user %d (session %s)", quota, userId, sessionId))
	c.String(http.StatusOK, "success")
}
