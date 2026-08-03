import React from 'react';
import { Car, ShoppingBag, PlusCircle, UserCheck, LogOut, Globe, Send, Zap } from 'lucide-react';
import { translations } from '../i18n/translations';

export default function WebLayout({ role, activeTab, setActiveTab, user, lang, setLang, onLogout, children }) {
  const t = translations[lang || 'ru'];

  return (
    <div className="web-app-canvas">
      {/* Responsive Top Desktop Navbar */}
      <header className="web-navbar">
        <div className="web-navbar-inner">
          <div className="brand-logo" onClick={() => setActiveTab(role === 'Seller' ? 'tenders_feed' : 'my_requests')}>
            <span style={{ background: 'var(--primary-emerald)', color: '#fff', width: '36px', height: '36px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px var(--primary-emerald-glow)' }}>
              <Zap size={22} fill="#FFFFFF" />
            </span>
            <span>Bar<span className="emerald-accent">Goi</span></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Global Language Switcher KZ / RU */}
            <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.1)', padding: '3px', borderRadius: '14px' }}>
              <button
                onClick={() => setLang('kz')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 900,
                  border: 'none',
                  cursor: 'pointer',
                  background: lang === 'kz' ? 'var(--primary-emerald)' : 'transparent',
                  color: lang === 'kz' ? '#FFFFFF' : '#94A3B8'
                }}
              >
                🇰🇿 KZ
              </button>
              <button
                onClick={() => setLang('ru')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 900,
                  border: 'none',
                  cursor: 'pointer',
                  background: lang === 'ru' ? 'var(--primary-emerald)' : 'transparent',
                  color: lang === 'ru' ? '#FFFFFF' : '#94A3B8'
                }}
              >
                🇷🇺 RU
              </button>
            </div>

            {/* Role Badge Indicator */}
            {user && (
              <span style={{
                background: user.role === 'Seller' || user.role === 'seller' ? '#10B981' : '#3B82F6',
                color: '#FFFFFF',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                {user.role === 'Seller' || user.role === 'seller' ? t.roleSellerBadge : t.roleDriverBadge}
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
                  padding: '6px 14px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <LogOut size={16} />
                <span>{t.logoutBtn}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Responsive Web Content View */}
      <main className="web-container">
        {children}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar */}
      {user && user.role && (
        <nav className="bottom-nav-mobile">
          {user.role === 'Driver' || user.role === 'driver' ? (
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
                <PlusCircle size={24} style={{ color: 'var(--primary-emerald)' }} />
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
  );
}
