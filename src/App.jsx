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
import { Bell, X } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('partdrive_lang') || 'ru');
  const [selectedCity, setSelectedCity] = useState(() => localStorage.getItem('partdrive_city') || 'Талдыкорган');
  
  const [user, setUser] = useState(() => {
    const u = safeParseJSON(localStorage.getItem('partdrive_user'), null);
    return (u && typeof u === 'object' && u.id && u.role) ? u : null;
  });

  const [profile, setProfile] = useState(() => {
    const p = safeParseJSON(localStorage.getItem('partdrive_profile'), null);
    return (p && typeof p === 'object') ? p : null;
  });

  const [authStep, setAuthStep] = useState(() => {
    const savedUser = safeParseJSON(localStorage.getItem('partdrive_user'), null);
    if (savedUser && savedUser.id && savedUser.role) {
      return 'MAIN';
    }
    if (savedUser && savedUser.id) {
      return 'ROLE_SELECT';
    }
    return 'WELCOME';
  });

  const [activeTab, setActiveTab] = useState('my_requests');
  
  // LocalStorage Request & Offer Persistence Cache (Survives Refresh F5!)
  const [requests, setRequests] = useState(() => {
    const parsed = safeParseJSON(localStorage.getItem('partdrive_requests'), []);
    return Array.isArray(parsed) ? parsed.filter(item => item && typeof item === 'object' && item.id) : [];
  });

  // LocalStorage Sent Seller Offers Cache (For 'Мои ответы и клиенты')
  const [mySentOffers, setMySentOffers] = useState(() => {
    const parsed = safeParseJSON(localStorage.getItem('partdrive_my_sent_offers'), []);
    return Array.isArray(parsed) ? parsed.filter(item => item && typeof item === 'object' && item.id) : [];
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
    const roleLower = String(user?.role || '').toLowerCase();
    if (roleLower === 'driver') {
      setActiveTab('my_requests');
    } else if (roleLower === 'seller') {
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
        const reqIds = data.map(r => r.id).filter(Boolean);
        let offersMap = {};
        if (reqIds.length > 0) {
          const { data: offersData } = await supabase
            .from('offers')
            .select('*')
            .in('request_id', reqIds);
          (offersData || []).forEach(o => {
            if (o && o.request_id) {
              if (!offersMap[o.request_id]) offersMap[o.request_id] = [];
              offersMap[o.request_id].push(o);
            }
          });
        }

        const enriched = data.filter(r => r && r.id).map(r => ({ ...r, offers: offersMap[r.id] || [] }));

        setRequests(prev => {
          const map = new Map();
          // Keep valid existing items
          (Array.isArray(prev) ? prev : []).forEach(item => {
            if (item && item.id) map.set(String(item.id), item);
          });
          // Merge fresh items from Supabase
          enriched.forEach(item => {
            if (item && item.id) {
              const existing = map.get(String(item.id)) || {};
              map.set(String(item.id), { ...existing, ...item });
            }
          });
          const merged = Array.from(map.values()).sort((a, b) => new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0));
          localStorage.setItem('partdrive_requests', JSON.stringify(merged));
          return merged;
        });
      }
    } catch (e) {
      console.error('Supabase fetch error, using local state/cache:', e?.message || e);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (authStep === 'MAIN') {
      fetchRequests();
    }
  }, [authStep, user?.phone, user?.role]);

  const [pushNotification, setPushNotification] = useState(null);

  // Real-Time Supabase Postgres Changes Subscription & Push Notification
  useEffect(() => {
    if (authStep !== 'MAIN') return;

    const channel = supabase
      .channel('public:realtime_updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'requests' }, (payload) => {
        const newReq = payload.new;
        if (newReq) {
          setPushNotification({
            id: newReq.id,
            carModel: newReq.car_model || newReq.carModel || 'Автомобиль',
            partName: newReq.part_name || newReq.partNeeded || 'Запчасть'
          });
          if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        }
        fetchRequests();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'requests' }, () => {
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
    const rawRole = updatedUser?.role || user?.role || (updatedProfile?.shop_name ? 'seller' : 'driver');
    const finalRole = String(rawRole).toLowerCase();
    const finalUser = { ...(updatedUser || user || {}), role: finalRole };

    setUser(finalUser);
    setProfile(updatedProfile);
    localStorage.setItem('partdrive_user', JSON.stringify(finalUser));
    localStorage.setItem('partdrive_profile', JSON.stringify(updatedProfile));

    if (finalUser?.city) handleSetCity(finalUser.city);
    setAuthStep('MAIN');
    setActiveTab(finalRole === 'seller' ? 'tenders_feed' : 'my_requests');
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
      {/* IN-APP REALTIME PUSH NOTIFICATION TOAST */}
      {pushNotification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 3000,
          width: '92%',
          maxWidth: '460px',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          color: '#FFFFFF',
          border: '2px solid var(--primary-emerald)',
          borderRadius: '18px',
          padding: '12px 16px',
          boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'var(--primary-emerald)', color: '#fff', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Bell size={20} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#34D399', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                🔔 {lang === 'kz' ? 'ЖАҢА СҰРАНЫС КЕЛДІ!' : 'НОВЫЙ ЗАПРОС НА ДЕТАЛЬ!'}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>
                {pushNotification.carModel} — {pushNotification.partName}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => {
                setActiveTab('tenders_feed');
                setPushNotification(null);
              }}
              style={{
                background: 'var(--primary-emerald)',
                color: '#FFFFFF',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 900,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {lang === 'kz' ? 'Көру' : 'Посмотреть'}
            </button>

            <button
              onClick={() => setPushNotification(null)}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', color: '#94A3B8', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

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
