// Unified Supabase-Aligned Persistent Database Store for PartDrive MVP
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'database.json');

const INITIAL_DATA = {
  otpSessions: {}, // { phone: { code, expiresAt } }
  profiles: [
    { id: 'usr-driver-1', phone: '+7 701 111 22 33', role: 'driver', full_name: 'Алмас Беков', created_at: new Date().toISOString() },
    { id: 'usr-seller-1', phone: '+7 777 999 88 77', role: 'seller', full_name: 'AutoZap Taldykorgan', created_at: new Date().toISOString() }
  ],
  seller_profiles: [
    {
      user_id: 'usr-seller-1',
      shop_name: 'German Parts (Бутик #42)',
      market_name: 'Талдыкорган - Центральный авторынок',
      booth_number: '2-й ряд, бутик 42',
      photo_url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=400&q=80',
      whatsapp_phone: '77779998877',
      countries: ['Germany', 'Japan'],
      categories: ['Engine', 'Suspension', 'Brakes', 'Electrical', 'Optics'],
      rating: 4.9,
      reviews_count: 12,
      online_status: true,
      created_at: new Date().toISOString()
    }
  ],
  requests: [
    {
      id: 'req-1',
      driver_id: 'usr-driver-1',
      driver_phone: '+7 701 111 22 33',
      car_model: 'BMW X5 E70 2010',
      part_name: 'Рулевая рейка гидравлическая',
      photos: [
        'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80'
      ],
      detected_country: 'Germany',
      detected_category: 'Suspension',
      status: 'active',
      created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() + 23 * 3600 * 1000 + 45 * 60 * 1000).toISOString()
    },
    {
      id: 'req-2',
      driver_id: 'usr-driver-2',
      driver_phone: '+7 702 333 44 55',
      car_model: 'Toyota Camry 40 2008',
      part_name: 'Помпа водяная охлаждения 2.4L',
      photos: [],
      detected_country: 'Japan',
      detected_category: 'Engine',
      status: 'active',
      created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() + 21 * 3600 * 1000).toISOString()
    }
  ],
  offers: [
    {
      id: 'off-1',
      request_id: 'req-1',
      seller_id: 'usr-seller-1',
      shop_name: 'German Parts (Бутик #42)',
      shop_phone: '+7 777 999 88 77',
      whatsapp_phone: '77779998877',
      market_name: 'Талдыкорган - Центральный авторынок',
      booth_number: '2-й ряд, бутик 42',
      rating: 4.9,
      reviews_count: 12,
      condition: 'new_orig',
      brand: 'BMW Genuine',
      price: 185000,
      created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString()
    }
  ],
  reviews: [
    {
      id: 'rev-1',
      seller_id: 'usr-seller-1',
      driver_id: 'usr-driver-1',
      rating: 5,
      comment: 'Отличная оригинал рейка, быстро отдали в бутики!',
      created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
    }
  ]
};

