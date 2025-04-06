-- Update verification_codes table
ALTER TABLE verification_codes
ADD COLUMN IF NOT EXISTS is_used BOOLEAN DEFAULT FALSE;

-- Update profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- Migration to add first_name and last_name columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Migration to remove redundant full_name column if it exists
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS full_name;

-- Update the handle_new_user function to include first_name and last_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        email, 
        username, 
        first_name, 
        last_name,
        is_verified
    )
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substring(NEW.id::text, 1, 8)), 
        NEW.raw_user_meta_data->>'firstName',
        NEW.raw_user_meta_data->>'lastName',
        FALSE
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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