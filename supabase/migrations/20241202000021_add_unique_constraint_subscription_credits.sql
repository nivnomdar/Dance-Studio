-- Add unique constraint to prevent duplicate credit rows per user and group
-- Ensures there can be at most one row for (user_id, credit_group)

ALTER TABLE subscription_credits
ADD CONSTRAINT subscription_credits_user_group_unique
UNIQUE (user_id, credit_group);

COMMENT ON CONSTRAINT subscription_credits_user_group_unique ON subscription_credits IS 'Prevents duplicate rows for (user_id, credit_group)';


