-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_public" ON public.profiles FOR SELECT USING (TRUE);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Sports events/matches
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  sport TEXT NOT NULL,
  league TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'upcoming', -- upcoming, live, completed, cancelled
  team_a TEXT NOT NULL,
  team_b TEXT NOT NULL,
  odds_a DECIMAL(10, 2),
  odds_b DECIMAL(10, 2),
  odds_draw DECIMAL(10, 2),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_select_all" ON public.events FOR SELECT USING (TRUE);
CREATE POLICY "events_insert_admin" ON public.events FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "events_update_admin" ON public.events FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "events_delete_admin" ON public.events FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- User predictions
CREATE TABLE IF NOT EXISTS public.predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  prediction TEXT NOT NULL, -- 'team_a', 'team_b', 'draw'
  odds_at_prediction DECIMAL(10, 2),
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, won, lost, cancelled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "predictions_select_own" ON public.predictions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "predictions_select_admin" ON public.predictions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "predictions_insert_own" ON public.predictions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "predictions_update_own" ON public.predictions FOR UPDATE USING (auth.uid() = user_id);

-- Premium subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL, -- 'basic', 'pro', 'premium'
  status TEXT DEFAULT 'active', -- active, cancelled, expired
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_select_own" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "subscriptions_select_admin" ON public.subscriptions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "subscriptions_insert_admin" ON public.subscriptions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "subscriptions_update_own" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- User streaks and achievements
CREATE TABLE IF NOT EXISTS public.user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_predictions INT DEFAULT 0,
  wins INT DEFAULT 0,
  losses INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  accuracy_rate DECIMAL(5, 2) DEFAULT 0,
  total_winnings DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_stats_select_all" ON public.user_stats FOR SELECT USING (TRUE);
CREATE POLICY "user_stats_insert_own" ON public.user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_stats_update_own" ON public.user_stats FOR UPDATE USING (auth.uid() = user_id);

-- User badges/achievements
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_name TEXT NOT NULL, -- 'first_prediction', 'streak_5', 'perfect_week', etc.
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_badges_select_all" ON public.user_badges FOR SELECT USING (TRUE);
CREATE POLICY "user_badges_insert_own" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create auto-trigger for profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    username,
    display_name,
    is_admin
  ) VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'username', new.email),
    COALESCE(new.raw_user_meta_data ->> 'display_name', SPLIT_PART(new.email, '@', 1)),
    COALESCE((new.raw_user_meta_data ->> 'is_admin')::boolean, FALSE)
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_stats (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
