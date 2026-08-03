import React, { useState } from 'react';
import { User, Save, AlertCircle } from 'lucide-react';
import { translations } from '../i18n/translations';

export default function DriverOnboarding({ user, lang, onSaveProfile }) {
  const t = translations[lang || 'ru'];
  const [fullName, setFullName] = useState(user?.full_name || user?.name || 'Шарипов Нурасыл');
  const [city, setCity] = useState('Талдыкорган');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError(lang === 'kz' ? 'Атыңызды енгізіңіз' : 'Введите ваше имя');
      return;
    }
    setError('');
    setSaving(true);

    const fallbackProfile = {
      id: user?.id || 'usr-driver-1',
      phone: user?.phone || '+7 777 999 88 77',
      role: 'driver',
      full_name: fullName.trim(),
      city
    };

    try {
      const res = await fetch('/api/auth/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 'usr-driver-1',
          role: 'driver',
          driverData: { fullName: fullName.trim(), city }
        })
      });
      const data = await res.json();
      setSaving(false);

      if (res.ok && data.success) {
        onSaveProfile(data.profile, data.profile);
      } else {
        // Fallback local save if server responds with error
        onSaveProfile(fallbackProfile, fallbackProfile);
      }
    } catch (err) {
      setSaving(false);
      // Fallback local save if offline
      onSaveProfile(fallbackProfile, fallbackProfile);
    }
  };

  return (
    <div style={{ padding: '8px 4px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ background: 'var(--dark-slate)', color: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <User size={22} style={{ color: 'var(--primary-emerald)' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 800 }}>{t.driverOnboardTitle}</h2>
        </div>
        <p style={{ fontSize: '12px', color: '#94A3B8' }}>
          {t.driverOnboardSubtitle}
        </p>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '12px', borderRadius: '12px', marginBottom: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label className="form-label">{t.fullNameLabel}</label>
          <input
            type="text"
            className="form-input"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="например: Шарипов Нурасыл"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t.cityLabel}</label>
          <input
            type="text"
            className="form-input"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-primary" disabled={saving}>
          <Save size={18} /> {saving ? '...' : t.saveProfileBtn}
        </button>
      </form>
    </div>
  );
}
