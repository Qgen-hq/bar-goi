import React, { useState } from 'react';
import BottomSheet from './BottomSheet';
import { Phone, AlertCircle, ArrowRight } from 'lucide-react';
import { translations } from '../i18n/translations';
import { supabase } from '../lib/supabase';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, intentRole, lang }) {
  const t = translations[lang || 'ru'];
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.length < 10) {
      setError(lang === 'kz' ? 'Дұрыс телефон нөмірін енгізіңіз' : 'Введите корректный номер телефона');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // Direct Supabase lookup — no Express server needed
      let { data: profile, error: fetchErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone', cleanPhone)
        .maybeSingle();

      if (fetchErr) throw fetchErr;

      // Create profile if not exists
      if (!profile) {
        const newId = 'usr-' + Date.now();
        const targetRole = intentRole === 'seller' ? 'seller' : 'driver';
        const { data: created, error: insertErr } = await supabase
          .from('profiles')
          .insert({ id: newId, phone: cleanPhone, role: targetRole, full_name: '', city: 'Талдыкорган' })
          .select()
          .single();
        if (insertErr) throw insertErr;
        profile = created;
      } else if (intentRole) {
        // Update role if intentRole provided
        const targetRole = intentRole === 'seller' ? 'seller' : 'driver';
        const { data: updated } = await supabase
          .from('profiles')
          .update({ role: targetRole })
          .eq('id', profile.id)
          .select()
          .single();
        if (updated) profile = updated;
      }

      let sellerProfile = null;
      if (profile.role === 'seller') {
        const { data: sp } = await supabase
          .from('seller_profiles')
          .select('*')
          .eq('user_id', profile.id)
          .maybeSingle();
        sellerProfile = sp;
      }

      const requiresOnboarding = profile.role === 'driver'
        ? (!profile.full_name || profile.full_name.trim() === '')
        : (!sellerProfile);

      setLoading(false);
      onAuthSuccess({
        success: true,
        profile,
        sellerProfile,
        requiresRoleSelection: !profile.role,
        requiresOnboarding
      });
      onClose();
    } catch (err) {
      setLoading(false);
      console.error('Auth error:', err);
      // Offline fallback
      onAuthSuccess({
        success: true,
        profile: { id: 'usr-' + Date.now(), phone: cleanPhone, role: intentRole || 'driver', full_name: '' },
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
