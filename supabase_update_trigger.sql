-- Drop the existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Then drop the function to completely recreate it
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create a trigger function to handle new user creation
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

-- Create a trigger to call the function when a new user is created
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Let's check the structure of the auth.users table to understand the metadata
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'auth' AND table_name = 'users';

-- Check the raw_user_meta_data content for an existing user to verify the structure
SELECT id, email, raw_user_meta_data 
FROM auth.users 
LIMIT 5;

-- Check profiles that don't have first_name populated
SELECT p.id, p.email, p.first_name, p.last_name, u.raw_user_meta_data
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.first_name IS NULL
LIMIT 5;

-- Fix the inconsistency directly for existing users
UPDATE public.profiles p
SET 
    first_name = u.raw_user_meta_data->>'firstName',
    last_name = u.raw_user_meta_data->>'lastName'
FROM auth.users u
WHERE 
    p.id = u.id AND
    (p.first_name IS NULL OR p.last_name IS NULL) AND
    (u.raw_user_meta_data->>'firstName' IS NOT NULL OR u.raw_user_meta_data->>'lastName' IS NOT NULL);

-- To manually test this, let's look at a specific user
SELECT id, email, raw_user_meta_data FROM auth.users WHERE email = 'lironatar94@gmail.com';

-- Update for specific profile if needed (replace with your actual user ID)
-- UPDATE public.profiles
-- SET first_name = 'Liron'
-- WHERE id = '<YOUR_USER_ID>'; 