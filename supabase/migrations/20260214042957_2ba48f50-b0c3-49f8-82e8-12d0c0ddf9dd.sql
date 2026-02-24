
ALTER TABLE public.attendances ADD COLUMN appointment_id uuid REFERENCES public.appointments(id);
