-- Add credit columns to classes table
-- This migration adds group_credits and private_credits columns to the classes table

-- Add the new columns
ALTER TABLE classes 
ADD COLUMN group_credits INT DEFAULT 0,
ADD COLUMN private_credits INT DEFAULT 0;

-- Add comments to explain the columns
COMMENT ON COLUMN classes.group_credits IS 'Number of group credits included when purchasing this class as a subscription';
COMMENT ON COLUMN classes.private_credits IS 'Number of private credits included when purchasing this class as a subscription';

-- Update existing classes with appropriate credit values
-- Trial class - no credits (it's a trial)
UPDATE classes 
SET group_credits = 0, private_credits = 0 
WHERE slug = 'trial-class';

-- Single class - no credits (it's a single purchase)
UPDATE classes 
SET group_credits = 0, private_credits = 0 
WHERE slug = 'single-class';

-- Private lesson - no credits (it's not a subscription class)
UPDATE classes 
SET group_credits = 0, private_credits = 0 
WHERE slug = 'private-lesson';

-- Monthly subscription - 4 group credits
UPDATE classes 
SET group_credits = 4, private_credits = 0 
WHERE slug = 'monthly-subscription';

-- Update any other subscription classes with default group credits
UPDATE classes 
SET group_credits = 4, private_credits = 0 
WHERE category = 'subscription' 
AND group_credits = 0 
AND private_credits = 0;

-- Create indexes for better performance
CREATE INDEX idx_classes_group_credits ON classes(group_credits);
CREATE INDEX idx_classes_private_credits ON classes(private_credits); 