import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/User';
import { useTranslation } from 'react-i18next';

import {
  Button,
  Container,
  Dropdown,
  Icon,
  Menu,
  Segment,
} from 'semantic-ui-react';
import {
  API,
  getLogo,
  getSystemName,
  isAdmin,
  isMobile,
  showSuccess,
} from '../helpers';
import '../index.css';

// Header Navigation Items
let headerButtons = [
  { name: 'header.channel',  to: '/channel',  icon: 'sitemap',     admin: true  },
  { name: 'header.token',     to: '/token',    icon: 'key',         admin: false },
  { name: 'header.redemption',to: '/redemption',icon:'dollar sign', admin: true  },
  { name: 'header.topup',     to: '/topup',    icon: 'cart',        admin: false },
  { name: 'header.user',      to: '/user',     icon: 'user',        admin: true  },
  { name: 'header.dashboard', to: '/dashboard',icon:'chart bar',   admin: false },
  { name: 'header.log',       to: '/log',     icon: 'book',        admin: false },
  { name: 'header.setting',   to: '/setting', icon: 'setting',     admin: false },
  { name: 'header.about',     to: '/about',   icon: 'info circle', admin: false },
];

if (localStorage.getItem('chat_link')) {
  headerButtons.splice(1, 0, { name: 'header.chat', to: '/chat', icon: 'comments', admin: false });
}

