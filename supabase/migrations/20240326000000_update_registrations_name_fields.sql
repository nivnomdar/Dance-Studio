-- Update registrations table to use first_name and last_name instead of full_name
ALTER TABLE public.registrations 
ADD COLUMN first_name text,
ADD COLUMN last_name text;

-- Update existing records to split full_name into first_name and last_name
UPDATE public.registrations 
SET 
  first_name = CASE 
    WHEN full_name LIKE '% %' THEN 
      SUBSTRING(full_name FROM 1 FOR POSITION(' ' IN full_name) - 1)
    ELSE full_name 
  END,
  last_name = CASE 
    WHEN full_name LIKE '% %' THEN 
      SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1)
    ELSE ''
  END;

-- Make first_name and last_name NOT NULL after populating them
ALTER TABLE public.registrations 
ALTER COLUMN first_name SET NOT NULL,
ALTER COLUMN last_name SET NOT NULL;

-- Drop the old full_name column
ALTER TABLE public.registrations 
DROP COLUMN full_name;

-- Add indexes for better performance
CREATE INDEX idx_registrations_first_name ON public.registrations(first_name);
CREATE INDEX idx_registrations_last_name ON public.registrations(last_name); 