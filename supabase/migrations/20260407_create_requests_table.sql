-- Create requests table for storing user cash exchange requests
CREATE TABLE IF NOT EXISTS public.requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  need_type TEXT NOT NULL,
  have_type TEXT NOT NULL,
  city TEXT NOT NULL,
  location_text TEXT,
  urgency TEXT NOT NULL DEFAULT 'low',
  description TEXT,
  latitude FLOAT,
  longitude FLOAT,
  status TEXT NOT NULL DEFAULT 'active',
  payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_requests_user_id ON public.requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_city ON public.requests(city);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON public.requests(created_at DESC);

-- Enable RLS
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view all active requests
CREATE POLICY "Users can view all active requests"
  ON public.requests
  FOR SELECT
  USING (status = 'active');

-- RLS Policy: Users can create their own requests
CREATE POLICY "Users can create their own requests"
  ON public.requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own requests
CREATE POLICY "Users can update their own requests"
  ON public.requests
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own requests
CREATE POLICY "Users can delete their own requests"
  ON public.requests
  FOR DELETE
  USING (auth.uid() = user_id);
