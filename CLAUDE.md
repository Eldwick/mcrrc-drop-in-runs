# MCRRC Run Finder

A web app that helps Montgomery County Road Runners Club members discover weekly drop-in group runs by location and pace. Runners enter where they are and how fast they run; the app shows them the best matches on a map. Run organizers can list and manage their runs without creating an account.

See @docs/PRD.md for the full product requirements document.

## Tech Stack

- **Framework:** Next.js 15 (App Router) with TypeScript (strict mode)
- **Database:** Neon serverless Postgres via `@neondatabase/serverless`
- **ORM:** Drizzle ORM with `drizzle-kit` for migrations
- **Styling:** Tailwind CSS (mobile-first)
- **Map:** Leaflet + React-Leaflet + OpenStreetMap tiles
- **Geocoding:** Nominatim (OpenStreetMap) — free, no API key
- **Testing:** Vitest + @testing-library/react
- **Hosting:** Vercel (serverless)

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — ESLint check
- `npm run typecheck` — TypeScript type checking (`tsc --noEmit`)
- `npm run test` — Run all Vitest tests
- `npm run test:watch` — Run tests in watch mode
- `npm run test:coverage` — Run tests with coverage report
- `npm run db:generate` — Generate Drizzle migrations from schema changes
- `npm run db:migrate` — Apply migrations to Neon
- `npm run db:studio` — Open Drizzle Studio to inspect the database
- `npm run db:seed` — Seed database with initial MCRRC run data

## Architecture

```
/src
  /app                    # Next.js App Router pages and layouts
    /page.tsx             # Home — map + seeker search interface
    /runs/new/page.tsx    # Add a Run form
    /runs/[id]/page.tsx   # Run detail view
    /runs/[id]/edit/page.tsx  # Edit a Run (requires ?token= query param)
    /api/                 # API route handlers
      /runs/              # CRUD for run listings
      /geocode/           # Proxy for Nominatim geocoding
  /components             # React components
    /ui/                  # Generic reusable UI components
    /map/                 # Map-specific components (Leaflet wrappers)
    /forms/               # Run creation/edit form components
  /lib                    # Shared utilities
    /db/                  # Drizzle client, schema, and migrations
      schema.ts           # Drizzle table definitions (source of truth)
      index.ts            # DB client connection
      seed.ts             # Seed script for initial data
    /utils/               # Helper functions (haversine, scoring, etc.)
    /types/               # Shared TypeScript types and Zod schemas
  /hooks                  # Custom React hooks
```

## Code Style

- TypeScript strict mode. No `any` types — use `unknown` and narrow, or define proper types.
- Use named exports, not default exports, except for Next.js page/layout components which require default exports.
- Use ES module imports. No `require()`.
- Prefer `interface` over `type` for object shapes. Use `type` for unions, intersections, and utility types.
- Use Zod for runtime validation of all API inputs. Colocate Zod schemas with their corresponding types in `/lib/types/`.
- Prefer server components by default. Only add `"use client"` when the component needs interactivity, browser APIs, or hooks.
- Tailwind for all styling. No CSS modules, no styled-components, no inline `style` attributes.
- Prefer `const` arrow functions for component definitions: `const RunCard = () => { ... }`.

## Database Conventions

- Drizzle schema in `/lib/db/schema.ts` is the single source of truth for the database structure.
- Use `snake_case` for all database column names.
- Use `camelCase` in TypeScript code — Drizzle handles the mapping.
- All tables must have `createdAt` and `updatedAt` timestamp columns.
- Generate migrations with `npm run db:generate` after any schema change. Never hand-edit migration files.
- The `editToken` column stores a crypto-random string (generated via `crypto.randomUUID()`). It is never exposed in public API responses.

## API Conventions