class DB {
  constructor() {
    this.data = INITIAL_DATA;
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
        if (!this.data.otpSessions) this.data.otpSessions = {};
        if (!this.data.profiles) this.data.profiles = INITIAL_DATA.profiles;
        if (!this.data.seller_profiles) this.data.seller_profiles = INITIAL_DATA.seller_profiles;
      } else {
        this.save();
      }
    } catch (e) {
      console.error('Error loading DB file', e);
      this.data = INITIAL_DATA;
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2));
    } catch (e) {
      console.error('Error saving DB file', e);
    }
  }

  // DYNAMIC UNIQUE OTP GENERATION
  createOtpSession(phone) {
    const code = String(Math.floor(1000 + Math.random() * 9000));
    const expiresAt = Date.now() + 3 * 60 * 1000; // 3 mins validity
    this.data.otpSessions[phone] = { code, expiresAt };
    this.save();
    return code;
  }

  verifyOtp(phone, inputCode) {
    const session = this.data.otpSessions[phone];
    // Allow '1111' test bypass as fallback or matching generated unique code
    if (inputCode === '1111' || (session && session.code === inputCode && Date.now() < session.expiresAt)) {
      delete this.data.otpSessions[phone];
      this.save();
      return true;
    }
    return false;
  }

  // PROFILE METHODS
  getProfileByPhone(phone) {
    return this.data.profiles.find(p => p.phone === phone);
  }

  getProfileById(id) {
    return this.data.profiles.find(p => p.id === id);
  }

  createProfile(phone) {
    let profile = this.getProfileByPhone(phone);
    if (!profile) {
      profile = {
        id: 'usr-' + Date.now(),
        phone,
        role: null,
        full_name: '',
        created_at: new Date().toISOString()
      };
      this.data.profiles.push(profile);
      this.save();
    }
    return profile;
  }

  updateProfileRole(userId, role, fullName = '') {
    const profile = this.getProfileById(userId);
    if (profile) {
      profile.role = role;
      if (fullName) profile.full_name = fullName;
      this.save();
    }
    return profile;
  }

  // SELLER PROFILE METHODS
  getSellerProfileByUserId(userId) {
    return this.data.seller_profiles.find(sp => sp.user_id === userId);
  }

  saveSellerProfile(sellerData) {
    const existingIndex = this.data.seller_profiles.findIndex(s => s.user_id === sellerData.user_id);
    const sellerProfile = {
      rating: existingIndex >= 0 ? this.data.seller_profiles[existingIndex].rating : 5.0,
      reviews_count: existingIndex >= 0 ? (this.data.seller_profiles[existingIndex].reviews_count || 0) : 0,
      online_status: existingIndex >= 0 ? (this.data.seller_profiles[existingIndex].online_status ?? true) : true,
      created_at: new Date().toISOString(),
      ...sellerData
    };

    if (existingIndex >= 0) {
      this.data.seller_profiles[existingIndex] = sellerProfile;
    } else {
      this.data.seller_profiles.push(sellerProfile);
    }

    const mainProfile = this.getProfileById(sellerData.user_id);
    if (mainProfile) {
      mainProfile.role = 'seller';
      mainProfile.full_name = sellerProfile.shop_name;
    }

    this.save();
    return sellerProfile;
  }

  toggleSellerOnlineStatus(userId) {
    const seller = this.getSellerProfileByUserId(userId);
    if (seller) {
      seller.online_status = !seller.online_status;
      this.save();
    }
    return seller;
  }

  // REQUESTS & OFFERS METHODS
  getRequests() {
    const now = new Date();
    return this.data.requests.filter(r => new Date(r.expires_at) > now);
  }

  getRequestsByDriverPhone(phone) {
    return this.getRequests().filter(r => r.driver_phone === phone);
  }

  createRequest(reqData) {
    const request = {
      id: 'req-' + Date.now(),
      status: 'active',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      ...reqData
    };
    this.data.requests.unshift(request);
    this.save();
    return request;
  }

  getOffersByRequestId(requestId) {
    return this.data.offers.filter(o => o.request_id === requestId);
  }

  getOffersBySellerId(sellerId) {
    return this.data.offers.filter(o => o.seller_id === sellerId);
  }

  createOffer(offerData) {
    const existing = this.data.offers.find(
      o => o.request_id === offerData.request_id && o.seller_id === offerData.seller_id
    );

    if (existing) {
      throw new Error('Вы уже отправили КП к этой заявке!');
    }

    const offer = {
      id: 'off-' + Date.now(),
      created_at: new Date().toISOString(),
      ...offerData
    };

    this.data.offers.unshift(offer);
    this.save();
    return offer;
  }

  // REVIEWS SYSTEM
  addReview({ sellerId, driverId, rating, comment }) {
    const review = {
      id: 'rev-' + Date.now(),
      seller_id: sellerId,
      driver_id: driverId || 'usr-driver-1',
      rating: Number(rating),
      comment: comment?.trim() || '',
      created_at: new Date().toISOString()
    };

    this.data.reviews.unshift(review);

    const sellerReviews = this.data.reviews.filter(r => r.seller_id === sellerId);
    const sum = sellerReviews.reduce((acc, curr) => acc + curr.rating, 0);
    const avg = Number((sum / sellerReviews.length).toFixed(1));

    const sellerIndex = this.data.seller_profiles.findIndex(s => s.user_id === sellerId);
    if (sellerIndex >= 0) {
      this.data.seller_profiles[sellerIndex].rating = avg;
      this.data.seller_profiles[sellerIndex].reviews_count = sellerReviews.length;
    }

    this.data.offers.forEach(o => {
      if (o.seller_id === sellerId) {
        o.rating = avg;
        o.reviews_count = sellerReviews.length;
      }
    });

    this.save();
    return {
      review,
      updatedSeller: sellerIndex >= 0 ? this.data.seller_profiles[sellerIndex] : null
    };
  }
}

export const db = new DB();
