import React from 'react';
import { User, LogOut, Phone, ShieldCheck, Car } from 'lucide-react';
import { translations } from '../i18n/translations';

export default function DriverProfile({ user, profile, lang, onLogout }) {
  const t = translations[lang || 'ru'];

  return (
    <div>
      <div style={{ background: 'var(--dark-slate)', color: '#fff', padding: '20px', borderRadius: '20px', marginBottom: '16px', textAlign: 'center' }}>
        <div style={{ width: '60px', height: '60px', background: 'var(--primary-emerald)', color: '#FFF', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
          <Car size={32} />
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: 800 }}>{profile?.fullName || user?.name || 'Водитель'}</h2>
        <span style={{ fontSize: '11px', background: '#DBEAFE', color: '#1E40AF', padding: '3px 10px', borderRadius: '12px', fontWeight: 800, display: 'inline-block', marginTop: '6px' }}>
          DRIVER ACCOUNT
        </span>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Phone size={16} /> {t.driverPhoneLabel}
          </span>
          <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--dark-slate)' }}>
            {user?.phone}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} /> {t.roleLabel}
          </span>
          <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary-emerald)' }}>
            {t.roleDriverBadge}
          </span>
        </div>
      </div>

      <button
        onClick={onLogout}
        className="btn-secondary"
        style={{ color: '#DC2626', borderColor: '#FCA5A5', background: '#FEF2F2', marginTop: '10px' }}
      >
        <LogOut size={18} /> {t.logoutBtn}
      </button>
    </div>
  );
}
