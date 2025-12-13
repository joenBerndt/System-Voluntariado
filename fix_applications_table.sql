-- Run this command in your Supabase SQL Editor to fix the applications table

ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS motivation text;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS experience text;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS convocatoria_title text;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS user_name text;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS user_phone text;
