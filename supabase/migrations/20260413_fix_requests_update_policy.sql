-- Fix: Add WITH CHECK clause to UPDATE policy for requests table
-- This allows users to update their own requests

DROP POLICY IF EXISTS "Users can update own requests" ON public.requests;

CREATE POLICY "Users can update own requests" ON public.requests 
FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);
