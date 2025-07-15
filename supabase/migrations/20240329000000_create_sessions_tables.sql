-- Create sessions and session_classes tables for unified scheduling
-- This migration creates the new scheduling system that allows multiple classes to share the same time slots

-- Create schedule_sessions table
CREATE TABLE IF NOT EXISTS public.schedule_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    weekdays INTEGER[] NOT NULL, -- Array of weekdays (0=Sunday, 1=Monday, etc.)
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    max_capacity INTEGER NOT NULL DEFAULT 10,
    location TEXT DEFAULT 'יוסף לישנסקי 6, ראשון לציון',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create session_classes table (junction table)
CREATE TABLE IF NOT EXISTS public.session_classes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES public.schedule_sessions(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_trial BOOLEAN DEFAULT false,
    max_uses_per_user INTEGER, -- For trial classes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(session_id, class_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_schedule_sessions_weekdays ON public.schedule_sessions(weekdays);
CREATE INDEX IF NOT EXISTS idx_schedule_sessions_active ON public.schedule_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_session_classes_session_id ON public.session_classes(session_id);
CREATE INDEX IF NOT EXISTS idx_session_classes_class_id ON public.session_classes(class_id);
CREATE INDEX IF NOT EXISTS idx_session_classes_active ON public.session_classes(is_active);

-- Add RLS policies
ALTER TABLE public.schedule_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_classes ENABLE ROW LEVEL SECURITY;

-- Policies for schedule_sessions
CREATE POLICY "Allow public read access to active sessions" ON public.schedule_sessions
    FOR SELECT USING (is_active = true);

CREATE POLICY "Allow authenticated users to read all sessions" ON public.schedule_sessions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policies for session_classes
CREATE POLICY "Allow public read access to active session classes" ON public.session_classes
    FOR SELECT USING (is_active = true);

CREATE POLICY "Allow authenticated users to read all session classes" ON public.session_classes
    FOR SELECT USING (auth.role() = 'authenticated');

-- Insert sample data for testing
INSERT INTO public.schedule_sessions (
    name, 
    description, 
    weekdays, 
    start_time, 
    end_time, 
    start_date, 
    end_date, 
    max_capacity,
    location
) VALUES 
(
    'שיעור בוקר - ימי ראשון ושלישי',
    'שיעור בוקר קבוע בימי ראשון ושלישי',
    ARRAY[0, 2], -- Sunday and Tuesday
    '09:00:00',
    '10:00:00',
    '2024-01-01',
    '2024-12-31',
    15,
    'יוסף לישנסקי 6, ראשון לציון'
),
(
    'שיעור ערב - ימי שני ורביעי',
    'שיעור ערב קבוע בימי שני ורביעי',
    ARRAY[1, 3], -- Monday and Wednesday
    '19:00:00',
    '20:00:00',
    '2024-01-01',
    '2024-12-31',
    12,
    'יוסף לישנסקי 6, ראשון לציון'
),
(
    'שיעור סוף שבוע - שישי',
    'שיעור סוף שבוע בימי שישי',
    ARRAY[5], -- Friday
    '10:00:00',
    '11:00:00',
    '2024-01-01',
    '2024-12-31',
    10,
    'יוסף לישנסקי 6, ראשון לציון'
);

-- Link existing classes to sessions
-- Note: You'll need to update these class_ids to match your actual class IDs
INSERT INTO public.session_classes (session_id, class_id, price, is_trial, max_uses_per_user)
SELECT 
    s.id as session_id,
    c.id as class_id,
    c.price,
    CASE WHEN c.slug = 'trial-class' THEN true ELSE false END as is_trial,
    CASE WHEN c.slug = 'trial-class' THEN 1 ELSE NULL END as max_uses_per_user
FROM public.schedule_sessions s
CROSS JOIN public.classes c
WHERE c.slug IN ('trial-class', 'single-class', 'monthly-subscription')
AND s.name = 'שיעור בוקר - ימי ראשון ושלישי';

-- Add more session-class links for different sessions
INSERT INTO public.session_classes (session_id, class_id, price, is_trial, max_uses_per_user)
SELECT 
    s.id as session_id,
    c.id as class_id,
    c.price,
    CASE WHEN c.slug = 'trial-class' THEN true ELSE false END as is_trial,
    CASE WHEN c.slug = 'trial-class' THEN 1 ELSE NULL END as max_uses_per_user
FROM public.schedule_sessions s
CROSS JOIN public.classes c
WHERE c.slug IN ('trial-class', 'single-class', 'monthly-subscription')
AND s.name = 'שיעור ערב - ימי שני ורביעי';

-- Add private lessons to weekend session
INSERT INTO public.session_classes (session_id, class_id, price, is_trial, max_uses_per_user)
SELECT 
    s.id as session_id,
    c.id as class_id,
    c.price,
    false as is_trial,
    NULL as max_uses_per_user
FROM public.schedule_sessions s
CROSS JOIN public.classes c
WHERE c.slug = 'private-lesson'
AND s.name = 'שיעור סוף שבוע - שישי'; 