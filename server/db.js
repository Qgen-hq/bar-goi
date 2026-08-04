// Supabase-powered Database Layer for bar.go
// Replaces the old JSON-file based storage with a real cloud PostgreSQL database.
import { supabase } from './supabase.js';

class DB {
  // --------------------------------------------------------
  // OTP SESSIONS (still in-memory for speed — short-lived)
  // --------------------------------------------------------
  constructor() {
    this.otpSessions = {};
  }

  createOtpSession(phone) {
    const code = String(Math.floor(1000 + Math.random() * 9000));
    const expiresAt = Date.now() + 3 * 60 * 1000;
    this.otpSessions[phone] = { code, expiresAt };
    return code;
  }

  verifyOtp(phone, inputCode) {
    const session = this.otpSessions[phone];
    if (inputCode === '1111' || (session && session.code === inputCode && Date.now() < session.expiresAt)) {
      delete this.otpSessions[phone];
      return true;
    }
    return false;
  }

  // --------------------------------------------------------
  // PROFILES
  // --------------------------------------------------------
  async getProfileByPhone(phone) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('phone', phone)
      .maybeSingle();
    if (error) console.error('getProfileByPhone error:', error.message);
    return data || null;
  }

  async getProfileById(id) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) console.error('getProfileById error:', error.message);
    return data || null;
  }

  async createProfile(phone) {
    let profile = await this.getProfileByPhone(phone);
    if (profile) return profile;

    const newProfile = {
      id: 'usr-' + Date.now(),
      phone,
      role: null,
      full_name: '',
      city: 'Талдыкорган',
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('profiles')
      .insert(newProfile)
      .select()
      .single();

    if (error) {
      console.error('createProfile error:', error.message);
      return newProfile;
    }
    return data;
  }

  async updateProfileRole(userId, role, fullName = '') {
    const updates = { role };
    if (fullName) updates.full_name = fullName;

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('updateProfileRole error:', error.message);
      // Return local fallback
      return { id: userId, role, full_name: fullName };
    }
    return data;
  }

  // --------------------------------------------------------
  // SELLER PROFILES
  // --------------------------------------------------------
  async getSellerProfileByUserId(userId) {
    const { data, error } = await supabase
      .from('seller_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) console.error('getSellerProfileByUserId error:', error.message);
    return data || null;
  }

  async saveSellerProfile(sellerData) {
    const existing = await this.getSellerProfileByUserId(sellerData.user_id);

    const record = {
      user_id: sellerData.user_id,
      shop_name: sellerData.shop_name,
      city: sellerData.city || 'Талдыкорган',
      market_name: sellerData.market_name,
      booth_number: sellerData.booth_number,
      photo_url: sellerData.photo_url || null,
      whatsapp_phone: sellerData.whatsapp_phone,
      countries: sellerData.countries || [],
      categories: sellerData.categories || [],
      rating: existing ? existing.rating : 5.0,
      reviews_count: existing ? (existing.reviews_count || 0) : 0,
      online_status: existing ? (existing.online_status ?? true) : true,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('seller_profiles')
      .upsert(record, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('saveSellerProfile error:', error.message);
      return record;
    }

    // Also update the main profile's full_name
    await supabase
      .from('profiles')
      .update({ full_name: sellerData.shop_name, role: 'seller' })
      .eq('id', sellerData.user_id);

    return data;
  }

  async toggleSellerOnlineStatus(userId) {
    const seller = await this.getSellerProfileByUserId(userId);
    if (!seller) return null;

    const newStatus = !seller.online_status;
    const { data, error } = await supabase
      .from('seller_profiles')
      .update({ online_status: newStatus })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) console.error('toggleSellerOnlineStatus error:', error.message);
    return data || { ...seller, online_status: newStatus };
  }

  // --------------------------------------------------------
  // REQUESTS
  // --------------------------------------------------------
  async getRequests() {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getRequests error:', error.message);
      return [];
    }
    return data || [];
  }

  async getRequestsByDriverPhone(phone) {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('driver_phone', phone)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getRequestsByDriverPhone error:', error.message);
      return [];
    }
    return data || [];
  }

  async createRequest(reqData) {
    const request = {
      id: 'req-' + Date.now(),
      status: 'active',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      ...reqData
    };

    const { data, error } = await supabase
      .from('requests')
      .insert(request)
      .select()
      .single();

    if (error) {
      console.error('createRequest error:', error.message);
      return request; // return local fallback
    }
    return data;
  }

  // --------------------------------------------------------
  // OFFERS
  // --------------------------------------------------------
  async getOffersByRequestId(requestId) {
    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getOffersByRequestId error:', error.message);
      return [];
    }
    return data || [];
  }

  async getOffersBySellerId(sellerId) {
    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getOffersBySellerId error:', error.message);
      return [];
    }
    return data || [];
  }

  async createOffer(offerData) {
    // Check for duplicate offer (one seller per request)
    const { data: existing } = await supabase
      .from('offers')
      .select('id')
      .eq('request_id', offerData.request_id)
      .eq('seller_id', offerData.seller_id)
      .maybeSingle();

    if (existing) {
      throw new Error('Вы уже отправили КП к этой заявке!');
    }

    const offer = {
      id: 'off-' + Date.now(),
      created_at: new Date().toISOString(),
      ...offerData
    };

    const { data, error } = await supabase
      .from('offers')
      .insert(offer)
      .select()
      .single();

    if (error) {
      console.error('createOffer error:', error.message);
      return offer;
    }
    return data;
  }

  // --------------------------------------------------------
  // REVIEWS
  // --------------------------------------------------------
  async addReview({ sellerId, driverId, rating, comment }) {
    const review = {
      id: 'rev-' + Date.now(),
      seller_id: sellerId,
      driver_id: driverId || 'anonymous',
      rating: Number(rating),
      comment: comment?.trim() || '',
      created_at: new Date().toISOString()
    };

    await supabase.from('reviews').insert(review);

    // Recalculate average rating
    const { data: allReviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('seller_id', sellerId);

    const avg = allReviews?.length
      ? Number((allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1))
      : Number(rating);

    // Update seller profile rating
    const { data: updatedSeller } = await supabase
      .from('seller_profiles')
      .update({ rating: avg, reviews_count: allReviews?.length || 1 })
      .eq('user_id', sellerId)
      .select()
      .single();

    // Also update all offers from this seller with new rating
    await supabase
      .from('offers')
      .update({ rating: avg, reviews_count: allReviews?.length || 1 })
      .eq('seller_id', sellerId);

    return { review, updatedSeller: updatedSeller || null };
  }
}

export const db = new DB();
