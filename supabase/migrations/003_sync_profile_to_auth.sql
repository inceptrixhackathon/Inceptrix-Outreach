-- ==============================================================================
-- Inceptrix Outreach Portal - Migration 003: Sync Profile Updates to Auth Users
-- Description: Automatically propagates manual updates in public.profiles
--              (email, password, full_name, role) into auth.users so logins
--              are always 100% in sync even when edited via Supabase Table Editor.
-- ==============================================================================

-- 1. Ensure pgcrypto extension is available for bcrypt hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 2. Trigger function to synchronize profiles to auth.users
CREATE OR REPLACE FUNCTION public.sync_profile_changes_to_auth()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
BEGIN
  -- A. Sync password change: re-hash with bcrypt and update auth.users
  IF (NEW.password IS DISTINCT FROM OLD.password) AND (NEW.password IS NOT NULL) AND (NEW.password <> '') THEN
    UPDATE auth.users
    SET encrypted_password = extensions.crypt(NEW.password, extensions.gen_salt('bf')),
        updated_at = now()
    WHERE id = NEW.id;
  END IF;

  -- B. Sync email change: update auth.users and auth.identities
  IF (NEW.email IS DISTINCT FROM OLD.email) AND (NEW.email IS NOT NULL) AND (NEW.email <> '') THEN
    UPDATE auth.users
    SET email = NEW.email,
        updated_at = now()
    WHERE id = NEW.id;

    UPDATE auth.identities
    SET email = NEW.email,
        identity_data = jsonb_set(COALESCE(identity_data, '{}'::jsonb), '{email}', to_jsonb(NEW.email))
    WHERE user_id = NEW.id;
  END IF;

  -- C. Sync full name and role in raw_user_meta_data
  IF (NEW.full_name IS DISTINCT FROM OLD.full_name) OR (NEW.role IS DISTINCT FROM OLD.role) THEN
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(
      jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb),
        '{full_name}',
        to_jsonb(NEW.full_name)
      ),
      '{role}',
      to_jsonb(NEW.role)
    ),
    updated_at = now()
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

-- 3. Attach trigger to public.profiles
DROP TRIGGER IF EXISTS trg_sync_profile_to_auth ON public.profiles;

CREATE TRIGGER trg_sync_profile_to_auth
AFTER UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_changes_to_auth();
