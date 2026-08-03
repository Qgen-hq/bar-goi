import React, { useState } from 'react';
import { ShoppingBag, CheckCircle2, Clock, Send, Store, AlertCircle, MapPin, Shield, Plus, Trash2, Mic, UserCheck, MessageSquare } from 'lucide-react';
import ConditionBadge from './ConditionBadge';
import BottomSheet from './BottomSheet';
import SellerMyOffers from './SellerMyOffers';
import { translations } from '../i18n/translations';
import VoiceInput from './VoiceInput';

// Sample Requests Feed for Seller
const SAMPLE_SELLER_FEED = [
  {
    id: 'req-seller-demo-1',
    carModel: 'Geely Monjaro 2023',
    car_model: 'Geely Monjaro 2023',
    partNeeded: 'Бензонасос в сборе 2.0T',
    part_name: 'Бензонасос в сборе 2.0T',
    photos: ['https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80'],
    origin: 'China',
    category: 'Engine',
    originInfo: { name: 'Китай' },
    categoryInfo: { name: 'Двигатель и Топливная' },
    driverPhone: '+7 777 999 88 77',
    createdAgo: '10 мин назад'
  },
  {
    id: 'req-seller-demo-2',
    carModel: 'BMW X5 E70 2010',
    car_model: 'BMW X5 E70 2010',
    partNeeded: 'Рулевая рейка гидравлическая',
    part_name: 'Рулевая рейка гидравлическая',
    photos: [],
    origin: 'Germany',
    category: 'Suspension',
    originInfo: { name: 'Германия' },
    categoryInfo: { name: 'Подвеска и Рулевое' },
    driverPhone: '+7 705 555 44 33',
    createdAgo: '25 мин назад'
  },
  {
    id: 'req-seller-demo-3',
    carModel: 'Toyota Camry 40 2008',
    car_model: 'Toyota Camry 40 2008',
    partNeeded: 'Помпа водяная охлаждения 2.4L',
    part_name: 'Помпа водяная охлаждения 2.4L',
    photos: [],
    origin: 'Japan',
    category: 'Engine',
    originInfo: { name: 'Япония' },
    categoryInfo: { name: 'Двигатель' },
    driverPhone: '+7 747 123 45 67',
    createdAgo: '45 мин назад'
  }
];

