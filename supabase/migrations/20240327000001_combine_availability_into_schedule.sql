-- Remove the old columns
ALTER TABLE public.classes DROP COLUMN IF EXISTS available_dates;
ALTER TABLE public.classes DROP COLUMN IF EXISTS available_times;

-- Add new comprehensive schedule column
ALTER TABLE public.classes 
ADD COLUMN schedule JSONB DEFAULT '{
  "monday": {
    "available": false,
    "times": []
  },
  "tuesday": {
    "available": false,
    "times": []
  },
  "wednesday": {
    "available": false,
    "times": []
  },
  "thursday": {
    "available": false,
    "times": []
  },
  "friday": {
    "available": false,
    "times": []
  },
  "saturday": {
    "available": false,
    "times": []
  },
  "sunday": {
    "available": false,
    "times": []
  }
}'::jsonb;

-- Add comment to explain the field
COMMENT ON COLUMN public.classes.schedule IS 'Complete schedule for the class. Each day has "available" boolean and "times" array. Example: {"monday": {"available": true, "times": ["18:00", "19:00"]}}';

-- Update existing classes with default schedule (all days with default times)
UPDATE public.classes 
SET schedule = '{
  "monday": {
    "available": true,
    "times": ["18:00", "19:00", "20:00"]
  },
  "tuesday": {
    "available": true,
    "times": ["18:00", "19:00", "20:00"]
  },
  "wednesday": {
    "available": true,
    "times": ["18:00", "19:00", "20:00"]
  },
  "thursday": {
    "available": true,
    "times": ["18:00", "19:00", "20:00"]
  },
  "friday": {
    "available": true,
    "times": ["18:00", "19:00", "20:00"]
  },
  "saturday": {
    "available": true,
    "times": ["18:00", "19:00", "20:00"]
  },
  "sunday": {
    "available": true,
    "times": ["18:00", "19:00", "20:00"]
  }
}'::jsonb 
WHERE schedule IS NULL; 