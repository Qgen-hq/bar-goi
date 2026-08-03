import React, { useState } from 'react';
import { RefreshCw, ShoppingBag, Clock, MapPin, Send, MessageSquare, Star, CheckCircle2, ChevronRight, AlertCircle, Phone, ArrowUpRight } from 'lucide-react';
import ConditionBadge from './ConditionBadge';
import ReviewModal from './ReviewModal';
import { translations } from '../i18n/translations';
import BrandedLoader from './BrandedLoader';

const SAMPLE_DEMO_REQUESTS = [
  {
    id: 'req-demo-1',
    carModel: 'Geely Monjaro 2023',
    partNeeded: 'Бензонасос в сборе 2.0T',
    photos: ['https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80'],
    origin: 'China',
    category: 'Engine',
    createdAgo: '5 мин назад',
    offers: [
      {
        id: 'off-1',
        seller_id: 'seller-demo-1',
        shopName: 'ChinaAuto Taldykorgan (Бутик #14)',
        marketName: 'Талдыкорган - Центральный авторынок',
        boothNumber: '1-й ряд, бутик 14',
        whatsapp: '77779998877',
        whatsapp_phone: '77779998877',
        rating: 4.9,
        reviewsCount: 18,
        reviews_count: 18,
        variants: [
          { brand: 'Geely Genuine (Оригинал)', price: 45000, condition: 'New Original' },
          { brand: 'Bosch Duplicate (Германия)', price: 28000, condition: 'New Aftermarket' }
        ]
      }
    ]
  }
];

export default function DriverRequestsList({ requests, loadingRequests, lang, userPhone, onRefresh, onReviewSubmitted }) {
  const t = translations[lang || 'ru'];
  const [activeReviewSeller, setActiveReviewSeller] = useState(null);

  const displayRequests = (requests && requests.length > 0) ? requests : SAMPLE_DEMO_REQUESTS;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--dark-slate)' }}>
            {t.myTendersTitle}
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {t.myTendersSubtitle}
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="btn-secondary"
          style={{ width: 'auto', padding: '6px 12px', fontSize: '12px' }}
        >
          <RefreshCw size={14} className={loadingRequests ? 'spin' : ''} />
          <span>{lang === 'kz' ? 'Жаңарту' : 'Обновить'}</span>
        </button>
      </div>

      {loadingRequests ? (
        <BrandedLoader lang={lang} />
      ) : displayRequests.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
          У вас пока нет активных запросов на запчасти. Используйте форма «+ Найти деталь» справа.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {displayRequests.map((req, index) => {
            const carTitle = req.carModel || req.car_model || 'Автомобиль';
            const partTitle = req.partNeeded || req.part_name || 'Деталь';
            const offers = req.offers || [];
            const hasPhoto = Array.isArray(req.photos) && req.photos.length > 0 && typeof req.photos[0] === 'string' && req.photos[0].startsWith('http');

            return (
              <div key={req.id || index} className="card" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary-emerald)', background: 'var(--primary-emerald-light)', padding: '3px 10px', borderRadius: '12px' }}>
                      {t.tenderActive}
                    </span>
                    <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--dark-slate)', margin: '4px 0 2px 0' }}>
                      {carTitle}
                    </h3>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#334155' }}>
                      Деталь: {partTitle}
                    </div>
                  </div>

                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', background: '#F1F5F9', padding: '4px 8px', borderRadius: '10px' }}>
                    <Clock size={12} /> {req.createdAgo || 'Только что'}
                  </div>
                </div>

                {hasPhoto && (
                  <div style={{ marginBottom: '12px', borderRadius: '12px', overflow: 'hidden', height: '140px' }}>
                    <img src={req.photos[0]} alt="Part" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}

                {/* Status Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', padding: '10px 14px', borderRadius: '12px', marginBottom: '14px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--dark-slate)' }}>
                    {offers.length === 0 ? 'Ожидаем варианты от бутиков...' : `Получено ответов: ${offers.length}`}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary-emerald)' }}>
                    {offers.length} бутиков
                  </div>
                </div>

                {/* OFFERS FROM BOUTIQUES */}
                {offers.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 900, color: 'var(--dark-slate)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {t.offersFromShops}:
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {offers.map((off, oIdx) => {
                        const cleanPhone = (off.whatsapp || off.whatsapp_phone || '77779998877').replace(/\D/g, '');
                        const variants = off.variants || [
                          { brand: off.brand || 'Оригинал', price: off.price || 0, condition: off.condition || 'New Original' }
                        ];

                        const waMessage = encodeURIComponent(
                          `Сәлеметсіз бе! bar.go арқылы ${carTitle} — ${partTitle} бөлшегі бойынша ұсынысыңызды көрдім.`
                        );
                        const waUrl = `https://wa.me/${cleanPhone}?text=${waMessage}`;

                        return (
                          <div key={off.id || oIdx} style={{ background: '#FFFFFF', border: '1.5px solid var(--border-color)', borderRadius: '14px', padding: '14px', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                              <div>
                                <div style={{ fontSize: '15px', fontWeight: 900, color: 'var(--dark-slate)' }}>
                                  {off.shopName || off.shop_name || 'Автобутик #14'}
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                  <MapPin size={12} color="var(--primary-emerald)" />
                                  {off.marketName || off.market_name} ({off.boothNumber || off.booth_number})
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#FEF3C7', padding: '4px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: 800, color: '#D97706' }}>
                                <Star size={12} fill="#D97706" /> {off.rating || 4.9} ({off.reviewsCount || off.reviews_count || 12})
                              </div>
                            </div>

                            {/* Multi-Variant Price Options */}
                            <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '10px', marginBottom: '10px' }}>
                              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '6px' }}>
                                ПРЕДЛОЖЕННЫЕ ВАРИАНТЫ ЦЕН:
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {variants.map((v, vIdx) => (
                                  <div key={vIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF', padding: '6px 10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                    <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--dark-slate)' }}>
                                      {v.brand}
                                    </span>
                                    <span style={{ fontSize: '15px', fontWeight: 900, color: 'var(--primary-emerald)' }}>
                                      {Number(v.price).toLocaleString()} ₸
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Action Buttons: Direct WhatsApp & Rating */}
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="btn-primary"
                                style={{ flex: 2, textDecoration: 'none', padding: '10px', fontSize: '13px', background: '#25D366' }}
                              >
                                <MessageSquare size={16} />
                                <span>{t.acceptWhatsApp}</span>
                              </a>

                              <button
                                onClick={() => setActiveReviewSeller(off)}
                                className="btn-secondary"
                                style={{ flex: 1, padding: '10px', fontSize: '12px' }}
                              >
                                ⭐ {t.rateDealBtn}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Review Rating Modal */}
      {activeReviewSeller && (
        <ReviewModal
          seller={activeReviewSeller}
          lang={lang}
          onClose={() => setActiveReviewSeller(null)}
          onSubmitted={(updatedSeller) => {
            if (onReviewSubmitted) onReviewSubmitted(updatedSeller);
            setActiveReviewSeller(null);
          }}
        />
      )}
    </div>
  );
}
