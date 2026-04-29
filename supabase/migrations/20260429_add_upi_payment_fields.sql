-- Add UPI payment fields to requests table
ALTER TABLE public.requests
ADD COLUMN IF NOT EXISTS transaction_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'upi_manual',
ADD COLUMN IF NOT EXISTS payment_screenshot TEXT;

-- Update RLS policy to show only verified requests publicly
DROP POLICY IF EXISTS "Users can view all active requests" ON public.requests;
CREATE POLICY "Users can view verified requests"
  ON public.requests
  FOR SELECT
  USING (status = 'verified');

-- Create index for transaction_id for uniqueness and faster lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_requests_transaction_id ON public.requests(transaction_id) WHERE transaction_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_requests_payment_method ON public.requests(payment_method);
