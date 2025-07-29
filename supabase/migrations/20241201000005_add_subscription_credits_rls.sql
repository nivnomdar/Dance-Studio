-- Add RLS policies for subscription_credits table
-- This migration adds Row Level Security policies to the subscription_credits table

-- Enable Row Level Security
ALTER TABLE subscription_credits ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription credits
CREATE POLICY "Users can view own subscription credits" ON subscription_credits
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own subscription credits
CREATE POLICY "Users can insert own subscription credits" ON subscription_credits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own subscription credits
CREATE POLICY "Users can update own subscription credits" ON subscription_credits
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own subscription credits
CREATE POLICY "Users can delete own subscription credits" ON subscription_credits
  FOR DELETE USING (auth.uid() = user_id);

-- Admins can view all subscription credits
CREATE POLICY "Admins can view all subscription credits" ON subscription_credits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Admins can insert any subscription credits
CREATE POLICY "Admins can insert any subscription credits" ON subscription_credits
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Admins can update any subscription credits
CREATE POLICY "Admins can update any subscription credits" ON subscription_credits
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Admins can delete any subscription credits
CREATE POLICY "Admins can delete any subscription credits" ON subscription_credits
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_subscription_credits_user_id ON subscription_credits(user_id);
CREATE INDEX idx_subscription_credits_credit_group ON subscription_credits(credit_group);
CREATE INDEX idx_subscription_credits_expires_at ON subscription_credits(expires_at);

-- Create composite index for user_id and credit_group
CREATE INDEX IF NOT EXISTS idx_subscription_credits_user_credit_group ON subscription_credits(user_id, credit_group);

-- Create index for active credits (not expired)
CREATE INDEX IF NOT EXISTS idx_subscription_credits_active ON subscription_credits(user_id, credit_group) 
WHERE expires_at IS NULL;

-- Create index for expired credits
CREATE INDEX IF NOT EXISTS idx_subscription_credits_expired ON subscription_credits(user_id, credit_group) 
WHERE expires_at IS NOT NULL;

-- Add comments to explain the table structure
COMMENT ON TABLE subscription_credits IS 'Stores subscription credits for users. Each credit represents one class session that can be used.';
COMMENT ON COLUMN subscription_credits.credit_group IS 'Type of credit: group, private, zoom, workshop, intensive';
COMMENT ON COLUMN subscription_credits.remaining_credits IS 'Number of credits remaining for this subscription';
COMMENT ON COLUMN subscription_credits.expires_at IS 'Expiration date for these credits. NULL means no expiration.'; 