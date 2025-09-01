ALTER TABLE public.registrations
DROP COLUMN health_declaration_accepted_at,
DROP COLUMN registration_terms_accepted_at,
ADD COLUMN age_confirmation_accepted BOOLEAN DEFAULT FALSE NOT NULL;

COMMENT ON COLUMN public.registrations.age_confirmation_accepted IS 'Indicates if the user has confirmed they are 18 years or older.';
