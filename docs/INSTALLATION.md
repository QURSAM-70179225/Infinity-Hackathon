# Installation Guide

## 1. Get the code
```
git clone <repo-url>
cd infinity-hack
```
(Or copy the `infinity-hack` folder.)

## 2. Backend
```
cd backend
npm install
copy .env.example .env
```
Open `backend/.env` and paste the real key:
```
GROQ_API_KEY=your_groq_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=sb_secret_your_key_here
PORT=5000
```
Start it (after `src/index.js` exists):
```
node src/index.js
```

## 3. Frontend
Open a second terminal:
```
cd frontend
npm install
npm run dev
```
Open http://localhost:5173

## 4. One-command install (Windows PowerShell)
From the `infinity-hack` folder:
```
.\scripts\setup.ps1
```

## Common problems
| Problem | Fix |
|---|---|
| "running scripts is disabled" | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| `node` not recognized | Install Node LTS from nodejs.org, reopen PowerShell |
| Port already in use | Close the other terminal, or change `PORT` in `.env` |
| AI call returns 401 | Key is wrong or missing in `backend/.env` |
| AI call returns 429 | Free model rate limit — switch to the backup model |
