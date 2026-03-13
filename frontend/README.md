# Frontend — React SPA

Vite + React 19 + TypeScript single-page application for the Sports Tournament and Auction System.

## Tech Stack

- **Vite** — build tool and dev server
- **React 19** + **TypeScript**
- **Tailwind CSS v4** — utility-first styling
- **Apollo Client 3** — GraphQL client with 30s polling for near-real-time
- **React Router** — client-side routing
- **Radix UI** — accessible component primitives

## Setup

```bash
npm install
npm run dev
```

Runs at **http://localhost:5173**. Proxies `/graphql` to the Django backend at `localhost:8000`.

## Project Structure

```
src/
├── components/         # Shared UI components
├── graphql/            # GraphQL query and mutation definitions
├── lib/                # Apollo client, SeasonContext
├── pages/              # Route-level page components
├── index.css           # Global styles (Tailwind import)
├── App.tsx             # Router and layout
└── main.tsx            # Entry point (Apollo + Season providers)
```

## Component Architecture

```
main.tsx
└── ApolloProvider
    └── SeasonProvider          ← fetches seasons, provides context
        └── App.tsx
            ├── Navbar          ← navigation + SeasonSelector
            └── Routes
                ├── Home
                ├── Auction
                ├── Leaderboard
                ├── Teams
                ├── TeamDetail
                └── Register
```

## Components (`src/components/`)

| Component | Description |
|-----------|-------------|
| `Navbar.tsx` | Top navigation bar with links to all pages. Highlights the active route. Includes the SeasonSelector on the right. |
| `SeasonSelector.tsx` | Dropdown to switch between seasons (years). Reads from and writes to `SeasonContext`. All pages react to the selected season. |
| `NoticeCard.tsx` | Displays a single notice with title, content, and formatted date. Used on the Home page. |
| `PlayerCard.tsx` | Shows a player's photo (or initial), name, sport ratings as pills, and sold status with team name and price. Green border when sold. |
| `TeamCard.tsx` | Clickable card linking to team detail. Shows team name, captain, logo, remaining budget, and player count. |
| `LeaderboardTable.tsx` | Ranked table of teams by total points. Rows are clickable to expand and show sport-wise point breakdown (sport name, place, points). |
| `AuctionFilters.tsx` | Horizontal filter bar with: text search (debounced), sport dropdown, min rating slider (1-10), sold/unsold toggle, and sort dropdown (name/rating/price). Filter state passed as GraphQL query variables. |
| `Button.tsx` | Generic button component built on Radix UI Slot. Supports `primary`, `secondary`, `outline` variants and `sm`, `md`, `lg` sizes. |

## Pages (`src/pages/`)

| Page | Route | Description | Polling |
|------|-------|-------------|---------|
| `Home.tsx` | `/` | Season overview with stat cards (teams, budget, min bid), action buttons (register, live auction), and notice list. | No |
| `Auction.tsx` | `/auction` | Player grid with AuctionFilters. Shows "Auction is LIVE" banner when active. Unsold players highlighted. | 30s |
| `Leaderboard.tsx` | `/leaderboard` | LeaderboardTable with expandable sport-wise breakdown. | 30s |
| `Teams.tsx` | `/teams` | Grid of TeamCards for the selected season. | 30s |
| `TeamDetail.tsx` | `/teams/:id` | Full team view: stats (budget, players, spent), player list, and match results table. | 30s |
| `Register.tsx` | `/register` | Player registration form with name, email, and sport rating sliders. Gated by `AuctionConfig.registrationOpen`. Shows success/closed state. | No |

## GraphQL Definitions (`src/graphql/`)

### Queries (`queries.ts`)

| Query | Variables | Description |
|-------|-----------|-------------|
| `GET_NOTICES` | `seasonId` | Active notices for a season |
| `GET_AUCTION_CONFIG` | `seasonId` | Registration/auction status, budget, min bid |
| `GET_SPORTS` | `seasonId` | Sports with place-points config |
| `GET_TEAMS` | `seasonId` | Teams with computed remaining budget and player count |
| `GET_TEAM` | `id`, `seasonId` | Single team with players and auction config |
| `GET_PLAYERS` | `seasonId`, `sportId?`, `minRating?`, `unsoldOnly?`, `search?`, `sortBy?` | Player list with full filter/search/sort support |
| `GET_LEADERBOARD` | `seasonId` | Teams ranked by total points with sport-wise breakdown |
| `GET_MATCH_RESULTS` | `seasonId`, `sportId?` | Match results with computed points |

### Mutations (`mutations.ts`)

| Mutation | Variables | Description |
|----------|-----------|-------------|
| `REGISTER_PLAYER` | `seasonId`, `name`, `email`, `ratings[]` | Register a player. Returns `ok`, `error`, `player`. Gated by `registrationOpen`. |

## Context (`src/lib/`)

| File | Description |
|------|-------------|
| `SeasonContext.tsx` | React context providing `selectedSeason`, `seasons`, `setSelectedSeasonId`, and `loading`. Fetches all seasons on mount. Auto-selects the current season. |
| `apollo.ts` | Apollo Client instance configured with `/graphql/` endpoint and `cache-and-network` fetch policy. |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Lint with ESLint |
| `npm run format` | Format with Prettier |
| `npm test` | Run tests with Vitest |
