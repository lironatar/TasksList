-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create verification_codes table
CREATE TABLE IF NOT EXISTS public.verification_codes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    is_used BOOLEAN DEFAULT FALSE
);

-- Create task_lists table
CREATE TABLE IF NOT EXISTS public.task_lists (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    list_id UUID REFERENCES public.task_lists(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create RLS (Row Level Security) policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Allow the trigger function to insert profiles
CREATE POLICY "Allow trigger function to insert profiles"
    ON public.profiles FOR INSERT
    WITH CHECK (true);

-- Verification codes policies
CREATE POLICY "Users can view their own verification codes"
    ON public.verification_codes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create verification codes"
    ON public.verification_codes FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update their own verification codes"
    ON public.verification_codes FOR UPDATE
    USING (auth.uid() = user_id);

-- Task lists policies
CREATE POLICY "Users can view their own task lists"
    ON public.task_lists FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own task lists"
    ON public.task_lists FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own task lists"
    ON public.task_lists FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own task lists"
    ON public.task_lists FOR DELETE
    USING (auth.uid() = user_id);

-- Tasks policies
CREATE POLICY "Users can view tasks in their lists"
    ON public.tasks FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.task_lists
            WHERE task_lists.id = tasks.list_id
            AND task_lists.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create tasks in their lists"
    ON public.tasks FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.task_lists
            WHERE task_lists.id = tasks.list_id
            AND task_lists.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update tasks in their lists"
    ON public.tasks FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.task_lists
            WHERE task_lists.id = tasks.list_id
            AND task_lists.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete tasks in their lists"
    ON public.tasks FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.task_lists
            WHERE task_lists.id = tasks.list_id
            AND task_lists.user_id = auth.uid()
        )
    );

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, username)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'username');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to generate verification code
CREATE OR REPLACE FUNCTION public.generate_verification_code()
RETURNS TEXT AS $$
BEGIN
    -- Generate a random 6-digit code
    RETURN FLOOR(RANDOM() * 900000 + 100000)::TEXT;
END;
$$ LANGUAGE plpgsql; 