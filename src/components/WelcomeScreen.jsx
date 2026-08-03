import React from 'react';
import { Car, Sparkles, MessageSquare, ArrowRight, ShieldCheck, Globe } from 'lucide-react';
import { translations } from '../i18n/translations';

export default function WelcomeScreen({ lang, setLang, onStartAuth }) {
  const t = translations[lang];

  return (
    <div style={{ padding: '8px 4px' }}>
      {/* Top Language Switcher Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', background: '#FFFFFF', padding: '8px 14px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
        <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--dark-slate)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Globe size={16} color="var(--primary-emerald)" />
          {t.selectLanguage}
        </span>

        <div style={{ display: 'flex', background: '#F1F5F9', padding: '2px', borderRadius: '12px' }}>
          <button
            onClick={() => setLang('kz')}
            style={{
              padding: '4px 10px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              background: lang === 'kz' ? 'var(--primary-emerald)' : 'transparent',
              color: lang === 'kz' ? '#FFFFFF' : 'var(--text-muted)'
            }}
          >
            🇰🇿 KZ
          </button>
          <button
            onClick={() => setLang('ru')}
            style={{
              padding: '4px 10px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              background: lang === 'ru' ? 'var(--primary-emerald)' : 'transparent',
              color: lang === 'ru' ? '#FFFFFF' : 'var(--text-muted)'
            }}
          >
            🇷🇺 RU
          </button>
        </div>
      </div>

      {/* Main Welcome Hero Card */}
      <div style={{ background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', color: '#FFFFFF', padding: '24px 20px', borderRadius: '24px', marginBottom: '20px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
        <div style={{ width: '56px', height: '56px', background: 'var(--primary-emerald)', color: '#FFF', borderRadius: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', boxShadow: '0 4px 14px var(--primary-emerald-glow)' }}>
          <Car size={32} />
        </div>

        <h1 style={{ fontSize: '20px', fontWeight: 800, lineHeight: 1.3, marginBottom: '8px' }}>
          Part<span style={{ color: 'var(--primary-emerald)' }}>Drive</span>
        </h1>
        <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#E2E8F0', marginBottom: '12px', lineHeight: 1.4 }}>
          {t.welcomeTitle}
        </h2>
        <p style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.5, marginBottom: '20px' }}>
          {t.welcomeSubtitle}
        </p>

        <button
          onClick={onStartAuth}
          className="btn-primary"
          style={{ width: '100%', padding: '16px', fontSize: '16px' }}
        >
          {t.continueBtn} <ArrowRight size={20} />
        </button>
      </div>

      {/* Key Feature Cards */}
      <div className="card" style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ background: 'var(--primary-emerald-light)', color: 'var(--primary-emerald)', padding: '10px', borderRadius: '12px' }}>
          <Sparkles size={22} />
        </div>
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--dark-slate)', marginBottom: '4px' }}>
            {t.welcomeFeature1Title}
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            {t.welcomeFeature1Desc}
          </p>
        </div>
      </div>

      <div className="card" style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ background: '#ECFDF5', color: '#059669', padding: '10px', borderRadius: '12px' }}>
          <MessageSquare size={22} />
        </div>
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--dark-slate)', marginBottom: '4px' }}>
            {t.welcomeFeature2Title}
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            {t.welcomeFeature2Desc}
          </p>
        </div>
      </div>
    </div>
  );
}
