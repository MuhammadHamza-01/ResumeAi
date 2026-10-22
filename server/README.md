# ResumeAI Server

Express REST API for ResumeAI.

## Scripts

- `npm run dev` — start with Node watch mode
- `npm start` — production start

## Required environment variables

Copy `.env.example` to `.env` and set the MongoDB, JWT, and Cloudinary credentials.

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Resume uploads accept PDF, DOC, and DOCX files up to 5MB. Files are uploaded to Cloudinary as raw resources and are not stored in the server's local `uploads` directory.

## API

### Health

- `GET /api/health` — service health check

### Auth (Phase 2)

- `POST /api/auth/register` — `{ name, email, password }`
- `POST /api/auth/login` — `{ email, password }`
- `GET /api/auth/profile` — protected
- `PUT /api/auth/profile` — protected, update `{ name }`
