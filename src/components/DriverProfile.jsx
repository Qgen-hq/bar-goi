import React from 'react';
import { User, Phone, MapPin, ShoppingBag, ShieldCheck, LogOut, CheckCircle2, Clock } from 'lucide-react';
import { translations } from '../i18n/translations';

export default function DriverProfile({ user, requests, lang, onLogout }) {
  const t = translations[lang || 'ru'];

  const driverRequests = (requests || []).filter(r => 
    !user?.phone || r.driverPhone === user.phone || r.driver_phone === user.phone
  );

  const totalOffersReceived = driverRequests.reduce((acc, r) => acc + (r.offers?.length || 0), 0);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      {/* Profile Header Card */}
      <div className="card" style={{ background: 'var(--dark-slate)', color: '#fff', textAlign: 'center', padding: '30px 20px' }}>
        <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--primary-emerald)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', boxShadow: '0 8px 24px var(--primary-emerald-glow)' }}>
          <User size={36} />
        </div>

        <h2 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '4px' }}>
          {user?.full_name || user?.fullName || (lang === 'kz' ? 'Жүргізуші' : 'Водитель')}
        </h2>

        <div style={{ fontSize: '14px', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '16px' }}>
          <Phone size={14} color="var(--primary-emerald)" />
          <span>{user?.phone || '+7 7XX XXX XX XX'}</span>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', color: '#E2E8F0', fontWeight: 700 }}>
          <MapPin size={14} color="#6EE7B7" />
          <span>Талдыкорган, Казахстан</span>
        </div>
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

      {/* Logout Button */}
      <button
        onClick={onLogout}
        className="btn-secondary"
        style={{ color: '#EF4444', borderColor: '#FCA5A5', padding: '14px' }}
      >
        <LogOut size={18} /> {t.logoutBtn}
      </button>
    </div>
  );
}
