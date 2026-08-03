import React from 'react';
import { Car, ShoppingBag, PlusCircle, UserCheck, ShieldCheck, Wifi, Battery, Clock, Globe, Send, LogOut } from 'lucide-react';
import { translations } from '../i18n/translations';

export default function MobileFrame({ role, activeTab, setActiveTab, user, lang, setLang, onLogout, children }) {
  const t = translations[lang || 'ru'];
  const currentTime = '12:30';

  return (
    <div className="app-canvas">
      <div className="mobile-container">
        {/* Top Status Bar */}
        <div className="status-bar">
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} /> {currentTime}
          </span>
          <span style={{ fontWeight: 800, fontSize: '11px', letterSpacing: '1px', opacity: 0.8 }}>
            PARTDRIVE MOBILE
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Wifi size={14} />
            <Battery size={16} />
          </span>
        </div>

        {/* App Header (No Dual-Role Switcher Toggle!) */}
        <header className="app-header">
          <div className="brand-logo">
            <span style={{ background: 'var(--primary-emerald)', color: '#fff', width: '28px', height: '28px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Car size={18} />
            </span>
            <span>Part<span className="emerald-accent">Drive</span></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Language Switcher KZ / RU */}
            <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.1)', padding: '2px', borderRadius: '14px' }}>
              <button
                onClick={() => setLang('kz')}
                style={{
                  padding: '3px 7px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  background: lang === 'kz' ? 'var(--primary-emerald)' : 'transparent',
                  color: lang === 'kz' ? '#FFFFFF' : '#94A3B8'
                }}
              >
                KZ
              </button>
              <button
                onClick={() => setLang('ru')}
                style={{
                  padding: '3px 7px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  background: lang === 'ru' ? 'var(--primary-emerald)' : 'transparent',
                  color: lang === 'ru' ? '#FFFFFF' : '#94A3B8'
                }}
              >
                RU
              </button>
            </div>

            {/* Role Badge Indicator (STRICT ROLE DISPLAY, NO TOGGLE BUTTON) */}
            {user && (
              <span style={{
                background: user.role === 'Seller' ? '#10B981' : '#3B82F6',
                color: '#FFFFFF',
                padding: '4px 10px',
                borderRadius: '16px',
                fontSize: '11px',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {user.role === 'Seller' ? t.roleSellerBadge : t.roleDriverBadge}
              </span>
            )}

            {/* Logout Button */}
            {user && (
              <button
                onClick={onLogout}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#F87171',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title={t.logoutBtn}
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Content View */}
        <main className="content-area">
          {children}
        </main>

        {/* Fixed Role-Based Bottom Navigation Bar */}
        {user && user.role && (
          <nav className="bottom-nav">
            {user.role === 'Driver' ? (
              <>
                <button
                  className={`nav-item ${activeTab === 'my_requests' ? 'active' : ''}`}
                  onClick={() => setActiveTab('my_requests')}
                >
                  <Car />
                  <span>{t.navMyRequests}</span>
                </button>
                <button
                  className={`nav-item ${activeTab === 'new_request' ? 'active' : ''}`}
                  onClick={() => setActiveTab('new_request')}
                >
                  <PlusCircle size={26} style={{ color: 'var(--primary-emerald)' }} />
                  <span style={{ fontWeight: 800, color: 'var(--primary-emerald)' }}>{t.navCreateTender}</span>
                </button>
                <button
                  className={`nav-item ${activeTab === 'driver_profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('driver_profile')}
                >
                  <UserCheck />
                  <span>{t.navProfile}</span>
                </button>
              </>
            ) : (
              <>
                <button
                  className={`nav-item ${activeTab === 'tenders_feed' ? 'active' : ''}`}
                  onClick={() => setActiveTab('tenders_feed')}
                >
                  <ShoppingBag />
                  <span>{t.navTendersFeed}</span>
                </button>
                <button
                  className={`nav-item ${activeTab === 'my_offers' ? 'active' : ''}`}
                  onClick={() => setActiveTab('my_offers')}
                >
                  <Send />
                  <span>{t.navMyOffers}</span>
                </button>
                <button
                  className={`nav-item ${activeTab === 'shop_profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('shop_profile')}
                >
                  <UserCheck />
                  <span>{t.navMyShop}</span>
                </button>
              </>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}
