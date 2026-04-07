import React, { useEffect, useState } from 'react';
import {
  Button,
  Form,
  Grid,
  Header,
  Card,
  Tab,
  Input,
} from 'semantic-ui-react';
import { API, showError, showInfo, showSuccess } from '../../helpers';
import { useTranslation } from 'react-i18next';

// ============================================
// PRICING TIERS
// ============================================
const PRICING_PACKAGES = [
  { amount: 5,   bonus: 0,   label: 'Starter',    popular: false },
  { amount: 20,  bonus: 2,   label: 'Growth',     popular: false },
  { amount: 50,  bonus: 10,  label: 'Pro',        popular: true  },
  { amount: 100, bonus: 25,  label: 'Business',   popular: false },
  { amount: 200, bonus: 60,  label: 'Scale',      popular: false },
  { amount: 500, bonus: 175, label: 'Enterprise', popular: false },
];

// ============================================
// CREDIT DISPLAY CARD
// ============================================
const CreditDisplay = ({ quota, isZh }) => (
  <div
    style={{
      background: 'var(--gradient-brand)',
      borderRadius: 'var(--radius-xl)',
      padding: '32px 40px',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
      marginBottom: '32px',
      boxShadow: 'var(--shadow-brand)',
    }}
  >
    {/* Decorative */}
    <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
    <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

    <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
      <div>
        <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.75, marginBottom: '6px', fontFamily: 'Inter, sans-serif' }}>
          {isZh ? '我的余额' : 'My Credit Balance'}
        </div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '2.8rem', fontWeight: 800, letterSpacing: '-1px', lineHeight: 1 }}>
          {quota}
        </div>
        <div style={{ fontSize: '13px', opacity: 0.75, marginTop: '6px' }}>
          {isZh ? 'Credits 可用于所有模型调用' : 'Credits for all model calls'}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {[
          { icon: 'credit card', label: isZh ? 'Stripe 信用卡' : 'Stripe Card', color: '#635BFF' },
          { icon: 'payment',     label: isZh ? '支付宝' : 'Alipay',           color: '#1678C2' },
          { icon: 'ticket',     label: isZh ? '兑换码' : 'Redeem Code',      color: '#10B981' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.12)', borderRadius: 'var(--radius-full)', padding: '8px 16px', fontSize: '13px', fontWeight: 600 }}>
            <i className={`${item.icon} icon`} style={{ margin: 0, color: item.color }} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ============================================
// PRICING PACKAGES GRID
// ============================================
const PricingGrid = ({ isZh, onSelectPackage, selected }) => (
  <div>
    <Header as="h3" style={{ marginBottom: '20px !important', fontSize: '1.3rem !important' }}>
      {isZh ? '充值套餐' : 'Top-Up Packages'}
      <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '12px' }}>
        {isZh ? '充值越多，赠送越多' : 'More credit, more bonus'}
      </span>
    </Header>
    <Grid columns={3} doubling stackable stretched style={{ margin: '0 auto' }}>
      {PRICING_PACKAGES.map(pkg => (
        <Grid.Column key={pkg.amount} style={{ display: 'flex' }}>
          <div
            onClick={() => onSelectPackage(pkg.amount)}
            className="techdou-pricing-card"
            style={{
              padding: '32px 24px',
              cursor: 'pointer',
              border: selected === pkg.amount
                ? '2px solid var(--brand-primary) !important'
                : '1.5px solid var(--border-subtle) !important',
              background: selected === pkg.amount ? 'var(--brand-bg)' : 'var(--bg-surface)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              position: 'relative',
              justifyContent: 'center',
            }}
          >
            {pkg.popular && (
              <span 
                className="techdou-pricing-badge" 
                style={{ 
                  position: 'absolute', 
                  top: '12px', 
                  left: '50%', 
                  transform: 'translateX(-50%)',
                  margin: 0,
                  zIndex: 2
                }}
              >
                {isZh ? '推荐' : 'POPULAR'}
              </span>
            )}
            <div style={{ marginTop: pkg.popular ? '12px' : '0' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                {pkg.label}
              </div>
              <div className="techdou-price" style={{ fontSize: '2.2rem !important', color: 'var(--text-primary) !important' }}>
                <span className="currency">$</span>{pkg.amount}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px', fontFamily: 'JetBrains Mono, monospace' }}>
                = {pkg.amount + pkg.bonus} Credits
              </div>
            </div>

            <div style={{ minHeight: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: '12px' }}>
              {pkg.bonus > 0 ? (
                <div className="badge badge-success" style={{ fontSize: '11px' }}>
                  +{pkg.bonus} {isZh ? '赠送' : 'Bonus'}
                </div>
              ) : (
                <div style={{ height: '22px' }} /> /* Blank space for alignment */
              )}
              
              {selected === pkg.amount && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--brand-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: '14px' }}>
                    <i className="check icon" style={{ margin: 0, fontSize: '12px' }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </Grid.Column>
      ))}
    </Grid>
  </div>
);

// ============================================
// STRIPE PANEL
// ============================================
const StripePanel = ({ amount, onAmountChange, onPay, loading, isZh }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
    <div>
      <Header as="h4" style={{ marginBottom: '16px !important', fontSize: '1rem !important', color: 'var(--text-secondary) !important' }}>
        <i className="credit card icon" style={{ color: '#635BFF' }} />
        {isZh ? 'Stripe 国际支付' : 'Stripe International'}
        <span className="badge" style={{ marginLeft: '10px', background: 'rgba(99,91,255,0.08)', color: '#635BFF', border: '1px solid rgba(99,91,255,0.2)', fontSize: '10px' }}>
          Visa · Mastercard · Apple Pay
        </span>
      </Header>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {[5, 10, 20, 50, 100].map(amt => (
          <span
            key={amt}
            onClick={() => onAmountChange(amt)}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-md)',
              border: amount === amt ? '2px solid var(--brand-primary)' : '1.5px solid var(--border-default)',
              background: amount === amt ? 'var(--brand-bg)' : 'var(--bg-surface)',
              color: amount === amt ? 'var(--brand-primary)' : 'var(--text-secondary)',
              fontWeight: amount === amt ? 700 : 600,
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
            }}
          >
            ${amt}
          </span>
        ))}
      </div>
      <Form.Input
        label={isZh ? '自定义金额 ($)' : 'Custom Amount ($)'}
        type="number"
        min={1}
        step={1}
        value={amount}
        onChange={e => onAmountChange(Number(e.target.value))}
        placeholder={isZh ? '输入充值金额...' : 'Enter amount...'}
        style={{ marginBottom: '16px' }}
      />
      <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '14px 16px', marginBottom: '16px', fontSize: '13px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
        <span>{isZh ? '充值金额' : 'Credit Amount'}</span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: 'var(--text-primary)' }}>
          ${amount} → {amount} Credits
        </span>
      </div>
    </div>
    <Button
      onClick={onPay}
      loading={loading}
      disabled={loading || amount < 1}
      style={{
        background: '#635BFF',
        color: '#fff',
        borderRadius: 'var(--radius-md)',
        fontWeight: 700,
        fontSize: '15px',
        padding: '14px !important',
        boxShadow: '0 4px 14px rgba(99,91,255,0.3)',
        letterSpacing: '0.3px',
      }}
    >
      <i className="stripe icon" style={{ margin: '0 8px 0 0' }} />
      {isZh ? '使用 Stripe 支付' : 'Pay with Stripe'} — ${amount}
    </Button>
  </div>
);

