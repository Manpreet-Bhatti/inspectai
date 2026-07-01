# InspectAI

Multi-modal AI-powered property inspection platform that transforms photos and voice notes into structured inspection reports with AI-identified issues, severity ratings, cost estimates, and historical pattern matching.

## Tech Stack

| Layer | Technology |
| ------- | ------------ |
| Frontend | Next.js 16, React 19, TypeScript 5.9, Tailwind CSS 4, shadcn/ui |
| State Management | TanStack Query 5, Zustand 5 |
| Auth / DB / Storage | Supabase (Postgres 16 + pgvector, Auth, Storage) |
| ML Backend | Python 3.12+, FastAPI |
| ML Inference | HuggingFace Inference Providers (serverless) |
| Rate Limiting | Upstash Redis (optional) |
| Local Dev Infra | PostgreSQL 16 (pgvector), Redis 7 (Docker) |
| Testing | Vitest 4, Playwright 1.57, pytest |
| Monorepo | Turborepo 2.6, pnpm 11 |

## Project Structure

```
inspectai/
├── apps/
│   ├── web/           # Next.js frontend
│   └── ml-service/    # Python ML backend (FastAPI)
├── packages/
│   └── shared/        # Shared types & utilities
├── supabase/          # Migrations, seed data
└── docker-compose.yml # Local dev infrastructure (Postgres, Redis)
```

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 11+
- Docker & Docker Compose
- Supabase CLI
- Python 3.12+ (for ML service development)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-org/inspectai.git
   cd inspectai
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Start development infrastructure**

   ```bash
   docker compose up -d
   ```

4. **Set up environment variables**

   ```bash
   cp apps/web/.env.example apps/web/.env.local
   cp apps/ml-service/.env.example apps/ml-service/.env
   ```

5. **Push database schema**

   ```bash
   pnpm db:push
   ```

6. **Start development servers**

   ```bash
   pnpm dev
   ```

The web app will be available at [http://localhost:3000](http://localhost:3000).

## Development Commands

```bash
# Start all services in development mode
pnpm dev

# Build all packages
pnpm build

# Run linting
pnpm lint

# Format code
pnpm format

# Run tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Database commands (Supabase CLI)
pnpm db:push      # Push migrations to database
pnpm db:reset     # Reset local database
pnpm db:types     # Generate TypeScript types from schema

# Clean all build artifacts
pnpm clean
```

## ML Service (Python)

```bash
cd apps/ml-service

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload
```

## Environment Variables

### Web App (`apps/web/.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="xxx"

ML_SERVICE_URL="http://localhost:8000"
ML_SERVICE_API_KEY=""
```

### ML Service (`apps/ml-service/.env`)

```env
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

HUGGINGFACE_TOKEN="hf_..."

# Optional — omit both to disable rate limiting
UPSTASH_REDIS_REST_URL="https://your-db.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"

API_KEY="change-me-in-production"
DEBUG=false
LOG_LEVEL="INFO"
CORS_ORIGINS="http://localhost:3000,http://localhost:3001"
```

## License

MIT
