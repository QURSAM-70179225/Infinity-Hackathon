# Deployment Guide

Frontend on Vercel, backend on Render, database on Supabase. Do the steps in this order.

## Before you start
- The app works locally with `DB_MODE=supabase`.
- The tables exist and the ten users are seeded in Supabase.
- The code is on GitHub, and `.env` files are not in the repository.

## 0. Update the database
Whenever `backend/sql/schema.sql` has changed (for example the Kanban board added `status` and `completed_at` to tasks), run the whole file again in the Supabase SQL Editor before deploying. It is safe to run again and keeps existing data.

## 1. Push to GitHub
```
git add .
git commit -m "NovaWorks CRM: meeting to projects and tasks"
git branch -M main
git remote add origin https://github.com/QURSAM-70179225/Infinity-Hackathon.git
git push -u origin main
```
If `git remote add` says the remote already exists, skip that line.
Open the repository on GitHub and check that `backend/.env` and `frontend/.env` are not listed.

## 2. Backend on Render
1. render.com > New > Web Service > connect the GitHub repository.
2. Settings:
   | Setting | Value |
   |---|---|
   | Root Directory | `backend` |
   | Runtime | Node |
   | Build Command | `npm install` |
   | Start Command | `npm start` |
   | Instance Type | Free |
3. Environment variables (copy the values from `backend/.env`):
   `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`, `SESSION_SECRET`, and `DB_MODE` = `supabase`.
   Do not add `PORT`; Render sets it.
4. Click Create Web Service and wait for "Live".
5. Open `https://<your-service>.onrender.com/api/health`. It must show `{"ok":true}`.

## 3. Frontend on Vercel
1. vercel.com > Add New > Project > import the same repository.
2. Settings:
   | Setting | Value |
   |---|---|
   | Root Directory | `frontend` |
   | Framework Preset | Vite |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |
3. Environment variables:
   | Name | Value |
   |---|---|
   | `VITE_API_URL` | `https://<your-service>.onrender.com` (no slash at the end) |
   | `VITE_DEMO_DATE` | `2026-10-07` |
4. Click Deploy and copy the Vercel URL.

## 4. Connect the two
1. In Render > Environment, add `CORS_ORIGIN` = your Vercel URL (no slash at the end).
2. Save. Render restarts the backend.

## 5. Test the live link
1. Open the Vercel URL and log in as Admin.
2. Create from the supplied transcript: 3 projects and 12 tasks.
3. Switch to Ayesha and Ali and check their views.
4. Refresh: the data remains.

## 6. Install on a phone
1. Open the Vercel URL in Chrome on Android.
2. Tap **Install app** in the top bar, or the browser menu > Install app.
3. The app appears on the home screen with its icon and opens full screen.
4. On iPhone: Safari > Share > Add to Home Screen.

## 7. Finish the README
Fill the live link, the Render URL, the repository URL and the deployed commit in `README.md`, then commit and push again.

## Common problems
| Problem | Fix |
|---|---|
| First request takes up to a minute | The free Render service was asleep. Open the health link before the demo |
| "Cannot reach the server" on the live site | `VITE_API_URL` is wrong, or was added after the build. Fix it and redeploy on Vercel |
| Login fails only on the live site | `SESSION_SECRET` or the Supabase variables are missing on Render |
| Browser console shows a CORS error | `CORS_ORIGIN` on Render does not exactly match the Vercel URL |
| Page not found after refreshing a project page | `frontend/vercel.json` must be in the repository |
| No Install button on the phone | Use Chrome over HTTPS. If it was installed before, it will not offer again |
