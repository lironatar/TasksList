-- Add first_name and last_name columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Move data from full_name to first/last name if possible
UPDATE public.profiles
SET 
  first_name = split_part(COALESCE(full_name, ''), ' ', 1),
  last_name = substr(COALESCE(full_name, ''), length(split_part(COALESCE(full_name, ''), ' ', 1)) + 2)
WHERE full_name IS NOT NULL;

-- Drop the full_name column
ALTER TABLE public.profiles
DROP COLUMN IF EXISTS full_name;

-- Update the handle_new_user function to use first_name and last_name
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