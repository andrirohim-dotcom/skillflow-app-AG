-- Migration to add spacing repetition columns to key_insights table
-- Run this script in your Supabase SQL Editor.

ALTER TABLE public.key_insights 
ADD COLUMN IF NOT EXISTS last_reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS review_interval_days INTEGER DEFAULT 1;
