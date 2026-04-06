import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Grid, Header, Button, Image } from 'semantic-ui-react';
import { API, showError, showNotice } from '../../helpers';
import { StatusContext } from '../../context/Status';
import { marked } from 'marked';
import { UserContext } from '../../context/User';
import { Link, useNavigate } from 'react-router-dom';
import heroImage from '../../images/techdou-hero.png';

// ============================================
// HERO SECTION
// ============================================
const HeroSection = ({ isZh, userState, navigate }) => (
  <div className="techdou-hero">
    {/* Badge */}
    <div className="techdou-hero-badge">
      <span className="dot"></span>
      {isZh ? '全球 100+ 模型 · 毫秒级延迟 · 99.9% 可用率' : '100+ Models · Sub-100ms Latency · 99.9% Uptime'}
    </div>

    {/* Heading */}
    <h1>
      {isZh ? '让每个开发者' : 'Ship AI Apps'}<br />
      <span className="highlight">
        {isZh ? '触手可及顶尖模型' : 'Without the Complexity'}
      </span>
    </h1>

    {/* Subtitle */}
    <p>
      {isZh
        ? '统一的 OpenAI 兼容 API，一键接入全球顶级大模型。按需计费，无需月费，Stripe 安全支付即刻上手。'
        : 'One unified API. Access OpenAI, Anthropic, Google, DeepSeek and 100+ models instantly. Pay per use — no monthly fees. Powered by Stripe.'}
    </p>

    {/* CTAs */}
    <div className="techdou-cta-group">
      {!userState.user ? (
        <>
          <Button
            as={Link}
            to="/register"
            size="huge"
            className="techdou-cta-primary"
            style={{ padding: '16px 36px !important', fontSize: '15px !important' }}
          >
            {isZh ? '免费开始使用' : 'Start for Free'} &rarr;
          </Button>
          <Button
            as={Link}
            to="/login"
            size="huge"
            className="techdou-cta-secondary"
            style={{ padding: '15px 32px !important', fontSize: '15px !important' }}
          >
            {isZh ? '已有账户？登录' : 'Sign In'}
          </Button>
        </>
      ) : (
        <>
          <Button
            as={Link}
            to="/channel"
            size="huge"
            className="techdou-cta-primary"
            style={{ padding: '16px 36px !important', fontSize: '15px !important' }}
          >
            {isZh ? '进入控制台' : 'Open Dashboard'} &rarr;
          </Button>
          <Button
            as={Link}
            to="/topup"
            size="huge"
            className="techdou-cta-secondary"
            style={{ padding: '15px 32px !important', fontSize: '15px !important' }}
          >
            {isZh ? '购买 Credits' : 'Buy Credits'}
          </Button>
        </>
      )}
    </div>

    {/* Hero Illustration */}
    <div className="techdou-hero-image animate-fade-in-4">
      <Image src={heroImage} alt="TechDou API Gateway — Global AI Infrastructure" style={{ display: 'block', width: '100%' }} />
    </div>
  </div>
);