- All API routes live under `/app/api/` using Next.js Route Handlers.
- Return JSON with consistent shape: `{ data: ... }` on success, `{ error: "message" }` on failure.
- Use appropriate HTTP status codes: 200 for success, 201 for creation, 400 for validation errors, 403 for invalid edit token, 404 for not found.
- Validate all request bodies with Zod before processing.
- The edit token is passed as a query parameter (`?token=xxx`), never in the request body.
- IMPORTANT: Never return `editToken` in any public-facing API response (GET /runs, GET /runs/:id). Only return it once on POST /runs (run creation) so the organizer can save it.

## Map & Geo Conventions

- Leaflet requires dynamic import with `ssr: false` in Next.js. Always use `next/dynamic` to import map components.
- Store coordinates as separate `latitude` and `longitude` decimal columns in Postgres (not PostGIS — keep it simple).
- Nominatim geocoding: rate limit to 1 request per second. Add a `User-Agent` header identifying the app. Cache results where possible.
- Haversine formula for distance calculation. Implementation goes in `/lib/utils/haversine.ts`. Returns distance in miles.
- Default map center: Montgomery County, MD (approximately 39.14, -77.15), zoom level 11.

## Matching & Ranking

The seeker flow uses a relevance score combining pace match and proximity:

```
relevance = (pace_score * 0.6) + (proximity_score * 0.4)
```

- `pace_score`: derived from the availability level for the user's selected pace range
  - Consistently = 1.0, Frequently = 0.7, Sometimes = 0.4, Rarely = 0.1
- `proximity_score`: `1 / (1 + distance_miles / 5)` — decays smoothly, 1.0 at zero distance
- Ranking is computed client-side after fetching all active runs (dataset is small, ~50 runs max)

## Key Domain Concepts

- **Pace ranges:** `sub_8`, `8_to_9`, `9_to_10`, `10_plus` — stored as a JSON object on the run
- **Availability levels:** `consistently`, `frequently`, `sometimes`, `rarely`
- **Edit token:** A secret URL token that grants edit access to a run. No user accounts exist. Organizers bookmark their edit link.
- **Active/inactive:** Runs can be deactivated (hidden from search) but not deleted.

## Testing

- **Framework:** Vitest with `@testing-library/react` for component tests
- `npm run test` — Run all tests
- `npm run test:watch` — Run tests in watch mode
- `npm run test:coverage` — Run tests with coverage report

### Test Workflow (IMPORTANT)

Claude must maintain a strong, passing test suite at all times. Follow this workflow:

1. **Before writing implementation code**, write or update tests that define the expected behavior.
2. **After completing a feature or change**, run `npm run test` and confirm all tests pass before moving on.
3. **If a test fails**, fix the implementation (not the test) unless the test itself has a bug or the requirements changed.
4. **If requirements change**, ask the user for clarification, then update tests to match the new requirements before updating implementation.
5. **Never delete or skip a failing test to make the suite pass.** If a test needs to change, explain why.

### What to Test

- **Unit tests (required):** Haversine distance calculation, relevance scoring algorithm, Zod validation schemas, edit token generation, any pure utility functions
- **API route tests (required):** All `/api/runs` endpoints — creation, retrieval, update, token validation, error cases (invalid token, missing fields, malformed data)
- **Component tests (where valuable):** Form validation behavior, conditional rendering based on pace data. Don't test simple layout/styling.

### Test File Conventions

- Test files live next to the code they test: `haversine.ts` → `haversine.test.ts`
- API route tests live in `__tests__/` directories adjacent to the route: `/app/api/runs/__tests__/route.test.ts`
- Use descriptive test names: `it("returns 403 when edit token is invalid")` not `it("handles bad token")`
- Use `describe` blocks to group related tests by feature or endpoint

## Git Workflow

