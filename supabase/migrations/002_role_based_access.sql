-- ==============================================================================
-- 002: LEADER AND MEMBER ROLE-BASED ACCESS & CREDENTIAL PROVISIONING
-- ==============================================================================

-- 1. Ensure 'leader' exists in user_role enum
DO $$ BEGIN
  ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'leader';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Update is_admin() function to treat 'leader' and 'admin' identically
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'leader')
      AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update handle_new_user trigger function to default first user to 'leader'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_role user_role := 'member';
BEGIN
  -- First user registered in system automatically becomes Leader
  IF (SELECT count(*) FROM public.profiles) = 0 THEN
    default_role := 'leader';
  END IF;

  INSERT INTO public.profiles (id, full_name, email, role, is_active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, default_role),
    true
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = EXCLUDED.full_name;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
