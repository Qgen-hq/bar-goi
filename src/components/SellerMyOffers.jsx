import React, { useState, useEffect } from 'react';
import { Send, Clock, CheckCircle2, ArrowUpRight, ShieldCheck, MapPin } from 'lucide-react';
import ConditionBadge from './ConditionBadge';
import { translations } from '../i18n/translations';

// Sample Seller History for demonstration
const SAMPLE_SELLER_HISTORY = [
  {
    id: 'off-hist-1',
    carModel: 'Geely Monjaro 2023',
    partNeeded: 'Бензонасос в сборе 2.0T',
    createdAgo: 'Сегодня, 14:20',
    status: 'contacted',
    variants: [
      { brand: 'Geely Genuine (Оригинал)', price: 45000, condition: 'New Original' },
      { brand: 'Bosch / Depo Tech', price: 28000, condition: 'New Aftermarket' }
    ]
  },
  {
    id: 'off-hist-2',
    carModel: 'BMW X5 E70 2010',
    partNeeded: 'Рулевая рейка гидравлическая',
    createdAgo: 'Вчера, 18:45',
    status: 'completed',
    variants: [
      { brand: 'BMW Genuine', price: 185000, condition: 'New Original' }
    ]
  }
];

export default function SellerMyOffers({ shop, lang }) {
  const t = translations[lang || 'ru'];
  const [history, setHistory] = useState(SAMPLE_SELLER_HISTORY);
  const [loading, setLoading] = useState(false);

  const formatKZT = (amount) => {
    return new Intl.NumberFormat('ru-RU').format(amount) + ' ₸';
  };

  useEffect(() => {
    const fetchHistory = async () => {
      if (!shop?.user_id) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/seller/my-offers/${shop.user_id}`);
        const data = await res.json();
        if (res.ok && data.length > 0) {
          setHistory(data);
        }
      } catch (e) {
        console.error('Error fetching seller history', e);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [shop?.user_id]);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header Dashboard Card */}
      <div style={{ background: 'var(--dark-slate)', color: '#fff', padding: '24px', borderRadius: 'var(--radius-lg)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Send size={24} style={{ color: 'var(--primary-emerald)' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 900 }}>
            {lang === 'kz' ? 'Менің ұсыныстарым мен тапсырыстар тарихы' : 'История моих предложений и заказов'}
          </h2>
        </div>
        <p style={{ fontSize: '13px', color: '#94A3B8' }}>
          {lang === 'kz' ? 'Сатып алушыларға жіберілген барлық баға нұсқалары мен статустар' : 'Все отправленные вами варианты цен и статусы общения с клиентами'}
        </p>

        {/* Stats Metrics */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(255,255,255,0.08)', padding: '10px 16px', borderRadius: '12px' }}>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>{lang === 'kz' ? 'Жіберілген ұсыныстар:' : 'Отправлено ответов:'}</div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--primary-emerald)' }}>{history.length}</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.08)', padding: '10px 16px', borderRadius: '12px' }}>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>{lang === 'kz' ? 'Статус:' : 'Статус бутика:'}</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#34D399', marginTop: '2px' }}>
              🟢 {shop?.shop_name || shop?.shopName || 'Автобутик'}
            </div>
          </div>
        </div>
      </div>

      {/* History Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {history.map(item => (
          <div key={item.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#065F46', background: '#ECFDF5', padding: '3px 10px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={12} /> {lang === 'kz' ? 'Жіберілді' : 'Отправлено водителю'}
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--dark-slate)', margin: '6px 0 2px 0' }}>
                  {item.carModel}
                </h3>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#334155' }}>
                  🔧 {item.partNeeded}
                </div>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', background: '#F1F5F9', padding: '4px 10px', borderRadius: '10px' }}>
                <Clock size={14} /> {item.createdAgo || 'Сегодня'}
              </div>
            </div>

            {/* Offered Variants */}
            <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                {lang === 'kz' ? 'Жіберілген марка/баға нұсқаларыңыз:' : 'Ваши отправленные варианты:'}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(item.variants || [{ brand: item.brand || 'Оригинал', price: item.price, condition: item.condition }]).map((v, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--dark-slate)' }}>
                        {v.brand}
                      </div>
                      <ConditionBadge condition={v.condition} />
                    </div>

                    <div style={{ fontSize: '17px', fontWeight: 900, color: 'var(--primary-emerald)' }}>
                      {formatKZT(v.price)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
