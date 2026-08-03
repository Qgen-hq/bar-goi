import React, { useState } from 'react';
import { User, Phone, MapPin, CheckCircle2, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { translations } from '../i18n/translations';

export const KZ_CITIES = [
  'Талдыкорган',
  'Алматы',
  'Астана',
  'Шымкент',
  'Караганда',
  'Актобе',
  'Тараз',
  'Павлодар',
  'Семей',
  'Усть-Каменогорск',
  'Костанай',
  'Кызылорда',
  'Атырау',
  'Актау'
];

export default function DriverOnboarding({ user, lang, onSaveProfile }) {
  const t = translations[lang || 'ru'];

  const [fullName, setFullName] = useState(user?.full_name || user?.fullName || 'Арман Жумабеков');
  const [phone, setPhone] = useState(user?.phone || '+7 701 111 22 33');
  const [city, setCity] = useState(user?.city || 'Талдыкорган');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      setError(lang === 'kz' ? 'Атыңызды және телефон нөміріңізді енгізіңіз' : 'Заполните ваше имя и номер телефона');
      return;
    }

    setError('');
    setLoading(true);

    const driverPayload = {
      id: user?.id || 'usr-driver-' + Date.now(),
      phone: phone.trim(),
      role: 'driver',
      full_name: fullName.trim(),
      fullName: fullName.trim(),
      city
    };

    try {
      const res = await fetch('/api/auth/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: driverPayload.id,
          role: 'driver',
          driverData: {
            fullName: fullName.trim(),
            phone: phone.trim(),
            city
          }
        })
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok && data.success) {
        onSaveProfile(data.profile || driverPayload, data.profile || driverPayload);
      } else {
        onSaveProfile(driverPayload, driverPayload);
      }
    } catch (err) {
      setLoading(false);
      onSaveProfile(driverPayload, driverPayload);
    }
  };

  return (
    <div style={{ maxWidth: '540px', margin: '0 auto', padding: '10px 0' }}>
      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: '#FFFFFF', padding: '24px 20px', borderRadius: '24px', marginBottom: '20px', textAlign: 'center', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'var(--primary-emerald)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', boxShadow: '0 8px 24px var(--primary-emerald-glow)' }}>
          <User size={30} />
        </div>

        <h2 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '6px' }}>
          {lang === 'kz' ? 'Жүргізуші профилін тіркеу' : 'Регистрация Водителя (All-in-One)'}
        </h2>

        <p style={{ fontSize: '13px', color: '#94A3B8' }}>
          {lang === 'kz' ? 'Автобөлшектерді жылдам іздеу үшін мәліметтерді көрсетіңіз' : 'Укажите ваши данные для связи с автомагазинами'}
        </p>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '12px 16px', borderRadius: '14px', marginBottom: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card" style={{ padding: '24px' }}>
        {/* Full Name Field */}
        <div className="form-group">
          <label className="form-label">{t.fullNameLabel}</label>
          <input
            type="text"
            className="form-input"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="например: Арман Жумабеков"
            required
          />
        </div>

        {/* Phone Field */}
        <div className="form-group">
          <label className="form-label">{t.phoneLabel}</label>
          <input
            type="text"
            className="form-input"
            style={{ fontSize: '16px', fontWeight: 700 }}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+7 7XX XXX XX XX"
            required
          />
        </div>

        {/* City Selector Field */}
        <div className="form-group" style={{ marginBottom: '24px' }}>
          <label className="form-label">{t.cityLabel}</label>
          <select
            className="form-select"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            {KZ_CITIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '16px', fontSize: '16px' }}>
          <span>{loading ? '...' : (lang === 'kz' ? 'Тіркелуді аяқтау ➔' : 'Завершить регистрацию ➔')}</span>
        </button>
      </form>
    </div>
  );
}
