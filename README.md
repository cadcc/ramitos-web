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

### API schemas

When adding a new service: add it to `api/services.json`

To fetch the latest OpenAPI definitions for all services:

```bash
pnpm run update-api
```

### Before commit

```bash
pnpm run lint

pnpm run format
```

### Deployment

placeholder
