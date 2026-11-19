# Architecture Decisions Record (ADR) — Inceptrix Outreach Portal

## ADR 001: Next.js App Router with TypeScript
- **Context**: Need a modern, robust full-stack React framework capable of server-side data fetching, Route Handlers, cookie-based auth sessions, and static pre-rendering.
- **Decision**: Adopted Next.js 16 with App Router and strict TypeScript.
- **Consequences**: Standardized routing, server actions, and type safety across all frontend and backend boundaries.

## ADR 002: Styling with Tailwind CSS v4 & shadcn/ui
- **Context**: Need a clean, minimal internal business tool aesthetic without generic AI template looks.
- **Decision**: Configured Tailwind CSS v4 with an `@theme inline` palette matching the user's uploaded muted palette (`#99CDD8`, `#DAEBE3`, `#FDE8D3`, `#F3C3B2`, `#CFD6C4`, `#657166`). Integrated shadcn/ui components powered by `@base-ui/react` primitives.
- **Consequences**: Fast, cohesive, minimalist UI with consistent components and subtle hover states.

## ADR 003: Fixed Indian WhatsApp Outreach (+91)
- **Context**: The user confirmed that outreach targets are entirely Indian institutions and student teams.
- **Decision**: Fixed the country code to `+91` in the WhatsApp sender module and enforced phone number normalization (stripping spaces, brackets, dashes).
- **Consequences**: Prevents input formatting mistakes by team members while keeping the UI clean and friction-free.

## ADR 004: Sandboxed HTML Email Preview
- **Context**: Admin must be able to write and inspect arbitrary HTML templates without script execution hazards in the dashboard.
- **Decision**: Render previews in sandboxed `<iframe>` elements (`sandbox=""`).
- **Consequences**: Complete security against XSS in the admin interface while rendering real email layouts faithfully.

## ADR 005: Separation of Concerns for Communication Channels
- **Context**: Email and WhatsApp serve distinct outreach needs and mechanisms.
- **Decision**: Kept Email and WhatsApp flows strictly independent. Email communicates via central Gmail API with automatic attachments; WhatsApp communicates via client-side `wa.me` links with honest tracking.
- **Consequences**: Zero accidental dependency or mixing of recipient data between channels.

