-- ==============================================================================
-- 002: LEADER AND MEMBER ROLE-BASED ACCESS & BULLETPROOF TRIGGER
-- ==============================================================================

-- 1. Ensure 'leader' exists in user_role enum
DO $$ BEGIN
  ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'leader';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Update is_admin() to give 'leader' and 'admin' full administrative rights
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'leader')
      AND is_active = true
  );
END;
$$;

-- 3. Bulletproof trigger on auth.users with explicit search_path and safe role check
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_role public.user_role := 'member';
  v_name TEXT;
BEGIN
  -- Determine display name safely
  v_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    split_part(COALESCE(NEW.email, 'User'), '@', 1)
  );

  -- Determine role safely without casting errors
  IF NEW.raw_user_meta_data->>'role' = 'leader' OR NEW.raw_user_meta_data->>'role' = 'admin' THEN
    v_role := 'leader';
  ELSIF (SELECT count(*) FROM public.profiles) = 0 THEN
    v_role := 'leader';
  ELSE
    v_role := 'member';
  END IF;

  -- Upsert into profiles
  INSERT INTO public.profiles (id, full_name, email, role, is_active)
  VALUES (
    NEW.id,
    v_name,
    COALESCE(NEW.email, ''),
    v_role,
    true
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = EXCLUDED.full_name;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user notice: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Ensure trigger is hooked
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