const Header = () => {
  const { t, i18n } = useTranslation();
  const [userState, userDispatch] = useContext(UserContext);
  let navigate = useNavigate();

  const [showSidebar, setShowSidebar] = useState(false);
  const systemName = getSystemName();
  const logo = getLogo();

  async function logout() {
    setShowSidebar(false);
    await API.get('/api/user/logout');
    showSuccess('Logged out successfully!');
    userDispatch({ type: 'logout' });
    localStorage.removeItem('user');
    navigate('/login');
  }

  const toggleSidebar = () => setShowSidebar(!showSidebar);

  const languageOptions = [
    { key: 'zh', text: '中文',   value: 'zh' },
    { key: 'en', text: 'English', value: 'en' },
  ];

  const renderButtons = (mobile) => {
    return headerButtons.map((button) => {
      if (button.admin && !isAdmin()) return null;
      return (
        <Menu.Item
          key={button.name}
          as={Link}
          to={button.to}
          onClick={mobile ? () => setShowSidebar(false) : undefined}
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-secondary) !important',
            borderRadius: 'var(--radius-sm) !important',
            padding: '8px 12px !important',
            margin: '0 2px !important',
          }}
        >
          <Icon name={button.icon} style={{ marginRight: '6px', opacity: 0.7 }} />
          {t(button.name)}
        </Menu.Item>
      );
    });
  };

  // =====================
  // MOBILE RENDER
  // =====================
  if (isMobile()) {
    return (
      <>
        <Menu
          borderless
          size="large"
          style={{
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            height: '56px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <Container style={{ width: '100%', padding: '0 12px' }}>
            <Menu.Item as={Link} to="/" style={{ padding: '0 8px !important' }}>
              <img src={logo} alt="logo" style={{ width: '28px', height: '28px', marginRight: '8px', objectFit: 'contain' }} />
              <span style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>
                {systemName}
              </span>
            </Menu.Item>
            <Menu.Menu position="right">
              <Menu.Item onClick={toggleSidebar} style={{ padding: '8px 10px !important' }}>
                <Icon name={showSidebar ? 'close' : 'sidebar'} style={{ margin: 0, color: 'var(--text-secondary)' }} />
              </Menu.Item>
            </Menu.Menu>
          </Container>
        </Menu>

        {showSidebar && (
          <Segment
            style={{
              marginTop: 0,
              borderTop: 'none',
              borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <Menu secondary vertical style={{ width: '100%', margin: 0, padding: '8px 0' }}>
              {renderButtons(true)}
              <Menu.Item style={{ padding: '4px 12px' }}>
                <Dropdown
                  selection
                  compact
                  icon={<Icon name="world" style={{ margin: 0, fontSize: '16px', color: 'var(--text-secondary)' }} />}
                  options={languageOptions}
                  value={i18n.language}
                  onChange={(_, { value }) => i18n.changeLanguage(value)}
                  style={{ minWidth: '120px' }}
                />
              </Menu.Item>
              <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border-subtle)', marginTop: '8px' }}>
                {userState.user ? (
                  <Button onClick={logout} basic style={{ color: 'var(--error)', borderColor: 'var(--error)' }}>
                    {t('header.logout')}
                  </Button>
                ) : (
                  <>
                    <Button as={Link} to="/login" style={{ marginRight: '8px' }}>
                      {t('header.login')}
                    </Button>
                    <Button primary as={Link} to="/register">
                      {t('header.register')}
                    </Button>
                  </>
                )}
              </div>
            </Menu>
          </Segment>
        )}
      </>
    );
  }

  // =====================
  // DESKTOP RENDER
  // =====================
  return (
    <>
      <Menu
        borderless
        fixed="top"
        style={{
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          height: 'var(--header-height)',
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid var(--border-subtle)',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05), 0 1px 0 rgba(13, 148, 136, 0.05)',
          margin: 0,
          zIndex: 1000,
          padding: '0 32px',
        }}
      >
        {/* Logo */}
        <Menu.Item as={Link} to="/" style={{ padding: '0 16px 0 0 !important' }}>
          <img src={logo} alt="logo" style={{ width: '30px', height: '30px', marginRight: '10px', objectFit: 'contain' }} />
          <span
            style={{
              fontSize: '18px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              fontFamily: 'Outfit, sans-serif',
              letterSpacing: '-0.5px',
            }}
          >
            {systemName}
          </span>
        </Menu.Item>

        {/* Nav Items */}
        {renderButtons(false)}

        {/* Right Side Controls */}
        <Menu.Menu position="right" style={{ marginLeft: 'auto' }}>

          {/* Language Dropdown */}
          <Dropdown
            item
            simple
            trigger={
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 8px', fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)', cursor: 'pointer' }}>
                <Icon name="globe" style={{ margin: 0, fontSize: '16px' }} />
                <span className="hide-on-mobile" style={{ fontSize: '13px' }}>{i18n.language === 'zh' ? '中文' : 'EN'}</span>
              </span>
            }
            options={languageOptions}
            value={i18n.language}
            onChange={(_, { value }) => i18n.changeLanguage(value)}
            style={{ fontSize: '14px' }}
          />

          {/* User Menu */}
          {userState.user ? (
            <Dropdown
              pointing="top right"
              trigger={
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 14px',
                    marginLeft: '8px',
                    background: 'var(--brand-bg)',
                    borderRadius: 'var(--radius-full)',
                    cursor: 'pointer',
                    border: '1px solid rgba(13, 148, 136, 0.2)',
                  }}
                >
                  <div
                    style={{
                      width: '28px', height: '28px',
                      borderRadius: '50%',
                      background: 'var(--gradient-brand)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: '12px',
                      fontFamily: 'Outfit, sans-serif',
                    }}
                  >
                    {userState.user.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--brand-dark)' }}>
                    {userState.user.username}
                  </span>
                </span>
              }
            >
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => navigate('/dashboard')} style={{ fontSize: '14px' }}>
                  <Icon name="chart bar" style={{ marginRight: '8px' }} />
                  Dashboard
                </Dropdown.Item>
                <Dropdown.Item onClick={() => navigate('/token')} style={{ fontSize: '14px' }}>
                  <Icon name="key" style={{ marginRight: '8px' }} />
                  API Keys
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={logout} style={{ fontSize: '14px', color: 'var(--error)' }}>
                  <Icon name="sign out" style={{ marginRight: '8px' }} />
                  {t('header.logout')}
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '8px' }}>
              <Button
                as={Link}
                to="/login"
                basic
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  padding: '8px 18px !important',
                  borderRadius: 'var(--radius-md) !important',
                  color: 'var(--text-secondary)',
                  border: '1.5px solid var(--border-default)',
                }}
              >
                {t('header.login')}
              </Button>
              <Button
                as={Link}
                to="/register"
                primary
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  padding: '8px 20px !important',
                  borderRadius: 'var(--radius-md) !important',
                  background: 'var(--gradient-brand) !important',
                  boxShadow: 'var(--shadow-brand) !important',
                  letterSpacing: '0.3px',
                }}
              >
                {t('header.register')}
              </Button>
            </div>
          )}
        </Menu.Menu>
      </Menu>
    </>
  );
};

export default Header;
