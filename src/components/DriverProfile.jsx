import React, { useState } from 'react';
import { User, Phone, MapPin, ShoppingBag, ShieldCheck, LogOut, CheckCircle2, Clock, Edit3, Save, X, AlertCircle } from 'lucide-react';
import { translations } from '../i18n/translations';
import { KZ_CITIES } from './DriverOnboarding';

export default function DriverProfile({ user, requests, lang, onLogout, onUpdateProfile }) {
  const t = translations[lang || 'ru'];

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || user?.fullName || 'Арман Жумабеков');
  const [phone, setPhone] = useState(user?.phone || '+7 701 111 22 33');
  const [city, setCity] = useState(user?.city || 'Талдыкорган');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const driverRequests = (requests || []).filter(r => 
    !user?.phone || r.driverPhone === user.phone || r.driver_phone === user.phone
  );

  const totalOffersReceived = driverRequests.reduce((acc, r) => acc + (r.offers?.length || 0), 0);

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const updatedUser = {
      ...user,
      full_name: fullName.trim(),
      fullName: fullName.trim(),
      phone: phone.trim(),
      city
    };

    if (onUpdateProfile) {
      onUpdateProfile(updatedUser);
    }
    
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '10px 0' }}>
      {savedSuccess && (
        <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', color: '#065F46', padding: '12px 16px', borderRadius: '14px', marginBottom: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}>
          <CheckCircle2 size={18} /> {lang === 'kz' ? 'Профиль мәліметтері сәтті жаңартылды!' : 'Профиль успешно обновлен!'}
        </div>
      )}

      {/* Profile Header Card */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: '#fff', padding: '24px', position: 'relative' }}>
        
        {/* EDIT PROFILE BUTTON */}
        <button
          onClick={() => setIsEditing(!isEditing)}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: isEditing ? '#EF4444' : 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#FFFFFF',
            padding: '6px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {isEditing ? <X size={14} /> : <Edit3 size={14} />}
          <span>{isEditing ? (lang === 'kz' ? 'Бас тарту' : 'Отмена') : (lang === 'kz' ? 'Өзгерту' : 'Редактировать')}</span>
        </button>

        {!isEditing ? (
          <div style={{ textAlign: 'center', paddingTop: '10px' }}>
            <div style={{ width: '68px', height: '68px', borderRadius: '50%', background: 'var(--primary-emerald)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', boxShadow: '0 8px 24px var(--primary-emerald-glow)' }}>
              <User size={34} />
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '4px' }}>
              {user?.full_name || user?.fullName || (lang === 'kz' ? 'Жүргізуші' : 'Водитель')}
            </h2>

            <div style={{ fontSize: '14px', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '14px' }}>
              <Phone size={14} color="var(--primary-emerald)" />
              <span>{user?.phone || '+7 7XX XXX XX XX'}</span>
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', color: '#E2E8F0', fontWeight: 700 }}>
              <MapPin size={14} color="#6EE7B7" />
              <span>{user?.city || 'Талдыкорган'}</span>
            </div>
          </div>
        ) : (
          /* INLINE EDIT FORM */
          <form onSubmit={handleSaveEdit} style={{ textAlign: 'left', paddingTop: '10px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '14px', color: '#FFFFFF' }}>
              {lang === 'kz' ? 'Профиль мәліметтерін өңдеу' : 'Редактирование данных водителя'}
            </h3>

            <div className="form-group">
              <label className="form-label" style={{ color: '#E2E8F0' }}>{t.fullNameLabel}</label>
              <input
                type="text"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#E2E8F0' }}>{t.phoneLabel}</label>
              <input
                type="text"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#E2E8F0' }}>{t.cityLabel}</label>
              <select
                className="form-select"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                {KZ_CITIES.map(c => (
                  <option key={c} value={c} style={{ background: '#0F172A', color: '#FFFFFF' }}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '12px', fontSize: '14px', marginTop: '10px' }}>
              <Save size={16} /> {lang === 'kz' ? 'Өзгерістерді сақтау' : 'Сохранить изменения'}
            </button>
          </form>
        )}
      </div>

      {/* Driver Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
          <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--primary-emerald)' }}>
            {driverRequests.length}
          </div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
            {lang === 'kz' ? 'Бөлшекке сұраныстар' : 'Запросов запчастей'}
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#2563EB' }}>
            {totalOffersReceived}
          </div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
            {lang === 'kz' ? 'Дүкендердің ұсыныстары' : 'Ответов бутиков'}
          </div>
        </div>
      </div>

      {/* History of Requests */}
      <div className="card">
        <h3 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '14px', color: 'var(--dark-slate)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShoppingBag size={18} color="var(--primary-emerald)" />
          {lang === 'kz' ? 'Тапсырыстар тарихы' : 'История моих запросов'}
        </h3>

        {driverRequests.length === 0 ? (
          <div style={{ textTransform: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>
            {lang === 'kz' ? 'Әлі белсенді сұраныстар жоқ' : 'У вас пока нет активных запросов.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {driverRequests.map((req, idx) => (
              <div key={req.id || idx} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px', background: '#F8FAFC' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--dark-slate)' }}>
                    {req.carModel || req.car_model || 'Авто'}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--primary-emerald)', fontWeight: 800, background: 'var(--primary-emerald-light)', padding: '2px 8px', borderRadius: '8px' }}>
                    {req.offers?.length || 0} {lang === 'kz' ? 'жауап' : 'ответов'}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>
                  Деталь: {req.partNeeded || req.part_name || 'Деталь'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PROMINENT LOGOUT & ROLE SWITCH BUTTON */}
      <button
        onClick={onLogout}
        className="btn-secondary"
        style={{ color: '#EF4444', borderColor: '#FCA5A5', padding: '14px', background: '#FEF2F2', fontSize: '15px', fontWeight: 800 }}
      >
        <LogOut size={18} /> {lang === 'kz' ? 'Жүйеден шығу / Рольді ауыстыру' : 'Выйти из аккаунта / Сменить роль'}
      </button>
    </div>
  );
}
