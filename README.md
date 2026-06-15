# TradeVii — Trading & Investment Management Platform

A full-featured trading dashboard built with Next.js 16, React 19, Firebase, and Tailwind CSS. Manage trades, investors, and portfolio analytics in real-time.

**Live:** https://tradevii.web.app

## Features

- **Dashboard** — KPI cards, daily P&L chart, live portfolio, recent trades
- **Trading** — Add/import trades, Excel upload, bulk delete, search & filter, pagination
- **Investors** — Add/edit/delete, interest calculations (9% fixed + 10% profit share), status tracking
- **Analytics** — Win rate, Risk:Reward, day-of-week analysis, strategy & stock performance
- **Reports** — Daily/monthly summaries, investor reports, multi-sheet Excel export
- **Withdrawals & Payouts** — Request and approval workflows
- **Admin Panel** — User management (approve/reject signups), system settings
- **Notifications** — Real-time notification center
- **Theme** — Dark/Light mode toggle

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Static Export) |
| UI | React 19, Tailwind CSS 4 |
| State | Zustand |
| Auth | Firebase Authentication |
| Database | Firebase Realtime Database |
| Charts | Chart.js + react-chartjs-2 |
| Export | SheetJS (xlsx) |
| Hosting | Firebase Hosting (free tier) |

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open http://localhost:3000

## Build & Deploy

```bash
npm run build && firebase deploy --only hosting
```

## Project Structure

```
app/              → Pages (App Router)
  dashboard/      → Dashboard routes (trading, investors, analytics, etc.)
  login/          → Login page
  signup/         → Signup page
components/       → Reusable UI components
  ui/             → Button, Card, Modal, DataTable, Tabs, Badge, etc.
  charts/         → Chart.js visualizations
  layout/         → Header, Sidebar, ProfileDropdown
  auth/           → AuthGuard, LoginForm, SignupForm
hooks/            → Custom hooks (useAuth, useRole, useFirebaseData)
lib/              → Firebase config, database helpers, auth, interest calc
stores/           → Zustand global state
types/            → TypeScript interfaces
styles/           → Global CSS + theme variables
```

## Roles

| Role | Access |
|------|--------|
| Admin | Full CRUD, user management, settings, activity logs |
| Investor | Portfolio view, withdrawal requests |
| Guest | Login page only |

https://tradevii.web.app/
