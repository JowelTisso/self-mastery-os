-- Self Mastery OS - Initial Schema
-- Run this in Supabase SQL Editor

-- 1. Profiles table (linked 1:1 with auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. Daily logs table (one row per day per user)
CREATE TABLE daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  completed_blocks JSONB DEFAULT '[]',
  journal_wins TEXT,
  journal_improve TEXT,
  mood INTEGER CHECK (mood BETWEEN 1 AND 5),
  overall_score NUMERIC GENERATED ALWAYS AS (
    jsonb_array_length(completed_blocks)::NUMERIC / 15.0 * 100
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own logs"
  ON daily_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs"
  ON daily_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own logs"
  ON daily_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own logs"
  ON daily_logs FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Pillar logs table (optional finer-grained tracking)
CREATE TABLE pillar_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  pillar TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  UNIQUE(user_id, log_date, pillar)
);

ALTER TABLE pillar_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pillar logs"
  ON pillar_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pillar logs"
  ON pillar_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pillar logs"
  ON pillar_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pillar logs"
  ON pillar_logs FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Auto-create profile on signup (trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Indexes for performance
CREATE INDEX idx_daily_logs_user_date ON daily_logs(user_id, log_date);
CREATE INDEX idx_pillar_logs_user_date ON pillar_logs(user_id, log_date);
