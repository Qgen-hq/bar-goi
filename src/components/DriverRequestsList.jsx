import React, { useState } from 'react';
import { Clock, ShieldCheck, RefreshCw, Sparkles, MapPin, Store, MessageSquare, Star, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import ConditionBadge from './ConditionBadge';
import ReviewModal from './ReviewModal';
import { translations } from '../i18n/translations';

// Sample Driver Requests Feed
const SAMPLE_DRIVER_REQUESTS = [
  {
    id: 'req-demo-1',
    carModel: 'Geely Monjaro 2023',
    car_model: 'Geely Monjaro 2023',
    partNeeded: 'Бензонасос в сборе 2.0T',
    part_name: 'Бензонасос в сборе 2.0T',
    photos: [],
    origin: 'China',
    category: 'Engine',
    originInfo: { name: 'Китай' },
    categoryInfo: { name: 'Двигатель и Топливная' },
    expiresAt: new Date(Date.now() + 23 * 3600 * 1000).toISOString(),
    offers: [
      {
        id: 'off-demo-1',
        seller_id: 'shop-1',
        shopName: 'ChinaParts Taldykorgan',
        shop_name: 'ChinaParts Taldykorgan',
        marketName: 'Талдыкорган - Центральный авторынок',
        market_name: 'Талдыкорган - Центральный авторынок',
        boothNumber: '2-й ряд, бутик 42',
        booth_number: '2-й ряд, бутик 42',
        whatsapp: '77779998877',
        whatsapp_phone: '77779998877',
        rating: 4.9,
        reviewsCount: 12,
        reviews_count: 12,
        variants: [
          { brand: 'Geely Genuine (Оригинал)', price: 45000, condition: 'New Original' },
          { brand: 'Bosch Duplicate (Германия)', price: 28000, condition: 'New Aftermarket' },
          { brand: 'Б/У Заводской Оригинал', price: 18000, condition: 'Used' }
        ]
      }
    ]
  }
];

export default function DriverRequestsList({ requests, loadingRequests, lang, userPhone, onRefresh, onReviewSubmitted }) {
  const t = translations[lang || 'ru'];
  const [selectedSellerForReview, setSelectedSellerForReview] = useState(null);

  const displayRequests = (requests && requests.length > 0) ? requests : SAMPLE_DRIVER_REQUESTS;

  return (
    <div>
      {/* TOP HERO HEADER BANNER & 3-STEP WORKFLOW */}
      <div style={{ background: '#FFFFFF', border: '1.5px solid var(--border-color)', borderRadius: '24px', padding: '24px', marginBottom: '20px', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--primary-emerald-light)', color: 'var(--primary-emerald)', padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
          <Sparkles size={14} /> ПЛАТФОРМА ПРЯМОГО ПОИСКА АВТОЗАПЧАСТЕЙ
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--dark-slate)', marginBottom: '6px', letterSpacing: '-0.5px' }}>
          Поиск автозапчастей за 60 секунд без звонков на авторынок
        </h1>

        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Создайте один запрос — и получайте варианты цен напрямую от автомагазинов и бутиков города!
        </p>

        {/* High-Contrast Live Metrics Bar */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <span style={{ background: '#F1F5F9', color: '#1E293B', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid #CBD5E1' }}>
            <ShieldCheck size={14} color="var(--primary-emerald)" /> 45+ Бутиков в сети
          </span>
          <span style={{ background: '#F1F5F9', color: '#1E293B', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid #CBD5E1' }}>
            <Clock size={14} color="#D97706" /> Ответ за 3 минуты
          </span>
          <span style={{ background: '#F1F5F9', color: '#1E293B', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid #CBD5E1' }}>
            <Store size={14} color="#2563EB" /> Цены напрямую от бутиков
          </span>
        </div>

        {/* REDESIGNED SLEEK 3-STEP WORKFLOW BAR */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', background: '#F8FAFC', padding: '14px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary-emerald)', color: '#FFFFFF', fontWeight: 900, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              1
            </div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--dark-slate)' }}>
              Напишите авто и деталь в форме справа
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#2563EB', color: '#FFFFFF', fontWeight: 900, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              2
            </div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--dark-slate)' }}>
              ИИ направит запрос нужным бутикам
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#7C3AED', color: '#FFFFFF', fontWeight: 900, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              3
            </div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--dark-slate)' }}>
              Сравнивайте цены и пишите в WhatsApp
            </div>
          </div>
        </div>
      </div>

      {/* REQUESTS LIST TITLE & REFRESH BUTTON */}
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
          type="button"
          onClick={onRefresh}
          className="btn-secondary"
          style={{ width: 'auto', padding: '8px 12px', fontSize: '12px' }}
        >
          <RefreshCw size={14} className={loadingRequests ? 'spin' : ''} /> {lang === 'kz' ? 'Жаңарту' : 'Обновить'}
        </button>
      </div>

      {/* DRIVER REQUEST CARDS GRID */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {displayRequests.map((req, index) => {
          const carTitle = req.carModel || req.car_model || 'Автомобиль';
          const partTitle = req.partNeeded || req.part_name || 'Деталь';
          const offers = req.offers || [];
          const uniqueKey = req.id ? `${req.id}-${index}` : `driver-req-${index}`;
          const hasPhoto = req.photos && req.photos.length > 0 && req.photos[0] && typeof req.photos[0] === 'string' && req.photos[0].trim() !== '';

          return (
            <div key={uniqueKey} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary-emerald)', background: 'var(--primary-emerald-light)', padding: '3px 10px', borderRadius: '12px' }}>
                    {t.tenderActive}
                  </span>
                  <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--dark-slate)', margin: '6px 0 2px 0' }}>
                    {carTitle}
                  </h3>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#334155' }}>
                    {partTitle}
                  </div>
                </div>

                <div style={{ fontSize: '11px', color: '#D97706', fontWeight: 800, background: '#FEF3C7', padding: '4px 10px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={13} /> TTL: 22ч 59м
                </div>
              </div>

              {/* Tag Pills */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', background: '#F1F5F9', padding: '4px 10px', borderRadius: '12px', color: '#475569', fontWeight: 700 }}>
                  {t['country' + (req.origin || req.detected_country)] || req.originInfo?.name || req.origin || 'Импорт'}
                </span>
                <span style={{ fontSize: '12px', background: '#F1F5F9', padding: '4px 10px', borderRadius: '12px', color: '#475569', fontWeight: 700 }}>
                  {t['cat' + (req.category || req.detected_category)] || req.categoryInfo?.name || req.category || 'Запчасть'}
                </span>
              </div>

              {/* SAFE PHOTO RENDER (NO BROKEN IMAGE PLACEHOLDERS) */}
              {hasPhoto && (
                <div style={{ width: '90px', height: '90px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', marginBottom: '14px' }}>
                  <img src={req.photos[0]} alt="Деталь" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}

              {/* OFFERS FROM BOUTIQUES */}
              <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 900, color: 'var(--dark-slate)' }}>
                    {t.offersFromShops} ({offers.length})
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--primary-emerald)', fontWeight: 800 }}>
                    {t.realtimeBadge}
                  </span>
                </div>

                {offers.length === 0 ? (
                  <div style={{ textTransform: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: '13px', background: '#F8FAFC', borderRadius: '12px' }}>
                    {t.waitingOffers}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {offers.map((offer, offIdx) => {
                      const shopName = offer.shopName || offer.shop_name || 'Автобутик';
                      const marketName = offer.marketName || offer.market_name || 'Авторынок Талдыкорган';
                      const boothNum = offer.boothNumber || offer.booth_number || 'Бутик 42';
                      const waPhone = (offer.whatsapp || offer.whatsapp_phone || '77779998877').replace(/\D/g, '');
                      const rating = offer.rating || 5.0;
                      const reviewsCount = offer.reviewsCount || offer.reviews_count || 12;
                      const variants = offer.variants || [
                        { brand: offer.brand || 'Оригинал', price: offer.price || 0, condition: offer.condition || 'New Original' }
                      ];

                      const waMessage = encodeURIComponent(
                        `Сәлеметсіз бе! BarGoi арқылы сіздің ұсынысыңызды көрдім.\nАвто: ${carTitle}\nДеталь: ${partTitle}`
                      );
                      const waUrl = `https://wa.me/${waPhone}?text=${waMessage}`;

                      return (
                        <div key={offer.id || offIdx} style={{ background: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: '16px', padding: '16px', boxShadow: 'var(--shadow-sm)' }}>
                          {/* Shop Header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <CheckCircle2 size={16} color="var(--primary-emerald)" />
                                <h4 style={{ fontSize: '16px', fontWeight: 900, color: 'var(--dark-slate)' }}>
                                  {shopName}
                                </h4>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#D97706', fontWeight: 800, marginTop: '2px' }}>
                                <Star size={13} fill="#D97706" color="#D97706" /> {rating} ({reviewsCount} отзывов)
                              </div>

                              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <MapPin size={13} /> {marketName} ({boothNum})
                              </div>
                            </div>

                            <a
                              href={`https://2gis.kz/taldykorgan/search/${encodeURIComponent(marketName)}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ fontSize: '11px', fontWeight: 800, color: '#2563EB', background: '#EFF6FF', padding: '4px 10px', borderRadius: '10px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <MapPin size={12} /> {t.route2GIS}
                            </a>
                          </div>

                          {/* Multi-Variant Brand & Price Options */}
                          <div style={{ background: '#F8FAFC', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px', margin: '10px 0' }}>
                            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                              ПРЕДЛОЖЕННЫЕ ВАРИАНТЫ МАРОК И ЦЕН:
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {variants.map((v, vIdx) => (
                                <div key={vIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF', padding: '8px 12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                                  <div>
                                    <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--dark-slate)' }}>
                                      {v.brand}
                                    </span>
                                    <div style={{ marginTop: '2px' }}>
                                      <ConditionBadge condition={v.condition} />
                                    </div>
                                  </div>

                                  <div style={{ fontSize: '16px', fontWeight: 900, color: 'var(--primary-emerald)' }}>
                                    {Number(v.price).toLocaleString()} ₸
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-primary"
                              style={{ flex: 1, textDecoration: 'none', padding: '12px', fontSize: '14px', background: '#25D366' }}
                            >
                              <MessageSquare size={16} /> {t.acceptWhatsApp}
                            </a>

                            <button
                              type="button"
                              onClick={() => setSelectedSellerForReview(offer)}
                              className="btn-secondary"
                              style={{ width: 'auto', padding: '12px 14px', fontSize: '12px' }}
                            >
                              {t.rateDealBtn}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* REVIEW MODAL */}
      {selectedSellerForReview && (
        <ReviewModal
          isOpen={!!selectedSellerForReview}
          onClose={() => setSelectedSellerForReview(null)}
          sellerId={selectedSellerForReview.seller_id || selectedSellerForReview.sellerId}
          shopName={selectedSellerForReview.shopName || selectedSellerForReview.shop_name}
          lang={lang}
          onReviewSubmitted={(res) => {
            onReviewSubmitted(res.updatedSeller);
            setSelectedSellerForReview(null);
          }}
        />
      )}
    </div>
  );
}
