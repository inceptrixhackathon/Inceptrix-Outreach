# External Accounts & Integration Setup Guide

## 1. Supabase Setup (Phase 2 Prerequisite)
1. Go to [supabase.com](https://supabase.com) and sign in.
2. Create a new project:
   - **Project Name**: `inceptrix-outreach`
   - **Database Password**: Choose a strong password and save it safely.
   - **Region**: Choose the closest region (e.g. `ap-south-1` Mumbai).
3. Once the project is provisioned, navigate to **Project Settings > API**:
   - Copy `Project URL` -> `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `anon public` key -> `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - Copy `service_role secret` key -> `SUPABASE_SERVICE_ROLE_KEY` (keep this strictly private)
4. We will execute the migration SQL schema provided in Phase 2 in the Supabase **SQL Editor**.

## 2. Google Cloud & Gmail API (Phase 4 Prerequisite)
1. Go to [console.cloud.google.com](https://console.cloud.google.com).
2. Create a project: `Inceptrix Outreach`.
3. In **APIs & Services > Library**, search for **Gmail API** and click **Enable**.
4. In **APIs & Services > OAuth consent screen**:
   - User Type: **External** (since using a personal Gmail account).
   - App Name: `Inceptrix Outreach`.
   - User Support Email: Your personal email.
   - Scopes: Add `https://www.googleapis.com/auth/gmail.send`.
   - Test Users: Add the central Gmail address as a test user.
5. In **APIs & Services > Credentials**:
   - Click **Create Credentials > OAuth client ID**.
   - Application Type: **Web application**.
   - Authorized Redirect URIs:
     - Local dev: `http://localhost:3000/api/gmail/callback`
     - Production: `https://<your-vercel-domain>.vercel.app/api/gmail/callback`
   - Save your **Client ID** and **Client Secret**.

## 3. WhatsApp Linked Devices (Phase 5)
1. On each outreach laptop (1 to 4 laptops), open WhatsApp Web or the WhatsApp Desktop application.
2. On the central phone holding the personal WhatsApp account, go to **Settings > Linked Devices > Link a Device**.
3. Scan the QR code on each laptop.
4. The Inceptrix Outreach Portal will trigger official `https://wa.me/91XXXXXXXXXX?text=...` links directly into this active session.
