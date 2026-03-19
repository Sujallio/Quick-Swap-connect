-- Create update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  rating NUMERIC(2,1) NOT NULL DEFAULT 4.0,
  total_ratings INTEGER NOT NULL DEFAULT 0,
  is_blocked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, phone)
  VALUES (NEW.id, COALESCE(NEW.phone, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Requests table
CREATE TABLE public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  need_type TEXT NOT NULL CHECK (need_type IN ('cash', 'upi')),
  have_type TEXT NOT NULL CHECK (have_type IN ('cash', 'upi')),
  city TEXT NOT NULL,
  location_text TEXT NOT NULL DEFAULT '',
  urgency TEXT NOT NULL DEFAULT 'low' CHECK (urgency IN ('low', 'medium', 'high')),
  description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active requests viewable by everyone" ON public.requests FOR SELECT USING (true);
CREATE POLICY "Users can insert own requests" ON public.requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own requests" ON public.requests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own requests" ON public.requests FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON public.requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_requests_city ON public.requests(city);
CREATE INDEX idx_requests_status ON public.requests(status);
CREATE INDEX idx_requests_user_id ON public.requests(user_id);

-- Unlocks table
CREATE TABLE public.unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(request_id, viewer_id)
);

ALTER TABLE public.unlocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own unlocks" ON public.unlocks FOR SELECT USING (auth.uid() = viewer_id);
CREATE POLICY "Users can insert own unlocks" ON public.unlocks FOR INSERT WITH CHECK (auth.uid() = viewer_id);

-- Daily request limit function
CREATE OR REPLACE FUNCTION public.check_daily_request_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  today_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO today_count
  FROM public.requests
  WHERE user_id = p_user_id
    AND created_at >= CURRENT_DATE;
  RETURN today_count < 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;