// ============================================
// FEATURES GRID
// ============================================
const FeaturesSection = ({ isZh }) => {
  const features = [
    {
      icon: 'bolt',
      title: isZh ? '极速接入' : 'Plug & Play',
      desc: isZh
        ? '兼容 OpenAI SDK，零代码改动迁移。更换 Base URL 即可，全球边缘节点自动路由。'
        : "OpenAI-compatible from day one. Change your Base URL and you're live. Global edge routing included.",
      accent: 'brand',
    },
    {
      icon: 'globe',
      title: isZh ? '100+ 模型聚合' : '100+ Models, One API',
      desc: isZh
        ? 'OpenAI、Claude、Gemini、DeepSeek、Mistral、Llama……统一接口，自动选择最优通道。'
        : 'OpenAI, Claude, Gemini, DeepSeek, Mistral, Llama & more. Unified interface, auto-routed to the best channel.',
      accent: 'accent',
    },
    {
      icon: 'shield alternate',
      title: isZh ? '企业级安全' : 'Enterprise Security',
      desc: isZh
        ? '精确的限流策略、独立 Token 鉴权、PCI-DSS 兼容支付，全链路 HTTPS 加密传输。'
        : 'Granular rate limits, per-token auth, PCI-compliant payments, and end-to-end HTTPS encryption.',
      accent: 'brand',
    },
    {
      icon: 'payment',
      title: isZh ? '按量付费' : 'Pay Per Use',
      desc: isZh
        ? '无月费、无最低消费。Stripe 安全支付，支持 Visa/Mastercard/Apple Pay，立即充值即时到账。'
        : 'No monthly fees, no minimums. Stripe-secured payments — Visa, Mastercard, Apple Pay. Top up instantly.',
      accent: 'accent',
    },
    {
      icon: 'server',
      title: isZh ? '高可用架构' : 'High Availability',
      desc: isZh
        ? '多通道冗余自动 failover，99.9% SLA 保障，专业团队 24/7 监控运维。'
        : 'Multi-channel redundancy with automatic failover. 99.9% SLA, 24/7 ops team monitoring.',
      accent: 'brand',
    },
    {
      icon: 'code',
      title: isZh ? '开发者友好' : 'Developer First',
      desc: isZh
        ? '完整 API 文档、WebSocket 流式输出、usage 明细报表，开发者想要的都在这里。'
        : 'Full API docs, WebSocket streaming, detailed usage reports. Everything devs actually need.',
      accent: 'accent',
    },
  ];

  return (
    <div className="techdou-section">
      <div className="ui container">
        <Header as="h2" className="techdou-section-title">
          {isZh ? '为什么选择 TechDou' : 'Why TechDou'}
        </Header>
        <p className="techdou-section-subtitle">
          {isZh ? '专为出海团队打造的 AI API 网关' : 'Built for teams shipping AI products globally'}
        </p>
        <Grid columns={3} doubling stackable style={{ margin: '0 auto' }}>
          {features.map((f, i) => (
            <Grid.Column key={f.title} className={`animate-fade-in-${Math.min(i + 1, 4)}`}>
              <Card
                fluid
                style={{
                  height: '100%',
                  padding: '28px 24px',
                  borderRadius: 'var(--radius-xl)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'var(--transition-base)',
                }}
              >
                <div
                  className="techdou-feature-icon"
                  style={f.accent === 'accent' ? {
                    background: 'var(--accent-bg)',
                    borderColor: 'rgba(245, 158, 11, 0.2)',
                    color: 'var(--accent-dark) !important',
                  } : {}}
                >
                  <i className={`${f.icon} icon`}></i>
                </div>
                <Header as="h3" style={{ marginTop: '4px', marginBottom: '10px', fontSize: '1.1rem' }}>
                  {f.title}
                </Header>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.65', margin: 0 }}>
                  {f.desc}
                </p>
              </Card>
            </Grid.Column>
          ))}
        </Grid>
      </div>
    </div>
  );
};

