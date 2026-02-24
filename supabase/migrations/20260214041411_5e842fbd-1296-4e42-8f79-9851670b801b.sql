
-- Make patient_id nullable on appointments so we can create appointments without a patient
ALTER TABLE public.appointments ALTER COLUMN patient_id DROP NOT NULL;

-- Drop the existing foreign key constraint
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_patient_id_fkey;

-- Re-add it without NOT NULL (allows null values)
ALTER TABLE public.appointments ADD CONSTRAINT appointments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE SET NULL;
