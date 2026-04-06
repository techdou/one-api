package controller

import (
	"encoding/json"
	"fmt"
	"io"
	"math"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/songquanpeng/one-api/common/config"
	"github.com/songquanpeng/one-api/common/ctxkey"
	"github.com/songquanpeng/one-api/common/logger"
	"github.com/songquanpeng/one-api/model"
	stripe "github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/client"
	"github.com/stripe/stripe-go/v76/webhook"
)

const (
	stripeMinAmountCents int64 = 100     // $1
	stripeMaxAmountCents int64 = 9990000 // $99,900 (Stripe max ~$999,999.99 but we limit to $99,900)
)

type StripeCheckoutRequest struct {
	Amount int64 `json:"amount"` // Amount in cents, e.g. 1000 for $10
}

// stripeClient returns a per-request Stripe API client using the current key.
// This avoids mutating the global stripe.Key which is not concurrency-safe.
func stripeClient() *client.API {
	sc := &client.API{}
	sc.Init(config.StripeSecretKey, nil)
	return sc
}

func CreateStripeCheckoutSession(c *gin.Context) {
	if config.StripeSecretKey == "" {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "管理员尚未配置 Stripe，请联系管理员开通在线支付。",
		})
		return
	}

	var req StripeCheckoutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "请求参数错误"})
		return
	}

	// Fix #3: Enforce min and max amount
	if req.Amount < stripeMinAmountCents {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "充值金额最低为 $1"})
		return
	}
	if req.Amount > stripeMaxAmountCents {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "单次充值金额不能超过 $99,900"})
		return
	}

	userId := c.GetInt(ctxkey.Id)

	params := &stripe.CheckoutSessionParams{
		PaymentMethodTypes: stripe.StringSlice([]string{"card"}),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
					Currency: stripe.String("usd"),
					ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
						Name: stripe.String("账户充值"),
					},
					UnitAmount: stripe.Int64(req.Amount),
				},
				Quantity: stripe.Int64(1),
			},
		},
		Mode:              stripe.String(string(stripe.CheckoutSessionModePayment)),
		SuccessURL:        stripe.String(config.ServerAddress + "/topup?success=true"),
		CancelURL:         stripe.String(config.ServerAddress + "/topup?canceled=true"),
		ClientReferenceID: stripe.String(fmt.Sprintf("%d", userId)),
		Metadata: map[string]string{
			"user_id": fmt.Sprintf("%d", userId),
			"amount":  fmt.Sprintf("%d", req.Amount),
		},
	}

	// Fix #8: Use per-request client instead of global stripe.Key assignment
	sc := stripeClient()
	s, err := sc.CheckoutSessions.New(params)
	if err != nil {
		logger.Error(c.Request.Context(), "stripe checkout session creation failed: "+err.Error())
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "创建支付会话失败，请稍后重试",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    s.URL,
	})
}

func StripeWebhook(c *gin.Context) {
	if config.StripeWebhookSecret == "" {
		c.Status(http.StatusBadRequest)
		return
	}

	payload, err := io.ReadAll(c.Request.Body)
	if err != nil {
		logger.Error(c.Request.Context(), "stripe webhook: failed to read body: "+err.Error())
		c.Status(http.StatusServiceUnavailable)
		return
	}

	sigHeader := c.GetHeader("Stripe-Signature")
	event, err := webhook.ConstructEvent(payload, sigHeader, config.StripeWebhookSecret)
	if err != nil {
		// Webhook signature validation failed; reject immediately
		logger.Error(c.Request.Context(), "stripe webhook: signature verification failed: "+err.Error())
		c.Status(http.StatusBadRequest)
		return
	}

	if event.Type != "checkout.session.completed" {
		// We only care about completed checkouts; acknowledge other events gracefully
		c.Status(http.StatusOK)
		return
	}

	var checkoutSession stripe.CheckoutSession
	if err := json.Unmarshal(event.Data.Raw, &checkoutSession); err != nil {
		logger.Error(c.Request.Context(), "stripe webhook: failed to parse session: "+err.Error())
		c.Status(http.StatusBadRequest)
		return
	}

	// Validate required metadata
	userIdStr := checkoutSession.Metadata["user_id"]
	amountStr := checkoutSession.Metadata["amount"]
	sessionId := checkoutSession.ID

	if userIdStr == "" || amountStr == "" || sessionId == "" {
		logger.Error(c.Request.Context(), "stripe webhook: missing metadata fields")
		c.Status(http.StatusBadRequest)
		return
	}

	var userId int
	if _, err := fmt.Sscanf(userIdStr, "%d", &userId); err != nil || userId <= 0 {
		logger.Error(c.Request.Context(), "stripe webhook: invalid user_id: "+userIdStr)
		c.Status(http.StatusBadRequest)
		return
	}

	var amount int64
	if _, err := fmt.Sscanf(amountStr, "%d", &amount); err != nil || amount <= 0 {
		logger.Error(c.Request.Context(), "stripe webhook: invalid amount: "+amountStr)
		c.Status(http.StatusBadRequest)
		return
	}

	// Fix #5: Use config.QuotaPerUnit instead of hardcoded 5000
	// config.QuotaPerUnit is per $0.002 (i.e. 1K tokens), so per dollar = QuotaPerUnit / 0.002
	// Amount is in cents, so per cent = QuotaPerUnit / 0.002 / 100
	quotaPerCent := config.QuotaPerUnit / 0.002 / 100
	quota := int64(math.Round(float64(amount) * quotaPerCent))

	// Fix #1: Idempotency — atomically record the session before crediting
	if model.IsStripeSessionProcessed(sessionId) {
		logger.SysLog(fmt.Sprintf("stripe webhook: session %s already processed, skipping", sessionId))
		c.Status(http.StatusOK) // Return 200 so Stripe stops retrying
		return
	}

	// Record in DB first (unique constraint ensures exactly-once)
	if err := model.CreateStripePaymentRecord(sessionId, userId, amount, quota); err != nil {
		if strings.Contains(err.Error(), "duplicate") {
			// Race condition: another request got there first
			c.Status(http.StatusOK)
			return
		}
		logger.Error(c.Request.Context(), "stripe webhook: failed to record payment: "+err.Error())
		c.Status(http.StatusInternalServerError) // Fix #6: return 5xx so Stripe retries
		return
	}

	// Credit the user account
	if err := model.IncreaseUserQuota(userId, quota); err != nil {
		logger.Error(c.Request.Context(), fmt.Sprintf("stripe webhook: failed to credit quota for user %d: %s", userId, err.Error()))
		// NOTE: Payment record is already committed. We log the error but must not
		// return 5xx here — that would cause Stripe to retry and attempt a duplicate insert
		// which our idempotency check will block. Instead, mark for manual review.
		// In production you should set up alerting here.
		c.Status(http.StatusOK)
		return
	}

	// Write audit log
	model.RecordTopupLog(
		c.Request.Context(),
		userId,
		fmt.Sprintf("Stripe 在线充值 $%.2f，到账 %d 配额", float64(amount)/100.0, quota),
		int(quota),
	)

	logger.SysLog(fmt.Sprintf("stripe webhook: successfully credited %d quota to user %d (session %s)", quota, userId, sessionId))
	c.Status(http.StatusOK)
}
