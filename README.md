# Ramitos Web

React SPA for browsing DCC courses, reading and submitting student opinions, and planning a curriculum at Universidad de Chile. The UI is in Spanish.

## Development

Use Node **24.0.2** (see `.node-version`) and pnpm **11.1.2** (pinned in `package.json`).

```sh
pnpm install --frozen-lockfile
# Copy .env.example to .env using your editor or shell.
pnpm dev
```

Vite serves the app at http://localhost:5173. To work without a backend, set `VITE_API_MOCKING_ENABLED=true` in `.env`. Mocking is development-only; production builds never start MSW.

| Variable                   | Purpose                                                                                  |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL`        | Backend target for Vite's development /api proxy.                                        |
| `VITE_API_SCHEMA_BASE_URL` | Base URL for explicit OpenAPI snapshot updates and initial live generation.              |
| `VITE_AUTH_API_ORIGIN`     | Public backend origin for DCC login and token exchange. Defaults to the frontend origin. |
| `VITE_API_MOCKING_ENABLED` | Set to true for local MSW fixtures; false for real API calls.                            |
| `VITE_API_PROXY_SECURE`    | Development proxy certificate verification; defaults to true.                            |

Variables prefixed with VITE\_ are public browser configuration. Do not put secrets in them. Keep local credentials and environment files out of Git. A backend with a private certificate authority needs a trusted CA; the proxy setting does not change the schema downloader's certificate verification.

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

Before running browser tests for the first time, run `pnpm exec playwright install chromium`. CI runs `pnpm check` and the browser suite on pushes and pull requests. Failed browser traces are uploaded as artifacts. Formatting excludes generated output, external data, historical local notes, and test artifacts. Generated files remain typechecked through their consumers.

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

Cross-feature imports go through `features/<feature>/index.ts`; imports within a feature may use its internal modules. ESLint checks that boundary. Generated clients belong behind feature API adapters, with an exception for shared mock infrastructure. UI code consumes frontend view models instead of backend DTOs. Prefer direct MUI icon imports to avoid loading the entire icon library in development and tests.

Server state belongs in TanStack Query; search/filter state belongs in the URL; theme, authentication, and roadmap interaction state use React hooks/context. Roadmap marks and preferences persist only in this browser. The shared infinite-scroll hook manages observer lifetime; callers own pagination and error rendering.

## Session ownership

The auth feature owns session verification, login acceptance, persistence, expiry, and synchronization across tabs. `AuthProvider` exposes that state to React; the admin route waits for a verified role before rendering protected content. Authenticated requests run through the session module so responses from a prior account cannot update or expire the current session.

A session change clears the query cache. Logout and a newer login attempt supersede pending work, including DCC callback completion. Tabs coordinate through a single browser-local session record and Web Locks; production requires a secure context with Web Locks support (HTTPS, or localhost for development). Existing stored credentials migrate and are verified; stored role data never grants frontend access.

Network failures during account verification preserve credentials and expose a retry action while public browsing remains available. HTTP 401 and local expiry end the session; a feature-level 403 denies that action only. A 403 during account verification clears the session and reports access denial. Storage failures withdraw account access and show a recovery action; if logout persistence fails, retry completes logout instead of restoring the old credentials.

## API generation

```sh
pnpm api:update     # fetch and validate all five backend schemas
pnpm generate:api   # generate clients from local snapshots when available
pnpm check
```

The update command writes `api/schemas/<Service>.json` only after all downloads validate. Review and commit schema and generated-code changes together. Orval prefers these snapshots and falls back to live schemas when a snapshot is absent. The initial snapshot could not be retrieved during cleanup because the configured endpoint failed certificate verification; offline regeneration is therefore pending. Normal builds use the checked-in generated clients and do not contact the backend.

Do not hand-edit `src/generated/` or `src/routeTree.gen.ts`. Put custom request handling and DTO mapping in the owning feature's API files. Keep mock overrides in `src/shared/api/msw/fixtures.ts`.

## Deployment

Deploy `dist/` to a static host with an SPA fallback to `index.html` for routes such as `/curso/CC1001`, `/malla`, and `/auth/dcc/callback`. Serve real assets normally and route `/api/*` to the backend before applying the SPA fallback. Vite's development proxy is not part of the deployed app. Configure the public DCC auth origin at build time; the backend must allow the frontend callback origin and credentialed token exchange where cross-origin authentication is used.

Verify direct links, reload, login/callback/logout, review submission, and expired-session behavior against staging before release. The frontend admin redirect is a navigation convenience; backend authorization must protect every privileged endpoint.

## MVP status

See [MVP readiness](docs/MVP_READINESS.md) for implemented behavior, prototype placeholders, backend dependencies, and remaining release checks. The cleanup does not make every prototype feature production-ready.
