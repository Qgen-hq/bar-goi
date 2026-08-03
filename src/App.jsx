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
  const [selectedCity, setSelectedCity] = useState(() => localStorage.getItem('partdrive_city') || 'Талдыкорган');
  
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

  const [activeTab, setActiveTab] = useState('my_requests');
  
  // LocalStorage Request & Offer Persistence Cache (Survives Refresh F5!)
  const [requests, setRequests] = useState(() => {
    try {
      const saved = localStorage.getItem('partdrive_requests');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // LocalStorage Sent Seller Offers Cache (For 'Мои ответы и клиенты')
  const [mySentOffers, setMySentOffers] = useState(() => {
    try {
      const saved = localStorage.getItem('partdrive_my_sent_offers');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [loadingRequests, setLoadingRequests] = useState(false);

  const handleSetLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('partdrive_lang', newLang);
  };

  const handleSetCity = (newCity) => {
    setSelectedCity(newCity);
    localStorage.setItem('partdrive_city', newCity);
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
    if (requests && requests.length > 0) {
      localStorage.setItem('partdrive_requests', JSON.stringify(requests));
    }
  }, [requests]);

  useEffect(() => {
    if (mySentOffers && mySentOffers.length > 0) {
      localStorage.setItem('partdrive_my_sent_offers', JSON.stringify(mySentOffers));
    }
  }, [mySentOffers]);

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
      
      if (Array.isArray(data)) {
        setRequests(prev => {
          const merged = [...data];
          prev.forEach(localItem => {
            if (!merged.some(m => m.id === localItem.id)) {
              merged.unshift(localItem);
            }
          });
          return merged;
        });
      }
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

  const handleStartRoleFlow = (selectedRole) => {
    const newUser = { id: 'usr-' + Date.now(), role: selectedRole };
    setUser(newUser);
    setAuthStep('ONBOARDING');
  };

  const handleOnboardingComplete = (updatedUser, updatedProfile) => {
    if (updatedUser) setUser(updatedUser);
    if (updatedProfile) setProfile(updatedProfile);
    if (updatedUser?.city) handleSetCity(updatedUser.city);
    setAuthStep('MAIN');
    setActiveTab(updatedUser?.role === 'seller' ? 'tenders_feed' : 'my_requests');
  };

  const handleLogout = () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('partdrive_user');
    localStorage.removeItem('partdrive_profile');
    setAuthStep('WELCOME');
  };

  const handleUpdateDriverProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('partdrive_user', JSON.stringify(updatedUser));
    if (updatedUser?.city) handleSetCity(updatedUser.city);
  };

  const handleRequestSubmitted = (newReq) => {
    const enrichedReq = {
      ...newReq,
      city: selectedCity,
      driverPhone: user?.phone || newReq.driverPhone || '+7 701 111 22 33',
      driver_phone: user?.phone || newReq.driverPhone || '+7 701 111 22 33',
      createdAgo: 'Только что'
    };

    setRequests(prev => [enrichedReq, ...prev]);
    setActiveTab('my_requests');
  };

  const handleOfferSubmitted = (reqId, newOffer, tenderInfo) => {
    // 1. Update requests list
    setRequests(prev => prev.map(r => {
      if (r.id === reqId) {
        const existing = r.offers || [];
        if (existing.some(o => o.id === newOffer.id)) return r;
        return { ...r, offers: [newOffer, ...existing] };
      }
      return r;
    }));

    // 2. Prepend to seller's sent offers feed ('Мои ответы и клиенты')
    const enrichedSentOffer = {
      ...newOffer,
      carModel: tenderInfo?.carModel || tenderInfo?.car_model || 'Автомобиль',
      partNeeded: tenderInfo?.partNeeded || tenderInfo?.part_name || 'Деталь',
      driverPhone: tenderInfo?.driverPhone || tenderInfo?.driver_phone || '77779998877',
      createdAgo: 'Только что',
      status: 'SENT'
    };

    setMySentOffers(prev => [enrichedSentOffer, ...prev]);
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
      selectedCity={selectedCity}
      setSelectedCity={handleSetCity}
      lang={lang}
      setLang={handleSetLang}
      onLogout={handleLogout}
    >
      {/* SCREEN 0: SPLASH & WELCOME */}
      {authStep === 'WELCOME' && (
        <SplashScreen
          lang={lang}
          setLang={handleSetLang}
          onStart={handleStartRoleFlow}
        />
      )}

      {/* SCREEN 1: ALL-IN-ONE ROLE ONBOARDING */}
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
              onUpdateProfile={handleUpdateDriverProfile}
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
              mySentOffers={mySentOffers}
              lang={lang}
            />
          ) : (
            <SellerTendersFeed
              shop={profile}
              requests={requests}
              mySentOffers={mySentOffers}
              lang={lang}
              onSubmitOffer={handleOfferSubmitted}
              onOpenShopSetup={() => setActiveTab('shop_profile')}
              onLogout={handleLogout}
            />
          )
        )
      )}
    </WebLayout>
  );
}
