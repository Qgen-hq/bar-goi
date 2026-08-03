import React from 'react';
import { Car, Store, ArrowRight, Zap, ShieldCheck, MapPin, Clock } from 'lucide-react';
import { translations } from '../i18n/translations';

export default function SplashScreen({ lang, setLang, onStart }) {
  const t = translations[lang || 'ru'];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 4px' }}>
      {/* Top Hero Banner */}
      <div className="hero-banner" style={{ textAlign: 'center', padding: '28px 20px', marginBottom: '20px', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: '#FFFFFF', borderRadius: '24px', position: 'relative', boxShadow: 'var(--shadow-md)' }}>
        
        {/* LANDING PAGE LANGUAGE SWITCHER PILL */}
        <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', padding: '3px' }}>
          <button
            type="button"
            onClick={() => setLang('kz')}
            style={{
              padding: '4px 10px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '11px',
              fontWeight: 900,
              cursor: 'pointer',
              background: lang === 'kz' ? 'var(--primary-emerald)' : 'transparent',
              color: lang === 'kz' ? '#FFFFFF' : '#94A3B8'
            }}
          >
            KZ
          </button>
          <button
            type="button"
            onClick={() => setLang('ru')}
            style={{
              padding: '4px 10px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '11px',
              fontWeight: 900,
              cursor: 'pointer',
              background: lang === 'ru' ? 'var(--primary-emerald)' : 'transparent',
              color: lang === 'ru' ? '#FFFFFF' : '#94A3B8'
            }}
          >
            RU
          </button>
        </div>

        <div style={{ width: '56px', height: '56px', background: 'var(--primary-emerald)', color: '#fff', borderRadius: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', boxShadow: '0 8px 24px var(--primary-emerald-glow)' }}>
          <Zap size={30} fill="#FFFFFF" />
        </div>

        <h1 style={{ fontSize: '26px', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '8px', lineHeight: 1.2 }}>
          Bar<span style={{ color: 'var(--primary-emerald)' }}>Goi</span> — {t.welcomeTitle}
        </h1>

        <p style={{ fontSize: '14px', color: '#94A3B8', maxWidth: '600px', margin: '0 auto 16px auto', lineHeight: 1.4 }}>
          {t.welcomeSubtitle}
        </p>

        {/* Live Metrics Bar */}
        <div className="metrics-bar" style={{ justifyContent: 'center' }}>
          <div className="metric-pill">
            <ShieldCheck size={13} color="var(--primary-emerald)" /> <b>45+ Бутиков в сети</b>
          </div>
          <div className="metric-pill">
            <Clock size={13} color="#FBBF24" /> <b>Ответ за 3 минуты</b>
          </div>
          <div className="metric-pill">
            <MapPin size={13} color="#6EE7B7" /> <b>Талдыкорган, Алматы, Астана</b>
          </div>
        </div>
      </div>

      {/* Role Selection Landing Cards */}
      <div style={{ textAlign: 'center', marginBottom: '14px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--dark-slate)', marginBottom: '4px' }}>
          {t.selectRoleTitle}
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
        {/* DRIVER ROLE CARD */}
        <div
          onClick={() => onStart('driver')}
          className="card"
          style={{
            cursor: 'pointer',
            border: '2px solid var(--primary-emerald)',
            borderRadius: '20px',
            padding: '22px 20px',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            background: '#FFFFFF',
            position: 'relative',
            margin: 0,
            boxShadow: '0 6px 20px rgba(0, 200, 83, 0.12)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'var(--primary-emerald-light)', color: 'var(--primary-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Car size={28} />
            </div>

            <div>
              <h3 style={{ fontSize: '19px', fontWeight: 900, color: 'var(--dark-slate)' }}>
                {t.driverRoleTitle}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                {t.driverRoleDesc}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
            <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary-emerald)' }}>
              {lang === 'kz' ? 'Тіркелу және бөлшек табу ➔' : 'Регистрация и поиск детали ➔'}
            </span>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--primary-emerald)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowRight size={18} />
            </div>
          </div>
        </div>

        {/* SELLER ROLE CARD */}
        <div
          onClick={() => onStart('seller')}
          className="card"
          style={{
            cursor: 'pointer',
            border: '2px solid #3B82F6',
            borderRadius: '20px',
            padding: '22px 20px',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            background: '#FFFFFF',
            position: 'relative',
            margin: 0,
            boxShadow: '0 6px 20px rgba(59, 130, 246, 0.12)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Store size={28} />
            </div>

            <div>
              <h3 style={{ fontSize: '19px', fontWeight: 900, color: 'var(--dark-slate)' }}>
                {t.sellerRoleTitle}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                {t.sellerRoleDesc}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
            <span style={{ fontSize: '14px', fontWeight: 800, color: '#2563EB' }}>
              {lang === 'kz' ? 'Бутикті тіркеу ➔' : 'Зарегистрировать Бутик ➔'}
            </span>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#2563EB', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowRight size={18} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
