# Installation Guide

## 1. Get the code
```
git clone <repo-url>
cd infinity-hack
```

## 2. Backend
```
cd backend
npm install
copy .env.example .env
```
Open `backend/.env` and fill in your own values:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=sb_secret_your_key_here
GROQ_API_KEY=your_groq_key_here
SESSION_SECRET=any_long_random_text
DB_MODE=supabase
PORT=5000
```

## 3. Database
1. In Supabase, open the SQL Editor, paste all of `backend/sql/schema.sql`, and click Run.
2. Seed the ten demo users (safe to run again):
   ```
   npm run seed
   ```
   Expected: `Seed complete (supabase database). Users in database: 10.`

## 4. Start the backend
```
npm run dev
```
Check http://localhost:5000/api/health shows `{"ok":true}`.

## 5. Frontend
Open a second terminal:
```
cd frontend
npm install
copy .env.example .env
npm run dev
```
Open http://localhost:5173 and log in with a demo account. Both terminals must stay open.

## 6. One-command install (Windows PowerShell)
From the `infinity-hack` folder:
```
.\scripts\setup.ps1
```

## Common problems
| Problem | Fix |
|---|---|
| "running scripts is disabled" | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| `node` not recognized | Install Node LTS from nodejs.org, reopen PowerShell |
| Seeding failed: Cannot reach Supabase | Check the internet, try a phone hotspot, or set `DB_MODE=local` |
| Seeding failed: Database error | Run `backend/sql/schema.sql` in the Supabase SQL Editor first |
| Login says "SESSION_SECRET is missing" | Add `SESSION_SECRET=` with any long random text to `backend/.env` |
| "Cannot reach the server" in the app | The backend is not running, or `VITE_API_URL` is wrong |
| AI message "could not process the transcript" | Free AI tier is busy or the key is wrong; wait and try again |
| Changes to `.env` have no effect | Restart that server; `.env` is read only at start |