export default function SellerTendersFeed({ shop, requests, lang, onSubmitOffer, onOpenShopSetup }) {
  const t = translations[lang || 'ru'];

  const [sellerSubTab, setSellerSubTab] = useState('feed'); // 'feed' | 'offers_history'
  const [activeTenderForOffer, setActiveTenderForOffer] = useState(null);
  
  // Up to 3 brand/price variants
  const [variants, setVariants] = useState([
    { brand: 'Geely Genuine (Оригинал)', price: '', condition: 'New Original' }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const displayRequests = (requests && requests.length > 0) ? requests : SAMPLE_SELLER_FEED;

  const handleOpenOfferSheet = (tender) => {
    if (!shop) {
      onOpenShopSetup();
      return;
    }
    setActiveTenderForOffer(tender);
    
    const origin = tender.origin || tender.detected_country;
    let initialBrand = 'Оригинал';
    if (origin === 'China') initialBrand = 'Geely Genuine (Оригинал)';
    else if (origin === 'Germany') initialBrand = 'BMW Genuine / TRW';
    else if (origin === 'Japan') initialBrand = 'Denso / Toyota Genuine';

    setVariants([
      { brand: initialBrand, price: '', condition: 'New Original' }
    ]);

    setError('');
  };

  const addVariant = () => {
    if (variants.length >= 3) {
      setError(lang === 'kz' ? 'Ең көбі 3 нұсқа қосуға болады' : 'Максимум 3 варианта детали');
      return;
    }
    setError('');
    setVariants(prev => [
      ...prev,
      { brand: prev.length === 1 ? 'Дубликат (Bosch/Depo)' : 'Б/У Оригинал', price: '', condition: prev.length === 1 ? 'New Aftermarket' : 'Used' }
    ]);
  };

  const removeVariant = (index) => {
    if (variants.length <= 1) return;
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  const updateVariant = (index, field, value) => {
    setVariants(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v));
  };

  const handleSendOfferSubmit = async (e) => {
    e.preventDefault();
    
    for (let i = 0; i < variants.length; i++) {
      if (!variants[i].brand.trim()) {
        setError(lang === 'kz' ? `${i + 1}-нұсқаның маркасын көрсетіңіз` : `Укажите бренд в варианте №${i + 1}`);
        return;
      }
      if (!variants[i].price || Number(variants[i].price) <= 0) {
        setError(lang === 'kz' ? `${i + 1}-нұсқаның бағасын көрсетіңіз (₸)` : `Укажите цену в варианте №${i + 1}`);
        return;
      }
    }

    setError('');
    setSubmitting(true);

    const firstVariant = variants[0];
    const offerPayload = {
      id: 'off-' + Date.now(),
      requestId: activeTenderForOffer.id,
      request_id: activeTenderForOffer.id,
      sellerId: shop?.user_id || 'usr-seller-1',
      seller_id: shop?.user_id || 'usr-seller-1',
      shopName: shop?.shop_name || shop?.shopName || 'German Parts (Бутик #42)',
      shop_name: shop?.shop_name || shop?.shopName || 'German Parts (Бутик #42)',
      marketName: shop?.market_name || shop?.marketName || 'Талдыкорган - Центральный авторынок',
      market_name: shop?.market_name || shop?.marketName || 'Талдыкорган - Центральный авторынок',
      boothNumber: shop?.booth_number || shop?.boothNumber || '2-й ряд, бутик 42',
      booth_number: shop?.booth_number || shop?.boothNumber || '2-й ряд, бутик 42',
      whatsapp: shop?.whatsapp_phone || shop?.whatsapp || '77779998877',
      whatsapp_phone: shop?.whatsapp_phone || shop?.whatsapp || '77779998877',
      rating: shop?.rating || 4.9,
      reviewsCount: shop?.reviews_count || 12,
      reviews_count: shop?.reviews_count || 12,
      condition: firstVariant.condition,
      brand: firstVariant.brand.trim(),
      price: Number(firstVariant.price),
      variants: variants.map(v => ({
        brand: v.brand.trim(),
        price: Number(v.price),
        condition: v.condition
      }))
    };

    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offerPayload)
      });
      const data = await res.json();
      setSubmitting(false);

      if (res.ok && data.success) {
        setSuccess(true);
        onSubmitOffer(activeTenderForOffer.id, data.offer || offerPayload);
        setTimeout(() => {
          setSuccess(false);
          setActiveTenderForOffer(null);
        }, 1500);
      } else {
        setSuccess(true);
        onSubmitOffer(activeTenderForOffer.id, offerPayload);
        setTimeout(() => {
          setSuccess(false);
          setActiveTenderForOffer(null);
        }, 1500);
      }
    } catch (err) {
      setSubmitting(false);
      setSuccess(true);
      onSubmitOffer(activeTenderForOffer.id, offerPayload);
      setTimeout(() => {
        setSuccess(false);
        setActiveTenderForOffer(null);
      }, 1500);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Seller Header Dashboard Card */}
      <div style={{ background: 'var(--dark-slate)', color: '#fff', padding: '24px', borderRadius: 'var(--radius-lg)', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Store size={22} style={{ color: 'var(--primary-emerald)' }} />
              <h2 style={{ fontSize: '20px', fontWeight: 900 }}>
                {shop?.shop_name || shop?.shopName || 'Ваш Автобутик'}
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px' }}>
              📍 {shop?.market_name || shop?.marketName || 'Талдыкорган - Авторынок'} ({shop?.booth_number || shop?.boothNumber || 'Бутик #42'})
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setIsOnline(!isOnline)}
              style={{
                background: isOnline ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                border: isOnline ? '1px solid #10B981' : '1px solid #EF4444',
                color: isOnline ? '#34D399' : '#F87171',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isOnline ? '#10B981' : '#EF4444' }} />
              {isOnline ? (lang === 'kz' ? 'В сети (Сұраныстар түсуде)' : 'В сети (Принимаю запросы)') : (lang === 'kz' ? 'Офлайн' : 'Офлайн')}
            </button>

            <button
              onClick={onOpenShopSetup}
              className="btn-secondary"
              style={{ width: 'auto', padding: '8px 14px', fontSize: '12px' }}
            >
              ⚙️ Настройки
            </button>
          </div>
        </div>

        {/* TOP SELLER SUB-TAB NAVIGATION BAR */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={() => setSellerSubTab('feed')}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '12px',
              border: 'none',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: sellerSubTab === 'feed' ? 'var(--primary-emerald)' : 'rgba(255,255,255,0.08)',
              color: sellerSubTab === 'feed' ? '#FFFFFF' : '#94A3B8'
            }}
          >
            <ShoppingBag size={16} />
            <span>{lang === 'kz' ? 'Лента сұраныстары' : 'Лента запросов'}</span>
          </button>

          <button
            onClick={() => setSellerSubTab('offers_history')}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '12px',
              border: 'none',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: sellerSubTab === 'offers_history' ? 'var(--primary-emerald)' : 'rgba(255,255,255,0.08)',
              color: sellerSubTab === 'offers_history' ? '#FFFFFF' : '#94A3B8'
            }}
          >
            <MessageSquare size={16} />
            <span>{lang === 'kz' ? 'Мои ответы и клиенты' : 'Мои ответы и клиенты'}</span>
          </button>
        </div>
      </div>

      {/* RENDER SUB-TAB 2: SELLER MY OFFERS AND CLIENT LEADS */}
      {sellerSubTab === 'offers_history' ? (
        <SellerMyOffers shop={shop} lang={lang} />
      ) : (
        /* RENDER SUB-TAB 1: REQUESTS FEED */
        <div>
          {/* Tender Feed Title */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--dark-slate)' }}>
                {lang === 'kz' ? 'Автобөлшектерге сұраныстар ағыны' : 'Лента запросов на автозапчасти'}
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {lang === 'kz' ? 'Сатып алушыларға 1-3 баға нұсқасын ұсынып, WhatsApp-қа клиент алыңыз' : 'Отправляйте варианты цен (до 3 марок) и получайте клиентов напрямую'}
              </p>
            </div>
          </div>

          {/* Tenders Cards Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {displayRequests.map((tender, index) => {
              const carTitle = tender.carModel || tender.car_model || 'Автомобиль';
              const partTitle = tender.partNeeded || tender.part_name || 'Автозапчасть';
              const uniqueKey = tender.id ? `${tender.id}-${index}` : `seller-tender-${index}`;
              
              return (
                <div key={uniqueKey} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary-emerald)', background: 'var(--primary-emerald-light)', padding: '3px 10px', borderRadius: '12px' }}>
                        {t['country' + (tender.origin || tender.detected_country)] || tender.originInfo?.name || tender.origin || 'Импорт'}
                      </span>
                      <h3 style={{ fontSize: '19px', fontWeight: 900, color: 'var(--dark-slate)', margin: '6px 0 2px 0' }}>
                        {carTitle}
                      </h3>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#334155' }}>
                        Деталь: {partTitle}
                      </div>
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', background: '#F1F5F9', padding: '4px 10px', borderRadius: '10px' }}>
                      <Clock size={14} /> {tender.createdAgo || 'Новый'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '12px', background: '#F1F5F9', padding: '4px 10px', borderRadius: '14px', color: '#475569', fontWeight: 700 }}>
                      Категория: {t['cat' + (tender.category || tender.detected_category)] || tender.categoryInfo?.name || tender.category || 'Запчасть'}
                    </span>
                    <span style={{ fontSize: '12px', background: '#F1F5F9', padding: '4px 10px', borderRadius: '14px', color: '#475569', fontWeight: 700 }}>
                      Водитель: {tender.driverPhone || tender.driver_phone || '+7 7XX XXX XX XX'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenOfferSheet(tender)}
                    className="btn-primary"
                    style={{ fontSize: '15px', padding: '14px' }}
                  >
                    <Send size={18} /> {lang === 'kz' ? 'Баға нұсқаларын ұсыну (1-3 марка)' : 'Указать варианты марок и цен (до 3)'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Multi-Variant Offer Submission Bottom Sheet */}
      {activeTenderForOffer && (
        <BottomSheet
          isOpen={!!activeTenderForOffer}
          onClose={() => setActiveTenderForOffer(null)}
          title={lang === 'kz' ? 'Бөлшек маркасы мен баға нұсқалары' : 'Предложение марок и цен (до 3 вариантов)'}
        >
          <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '14px', marginBottom: '18px', border: '1.5px solid var(--border-color)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {lang === 'kz' ? 'Сатып алушының сұранысы:' : 'Запрос водителя:'}
            </div>
            <div style={{ fontSize: '16px', fontWeight: 900, color: 'var(--dark-slate)', marginTop: '2px' }}>
              {(activeTenderForOffer.carModel || activeTenderForOffer.car_model || 'Авто')} — {(activeTenderForOffer.partNeeded || activeTenderForOffer.part_name || 'Деталь')}
            </div>
          </div>

          {success && (
            <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', color: '#065F46', padding: '12px', borderRadius: '12px', marginBottom: '14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}>
              <CheckCircle2 size={18} /> {lang === 'kz' ? 'Ұсыныс сәтті жіберілді!' : 'Предложение успешно отправлено водителю!'}
            </div>
          )}

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '12px', borderRadius: '12px', marginBottom: '14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSendOfferSubmit}>
            {/* Dynamic Multi-Variant Fields */}
            {variants.map((v, index) => (
              <div key={index} style={{ background: '#FFFFFF', border: '1.5px solid var(--border-color)', padding: '16px', borderRadius: '16px', marginBottom: '14px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary-emerald)', background: 'var(--primary-emerald-light)', padding: '3px 10px', borderRadius: '10px' }}>
                    {lang === 'kz' ? `${index + 1}-нұсқа` : `Вариант №${index + 1}`}
                  </span>

                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700 }}
                    >
                      <Trash2 size={14} /> {lang === 'kz' ? 'Жою' : 'Удалить'}
                    </button>
                  )}
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>
                      <Shield size={14} style={{ display: 'inline', marginRight: '4px', color: 'var(--primary-emerald)' }} />
                      {lang === 'kz' ? 'Бөлшек маркасы / Бренд' : 'Марка / Бренд запчасти'}
                    </label>

                    <VoiceInput
                      lang={lang}
                      onTranscript={(txt) => updateVariant(index, 'brand', txt)}
                    />
                  </div>

                  <input
                    type="text"
                    className="form-input"
                    value={v.brand}
                    onChange={(e) => updateVariant(index, 'brand', e.target.value)}
                    placeholder="например: Geely Genuine / Bosch / Denso / Depo"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{lang === 'kz' ? 'Бағасы (₸ KZT)' : 'Цена в тенге (₸)'}</label>
                  <input
                    type="number"
                    className="form-input"
                    style={{ fontSize: '20px', fontWeight: 900, color: 'var(--primary-emerald)' }}
                    value={v.price}
                    onChange={(e) => updateVariant(index, 'price', e.target.value)}
                    placeholder="например: 45000"
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{lang === 'kz' ? 'Жағдайы' : 'Состояние'}</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => updateVariant(index, 'condition', 'New Original')}
                      style={{
                        padding: '8px 2px',
                        borderRadius: '8px',
                        border: v.condition === 'New Original' ? '2px solid #2563EB' : '1px solid var(--border-color)',
                        background: v.condition === 'New Original' ? '#EFF6FF' : '#FFFFFF',
                        color: v.condition === 'New Original' ? '#1D4ED8' : 'var(--text-muted)',
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      Оригинал
                    </button>

                    <button
                      type="button"
                      onClick={() => updateVariant(index, 'condition', 'New Aftermarket')}
                      style={{
                        padding: '8px 2px',
                        borderRadius: '8px',
                        border: v.condition === 'New Aftermarket' ? '2px solid #9333EA' : '1px solid var(--border-color)',
                        background: v.condition === 'New Aftermarket' ? '#FAF5FF' : '#FFFFFF',
                        color: v.condition === 'New Aftermarket' ? '#7E22CE' : 'var(--text-muted)',
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      Дубликат
                    </button>

                    <button
                      type="button"
                      onClick={() => updateVariant(index, 'condition', 'Used')}
                      style={{
                        padding: '8px 2px',
                        borderRadius: '8px',
                        border: v.condition === 'Used' ? '2px solid #EA580C' : '1px solid var(--border-color)',
                        background: v.condition === 'Used' ? '#FFF7ED' : '#FFFFFF',
                        color: v.condition === 'Used' ? '#C2410C' : 'var(--text-muted)',
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      Б/У
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add More Variants Button */}
            {variants.length < 3 && (
              <button
                type="button"
                onClick={addVariant}
                className="btn-secondary"
                style={{ marginBottom: '16px', border: '1.5px dashed var(--primary-emerald)', color: 'var(--primary-emerald)', fontWeight: 800 }}
              >
                <Plus size={16} /> {lang === 'kz' ? '+ Тағы бір марка/баға нұсқасын қосу' : '+ Добавить еще вариант марка/цена (до 3)'}
              </button>
            )}

            <button type="submit" className="btn-primary" disabled={submitting} style={{ padding: '16px', fontSize: '16px' }}>
              {submitting ? '...' : (lang === 'kz' ? 'Ұсыныстарды жіберу' : 'Отправить все варианты Водителю')}
            </button>
          </form>
        </BottomSheet>
      )}
    </div>
  );
}
