# Inceptrix Outreach Portal

Centralized web application for team-based email and WhatsApp outreach for Inceptrix events.

## Features
- **Centralized Email Outreach**: Dispatched through a single authorized Gmail account using the official Gmail API with automatic brochure attachment.
- **WhatsApp Outreach**: Click-to-Chat integration (`wa.me`) targeting Indian mobile numbers (+91) with predefined message templates and honest status tracking.
- **No Manual Template Alterations**: Subject lines and HTML/WhatsApp copy are managed centrally by the Administrator without redeploying code.
- **Role-Based Access Control**: Strict segregation between Administrators and Outreach Team Members.
- **Minimalist Aesthetic**: Professional internal business tool styled with a custom muted palette.

## Tech Stack
- **Framework**: Next.js (App Router, TypeScript)
- **Styling**: Tailwind CSS v4, shadcn/ui components, Lucide React icons
- **Database & Auth**: Supabase PostgreSQL, Supabase Auth SSR, Supabase Storage
- **Email Service**: Official Google Gmail API (OAuth 2.0, `gmail.send` scope)
- **WhatsApp Service**: Official WhatsApp Click-to-Chat (`wa.me`)
- **Deployment**: Vercel

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local` and fill in credentials:
```bash
cp .env.example .env.local
```

### 3. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the portal.
