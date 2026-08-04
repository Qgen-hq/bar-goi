import React, { useState } from 'react';
import { ShoppingBag, MessageSquare, CheckCircle2, Clock, MapPin, ExternalLink, Star, Phone, Shield } from 'lucide-react';
import ConditionBadge from './ConditionBadge';
import { translations } from '../i18n/translations';
import { safeWhatsAppUrl } from '../utils/security';

export default function SellerMyOffers({ shop, mySentOffers, lang }) {
  const t = translations[lang || 'ru'];

  const allOffers = mySentOffers || [];

  const totalValueOffered = allOffers.reduce((acc, off) => {
    const firstPrice = off.variants?.[0]?.price || off.price || 0;
    return acc + Number(firstPrice);
  }, 0);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Metrics Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: '#FFFFFF', padding: '20px', borderRadius: '20px', marginBottom: '20px', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--primary-emerald)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 900 }}>
              {lang === 'kz' ? 'Менің жауаптарым мен клиенттерім' : 'Мои ответы и клиенты'}
            </h2>
            <p style={{ fontSize: '12px', color: '#94A3B8' }}>
              История отправленных КП и прямые контакты клиентов в WhatsApp
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ background: 'rgba(255,255,255,0.08)', padding: '12px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--primary-emerald)' }}>
              {allOffers.length}
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700 }}>
              {lang === 'kz' ? 'Жіберілген ұсыныстар' : 'Отправлено КП водителям'}
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.08)', padding: '12px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#38BDF8' }}>
              {totalValueOffered.toLocaleString()} ₸
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700 }}>
              {lang === 'kz' ? 'Ұсынылған сумма' : 'Сумма предложений'}
            </div>
          </div>
        </div>
      </div>

      {/* OFFERS LIST WITH WHATSAPP RE-CONTACT BUTTON */}
      {allOffers.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '36px 20px', background: '#FFFFFF' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'rgba(59, 130, 246, 0.1)', color: '#2563EB', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <MessageSquare size={28} />
          </div>
          <h3 style={{ fontSize: '17px', fontWeight: 900, color: 'var(--dark-slate)', marginBottom: '6px' }}>
            {lang === 'kz' ? 'Әлі жіберілген ұсыныстар жоқ' : 'Вы еще не отправляли ответов покупателям'}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '380px', margin: '0 auto', lineHeight: 1.4 }}>
            {lang === 'kz' ? '«Сұраныстар» бөліміне өтіп, бөлшек іздеп жатқан жүргізушілерге баға нұсқаларын ұсыныңыз' : 'Перейдите в «Ленту запросов» и отправьте варианты цен водителям, чтобы они появились здесь!'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {allOffers.map((offer, index) => {
            const carTitle = offer.carModel || offer.car_model || 'Автомобиль';
            const partTitle = offer.partNeeded || offer.part_name || 'Деталь';
            const rawPhone = offer.driverPhone || offer.driver_phone || offer.whatsapp_phone || '77779998877';
            const variants = offer.variants || [
              { brand: offer.brand || 'Оригинал', price: offer.price || 0, condition: offer.condition || 'New Original' }
            ];

            const waMsgText = `Сәлеметсіз бе! bar.go арқылы сізге ${carTitle} — ${partTitle} бойынша ұсыныс жіберген едім. Сұрақтарыңыз бар ма?`;
            const waUrl = safeWhatsAppUrl(rawPhone, waMsgText);

            return (
              <div key={offer.id || index} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary-emerald)', background: 'var(--primary-emerald-light)', padding: '3px 10px', borderRadius: '12px' }}>
                      {offer.status === 'DEAL_CLOSED' ? '🤝 Сделка состоялась' : '🟢 Предложение отправлено'}
                    </span>
                    <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--dark-slate)', margin: '6px 0 2px 0' }}>
                      {carTitle}
                    </h3>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#334155' }}>
                      Деталь: {partTitle}
                    </div>
                  </div>

                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', background: '#F1F5F9', padding: '4px 8px', borderRadius: '10px' }}>
                    <Clock size={12} /> {offer.createdAgo || 'Только что'}
                  </div>
                </div>

                {/* Customer Contact Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', fontWeight: 700, marginBottom: '12px' }}>
                  <Phone size={14} color="var(--primary-emerald)" />
                  Клиент: +{rawPhone.replace(/\D/g, '')}
                </div>

                {/* Variants Sent List */}
                <div style={{ background: '#F8FAFC', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    ОТПРАВЛЕННЫЕ ВАРИАНТЫ ЦЕН:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {variants.map((v, vIdx) => (
                      <div key={vIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF', padding: '8px 12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
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

                {/* DIRECT WHATSAPP RE-CONTACT BUTTON */}
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary"
                  style={{ textDecoration: 'none', padding: '12px', fontSize: '14px', background: '#25D366' }}
                >
                  <MessageSquare size={16} />
                  <span>{lang === 'kz' ? 'Клиентке WhatsApp-қа қайта жазу ➔' : 'Написать клиенту в WhatsApp ➔'}</span>
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
