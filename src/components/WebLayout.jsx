import React from 'react';
import { ShoppingBag, PlusCircle, User, Store, LogOut, Zap, MessageSquare } from 'lucide-react';
import { translations } from '../i18n/translations';

export default function WebLayout({ role, activeTab, setActiveTab, user, lang, setLang, onLogout, children }) {
  const t = translations[lang || 'ru'];
  const isDriver = role === 'Driver' || role === 'driver';
  const isSeller = role === 'Seller' || role === 'seller';

  return (
    <div className="web-app-canvas">
      {/* GLASSMORPHIC SPACIOUS TOP NAVBAR */}
      <header className="web-navbar">
        <div className="web-navbar-container">

          {/* LEFT: ANIMATED BAR.GO SVG LOGO & TITLE */}
          <div className="nav-logo-group" onClick={() => setActiveTab(isDriver ? 'my_requests' : 'tenders_feed')}>
            <div style={{ width: '40px', height: '40px', background: 'var(--primary-emerald)', color: '#fff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 14px var(--primary-emerald-glow)', animation: 'pulseGlow 3s infinite' }}>
              <Zap size={24} fill="#FFFFFF" />
            </div>
            <div>
              <span className="nav-brand-title" style={{ fontSize: '24px', lineHeight: 1, letterSpacing: '-0.5px' }}>
                bar<span className="nav-brand-accent" style={{ color: 'var(--primary-emerald)' }}>.go</span>
              </span>
              <span style={{ fontSize: '10px', color: '#94A3B8', display: 'block', marginTop: '2px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                {lang === 'kz' ? 'Автобөлшектер сервисі' : 'Сервис автозапчастей'}
              </span>
            </div>
          </div>

          {/* RIGHT SIDE GROUP: DESKTOP NAVIGATION + LANGUAGE SWITCHER + STRICT 'ВЫЙТИ' BUTTON */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Desktop Navigation Items */}
            <div className="nav-tabs-desktop">
              {isDriver && (
                <>
                  <button
                    className={`nav-tab-btn ${activeTab === 'my_requests' ? 'active' : ''}`}
                    onClick={() => setActiveTab('my_requests')}
                  >
                    <ShoppingBag size={16} />
                    <span>{t.navMyRequests}</span>
                  </button>

                  <button
                    className={`nav-tab-btn ${activeTab === 'new_request' ? 'active' : ''}`}
                    onClick={() => setActiveTab('new_request')}
                  >
                    <PlusCircle size={16} />
                    <span>{t.navCreateTender}</span>
                  </button>

                  <button
                    className={`nav-tab-btn ${activeTab === 'driver_profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('driver_profile')}
                  >
                    <User size={16} />
                    <span>{t.navProfile}</span>
                  </button>
                </>
              )}

              {isSeller && (
                <>
                  <button
                    className={`nav-tab-btn ${activeTab === 'tenders_feed' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tenders_feed')}
                  >
                    <ShoppingBag size={16} />
                    <span>{t.navTendersFeed}</span>
                  </button>

                  <button
                    className={`nav-tab-btn ${activeTab === 'my_offers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('my_offers')}
                  >
                    <MessageSquare size={16} />
                    <span>{t.navMyOffers}</span>
                  </button>

                  <button
                    className={`nav-tab-btn ${activeTab === 'shop_profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('shop_profile')}
                  >
                    <Store size={16} />
                    <span>{t.navMyShop}</span>
                  </button>
                </>
              )}
            </div>

            {/* UNIVERSAL LANGUAGE SWITCHER */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', padding: '3px' }}>
              <button
                type="button"
                onClick={() => setLang('kz')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  background: lang === 'kz' ? 'var(--primary-emerald)' : 'transparent',
                  color: lang === 'kz' ? '#FFFFFF' : '#94A3B8',
                  transition: 'all 0.2s ease'
                }}
              >
                KZ
              </button>

              <button
                type="button"
                onClick={() => setLang('ru')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  background: lang === 'ru' ? 'var(--primary-emerald)' : 'transparent',
                  color: lang === 'ru' ? '#FFFFFF' : '#94A3B8',
                  transition: 'all 0.2s ease'
                }}
              >
                RU
              </button>
            </div>

            {/* STRICT 'ВЫЙТИ' LOGOUT BUTTON */}
            {user && (
              <button
                onClick={onLogout}
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid #EF4444',
                  color: '#F87171',
                  padding: '6px 14px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
                title={lang === 'kz' ? 'Шығу' : 'Выйти'}
              >
                <LogOut size={15} />
                <span>{lang === 'kz' ? 'Шығу' : 'Выйти'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN VIEWPORT */}
      <main className="web-main-content">
        {children}
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="mobile-bottom-nav">
        {isDriver && (
          <>
            <button
              className={`mobile-nav-item ${activeTab === 'my_requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('my_requests')}
            >
              <ShoppingBag size={20} />
              <span>{lang === 'kz' ? 'Сұраныстар' : 'Запросы'}</span>
            </button>

            <button
              className={`mobile-nav-item ${activeTab === 'new_request' ? 'active' : ''}`}
              onClick={() => setActiveTab('new_request')}
            >
              <PlusCircle size={22} color="var(--primary-emerald)" />
              <span>{lang === 'kz' ? '+ Іздеу' : '+ Найти деталь'}</span>
            </button>

            <button
              className={`mobile-nav-item ${activeTab === 'driver_profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('driver_profile')}
            >
              <User size={20} />
              <span>{lang === 'kz' ? 'Профиль' : 'Профиль'}</span>
            </button>
          </>
        )}

        {isSeller && (
          <>
            <button
              className={`mobile-nav-item ${activeTab === 'tenders_feed' ? 'active' : ''}`}
              onClick={() => setActiveTab('tenders_feed')}
            >
              <ShoppingBag size={20} />
              <span>{lang === 'kz' ? 'Сұраныстар' : 'Запросы'}</span>
            </button>

            <button
              className={`mobile-nav-item ${activeTab === 'my_offers' ? 'active' : ''}`}
              onClick={() => setActiveTab('my_offers')}
            >
              <MessageSquare size={20} />
              <span>{lang === 'kz' ? 'Ответтер' : 'Мои ответы'}</span>
            </button>

            <button
              className={`mobile-nav-item ${activeTab === 'shop_profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('shop_profile')}
            >
              <Store size={20} />
              <span>{lang === 'kz' ? 'Бутик' : 'Профиль'}</span>
            </button>
          </>
        )}
      </nav>
    </div>
  );
}
