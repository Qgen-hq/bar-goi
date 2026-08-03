import React, { useState } from 'react';
import BottomSheet from './BottomSheet';
import { Star, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { translations } from '../i18n/translations';

export default function ReviewModal({ isOpen, onClose, shop, driverPhone, lang, onReviewSubmitted }) {
  const t = translations[lang || 'ru'];
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!shop) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setError('Выберите оценку от 1 до 5 звезд');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId: shop.shopId || shop.id,
          driverPhone,
          rating,
          text
        })
      });
      const data = await res.json();
      setSubmitting(false);

      if (res.ok && data.success) {
        setSuccess(true);
        onReviewSubmitted(data.updatedShop, data.review);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1500);
      } else {
        setError(data.error || 'Ошибка сохранения отзыва');
      }
    } catch (err) {
      setSubmitting(false);
      setError('Не удалось подключиться к серверу');
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={t.reviewModalTitle}>
      <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '12px', marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--dark-slate)' }}>
          🏪 {shop.shopName}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
          📍 {shop.marketName} ({shop.boothNumber})
        </div>
      </div>

      {success && (
        <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', color: '#065F46', padding: '12px', borderRadius: '12px', marginBottom: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} /> {t.reviewSuccessMsg}
        </div>
      )}

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '10px', borderRadius: '10px', fontSize: '12px', marginBottom: '14px' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* 1-5 Star Interactive Selector */}
        <div className="form-group" style={{ textAlign: 'center', marginBottom: '20px' }}>
          <label className="form-label" style={{ marginBottom: '10px' }}>{t.ratingLabel}</label>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
            {[1, 2, 3, 4, 5].map((star) => {
              const active = (hoverRating || rating) >= star;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transform: active ? 'scale(1.15)' : 'scale(1)',
                    transition: 'transform 0.15s ease',
                    padding: '4px'
                  }}
                >
                  <Star
                    size={36}
                    fill={active ? '#EAB308' : 'none'}
                    color={active ? '#EAB308' : '#CBD5E1'}
                  />
                </button>
              );
            })}
          </div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--dark-slate)', marginTop: '6px' }}>
            {rating} / 5 ★
          </div>
        </div>

        {/* Short Text Review Input */}
        <div className="form-group">
          <label className="form-label">{t.reviewTextLabel}</label>
          <textarea
            rows={3}
            className="form-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.reviewPlaceholder}
          />
        </div>

        <button type="submit" className="btn-primary" disabled={submitting}>
          <Send size={16} /> {submitting ? 'Сохранение...' : t.submitReviewBtn}
        </button>
      </form>
    </BottomSheet>
  );
}
