# Backend — Django + GraphQL

Django 5 backend with Graphene-Django for GraphQL API. All admin operations via Django's built-in admin panel.

## Tech Stack

- **Django 5** — web framework
- **Graphene-Django** — GraphQL API layer
- **PostgreSQL 16** — database (via Docker)
- **Pillow** — image handling (player photos, team logos)
- **dj-database-url** — database config from URL
- **django-cors-headers** — CORS for frontend dev server

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements/development.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Runs at **http://localhost:8000**. Admin panel at `/admin/`, GraphQL at `/graphql/`.

## Project Structure

```
backend/
├── config/                     # Django project config
│   ├── settings/
│   │   ├── base.py             # Shared settings (DB, apps, middleware)
│   │   ├── development.py      # DEBUG=True, CORS for localhost:5173
│   │   └── production.py       # DEBUG=False, env-based secrets
│   ├── urls.py                 # /admin/ + /graphql/ + media serving
│   ├── schema.py               # Root GraphQL schema (combines all apps)
│   ├── wsgi.py
│   └── asgi.py
├── apps/
│   ├── core/                   # Season, Notice, AuctionConfig
│   ├── teams/                  # Sport, Team, Player, Ratings
│   └── tournament/             # MatchResult
├── requirements/
│   ├── base.txt
│   ├── development.txt
│   └── production.txt
└── manage.py
```

## Django Apps

### `apps/core` — Season, Notice, AuctionConfig

| Model | Fields | Notes |
|-------|--------|-------|
| **Season** | `year` (unique), `name`, `is_current` | Only one `is_current=True` at a time. `save()` auto-unchecks others. |
| **Notice** | `season` (FK), `title`, `content`, `is_active`, `created_at`, `updated_at` | Admin toggles `is_active` to show/hide. |
| **AuctionConfig** | `season` (OneToOne), `registration_open`, `auction_active`, `min_bid_price`, `initial_budget`, `rules` | One config per season. `initial_budget` is the starting budget for every team. |

### `apps/teams` — Sport, Team, Player, Ratings

| Model | Fields | Notes |
|-------|--------|-------|
| **Sport** | `season` (FK), `name`, `display_order` | Points defined separately in SportPlacePoints. |
| **SportPlacePoints** | `sport` (FK), `place`, `points` | Flexible: admin adds as many placements as needed (1st=100, 2nd=50, 3rd=25...). |
| **Team** | `season` (FK), `name`, `captain_name`, `logo` (image) | No budget columns — `remaining_budget` computed as `initial_budget - sum(sold_price)`. |
| **Player** | `season` (FK), `name`, `company_email`, `photo` (image), `team` (FK nullable), `sold_price`, `is_sold` | Admin sets `team` + `sold_price` during auction. |
| **PlayerSportRating** | `player` (FK), `sport` (FK), `rating` (1-10) | `unique_together` on player + sport. |

### `apps/tournament` — MatchResult

| Model | Fields | Notes |
|-------|--------|-------|
| **MatchResult** | `season` (FK), `sport` (FK), `team` (FK), `place`, `created_at` | One row per team per sport. Points looked up from SportPlacePoints — not stored. |

## Computed Values

These are calculated in GraphQL resolvers, not stored in the database:

- **Team remaining budget** = `AuctionConfig.initial_budget - SUM(player.sold_price WHERE team = this_team AND is_sold = True)`
- **Team total points** = `SUM(SportPlacePoints.points for each MatchResult WHERE team = this_team, matched by sport + place)`
- **Leaderboard** = all teams sorted by total points descending

## GraphQL API

### Endpoint

`POST /graphql/` — GraphiQL interface available at `/graphql/` in the browser (GET).

### Root Schema (`config/schema.py`)

Combines queries from all 3 apps and mutations from `apps/teams`.

### Queries

