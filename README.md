# HealthDash

A patient management dashboard built for a medical practice. Doctors and staff can manage patients, write clinical notes, and view auto-generated patient summaries — all from a single responsive interface.

The frontend is React + TypeScript served by Vite, the backend is FastAPI with PostgreSQL, and the whole thing runs with one command via Docker Compose.

## Getting Started

Make sure you have Docker installed, then:

```bash
git clone https://github.com/joelngala/healthcare-dashboard.git
cd healthcare-dashboard
docker compose up --build
```

That's it. Three containers come up:

- **Frontend** — http://localhost:5173
- **API** — http://localhost:8000
- **Swagger Docs** — http://localhost:8000/docs

On first boot, the database is seeded with 20 realistic patients and 32 clinical notes so you have data to work with right away.

## What It Does

**Dashboard** — Landing page with four KPI cards (total patients, active, needs follow-up, seen this month), a status breakdown chart, and a quick-access table of the five most recently seen patients.

**Patient List** — A sortable, searchable, paginated table. You can filter by status, search by name (debounced so it doesn't fire on every keystroke), and click column headers to sort. Clicking a row opens the patient's detail view.

**Patient Detail** — Three tabs:
- *Overview* shows contact info and medical details at a glance
- *Notes* lets you add or delete clinical notes — each one is timestamped
- *Summary* generates a human-readable narrative from the patient's profile and notes

**Patient Form** — Shared between create and edit. Two sections (personal info and medical info), validated on both the client (Zod) and the server (Pydantic). Required fields are marked, and inline errors show up if you miss something.

**Responsive** — On smaller screens, the sidebar collapses behind a hamburger menu.

## Tech Choices and Why

I went with **TanStack Query** instead of Redux or Zustand because every piece of state in this app comes from the server. TanStack Query gives me caching, background refetching, and automatic loading/error states without writing reducers or actions. When a mutation succeeds (create, update, delete), I just invalidate the relevant query keys and everything stays in sync.

For forms, I paired **React Hook Form** with **Zod**. React Hook Form uses uncontrolled inputs by default, which avoids unnecessary re-renders on large forms. Zod gives me a single schema that defines both the shape and the validation rules — conceptually similar to how Pydantic works on the backend.

I built the UI components by hand (Card, Badge, Spinner, Toast) rather than pulling in a full component library. For a project this size, it keeps the bundle lean and gives me full control over the design. Everything is styled with **Tailwind CSS v4**.

The patient summary endpoint uses a **template-based approach** rather than calling an LLM. It's deterministic, fast, and doesn't need API keys. The endpoint contract is the same either way, so swapping in an LLM later would be a backend-only change.

On the backend, **SQLAlchemy 2.0** with mapped column types keeps the models type-safe and readable. Tables are created on startup with `create_all` for a zero-friction dev experience, but **Alembic** is also set up for when you need proper migration management.

All routes are **lazy-loaded** with `React.lazy` and `Suspense`, so each page is its own chunk and the initial bundle stays small. The backend includes a **request logging middleware** that logs every request with method, path, status code, and response time.

## Project Structure

```
frontend/src/
  api/            API client + endpoint functions
  app/            Router config, query client provider
  components/     Layout shell, reusable UI primitives
  hooks/          useDebounce, useToast
  lib/            Utility functions, constants
  pages/          One file per route
  types/          Shared TypeScript interfaces

backend/app/
  api/routes/     One file per resource (patients, notes, etc.)
  core/           Database connection, app config
  models/         SQLAlchemy table definitions
  schemas/        Pydantic request/response models
  services/       Business logic (queries, summary generation)
  seed/           Sample data loaded on first startup

alembic/          Migration config and version files
```

## API

| Method | Endpoint | What it does |
|--------|----------|--------------|
| GET | `/health` | Returns `{"status": "ok"}` |
| GET | `/patients` | Paginated list with search, filter, sort |
| GET | `/patients/{id}` | Single patient |
| POST | `/patients` | Create a patient |
| PUT | `/patients/{id}` | Update a patient |
| DELETE | `/patients/{id}` | Delete a patient |
| GET | `/patients/{id}/notes` | All notes for a patient |
| POST | `/patients/{id}/notes` | Add a note |
| DELETE | `/patients/{id}/notes/{note_id}` | Delete a note |
| GET | `/patients/{id}/summary` | Generated patient summary |
| GET | `/dashboard/stats` | KPIs + status breakdown + recent patients |

The `GET /patients` endpoint supports these query params:

| Param | Default | Example |
|-------|---------|---------|
| `page` | 1 | `?page=2` |
| `page_size` | 10 | `?page_size=25` (max 100) |
| `search` | — | `?search=chen` (searches first/last name) |
| `status` | — | `?status=Active` |
| `sort_by` | `last_visit` | `?sort_by=last_name` |
| `sort_order` | `desc` | `?sort_order=asc` |

All list responses include pagination metadata:

```json
{
  "items": [...],
  "page": 1,
  "page_size": 10,
  "total": 20,
  "total_pages": 2
}
```

## Running Without Docker

If you'd rather run things directly:

**Backend** — needs Python 3.12+ and a running Postgres instance:
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/healthcare
uvicorn app.main:app --reload
```

**Frontend** — needs Node 20+:
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

Everything works out of the box with Docker Compose. See `.env.example` if you need to customize:

| Variable | Default |
|----------|---------|
| `DATABASE_URL` | `postgresql://postgres:postgres@db:5432/healthcare` |
| `POSTGRES_USER` | `postgres` |
| `POSTGRES_PASSWORD` | `postgres` |
| `POSTGRES_DB` | `healthcare` |

## Migrations

```bash
# Apply all migrations
docker compose exec backend alembic upgrade head

# Generate a new migration after model changes
docker compose exec backend alembic revision --autogenerate -m "add xyz column"
```
