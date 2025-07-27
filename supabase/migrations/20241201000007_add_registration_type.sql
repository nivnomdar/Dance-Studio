-- Add registration_type column to classes table
-- This migration adds registration_type column to determine how classes are registered

-- Add the new column
ALTER TABLE classes 
ADD COLUMN registration_type text DEFAULT 'standard';

-- Add comment to explain the column
COMMENT ON COLUMN classes.registration_type IS 'Type of registration: standard (with date/time selection) or appointment_only (by appointment)';

-- Update existing classes with appropriate registration types
-- Trial class - standard registration
UPDATE classes 
SET registration_type = 'standard' 
WHERE slug = 'trial-class';

-- Single class - standard registration
UPDATE classes 
SET registration_type = 'standard' 
WHERE slug = 'single-class';

-- Private lesson - appointment only
UPDATE classes 
SET registration_type = 'appointment_only' 
WHERE slug = 'private-lesson';

-- Monthly subscription - standard registration
UPDATE classes 
SET registration_type = 'standard' 
WHERE slug = 'monthly-subscription';

-- Create index for better performance
CREATE INDEX idx_classes_registration_type ON classes(registration_type); 