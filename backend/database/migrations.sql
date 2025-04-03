-- Update verification_codes table
ALTER TABLE verification_codes
ADD COLUMN IF NOT EXISTS is_used BOOLEAN DEFAULT FALSE;

-- Update profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- Update or create the generate_verification_code function
CREATE OR REPLACE FUNCTION public.generate_verification_code()
RETURNS TEXT AS $$
BEGIN
    -- Generate a random 6-digit code
    RETURN FLOOR(RANDOM() * 900000 + 100000)::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies for verification_codes
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own verification codes"
ON verification_codes FOR INSERT
TO authenticated
WITH CHECK (email = auth.jwt()->>'email');

CREATE POLICY "Users can view their own verification codes"
ON verification_codes FOR SELECT
TO authenticated
USING (email = auth.jwt()->>'email');

CREATE POLICY "Users can update their own verification codes"
ON verification_codes FOR UPDATE
TO authenticated
USING (email = auth.jwt()->>'email')
WITH CHECK (email = auth.jwt()->>'email');

-- Add RLS policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
TO authenticated
USING (email = auth.jwt()->>'email');

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (email = auth.jwt()->>'email')
WITH CHECK (email = auth.jwt()->>'email'); 