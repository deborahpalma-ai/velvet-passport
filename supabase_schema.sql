-- ============================================================
-- VELVET PASSPORT — Schema SQL Completo v2
-- Execute no Supabase: SQL Editor → New query → Cole e execute
-- ============================================================

-- Profiles
CREATE TABLE IF NOT EXISTS vp_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  residence_country TEXT,
  home_currency TEXT DEFAULT 'USD',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trips (simplificado — sem hospedagem fixa)
CREATE TABLE IF NOT EXISTS vp_trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  country TEXT NOT NULL,
  region TEXT,
  city TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  destination_currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Accommodations (múltiplas por viagem)
CREATE TABLE IF NOT EXISTS vp_accommodations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trip_id UUID REFERENCES vp_trips(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  check_in DATE,
  check_out DATE,
  rate_per_night NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Restaurants
CREATE TABLE IF NOT EXISTS vp_restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trip_id UUID REFERENCES vp_trips(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  estimated_cost NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bars
CREATE TABLE IF NOT EXISTS vp_bars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trip_id UUID REFERENCES vp_trips(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  estimated_cost NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Beach Clubs
CREATE TABLE IF NOT EXISTS vp_beach_clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trip_id UUID REFERENCES vp_trips(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  estimated_cost NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tours / Experiences
CREATE TABLE IF NOT EXISTS vp_tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trip_id UUID REFERENCES vp_trips(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  estimated_cost NUMERIC DEFAULT 0,
  date DATE,
  description TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transport (múltiplos itens por categoria)
CREATE TABLE IF NOT EXISTS vp_transport (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trip_id UUID REFERENCES vp_trips(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  amount NUMERIC DEFAULT 0,
  date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Itinerary
CREATE TABLE IF NOT EXISTS vp_itinerary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trip_id UUID REFERENCES vp_trips(id) ON DELETE CASCADE NOT NULL,
  day_number INTEGER NOT NULL,
  activity TEXT NOT NULL,
  time TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Checklist
CREATE TABLE IF NOT EXISTS vp_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trip_id UUID REFERENCES vp_trips(id) ON DELETE CASCADE NOT NULL,
  item_text TEXT NOT NULL,
  done BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exchange Rates
CREATE TABLE IF NOT EXISTS vp_exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trip_id UUID REFERENCES vp_trips(id) ON DELETE CASCADE NOT NULL,
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  rate_at_creation NUMERIC,
  rate_current NUMERIC,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE vp_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vp_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE vp_accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vp_restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE vp_bars ENABLE ROW LEVEL SECURITY;
ALTER TABLE vp_beach_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vp_tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE vp_transport ENABLE ROW LEVEL SECURITY;
ALTER TABLE vp_itinerary ENABLE ROW LEVEL SECURITY;
ALTER TABLE vp_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE vp_exchange_rates ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users manage own profiles" ON vp_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own trips" ON vp_trips FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own accommodations" ON vp_accommodations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own restaurants" ON vp_restaurants FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own bars" ON vp_bars FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own beach clubs" ON vp_beach_clubs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own tours" ON vp_tours FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own transport" ON vp_transport FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own itinerary" ON vp_itinerary FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own checklist" ON vp_checklist FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own exchange rates" ON vp_exchange_rates FOR ALL USING (auth.uid() = user_id);
