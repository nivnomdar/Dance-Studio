-- Remove subscription-related tables and columns
-- This migration simplifies the model by removing unnecessary subscription tables

-- 1. Remove subscription_id column from registrations table
ALTER TABLE registrations DROP COLUMN IF EXISTS subscription_id;

-- 2. Drop the subscription_classes table
DROP TABLE IF EXISTS subscription_classes;

-- 3. Drop the subscriptions table
DROP TABLE IF EXISTS subscriptions;

-- 4. Remove the class_type column from classes (we'll use category instead)
ALTER TABLE classes DROP COLUMN IF EXISTS class_type;

-- 5. Drop the index for class_type
DROP INDEX IF EXISTS idx_classes_class_type;

-- 6. Drop the constraint for class_type
ALTER TABLE classes DROP CONSTRAINT IF EXISTS check_class_type_not_empty;

-- 7. Update existing subscription classes to use category = 'subscription'
-- This ensures all subscription-related classes are properly categorized
UPDATE classes 
SET category = 'subscription' 
WHERE category IS NULL OR category = '' 
AND (name ILIKE '%מנוי%' OR name ILIKE '%subscription%' OR slug ILIKE '%subscription%'); 