
-- Fix infinite recursion in profiles RLS policies
-- Create a security definer function to get user's school_id without triggering RLS

-- Drop the problematic policies first
DROP POLICY IF EXISTS "Coordinators can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles in their school" ON public.profiles;

-- Create a security definer function to get user's school_id
CREATE OR REPLACE FUNCTION public.get_user_school_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT school_id
  FROM public.profiles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Recreate the policies using the security definer function
CREATE POLICY "Coordinators can view all profiles"
ON public.profiles
FOR SELECT
USING (
  public.has_role(auth.uid(), 'coordinator'::app_role) 
  OR public.get_user_school_id(auth.uid()) = school_id 
  OR auth.uid() = user_id
);

CREATE POLICY "Users can view profiles in their school"
ON public.profiles
FOR SELECT
USING (
  public.get_user_school_id(auth.uid()) = school_id 
  OR auth.uid() = user_id
);

-- Also fix other policies that reference profiles table recursively
DROP POLICY IF EXISTS "Coordinators can view all consumption entries" ON public.consumption_entries;
DROP POLICY IF EXISTS "Users can create consumption for their school" ON public.consumption_entries;
DROP POLICY IF EXISTS "Users can view consumption from their school" ON public.consumption_entries;

CREATE POLICY "Coordinators can view all consumption entries"
ON public.consumption_entries
FOR SELECT
USING (
  public.has_role(auth.uid(), 'coordinator'::app_role) 
  OR school_id = public.get_user_school_id(auth.uid())
);

CREATE POLICY "Users can create consumption for their school"
ON public.consumption_entries
FOR INSERT
WITH CHECK (school_id = public.get_user_school_id(auth.uid()));

CREATE POLICY "Users can view consumption from their school"
ON public.consumption_entries
FOR SELECT
USING (school_id = public.get_user_school_id(auth.uid()));

-- Fix consumption_goals policies
DROP POLICY IF EXISTS "Users can manage goals for their school" ON public.consumption_goals;
DROP POLICY IF EXISTS "Users can view goals from their school" ON public.consumption_goals;

CREATE POLICY "Users can manage goals for their school"
ON public.consumption_goals
FOR ALL
USING (school_id = public.get_user_school_id(auth.uid()));

CREATE POLICY "Users can view goals from their school"
ON public.consumption_goals
FOR SELECT
USING (school_id = public.get_user_school_id(auth.uid()));

-- Fix recycling_entries policies
DROP POLICY IF EXISTS "Coordinators can view all recycling entries" ON public.recycling_entries;
DROP POLICY IF EXISTS "Users can create entries for their school" ON public.recycling_entries;
DROP POLICY IF EXISTS "Users can view entries from their school" ON public.recycling_entries;

CREATE POLICY "Coordinators can view all recycling entries"
ON public.recycling_entries
FOR SELECT
USING (
  public.has_role(auth.uid(), 'coordinator'::app_role) 
  OR school_id = public.get_user_school_id(auth.uid())
);

CREATE POLICY "Users can create entries for their school"
ON public.recycling_entries
FOR INSERT
WITH CHECK (school_id = public.get_user_school_id(auth.uid()));

CREATE POLICY "Users can view entries from their school"
ON public.recycling_entries
FOR SELECT
USING (school_id = public.get_user_school_id(auth.uid()));
