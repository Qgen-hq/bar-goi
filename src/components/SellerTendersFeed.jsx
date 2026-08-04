import React, { useState } from 'react';
import { ShoppingBag, CheckCircle2, Clock, Send, Store, AlertCircle, MapPin, Shield, Plus, Trash2, Mic, UserCheck, MessageSquare, Filter, LogOut, Zap } from 'lucide-react';
import ConditionBadge from './ConditionBadge';
import BottomSheet from './BottomSheet';
import SellerMyOffers from './SellerMyOffers';
import { translations } from '../i18n/translations';
import { supabase } from '../lib/supabase';
import VoiceInput from './VoiceInput';

export default function SellerTendersFeed({ shop, requests, mySentOffers, lang, onSubmitOffer, onOpenShopSetup, onLogout }) {
  const t = translations[lang || 'ru'];

  const [sellerSubTab, setSellerSubTab] = useState('feed');
  const [filterMode, setFilterMode] = useState('targeted');
  const [activeTenderForOffer, setActiveTenderForOffer] = useState(null);
  
  const [variants, setVariants] = useState([
    { brand: 'Geely Genuine (Оригинал)', price: '', condition: 'New Original' }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const rawRequests = Array.isArray(requests) ? requests : [];
  const shopCountries = Array.isArray(shop?.countries) && shop.countries.length > 0
    ? shop.countries
    : ['China', 'Germany', 'Japan'];

  const filteredRequests = rawRequests.filter(req => {
    if (filterMode === 'all') return true;
    const reqOrigin = req.origin || req.detected_country;
    if (!reqOrigin) return true;
    return shopCountries.includes(reqOrigin);
  });

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
      shopName: shop?.shop_name || shop?.shopName || 'Автобутик #42',
      shop_name: shop?.shop_name || shop?.shopName || 'Автобутик #42',
      marketName: shop?.market_name || shop?.marketName || 'Талдыкорган - Авторынок',
      market_name: shop?.market_name || shop?.marketName || 'Талдыкорган - Авторынок',
      boothNumber: shop?.booth_number || shop?.boothNumber || 'Бутик #42',
      booth_number: shop?.booth_number || shop?.boothNumber || 'Бутик #42',
      whatsapp: shop?.whatsapp_phone || shop?.whatsapp || '77779998877',
      whatsapp_phone: shop?.whatsapp_phone || shop?.whatsapp || '77779998877',
      rating: 5.0,
      reviewsCount: shop?.reviews_count || 1,
      reviews_count: shop?.reviews_count || 1,
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
      const { data: savedOffer, error: supaErr } = await supabase
        .from('offers')
        .insert({
          id: offerPayload.id,
          request_id: offerPayload.request_id,
          seller_id: offerPayload.seller_id,
          shop_name: offerPayload.shop_name,
          shop_phone: shop?.phone || '',
          whatsapp_phone: offerPayload.whatsapp_phone,
          market_name: offerPayload.market_name,
          booth_number: offerPayload.booth_number,
          rating: offerPayload.rating,
          reviews_count: offerPayload.reviews_count,
          condition: offerPayload.condition,
          brand: offerPayload.brand,
          price: offerPayload.price,
          variants: offerPayload.variants,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (supaErr) console.error('Supabase offer insert error:', supaErr.message);

      setSubmitting(false);
      setSuccess(true);
      onSubmitOffer(activeTenderForOffer.id, savedOffer || offerPayload, activeTenderForOffer);
      setTimeout(() => {
        setSuccess(false);
        setActiveTenderForOffer(null);
        setSellerSubTab('offers_history');
      }, 1200);
    } catch (err) {
      setSubmitting(false);
      setSuccess(true);
      onSubmitOffer(activeTenderForOffer.id, offerPayload, activeTenderForOffer);
      setTimeout(() => {
        setSuccess(false);
        setActiveTenderForOffer(null);
        setSellerSubTab('offers_history');
      }, 1200);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Seller Header Dashboard Card */}
      <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: '#fff', padding: '20px', borderRadius: 'var(--radius-lg)', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsOnline(!isOnline)}
              style={{
                background: isOnline ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                border: isOnline ? '1px solid #10B981' : '1px solid #EF4444',
                color: isOnline ? '#34D399' : '#F87171',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isOnline ? '#10B981' : '#EF4444' }} />
              {isOnline ? 'В сети' : 'Офлайн'}
            </button>

            <button
              onClick={onOpenShopSetup}
              className="btn-secondary"
              style={{ width: 'auto', padding: '6px 12px', fontSize: '12px' }}
            >
              ⚙️ Настройки
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid #EF4444',
                  color: '#F87171',
                  padding: '6px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <LogOut size={14} /> {lang === 'kz' ? 'Шығу' : 'Выйти'}
              </button>
            )}
          </div>
        </div>

        {/* TOP SELLER SUB-TAB NAVIGATION BAR */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={() => setSellerSubTab('feed')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '12px',
              border: 'none',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
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
              padding: '10px',
              borderRadius: '12px',
              border: 'none',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
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
        <SellerMyOffers shop={shop} mySentOffers={mySentOffers} lang={lang} />
      ) : (
        /* RENDER SUB-TAB 1: REQUESTS FEED WITH TAG FILTERING */
        <div>
          {/* Tag Filter Toggle Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--dark-slate)' }}>
                {lang === 'kz' ? 'Автобөлшектерге сұраныстар ағыны' : 'Лента запросов на автозапчасти'}
              </h2>
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '6px', background: '#E2E8F0', padding: '4px', borderRadius: '12px' }}>
              <button
                onClick={() => setFilterMode('targeted')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: filterMode === 'targeted' ? '#FFFFFF' : 'transparent',
                  color: filterMode === 'targeted' ? 'var(--primary-emerald)' : '#64748B',
                  boxShadow: filterMode === 'targeted' ? 'var(--shadow-sm)' : 'none'
                }}
              >
                <Filter size={12} style={{ display: 'inline', marginRight: '4px' }} />
                {lang === 'kz' ? `Бутигім бойынша (${shopCountries.join(', ')})` : `Только мои бренды (${shopCountries.map(c => t['country' + c] || c).join(', ')})`}
              </button>

              <button
                onClick={() => setFilterMode('all')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: filterMode === 'all' ? '#FFFFFF' : 'transparent',
                  color: filterMode === 'all' ? 'var(--dark-slate)' : '#64748B',
                  boxShadow: filterMode === 'all' ? 'var(--shadow-sm)' : 'none'
                }}
              >
                {lang === 'kz' ? 'Барлық сұраныстар' : 'Все запросы'}
              </button>
            </div>
          </div>

          {/* Tenders Cards Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredRequests.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '36px 20px', background: '#FFFFFF' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'rgba(59, 130, 246, 0.1)', color: '#2563EB', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                  <ShoppingBag size={28} />
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 900, color: 'var(--dark-slate)', marginBottom: '6px' }}>
                  {lang === 'kz' ? 'Қазірше автобөлшектерге белсенді сұраныстар жоқ' : 'В вашей категории пока нет активных запросов'}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto', lineHeight: 1.4 }}>
                  {lang === 'kz' ? 'Жүргізушілер бөлшек іздегенде сұраныстар осы жерде нақты уақыт режимінде пайда болады' : 'Как только автовладельцы оставят запрос на автозапчасть, новые заявки появятся здесь в реальном времени!'}
                </p>
              </div>
            ) : (
              filteredRequests.map((tender, index) => {
                const carTitle = tender.carModel || tender.car_model || 'Автомобиль';
                const partTitle = tender.partNeeded || tender.part_name || 'Автозапчасть';
                const uniqueKey = tender.id ? `${tender.id}-${index}` : `seller-tender-${index}`;
                const reqOrigin = tender.origin || tender.detected_country || 'Unknown';
                const countryName = t['country' + reqOrigin] || tender.originInfo?.name || reqOrigin;
                const isTargeted = shopCountries.includes(reqOrigin);
                
                return (
                  <div key={uniqueKey} className="card" style={{ border: isTargeted ? '2px solid var(--primary-emerald)' : '1px solid var(--border-color)', position: 'relative' }}>
                    {isTargeted && (
                      <div style={{ position: 'absolute', top: '-12px', right: '16px', background: 'var(--primary-emerald)', color: '#fff', fontSize: '11px', fontWeight: 900, padding: '3px 10px', borderRadius: '12px', boxShadow: '0 4px 12px var(--primary-emerald-glow)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        🎯 {lang === 'kz' ? 'Сіздің мамандығыңыз!' : 'Для вашего профиля'} ({countryName})
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary-emerald)', background: 'var(--primary-emerald-light)', padding: '3px 10px', borderRadius: '12px' }}>
                          {countryName}
                        </span>
                        <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--dark-slate)', margin: '4px 0 2px 0' }}>
                          {carTitle}
                        </h3>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: '#334155' }}>
                          Деталь: {partTitle}
                        </div>
                      </div>

                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', background: '#F1F5F9', padding: '4px 8px', borderRadius: '10px' }}>
                        <Clock size={13} /> {tender.createdAgo || 'Новый'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', background: '#F1F5F9', padding: '4px 10px', borderRadius: '14px', color: '#475569', fontWeight: 700 }}>
                        Категория: {t['cat' + (tender.category || tender.detected_category)] || tender.categoryInfo?.name || tender.category || 'Запчасть'}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px' }}>
                      <button
                        onClick={() => handleOpenOfferSheet(tender)}
                        className="btn-primary"
                        style={{ fontSize: '14px', padding: '12px' }}
                      >
                        <Send size={16} /> {lang === 'kz' ? 'Баға нұсқаларын ұсыну' : 'Указать варианты марок и цен (до 3)'}
                      </button>

                      <a
                        href={safeWhatsAppUrl(shop?.whatsapp_phone || '77779998877', `🚘 Запрос на bar.go!\nАвто: *${carTitle}*\nДеталь: *${partTitle}*\n\nОтветить за 10 секунд: https://bar-go.vercel.app`)}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          background: '#25D366',
                          color: '#FFFFFF',
                          padding: '12px 14px',
                          borderRadius: 'var(--radius-md)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          textDecoration: 'none',
                          fontSize: '13px',
                          fontWeight: 800
                        }}
                        title="Уведомить / Открыть в WhatsApp"
                      >
                        <MessageSquare size={16} />
                      </a>
                    </div>
                  </div>
                );
              })
            )}
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
          <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '12px', marginBottom: '14px', border: '1.5px solid var(--border-color)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
              {lang === 'kz' ? 'Сатып алушының сұранысы:' : 'Запрос водителя:'}
            </div>
            <div style={{ fontSize: '15px', fontWeight: 900, color: 'var(--dark-slate)', marginTop: '2px' }}>
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
              <div key={index} style={{ background: '#FFFFFF', border: '1.5px solid var(--border-color)', padding: '14px', borderRadius: '14px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary-emerald)', background: 'var(--primary-emerald-light)', padding: '2px 8px', borderRadius: '8px' }}>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>
                      <Shield size={13} style={{ display: 'inline', marginRight: '4px', color: 'var(--primary-emerald)' }} />
                      {lang === 'kz' ? 'Марка / Бренд' : 'Марка / Бренд запчасти'}
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
                    placeholder="например: Geely Genuine / Bosch / Denso"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{lang === 'kz' ? 'Бағасы (₸)' : 'Цена (₸)'}</label>
                  <input
                    type="number"
                    className="form-input"
                    style={{ fontSize: '18px', fontWeight: 900, color: 'var(--primary-emerald)' }}
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
                        padding: '6px 2px',
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
                        padding: '6px 2px',
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
                        padding: '6px 2px',
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
                style={{ marginBottom: '14px', border: '1.5px dashed var(--primary-emerald)', color: 'var(--primary-emerald)', fontWeight: 800 }}
              >
                <Plus size={16} /> {lang === 'kz' ? '+ Тағы бір марка/баға нұсқасын қосу' : '+ Добавить вариант марка/цена (до 3)'}
              </button>
            )}

            <button type="submit" className="btn-primary" disabled={submitting} style={{ padding: '14px', fontSize: '15px' }}>
              {submitting ? '...' : (lang === 'kz' ? 'Ұсыныстарды жіберу' : 'Отправить все варианты Водителю')}
            </button>
          </form>
        </BottomSheet>
      )}
    </div>
  );
}
