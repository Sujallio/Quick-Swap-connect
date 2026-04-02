
-- Allow admins to delete any request
CREATE POLICY "Admins can delete any request"
ON public.requests
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update any profile (for blocking)
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));
