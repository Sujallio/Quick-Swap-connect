
-- Ratings table
CREATE TABLE public.ratings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    rater_id uuid NOT NULL,
    rated_user_id uuid NOT NULL,
    request_id uuid REFERENCES public.requests(id) ON DELETE CASCADE NOT NULL,
    score integer NOT NULL CHECK (score >= 1 AND score <= 5),
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (rater_id, request_id)
);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ratings"
ON public.ratings FOR SELECT USING (true);

CREATE POLICY "Users can insert own ratings"
ON public.ratings FOR INSERT WITH CHECK (auth.uid() = rater_id);

-- Reports table
CREATE TABLE public.reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id uuid NOT NULL,
    reported_user_id uuid NOT NULL,
    request_id uuid REFERENCES public.requests(id) ON DELETE CASCADE,
    reason text NOT NULL DEFAULT '',
    status text NOT NULL DEFAULT 'pending',
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own reports"
ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own reports"
ON public.reports FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports"
ON public.reports FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Function to expire old requests (72 hours)
CREATE OR REPLACE FUNCTION public.expire_old_requests()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expired_count integer;
BEGIN
  UPDATE public.requests
  SET status = 'expired', updated_at = now()
  WHERE status = 'active'
    AND created_at < now() - interval '72 hours';
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$;

-- Trigger: update profile rating when a new rating is inserted
CREATE OR REPLACE FUNCTION public.update_profile_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET rating = (
    SELECT ROUND(AVG(score)::numeric, 1)
    FROM public.ratings
    WHERE rated_user_id = NEW.rated_user_id
  ),
  total_ratings = (
    SELECT COUNT(*)
    FROM public.ratings
    WHERE rated_user_id = NEW.rated_user_id
  )
  WHERE user_id = NEW.rated_user_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_rating_insert
AFTER INSERT ON public.ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_profile_rating();
