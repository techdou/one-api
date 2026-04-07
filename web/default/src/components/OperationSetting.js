import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Divider, Form, Grid, Header } from 'semantic-ui-react';
import {
  API,
  showError,
  showSuccess,
  timestamp2string,
  verifyJSON,
} from '../helpers';

const OperationSetting = () => {
  const { t } = useTranslation();
  let now = new Date();
  let [inputs, setInputs] = useState({
    QuotaForNewUser: 0,
    QuotaForInviter: 0,
    QuotaForInvitee: 0,
    QuotaRemindThreshold: 0,
    PreConsumedQuota: 0,
    ModelRatio: '',
    CompletionRatio: '',
    GroupRatio: '',
    TopUpLink: '',
    ChatLink: '',
    QuotaPerUnit: 0,
    AutomaticDisableChannelEnabled: '',
    AutomaticEnableChannelEnabled: '',
    ChannelDisableThreshold: 0,
    LogConsumeEnabled: '',
    DisplayInCurrencyEnabled: '',
    DisplayTokenStatEnabled: '',
    ApproximateTokenEnabled: '',
    RetryTimes: 0,
    StripeSecretKey: '',
    StripeWebhookSecret: '',
    AlipayAppId: '',
    AlipayPublicKey: '',
    AlipayPrivateKey: '',
    PayRateRMB: '',
  });
  const [originInputs, setOriginInputs] = useState({});
  let [loading, setLoading] = useState(false);
  let [historyTimestamp, setHistoryTimestamp] = useState(
    timestamp2string(now.getTime() / 1000 - 30 * 24 * 3600)
  ); // a month ago

  const getOptions = async () => {
    const res = await API.get('/api/option/');
    const { success, message, data } = res.data;
    if (success) {
      let newInputs = {};
      data.forEach((item) => {
        if (
          item.key === 'ModelRatio' ||
          item.key === 'GroupRatio' ||
          item.key === 'CompletionRatio'
        ) {
          item.value = JSON.stringify(JSON.parse(item.value), null, 2);
        }
        if (item.value === '{}') {
          item.value = '';
        }
        newInputs[item.key] = item.value;
      });
      setInputs(newInputs);
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
    if (key.endsWith('Enabled')) {
      value = inputs[key] === 'true' ? 'false' : 'true';
    }
    const res = await API.put('/api/option/', {
      key,
      value,
    });
    const { success, message } = res.data;
    if (success) {
      setInputs((inputs) => ({ ...inputs, [key]: value }));
    } else {
      showError(message);
    }
    setLoading(false);
  };

  const handleInputChange = async (e, { name, value }) => {
    if (name.endsWith('Enabled')) {
      await updateOption(name, value);
    } else {
      setInputs((inputs) => ({ ...inputs, [name]: value }));
    }
  };

  const submitConfig = async (group) => {
    switch (group) {
      case 'monitor':
        if (
          originInputs['ChannelDisableThreshold'] !==
          inputs.ChannelDisableThreshold
        ) {
          await updateOption(
            'ChannelDisableThreshold',
            inputs.ChannelDisableThreshold
          );
        }
        if (
          originInputs['QuotaRemindThreshold'] !== inputs.QuotaRemindThreshold
        ) {
          await updateOption(
            'QuotaRemindThreshold',
            inputs.QuotaRemindThreshold
          );
        }
        break;
      case 'ratio':
        if (originInputs['ModelRatio'] !== inputs.ModelRatio) {
          if (!verifyJSON(inputs.ModelRatio)) {
            showError('模型倍率不是合法的 JSON 字符串');
            return;
          }
          await updateOption('ModelRatio', inputs.ModelRatio);
        }
        if (originInputs['GroupRatio'] !== inputs.GroupRatio) {
          if (!verifyJSON(inputs.GroupRatio)) {
            showError('分组倍率不是合法的 JSON 字符串');
            return;
          }
          await updateOption('GroupRatio', inputs.GroupRatio);
        }
        if (originInputs['CompletionRatio'] !== inputs.CompletionRatio) {
          if (!verifyJSON(inputs.CompletionRatio)) {
            showError('补全倍率不是合法的 JSON 字符串');
            return;
          }
          await updateOption('CompletionRatio', inputs.CompletionRatio);
        }
        break;
      case 'quota':
        if (originInputs['QuotaForNewUser'] !== inputs.QuotaForNewUser) {
          await updateOption('QuotaForNewUser', inputs.QuotaForNewUser);
        }
        if (originInputs['QuotaForInvitee'] !== inputs.QuotaForInvitee) {
          await updateOption('QuotaForInvitee', inputs.QuotaForInvitee);
        }
        if (originInputs['QuotaForInviter'] !== inputs.QuotaForInviter) {
          await updateOption('QuotaForInviter', inputs.QuotaForInviter);
        }
        if (originInputs['PreConsumedQuota'] !== inputs.PreConsumedQuota) {
          await updateOption('PreConsumedQuota', inputs.PreConsumedQuota);
        }
        break;
      case 'general':
        if (originInputs['TopUpLink'] !== inputs.TopUpLink) {
          await updateOption('TopUpLink', inputs.TopUpLink);
        }
        if (originInputs['ChatLink'] !== inputs.ChatLink) {
          await updateOption('ChatLink', inputs.ChatLink);
        }
        if (originInputs['QuotaPerUnit'] !== inputs.QuotaPerUnit) {
          await updateOption('QuotaPerUnit', inputs.QuotaPerUnit);
        }
        if (originInputs['RetryTimes'] !== inputs.RetryTimes) {
          await updateOption('RetryTimes', inputs.RetryTimes);
        }
        break;
      case 'stripe':
        // Only update if admin actually typed a new value (not blank)
        if (inputs.StripeSecretKey !== '' && originInputs['StripeSecretKey'] !== inputs.StripeSecretKey) {
          await updateOption('StripeSecretKey', inputs.StripeSecretKey);
        }
        if (inputs.StripeWebhookSecret !== '' && originInputs['StripeWebhookSecret'] !== inputs.StripeWebhookSecret) {
          await updateOption('StripeWebhookSecret', inputs.StripeWebhookSecret);
        }
        showSuccess('Stripe 设置已保存');
        break;
      case 'alipay':
        if (inputs.AlipayAppId !== '' && originInputs['AlipayAppId'] !== inputs.AlipayAppId) {
          await updateOption('AlipayAppId', inputs.AlipayAppId);
        }
        if (inputs.AlipayPublicKey !== '' && originInputs['AlipayPublicKey'] !== inputs.AlipayPublicKey) {
          await updateOption('AlipayPublicKey', inputs.AlipayPublicKey);
        }
        if (inputs.AlipayPrivateKey !== '' && originInputs['AlipayPrivateKey'] !== inputs.AlipayPrivateKey) {
          await updateOption('AlipayPrivateKey', inputs.AlipayPrivateKey);
        }
        if (inputs.PayRateRMB !== '' && originInputs['PayRateRMB'] !== inputs.PayRateRMB) {
          await updateOption('PayRateRMB', inputs.PayRateRMB);
        }
        showSuccess('支付宝设置已保存');
        break;
      default:
        break;
    }
  };

  const deleteHistoryLogs = async () => {
    console.log(inputs);
    const res = await API.delete(
      `/api/log/?target_timestamp=${Date.parse(historyTimestamp) / 1000}`
    );
    const { success, message, data } = res.data;
    if (success) {
      showSuccess(`${data} 条日志已清理！`);
      return;
    }
    showError('日志清理失败：' + message);
  };

  return (
    <Grid columns={1}>
      <Grid.Column>
        <Form loading={loading}>
          <Header as='h3'>{t('setting.operation.quota.title')}</Header>
          <Form.Group widths='equal'>
            <Form.Input
              label={t('setting.operation.quota.new_user')}
              name='QuotaForNewUser'
              onChange={handleInputChange}
              autoComplete='new-password'
              value={inputs.QuotaForNewUser}
              type='number'
              min='0'
              placeholder={t('setting.operation.quota.new_user_placeholder')}
            />
            <Form.Input
              label={t('setting.operation.quota.pre_consume')}
              name='PreConsumedQuota'
              onChange={handleInputChange}
              autoComplete='new-password'
              value={inputs.PreConsumedQuota}
              type='number'
              min='0'
              placeholder={t('setting.operation.quota.pre_consume_placeholder')}
            />
            <Form.Input
              label={t('setting.operation.quota.inviter_reward')}
              name='QuotaForInviter'
              onChange={handleInputChange}
              autoComplete='new-password'
              value={inputs.QuotaForInviter}
              type='number'
              min='0'
              placeholder={t(
                'setting.operation.quota.inviter_reward_placeholder'
              )}
            />
            <Form.Input
              label={t('setting.operation.quota.invitee_reward')}
              name='QuotaForInvitee'
              onChange={handleInputChange}
              autoComplete='new-password'
              value={inputs.QuotaForInvitee}
              type='number'
              min='0'
              placeholder={t(
                'setting.operation.quota.invitee_reward_placeholder'
              )}
            />
          </Form.Group>
          <Form.Button
            onClick={() => {
              submitConfig('quota').then();
            }}
          >
            {t('setting.operation.quota.buttons.save')}
          </Form.Button>
          <Divider />
          <Header as='h3'>{t('setting.operation.ratio.title')}</Header>
          <Form.Group widths='equal'>
            <Form.TextArea
              label={t('setting.operation.ratio.model.title')}
              name='ModelRatio'
              onChange={handleInputChange}
              style={{ minHeight: 250, fontFamily: 'JetBrains Mono, Consolas' }}
              autoComplete='new-password'
              value={inputs.ModelRatio}
              placeholder={t('setting.operation.ratio.model.placeholder')}
            />
          </Form.Group>
          <Form.Group widths='equal'>
            <Form.TextArea
              label={t('setting.operation.ratio.completion.title')}
              name='CompletionRatio'
              onChange={handleInputChange}
              style={{ minHeight: 250, fontFamily: 'JetBrains Mono, Consolas' }}
              autoComplete='new-password'
              value={inputs.CompletionRatio}
              placeholder={t('setting.operation.ratio.completion.placeholder')}
            />
          </Form.Group>
          <Form.Group widths='equal'>
            <Form.TextArea
              label={t('setting.operation.ratio.group.title')}
              name='GroupRatio'
              onChange={handleInputChange}
              style={{ minHeight: 250, fontFamily: 'JetBrains Mono, Consolas' }}
              autoComplete='new-password'
              value={inputs.GroupRatio}
              placeholder={t('setting.operation.ratio.group.placeholder')}
            />
          </Form.Group>
          <Form.Button
            onClick={() => {
              submitConfig('ratio').then();
            }}
          >
            {t('setting.operation.ratio.buttons.save')}
          </Form.Button>
          <Divider />
          <Header as='h3'>{t('setting.operation.log.title')}</Header>
          <Form.Group inline>
            <Form.Checkbox
              checked={inputs.LogConsumeEnabled === 'true'}
              label={t('setting.operation.log.enable_consume')}
              name='LogConsumeEnabled'
              onChange={handleInputChange}
            />
          </Form.Group>
          <Form.Group widths={4}>
            <Form.Input
              label={t('setting.operation.log.target_time')}
              value={historyTimestamp}
              type='datetime-local'
              name='history_timestamp'
              onChange={(e, { name, value }) => {
                setHistoryTimestamp(value);
              }}
            />
          </Form.Group>
          <Form.Button
            onClick={() => {
              deleteHistoryLogs().then();
            }}
          >
            {t('setting.operation.log.buttons.clean')}
          </Form.Button>

          <Divider />
          <Header as='h3'>{t('setting.operation.monitor.title')}</Header>
          <Form.Group widths={3}>
            <Form.Input
              label={t('setting.operation.monitor.max_response_time')}
              name='ChannelDisableThreshold'
              onChange={handleInputChange}
              autoComplete='new-password'
              value={inputs.ChannelDisableThreshold}
              type='number'
              min='0'
              placeholder={t(
                'setting.operation.monitor.max_response_time_placeholder'
              )}
            />
            <Form.Input
              label={t('setting.operation.monitor.quota_reminder')}
              name='QuotaRemindThreshold'
              onChange={handleInputChange}
              autoComplete='new-password'
              value={inputs.QuotaRemindThreshold}
              type='number'
              min='0'
              placeholder={t(
                'setting.operation.monitor.quota_reminder_placeholder'
              )}
            />
          </Form.Group>
          <Form.Group inline>
            <Form.Checkbox
              checked={inputs.AutomaticDisableChannelEnabled === 'true'}
              label={t('setting.operation.monitor.auto_disable')}
              name='AutomaticDisableChannelEnabled'
              onChange={handleInputChange}
            />
            <Form.Checkbox
              checked={inputs.AutomaticEnableChannelEnabled === 'true'}
              label={t('setting.operation.monitor.auto_enable')}
              name='AutomaticEnableChannelEnabled'
              onChange={handleInputChange}
            />
          </Form.Group>
          <Form.Button
            onClick={() => {
              submitConfig('monitor').then();
            }}
          >
            {t('setting.operation.monitor.buttons.save')}
          </Form.Button>

          <Divider />
          <Header as='h3'>{t('setting.operation.general.title')}</Header>
          <Form.Group widths={4}>
            <Form.Input
              label={t('setting.operation.general.topup_link')}
              name='TopUpLink'
              onChange={handleInputChange}
              autoComplete='new-password'
              value={inputs.TopUpLink}
              type='link'
              placeholder={t(
                'setting.operation.general.topup_link_placeholder'
              )}
            />
            <Form.Input
              label={t('setting.operation.general.chat_link')}
              name='ChatLink'
              onChange={handleInputChange}
              autoComplete='new-password'
              value={inputs.ChatLink}
              type='link'
              placeholder={t('setting.operation.general.chat_link_placeholder')}
            />
            <Form.Input
              label={t('setting.operation.general.quota_per_unit')}
              name='QuotaPerUnit'
              onChange={handleInputChange}
              autoComplete='new-password'
              value={inputs.QuotaPerUnit}
              type='number'
              step='0.01'
              placeholder={t(
                'setting.operation.general.quota_per_unit_placeholder'
              )}
            />
            <Form.Input
              label={t('setting.operation.general.retry_times')}
              name='RetryTimes'
              type={'number'}
              step='1'
              min='0'
              onChange={handleInputChange}
              autoComplete='new-password'
              value={inputs.RetryTimes}
              placeholder={t(
                'setting.operation.general.retry_times_placeholder'
              )}
            />
          </Form.Group>
          <Form.Group inline>
            <Form.Checkbox
              checked={inputs.DisplayInCurrencyEnabled === 'true'}
              label={t('setting.operation.general.display_in_currency')}
              name='DisplayInCurrencyEnabled'
              onChange={handleInputChange}
            />
            <Form.Checkbox
              checked={inputs.DisplayTokenStatEnabled === 'true'}
              label={t('setting.operation.general.display_token_stat')}
              name='DisplayTokenStatEnabled'
              onChange={handleInputChange}
            />
            <Form.Checkbox
              checked={inputs.ApproximateTokenEnabled === 'true'}
              label={t('setting.operation.general.approximate_token')}
              name='ApproximateTokenEnabled'
              onChange={handleInputChange}
            />
          </Form.Group>
          <Form.Button
            onClick={() => {
              submitConfig('general').then();
            }}
          >
            {t('setting.operation.general.buttons.save')}
          </Form.Button>

          <Divider />
          <Header as='h3'>支付设置 (Stripe)</Header>
          <p style={{ color: '#888', fontSize: '0.9em', marginBottom: '1em' }}>
            出于安全考虑，已保存的密钥不会回显。如需更新，请重新填入新值并保存。
          </p>
          <Form.Group widths={2}>
            <Form.Input
              label={
                <label>
                  Stripe API 密钥 (Secret Key)
                  {originInputs.StripeSecretKey === undefined || originInputs.StripeSecretKey === ''
                    ? null
                    : <span style={{ marginLeft: 8, color: '#21ba45', fontSize: '0.85em' }}>✓ 已设置</span>
                  }
                </label>
              }
              name='StripeSecretKey'
              type='password'
              autoComplete='new-password'
              onChange={handleInputChange}
              value={inputs.StripeSecretKey}
              placeholder={
                originInputs.StripeSecretKey === undefined || originInputs.StripeSecretKey === ''
                  ? 'sk_live_... 或 sk_test_...'
                  : '留空表示不修改当前密钥'
              }
            />
            <Form.Input
              label={
                <label>
                  Stripe Webhook 密钥 (Webhook Secret)
                  {originInputs.StripeWebhookSecret === undefined || originInputs.StripeWebhookSecret === ''
                    ? null
                    : <span style={{ marginLeft: 8, color: '#21ba45', fontSize: '0.85em' }}>✓ 已设置</span>
                  }
                </label>
              }
              name='StripeWebhookSecret'
              type='password'
              autoComplete='new-password'
              onChange={handleInputChange}
              value={inputs.StripeWebhookSecret}
              placeholder={
                originInputs.StripeWebhookSecret === undefined || originInputs.StripeWebhookSecret === ''
                  ? 'whsec_...'
                  : '留空表示不修改当前密钥'
              }
            />
          </Form.Group>
          <Form.Button
            onClick={() => {
              submitConfig('stripe').then();
            }}
          >
            {t('setting.operation.general.buttons.save')}
          </Form.Button>

          <Divider />
          <Header as='h3'>支付设置 (支付宝 Alipay)</Header>
          <Form.Group widths={2}>
            <Form.Input
              label='汇率 (1 美元等值计收人民币，默认 7.2)'
              name='PayRateRMB'
              type='number'
              step='0.01'
              onChange={handleInputChange}
              value={inputs.PayRateRMB}
              placeholder={originInputs.PayRateRMB || '7.2'}
            />
            <Form.Input
              label={
                <label>
                  支付宝 AppId
                  {originInputs.AlipayAppId === undefined || originInputs.AlipayAppId === ''
                    ? null
                    : <span style={{ marginLeft: 8, color: '#21ba45', fontSize: '0.85em' }}>✓ 已设置</span>
                  }
                </label>
              }
              name='AlipayAppId'
              type='text'
              onChange={handleInputChange}
              value={inputs.AlipayAppId}
              placeholder={
                originInputs.AlipayAppId === undefined || originInputs.AlipayAppId === ''
                  ? '例如: 2021000123... '
                  : '留空表示不修改当前配置'
              }
            />
          </Form.Group>
          <Form.Group widths={2}>
            <Form.Input
              label={
                <label>
                  应用私钥 (Private Key)
                  {originInputs.AlipayPrivateKey === undefined || originInputs.AlipayPrivateKey === ''
                    ? null
                    : <span style={{ marginLeft: 8, color: '#21ba45', fontSize: '0.85em' }}>✓ 已设置</span>
                  }
                </label>
              }
              name='AlipayPrivateKey'
              type='password'
              autoComplete='new-password'
              onChange={handleInputChange}
              value={inputs.AlipayPrivateKey}
              placeholder={
                originInputs.AlipayPrivateKey === undefined || originInputs.AlipayPrivateKey === ''
                  ? 'MIIEowIBAAKCAQE... '
                  : '留空表示不修改当前应用私钥'
              }
            />
            <Form.Input
              label={
                <label>
                  支付宝公钥 (Alipay Public Key)
                  {originInputs.AlipayPublicKey === undefined || originInputs.AlipayPublicKey === ''
                    ? null
                    : <span style={{ marginLeft: 8, color: '#21ba45', fontSize: '0.85em' }}>✓ 已设置</span>
                  }
                </label>
              }
              name='AlipayPublicKey'
              type='password'
              autoComplete='new-password'
              onChange={handleInputChange}
              value={inputs.AlipayPublicKey}
              placeholder={
                originInputs.AlipayPublicKey === undefined || originInputs.AlipayPublicKey === ''
                  ? 'MIIBIjANBgkqhki... '
                  : '留空表示不修改当前支付宝公钥'
              }
            />
          </Form.Group>
          <Form.Button onClick={() => { submitConfig('alipay').then(); }}>
            {t('setting.operation.general.buttons.save')}
          </Form.Button>
        </Form>
      </Grid.Column>
    </Grid>
  );
};

export default OperationSetting;
