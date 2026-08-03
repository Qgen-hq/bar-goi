import React, { useState } from 'react';
import BottomSheet from './BottomSheet';
import { Phone, AlertCircle, ArrowRight } from 'lucide-react';
import { translations } from '../i18n/translations';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, intentRole, lang }) {
  const t = translations[lang || 'ru'];
  const [phone, setPhone] = useState('+7 777 999 88 77');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError(lang === 'kz' ? 'Дұрыс телефон нөмірін енгізіңіз' : 'Введите корректный номер телефона');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, intentRole })
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok && data.success) {
        onAuthSuccess(data);
        onClose();
      } else {
        setError(data.error || 'Ошибка входа по номеру');
      }
    } catch (err) {
      setLoading(false);
      // Direct local login fallback respecting intentRole
      onAuthSuccess({
        success: true,
        profile: { id: 'usr-' + Date.now(), phone, role: intentRole || 'driver', full_name: '' },
        requiresRoleSelection: false,
        requiresOnboarding: true
      });
      onClose();
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={t.phoneAuthTitle}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{ width: '52px', height: '52px', background: 'var(--primary-emerald-light)', color: 'var(--primary-emerald)', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
          <Phone size={26} />
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          {t.phoneAuthSub}
        </p>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <form onSubmit={handleLogin}>
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

        <button type="submit" className="btn-primary" disabled={loading} style={{ fontSize: '16px', padding: '14px' }}>
          {loading ? '...' : (
            <>
              {t.verifyOtpBtn} <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
    </BottomSheet>
  );
}
