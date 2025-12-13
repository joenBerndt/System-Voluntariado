-- Run this command in your Supabase SQL Editor to fix the applications table for interviews

ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS interview_date date;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS interview_time text;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS interview_location text;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS interview_notes text;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS interview_confirmed_date date;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS accepted_date date;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS rejected_date date;
