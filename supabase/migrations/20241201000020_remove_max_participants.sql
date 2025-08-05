-- Remove max_participants column from classes table
-- This field is redundant since we have max_capacity in schedule_sessions

ALTER TABLE public.classes DROP COLUMN IF EXISTS max_participants; 