// ============================================
// ALIPAY PANEL
// ============================================
const AlipayPanel = ({ amount, onAmountChange, onPay, loading, isZh }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
    <div>
      <Header as="h4" style={{ marginBottom: '16px !important', fontSize: '1rem !important', color: 'var(--text-secondary) !important' }}>
        <i className="payment icon" style={{ color: '#1678C2' }} />
        {isZh ? '支付宝' : 'Alipay'}
        <span className="badge" style={{ marginLeft: '10px', background: 'rgba(22,120,194,0.08)', color: '#1678C2', border: '1px solid rgba(22,120,194,0.2)', fontSize: '10px' }}>
          {isZh ? '支持国内直充' : 'CN Direct'}
        </span>
      </Header>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {[10, 50, 100, 200, 500].map(amt => (
          <span
            key={amt}
            onClick={() => onAmountChange(amt)}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-md)',
              border: amount === amt ? '2px solid var(--brand-primary)' : '1.5px solid var(--border-default)',
              background: amount === amt ? 'var(--brand-bg)' : 'var(--bg-surface)',
              color: amount === amt ? 'var(--brand-primary)' : 'var(--text-secondary)',
              fontWeight: amount === amt ? 700 : 600,
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
            }}
          >
            ¥{amt}
          </span>
        ))}
      </div>
      <Form.Input
        label={isZh ? '自定义金额 (¥)' : 'Custom Amount (¥)'}
        type="number"
        min={1}
        step={1}
        value={amount}
        onChange={e => onAmountChange(Number(e.target.value))}
        placeholder={isZh ? '输入充值金额...' : 'Enter amount...'}
        style={{ marginBottom: '16px' }}
      />
      <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '14px 16px', marginBottom: '16px', fontSize: '13px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
        <span>{isZh ? '充值金额' : 'Credit Amount'}</span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: 'var(--text-primary)' }}>
          ¥{amount} → {amount} Credits
        </span>
      </div>
    </div>
    <Button
      onClick={onPay}
      loading={loading}
      disabled={loading || amount < 1}
      style={{
        background: '#1678C2',
        color: '#fff',
        borderRadius: 'var(--radius-md)',
        fontWeight: 700,
        fontSize: '15px',
        padding: '14px !important',
        boxShadow: '0 4px 14px rgba(22,120,194,0.25)',
        letterSpacing: '0.3px',
      }}
    >
      <i className="payment icon" style={{ margin: '0 8px 0 0' }} />
      {isZh ? '使用支付宝支付' : 'Pay with Alipay'} — ¥{amount}
    </Button>
  </div>
);

