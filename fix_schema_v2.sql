-- Run this command in your Supabase SQL Editor to fix both projects and convocatorias tables

-- ==========================================
-- 1. Fix PROJECTS table
-- ==========================================

-- Rename title to name if it exists (and name doesn't)
DO $$
BEGIN
  IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'title') AND NOT EXISTS(SELECT * FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'name') THEN
    ALTER TABLE public.projects RENAME COLUMN title TO name;
  END IF;
END $$;

-- Add missing columns to projects
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS area_id text references public.areas(id);
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS start_date date;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS end_date date;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS objectives text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS published boolean default false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS managers text[];

-- ==========================================
-- 2. Fix CONVOCATORIAS table
-- ==========================================

-- Add missing columns to convocatorias
ALTER TABLE public.convocatorias ADD COLUMN IF NOT EXISTS manager_id text references public.users(id);

-- Check if 'area' column exists, if not add it (it should exist based on schema, but just in case)
ALTER TABLE public.convocatorias ADD COLUMN IF NOT EXISTS area text;
