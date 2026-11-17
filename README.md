# Infinity Hack '26 — Team Project

> One problem. Three hours. Fill the blanks after the problem statement is announced.

## Problem
_TBD — paste the official problem statement here._

## Our solution (one line)
_TBD_

## Team
Qursam Bibi (leader) · Abdul Hameed · Ali Mumtaz · Muzammil Hussain

## Tech stack
- Frontend: React + Vite
- Backend: Node.js + Express
- AI: Groq API (backup: OpenRouter)
- Database: Supabase (hosted PostgreSQL)
- Deploy: Vercel (frontend), Render (backend)

## Folder structure
```
infinity-hack/
├── frontend/              # React app (Vite)
│   ├── public/            # Logos, images, static files
│   └── src/
│       ├── components/    # Reusable UI (buttons, cards, forms)
│       ├── pages/         # Main screens
│       ├── services/      # Calls to the backend API
│       └── utils/         # Helpers, constants, mock data
├── backend/               # Express server
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Request handling logic
│   │   ├── services/      # AI / LLM calls, data logic
│   │   └── utils/         # Helpers, fallback data
│   ├── .env               # Real keys (never committed)
│   └── .env.example       # Safe template of required keys
├── docs/
│   ├── PRODUCT.md         # Problem, user, core flow, MVP
│   ├── REQUIREMENTS.md    # Software, accounts, feature requirements
│   ├── INSTALLATION.md    # Setup guide
│   ├── ARCHITECTURE.md    # System diagram, API, AI integration
│   ├── DATABASE.md        # Supabase setup, tables, queries
│   ├── DEMO_SCRIPT.md     # Talking points for the live demo
│   ├── MASTER_PROMPT.md   # Prompt to start the build with AI tools
│   ├── TEAM.md            # Roles and 3-hour plan
│   └── CHECKLIST.md       # Hackathon day checklist
├── scripts/
│   └── setup.ps1          # One-command install
├── AGENTS.md              # Standing rules for AI coding tools
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

## Quick start
See [docs/INSTALLATION.md](docs/INSTALLATION.md).
```
.\scripts\setup.ps1
cd backend;  node src/index.js
cd frontend; npm run dev
```
