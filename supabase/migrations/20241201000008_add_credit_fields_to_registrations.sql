-- Add credit-related fields to registrations table
-- This migration adds used_credit and credit_type columns to track credit usage

-- Add the new columns
ALTER TABLE registrations 
ADD COLUMN used_credit BOOLEAN DEFAULT FALSE,
ADD COLUMN credit_type TEXT CHECK (credit_type IN ('group', 'private'));

-- Add comments to explain the columns
COMMENT ON COLUMN registrations.used_credit IS 'Indicates if this registration was paid using a subscription credit';
COMMENT ON COLUMN registrations.credit_type IS 'Type of credit used: group or private (only relevant when used_credit is true)';

-- Create indexes for better performance
CREATE INDEX idx_registrations_used_credit ON registrations(used_credit);
CREATE INDEX idx_registrations_credit_type ON registrations(credit_type);
CREATE INDEX idx_registrations_credit_usage ON registrations(used_credit, credit_type);

-- Update existing registrations to have used_credit = false
-- (since they were created before the credit system)
UPDATE registrations 
SET used_credit = FALSE 
WHERE used_credit IS NULL; 