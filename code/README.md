# Recipes Assessment (Backend)

This repository implements the backend requirements for the Recipes coding assessment:

- Load recipe data from the provided JSON dataset into PostgreSQL
- Convert NaN / invalid numeric values to NULL during ingestion
- REST API endpoints:
  - `GET /api/recipes` (paginated, sorted by rating descending)
  - `GET /api/recipes/search` (filters by calories, title, cuisine, total_time, rating)
- Interactive API docs via Swagger UI

---

## Project Structure

code/
  backend/
    app/            # FastAPI application code
    scripts/        # ingestion script(s)
    data/           # provided JSON dataset
    requirements.txt
    schema.sql
    .env.example

---

## Prerequisites

- Python 3.10+ (recommended: 3.11)
- PostgreSQL 14+
- (Optional) Postman / Insomnia for API testing

---

## 1) Database Setup (PostgreSQL)

### Create the database
Run in psql or any SQL client:

CREATE DATABASE recipes_db;

### Create the schema
From `code/backend` run:

psql -U postgres -d recipes_db -f schema.sql

> If your Postgres username is not `postgres`, replace `-U postgres` with your username.

---

## 2) Backend Setup (Local)

### Step A — Create & activate a virtual environment

From `code/backend`:

Windows (PowerShell)
python -m venv .venv
.venv\Scripts\Activate.ps1

macOS/Linux
python3 -m venv .venv
source .venv/bin/activate

### Step B — Install dependencies

pip install -r requirements.txt

### Step C — Configure environment variables

1. Copy `.env.example` to `.env`
2. Update the password/host if needed

Windows
copy .env.example .env

macOS/Linux
cp .env.example .env

Example `.env`:
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/recipes_db

> IMPORTANT: Do not include `.env` in your final submission zip (it contains real credentials). Submit only `.env.example`.

---

## 3) Ingest the JSON Dataset

Confirm the dataset exists at:

code/backend/data/US_recipes_null.Pdf.json

Run the ingestion script from inside `code/backend`:

python -m scripts.import_recipes

This will load the JSON into PostgreSQL.

---

## 4) Run the API Server

From inside `code/backend`:

uvicorn app.main:app --reload --port 8000

API will be available at:
- Base URL: http://localhost:8000
- Swagger docs: http://localhost:8000/docs

---

## 5) API Endpoints

### A) List Recipes (paginated, rating sorted desc)

GET /api/recipes?page=1&limit=15

Example:
curl "http://localhost:8000/api/recipes?page=1&limit=15"

Response format:
{
  "page": 1,
  "limit": 15,
  "total": 8451,
  "data": [ ... ]
}

### B) Search Recipes (filters)

GET /api/recipes/search?calories=<=400&rating=>=4.5&title=pie

Example:
curl "http://localhost:8000/api/recipes/search?calories=<=400&rating=>=4.5&title=pie"

Supported query params
- title (partial match, case-insensitive)
- cuisine (cuisine filter)
- rating (supports comparisons: >=4.5, <=3, =4)
- total_time (supports comparisons: <=60, >=120)
- calories (supports comparisons: <=400, >=200)

---

## 6) Troubleshooting

Module import errors
- Ensure the venv is activated
- Run commands from inside `code/backend`

Database connection errors
- Confirm Postgres is running
- Confirm the database recipes_db exists
- Confirm DATABASE_URL in .env is correct


## Frontend (UI) — React + TypeScript + Vite + Material UI

### Overview
The frontend consumes the FastAPI backend and implements the required UI features:

- **Recipes table** with columns:
  - **Title** (truncates when column width is smaller than content)
  - **Cuisine**
  - **Rating** displayed as **stars**
  - **Total Time**
  - **Serves**
- **Row click** opens a **right-side drawer** (detail view) showing:
  - Title + Cuisine header
  - Description (key/value)
  - Total Time with expand icon (expanded view shows Cook Time + Prep Time)
  - Nutrition table showing:
    - calories
    - carbohydrateContent
    - cholesterolContent
    - fiberContent
    - proteinContent
    - saturatedFatContent
    - sodiumContent
    - sugarContent
    - fatContent
- **Field-level filters** that call `GET /api/recipes/search`
- **Server-side pagination** with results-per-page selectable **from 15 to 50**
- **Fallback states** for **“No results found”** and **“No data found”**

### Location
Frontend code lives here:
- `code/frontend/`

Key files:
- `code/frontend/src/components/RecipeTable.tsx` (table + filters + pagination)
- `code/frontend/src/components/RecipeDrawer.tsx` (right-side drawer detail view)
- `code/frontend/src/api.ts` (API client wrapper)
- `code/frontend/vite.config.ts` (proxy to backend)

---

## Frontend Setup
```bash
### 1) Install dependencies
From the project root:

cd code/frontend
npm install
2) Proxy configuration (avoids CORS issues)
Vite is configured to proxy API requests to the backend.

Confirm vite.config.ts contains something like:

Proxy /api → http://localhost:8000

Proxy /healthz → http://localhost:8000

3) Start the frontend
bash
Copy code
npm run dev
Open the UI in your browser:

http://127.0.0.1:5173

Backend must be running at the same time:

bash
Copy code
cd code/backend
uvicorn app.main:app --reload --port 8000
How the UI Calls the Backend
Default table load uses:

GET /api/recipes?page=<page>&limit=<limit>

When any filter is filled, the UI switches to:

GET /api/recipes/search?...&page=<page>&limit=<limit>

Supported filter inputs:

title (partial match)

cuisine (partial match)

rating (supports comparisons: >=4.5, <=3, =4)

total_time (supports comparisons: <=60, >=120)

calories (supports comparisons: <=400, >=200)

