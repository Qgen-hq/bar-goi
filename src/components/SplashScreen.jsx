import React from 'react';
import { Car, Store, ArrowRight, Zap, ShieldCheck, MapPin, Clock } from 'lucide-react';
import { translations } from '../i18n/translations';

export default function SplashScreen({ lang, setLang, onStart }) {
  const t = translations[lang || 'ru'];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '10px 0' }}>
      {/* Top Hero Banner */}
      <div className="hero-banner" style={{ textAlign: 'center', padding: '40px 24px', marginBottom: '32px' }}>
        <div style={{ width: '64px', height: '64px', background: 'var(--primary-emerald)', color: '#fff', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '0 10px 30px var(--primary-emerald-glow)' }}>
          <Zap size={36} fill="#FFFFFF" />
        </div>

        <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '12px', lineHeight: 1.2 }}>
          Bar<span style={{ color: 'var(--primary-emerald)' }}>Goi</span> — {t.welcomeTitle}
        </h1>

        <p style={{ fontSize: '16px', color: '#94A3B8', maxWidth: '640px', margin: '0 auto 24px auto', lineHeight: 1.5 }}>
          {t.welcomeSubtitle}
        </p>

        {/* Live Metrics Bar */}
        <div className="metrics-bar" style={{ justifyContent: 'center' }}>
          <div className="metric-pill">
            <ShieldCheck size={14} color="var(--primary-emerald)" /> <b>45+ Автобутиков в сети</b>
          </div>
          <div className="metric-pill">
            <Clock size={14} color="#FBBF24" /> <b>Ответ за 3 минуты</b>
          </div>
          <div className="metric-pill">
            <MapPin size={14} color="#6EE7B7" /> <b>Талдыкорган, Алматы, Астана</b>
          </div>
        </div>
      </div>

      {/* Role Selection Landing Cards */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--dark-slate)', marginBottom: '6px' }}>
          {t.selectRoleTitle}
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          {lang === 'kz' ? 'Платформаға кіру үшін роліңізді таңдаңыз' : 'Выберите подходящую категорию для входа'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* DRIVER ROLE CARD */}
        <div
          onClick={() => onStart('driver')}
          className="card"
          style={{
            cursor: 'pointer',
            border: '2px solid var(--border-color)',
            borderRadius: '24px',
            padding: '30px 24px',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            background: '#FFFFFF',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary-emerald)';
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 200, 83, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          }}
        >
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--primary-emerald-light)', color: 'var(--primary-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
            <Car size={30} />
          </div>

          <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--dark-slate)', marginBottom: '8px' }}>
            {t.driverRoleTitle}
          </h3>

          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '24px' }}>
            {t.driverRoleDesc}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary-emerald)' }}>
              {lang === 'kz' ? 'Бөлшек іздеу ➔' : 'Найти деталь ➔'}
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-emerald)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
            border: '2px solid var(--border-color)',
            borderRadius: '24px',
            padding: '30px 24px',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            background: '#FFFFFF',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#3B82F6';
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 15px 35px rgba(59, 130, 246, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          }}
        >
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
            <Store size={30} />
          </div>

          <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--dark-slate)', marginBottom: '8px' }}>
            {t.sellerRoleTitle}
          </h3>

          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '24px' }}>
            {t.sellerRoleDesc}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#2563EB' }}>
              {lang === 'kz' ? 'Бутик ретінде кіру ➔' : 'Войти как Бутик ➔'}
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#2563EB', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowRight size={18} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
