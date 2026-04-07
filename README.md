<p align="right">
   <strong>中文</strong> | <a href="./README.en.md">English</a>
</p>

<p align="center">
  <a href="https://github.com/techdou/one-api"><img src="https://raw.githubusercontent.com/techdou/one-api/main/web/default/public/logo.png" width="150" height="150" alt="TechDou logo"></a>
</p>

<div align="center">

# 瓦兰卡 (Valanka) — 全球 AI API 网关

_✨ 一个接口访问全球 100+ 顶级 AI 模型 · 极致设计的 API 分发系统 ✨_

</div>

<p align="center">
  <a href="https://raw.githubusercontent.com/techdou/one-api/main/LICENSE">
    <img src="https://img.shields.io/github/license/techdou/one-api?color=brightgreen" alt="license">
  </a>
  <a href="https://github.com/techdou/one-api/releases/latest">
    <img src="https://img.shields.io/github/v/release/techdou/one-api?color=brightgreen&include_prereleases" alt="release">
  </a>
  <a href="https://hub.docker.com/repository/docker/techdou/one-api">
    <img src="https://img.shields.io/docker/pulls/techdou/one-api?color=brightgreen" alt="docker pull">
  </a>
  <a href="https://github.com/techdou/one-api/releases/latest">
    <img src="https://img.shields.io/github/downloads/techdou/one-api/total?color=brightgreen&include_prereleases" alt="release">
  </a>
</p>

<p align="center">
  <a href="https://github.com/techdou/one-api#部署">部署</a>
  ·
  <a href="https://github.com/techdou/one-api#使用方法">使用方法</a>
  ·
  <a href="https://github.com/techdou/one-api/issues">意见反馈</a>
  ·
  <a href="https://github.com/techdou/one-api#支持模型">支持模型</a>
  ·
  <a href="https://github.com/techdou/one-api#常见问题">常见问题</a>
</p>

> [!NOTE]
> 支持 Stripe 国际信用卡支付 + 支付宝国内直充，按量计费，无月费。

## 特性

- 🌐 **100+ 模型聚合** — OpenAI / Claude / Gemini / DeepSeek / Mistral / Llama 等，一个 API 全搞定
- ⚡ **极速接入** — OpenAI SDK 兼容，更换 Base URL 即可，零代码改动
- 💎 **Premium UI/UX** — 全新极致毛玻璃视觉风格，平滑过渡动画，深色模式完美支持
- 📱 **全端适配** — 针对 iPad、平板、手机深度优化响应式布局，告别导航遮挡
- 💳 **Stripe / 支付宝** — 国际信用卡、支付宝即时充值，自动到账，无最低消费
- 🛠 **高可用架构** — 多通道冗余、自动 Failover、99.9% SLA
- 📊 **实时数据面板** — 消费明细、模型分布、用户行为全解析

## 快速开始

```bash
# 1. 一行命令启动
docker run --name one-api -d -p 3000:3000 \
  -e SQL_DSN="root:password@tcp(db:3306)/one-api" \
  -e STRIPE_SECRET_KEY="sk_live_xxx" \
  -e SESSION_SECRET="your_random_string" \
  techdou/one-api:latest

# 2. 访问 http://localhost:3000，登录（root / 123456）
# 3. 在渠道页面添加你的 API Key
# 4. 创建 Token，开始调用
```

## Docker Compose 部署

```bash
git clone https://github.com/techdou/one-api.git
cd one-api
docker-compose up -d
```

## 接入示例

```python
import OpenAI

client = OpenAI(
    apiKey="YOUR_TOKEN",           # 从控制台获取
    baseURL="https://your-domain.com/v1"  # 你的部署地址
)

chat = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello!"}]
)

print(chat.choices[0].message)
```

支持 **Python / Node.js / Go / Java / Ruby / PHP** 等所有 OpenAI SDK 兼容语言。

## 支持模型

| 提供商 | 代表模型 |
|--------|---------|
| OpenAI | gpt-4o, gpt-4o-mini, o1, o3 |
| Anthropic | claude-sonnet-4, claude-3.5-sonnet, claude-3.5-haiku |
| Google | gemini-2.0-flash, gemini-1.5-pro, gemini-1.5-flash |
| DeepSeek | deepseek-chat, deepseek-coder |
| Mistral | mistral-large, mistral-small |
| Meta | llama-3.1-70b, llama-3.1-8b |
| 其他 | Groq, Cohere, xAI, Cloudflare Workers AI 等 100+ 模型 |

## 部署

### 环境变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `SQL_DSN` | MySQL 数据库连接 | `root:123456@tcp(localhost:3306)/one-api` |
| `SESSION_SECRET` | 会话密钥 | 随机字符串 |
| `SERVER_ADDRESS` | 服务器公网地址（支付回调必填） | `https://api.valanka.com` |
| `STRIPE_SECRET_KEY` | Stripe API Secret Key | `sk_live_xxx` |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook 签名密钥 | `whsec_xxx` |
| `ALIPAY_APP_ID` | 支付宝 AppId | `2021xxx` |
| `ALIPAY_PRIVATE_KEY` | 支付宝商户私钥 | — |
| `ALIPAY_PUBLIC_KEY` | 支付宝公钥（验证回调） | — |
| `PAY_RATE_RMB` | 美元兑人民币汇率 | `7.2` |
| `THEME` | 主题，默认为 `default` | `default` |

> [!WARNING]
> 首次登录后请立即修改默认密码 `123456`！

### Nginx 配置参考

```nginx
server {
    server_name your-domain.com;

    client_max_body_size 64m;

    location / {
        proxy_http_version 1.1;
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header Accept-Encoding gzip;
        proxy_read_timeout 300s;
    }
}
```

## 常见问题

**Q: 充值多久到账？**
A: Stripe 和支付宝均为即时到账，兑换码立即生效。

**Q: Credits 有有效期吗？**
A: 无有效期，永久有效。

**Q: 支持退款吗？**
A: 如有质量问题请联系客服，7 个工作日内处理。

## 基于 one-api 构建

本项目基于 [one-api](https://github.com/songquanpeng/one-api) 开发，由 **瓦兰卡 (Valanka)** 团队进行视觉重构、功能增强及出海优化。

MIT 协议开源。

---

<p align="center">
  由 <a href="https://github.com/techdou">TechDou</a> 构建 · 基于 <a href="https://github.com/songquanpeng/one-api">One API</a>
</p>
