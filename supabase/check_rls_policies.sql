-- Check RLS policies for sessions tables
-- Run this query to see all existing policies

-- Check if RLS is enabled on sessions tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('schedule_sessions', 'session_classes')
ORDER BY tablename;

-- Check all policies for schedule_sessions
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'schedule_sessions'
ORDER BY policyname;

-- Check all policies for session_classes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'session_classes'
ORDER BY policyname;

-- Check if indexes exist for performance
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('schedule_sessions', 'session_classes', 'registrations')
AND indexname LIKE '%active%' OR indexname LIKE '%session%'
ORDER BY tablename, indexname;

-- Test admin access (replace 'your-admin-user-id' with actual admin user ID)
-- SELECT 
--     'schedule_sessions' as table_name,
--     COUNT(*) as total_records,
--     COUNT(*) FILTER (WHERE is_active = true) as active_records
-- FROM schedule_sessions
-- UNION ALL
-- SELECT 
--     'session_classes' as table_name,
--     COUNT(*) as total_records,
--     COUNT(*) FILTER (WHERE is_active = true) as active_records
-- FROM session_classes; 