# Ramitos Web

Frontend SPA for browsing DCC courses and student opinions. The app talks to the
Ramitos REST API and uses Orval-generated clients for typed backend access.

## Stack

- React 19 + Vite
- TanStack Router for file-based routes
- TanStack Query for server state
- MUI for UI
- Orval for OpenAPI clients and generated MSW handlers
- MSW + Faker for local API mocks
- TypeScript + Zod

## Setup

```bash
pnpm install
```

Copy `.env.example` to `.env` and set:

```bash
VITE_API_BASE_URL="https://example-backend"
VITE_API_MOCKING_ENABLED=false
```

`VITE_API_BASE_URL` is used by `vite.config.ts` as the target for the local
`/api` proxy.

## Commands

```bash
pnpm run dev      # start Vite on http://localhost:5173
pnpm run build    # typecheck and production build
pnpm run test     # run Vitest
pnpm run format   # format src with Prettier
pnpm orval        # regenerate OpenAPI clients
```

Before handing off code, run:

```bash
pnpm run format
pnpm run build
```

## Project Structure

```txt
src/
  app/          app-wide providers and query client setup
  features/     feature-owned API adapters, hooks, components, public exports
  generated/    Orval output only; do not edit by hand
  routes/       thin TanStack Router files
  shared/       shared components, providers, types, and MSW infrastructure
  constants/    shared domain/display constants
  theme/        MUI theme definitions
```

Feature folders expose their supported cross-feature surface through
`features/<feature>/index.ts`. Prefer importing from that public API instead of
deep-linking into another feature's internals.

## API Boundary

Orval generates clients into `src/generated/api`. UI code should not import from
`src/generated` directly. Feature API files adapt backend DTOs into frontend view
models and contain TODOs for backend gaps.

Typical flow:

```txt
component -> feature hook -> feature api/mapper -> generated client
```

When adding or changing backend schemas:

1. Update `orval.config.ts` if a new service is needed.
2. Run `pnpm orval`.
3. Wire new calls through the owning feature's `api`/`hooks`.
4. If the backend shape is incomplete, keep the adapter and add/update the
   backend TODO or feature request.

## Mocking

Set `VITE_API_MOCKING_ENABLED=true` to intercept `/api` calls with MSW.

Mock setup lives in:

- `src/shared/api/msw/browser.ts`
- `src/shared/api/msw/fixtures.ts`

Generated MSW handlers come from `src/generated/api/**`. Override behavior in
the shared MSW fixtures; do not edit generated files.

## Current Features

- `/` course catalog with URL-backed search/filter state and infinite loading
- `/curso/$cursoId` course detail, review list, own-review detection, and
  create/edit review composer
- `/admin` review moderation feed guarded by stored auth role
- Password login with session-expiration handling
- Light/dark theme toggle

## Architecture Notes

- Keep route files thin: bind URL params/search to feature screens.
- Keep backend adaptation in feature `api`/mapper files, not JSX.
- Prefer explicit component variants over boolean prop growth.
- Use feature hooks for query keys, pagination, and cache behavior.
- Treat `src/generated` as disposable Orval output.
