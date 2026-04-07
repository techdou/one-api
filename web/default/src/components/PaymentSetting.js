import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Divider, Form, Grid, Header, Message } from 'semantic-ui-react';
import { API, showError, showSuccess } from '../helpers';

const PaymentSetting = () => {
  const { t } = useTranslation();
  let [inputs, setInputs] = useState({
    StripeSecretKey: '',
    StripeWebhookSecret: '',
    AlipayAppId: '',
    AlipayPublicKey: '',
    AlipayPrivateKey: '',
    PayRateRMB: '',
  });
  const [originInputs, setOriginInputs] = useState({});
  let [loading, setLoading] = useState(false);

  const getOptions = async () => {
    const res = await API.get('/api/option/');
    const { success, message, data } = res.data;
    if (success) {
      let newInputs = {};
      data.forEach((item) => {
        if (item.key in inputs) {
          newInputs[item.key] = item.value;
        }
      });
      setInputs((prev) => ({ ...prev, ...newInputs }));
      setOriginInputs(newInputs);
    } else {
      showError(message);
    }
  };

  useEffect(() => {
    getOptions().then();
  }, []);

  const updateOption = async (key, value) => {
    setLoading(true);
    const res = await API.put('/api/option/', {
      key,
      value,
    });
    const { success, message } = res.data;
    if (success) {
      setInputs((inputs) => ({
        ...inputs,
        [key]: value,
      }));
    } else {
      showError(message);
    }
    setLoading(false);
    return success;
  };

  const handleInputChange = async (e, { name, value }) => {
    setInputs((inputs) => ({ ...inputs, [name]: value }));
  };

  const submitStripe = async () => {
    setLoading(true);
    let ok = true;

    if (inputs.StripeSecretKey !== originInputs.StripeSecretKey) {
      ok = await updateOption('StripeSecretKey', inputs.StripeSecretKey);
    }
    if (ok && inputs.StripeWebhookSecret !== originInputs.StripeWebhookSecret) {
      ok = await updateOption('StripeWebhookSecret', inputs.StripeWebhookSecret);
    }

    if (ok) {
      showSuccess(t('payment.save_success', 'Settings saved successfully'));
      setOriginInputs({ ...originInputs, StripeSecretKey: inputs.StripeSecretKey, StripeWebhookSecret: inputs.StripeWebhookSecret });
    }
    setLoading(false);
  };

  const submitAlipay = async () => {
    setLoading(true);
    let ok = true;

    if (inputs.AlipayAppId !== originInputs.AlipayAppId) {
      ok = await updateOption('AlipayAppId', inputs.AlipayAppId);
    }
    if (ok && inputs.AlipayPrivateKey !== originInputs.AlipayPrivateKey) {
      ok = await updateOption('AlipayPrivateKey', inputs.AlipayPrivateKey);
    }
    if (ok && inputs.AlipayPublicKey !== originInputs.AlipayPublicKey) {
      ok = await updateOption('AlipayPublicKey', inputs.AlipayPublicKey);
    }
    if (ok && inputs.PayRateRMB !== originInputs.PayRateRMB) {
      ok = await updateOption('PayRateRMB', inputs.PayRateRMB);
    }

    if (ok) {
      showSuccess(t('payment.save_success', 'Settings saved successfully'));
      setOriginInputs({
        ...originInputs,
        AlipayAppId: inputs.AlipayAppId,
        AlipayPrivateKey: inputs.AlipayPrivateKey,
        AlipayPublicKey: inputs.AlipayPublicKey,
        PayRateRMB: inputs.PayRateRMB,
      });
    }
    setLoading(false);
  };

  return (
    <Grid columns={1}>
      <Grid.Column>
        <Form loading={loading}>
          <Header as='h3'>{t('payment.stripe.title', 'Stripe Payments')}</Header>
          <Message>
            {t('payment.stripe.subtitle', 'Manage global card and wallet payments for both production and sandbox environments.')}
            <br />
            {t('payment.stripe.security', 'Saved secrets are never echoed back. Enter a new value to rotate the key.')}
          </Message>

          <Form.Group widths={2}>
            <Form.Input
              label='Stripe Secret Key'
              placeholder='sk_live_... / sk_test_...'
              name='StripeSecretKey'
              onChange={handleInputChange}
              type='password'
              value={inputs.StripeSecretKey}
              autoComplete='new-password'
            />
            <Form.Input
              label='Stripe Webhook Secret'
              placeholder='whsec_...'
              name='StripeWebhookSecret'
              onChange={handleInputChange}
              type='password'
              value={inputs.StripeWebhookSecret}
              autoComplete='new-password'
            />
          </Form.Group>
          <Form.Button onClick={submitStripe}>
            {t('payment.save_stripe', 'Save Stripe Settings')}
          </Form.Button>

          <Divider />
          <Header as='h3'>{t('payment.alipay.title', 'Alipay Payments')}</Header>
          <Message>
            {t('payment.alipay.subtitle', 'Maintain domestic payment credentials and exchange rates for top-up flows.')}
          </Message>

          <Form.Group widths={2}>
            <Form.Input
              label={t('payment.alipay.pay_rate', 'Exchange Rate (USD → CNY)')}
              placeholder='7.2'
              name='PayRateRMB'
              onChange={handleInputChange}
              type='number'
              step='0.01'
              min='0'
              value={inputs.PayRateRMB}
            />
            <Form.Input
              label='Alipay AppId'
              placeholder='2021000123...'
              name='AlipayAppId'
              onChange={handleInputChange}
              value={inputs.AlipayAppId}
            />
          </Form.Group>
          <Form.Group widths={2}>
            <Form.Input
              label={t('payment.alipay.private_key', 'App Private Key')}
              placeholder='MIIEowIBAAKCAQEA...'
              name='AlipayPrivateKey'
              onChange={handleInputChange}
              type='password'
              value={inputs.AlipayPrivateKey}
              autoComplete='new-password'
            />
            <Form.Input
              label={t('payment.alipay.public_key', 'Alipay Public Key')}
              placeholder='MIIBIjANBgkqhkiG9w0...'
              name='AlipayPublicKey'
              onChange={handleInputChange}
              type='password'
              value={inputs.AlipayPublicKey}
              autoComplete='new-password'
            />
          </Form.Group>
          <Form.Button onClick={submitAlipay}>
            {t('payment.save_alipay', 'Save Alipay Settings')}
          </Form.Button>

          <Divider />
          <Header as='h3'>{t('payment.guide.title', 'Webhook Guide')}</Header>
          <Message>
            <ol>
              <li>Create endpoint: <code>{window.location.origin}/api/stripe/webhook</code></li>
              <li>Subscribe to events: <code>checkout.session.completed</code></li>
              <li>Copy the signing secret (<code>whsec_...</code>)</li>
              <li>Save it in the Stripe Webhook Secret field above</li>
            </ol>
          </Message>

        </Form>
      </Grid.Column>
    </Grid>
  );
};

export default PaymentSetting;
