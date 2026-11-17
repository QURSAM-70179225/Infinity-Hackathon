# Project Rules for AI Coding Tools

Read this before writing any code for this project. These are the team's standing rules.

## Project
Infinity Hack '26 — one problem, 3 hours, a fully working MVP with a live demo.
Team: Qursam Bibi (leader), Abdul Hameed, Ali Mumtaz, Muzammil Hussain.

## Stack (do not change)
- Frontend: React + Vite in `frontend/`
- Backend: Node.js + Express in `backend/`, entry `backend/src/index.js`
- AI: Groq API (`GROQ_API_KEY`), backup OpenRouter (`OPENROUTER_API_KEY`)
- Database: Supabase via `@supabase/supabase-js`, client in `backend/src/utils/supabase.js`, schema in `backend/sql/schema.sql`
- Deploy: Vercel (frontend), Render (backend). Steps in `docs/DEPLOYMENT.md`
- Database switch: `DB_MODE` in `backend/.env` (`supabase` or `local`), handled only in `backend/src/services/db.js`
- Installable app: `frontend/public/manifest.webmanifest`, `frontend/public/sw.js`, `frontend/src/components/InstallButton.jsx`

## 1. Git and GitHub
- Commit messages describe the change only. No AI attribution: no "Co-Authored-By",
  no "Generated with", no mention of any AI tool in commits, PRs, code comments or the README.
- Small commits with clear messages, e.g. `Add result card to dashboard`.
- Never commit `.env`, keys, or `node_modules`.

## 2. Keep everything organised
- Every file goes in its proper folder:
  - `frontend/src/components` reusable UI · `pages` screens · `services` API calls · `utils` helpers
  - `backend/src/routes` routes · `controllers` request logic · `services` AI and database · `utils` helpers
  - `docs/` all documentation
- No loose files in the root, no duplicate or unused files, no dead code.
- One component per file, clear names, short functions, brief comments.
- When a feature is added, update `docs/ARCHITECTURE.md` (API table) and `CHANGELOG.md`.

## 3. Fully functional, not a mockup
- Every button, form and link on screen must really work. No fake data presented as real,
  no "coming soon" buttons, no dead pages. If it is not working, remove it from the UI.
- The core flow must work end to end: input → backend → AI → database → result on screen.
- Handle empty, long and strange inputs. Judges will type their own.
- Loading state for every request, clear error message for every failure, empty state for no data.
- If the AI call fails, fall back to the backup model before showing an error.
- All keys stay in the backend. The frontend only calls our own API.
- The current user always comes from the login token. Never accept a user id or role sent by the browser.
- Developer capacity is 40 hours. The rule lives in `backend/src/services/workload.js` and `frontend/src/utils/capacity.js`; keep them the same.

## 4. UI must stand out
The first screen decides the first impression. Design it to sell the product.
- One clear headline that states what the app does, and one obvious main action.
- A consistent design system: one accent colour, one font family, one spacing scale, one corner radius.
- Strong visual hierarchy: big readable headings, generous spacing, no clutter.
- Show AI results as designed cards, tables or charts, never as a raw text dump.
- Smooth states: skeleton or spinner while loading, subtle transitions, hover and focus styles.
- Responsive: looks right on a laptop and on a phone. No fixed widths that overflow a small screen; wide tables scroll inside their own box.
- Good contrast and readable text sizes.
- Avoid the generic template look: no default Vite page, no unstyled HTML, no lorem ipsum.
- Use real, relevant sample content so the demo looks like a real product.

## 5. Solve the actual problem
- Re-read the problem statement in `docs/PRODUCT.md` before each feature.
- Build only what serves the core flow. A smaller working product beats a larger broken one.
- Every team member must be able to explain the code, so keep it simple.

## How to answer
1. Short plan: routes, AI prompt, files to create.
2. Complete files with full paths.
3. Exact commands to run.
4. Five-line explanation of how it works.