// ============================================
// REDEEM CODE PANEL
// ============================================
const RedeemPanel = ({ isZh }) => {
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const redeem = async () => {
    if (!code.trim()) { showInfo(isZh ? '请输入兑换码' : 'Please enter a code'); return; }
    setSubmitting(true);
    try {
      const res = await API.post('/api/user/topup', { key: code.trim() });
      const { success, message, data } = res.data;
      if (success) {
        showSuccess(isZh ? `兑换成功，获得 ${data} Credits` : `Success! +${data} Credits`);
        setCode('');
        window.location.reload();
      } else {
        showError(message);
      }
    } catch { showError(isZh ? '兑换失败' : 'Redeem failed'); }
    finally { setSubmitting(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Header as="h4" style={{ marginBottom: '0 !important', fontSize: '1rem !important', color: 'var(--text-secondary) !important' }}>
        <i className="ticket alternate icon" style={{ color: 'var(--success)' }} />
        {isZh ? '兑换码充值' : 'Redeem Code'}
        <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '8px' }}>
          {isZh ? '有兑换码？这里兑换' : 'Have a code? Redeem here'}
        </span>
      </Header>
      <div style={{ display: 'flex', gap: '10px' }}>
        <Input
          icon="key"
          iconPosition="left"
          placeholder={isZh ? '粘贴或输入兑换码...' : 'Paste or type your code...'}
          value={code}
          onChange={e => setCode(e.target.value)}
          onPaste={e => { e.preventDefault(); setCode(e.clipboardData.getData('text').trim()); }}
          style={{ flex: 1 }}
        />
        <Button
          onClick={redeem}
          loading={submitting}
          style={{
            background: 'var(--gradient-brand)',
            color: '#fff',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            padding: '0 24px !important',
            boxShadow: 'var(--shadow-brand)',
          }}
        >
          {isZh ? '兑换' : 'Redeem'}
        </Button>
      </div>
    </div>
  );
};

