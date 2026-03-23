-- Kullanıcı profilleri
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'studio')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Projeksiyonlar
CREATE TABLE projections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Yeni Projeksiyon',
  template TEXT NOT NULL DEFAULT 'indie_game',
  -- template: indie_game, mobile_game, saas, agency

  -- Girdi parametreleri
  team_size INTEGER NOT NULL DEFAULT 5,
  monthly_burn NUMERIC NOT NULL DEFAULT 15000,
  launch_month INTEGER NOT NULL DEFAULT 6,
  expected_revenue NUMERIC NOT NULL DEFAULT 25000,
  growth_rate NUMERIC NOT NULL DEFAULT 15,
  initial_investment NUMERIC DEFAULT 0,

  -- Ek parametreler (JSON — esnek yapı)
  custom_params JSONB DEFAULT '{}',

  -- Hesaplanmış projeksiyon verisi (JSON — 24-60 aylık)
  projection_data JSONB NOT NULL DEFAULT '[]',

  -- Meta
  projection_months INTEGER NOT NULL DEFAULT 24,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Gerçekleşen veriler (aylık)
CREATE TABLE actuals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projection_id UUID NOT NULL REFERENCES projections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  month_number INTEGER NOT NULL, -- 1, 2, 3...

  -- Gerçekleşen gelir kalemleri
  revenue_total NUMERIC NOT NULL DEFAULT 0,
  revenue_breakdown JSONB DEFAULT '{}',
  -- örnek: {"steam_sales": 15000, "epic_sales": 3000, "dlc": 2000}

  -- Gerçekleşen gider kalemleri
  expense_total NUMERIC NOT NULL DEFAULT 0,
  expense_breakdown JSONB DEFAULT '{}',
  -- örnek: {"salaries": 30000, "servers": 500, "marketing": 2000}

  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(projection_id, month_number)
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projections ENABLE ROW LEVEL SECURITY;
ALTER TABLE actuals ENABLE ROW LEVEL SECURITY;

-- Profil politikaları
CREATE POLICY "Kullanıcılar kendi profillerini görebilir"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Kullanıcılar kendi profillerini güncelleyebilir"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Projeksiyon politikaları
CREATE POLICY "Kullanıcılar kendi projeksiyonlarını görebilir"
  ON projections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Kullanıcılar projeksiyon oluşturabilir"
  ON projections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Kullanıcılar kendi projeksiyonlarını güncelleyebilir"
  ON projections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Kullanıcılar kendi projeksiyonlarını silebilir"
  ON projections FOR DELETE USING (auth.uid() = user_id);

-- Gerçekleşen veri politikaları
CREATE POLICY "Kullanıcılar kendi verilerini görebilir"
  ON actuals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Kullanıcılar veri girebilir"
  ON actuals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Kullanıcılar kendi verilerini güncelleyebilir"
  ON actuals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Kullanıcılar kendi verilerini silebilir"
  ON actuals FOR DELETE USING (auth.uid() = user_id);

-- Yeni kullanıcı kaydında otomatik profil oluştur
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Plan limitleri kontrol fonksiyonu
CREATE OR REPLACE FUNCTION check_projection_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_plan TEXT;
  projection_count INTEGER;
BEGIN
  SELECT plan INTO user_plan FROM profiles WHERE id = p_user_id;
  SELECT COUNT(*) INTO projection_count FROM projections WHERE user_id = p_user_id AND status = 'active';

  IF user_plan = 'free' AND projection_count >= 1 THEN
    RETURN FALSE;
  ELSIF user_plan = 'pro' AND projection_count >= 10 THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE; -- studio = sınırsız
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- İndeksler
CREATE INDEX idx_projections_user_id ON projections(user_id);
CREATE INDEX idx_actuals_projection_id ON actuals(projection_id);
CREATE INDEX idx_actuals_user_id ON actuals(user_id);
