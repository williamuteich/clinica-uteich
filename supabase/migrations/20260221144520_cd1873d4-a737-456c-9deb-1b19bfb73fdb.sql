-- Allow anonymous users to insert appointments (public booking)
CREATE POLICY "Anyone can create appointments"
ON public.appointments
FOR INSERT
WITH CHECK (true);