import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from 'semantic-ui-react';
import { API, showError } from '../../helpers';
import { marked } from 'marked';

const About = () => {
  const { t } = useTranslation();
  const [about, setAbout] = useState('');
  const [aboutLoaded, setAboutLoaded] = useState(false);

  const displayAbout = async () => {
    setAbout(localStorage.getItem('about') || '');
    const res = await API.get('/api/about');
    const { success, message, data } = res.data;
    if (success) {
      let aboutContent = data;
      if (!data.startsWith('https://')) {
        aboutContent = marked.parse(data);
      }
      setAbout(aboutContent);
      localStorage.setItem('about', aboutContent);
    } else {
      showError(message);
      setAbout(t('about.loading_failed'));
    }
    setAboutLoaded(true);
  };

  useEffect(() => {
    displayAbout().then();
  }, []);

  return (
    <>
      {aboutLoaded && about === '' ? (
        <div className="ui container" style={{ padding: '40px 0', maxWidth: '900px !important' }}>
          <Card fluid style={{ borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
            <Card.Content style={{ padding: '28px 32px !important' }}>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '12px' }}>{t('about.title')}</h2>
              <p style={{ color: 'var(--text-secondary)' }}>{t('about.description')}</p>
              <a href="https://github.com/songquanpeng/one-api" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-primary)' }}>
                {t('about.repository')} https://github.com/songquanpeng/one-api
              </a>
            </Card.Content>
          </Card>
        </div>
      ) : (
        <>
          {about.startsWith('https://') ? (
            <iframe
              src={about}
              style={{ width: '100%', height: '100vh', border: 'none' }}
            />
          ) : (
            <div className="ui container" style={{ padding: '40px 0', maxWidth: '900px !important' }}>
              <Card fluid style={{ borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
                <Card.Content style={{ padding: '28px 32px !important' }}>
                  <div style={{ fontSize: 'larger', color: 'var(--text-primary)' }} dangerouslySetInnerHTML={{ __html: about }} />
                </Card.Content>
              </Card>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default About;
