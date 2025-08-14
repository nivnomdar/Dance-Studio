-- Add class_type column to classes table
-- This migration adds class_type column to determine which credit type the class offers

-- Add the new column
ALTER TABLE classes 
ADD COLUMN class_type text DEFAULT 'group';

-- Add comment to explain the column
COMMENT ON COLUMN classes.class_type IS 'Type of credits this class offers: group, private, or both';

-- Add constraint to ensure valid values
ALTER TABLE classes 
ADD CONSTRAINT check_class_type_valid 
CHECK (class_type IN ('group', 'private', 'both'));

-- Update existing classes with appropriate class types based on their current setup
-- Trial class - group type (default)
UPDATE classes 
SET class_type = 'group' 
WHERE slug = 'trial-class';

-- Single class - group type (default)
UPDATE classes 
SET class_type = 'group' 
WHERE slug = 'single-class';

-- Private lesson - private type
UPDATE classes 
SET class_type = 'private' 
WHERE slug = 'private-lesson';

-- Monthly subscription - both type (can use either group or private credits)
UPDATE classes 
SET class_type = 'both' 
WHERE slug = 'monthly-subscription';

-- Update any other subscription classes with default group type
UPDATE classes 
SET class_type = 'group' 
WHERE category = 'subscription' 
AND class_type = 'group';

-- Create index for better performance
CREATE INDEX idx_classes_class_type ON classes(class_type);

-- Create composite index for class_type and category
CREATE INDEX idx_classes_class_type_category ON classes(class_type, category);