// ============================================
// QUICK START CODE SNIPPET
// ============================================
const QuickStartSection = ({ isZh }) => {
  const codeSnippet = `import OpenAI from "openai";

const client = new OpenAI({
  apiKey:   "${'{'}YOUR_API_KEY${'}'}",        // ← 从控制台获取
  baseURL:  "https://api.techdou.ai/v1",         // ← 我们的网关地址
});

const chat = await client.chat.completions.create({
  model: "gpt-4o",                              // ← 任意支持模型
  messages: [{ role: "user", content: "Hello!" }],
});

console.log(chat.choices[0].message);`;

  return (
    <div className="techdou-section">
      <div className="ui container">
        <Grid columns={2} stackable doubling>
          <Grid.Column style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="badge badge-brand" style={{ marginBottom: '16px', width: 'fit-content' }}>
              <i className="bolt icon" style={{ margin: 0 }}></i>
              {isZh ? '3 步接入' : '3-Step Integration'}
            </div>
            <Header as="h2" style={{ marginBottom: '16px', fontSize: '2rem !important' }}>
              {isZh ? '5 分钟即可上线' : 'Live in 5 Minutes'}
            </Header>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
              {[
                { step: '01', title: isZh ? '注册并获取 API Key' : 'Sign up & grab your API Key', desc: isZh ? '控制台 → Token → 创建密钥，1 秒完成' : 'Console → Tokens → Create key, done in seconds' },
                { step: '02', title: isZh ? '更换 Base URL' : 'Swap your Base URL', desc: isZh ? '替换 your-api.openai.com → api.techdou.ai/v1' : 'Replace your-api.openai.com → api.techdou.ai/v1' },
                { step: '03', title: isZh ? '充值并开始调用' : 'Top up & start calling', desc: isZh ? 'Stripe 即时充值，按量计费，无月费' : 'Stripe top-up, pay per token, no monthly fee' },
              ].map(item => (
                <div key={item.step} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <span
                    className="mono"
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--brand-primary)',
                      background: 'var(--brand-bg)',
                      border: '1px solid rgba(13, 148, 136, 0.2)',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    {item.step}
                  </span>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px', marginBottom: '2px' }}>{item.title}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </Grid.Column>

          <Grid.Column>
            <div
              style={{
                background: '#1E293B',
                borderRadius: 'var(--radius-xl)',
                padding: '24px 28px',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {/* Window Chrome */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
                {['#FF5F57', '#FFBD2E', '#28C840'].map((c, i) => (
                  <div key={i} style={{ width: '12px', height: '12px', borderRadius: '50%', background: c }} />
                ))}
                <span style={{ marginLeft: '10px', fontSize: '12px', color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
                  {isZh ? 'Python 示例' : 'Python Example'}
                </span>
              </div>
              <pre
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '13px',
                  color: '#E2E8F0',
                  lineHeight: '1.8',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  margin: 0,
                }}
              >
                <code>{codeSnippet}</code>
              </pre>
            </div>

            {/* SDK badges */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
              {['Python', 'Node.js', 'Go', 'Java', 'Ruby', 'PHP'].map(sdk => (
                <span
                  key={sdk}
                  className="badge"
                  style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-muted)',
                    fontSize: '11px',
                  }}
                >
                  {sdk}
                </span>
              ))}
            </div>
          </Grid.Column>
        </Grid>
      </div>
    </div>
  );
};

// ============================================
// STATS SECTION
// ============================================
const StatsSection = ({ isZh }) => {
  const stats = [
    { value: '100+',   label: isZh ? '支持模型' : 'Models',         icon: 'cube' },
    { value: '99.9%',  label: isZh ? '服务可用性' : 'Uptime SLA',     icon: 'shield' },
    { value: '<80ms',  label: isZh ? '平均延迟' : 'Avg Latency',      icon: 'bolt' },
    { value: '50+',    label: isZh ? '覆盖国家' : 'Countries',        icon: 'globe' },
  ];

  return (
    <div className="ui container">
      <div className="techdou-stats-bar animate-fade-in">
        {stats.map(s => (
          <div key={s.label} className="techdou-stat-item">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '6px' }}>
              <i className={`${s.icon} icon`} style={{ fontSize: '18px', color: 'var(--brand-light)' }} />
              <span className="techdou-stat-value">{s.value}</span>
            </div>
            <div className="techdou-stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// CTA BANNER
// ============================================
const CTABanner = ({ isZh, userState, navigate }) => (
  <div className="ui container" style={{ padding: '72px 0' }}>
    <div
      style={{
        background: 'var(--gradient-brand)',
        borderRadius: 'var(--radius-xl)',
        padding: '60px 48px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-brand)',
      }}
    >
      {/* Decorative circles */}
      <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
      <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', marginBottom: '20px', fontSize: '12px' }}>
          <i className="rocket icon" style={{ margin: 0 }}></i>
          {isZh ? '免费注册，立即开始' : 'Free to start. No credit card required.'}
        </div>
        <Header as="h2" style={{ color: '#fff !important', fontSize: '2.4rem !important', marginBottom: '14px !important', letterSpacing: '-1px' }}>
          {isZh ? '准备好接入了吗？' : 'Ready to ship faster?'}
        </Header>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem', maxWidth: '480px', margin: '0 auto 32px', fontWeight: 400 }}>
          {isZh ? '5 分钟完成接入，比自己运维 API 省钱省心' : 'Get started in 5 minutes. Save money vs. managing APIs yourself.'}
        </p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {!userState.user ? (
            <>
              <Button
                as={Link}
                to="/register"
                size="huge"
                style={{
                  background: '#fff',
                  color: 'var(--brand-dark)',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '15px',
                  padding: '14px 36px !important',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                }}
              >
                {isZh ? '免费注册' : 'Get Started Free'} &rarr;
              </Button>
              <Button
                as={Link}
                to="/about"
                size="huge"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  color: '#fff',
                  border: '1.5px solid rgba(255,255,255,0.3)',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: '15px',
                  padding: '13px 32px !important',
                }}
              >
                {isZh ? '了解更多' : 'Learn More'}
              </Button>
            </>
          ) : (
            <>
              <Button
                as={Link}
                to="/topup"
                size="huge"
                style={{
                  background: '#fff',
                  color: 'var(--brand-dark)',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '15px',
                  padding: '14px 36px !important',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                }}
              >
                {isZh ? '购买 Credits' : 'Buy Credits'} &rarr;
              </Button>
              <Button
                as={Link}
                to="/channel"
                size="huge"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  color: '#fff',
                  border: '1.5px solid rgba(255,255,255,0.3)',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: '15px',
                  padding: '13px 32px !important',
                }}
              >
                {isZh ? '管理渠道' : 'Manage Channels'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  </div>
);

// ============================================
// MAIN HOME PAGE
// ============================================
const Home = () => {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  const [statusState] = useContext(StatusContext);
  const [homePageContentLoaded, setHomePageContentLoaded] = useState(false);
  const [homePageContent, setHomePageContent] = useState('');
  const [userState] = useContext(UserContext);
  const navigate = useNavigate();

  const displayNotice = async () => {
    const res = await API.get('/api/notice');
    if (!res || !res.data) return;
    const { success, message, data } = res.data;
    if (success) {
      const oldNotice = localStorage.getItem('notice');
      if (data !== oldNotice && data !== '') {
        const htmlNotice = marked(data);
        showNotice(htmlNotice, true);
        localStorage.setItem('notice', data);
      }
    } else {
      showError(message);
    }
  };

  const displayHomePageContent = async () => {
    setHomePageContent(localStorage.getItem('home_page_content') || '');
    const res = await API.get('/api/home_page_content');
    if (!res || !res.data) {
      setHomePageContentLoaded(true);
      return;
    }
    const { success, message, data } = res.data;
    if (success) {
      let content = data;
      if (!data.startsWith('https://')) {
        content = marked.parse(data);
      }
      setHomePageContent(content);
      localStorage.setItem('home_page_content', content);
    } else {
      showError(message);
    }
    setHomePageContentLoaded(true);
  };

  useEffect(() => {
    displayNotice().then();
    displayHomePageContent().then();
  }, []);

  // =====================
  // Custom markdown home page content (admin-configured)
  // =====================
  if (homePageContentLoaded && homePageContent !== '') {
    return (
      <>
        {homePageContent.startsWith('https://') ? (
          <iframe src={homePageContent} style={{ width: '100%', height: '100vh', border: 'none' }} title="Home Page Content" />
        ) : (
          <div style={{ fontSize: 'larger', color: 'var(--text-primary)', padding: '20px', maxWidth: '1200px', margin: '0 auto' }}
            dangerouslySetInnerHTML={{ __html: homePageContent }} />
        )}
      </>
    );
  }

  return (
    <div>
      <HeroSection isZh={isZh} userState={userState} navigate={navigate} />
      <StatsSection isZh={isZh} />
      <FeaturesSection isZh={isZh} />
      <QuickStartSection isZh={isZh} />
      <CTABanner isZh={isZh} userState={userState} navigate={navigate} />
    </div>
  );
};

export default Home;
