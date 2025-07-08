-- Update class schedule with specific availability
-- ימים מסודרים לפי יום ראשון עד שבת
-- רק ימי שני ושלישי זמינים עם שעות 18:00 ו-19:00

UPDATE public.classes 
SET schedule = '{
  "sunday": {
    "times": [], 
    "available": false
  }, 
  "monday": {
    "times": ["18:00", "19:00"], 
    "available": true
  }, 
  "tuesday": {
    "times": ["18:00", "19:00"], 
    "available": true
  }, 
  "wednesday": {
    "times": [], 
    "available": false
  }, 
  "thursday": {
    "times": [], 
    "available": false
  }, 
  "friday": {
    "times": [], 
    "available": false
  }, 
  "saturday": {
    "times": [], 
    "available": false
  }
}'::jsonb 
WHERE slug = 'your-class-slug'; -- Replace with the actual class slug

-- Example for updating all classes:
-- UPDATE public.classes 
-- SET schedule = '{"sunday": {"times": [], "available": false}, "monday": {"times": ["18:00", "19:00"], "available": true}, "tuesday": {"times": ["18:00", "19:00"], "available": true}, "wednesday": {"times": [], "available": false}, "thursday": {"times": [], "available": false}, "friday": {"times": [], "available": false}, "saturday": {"times": [], "available": false}}'::jsonb; 