| Query | Arguments | Source | Description |
|-------|-----------|--------|-------------|
| `currentSeason` | — | `apps/core` | Returns the Season with `is_current=True` |
| `seasons` | — | `apps/core` | All seasons (for dropdown) |
| `notices` | `seasonId` (required) | `apps/core` | Active notices for a season |
| `auctionConfig` | `seasonId` (required) | `apps/core` | Registration/auction status, budget, min bid |
| `sports` | `seasonId` (required) | `apps/teams` | Sports with nested `placePoints` |
| `teams` | `seasonId` (required) | `apps/teams` | Teams with computed `remainingBudget` and `playerCount` |
| `team` | `id` (required) | `apps/teams` | Single team with nested `players` (each with `ratings`) |
| `players` | `seasonId` (required), `sportId?`, `minRating?`, `unsoldOnly?`, `search?`, `sortBy?` | `apps/teams` | Player list with full filter/search/sort |
| `matchResults` | `seasonId` (required), `sportId?` | `apps/tournament` | Match results with computed `points` |
| `leaderboard` | `seasonId` (required) | `apps/tournament` | Teams ranked by total points, with `sportPoints` breakdown |

### Player Filters (`players` query)

| Argument | Type | Behavior |
|----------|------|----------|
| `seasonId` | ID (required) | Filter by season |
| `sportId` | ID | Players with a rating in this sport |
| `minRating` | Int | Requires `sportId` — players with `rating >= minRating` |
| `unsoldOnly` | Boolean | `True` = unsold only, `False` = sold only, omit = all |
| `search` | String | Case-insensitive name search (`icontains`) |
| `sortBy` | `"name"` / `"rating"` / `"price"` | `rating` requires `sportId`. `price` sorts nulls last. |

### Mutations

| Mutation | Arguments | Source | Description |
|----------|-----------|--------|-------------|
| `registerPlayer` | `seasonId`, `name`, `email`, `ratings: [{sportId, rating}]` | `apps/teams` | Creates a Player + PlayerSportRating rows. Returns `{ok, error, player}`. Gated by `AuctionConfig.registration_open`. |

### GraphQL Types

| Type | Fields | Source Model |
|------|--------|-------------|
| `SeasonType` | `id`, `year`, `name`, `isCurrent` | Season |
| `NoticeType` | `id`, `title`, `content`, `isActive`, `createdAt`, `updatedAt` | Notice |
| `AuctionConfigType` | `id`, `registrationOpen`, `auctionActive`, `minBidPrice`, `initialBudget`, `rules` | AuctionConfig |
| `SportType` | `id`, `name`, `displayOrder`, `placePoints[]` | Sport |
| `SportPlacePointsType` | `id`, `place`, `points` | SportPlacePoints |
| `TeamType` | `id`, `name`, `captainName`, `logo`, `season`, `remainingBudget` (computed), `playerCount` (computed), `players[]` | Team |
| `PlayerType` | `id`, `name`, `companyEmail`, `photo`, `team`, `soldPrice`, `isSold`, `ratings[]` | Player |
| `PlayerSportRatingType` | `id`, `sport`, `rating`, `sportName` (computed) | PlayerSportRating |
| `MatchResultType` | `id`, `sport`, `team`, `place`, `createdAt`, `points` (computed), `teamName`, `sportName` | MatchResult |
| `LeaderboardEntryType` | `teamId`, `teamName`, `captainName`, `logo`, `totalPoints`, `sportPoints[]` | Computed |
| `SportPointsType` | `sportId`, `sportName`, `place`, `points` | Computed |

## Django Admin

All data management at `/admin/`:

| Admin | Features |
|-------|----------|
| **Season** | `is_current` editable in list view. AuctionConfig as inline. |
| **Notice** | Filter by season and active status. `is_active` editable in list. |
| **AuctionConfig** | Shows registration/auction toggles and budget. |
| **Sport** | SportPlacePoints as tabular inline. Filter by season. |
| **Team** | Players as tabular inline. Filter by season. Search by name/captain. |
| **Player** | `team`, `is_sold`, `sold_price` editable in list view. PlayerSportRating as inline. Filter by season/sold/team. |
| **MatchResult** | Filter by season and sport. Search by team name. |

## Scripts

| Command | Description |
|---------|-------------|
| `python manage.py runserver` | Start dev server |
| `python manage.py migrate` | Apply migrations |
| `python manage.py makemigrations` | Generate migrations |
| `python manage.py createsuperuser` | Create admin user |
| `python manage.py test` | Run tests |
