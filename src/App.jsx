import React, { useState, useEffect } from 'react';
import WebLayout from './components/WebLayout';
import SplashScreen from './components/SplashScreen';
import RoleSelectionScreen from './components/RoleSelectionScreen';
import DriverOnboarding from './components/DriverOnboarding';
import SellerOnboarding from './components/SellerOnboarding';
import DriverRequestForm from './components/DriverRequestForm';
import DriverRequestsList from './components/DriverRequestsList';
import DriverProfile from './components/DriverProfile';
import SellerTendersFeed from './components/SellerTendersFeed';
import SellerMyOffers from './components/SellerMyOffers';
import AuthModal from './components/AuthModal';

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('partdrive_lang') || 'ru');
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('partdrive_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('partdrive_profile');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [authStep, setAuthStep] = useState(() => {
    try {
      const savedUser = localStorage.getItem('partdrive_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (!parsed.role) return 'ROLE_SELECT';
        return 'MAIN';
      }
    } catch (e) {}
    return 'WELCOME';
  });

  const [intentRole, setIntentRole] = useState(null);
  const [activeTab, setActiveTab] = useState('my_requests');
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleSetLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('partdrive_lang', newLang);
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem('partdrive_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('partdrive_user');
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      localStorage.setItem('partdrive_profile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('partdrive_profile');
    }
  }, [profile]);

  useEffect(() => {
    if (user?.role === 'Driver' || user?.role === 'driver') {
      setActiveTab('my_requests');
    } else if (user?.role === 'Seller' || user?.role === 'seller') {
      setActiveTab('tenders_feed');
    }
  }, [user?.role]);

  const fetchRequests = async () => {
    setLoadingRequests(true);
    try {
      const isDriver = (user?.role === 'Driver' || user?.role === 'driver');
      const endpoint = isDriver && user?.phone
        ? `/api/driver/my-requests/${encodeURIComponent(user.phone)}`
        : '/api/requests';

      const res = await fetch(endpoint);
      const data = await res.json();
      setRequests(data);
    } catch (e) {
      console.error('Error fetching requests', e);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (authStep === 'MAIN') {
      fetchRequests();
    }
  }, [authStep, user?.phone, user?.role]);

  // Real-Time WebSocket Connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.hostname}:3001`;
    let ws;

    try {
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'NEW_REQUEST') {
            setRequests(prev => {
              if (prev.some(r => r.id === message.payload.id)) return prev;
              return [message.payload, ...prev];
            });
          } else if (message.type === 'NEW_OFFER') {
            const offer = message.payload;
            setRequests(prev => prev.map(req => {
              if (req.id === offer.requestId || req.id === offer.request_id) {
                const existingOffers = req.offers || [];
                if (existingOffers.some(o => o.id === offer.id)) return req;
                return {
                  ...req,
                  offers: [offer, ...existingOffers]
                };
              }
              return req;
            }));
          } else if (message.type === 'SHOP_RATING_UPDATED') {
            const { sellerId, newRating, reviewsCount } = message.payload;
            setRequests(prev => prev.map(req => ({
              ...req,
              offers: (req.offers || []).map(o => {
                if (o.seller_id === sellerId || o.shopId === sellerId) {
                  return { ...o, rating: newRating, reviews_count: reviewsCount, reviewsCount: reviewsCount };
                }
                return o;
              })
            })));
          }
        } catch (err) {
          console.error('Error handling WS msg', err);
        }
      };
    } catch (err) {
      console.error('WebSocket connection error', err);
    }

    return () => {
      if (ws) ws.close();
    };
  }, []);

  const handleStartAuth = (selectedIntentRole) => {
    setIntentRole(selectedIntentRole);
    setIsAuthOpen(true);
  };

  const handleAuthSuccess = (loginData) => {
    const u = loginData.profile || loginData.user;
    setUser(u);
    setIsAuthOpen(false);

    if (loginData.requiresOnboarding) {
      setProfile(null);
      setAuthStep('ONBOARDING');
    } else {
      setProfile(loginData.sellerProfile || loginData.profile || u);
      setAuthStep('MAIN');
    }
  };

  const handleSelectRole = (selectedRole) => {
    const updatedUser = { ...user, role: selectedRole };
    setUser(updatedUser);
    localStorage.setItem('partdrive_user', JSON.stringify(updatedUser));
    setAuthStep('ONBOARDING');
  };

  const handleOnboardingComplete = (updatedUser, updatedProfile) => {
    if (updatedUser) setUser(updatedUser);
    if (updatedProfile) setProfile(updatedProfile);
    setAuthStep('MAIN');
    setActiveTab(updatedUser?.role === 'seller' ? 'tenders_feed' : 'my_requests');
  };

  const handleLogout = () => {
    setUser(null);
    setProfile(null);
    setIntentRole(null);
    localStorage.removeItem('partdrive_user');
    localStorage.removeItem('partdrive_profile');
    setAuthStep('WELCOME');
  };

  const handleRequestSubmitted = (newReq) => {
    setRequests(prev => [newReq, ...prev]);
    setActiveTab('my_requests');
  };

  const handleOfferSubmitted = (reqId, newOffer) => {
    setRequests(prev => prev.map(r => {
      if (r.id === reqId) {
        const existing = r.offers || [];
        if (existing.some(o => o.id === newOffer.id)) return r;
        return { ...r, offers: [newOffer, ...existing] };
      }
      return r;
    }));
  };

  const handleReviewSubmitted = (updatedSeller) => {
    if (updatedSeller) {
      setRequests(prev => prev.map(req => ({
        ...req,
        offers: (req.offers || []).map(o => {
          if (o.seller_id === updatedSeller.user_id || o.shopId === updatedSeller.user_id) {
            return { ...o, rating: updatedSeller.rating, reviews_count: updatedSeller.reviews_count };
          }
          return o;
        })
      })));
    }
  };

  return (
    <WebLayout
      role={user?.role}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      user={user}
      lang={lang}
      setLang={handleSetLang}
      onLogout={handleLogout}
    >
      {/* SCREEN 0: SPLASH & WELCOME */}
      {authStep === 'WELCOME' && (
        <SplashScreen
          lang={lang}
          setLang={handleSetLang}
          onStart={handleStartAuth}
        />
      )}

      {/* SCREEN 1: ROLE SELECTION CARDS */}
      {authStep === 'ROLE_SELECT' && (
        <RoleSelectionScreen
          lang={lang}
          onSelectRole={handleSelectRole}
        />
      )}

      {/* SCREEN 3: ROLE ONBOARDING */}
      {authStep === 'ONBOARDING' && (
        user?.role === 'Driver' || user?.role === 'driver' ? (
          <DriverOnboarding
            user={user}
            lang={lang}
            onSaveProfile={(u, p) => handleOnboardingComplete(u, p)}
          />
        ) : (
          <SellerOnboarding
            user={user}
            shop={profile}
            lang={lang}
            onSaveShop={(p) => handleOnboardingComplete(user, p)}
            onBackToFeed={() => {
              setAuthStep('MAIN');
              setActiveTab('tenders_feed');
            }}
          />
        )
      )}

      {/* SCREEN D: MAIN RESPONSIVE WEB DASHBOARD */}
      {authStep === 'MAIN' && (
        user?.role === 'Driver' || user?.role === 'driver' ? (
          /* DRIVER INTERFACE ONLY */
          activeTab === 'driver_profile' ? (
            <DriverProfile
              user={user}
              requests={requests}
              lang={lang}
              onLogout={handleLogout}
            />
          ) : activeTab === 'new_request' ? (
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <DriverRequestForm
                user={user}
                lang={lang}
                onRequestSubmitted={handleRequestSubmitted}
              />
            </div>
          ) : (
            <div className="grid-desktop-2col">
              <div>
                <DriverRequestsList
                  requests={requests}
                  loadingRequests={loadingRequests}
                  lang={lang}
                  userPhone={user?.phone}
                  onRefresh={fetchRequests}
                  onReviewSubmitted={handleReviewSubmitted}
                />
              </div>
              <div>
                <DriverRequestForm
                  user={user}
                  lang={lang}
                  onRequestSubmitted={handleRequestSubmitted}
                />
              </div>
            </div>
          )
        ) : (
          /* SELLER INTERFACE ONLY */
          activeTab === 'shop_profile' ? (
            <SellerOnboarding
              user={user}
              shop={profile}
              lang={lang}
              onSaveShop={(updatedShop) => {
                setProfile(updatedShop);
                setActiveTab('tenders_feed');
              }}
              onBackToFeed={() => setActiveTab('tenders_feed')}
            />
          ) : activeTab === 'my_offers' ? (
            <SellerMyOffers
              shop={profile}
              lang={lang}
            />
          ) : (
            <SellerTendersFeed
              shop={profile}
              requests={requests}
              lang={lang}
              onSubmitOffer={handleOfferSubmitted}
              onOpenShopSetup={() => setActiveTab('shop_profile')}
            />
          )
        )
      )}

      {/* AUTHENTICATION MODAL */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        intentRole={intentRole}
        lang={lang}
      />
    </WebLayout>
  );
}
