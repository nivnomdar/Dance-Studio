-- Color Schemes Reference for Dance Studio Classes
-- This file contains the exact color schemes used in each class page

-- 1. שיעור ניסיון (Trial Class) - PINK SCHEME
-- Used in: TrialClassPage.tsx
/*
Primary Colors:
- text-pink-600 (for headings and text)
- bg-pink-500 (for buttons and badges)
- hover:bg-pink-600 (for button hover)
- bg-pink-50 (for light backgrounds)
- from-pink-500/60 to-transparent (for image overlay)
- text-pink-500 hover:text-pink-600 (for links)
- focus:ring-pink-500 focus:border-pink-500 (for form inputs)
*/

-- 2. שיעור בודד (Single Class) - PURPLE SCHEME  
-- Used in: SingleClassPage.tsx
/*
Primary Colors:
- text-purple-600 (for headings and text)
- bg-purple-500 (for buttons and badges)
- hover:bg-purple-600 (for button hover)
- bg-purple-50 (for light backgrounds)
- from-purple-500/60 to-transparent (for image overlay)
- text-purple-500 hover:text-purple-600 (for links)
- focus:ring-purple-500 focus:border-purple-500 (for form inputs)
*/

-- 3. שיעור אישי (Private Lesson) - EMERALD SCHEME
-- Used in: PrivateLessonPage.tsx
/*
Primary Colors:
- text-emerald-600 (for headings and text)
- bg-emerald-500 (for buttons and badges)
- hover:bg-emerald-600 (for button hover)
- bg-emerald-50 (for light backgrounds)
- from-emerald-500/60 to-transparent (for image overlay)
- text-emerald-500 hover:text-emerald-600 (for links)
- focus:ring-emerald-500 focus:border-emerald-500 (for form inputs)
- from-emerald-500 to-teal-500 (for gradient sections)
*/

-- 4. מנוי חודשי (Monthly Subscription) - BLUE SCHEME
-- Used in: MonthlySubscriptionPage.tsx
/*
Primary Colors:
- text-blue-600 (for headings and text)
- bg-blue-500 (for buttons and badges)
- hover:bg-blue-600 (for button hover)
- bg-blue-50 (for light backgrounds)
- from-blue-500/60 to-transparent (for image overlay)
- text-blue-500 hover:text-blue-600 (for links)
- focus:ring-blue-500 focus:border-blue-500 (for form inputs)
- from-blue-500 to-cyan-500 (for gradient sections)
*/

-- SQL to add color_scheme field (if not exists):
-- ALTER TABLE public.classes ADD COLUMN color_scheme text DEFAULT 'pink';

-- SQL to update existing classes with their color schemes:
UPDATE public.classes SET color_scheme = 'pink' WHERE slug = 'trial-class';
UPDATE public.classes SET color_scheme = 'purple' WHERE slug = 'single-class';
UPDATE public.classes SET color_scheme = 'emerald' WHERE slug = 'private-lesson';
UPDATE public.classes SET color_scheme = 'blue' WHERE slug = 'monthly-subscription';

-- To add a new class with a specific color scheme:
-- INSERT INTO public.classes (name, slug, description, price, duration, level, category, image_url, color_scheme) 
-- VALUES ('שיעור חדש', 'new-class', 'תיאור השיעור', 100, 60, 'מתחילות', 'new', '/carousel/image5.png', 'pink'); 