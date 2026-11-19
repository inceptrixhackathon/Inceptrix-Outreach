# Phased Implementation Plan — Inceptrix Outreach Portal

| Phase | Description | Status |
|-------|-------------|--------|
| **Phase 0** | Requirement Discovery & Project Planning | ✅ Completed |
| **Phase 1** | Project Initialization & UI Foundation | ✅ Completed |
| **Phase 2** | Supabase Database, Auth SSR & Storage | ✅ Completed |
| **Phase 3** | Admin Panel & Template Management Wiring | ✅ Completed |
| **Phase 4** | Centralized Gmail API Integration | ⏳ Next |
| **Phase 5** | WhatsApp Click-to-Chat Integration | ⏳ Pending |
| **Phase 6** | Activity History & Admin Analytics | ⏳ Pending |
| **Phase 7** | Security Audit, Testing & QA | ⏳ Pending |
| **Phase 8** | Production Deployment on Vercel | ⏳ Pending |

---

## Phase 1 Deliverables Summary
- Initialized Next.js App Router with TypeScript & Tailwind CSS v4.
- Implemented shadcn/ui components with `@base-ui/react` primitives.
- Extracted and applied the custom muted color palette:
  - Brand Blue (`#99CDD8`)
  - Brand Mint (`#DAEBE3`)
  - Brand Peach (`#FDE8D3`)
  - Brand Pink (`#F3C3B2`)
  - Brand Sage (`#CFD6C4`)
  - Brand Dark (`#657166`)
- Configured routes and UI screens:
  - `/login`: Clean team member & admin sign-in form.
  - `/dashboard`: Outreach channel selection (Email vs WhatsApp).
  - `/send/email`: Email sender interface with live sandboxed HTML preview, recipient input, and auto-attached brochure badge.
  - `/send/whatsapp`: Indian (+91 fixed) WhatsApp outreach interface with formatted number normalization, template preview, brochure download, and honest "Mark as Sent" workflow.
  - `/history`: Member-specific communication audit trail with search.
  - `/admin`: Administration dashboard with operational stats cards and template health.
  - `/admin/templates`: Dual-tab editor for HTML Email (subject + source code + sandboxed preview) and WhatsApp copy (markdown preview).
  - `/admin/brochure`: Active PDF brochure manager with replace/upload interface.
  - `/admin/users`: Team member provisioning table and modal with activate/deactivate toggles.
  - `/admin/activity`: Global audit trail with channel, member, and recipient filtering.
  - `/admin/gmail`: Central Gmail OAuth status and connection settings.
  - `/admin/settings`: Non-sensitive portal configuration manager.
- Production build verified with Next.js webpack engine (`npm run build`).

