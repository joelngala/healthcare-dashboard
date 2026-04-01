# HealthDash — Patient Management Dashboard

A full-stack healthcare dashboard for managing patients, clinical notes, and patient summaries. Built with React + TypeScript on the frontend and FastAPI + PostgreSQL on the backend.

## Quick Start

```bash
docker compose up --build
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

The database is seeded with 20 patients and 32 clinical notes on first startup.

## Tech Stack

### Frontend
- **Vite** + **React 19** + **TypeScript**
- **Tailwind CSS v4** — utility-first styling
- **React Router v6** — client-side routing
- **TanStack Query** — server state management with caching and invalidation
- **React Hook Form** + **Zod** — form handling with schema-based validation
- **Recharts** — data visualization (dashboard chart)
- **Lucide React** — icon library

### Backend
- **FastAPI** — async Python API framework
- **SQLAlchemy 2.0** — ORM with mapped column types
- **Pydantic v2** — request/response validation
- **PostgreSQL 16** — relational database
- **Alembic** — database migrations

### Infrastructure
- **Docker Compose** — multi-container orchestration
- Hot-reload enabled for both frontend and backend via volume mounts

## Project Structure

```
├── frontend/
│   └── src/
│       ├── api/          # API client and endpoint functions
│       ├── app/          # Router, providers
│       ├── components/   # Layout and UI components
│       ├── hooks/        # Custom hooks (useDebounce, useToast)
│       ├── lib/          # Utils, constants
│       ├── pages/        # Route-level page components
│       └── types/        # TypeScript interfaces
├── backend/
│   ├── app/
│   │   ├── api/routes/   # FastAPI route handlers
│   │   ├── core/         # Config, database setup
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Business logic
│   │   └── seed/         # Seed data
│   └── alembic/          # Database migrations
└── docker-compose.yml
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/patients` | List patients (paginated, filterable, sortable) |
| GET | `/patients/{id}` | Get patient by ID |
| POST | `/patients` | Create patient |
| PUT | `/patients/{id}` | Update patient |
| DELETE | `/patients/{id}` | Delete patient |
| GET | `/patients/{id}/notes` | List patient notes |
| POST | `/patients/{id}/notes` | Add a note |
| DELETE | `/patients/{id}/notes/{note_id}` | Delete a note |
| GET | `/patients/{id}/summary` | Generate patient summary |
| GET | `/dashboard/stats` | Dashboard KPIs and stats |

### Query Parameters for `GET /patients`

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `page_size` | int | 10 | Items per page (max 100) |
| `search` | string | — | Search by patient name |
| `status` | string | — | Filter by status (Active, Inactive, Follow-up) |
| `sort_by` | string | last_visit | Sort field |
| `sort_order` | string | desc | Sort direction (asc/desc) |

## Features

- **Dashboard** — KPI cards, status breakdown chart, recent patients
- **Patient List** — searchable, filterable, sortable table with pagination
- **Patient Detail** — tabbed view with overview, clinical notes, and AI-generated summary
- **Patient Form** — create/edit with client-side (Zod) and server-side (Pydantic) validation
- **Notes** — add and delete clinical notes with timestamps
- **Summary** — template-based patient summary from profile and notes
- **Toast Notifications** — success/error feedback on all mutations
- **Responsive Layout** — collapsible sidebar for mobile screens
- **Error Handling** — loading, empty, and error states throughout

## Architecture Decisions

- **TanStack Query over Redux/Zustand**: All state in this app is server state. TanStack Query handles caching, invalidation, and loading/error states out of the box — no boilerplate reducers needed.
- **Zod + React Hook Form**: Schema-based validation shared conceptually with Pydantic on the backend. Forms are uncontrolled for performance.
- **Template-based summary over LLM**: Deterministic, fast, and doesn't require API keys. The endpoint is structured so an LLM could be swapped in later.
- **SQLAlchemy `create_all` + Alembic**: Tables are created on startup for zero-config dev experience. Alembic is configured for production migration workflows.
- **No component library (shadcn-style)**: Hand-rolled Card, Badge, Spinner, Toast components using Tailwind — keeps the bundle small and the design cohesive.

## Environment Variables

See `.env.example`. Defaults work out of the box with Docker Compose.

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://postgres:postgres@db:5432/healthcare` | PostgreSQL connection string |
| `POSTGRES_USER` | `postgres` | Database user |
| `POSTGRES_PASSWORD` | `postgres` | Database password |
| `POSTGRES_DB` | `healthcare` | Database name |

## Development

### Without Docker

**Backend:**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# Set DATABASE_URL to point to a running Postgres instance
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Running Migrations

```bash
docker compose exec backend alembic upgrade head
docker compose exec backend alembic revision --autogenerate -m "description"
```