- Commit directly to `main` (solo project, no branches needed).
- Use conventional commit messages: `feat:`, `fix:`, `chore:`, `test:`, `docs:`
- **Commit after completing each major piece of work** — a working feature, a passing test suite addition, a schema migration, etc. Don't let work accumulate uncommitted.
- **Before every commit:** run `npm run typecheck && npm run lint && npm run test` and confirm all pass. Do not commit with failing checks.
- Write clear commit messages that describe what changed and why. Examples:
  - `feat: add run creation API with Zod validation and edit token generation`
  - `test: add API route tests for GET /api/runs with pace filtering`
  - `fix: correct haversine formula to return miles instead of kilometers`
  - `chore: add Nominatim geocoding proxy with rate limiting`

## Environment Variables

```
DATABASE_URL=           # Neon Postgres connection string (pooled)
NEXT_PUBLIC_APP_URL=    # Base URL of the deployed app (for generating edit links)
```

No other API keys are needed. The entire stack is free-tier.

## Brand & Visual Style

The app follows the MCRRC brand identity from mcrrc.org. The tagline is **"A Place For Every Pace"**.

### Brand Colors (from mcrrc.org)

| Role | Hex | CSS Variable | Tailwind Class |
|------|-----|-------------|----------------|
| Primary dark (nav, header bg) | `#0D0D3B` | `--brand-navy` | `brand-navy` |
| Accent purple (Join Us, key CTAs) | `#402277` | `--brand-purple` | `brand-purple` |
| Accent orange (secondary CTA, highlights) | `#E97E12` | `--brand-orange` | `brand-orange` |
| Light background | `#f2f5f7` | `--brand-gray` | `brand-gray` |
| Body text | `#333333` | `--foreground` | `foreground` |
| White | `#ffffff` | `--background` | `background` |

### Color Usage Rules

- **Primary buttons and CTAs** (selected pace pills, Submit Run, main actions): Use `brand-purple`. This matches the "Join Us" button on mcrrc.org.
- **Secondary accents and highlights** (terrain badges, hover states, the "Add a Run" link, emphasis): Use `brand-orange`.
- **Nav and header backgrounds**: Use `brand-navy` (very dark, nearly black).
- **Text links**: Use `brand-purple` default, `brand-orange` on hover.
- **Secondary text** (labels, helper text, muted info): Use Tailwind `gray-500` or `gray-600`.
- **Light backgrounds** (card areas, bottom sheet, search bar): Use `brand-gray` or white.
- **Semantic colors** (pace match indicators): Keep standard Tailwind green/yellow/gray — these are informational, not brand-specific.
- **Never use default Tailwind blue** (`blue-500`, `blue-600`, etc.) for interactive elements. Always use the custom brand colors above.
- The app has no dark mode. MCRRC's site does not use dark mode.

### Home Page Layout

The home page uses a **layered layout** (Google Maps-style):

- **Layer 0:** `layout.tsx` header — still rendered but hidden behind the fixed map
- **Layer 1:** Full-screen Leaflet map (`position: fixed; inset: 0; z-index: 0`)
- **Layer 2:** Floating search bar (`position: fixed; top; z-index: 20`) — collapsible pill that expands to show LocationSearch + PaceSelector
- **Layer 3:** Draggable bottom sheet (`position: fixed; bottom; z-index: 10`) — three snap points: collapsed (70px peek), half (50vh), full (100vh - 40px)
- **Layer 4:** Floating "Add a Run" button (`position: fixed; top-right; z-index: 20`)

Other pages (`/runs/new`, `/runs/[id]`, `/runs/[id]/edit`) use standard flow layout — the `layout.tsx` header remains visible.

## Important Rules

- NEVER install or use Google Maps. Use Leaflet + OpenStreetMap only.
- NEVER add authentication libraries (NextAuth, Clerk, etc.). Auth is just the edit token.
- NEVER use `WidthType.PERCENTAGE` or any paid API services.
- All data fetching for the map/seeker view should happen server-side where possible, with the ranking/sorting computed client-side.
- Every form must work well on mobile. Inputs should be large enough to tap. Use native date/time pickers where possible.
- When creating the "edit link shown after run creation" UI, make it extremely prominent and clear. This is the most critical UX moment — if the organizer loses this link, they lose edit access.
