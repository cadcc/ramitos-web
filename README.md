# Ramitos Web

React SPA for browsing DCC courses, reading and submitting student opinions, and planning a curriculum at Universidad de Chile. The UI is in Spanish.

## Development

```sh
pnpm install --frozen-lockfile
# Copy .env.example to .env using your editor or shell.
pnpm dev
```

Vite serves the app at http://localhost:5173. Options:

- Without a backend: `VITE_API_MOCKING_ENABLED=true` in `.env`.
- With a backend: variables below
  - Note: staging backend requires the DCC VPN 

| Variable                   | Purpose                                                                                  |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL`        | Backend target for Vite's development /api proxy.                                        |
| `VITE_API_SCHEMA_BASE_URL` | Base URL for explicit OpenAPI snapshot updates and initial live generation.              |
| `VITE_AUTH_API_ORIGIN`     | Public backend origin for DCC login and token exchange. Defaults to the frontend origin. |
| `VITE_API_MOCKING_ENABLED` | Set to true for local MSW fixtures; false for real API calls.                            |
| `VITE_API_PROXY_SECURE`    | Development proxy certificate verification; defaults to true.                            |

## Quality checks

| Command                       | Purpose                                                       |
| ----------------------------- | ------------------------------------------------------------- |
| `pnpm format`                 | Format maintained source, config, and documentation.          |
| `pnpm format:check`           | Check formatting without writes.                              |
| `pnpm lint` / `pnpm lint:fix` | Typed ESLint, React Hooks, and feature-boundary checks.       |
| `pnpm typecheck`              | Strict TypeScript, including tool config and browser tests.   |
| `pnpm test` / `pnpm test:run` | Watch tests / run once.                                       |
| `pnpm build`                  | Typecheck and create the production bundle in dist/.          |
| `pnpm check`                  | Format check, lint, types, unit/integration tests, and build. |
| `pnpm test:e2e`               | Desktop and mobile Chromium smoke tests using local mocks.    |
| `pnpm preview`                | Inspect the production bundle locally.                        |

## Architecture

The app uses React 19, Vite, MUI, TanStack Router, TanStack Query, Orval, MSW, and Zod.

```text
src/
  app/providers/   application provider composition and QueryClient
  features/        auth, course-catalog, course-detail, course-roadmap,
                   reviews, admin (API adapters, hooks, components, models)
  routes/          URL search/params and route composition
  shared/          shared hooks, components, themes, types, mock infrastructure
  constants/       domain and display constants
  generated/api/   disposable Orval clients, models, and mock handlers
```

Cross-feature imports go through `features/<feature>/index.ts`; imports within a feature may use its internal modules. ESLint checks that boundary. Generated clients belong behind feature API adapters, with an exception for shared mock infrastructure. UI code consumes frontend view models instead of backend DTOs.

## API generation

```sh
pnpm api:update     # fetch and validate all five backend schemas
pnpm generate:api   # generate clients from local snapshots when available
pnpm check
```

The update command writes `api/schemas/<Service>.json` from the connected backend. Review and commit schema and generated-code changes together.

Do not hand-edit `src/generated/` or `src/routeTree.gen.ts`. Keep mock overrides in `src/shared/api/msw/fixtures.ts`.

## Deployment

Pushes to `main` build and publish production release assets. Each workflow run uses its run number as the public version.

Deploy `dist/` to a static host with an SPA fallback to `index.html` for routes such as `/curso/CC1001`, `/malla`, and `/auth/dcc/callback`. Serve real assets normally and route `/api/*` to the backend before applying the SPA fallback.
