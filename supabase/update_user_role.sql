-- Update user role to admin
-- Replace 'your-email@example.com' with the actual email address

UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Verify the update
SELECT id, email, role, first_name, last_name 
FROM profiles 
WHERE email = 'your-email@example.com';