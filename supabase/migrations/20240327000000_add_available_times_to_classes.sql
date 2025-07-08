-- Add available_times field to classes table
-- This will store available times as JSONB array for each class

ALTER TABLE public.classes 
ADD COLUMN available_times JSONB DEFAULT '["18:00", "19:00", "20:00"]'::jsonb;

-- Add comment to explain the field
COMMENT ON COLUMN public.classes.available_times IS 'Available times for this class as JSONB array of time strings (e.g., ["18:00", "19:00", "20:00"]) or object with days (e.g., {"monday": ["18:00", "19:00"], "tuesday": ["19:00", "20:00"]})';

-- Update existing classes with default times
UPDATE public.classes 
SET available_times = '["18:00", "19:00", "20:00"]'::jsonb 
WHERE available_times IS NULL;

-- Example: Update a class with different times for different days
-- UPDATE public.classes 
-- SET available_times = '{"monday": ["18:00", "19:00"], "tuesday": ["19:00", "20:00"], "wednesday": ["18:00", "19:00", "20:00"], "default": ["18:00", "19:00"]}'::jsonb
-- WHERE slug = 'single-class'; 