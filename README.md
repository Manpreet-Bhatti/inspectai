# InspectAI

Multi-modal AI-powered property inspection platform that transforms photos and voice notes into structured inspection reports with AI-identified issues, severity ratings, cost estimates, and historical pattern matching.

## Tech Stack

| Layer | Technology |
| ------- | ------------ |
| Frontend | Next.js 16, React 19, TypeScript 5.9, Tailwind CSS 4, shadcn/ui |
| State Management | TanStack Query 5, Zustand 5 |
| Auth | NextAuth.js v5 |
| ML Backend | Python 3.12+, FastAPI, Celery |
| Database | PostgreSQL 16 with pgvector, Prisma 7 |
| Cache/Queue | Redis 7 |
| Storage | AWS S3 / Cloudflare R2 |
| Testing | Vitest 4, Playwright 1.57, pytest |
| Monorepo | Turborepo 2.6, pnpm 10 |

## Project Structure

```
inspectai/
├── apps/
│   ├── web/           # Next.js frontend
│   └── ml-service/    # Python ML backend (FastAPI)
├── packages/
│   ├── database/      # Prisma schema & client
│   └── shared/        # Shared types & utilities
└── docker-compose.yml # Development infrastructure
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker & Docker Compose
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

# Database commands
pnpm db:push      # Push schema to database
pnpm db:generate  # Generate Prisma client
pnpm db:studio    # Open Prisma Studio
pnpm db:migrate   # Run migrations

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
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/inspectai"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

AWS_ACCESS_KEY_ID="xxx"
AWS_SECRET_ACCESS_KEY="xxx"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="inspectai-uploads"

ML_SERVICE_URL="http://localhost:8000"
REDIS_URL="redis://localhost:6379"
```

### ML Service (`apps/ml-service/.env`)

```env
HUGGINGFACE_TOKEN="hf_xxx"
REDIS_URL="redis://localhost:6379"
MODEL_CACHE_DIR="/app/models"
```

## License

MIT
