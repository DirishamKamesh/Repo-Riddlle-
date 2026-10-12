# RepoRiddle Backend

RepoRiddle's Node.js & TypeScript backend delivers real repository ingestion, verified AST import analysis, grounded engineering missions, and session persistence.

## Architecture & Capabilities

1. **GitHub Ingestion Engine (`src/services/github.ts`)**
   - Strict GitHub repository URL validation (`github.com/:owner/:repo`).
   - Git tree retrieval with automatic skip rules for `node_modules`, `dist`, vendor bundles, binaries, and minified code.
   - Concurrency-controlled file content fetching with in-memory caching keyed by `owner/repo@sha`.

2. **AST & Import Graph Analyzer (`src/services/analyzer.ts`)**
   - Extracts ES6 static imports, named imports, dynamic imports, and CommonJS `require()` calls.
   - Resolves relative targets against the actual repository tree (TypeScript, JavaScript, index resolution).
   - Constructs verified architecture graphs containing only confirmed static imports.

3. **Grounded Mission Engine (`src/services/gemini.ts`)**
   - Uses `@google/genai` (with configurable model default `gemini-2.5-flash`).
   - Generates missions strictly grounded in indexed files with Zod validation.
   - Fallback deterministic mission generator when `GEMINI_API_KEY` is not provided.
   - Evaluates mission submissions with citation attribution.

4. **Persistence & Sessions (`src/services/storage.ts`)**
   - Prisma ORM schema ready for Supabase / PostgreSQL.
   - In-memory persistence fallback when database connection is not configured.

## Configuration (`.env`)

Copy `.env.example` to `.env`:

```bash
PORT=3001
FRONTEND_ORIGIN=http://localhost:5173

# Optional: increases GitHub API rate limits from 60/hr to 5,000/hr
GITHUB_TOKEN=

# Optional: enables AI-powered mission generation and evaluation
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash

# Optional: Supabase / PostgreSQL connection string
DATABASE_URL=
```

## Running the Backend

```bash
# Install dependencies
npm install

# Start development server with live reload
npm run dev

# Run test suite (16 tests covering URL validation, AST, graph, missions, and storage)
npm test

# Run full live integration test against running backend
npx tsx test/test-live-analysis.ts

# Production build
npm run build
npm start
```

## API Endpoints

- `GET /api/health` - Server health and feature status.
- `POST /api/repo/analyze` - Ingest and start analysis of a public GitHub repository.
- `GET /api/analysis/:id/status` - Poll analysis progress.
- `GET /api/analysis/:id` - Get full repository metadata and hierarchical file tree.
- `GET /api/graph/:id` - Get verified architecture graph.
- `GET /api/graph/:id/file?path=...` - Fetch raw source code on demand.
- `GET /api/missions/:analysisId` - List missions for the repository.
- `GET /api/missions/:missionId/detail?analysisId=...` - Get mission clues and hints.
- `POST /api/missions/:missionId/hint` - Request next progressive hint.
- `POST /api/missions/:missionId/submit` - Submit answer and pinned evidence for evaluation.
- `POST /api/sessions` - Create user investigation session.
- `GET /api/sessions/me/dashboard` - Get tracked repositories and mission progress.
