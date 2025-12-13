-- Run this command in your Supabase SQL Editor to fix the areas table
ALTER TABLE public.areas ADD COLUMN IF NOT EXISTS image_url text;
