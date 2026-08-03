-- Supabase PostgreSQL Production Database Schema for PartDrive

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  phone TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('driver', 'seller')),
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SELLER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.seller_profiles (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  shop_name TEXT NOT NULL,
  market_name TEXT NOT NULL,
  booth_number TEXT NOT NULL,
  photo_url TEXT,
  whatsapp_phone TEXT NOT NULL,
  countries TEXT[] DEFAULT '{}',
  categories TEXT[] DEFAULT '{}',
  rating NUMERIC DEFAULT 5.0,
  reviews_count INT DEFAULT 0,
  online_status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. REQUESTS TABLE (DRIVER TENDERS)
CREATE TABLE IF NOT EXISTS public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  driver_phone TEXT NOT NULL,
  car_model TEXT NOT NULL,
  part_name TEXT NOT NULL,
  photos TEXT[] DEFAULT '{}',
  detected_country TEXT NOT NULL,
  detected_category TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

-- 4. OFFERS TABLE (SELLER OFFERS)
CREATE TABLE IF NOT EXISTS public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.requests(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  shop_name TEXT NOT NULL,
  shop_phone TEXT NOT NULL,
  whatsapp_phone TEXT NOT NULL,
  market_name TEXT NOT NULL,
  booth_number TEXT NOT NULL,
  rating NUMERIC DEFAULT 5.0,
  reviews_count INT DEFAULT 0,
  condition TEXT CHECK (condition IN ('new_orig', 'new_aftermarket', 'used')),
  brand TEXT NOT NULL,
  price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(request_id, seller_id)
);

-- 5. REVIEWS TABLE (DYNAMIC RATING SYSTEM)
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- POLICIES (PUBLIC ACCESS FOR MVP)
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Read Seller Profiles" ON public.seller_profiles FOR SELECT USING (true);
CREATE POLICY "Public Read Requests" ON public.requests FOR SELECT USING (true);
CREATE POLICY "Public Read Offers" ON public.offers FOR SELECT USING (true);
CREATE POLICY "Public Read Reviews" ON public.reviews FOR SELECT USING (true);
