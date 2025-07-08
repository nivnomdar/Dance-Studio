-- Add color_scheme field to classes table as simple text
ALTER TABLE public.classes 
ADD COLUMN color_scheme text DEFAULT 'pink';

-- Update existing classes with their color schemes
UPDATE public.classes 
SET color_scheme = 'pink' 
WHERE slug = 'trial-class';

UPDATE public.classes 
SET color_scheme = 'purple' 
WHERE slug = 'single-class';

UPDATE public.classes 
SET color_scheme = 'emerald' 
WHERE slug = 'private-lesson';

UPDATE public.classes 
SET color_scheme = 'blue' 
WHERE slug = 'monthly-subscription';

-- Add comment to explain the field
COMMENT ON COLUMN public.classes.color_scheme IS 'צבע ערכת נושא - אחד מהצבעים הזמינים: pink, purple, emerald, blue, red, orange, yellow, green, teal, cyan, indigo, violet, fuchsia, rose, slate, gray, zinc, neutral, stone, amber, lime'; 