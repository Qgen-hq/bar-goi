import React, { useState } from 'react';
import { Send, Camera, Sparkles, CheckCircle2, AlertCircle, Trash2, Shield, Mic, Car } from 'lucide-react';
import { autoClassify, CAR_ORIGINS, PART_CATEGORIES } from '../../server/classifier.js';
import { translations } from '../i18n/translations';
import VoiceInput from './VoiceInput';

const POPULAR_GARAGE_CARS = [
  { name: 'Geely Monjaro 2023', origin: 'China' },
  { name: 'Toyota Camry 40 2.4L', origin: 'Japan' },
  { name: 'Changan CS75 Plus', origin: 'China' },
  { name: 'Hyundai Tucson 2021', origin: 'Korea' },
  { name: 'BMW X5 E70 3.0', origin: 'Germany' }
];

export default function DriverRequestForm({ user, lang, onRequestSubmitted }) {
  const t = translations[lang || 'ru'];

  const [carModel, setCarModel] = useState('');
  const [partNeeded, setPartNeeded] = useState('');
  const [photos, setPhotos] = useState([]);
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const classified = autoClassify(carModel, partNeeded);
  const countryObj = classified.origin || CAR_ORIGINS.Germany;
  const categoryObj = classified.category || PART_CATEGORIES.Suspension;

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 3) {
      setError(lang === 'kz' ? 'Ең көбі 3 фото жүктеуге болады' : 'Максимум 3 фотографии');
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, reader.result].slice(0, 3));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!carModel.trim() || !partNeeded.trim()) {
      setError(lang === 'kz' ? 'Көлік маркасы мен бөлшекті көрсетіңіз' : 'Заполните марку авто и наименование запчасти');
      return;
    }

    setError('');
    setSubmitting(true);

    const payload = {
      id: 'req-' + Date.now(),
      driverPhone: user?.phone || '+7 701 111 22 33',
      driver_phone: user?.phone || '+7 701 111 22 33',
      carModel: carModel.trim(),
      car_model: carModel.trim(),
      partNeeded: partNeeded.trim(),
      part_name: partNeeded.trim(),
      photos,
      origin: countryObj.id,
      category: categoryObj.id,
      detected_country: countryObj.id,
      detected_category: categoryObj.id,
      originInfo: countryObj,
      categoryInfo: categoryObj,
      city: user?.city || 'Талдыкорган',
      createdAgo: 'Только что'
    };

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setSubmitting(false);

      if (res.ok && data.success) {
        onRequestSubmitted(data.request || payload);
      } else {
        onRequestSubmitted(payload);
      }
    } catch (err) {
      setSubmitting(false);
      onRequestSubmitted(payload);
    }
  };

  return (
    <div className="card" style={{ boxShadow: 'var(--shadow-md)', border: '2px solid var(--primary-emerald)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--primary-emerald-light)', color: 'var(--primary-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={22} />
        </div>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--dark-slate)' }}>
            {t.smartSearchTitle}
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {t.smartSearchDesc}
          </p>
        </div>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '10px 14px', borderRadius: '12px', marginBottom: '14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* CAR MODEL FIELD + MY GARAGE PRESET BADGES */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>
              {t.carModelLabel}
            </label>

            <VoiceInput
              lang={lang}
              onTranscript={(txt) => setCarModel(txt)}
            />
          </div>

          <input
            type="text"
            className="form-input"
            value={carModel}
            onChange={(e) => setCarModel(e.target.value)}
            placeholder={t.carModelPlaceholder}
            required
          />

          {/* 1-TAP "MY GARAGE" CAR PRESETS */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginTop: '8px', paddingBottom: '4px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 800, alignSelf: 'center', whiteSpace: 'nowrap' }}>
              🚗 {lang === 'kz' ? 'Тез таңдау:' : 'Быстрый выбор:'}
            </span>
            {POPULAR_GARAGE_CARS.map(c => (
              <button
                key={c.name}
                type="button"
                onClick={() => setCarModel(c.name)}
                style={{
                  background: carModel === c.name ? 'var(--primary-emerald-light)' : '#F1F5F9',
                  border: carModel === c.name ? '1px solid var(--primary-emerald)' : '1px solid var(--border-color)',
                  color: carModel === c.name ? 'var(--primary-emerald)' : '#475569',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease'
                }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* PART NEEDED FIELD + VOICE INPUT */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>
              {t.partNameLabel}
            </label>

            <VoiceInput
              lang={lang}
              onTranscript={(txt) => setPartNeeded(txt)}
            />
          </div>

          <input
            type="text"
            className="form-input"
            value={partNeeded}
            onChange={(e) => setPartNeeded(e.target.value)}
            placeholder={t.partNeededPlaceholder}
            required
          />
        </div>

        {/* AUTO-CLASSIFIER DETECTED BADGE */}
        {(carModel || partNeeded) && (
          <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: '#fff', padding: '12px 14px', borderRadius: '14px', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>
              ⚡ {t.detectedBanner}
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', background: 'var(--primary-emerald)', color: '#fff', padding: '3px 10px', borderRadius: '12px', fontWeight: 800 }}>
                {t.detectedCountry}: {t['country' + countryObj.id] || countryObj.name}
              </span>
              <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '3px 10px', borderRadius: '12px', fontWeight: 800 }}>
                {t.detectedCategory}: {t['cat' + categoryObj.id] || categoryObj.name}
              </span>
            </div>
          </div>
        )}

        {/* PHOTOS ATTACHMENT */}
        <div className="form-group">
          <label className="form-label">{t.photosLabel}</label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {photos.map((src, index) => (
              <div key={index} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <img src={src} alt="Part" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', color: '#fff', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}

            {photos.length < 3 && (
              <label style={{ width: '80px', height: '80px', borderRadius: '12px', border: '2px dashed #CBD5E1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#F8FAFC', color: 'var(--text-muted)' }}>
                <Camera size={20} />
                <span style={{ fontSize: '10px', marginTop: '2px', fontWeight: 700 }}>+ Фото</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              </label>
            )}
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={submitting} style={{ padding: '14px', fontSize: '16px' }}>
          <Send size={18} /> {submitting ? 'Опубликование...' : t.publishTenderBtn}
        </button>
      </form>
    </div>
  );
}
