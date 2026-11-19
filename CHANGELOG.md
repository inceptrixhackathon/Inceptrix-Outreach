# Changelog — Inceptrix Outreach Portal

## [0.1.0] - Phase 1 UI Foundation Completed (2026-11-20)

### Added
- **Project Structure**: Next.js 16 with App Router, TypeScript, and Tailwind CSS v4.
- **Color Palette**: Custom muted palette inspired by brand reference image:
  - Blue: `#99CDD8`
  - Mint: `#DAEBE3`
  - Peach: `#FDE8D3`
  - Pink: `#F3C3B2`
  - Sage: `#CFD6C4`
  - Dark Accent: `#657166`
- **UI Components**: Installed and configured shadcn/ui base primitives (`Button`, `Card`, `Input`, `Label`, `Badge`, `Table`, `Tabs`, `Textarea`, `Dialog`, `DropdownMenu`, `Avatar`, `Separator`, `Tooltip`, `ScrollArea`).
- **Layout Shell**:
  - Responsive collapsible Sidebar with dedicated Member and Administrator navigation sections.
  - Sticky Topbar with avatar profile and sign-out dropdown.
  - Mobile slide-over navigation overlay.
- **Member Outreach Screens**:
  - `/login`: Clean team member and admin login screen.
  - `/dashboard`: High-level outreach selector with Email and WhatsApp cards.
  - `/send/email`: Email sender interface with live sandboxed HTML preview, recipient input, and auto-attached brochure badge.
  - `/send/whatsapp`: WhatsApp sender interface locked to Indian (+91) recipients, message preview, brochure download, and honest "Mark as Sent" workflow.
  - `/history`: Individual team member outreach history with recipient search.
- **Admin Management Screens**:
  - `/admin`: Administration dashboard with outreach statistics and system status.
  - `/admin/templates`: Full dual-tab editor for HTML email templates (with live sandboxed preview) and WhatsApp text templates.
  - `/admin/brochure`: Active brochure PDF manager with upload/replace interface.
  - `/admin/users`: Team member provisioning table and modal with activate/deactivate toggles.
  - `/admin/activity`: Global team audit trail with multi-channel and multi-user filtering.
  - `/admin/gmail`: Central Gmail OAuth status and connection settings.
  - `/admin/settings`: Portal configuration management for application defaults.
- **Build Verification**: Verified clean TypeScript compilation and static page generation across all 14 routes.