// ============================================
// MAIN TOPUP PAGE
// ============================================
const TopUp = () => {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  const [quota, setQuota] = useState(0);
  const [stripeAmount, setStripeAmount] = useState(50);
  const [alipayAmount, setAlipayAmount] = useState(100);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [alipayLoading, setAlipayLoading] = useState(false);
  const getUserQuota = async () => {
    try {
      const res = await API.get('/api/user/self');
      const { success, data } = res.data;
      if (success) { setQuota(data.quota); }
    } catch {}
  };

  const topUpStripe = async () => {
    if (stripeAmount < 1) { showInfo(isZh ? '最低充值 $1' : 'Minimum $1'); return; }
    setStripeLoading(true);
    try {
      const res = await API.post('/api/user/pay/stripe/create', { amount: Math.round(stripeAmount * 100) });
      const { success, message, data } = res.data;
      if (success) window.location.href = data;
      else showError(message);
    } catch { showError(isZh ? 'Stripe 支付请求失败' : 'Stripe request failed'); }
    finally { setStripeLoading(false); }
  };

  const topUpAlipay = async () => {
    if (alipayAmount < 1) { showInfo(isZh ? '最低充值 ¥1' : 'Minimum ¥1'); return; }
    setAlipayLoading(true);
    try {
      const res = await API.post('/api/user/pay/alipay/create', { amount: parseFloat(alipayAmount) });
      const { success, message, data } = res.data;
      if (success) window.location.href = data;
      else showError(message);
    } catch { showError(isZh ? '支付宝支付请求失败' : 'Alipay request failed'); }
    finally { setAlipayLoading(false); }
  };

  useEffect(() => {
    getUserQuota();
  }, []);

  const tabPanes = [
    {
      menuItem: {
        key: 'stripe',
        icon: 'credit card',
        content: isZh ? 'Stripe 信用卡' : 'Stripe Card',
      },
      render: () => (
        <Tab.Pane attached={false} style={{ border: 'none', padding: '0' }}>
          <StripePanel
            amount={stripeAmount}
            onAmountChange={setStripeAmount}
            onPay={topUpStripe}
            loading={stripeLoading}
            isZh={isZh}
          />
        </Tab.Pane>
      ),
    },
    {
      menuItem: {
        key: 'alipay',
        icon: 'payment',
        content: isZh ? '支付宝' : 'Alipay',
      },
      render: () => (
        <Tab.Pane attached={false} style={{ border: 'none', padding: '0' }}>
          <AlipayPanel
            amount={alipayAmount}
            onAmountChange={setAlipayAmount}
            onPay={topUpAlipay}
            loading={alipayLoading}
            isZh={isZh}
          />
        </Tab.Pane>
      ),
    },
  ];

  return (
    <div className="ui container" style={{ padding: '40px 0', maxWidth: '900px !important' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <Header as="h1" style={{ fontSize: '2rem !important', marginBottom: '6px !important' }}>
          {isZh ? '充值中心' : 'Top Up'}
        </Header>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>
          {isZh ? '选择支付方式，快速充值 Credits，立即开始使用' : 'Choose a payment method, top up Credits, and start using instantly'}
        </p>
      </div>

      {/* Credit Balance Banner */}
      <CreditDisplay quota={quota} isZh={isZh} />

      {/* Quick Pricing Grid */}
      <Card fluid style={{ padding: '28px', borderRadius: 'var(--radius-xl)', marginBottom: '32px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
        <PricingGrid isZh={isZh} onSelectPackage={setStripeAmount} selected={stripeAmount} />
      </Card>

      {/* Payment Methods */}
      <Grid columns={2} stackable doubling style={{ marginBottom: '32px' }}>
        <Grid.Column>
          <Card fluid style={{ height: '100%', padding: '24px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
            <Tab menu={{ secondary: true, pointing: true, style: { marginBottom: '24px' } }} panes={tabPanes} />
          </Card>
        </Grid.Column>
        <Grid.Column>
          <Card fluid style={{ height: '100%', padding: '24px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <RedeemPanel isZh={isZh} />
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
              <Header as="h4" style={{ marginBottom: '16px !important', fontSize: '1rem !important', color: 'var(--text-secondary) !important' }}>
                <i className="info circle icon" style={{ color: 'var(--info)' }} />
                {isZh ? '常见问题' : 'FAQ'}
              </Header>
              {[
                { q: isZh ? '充值多久到账？' : 'How fast is top-up?', a: isZh ? 'Stripe/Alipay 即时到账，兑换码立即生效' : 'Stripe & Alipay are instant. Codes are applied immediately.' },
                { q: isZh ? '支持退款吗？' : 'Refund policy?', a: isZh ? '如有质量问题请联系客服，7 个工作日内处理' : 'Contact support for issues.处理 within 7 business days.' },
                { q: isZh ? 'Credits 有有效期吗？' : 'Credit expiry?', a: isZh ? 'Credits 永久有效，无时间限制' : 'Credits never expire. Use them whenever.' },
              ].map((item, i) => (
                <details key={i} style={{ marginBottom: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                  <summary style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                    {item.q}
                  </summary>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px', marginBottom: 0 }}>{item.a}</p>
                </details>
              ))}
            </div>
          </Card>
        </Grid.Column>
      </Grid>
    </div>
  );
};

export default TopUp;
