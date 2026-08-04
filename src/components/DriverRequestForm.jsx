import React, { useState, useEffect } from 'react';
import { Camera, Trash2, Sparkles, Send, CheckCircle2, AlertCircle, Mic, Car, Bell, MessageSquare } from 'lucide-react';
import { autoClassify } from '../../server/classifier.js';
import { translations } from '../i18n/translations';
import VoiceInput from './VoiceInput';
import { safeParseJSON, safeWhatsAppUrl } from '../utils/security';
import { supabase } from '../lib/supabase';

const GARAGE_KEY = 'partdrive_garage';

export default function DriverRequestForm({ user, lang, onRequestSubmitted }) {
  const t = translations[lang || 'ru'];
  const [carModel, setCarModel] = useState('');
  const [partNeeded, setPartNeeded] = useState('');
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [liveClassification, setLiveClassification] = useState(null);

  // Load garage cars saved by user
  const [garageCars, setGarageCars] = useState(() => safeParseJSON(localStorage.getItem(GARAGE_KEY), []));

  useEffect(() => {
    if (carModel || partNeeded) {
      const res = autoClassify(carModel, partNeeded);
      setLiveClassification(res);
    } else {
      setLiveClassification(null);
    }
  }, [carModel, partNeeded]);

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 3) {
      setError('Максимум 3 фото / Ең көбі 3 фото');
      return;
    }
    setError('');

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
      setError('Марканы және бөлшекті көрсетіңіз');
      return;
    }
    setError('');
    setLoading(true);

    const classification = liveClassification || autoClassify(carModel.trim(), partNeeded.trim());
    const requestRecord = {
      id: 'req-' + Date.now(),
      driver_id: user?.id || 'anonymous',
      driver_phone: user?.phone || '',
      car_model: carModel.trim(),
      part_name: partNeeded.trim(),
      photos: photos,
      detected_country: classification?.origin?.id || 'Unknown',
      detected_category: classification?.category?.id || 'Other',
      status: 'active',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString()
    };

    // Save directly to Supabase — syncs across ALL devices instantly
    const { data: saved, error: supaErr } = await supabase
      .from('requests')
      .insert(requestRecord)
      .select()
      .single();

    setLoading(false);

    const submittedReq = {
      ...(saved || requestRecord),
      car_model: requestRecord.car_model,
      carModel: requestRecord.car_model,
      partNeeded: requestRecord.part_name,
      part_name: requestRecord.part_name,
      originInfo: classification?.origin || { name: 'Неизвестно' },
      categoryInfo: classification?.category || { name: 'Другое' },
      offers: []
    };

    if (supaErr) console.error('Supabase insert error:', supaErr.message);

    setSuccess(true);
    setCarModel('');
    setPartNeeded('');
    setPhotos([]);
    onRequestSubmitted(submittedReq);
    setTimeout(() => { setSuccess(false); }, 4000);
  };

  return (
    <div style={{ position: 'sticky', top: '90px' }}>
      {/* Header Title Card */}
      <div style={{ background: 'var(--dark-slate)', color: '#fff', padding: '20px', borderRadius: 'var(--radius-lg)', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <Sparkles size={22} color="var(--primary-emerald)" />
          <h2 style={{ fontSize: '18px', fontWeight: 800 }}>{t.smartSearchTitle}</h2>
        </div>
        <p style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.4 }}>
          {t.smartSearchDesc}
        </p>
      </div>

      {success && (
        <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', color: '#065F46', padding: '14px', borderRadius: '14px', marginBottom: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
          <CheckCircle2 size={20} /> {lang === 'kz' ? 'Сұраныс жарияланды! Бутиктердің лентасында пайда болды.' : 'Запрос успешно создан и опубликован в ленте бутиков!'}
        </div>
      )}

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '14px', borderRadius: '14px', marginBottom: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
        {/* My Garage Quick-Select Pills */}
        {garageCars.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Car size={12} /> {lang === 'kz' ? '🚗 Менің Гаражым — жылдам таңдау:' : '🚗 Мой Гараж — выбор авто за 1 клик:'}
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {garageCars.map(car => (
                <button
                  key={car.id}
                  type="button"
                  onClick={() => setCarModel(car.name)}
                  style={{
                    background: carModel === car.name ? 'var(--primary-emerald-light)' : '#F1F5F9',
                    border: carModel === car.name ? '1.5px solid var(--primary-emerald)' : '1px solid var(--border-color)',
                    color: carModel === car.name ? 'var(--primary-emerald)' : '#475569',
                    padding: '5px 12px',
                    borderRadius: '14px',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Car size={11} /> {car.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>{t.carModelLabel}</label>
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
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>{t.partNameLabel}</label>
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

        {/* AI Classifier Live Result Banner */}
        {liveClassification && (
          <div style={{ background: 'var(--primary-emerald-light)', border: '1.5px solid #A7F3D0', padding: '12px 16px', borderRadius: '14px', marginBottom: '18px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} /> {t.detectedBanner}
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ background: '#FFFFFF', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, color: 'var(--dark-slate)', border: '1px solid #6EE7B7' }}>
                {t.detectedCountry}: {t['country' + liveClassification.origin.id] || liveClassification.origin.name}
              </span>
              <span style={{ background: '#FFFFFF', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, color: 'var(--dark-slate)', border: '1px solid #6EE7B7' }}>
                {t.detectedCategory}: {t['cat' + liveClassification.category.id] || liveClassification.category.name}
              </span>
            </div>
          </div>
        )}

        {/* Photo Upload Box */}
        <div className="form-group">
          <label className="form-label">{t.photosLabel}</label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {photos.map((url, idx) => (
              <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <img src={url} alt="Part" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={() => removePhoto(idx)}
                  style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', color: '#fff', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}

            {photos.length < 3 && (
              <label style={{ width: '80px', height: '80px', borderRadius: '12px', border: '2px dashed #CBD5E1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#F8FAFC', color: 'var(--text-muted)' }}>
                <Camera size={24} />
                <span style={{ fontSize: '10px', marginTop: '4px', fontWeight: 700 }}>+ Фото</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{ display: 'none' }}
                  multiple
                />
              </label>
            )}
          </div>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          Срок хранения запроса: <b>24 часа</b>
        </div>

        <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '16px', fontSize: '16px' }}>
          <Send size={18} /> {loading ? '...' : t.publishTenderBtn}
        </button>
      </form>
    </div>
  );
}
