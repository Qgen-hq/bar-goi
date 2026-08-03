import React, { useState } from 'react';
import { Clock, MessageSquare, Star, ArrowUpRight, ShieldCheck, RefreshCw, MapPin, Sparkles, Zap, CheckCircle2, Shield } from 'lucide-react';
import ConditionBadge from './ConditionBadge';
import ReviewModal from './ReviewModal';
import { translations } from '../i18n/translations';

// Sample Demo Tenders with Multi-Variant Offers
const SAMPLE_DEMO_TENDERS = [
  {
    id: 'demo-1',
    carModel: 'Geely Monjaro 2023',
    partNeeded: 'Бензонасос в сборе 2.0T',
    photos: ['https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80'],
    origin: 'China',
    category: 'Engine',
    originInfo: { flag: '🇨🇳', name: 'Китай' },
    categoryInfo: { name: 'Двигатель и Топливная' },
    expiresAt: new Date(Date.now() + 23 * 3600 * 1000).toISOString(),
    offers: [
      {
        id: 'off-demo-1',
        shopName: 'ChinaParts Taldykorgan',
        marketName: 'Талдыкорган - Центральный авторынок',
        boothNumber: '2-й ряд, бутик 42',
        rating: 4.9,
        reviewsCount: 12,
        whatsapp: '77779998877',
        variants: [
          { brand: 'Geely Genuine (Оригинал)', price: 45000, condition: 'New Original' },
          { brand: 'Bosch / Depo Tech', price: 28000, condition: 'New Aftermarket' },
          { brand: 'Б/У Оригинал', price: 18000, condition: 'Used' }
        ]
      }
    ]
  },
  {
    id: 'demo-2',
    carModel: 'BMW X5 E70 2010',
    partNeeded: 'Рулевая рейка гидравлическая',
    photos: [],
    origin: 'Germany',
    category: 'Suspension',
    originInfo: { flag: '🇩🇪', name: 'Германия' },
    categoryInfo: { name: 'Подвеска и Рулевое' },
    expiresAt: new Date(Date.now() + 21 * 3600 * 1000).toISOString(),
    offers: [
      {
        id: 'off-demo-2',
        shopName: 'German Parts (Бутик #18)',
        marketName: 'Талдыкорган - ТД Автомиг',
        boothNumber: '1-й этаж, бутик 18',
        rating: 4.8,
        reviewsCount: 8,
        whatsapp: '77055554433',
        variants: [
          { brand: 'BMW Genuine', price: 185000, condition: 'New Original' },
          { brand: 'TRW Automotive', price: 110000, condition: 'New Aftermarket' }
        ]
      }
    ]
  }
];

