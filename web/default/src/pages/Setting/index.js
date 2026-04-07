import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Tab } from 'semantic-ui-react';
import SystemSetting from '../../components/SystemSetting';
import { isRoot } from '../../helpers';
import OtherSetting from '../../components/OtherSetting';
import PersonalSetting from '../../components/PersonalSetting';
import OperationSetting from '../../components/OperationSetting';
import PaymentSetting from '../../components/PaymentSetting';

const Setting = () => {
  const { t } = useTranslation();
  const [defaultActiveIndex, setDefaultActiveIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let index = 0;
    if (isRoot()) {
      if (window.location.pathname.includes('/operation')) index = 1;
      else if (window.location.pathname.includes('/payment')) index = 2;
      else if (window.location.pathname.includes('/system')) index = 3;
      else if (window.location.pathname.includes('/other')) index = 4;
    }
    setDefaultActiveIndex(index);
    setIsLoaded(true);
  }, []);

  let panes = [
    {
      menuItem: t('setting.tabs.personal'),
      render: () => (
        <Tab.Pane attached={false}>
          <PersonalSetting />
        </Tab.Pane>
      ),
    },
  ];

  if (isRoot()) {
    panes.push({
      menuItem: t('setting.tabs.operation'),
      render: () => (
        <Tab.Pane attached={false}>
          <OperationSetting />
        </Tab.Pane>
      ),
    });
    panes.push({
      menuItem: t('payment.title', '支付设置'),
      render: () => (
        <Tab.Pane attached={false}>
          <PaymentSetting />
        </Tab.Pane>
      ),
    });
    panes.push({
      menuItem: t('setting.tabs.system'),
      render: () => (
        <Tab.Pane attached={false}>
          <SystemSetting />
        </Tab.Pane>
      ),
    });
    panes.push({
      menuItem: t('setting.tabs.other'),
      render: () => (
        <Tab.Pane attached={false}>
          <OtherSetting />
        </Tab.Pane>
      ),
    });
  }

  if (!isLoaded) return null;

  return (
    <div className='dashboard-container'>
      <Card fluid className='chart-card'>
        <Card.Content>
          <Card.Header className='header'>{t('setting.title')}</Card.Header>
          <Tab
            defaultActiveIndex={defaultActiveIndex}
            menu={{
              secondary: true,
              pointing: true,
              className: 'settings-tab',
            }}
            panes={panes}
          />
        </Card.Content>
      </Card>
    </div>
  );
};

export default Setting;
