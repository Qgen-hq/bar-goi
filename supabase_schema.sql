-- ============================================================
-- bar.go — Supabase Database Schema
-- Запусти этот SQL в: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- 1. PROFILES (все пользователи: водители и продавцы)
create table if not exists profiles (
  id          text primary key,
  phone       text unique not null,
  role        text,                    -- 'driver' | 'seller' | null
  full_name   text default '',
  city        text default 'Талдыкорган',
  created_at  timestamptz default now()
);

-- 2. SELLER PROFILES (профили автобутиков)
create table if not exists seller_profiles (
  user_id        text primary key references profiles(id) on delete cascade,
  shop_name      text not null,
  city           text default 'Талдыкорган',
  market_name    text,
  booth_number   text,
  photo_url      text,
  whatsapp_phone text,
  countries      text[]   default '{}',
  categories     text[]   default '{}',
  rating         numeric  default 5.0,
  reviews_count  int      default 0,
  online_status  boolean  default true,
  created_at     timestamptz default now()
);

-- 3. REQUESTS (запросы водителей на детали)
create table if not exists requests (
  id                text primary key,
  driver_id         text,
  driver_phone      text,
  car_model         text not null,
  part_name         text not null,
  photos            text[]  default '{}',
  detected_country  text    default 'Unknown',
  detected_category text    default 'Other',
  status            text    default 'active',
  created_at        timestamptz default now(),
  expires_at        timestamptz default (now() + interval '24 hours')
);

-- 4. OFFERS (предложения продавцов)
create table if not exists offers (
  id             text primary key,
  request_id     text references requests(id) on delete cascade,
  seller_id      text,
  shop_name      text,
  shop_phone     text,
  whatsapp_phone text,
  market_name    text,
  booth_number   text,
  rating         numeric default 5.0,
  reviews_count  int     default 0,
  condition      text    default 'new_orig',
  brand          text,
  price          numeric default 0,
  variants       jsonb   default '[]',
  created_at     timestamptz default now()
);

-- 5. REVIEWS (отзывы водителей о продавцах)
create table if not exists reviews (
  id          text primary key,
  seller_id   text,
  driver_id   text,
  rating      int not null check (rating between 1 and 5),
  comment     text default '',
  created_at  timestamptz default now()
);

-- ============================================================
-- ОТКЛЮЧИТЬ RLS для MVP (включить позже в production)
-- ============================================================
alter table profiles       disable row level security;
alter table seller_profiles disable row level security;
alter table requests       disable row level security;
alter table offers         disable row level security;
alter table reviews        disable row level security;

-- ============================================================
-- Индексы для быстрых запросов
-- ============================================================
create index if not exists idx_requests_status_expires on requests(status, expires_at);
create index if not exists idx_requests_driver_phone   on requests(driver_phone);
create index if not exists idx_offers_request_id       on offers(request_id);
create index if not exists idx_offers_seller_id        on offers(seller_id);
create index if not exists idx_reviews_seller_id       on reviews(seller_id);

-- ============================================================
-- Готово! База данных создана.
-- ============================================================
