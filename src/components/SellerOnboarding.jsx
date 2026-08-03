import React, { useState } from 'react';
import { Store, Globe, CheckSquare, Square, Save, CheckCircle2, Camera, Trash2, MapPin, AlertCircle, ArrowLeft } from 'lucide-react';
import { CAR_ORIGINS, PART_CATEGORIES } from '../../server/classifier.js';
import { translations } from '../i18n/translations';

const MARKETS_LIST = [
  'Талдыкорган - Центральный авторынок',
  'Талдыкорган - ТД Автомиг',
  'Талдыкорган - Авторынок Жетысу',
  'Алматы - Car City (Кар Сити)',
  'Алматы - ТД Баянауыл',
  'Астана - Авторынок Коктал',
  'Шымкент - Авторынок Жибек Жолы'
];

export default function SellerOnboarding({ user, shop, lang, onSaveShop, onBackToFeed }) {
  const t = translations[lang || 'ru'];

  const [shopName, setShopName] = useState(shop?.shop_name || shop?.shopName || 'German Parts (Бутик #42)');
  const [city, setCity] = useState(shop?.city || 'Талдыкорган');
  const [marketName, setMarketName] = useState(shop?.market_name || shop?.marketName || MARKETS_LIST[0]);
  const [boothNumber, setBoothNumber] = useState(shop?.booth_number || shop?.boothNumber || '2-й ряд, бутик 42');
  const [whatsapp, setWhatsapp] = useState(shop?.whatsapp_phone || shop?.whatsapp || shop?.phone || '+7 777 999 88 77');
  const [storefrontPhoto, setStorefrontPhoto] = useState(
    shop?.photo_url || shop?.storefrontPhoto || 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=400&q=80'
  );
  
  const [countries, setCountries] = useState(shop?.countries || ['Germany', 'Japan']);
  const [categories, setCategories] = useState(shop?.categories || ['Engine', 'Suspension', 'Brakes', 'Electrical', 'Optics']);
  
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState('');

  const toggleCountry = (id) => {
    setCountries(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const toggleCategory = (id) => {
    setCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStorefrontPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shopName.trim() || !whatsapp.trim() || !boothNumber.trim() || !storefrontPhoto) {
      setError(lang === 'kz' ? 'Барлық өрістерді толтырыңыз' : 'Заполните название магазина, фото фасада и точный номер бутика');
      return;
    }

    setError('');
    setSaving(true);

    const fallbackShop = {
      user_id: user?.id || 'usr-seller-1',
      shop_name: shopName.trim(),
      shopName: shopName.trim(),
      city,
      market_name: marketName,
      marketName,
      booth_number: boothNumber.trim(),
      boothNumber: boothNumber.trim(),
      photo_url: storefrontPhoto,
      storefrontPhoto,
      whatsapp_phone: whatsapp,
      whatsapp,
      countries,
      categories,
      rating: shop?.rating || 5.0,
      reviews_count: shop?.reviews_count || 12
    };

    try {
      const res = await fetch('/api/auth/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 'usr-seller-1',
          role: 'seller',
          sellerData: {
            shopName: shopName.trim(),
            city,
            marketName,
            boothNumber: boothNumber.trim(),
            storefrontPhoto,
            whatsappPhone: whatsapp,
            countries,
            categories
          }
        })
      });
      const data = await res.json();
      setSaving(false);

      if (res.ok && data.success) {
        setSavedSuccess(true);
        onSaveShop(data.sellerProfile || fallbackShop);
        if (onBackToFeed) onBackToFeed();
      } else {
        setSavedSuccess(true);
        onSaveShop(fallbackShop);
        if (onBackToFeed) onBackToFeed();
      }
    } catch (err) {
      setSaving(false);
      setSavedSuccess(true);
      onSaveShop(fallbackShop);
      if (onBackToFeed) onBackToFeed();
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Back Button & Title Card */}
      <div style={{ background: 'var(--dark-slate)', color: '#fff', padding: '20px', borderRadius: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Store size={22} style={{ color: 'var(--primary-emerald)' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 800 }}>{t.sellerOnboardTitle}</h2>
          </div>

          {onBackToFeed && (
            <button
              type="button"
              onClick={onBackToFeed}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#6EE7B7',
                padding: '6px 14px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ArrowLeft size={16} /> {lang === 'kz' ? 'Сұраныстарға қайту' : 'Назад к запросам'}
            </button>
          )}
        </div>
        <p style={{ fontSize: '12px', color: '#94A3B8' }}>
          {t.sellerOnboardDesc}
        </p>
      </div>

      {savedSuccess && (
        <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', color: '#065F46', padding: '12px', borderRadius: '12px', marginBottom: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} /> {t.shopSavedSuccess}
        </div>
      )}

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '12px', borderRadius: '12px', marginBottom: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="card">
          <h3 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '12px', color: 'var(--dark-slate)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={16} color="var(--primary-emerald)" /> 1. Фото бутику & Локация (2GIS)
          </h3>

          <div className="form-group">
            <label className="form-label">{t.boothPhotoLabel}</label>
            {storefrontPhoto ? (
              <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', marginBottom: '10px' }}>
                <img src={storefrontPhoto} alt="Storefront" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={() => setStorefrontPhoto('')}
                  style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', color: '#fff', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <label style={{ width: '100%', height: '100px', borderRadius: '12px', border: '2px dashed #CBD5E1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#F8FAFC', color: 'var(--text-muted)' }}>
                <Camera size={26} />
                <span style={{ fontSize: '12px', marginTop: '4px', fontWeight: 700 }}>{t.uploadPhotoBtn}</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              </label>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">{t.shopNameLabel}</label>
            <input
              type="text"
              className="form-input"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="Например: German Parts (Бутик #42)"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t.selectMarketLabel}</label>
            <select
              className="form-select"
              value={marketName}
              onChange={(e) => setMarketName(e.target.value)}
            >
              {MARKETS_LIST.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">{t.boothNumberLabel}</label>
            <input
              type="text"
              className="form-input"
              value={boothNumber}
              onChange={(e) => setBoothNumber(e.target.value)}
              placeholder="Например: 2-й ряд, бутик 45"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{t.whatsappLabel}</label>
            <input
              type="text"
              className="form-input"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+7 7XX XXX XX XX"
              required
            />
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '6px', color: 'var(--dark-slate)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Globe size={16} /> {t.countriesTitle}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {Object.values(CAR_ORIGINS).map(origin => {
              const selected = countries.includes(origin.id);
              const label = t['country' + origin.id] || origin.name;
              return (
                <div
                  key={origin.id}
                  onClick={() => toggleCountry(origin.id)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: selected ? '2px solid var(--primary-emerald)' : '1px solid var(--border-color)',
                    background: selected ? 'var(--primary-emerald-light)' : '#F8FAFC',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontWeight: 700,
                    fontSize: '13px',
                    color: selected ? 'var(--dark-slate)' : 'var(--text-muted)'
                  }}
                >
                  <span>{label}</span>
                  {selected ? <CheckSquare size={16} color="var(--primary-emerald)" /> : <Square size={16} color="#CBD5E1" />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '6px', color: 'var(--dark-slate)' }}>
            {t.categoriesTitle}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {Object.values(PART_CATEGORIES).map(cat => {
              const selected = categories.includes(cat.id);
              const label = t['cat' + cat.id] || cat.name;
              return (
                <div
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: selected ? '2px solid var(--primary-emerald)' : '1px solid var(--border-color)',
                    background: selected ? 'var(--primary-emerald-light)' : '#F8FAFC',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontWeight: 700,
                    fontSize: '12px',
                    color: selected ? 'var(--dark-slate)' : 'var(--text-muted)'
                  }}
                >
                  <span>{label}</span>
                  {selected ? <CheckSquare size={16} color="var(--primary-emerald)" /> : <Square size={16} color="#CBD5E1" />}
                </div>
              );
            })}
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={saving}>
          <Save size={18} /> {saving ? 'Сохранение...' : t.saveShopBtn}
        </button>
      </form>
    </div>
  );
}