export default function DriverRequestsList({ requests, loadingRequests, lang, userPhone, onRefresh, onReviewSubmitted }) {
  const t = translations[lang || 'ru'];
  const [selectedShopForReview, setSelectedShopForReview] = useState(null);

  const displayRequests = (requests && requests.length > 0) ? requests : SAMPLE_DEMO_TENDERS;

  const formatKZT = (amount) => {
    return new Intl.NumberFormat('ru-RU').format(amount) + ' ₸';
  };

  const getTimeRemaining = (expiresAt) => {
    const diff = new Date(expiresAt) - new Date();
    if (diff <= 0) return 'Истек';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}ч ${mins}м`;
  };

  const generateWhatsAppUrl = (whatsappPhone, carModel, partName, offer, selectedVariant) => {
    let cleanPhone = (whatsappPhone || '').replace(/\D/g, '');
    if (cleanPhone.startsWith('8')) cleanPhone = '7' + cleanPhone.slice(1);
    if (!cleanPhone.startsWith('7') && cleanPhone.length === 10) cleanPhone = '7' + cleanPhone;

    const brandName = selectedVariant ? selectedVariant.brand : offer.brand;
    const priceVal = selectedVariant ? selectedVariant.price : offer.price;
    const condVal = selectedVariant ? selectedVariant.condition : offer.condition;

    const conditionText = condVal === 'New Original' ? (lang === 'kz' ? 'Жаңа (Түпнұсқа)' : 'Новая (Оригинал)') : condVal === 'New Aftermarket' ? (lang === 'kz' ? 'Жаңа (Дубликат)' : 'Новая (Дубликат)') : (lang === 'kz' ? 'Б/Ұ (Түпнұсқа)' : 'Б/У (Оригинал)');

    const text = lang === 'kz' 
      ? `Сәлем! ${carModel} - ${partName} бойынша өтінімге байланысты. Сіздің ұсынысыңызды қабылдаймын: ${brandName} (${conditionText}) ${formatKZT(priceVal)}. Орныңыздасыз ба?`
      : `Салам! Я по поводу заявки на ${carModel} - ${partName}. Принимаю ваше предложение: ${brandName} (${conditionText}) за ${formatKZT(priceVal)}. Вы на месте?`;
    
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  const generate2GISUrl = (marketName, boothNumber) => {
    const query = `${marketName || 'Талдыкорган авторынок'} ${boothNumber || ''}`.trim();
    return `https://2gis.kz/search/${encodeURIComponent(query)}`;
  };

  return (
    <div>
      {/* Visual Hero Banner */}
      <div className="hero-banner">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0, 200, 83, 0.2)', color: '#00E676', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, marginBottom: '10px' }}>
          <Sparkles size={14} /> {lang === 'kz' ? 'АВТОБӨЛШЕКТЕРДІ ТІКЕЛЕЙ ІЗДЕУ' : 'ПЛАТФОРМА ПРЯМОГО ПОИСКА АВТОЗАПЧАСТЕЙ'}
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: 900, lineHeight: 1.3, marginBottom: '8px' }}>
          {lang === 'kz' ? 'Автобөлшектерді 60 секундта табу' : 'Поиск автозапчастей за 60 секунд без звонков на авторынок'}
        </h1>
        <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.4 }}>
          {lang === 'kz' ? 'Өтінім жасаңыз — Талдықорған бутиктерінен тікелей бағаларды алыңыз!' : 'Создайте один запрос — и получайте варианты цен напрямую от автомагазинов и бутиков города!'}
        </p>

        {/* Metric Badges */}
        <div className="metrics-bar">
          <div className="metric-pill">
            <span>🔥</span> <b>45+ Бутиков в сети</b>
          </div>
          <div className="metric-pill">
            <Zap size={14} color="#FBBF24" /> <b>Ответ за 3 минуты</b>
          </div>
          <div className="metric-pill">
            <span>💰</span> <b>Цены напрямую от бутиков</b>
          </div>
        </div>
      </div>

      {/* Visual How-It-Works Bar */}
      <div className="how-it-works-grid">
        <div className="step-card">
          <div className="step-number">1</div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--dark-slate)' }}>
            Напишите авто и деталь в форме справа
          </div>
        </div>
        <div className="step-card">
          <div className="step-number">2</div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--dark-slate)' }}>
            ИИ направит запрос нужным бутикам
          </div>
        </div>
        <div className="step-card">
          <div className="step-number">3</div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--dark-slate)' }}>
            Сравнивайте цены и пишите в WhatsApp
          </div>
        </div>
      </div>

      {/* Active Tenders Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--dark-slate)' }}>
            {t.myTendersTitle}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {t.myTendersSubtitle}
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="btn-secondary"
          style={{ width: 'auto', padding: '8px 14px', fontSize: '13px' }}
        >
          <RefreshCw size={15} /> {t.refreshBtn}
        </button>
      </div>

      {/* Skeleton Loading State */}
      {loadingRequests && (
        <div>
          {[1, 2].map(n => (
            <div key={n} className="card" style={{ padding: '20px' }}>
              <div className="skeleton" style={{ height: '24px', width: '60%', marginBottom: '12px' }} />
              <div className="skeleton" style={{ height: '16px', width: '40%', marginBottom: '16px' }} />
              <div className="skeleton" style={{ height: '80px', width: '100%' }} />
            </div>
          ))}
        </div>
      )}

      {/* Tenders List */}
      {!loadingRequests && displayRequests.map((req, reqIdx) => (
        <div key={req.id || `req-card-${reqIdx}`} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary-emerald)', textTransform: 'uppercase', letterSpacing: '0.5px', background: 'var(--primary-emerald-light)', padding: '2px 8px', borderRadius: '10px' }}>
                {t.tenderActive}
              </span>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--dark-slate)', margin: '4px 0 2px 0' }}>
                {req.carModel || req.car_model || 'Автомобиль'}
              </h3>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#334155' }}>
                {req.partNeeded || req.part_name || 'Автозапчасть'}
              </div>
            </div>

            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={14} /> TTL: {getTimeRemaining(req.expiresAt || req.expires_at)}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <span style={{ fontSize: '12px', background: '#F1F5F9', padding: '4px 10px', borderRadius: '14px', color: '#475569', fontWeight: 700 }}>
              {req.originInfo?.flag || '🚘'} {t['country' + (req.origin || req.detected_country)] || req.originInfo?.name || req.origin}
            </span>
            <span style={{ fontSize: '12px', background: '#F1F5F9', padding: '4px 10px', borderRadius: '14px', color: '#475569', fontWeight: 700 }}>
              📦 {t['cat' + (req.category || req.detected_category)] || req.categoryInfo?.name || req.category}
            </span>
          </div>

          {req.photos && req.photos.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              {req.photos.map((photo, i) => (
                <img key={i} src={photo} alt="Req" style={{ width: '70px', height: '70px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
              ))}
            </div>
          )}

          {/* Offers List */}
          <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--dark-slate)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageSquare size={18} color="var(--primary-emerald)" />
                {t.offersFromShops} ({req.offers?.length || 0})
              </span>
              {req.offers?.length > 0 && (
                <span style={{ fontSize: '12px', color: 'var(--primary-emerald)', fontWeight: 800 }}>
                  {t.realtimeBadge}
                </span>
              )}
            </div>

            {(!req.offers || req.offers.length === 0) ? (
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', border: '1px dashed var(--border-color)' }}>
                {t.waitingOffers}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {req.offers.map((offer, offIdx) => {
                  const offerVariants = (offer.variants && offer.variants.length > 0)
                    ? offer.variants
                    : [{ brand: offer.brand || 'Оригинал', price: offer.price, condition: offer.condition }];

                  return (
                    <div
                      key={offer.id || `offer-${offIdx}`}
                      style={{
                        background: '#FFFFFF',
                        border: '1.5px solid var(--border-color)',
                        borderRadius: '16px',
                        padding: '18px',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <div style={{ fontSize: '16px', fontWeight: 900, color: 'var(--dark-slate)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <ShieldCheck size={18} color="var(--primary-emerald)" />
                            {offer.shopName || offer.shop_name}
                          </div>
                          
                          <div style={{ fontSize: '12px', color: '#EAB308', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                            <Star size={14} fill="#EAB308" /> {offer.rating || 4.9} ★ ({offer.reviewsCount || offer.reviews_count || 12} {lang === 'kz' ? 'пікір' : 'отзывов'})
                          </div>

                          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                            📍 {offer.marketName || offer.market_name || 'Талдыкорган авторынок'} ({offer.boothNumber || offer.booth_number})
                          </div>
                        </div>

                        <a
                          href={generate2GISUrl(offer.marketName || offer.market_name, offer.boothNumber || offer.booth_number)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary"
                          style={{ width: 'auto', padding: '6px 12px', fontSize: '12px', background: '#F8FAFC' }}
                        >
                          <MapPin size={14} color="#2563EB" /> {t.route2GIS}
                        </a>
                      </div>

                      {/* Render All Brand Variants Offered by this Shop */}
                      <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '12px', marginBottom: '12px', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Shield size={12} color="var(--primary-emerald)" /> {lang === 'kz' ? 'Бутиктің ұсынған марка/баға нұсқалары:' : 'Предложенные варианты марок и цен:'}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {offerVariants.map((v, vIdx) => (
                            <div key={vIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                              <div>
                                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--dark-slate)' }}>
                                  {v.brand}
                                </div>
                                <ConditionBadge condition={v.condition} />
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ fontSize: '17px', fontWeight: 900, color: 'var(--primary-emerald)' }}>
                                  {formatKZT(v.price)}
                                </div>
                                <a
                                  href={generateWhatsAppUrl(offer.whatsapp || offer.whatsapp_phone, req.carModel || req.car_model, req.partNeeded || req.part_name, offer, v)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn-whatsapp"
                                  style={{ width: 'auto', padding: '6px 12px', fontSize: '12px' }}
                                >
                                  {t.acceptWhatsApp} <ArrowUpRight size={14} />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedShopForReview(offer)}
                        style={{
                          background: 'none',
                          border: '1px dashed var(--primary-emerald)',
                          borderRadius: '10px',
                          padding: '8px 12px',
                          color: 'var(--primary-emerald)',
                          fontSize: '12px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          width: '100%'
                        }}
                      >
                        {t.rateDealBtn}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ))}

      <ReviewModal
        isOpen={!!selectedShopForReview}
        onClose={() => setSelectedShopForReview(null)}
        shop={selectedShopForReview}
        driverPhone={userPhone}
        lang={lang}
        onReviewSubmitted={onReviewSubmitted}
      />
    </div>
  );
}
