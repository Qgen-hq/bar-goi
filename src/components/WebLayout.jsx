import React from 'react';
import { ShoppingBag, PlusCircle, User, Store, LogOut, Zap, Shield, Sparkles, MessageSquare } from 'lucide-react';
import { translations } from '../i18n/translations';

export default function WebLayout({ role, activeTab, setActiveTab, user, lang, setLang, onLogout, children }) {
  const t = translations[lang || 'ru'];
  const isDriver = role === 'Driver' || role === 'driver';
  const isSeller = role === 'Seller' || role === 'seller';

  return (
    <div className="web-app-canvas">
      {/* GLASSMORPHIC TOP NAVBAR */}
      <header className="web-navbar">
        <div className="web-navbar-container">
          <div className="nav-logo-group" onClick={() => setActiveTab(isDriver ? 'my_requests' : 'tenders_feed')}>
            <div style={{ width: '36px', height: '36px', background: 'var(--primary-emerald)', color: '#fff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={22} fill="#FFFFFF" />
            </div>
            <div>
              <span className="nav-brand-title">Bar<span className="nav-brand-accent">Goi</span></span>
              <span style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginTop: '-4px', fontWeight: 700 }}>
                Талдықорған автобөлшектер
              </span>
            </div>
          </div>

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

            {/* Language Switcher */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '3px', marginLeft: '10px' }}>
              <button
                onClick={() => setLang('kz')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 800,
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
                  padding: '4px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: lang === 'ru' ? 'var(--primary-emerald)' : 'transparent',
                  color: lang === 'ru' ? '#FFFFFF' : '#94A3B8'
                }}
              >
                RU
              </button>
            </div>

            {user && (
              <button onClick={onLogout} className="nav-tab-btn" style={{ color: '#F87171' }} title={t.logoutBtn}>
                <LogOut size={16} />
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
