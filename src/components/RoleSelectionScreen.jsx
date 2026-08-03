import React from 'react';
import { Car, Store, ArrowRight, ShieldCheck } from 'lucide-react';
import { translations } from '../i18n/translations';

export default function RoleSelectionScreen({ lang, onSelectRole }) {
  const t = translations[lang || 'ru'];

  return (
    <div style={{ padding: '8px 4px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px', paddingTop: '10px' }}>
        <div style={{ width: '48px', height: '48px', background: 'var(--primary-emerald-light)', color: 'var(--primary-emerald)', borderRadius: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
          <ShieldCheck size={28} />
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--dark-slate)', marginBottom: '6px' }}>
          {t.chooseRoleTitle}
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          {t.chooseRoleSubtitle}
        </p>
      </div>

      {/* Driver Selection Card */}
      <div
        onClick={() => onSelectRole('Driver')}
        className="card"
        style={{
          padding: '20px',
          borderRadius: '20px',
          border: '2px solid var(--border-color)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          marginBottom: '16px',
          background: '#FFFFFF'
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary-emerald)'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Car size={26} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--dark-slate)' }}>
              {t.cardDriverTitle}
            </h3>
            <span style={{ fontSize: '11px', background: '#DBEAFE', color: '#1E40AF', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
              DRIVER APP
            </span>
          </div>
          <ArrowRight size={20} color="#94A3B8" />
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
          {t.cardDriverSubtitle}
        </p>
      </div>

      {/* Seller Selection Card */}
      <div
        onClick={() => onSelectRole('Seller')}
        className="card"
        style={{
          padding: '20px',
          borderRadius: '20px',
          border: '2px solid var(--border-color)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          marginBottom: '16px',
          background: '#FFFFFF'
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary-emerald)'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'var(--primary-emerald-light)', color: 'var(--primary-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Store size={26} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--dark-slate)' }}>
              {t.cardSellerTitle}
            </h3>
            <span style={{ fontSize: '11px', background: '#D1FAE5', color: '#065F46', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
              SELLER APP
            </span>
          </div>
          <ArrowRight size={20} color="#94A3B8" />
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
          {t.cardSellerSubtitle}
        </p>
      </div>
    </div>
  );
}
