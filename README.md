# Ramitos Web

Work in progress.

## Development

### Setup

```bash
pnpm install
```

Then copy `.env.example` to `.env` and populate the values.

### Running

```bash
pnpm run dev
```

If no backend is running, you can set `VITE_API_MOCKING_ENABLED` to `true` to intercept requests with MSW + faker mocks.

### API schemas

Updating the schemas:

```bash
pnpm orval
```

When adding a new service: add it to `orval.config.tsn`
For mocking your new service: add it to `src/main.tsx`

### Before commit

```bash
pnpm run lint

pnpm run format
```

### Deployment

```bash
pnpm run build
```
