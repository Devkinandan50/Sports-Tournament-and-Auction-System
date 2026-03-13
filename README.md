# Sports Tournament and Auction System

A year-wise sports tournament management and player auction platform. Built with **React + TypeScript** on the frontend and **Django + Graphene (GraphQL)** on the backend, backed by **PostgreSQL**.

## Features

- **Year/Season-based** — all data tied to a season; old data preserved, site reusable every year
- **Player Registration** — public form with sport self-ratings (gated by admin)
- **Live Auction View** — player grid with filters, search, and 30s auto-refresh
- **Flexible Points** — any number of placements per sport (1st, 2nd, 3rd... Nth)
- **Auto-calculated Budgets** — admin records sales, team budget updates automatically
- **Leaderboard** — ranked by total points with sport-wise breakdown
- **Admin via Django Admin** — all management through `/admin/`

## Prerequisites

- **Node.js** >= 18
- **Python** >= 3.12
- **Docker** & **Docker Compose** (for PostgreSQL)

## Quick Start

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Backend Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements/development.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Django runs at **http://localhost:8000**. Admin panel at **http://localhost:8000/admin/**.

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Vite runs at **http://localhost:5173**, proxying `/graphql` to Django.

## Admin Workflow

1. Create a **Season** (e.g. 2026) and mark it as current
2. Add **Sports** with place-points (1st: 100pts, 2nd: 50pts, etc.)
3. Create **Teams** with captain names
4. Set **Auction Config** — initial budget, min bid price
5. Toggle **registration_open** to let players register
6. Post **Notices** for deadlines and schedules
7. On auction day: toggle **auction_active**, update players with team + sold_price
8. Record **Match Results** — leaderboard updates automatically

## Project Structure

```
temp_web_project/
├── frontend/                     # React + TypeScript SPA
│   └── src/
│       ├── components/           # Navbar, PlayerCard, TeamCard, LeaderboardTable, AuctionFilters
│       ├── graphql/              # GraphQL queries and mutations
│       ├── lib/                  # Apollo client, SeasonContext
│       └── pages/                # Home, Auction, Leaderboard, Teams, TeamDetail, Register
├── backend/                      # Django + Graphene
│   ├── apps/
│   │   ├── core/                 # Season, Notice, AuctionConfig
│   │   ├── teams/                # Sport, SportPlacePoints, Team, Player, PlayerSportRating
│   │   └── tournament/           # MatchResult
│   └── config/                   # Settings, URLs, root GraphQL schema
├── docker-compose.yml            # PostgreSQL 16
└── README.md
```

## Tech Stack

- **Frontend**: Vite, React 19, TypeScript, Tailwind CSS v4, Apollo Client, React Router
- **Backend**: Django 5, Graphene-Django, PostgreSQL
- **Dev Tools**: Vitest, ESLint, Prettier, Black, Flake8
