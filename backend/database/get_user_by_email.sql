-- Function to get a user by email
CREATE OR REPLACE FUNCTION public.get_user_by_email(email_address TEXT)
RETURNS TABLE (
    id UUID,
    email TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT au.id, au.email
    FROM auth.users au
    WHERE au.email = email_address;
END;
$$; 