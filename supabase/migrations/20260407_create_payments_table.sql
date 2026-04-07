-- Create payments table for tracking UPI payments
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_id TEXT NOT NULL UNIQUE,
  order_id TEXT NOT NULL,
  amount_in_paise INTEGER,
  payment_method TEXT NOT NULL DEFAULT 'upi',
  status TEXT NOT NULL DEFAULT 'verified',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index on user_id and payment_id for faster queries
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_id ON public.payments(payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at DESC);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own payments
CREATE POLICY "Users can view their own payments"
  ON public.payments
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Only service can insert payments
CREATE POLICY "Service can insert payments"
  ON public.payments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
