ALTER TABLE public.registrations
ADD COLUMN health_declaration_accepted BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN health_declaration_accepted_at TIMESTAMPTZ NULL;

COMMENT ON COLUMN public.registrations.health_declaration_accepted IS 'Indicates if the user has accepted the health declaration and age 18+ confirmation.';
COMMENT ON COLUMN public.registrations.health_declaration_accepted_at IS 'Timestamp when the user accepted the health declaration and age 18+ confirmation.';
