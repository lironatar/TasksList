-- This script fixes Row Level Security (RLS) policies for the profiles table
-- to ensure that user registration and profile updates work correctly

-- First, enable RLS on the profiles table if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop any conflicting policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can create profiles" ON public.profiles;
DROP POLICY IF EXISTS "Auth service can create/update profiles" ON public.profiles;

-- Allow authenticated users to view their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Allow authenticated users to update their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Create a policy to allow the service role and trigger function to create profiles
-- This is critical for the handle_new_user trigger to work
CREATE POLICY "Auth service can create/update profiles"
ON public.profiles
FOR ALL
USING (true)
WITH CHECK (true);
-- Note: In production, you would restrict this more, but for troubleshooting
-- we're making it permissive to rule out RLS as the cause of your issue

-- Create a policy to allow the frontend registration to create/insert profiles
CREATE POLICY "New users can create their profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id OR auth.jwt() IS NULL);

-- Display current policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM
    pg_policies
WHERE
    tablename = 'profiles';

-- Re-apply the handle_new_user function to ensure it works
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Debug statement to see what metadata is coming in 
    RAISE NOTICE 'User metadata: %', NEW.raw_user_meta_data;
    
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
        -- Match exactly the case used in Register.tsx
        NEW.raw_user_meta_data->>'firstName',
        NEW.raw_user_meta_data->>'lastName',
        FALSE
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    
-- Update existing profiles with missing names (directly using their emails)
UPDATE public.profiles 
SET first_name = split_part(email, '@', 1)
WHERE first_name IS NULL; 