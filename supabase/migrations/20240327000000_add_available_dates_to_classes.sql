-- Add available_dates field to classes table
ALTER TABLE public.classes 
ADD COLUMN available_dates jsonb DEFAULT '[]';

-- Add comment to explain the field
COMMENT ON COLUMN public.classes.available_dates IS 'תאריכים זמינים לשיעור - מערך של תאריכים בפורמט YYYY-MM-DD או ימי שבוע [1,3,5]';

-- Update existing classes with specific available dates
-- שיעור ניסיון - שני ורביעי
UPDATE public.classes 
SET available_dates = '[1, 3]'::jsonb 
WHERE slug = 'trial-class';

-- שיעור בודד - שני, רביעי, שישי
UPDATE public.classes 
SET available_dates = '[1, 3, 5]'::jsonb 
WHERE slug = 'single-class';

-- שיעור אישי - תאריכים ספציפיים (לדוגמה)
UPDATE public.classes 
SET available_dates = '["2024-01-15", "2024-01-17", "2024-01-19", "2024-01-22", "2024-01-24", "2024-01-26"]'::jsonb 
WHERE slug = 'private-lesson';

-- מנוי חודשי - כל השבוע
UPDATE public.classes 
SET available_dates = '[0, 1, 2, 3, 4, 5, 6]'::jsonb 
WHERE slug = 'monthly-subscription';

-- Update any remaining classes with default available dates (Monday, Wednesday, Friday)
UPDATE public.classes 
SET available_dates = '[1, 3, 5]'::jsonb 
WHERE available_dates IS NULL OR available_dates = '[]'::jsonb; 