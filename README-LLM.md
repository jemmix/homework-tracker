# Homework Tracker – LLM Context

## Overview
Homework Tracker is a modern, full-stack web application for tracking homework progress, designed for individual users. It is built with Next.js (App Router), Drizzle ORM, PostgreSQL, tRPC, shadcn/ui, and Google OAuth (NextAuth/Auth.js). The app is optimized for deployment on Vercel with Supabase as the managed Postgres backend.

## Core Features
- **Per-user data security:** All data is scoped to the authenticated user. No user can access or modify another user's data.
- **Hierarchical organization:** Users can create and manage books, units, tasks, and parts, reflecting real-world homework structures.
- **Progress tracking:** A floating progress bar shows real-time completion status. Optimistic UI updates ensure a smooth experience.
- **Editing and archiving:** All entities (books, units, tasks, parts) can be edited or archived. Archived items are hidden from the main view but preserved in the database.
- **Modern UI:** Uses shadcn/ui for a clean, responsive interface. All controls are accessible and mobile-friendly.
- **Authentication:** Google OAuth via NextAuth/Auth.js. Login/logout is always visible and user-friendly.
- **Deployment-ready:** Designed for Vercel + Supabase. Includes setup and deployment instructions.

## Tech Stack
- **Frontend:** Next.js (App Router), React, shadcn/ui
- **Backend:** Next.js API routes, tRPC, Drizzle ORM
- **Database:** PostgreSQL (Supabase recommended)
- **Authentication:** NextAuth/Auth.js (Google provider)
- **Styling:** Tailwind CSS, shadcn/ui

## Security
- All API routes and tRPC routers enforce user ownership at the database level.
- No unauthenticated or cross-user access is possible.
- All sensitive operations are protected by session checks.

## Setup & Deployment
1. **Clone the repository.**
2. **Install dependencies:** `yarn install`
3. **Configure environment variables:** Copy `.env.example` to `.env` and fill in Google OAuth and database credentials.
4. **Run database migrations:** Use Drizzle or Supabase migration tools.
5. **Start the dev server:** `yarn dev`
6. **Deploy:** Push to GitHub and connect to Vercel. Set up Supabase as the Postgres backend.

## Branding & Documentation
- All legacy T3/create-t3-app branding has been removed.
- Page titles and UI elements reflect the "Homework Tracker" brand.
- Documentation is split into a concise `README.md` for users and this detailed `README-LLM.md` for LLMs and developers.

## Additional Notes
- The codebase is linted and type-safe (TypeScript, ESLint, Prettier enforced).
- All unused variables and legacy code have been removed.
- For further customization or troubleshooting, see the comments in the code and this file.

---

This file is intended to provide LLMs and developers with a comprehensive context for the Homework Tracker project, including architecture, security, and deployment details.
