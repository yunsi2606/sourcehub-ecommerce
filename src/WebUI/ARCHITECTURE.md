# Frontend Architecture & Clean Code Rules

This document outlines the core principles and folder structure for the SourceHub Next.js frontend. **AI Assistants and Developers MUST read and adhere to these rules** when working on this project.

## 1. Core Philosophy (Clean Code)
- **No Giant Files**: Never write 100+ line components if they can be split. If a `page.tsx` or `layout.tsx` starts growing, immediately extract logical sections into `src/components/`.
- **Single Responsibility**: A component should do one thing well. A page component should only be a composition of smaller components, not the place where all UI is built.
- **DRY (Don't Repeat Yourself)**: Extract reusable UI (Cards, Buttons, Inputs) into `src/components/ui/` or `src/components/shared/`.

## 2. Folder Structure
We utilize Next.js 16 App Router Route Groups to logically separate the application without affecting URL paths.

```text
src/
├── app/
│   ├── (storefront)/        # Public marketing & shopping pages
│   │   ├── products/        # Product listing
│   │   ├── services/        # IT Services
│   │   └── page.tsx         # Main Landing Page (Composed of /components/home)
│   ├── (auth)/              # Authentication flows
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/         # Protected user area (Requires Session)
│   │   ├── layout.tsx       # Dashboard shell (Sidebar + Navbar)
│   │   ├── dashboard/       # Overview
│   │   ├── orders/          # Order history
│   │   └── downloads/       # File access
│   ├── globals.css          # Tailwind v4 theme and global utilities
│   └── layout.tsx           # Root layout (Html, Body, Fonts)
├── components/
│   ├── ui/                  # Atomic components (Button, Input, Modal)
│   ├── shared/              # Components used across multiple pages (ProductCard)
│   ├── layout/              # Navbar, Footer, Sidebar
│   └── home/                # Components specific to the landing page
├── lib/                     # Utilities, API client (api.ts)
├── stores/                  # State management (Zustand/Context)
└── hooks/                   # Custom React Hooks
```

## 3. Styling Guidelines
- **Framework**: Tailwind CSS v4.
- **Theme**: Light Mode SaaS Aesthetic (Stripe/Vercel inspired). **NO dark mode.**
- **Backgrounds**: Use `#ffffff` for cards/sections, `#F8FAFC` (`bg-muted`) for contrast sections.
- **Shadows**: Use `shadow-soft` and `hover:shadow-soft-hover` for premium, subtle depth.
- **Spacing**: Use generous whitespace (`py-24`, `gap-8`).

## 4. API & Data Fetching
- **Authentication**: Handled exclusively via Supabase Auth (`@supabase/supabase-js`, `@supabase/ssr`).
- **Business Logic**: Handled by the `.NET Backend`. The frontend fetches data using the typed client in `src/lib/api.ts` passing the Supabase JWT as a Bearer token.
- **Direct DB Access**: The frontend **NEVER** queries the PostgreSQL database directly using Supabase PostgREST. All data requests route through the `.NET API`.
