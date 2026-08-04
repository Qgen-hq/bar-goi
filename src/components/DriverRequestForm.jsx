import React, { useState, useEffect } from 'react';
import { Camera, Trash2, Sparkles, Send, CheckCircle2, AlertCircle, Wrench, Shield, Mic } from 'lucide-react';
import { autoClassify } from '../../server/classifier.js';
import { translations } from '../i18n/translations';
import VoiceInput from './VoiceInput';

export default function DriverRequestForm({ user, lang, onRequestSubmitted }) {
  const t = translations[lang || 'ru'];
  const [carModel, setCarModel] = useState('');
  const [partNeeded, setPartNeeded] = useState('');
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [liveClassification, setLiveClassification] = useState(null);

  useEffect(() => {
    if (carModel || partNeeded) {
      const res = autoClassify(carModel, partNeeded);
      setLiveClassification(res);
    } else {
      setLiveClassification(null);
    }
  }, [carModel, partNeeded]);

  const applyPreset = (car, part) => {
    setCarModel(car);
    setPartNeeded(part);
  };

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

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId: user?.id || 'usr-driver-1',
          driverPhone: user?.phone || '+7 701 111 22 33',
          carModel: carModel.trim(),
          partName: partNeeded.trim(),
          photos
        })
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok && data.success) {
        setSuccess(true);
        setCarModel('');
        setPartNeeded('');
        setPhotos([]);
        onRequestSubmitted(data.request);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const fallbackReq = {
          id: 'req-' + Date.now(),
          carModel: carModel.trim(),
          partNeeded: partNeeded.trim(),
          part_name: partNeeded.trim(),
          photos,
          origin: liveClassification?.origin?.id || 'Germany',
          category: liveClassification?.category?.id || 'Suspension',
          originInfo: liveClassification?.origin || { name: 'Германия' },
          categoryInfo: liveClassification?.category || { name: 'Подвеска' },
          expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          offers: []
        };
        setSuccess(true);
        setCarModel('');
        setPartNeeded('');
        setPhotos([]);
        onRequestSubmitted(fallbackReq);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setLoading(false);
      const fallbackReq = {
        id: 'req-' + Date.now(),
        carModel: carModel.trim(),
        partNeeded: partNeeded.trim(),
        part_name: partNeeded.trim(),
        photos,
        origin: liveClassification?.origin?.id || 'Germany',
        category: liveClassification?.category?.id || 'Suspension',
        originInfo: liveClassification?.origin || { name: 'Германия' },
        categoryInfo: liveClassification?.category || { name: 'Подвеска' },
        expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        offers: []
      };
      setSuccess(true);
      setCarModel('');
      setPartNeeded('');
      setPhotos([]);
      onRequestSubmitted(fallbackReq);
      setTimeout(() => setSuccess(false), 3000);
    }
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

        {/* 1-Click Test Presets */}
        <div style={{ marginTop: '14px' }}>
          <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>
            Быстро запустить примери:
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button type="button" onClick={() => applyPreset('BMW X5 2010', 'Рулевая рейка')} className="preset-pill">
              BMW X5 - Рейка
            </button>
            <button type="button" onClick={() => applyPreset('Toyota Camry 40', 'Помпа водяная')} className="preset-pill">
              Camry 40 - Помпа
            </button>
            <button type="button" onClick={() => applyPreset('Haval F7 2021', 'Передний бампер')} className="preset-pill">
              Haval F7 - Бампер
            </button>
          </div>
        </div>
      </div>

      {success && (
        <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', color: '#065F46', padding: '14px', borderRadius: '14px', marginBottom: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
          <CheckCircle2 size={20} /> {t.tenderCreatedSuccess}
        </div>
      )}

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '14px', borderRadius: '14px', marginBottom: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
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
