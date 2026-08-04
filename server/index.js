import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import { db } from './db.js';
import { autoClassify, CAR_ORIGINS, PART_CATEGORIES } from './classifier.js';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Anti-XSS Sanitizer Helper
function sanitizeText(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/onerror\s*=/gi, '')
    .trim();
}

function broadcast(type, payload) {
  const msg = JSON.stringify({ type, payload });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

// ----------------------------------------------------
// AUTHENTICATION API (INTENT-BASED ROLE ROUTING)
// ----------------------------------------------------

// Direct Phone Login with Intent Role support
app.post('/api/auth/login', (req, res) => {
  const { phone, intentRole } = req.body;

  if (!phone || typeof phone !== 'string' || phone.trim().length < 10) {
    return res.status(400).json({ error: 'Введите корректный номер телефона' });
  }

  const cleanPhone = sanitizeText(phone.trim());
  let profile = db.getProfileByPhone(cleanPhone);

  const targetRole = intentRole ? (intentRole.toLowerCase() === 'seller' ? 'seller' : 'driver') : null;

  if (!profile) {
    profile = db.createProfile(cleanPhone);
    if (targetRole) {
      profile.role = targetRole;
      db.updateProfileRole(profile.id, targetRole, '');
    }
  } else if (targetRole) {
    profile.role = targetRole;
    db.updateProfileRole(profile.id, targetRole, profile.full_name || '');
  }

  const activeRole = profile.role || targetRole;
  let sellerProfile = null;
  
  if (activeRole === 'seller') {
    sellerProfile = db.getSellerProfileByUserId(profile.id);
  }

  const requiresOnboarding = activeRole === 'driver'
    ? (!profile.full_name || profile.full_name.trim() === '')
    : (!sellerProfile);

  res.json({
    success: true,
    profile: { ...profile, role: activeRole },
    sellerProfile,
    requiresRoleSelection: !activeRole,
    requiresOnboarding
  });
});

// Complete Role-Specific Onboarding
app.post('/api/auth/complete-onboarding', (req, res) => {
  const { userId, role, driverData, sellerData } = req.body;

  let profile = db.getProfileById(userId);
  if (!profile) return res.status(404).json({ error: 'Профиль не найден' });

  const targetRole = (role || '').toLowerCase() === 'seller' ? 'seller' : 'driver';

  if (targetRole === 'driver') {
    const fullName = sanitizeText(driverData?.fullName || 'Водитель');
    profile = db.updateProfileRole(userId, 'driver', fullName);
    res.json({ success: true, profile: { ...profile, role: 'driver' }, sellerProfile: null });
  } else if (targetRole === 'seller') {
    const { shopName, city, marketName, boothNumber, storefrontPhoto, whatsappPhone, countries, categories } = sellerData || {};

    if (!shopName || !whatsappPhone || !marketName || !boothNumber || !countries?.length || !categories?.length) {
      return res.status(400).json({ error: 'Заполните все поля автобутика' });
    }

    let cleanWa = (whatsappPhone || '').replace(/\D/g, '');
    if (cleanWa.startsWith('8')) cleanWa = '7' + cleanWa.slice(1);
    if (!cleanWa.startsWith('7') && cleanWa.length === 10) cleanWa = '7' + cleanWa;

    const safeShopName = sanitizeText(shopName);
    const safeMarketName = sanitizeText(marketName);
    const safeBoothNumber = sanitizeText(boothNumber);

    profile = db.updateProfileRole(userId, 'seller', safeShopName);
    const sellerProfile = db.saveSellerProfile({
      user_id: userId,
      shop_name: safeShopName,
      city: city || 'Талдыкорган',
      market_name: safeMarketName,
      booth_number: safeBoothNumber,
      photo_url: storefrontPhoto || 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=400&q=80',
      whatsapp_phone: cleanWa,
      countries,
      categories
    });

    res.json({ success: true, profile: { ...profile, role: 'seller' }, sellerProfile });
  } else {
    res.status(400).json({ error: 'Неверная роль' });
  }
});

// ----------------------------------------------------
// DRIVER ENDPOINTS
// ----------------------------------------------------
app.get('/api/driver/my-requests/:phone', (req, res) => {
  const safePhone = sanitizeText(req.params.phone);
  const requests = db.getRequestsByDriverPhone(safePhone);
  const enriched = requests.map(r => {
    const offers = db.getOffersByRequestId(r.id);
    return {
      ...r,
      originInfo: CAR_ORIGINS[r.detected_country] || { id: r.detected_country, name: r.detected_country },
      categoryInfo: PART_CATEGORIES[r.detected_category] || { id: r.detected_category, name: r.detected_category, icon: 'Package' },
      offersCount: offers.length,
      offers
    };
  });

  res.json(enriched);
});

app.post('/api/requests', (req, res) => {
  const { driverId, driverPhone, carModel, partName, photos } = req.body;

  if (!carModel?.trim() || !partName?.trim()) {
    return res.status(400).json({ error: 'Укажите марку/модель авто и требуемую деталь' });
  }

  const safeCarModel = sanitizeText(carModel);
  const safePartName = sanitizeText(partName);
  const safePhone = sanitizeText(driverPhone || '+7 701 111 22 33');

  const classification = autoClassify(safeCarModel, safePartName);

  const newRequest = db.createRequest({
    driver_id: driverId || 'usr-driver-1',
    driver_phone: safePhone,
    car_model: safeCarModel,
    part_name: safePartName,
    photos: photos || [],
    detected_country: classification.origin.id,
    detected_category: classification.category.id
  });

  const enriched = {
    ...newRequest,
    originInfo: classification.origin,
    categoryInfo: classification.category,
    offersCount: 0,
    offers: []
  };

  broadcast('NEW_REQUEST', enriched);
  res.json({ success: true, request: enriched });
});

// ----------------------------------------------------
// SELLER ENDPOINTS
// ----------------------------------------------------
app.get('/api/requests', (req, res) => {
  const requests = db.getRequests();
  const enriched = requests.map(r => {
    const offers = db.getOffersByRequestId(r.id);
    return {
      ...r,
      originInfo: CAR_ORIGINS[r.detected_country] || { id: r.detected_country, name: r.detected_country },
      categoryInfo: PART_CATEGORIES[r.detected_category] || { id: r.detected_category, name: r.detected_category, icon: 'Package' },
      offersCount: offers.length,
      offers
    };
  });

  res.json(enriched);
});

app.get('/api/seller/my-offers/:sellerId', (req, res) => {
  const offers = db.getOffersBySellerId(req.params.sellerId);
  res.json(offers);
});

app.post('/api/seller/toggle-status', (req, res) => {
  const { userId } = req.body;
  const seller = db.toggleSellerOnlineStatus(userId);
  res.json({ success: true, seller });
});

app.post('/api/offers', (req, res) => {
  const { requestId, sellerId, condition, brand, price, variants } = req.body;

  if (!requestId || !sellerId) {
    return res.status(400).json({ error: 'Укажите все параметры предложения!' });
  }

  const seller = db.getSellerProfileByUserId(sellerId);
  if (!seller) return res.status(404).json({ error: 'Продавец не найден' });

  const safeBrand = sanitizeText(brand || 'Оригинал');
  const safePrice = Math.max(0, Number(price || 0));

  try {
    const offer = db.createOffer({
      request_id: requestId,
      seller_id: sellerId,
      shop_name: seller.shop_name,
      shop_phone: seller.phone,
      whatsapp_phone: seller.whatsapp_phone,
      market_name: seller.market_name,
      booth_number: seller.booth_number,
      rating: seller.rating || 5.0,
      reviews_count: seller.reviews_count || 0,
      condition: condition || 'New Original',
      brand: safeBrand,
      price: safePrice,
      variants: (variants || []).map(v => ({
        brand: sanitizeText(v.brand),
        price: Math.max(0, Number(v.price || 0)),
        condition: v.condition
      }))
    });

    broadcast('NEW_OFFER', offer);
    res.json({ success: true, offer });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// REVIEWS API
app.post('/api/reviews', (req, res) => {
  const { sellerId, driverId, rating, comment } = req.body;

  if (!sellerId || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Укажите оценку от 1 до 5 звезд' });
  }

  const safeComment = sanitizeText(comment || '');
  const result = db.addReview({ sellerId, driverId, rating: Number(rating), comment: safeComment });

  broadcast('SHOP_RATING_UPDATED', {
    sellerId,
    newRating: result.updatedSeller ? result.updatedSeller.rating : rating,
    reviewsCount: result.updatedSeller ? result.updatedSeller.reviews_count : 1,
    review: result.review
  });

  res.json({
    success: true,
    updatedSeller: result.updatedSeller,
    review: result.review
  });
});

// WEBSOCKET HANDLER
wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'CONNECTED', message: 'BarGoi Realtime API connected' }));
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`BarGoi Server running on http://localhost:${PORT}`);
});
