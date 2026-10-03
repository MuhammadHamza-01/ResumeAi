# ResumeAI Server

Express REST API for ResumeAI.

## Scripts

- `npm run dev` — start with Node watch mode
- `npm start` — production start

## API

### Health

- `GET /api/health` — service health check

### Auth (Phase 2)

- `POST /api/auth/register` — `{ name, email, password }`
- `POST /api/auth/login` — `{ email, password }`
- `GET /api/auth/profile` — protected
- `PUT /api/auth/profile` — protected, update `{ name }`
