<p align="right">
    <a href="./README.md">中文</a> | <strong>English</strong>
</p>

<p align="center">
  <a href="https://github.com/techdou/one-api"><img src="https://raw.githubusercontent.com/techdou/one-api/main/web/default/public/logo.png" width="150" height="150" alt="TechDou logo"></a>
</p>

<div align="center">

# TechDou — Global AI API Gateway

_✨ One unified API, access 100+ state-of-the-art AI models globally ✨_

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
  <a href="https://github.com/techdou/one-api#deployment">Deployment</a>
  ·
  <a href="https://github.com/techdou/one-api#quick-start">Quick Start</a>
  ·
  <a href="https://github.com/techdou/one-api#supported-models">Models</a>
  ·
  <a href="https://github.com/techdou/one-api#environment-variables">Env Vars</a>
  ·
  <a href="https://github.com/techdou/one-api/issues">Feedback</a>
</p>

> [!NOTE]
> Stripe + Alipay supported. Pay per use — no monthly fees.

## Features

- 🌐 **100+ Models** — OpenAI / Claude / Gemini / DeepSeek / Mistral / Llama & more
- ⚡ **Plug & Play** — OpenAI SDK compatible. Change Base URL and you're live
- 💳 **Stripe / Alipay** — Visa, Mastercard, Apple Pay, Alipay. Instant top-up
- 🔒 **Enterprise Security** — Granular rate limits, per-token auth, end-to-end HTTPS
- 📊 **Usage Dashboard** — Real-time stats, cost breakdown, model distribution
- 🛠 **High Availability** — Multi-channel redundancy, automatic failover, 99.9% SLA

## Quick Start

```bash
# 1. One command to launch
docker run --name one-api -d -p 3000:3000 \
  -e SQL_DSN="root:password@tcp(db:3306)/one-api" \
  -e STRIPE_SECRET_KEY="sk_live_xxx" \
  -e SESSION_SECRET="your_random_string" \
  techdou/one-api:latest

# 2. Visit http://localhost:3000, login (root / 123456)
# 3. Add your API keys in the Channels page
# 4. Create a Token and start calling
```

## Docker Compose

```bash
git clone https://github.com/techdou/one-api.git
cd one-api
docker-compose up -d
```

## Integration Example

```python
import OpenAI

client = OpenAI(
    apiKey="YOUR_TOKEN",           # Get from dashboard
    baseURL="https://your-domain.com/v1"  # Your deployment URL
)

chat = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello!"}]
)

print(chat.choices[0].message)
```

Works with **Python / Node.js / Go / Java / Ruby / PHP** and any OpenAI SDK-compatible client.

## Supported Models

| Provider | Models |
|----------|--------|
| OpenAI | gpt-4o, gpt-4o-mini, o1, o3 |
| Anthropic | claude-sonnet-4, claude-3.5-sonnet, claude-3.5-haiku |
| Google | gemini-2.0-flash, gemini-1.5-pro, gemini-1.5-flash |
| DeepSeek | deepseek-chat, deepseek-coder |
| Mistral | mistral-large, mistral-small |
| Meta | llama-3.1-70b, llama-3.1-8b |
| Others | Groq, Cohere, xAI, Cloudflare Workers AI & 100+ models |

## Deployment

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SQL_DSN` | MySQL connection | `root:123456@tcp(localhost:3306)/one-api` |
| `SESSION_SECRET` | Session secret | Random string |
| `STRIPE_SECRET_KEY` | Stripe Secret Key | `sk_live_xxx` |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook Secret | `whsec_xxx` |
| `ALIPAY_APP_ID` | Alipay AppId | `2021xxx` |
| `ALIPAY_PRIVATE_KEY` | Alipay Private Key | — |
| `ALIPAY_PUBLIC_KEY` | Alipay Public Key | — |
| `PAY_RATE_RMB` | USD/CNY exchange rate | `7.2` |
| `THEME` | Theme (default: `default`) | `default` |

> [!WARNING]
> After first login, change the default password `123456` immediately!

### Nginx Config

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

## FAQ

**Q: How fast is top-up?**
A: Stripe and Alipay are instant. Redeem codes apply immediately.

**Q: Do credits expire?**
A: Never. Credits are valid forever.

**Q: What's the refund policy?**
A: Contact support for issues. Processing within 7 business days.

## Built on one-api

TechDou is built on [one-api](https://github.com/songquanpeng/one-api) with Stripe/Alipay payments, custom branding, and overseas market optimizations.

MIT Licensed.

---

<p align="center">
  Built by <a href="https://github.com/techdou">TechDou</a> · Based on <a href="https://github.com/songquanpeng/one-api">One API</a>
</p>
