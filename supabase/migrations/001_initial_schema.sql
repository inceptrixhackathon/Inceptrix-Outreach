-- ==============================================================================
-- INCEPTRIX OUTREACH PORTAL — INITIAL SCHEMA & ROW LEVEL SECURITY
-- ==============================================================================

-- 1. EXTENSIONS & ENUMS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Role type
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'member');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Channel type
DO $$ BEGIN
  CREATE TYPE channel_type AS ENUM ('email', 'whatsapp');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Activity status type
DO $$ BEGIN
  CREATE TYPE activity_status AS ENUM (
    'submitted_to_gmail',
    'failed',
    'auth_required',
    'link_opened',
    'marked_sent_by_member'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;


-- ==============================================================================
-- 2. TABLES DEFINITION
-- ==============================================================================

-- A. PROFILES TABLE (Mirrors auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'member',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- B. MESSAGE TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS public.message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel channel_type NOT NULL,
  template_name TEXT NOT NULL,
  subject TEXT, -- required for email, null for whatsapp
  html_body TEXT, -- HTML content for email
  text_body TEXT, -- Plain text fallback for email
  whatsapp_body TEXT, -- WhatsApp formatted text
  version INTEGER NOT NULL DEFAULT 1,
  is_published BOOLEAN NOT NULL DEFAULT false,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- C. ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  channel channel_type NOT NULL,
  recipient TEXT NOT NULL,
  action TEXT NOT NULL,
  status activity_status NOT NULL,
  template_version INTEGER NOT NULL DEFAULT 1,
  provider_message_id TEXT,
  error_details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- D. APPLICATION SETTINGS TABLE (Non-secret)
CREATE TABLE IF NOT EXISTS public.application_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- E. PRIVATE INTEGRATIONS TABLE (Encrypted Server-Side Only)
CREATE TABLE IF NOT EXISTS public.private_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT UNIQUE NOT NULL, -- e.g. 'gmail'
  connected_email TEXT,
  encrypted_access_token TEXT,
  encrypted_refresh_token TEXT,
  token_expiry TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);


-- ==============================================================================
-- 3. HELPER FUNCTIONS
-- ==============================================================================

-- Security definer function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle user signup / creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_role user_role := 'member';
BEGIN
  -- If this is the very first user created in the database, promote to admin
  IF (SELECT count(*) FROM public.profiles) = 0 THEN
    default_role := 'admin';
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

-- Trigger to invoke handle_new_user on auth.users creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_integrations ENABLE ROW LEVEL SECURITY;

-- --- PROFILES POLICIES ---
-- Any authenticated active user can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR public.is_admin());

-- Only admins can update profiles
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Only admins can insert or delete profiles
CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- --- MESSAGE TEMPLATES POLICIES ---
-- Members can read published templates; Admins can read all templates
CREATE POLICY "Read published templates or admin all"
  ON public.message_templates FOR SELECT
  TO authenticated
  USING (is_published = true OR public.is_admin());

-- Only admins can create/update/delete templates
CREATE POLICY "Admins manage templates"
  ON public.message_templates FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- --- ACTIVITY LOGS POLICIES ---
-- Members can read their own logs; Admins can read all logs
CREATE POLICY "Read own logs or admin all"
  ON public.activity_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- Authenticated active members can insert logs for themselves
CREATE POLICY "Members insert own logs"
  ON public.activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());


-- --- APPLICATION SETTINGS POLICIES ---
-- Authenticated users can read app settings
CREATE POLICY "Authenticated users read settings"
  ON public.application_settings FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can modify settings
CREATE POLICY "Admins modify settings"
  ON public.application_settings FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- --- PRIVATE INTEGRATIONS POLICIES ---
-- No public or client-side access. Only service role (backend) or admins can access.
CREATE POLICY "Admins view integration status"
  ON public.private_integrations FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins manage integrations"
  ON public.private_integrations FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ==============================================================================
-- 5. STORAGE BUCKET CONFIGURATION (BROCHURES)
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'brochures',
  'brochures',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE
SET public = false,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['application/pdf'];

-- Storage RLS: Authenticated users can download PDF brochures
CREATE POLICY "Authenticated users can download brochure"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'brochures');

-- Only admins can upload/replace brochure files
CREATE POLICY "Admins can upload and manage brochure"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'brochures' AND public.is_admin())
  WITH CHECK (bucket_id = 'brochures' AND public.is_admin());


-- ==============================================================================
-- 6. DEFAULT SEED DATA
-- ==============================================================================

-- Initial Application Settings
INSERT INTO public.application_settings (key, value)
VALUES
  ('app_name', 'Inceptrix Outreach'),
  ('default_country_code', '+91'),
  ('sender_display_name', 'Inceptrix Outreach Team'),
  ('active_brochure_path', 'inceptrix_official_brochure_2025.pdf')
ON CONFLICT (key) DO NOTHING;

-- Initial Email Template (Published)
INSERT INTO public.message_templates (
  channel,
  template_name,
  subject,
  html_body,
  text_body,
  version,
  is_published
)
VALUES (
  'email',
  'Default Inceptrix Invitation Email',
  'Invitation to Inceptrix 2025 — Premier Inter-College Event',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #3a3f3a;">
  <div style="background: #657166; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Inceptrix Outreach</h1>
    <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">Official Event Invitation</p>
  </div>
  <div style="padding: 30px; border: 1px solid #e2e5df; border-top: none; border-radius: 0 0 8px 8px; background: #ffffff;">
    <p style="font-size: 15px; line-height: 1.6;">Respected Sir / Madam,</p>
    <p style="font-size: 14px; line-height: 1.6;">We take great pleasure in inviting your esteemed institution and talented student teams to participate in our upcoming flagship event, <strong>Inceptrix 2025</strong>.</p>
    <p style="font-size: 14px; line-height: 1.6;">Our event brings together competitive minds across multiple disciplines. Please find attached our detailed <strong>Event Brochure PDF</strong> with full rules, schedules, and registration details.</p>
    <p style="font-size: 14px; line-height: 1.6;">We eagerly look forward to welcoming your institution''s delegation.</p>
    <br>
    <p style="font-size: 14px; line-height: 1.6; margin: 0;">Warm regards,<br><strong>Team Inceptrix Outreach</strong></p>
  </div>
</body>
</html>',
  'Respected Sir / Madam,

We take great pleasure in inviting your esteemed institution and talented student teams to participate in Inceptrix 2025.

Please find attached our detailed Event Brochure PDF with full schedules and registration details.

Warm regards,
Team Inceptrix Outreach',
  1,
  true
);

-- Initial WhatsApp Template (Published)
INSERT INTO public.message_templates (
  channel,
  template_name,
  whatsapp_body,
  version,
  is_published
)
VALUES (
  'whatsapp',
  'Default Inceptrix Invitation WhatsApp',
  'Hello! 👋 Greetings from *Team Inceptrix*.

We are thrilled to officially invite your institution and student community to participate in *Inceptrix 2025*! 🚀

📋 *Quick Highlights:*
• Premier competitive challenges
• Exciting awards & recognition
• Networking with top colleges across the nation

📎 *Brochure attached below* with complete event tracks and registration guidelines.

We look forward to having your students represent your institution!

For any queries, please feel free to reach out.

Warm regards,
*Team Inceptrix Outreach*',
  1,
  true
);

