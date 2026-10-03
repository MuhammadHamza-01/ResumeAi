# ResumeAI

**Analyze your resume. Understand your strengths. Improve your chances.**

ResumeAI is a full-stack MERN application that uses AI to analyze resumes against job descriptions and provide ATS compatibility estimates, skill-gap analysis, keyword matching, and actionable recommendations.

## Tech Stack

| Layer    | Technologies |
| -------- | ------------ |
| Frontend | React, Vite, Tailwind CSS, React Router, Axios, React Hook Form |
| Backend  | Node.js, Express (ES modules), MongoDB, Mongoose |
| Auth     | JWT, bcrypt (Phase 2+) |
| Other    | Multer, PDF extraction, AI API (upcoming phases) |

## Project Structure

```
resume-ai/
├── client/          # React + Vite frontend
└── server/          # Express API
    └── src/
        ├── config/
        ├── controllers/
        ├── middleware/
        ├── models/
        ├── routes/
        ├── services/
        └── utils/
```

## Installation

### Prerequisites

- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### Backend

```bash
cd server
cp .env.example .env
# Edit .env with your MONGODB_URI and JWT_SECRET
npm install
npm run dev
```

### Frontend

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

- Frontend: http://localhost:5173  
- API: http://localhost:5000  
- Health check: `GET http://localhost:5000/api/health`

## Environment Variables

**Server (`server/.env`)**

| Variable     | Description |
| ------------ | ----------- |
| `PORT`       | API port (default 5000) |
| `MONGODB_URI`| MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `AI_API_KEY` | AI provider key (backend only) |
| `CLIENT_URL` | Frontend URL for CORS |

**Client (`client/.env`)**

| Variable       | Description |
| -------------- | ----------- |
| `VITE_API_URL` | Backend API base URL |

## Development Phases

This repo is built in phases. **Phase 1** (current): monorepo setup, Express health API, MongoDB connection, React landing page, Tailwind, Axios health check.

## License

MIT
