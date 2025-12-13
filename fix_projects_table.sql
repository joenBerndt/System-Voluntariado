-- Run this command in your Supabase SQL Editor to fix the projects table

-- Rename title to name if it exists
DO $$
BEGIN
  IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'title') THEN
    ALTER TABLE public.projects RENAME COLUMN title TO name;
  END IF;
END $$;

-- Add missing columns
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS area_id text references public.areas(id);
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS start_date date;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS end_date date;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS objectives text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS published boolean default false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS managers text[];
