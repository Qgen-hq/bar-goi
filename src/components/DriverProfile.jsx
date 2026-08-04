import React, { useState } from 'react';
import { User, Phone, MapPin, ShoppingBag, ShieldCheck, LogOut, CheckCircle2, Clock, Edit3, Save, X, AlertCircle, Car, Plus, Trash2, Key } from 'lucide-react';
import { translations } from '../i18n/translations';
import { KZ_CITIES } from './DriverOnboarding';
import { safeParseJSON } from '../utils/security';

const GARAGE_KEY = 'partdrive_garage';

function loadGarage() {
  return safeParseJSON(localStorage.getItem(GARAGE_KEY), []);
}

function saveGarageToStorage(garage) {
  localStorage.setItem(GARAGE_KEY, JSON.stringify(garage));
}

export default function DriverProfile({ user, requests, lang, onLogout, onUpdateProfile }) {
  const t = translations[lang || 'ru'];

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || 'Талдыкорган');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Garage State
  const [garage, setGarage] = useState(() => loadGarage());
  const [showAddCar, setShowAddCar] = useState(false);
  const [newCarName, setNewCarName] = useState('');
  const [newCarVin, setNewCarVin] = useState('');

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

  const handleAddCar = () => {
    if (!newCarName.trim()) return;
    const newCar = {
      id: 'car-' + Date.now(),
      name: newCarName.trim(),
      vin: newCarVin.trim()
    };
    const updated = [newCar, ...garage];
    setGarage(updated);
    saveGarageToStorage(updated);
    setNewCarName('');
    setNewCarVin('');
    setShowAddCar(false);
  };

  const handleDeleteCar = (carId) => {
    const updated = garage.filter(c => c.id !== carId);
    setGarage(updated);
    saveGarageToStorage(updated);
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
                placeholder="Введите ваше имя"
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
                placeholder="+7 (7XX) XXX-XX-XX"
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

      {/* ====== MY GARAGE SECTION ====== */}
      <div className="card" style={{ border: '2px solid var(--primary-emerald)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 900, color: 'var(--dark-slate)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Car size={18} color="var(--primary-emerald)" />
            {lang === 'kz' ? '🚗 Менің Гаражым' : '🚗 Мой Гараж'}
          </h3>
          <button
            onClick={() => setShowAddCar(!showAddCar)}
            style={{
              background: 'var(--primary-emerald-light)',
              border: '1px solid var(--primary-emerald)',
              color: 'var(--primary-emerald)',
              padding: '6px 12px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Plus size={14} /> {showAddCar ? (lang === 'kz' ? 'Жабу' : 'Отмена') : (lang === 'kz' ? '+ Авто қосу' : '+ Добавить авто')}
          </button>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.4 }}>
          {lang === 'kz' ? 'Сақталған автокөліктер сұраныс формасында жылдам таңдаулы батырмалар ретінде шығады' : 'Сохранённые авто появятся в форме запроса как кнопки быстрого выбора — найти деталь можно за 3 секунды!'}
        </p>

        {/* Add Car Form */}
        {showAddCar && (
          <div style={{ background: '#F8FAFC', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px', marginBottom: '14px' }}>
            <div className="form-group">
              <label className="form-label">{lang === 'kz' ? 'Марка және үлгі (мысалы: Toyota Camry 40)' : 'Марка и модель (например: Toyota Camry 40)'}</label>
              <input
                type="text"
                className="form-input"
                value={newCarName}
                onChange={(e) => setNewCarName(e.target.value)}
                placeholder="Toyota Camry 40 / Geely Monjaro / BMW X5"
              />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label">{lang === 'kz' ? 'VIN-код (міндетті емес)' : 'VIN-код (необязательно)'}</label>
              <input
                type="text"
                className="form-input"
                value={newCarVin}
                onChange={(e) => setNewCarVin(e.target.value.toUpperCase())}
                placeholder="JTD... (необязательно)"
                maxLength={17}
                style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '1px' }}
              />
            </div>
            <button
              onClick={handleAddCar}
              className="btn-primary"
              disabled={!newCarName.trim()}
              style={{ padding: '10px', fontSize: '13px' }}
            >
              <Car size={16} /> {lang === 'kz' ? 'Гаражға қосу' : 'Добавить в Гараж'}
            </button>
          </div>
        )}

        {/* Garage Cars List */}
        {garage.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.5 }}>
            🚗 {lang === 'kz' ? 'Гаражда автокөлік жоқ. «+ Авто қосу» басыңыз!' : 'Гараж пустой. Нажмите «+ Добавить авто», чтобы сохранить ваши машины!'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {garage.map((car) => (
              <div key={car.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 14px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: 'var(--dark-slate)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Car size={15} color="var(--primary-emerald)" /> {car.name}
                  </div>
                  {car.vin && (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Key size={11} /> VIN: {car.vin}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteCar(car.id)}
                  style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#EF4444', padding: '6px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History of Requests */}
      <div className="card">
        <h3 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '14px', color: 'var(--dark-slate)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShoppingBag size={18} color="var(--primary-emerald)" />
          {lang === 'kz' ? 'Тапсырыстар тарихы' : 'История моих запросов'}
        </h3>

        {driverRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>
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

      {/* LOGOUT BUTTON */}
      <button
        onClick={onLogout}
        className="btn-secondary"
        style={{ color: '#EF4444', borderColor: '#FCA5A5', padding: '14px', background: '#FEF2F2', fontSize: '15px', fontWeight: 800 }}
      >
        <LogOut size={18} /> {lang === 'kz' ? 'Шығу' : 'Выйти'}
      </button>
    </div>
  );
}
