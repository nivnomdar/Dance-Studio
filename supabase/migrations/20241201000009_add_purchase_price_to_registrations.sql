-- Add purchase_price column to registrations table
-- This migration adds a purchase_price column to track the actual price paid for each registration

-- Add the new column
ALTER TABLE registrations 
ADD COLUMN purchase_price DECIMAL(10,2) DEFAULT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN registrations.purchase_price IS 'The actual price paid for this registration (can be different from class price due to discounts, credits, etc.)';

-- Create index for better performance
CREATE INDEX idx_registrations_purchase_price ON registrations(purchase_price);

-- Update existing registrations to have purchase_price = class price
-- This ensures historical data is preserved
UPDATE registrations 
SET purchase_price = (
  SELECT price 
  FROM classes 
  WHERE classes.id = registrations.class_id
)
WHERE purchase_price IS NULL; 