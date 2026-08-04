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
import { safeParseJSON } from './utils/security';
import { supabase } from './lib/supabase';

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('partdrive_lang') || 'ru');
  const [selectedCity, setSelectedCity] = useState(() => localStorage.getItem('partdrive_city') || 'Талдыкорган');
  
  const [user, setUser] = useState(() => safeParseJSON(localStorage.getItem('partdrive_user'), null));
  const [profile, setProfile] = useState(() => safeParseJSON(localStorage.getItem('partdrive_profile'), null));

  const [authStep, setAuthStep] = useState(() => {
    const savedUser = safeParseJSON(localStorage.getItem('partdrive_user'), null);
    if (savedUser) {
      if (!savedUser.role) return 'ROLE_SELECT';
      return 'MAIN';
    }
    return 'WELCOME';
  });

  const [activeTab, setActiveTab] = useState('my_requests');
  
  // LocalStorage Request & Offer Persistence Cache (Survives Refresh F5!)
  const [requests, setRequests] = useState(() => safeParseJSON(localStorage.getItem('partdrive_requests'), []));

  // LocalStorage Sent Seller Offers Cache (For 'Мои ответы и клиенты')
  const [mySentOffers, setMySentOffers] = useState(() => safeParseJSON(localStorage.getItem('partdrive_my_sent_offers'), []));

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
      // Query active requests from Supabase across all devices
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (Array.isArray(data)) {
        const reqIds = data.map(r => r.id);
        let offersMap = {};
        if (reqIds.length > 0) {
          const { data: offersData } = await supabase
            .from('offers')
            .select('*')
            .in('request_id', reqIds);
          (offersData || []).forEach(o => {
            if (!offersMap[o.request_id]) offersMap[o.request_id] = [];
            offersMap[o.request_id].push(o);
          });
        }

        const enriched = data.map(r => ({ ...r, offers: offersMap[r.id] || [] }));

        setRequests(prev => {
          const map = new Map();
          // Keep existing items in state first
          prev.forEach(item => map.set(item.id, item));
          // Merge fresh items from Supabase
          enriched.forEach(item => map.set(item.id, { ...map.get(item.id), ...item }));
          const merged = Array.from(map.values()).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
          localStorage.setItem('partdrive_requests', JSON.stringify(merged));
          return merged;
        });
      }
    } catch (e) {
      console.error('Supabase fetch error, using local state/cache:', e.message);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (authStep === 'MAIN') {
      fetchRequests();
    }
  }, [authStep, user?.phone, user?.role]);

  // Real-Time Supabase Postgres Changes Subscription
  useEffect(() => {
    if (authStep !== 'MAIN') return;

    const channel = supabase
      .channel('public:realtime_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, () => {
        fetchRequests();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'offers' }, () => {
        fetchRequests();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authStep]);

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
      driverPhone: user?.phone || newReq.driverPhone || '',
      driver_phone: user?.phone || newReq.driver_phone || '',
      createdAgo: 'Только что',
      offers: newReq.offers || []
    };

    setRequests(prev => {
      const updated = [enrichedReq, ...prev];
      // Immediately persist to localStorage so refresh never loses it
      localStorage.setItem('partdrive_requests', JSON.stringify(updated));
      return updated;
    });
    setActiveTab('my_requests');
  };

  const handleOfferSubmitted = (reqId, newOffer, tenderInfo) => {
    setRequests(prev => prev.map(r => {
      if (r.id === reqId) {
        const existing = r.offers || [];
        if (existing.some(o => o.id === newOffer.id)) return r;
        return { ...r, offers: [newOffer, ...existing] };
      }
      return r;
    }));

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
