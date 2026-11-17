# NovaWorks CRM - AI Meeting to Project CRM

A project management CRM for NovaWorks Technologies. The administrator pastes a meeting transcript, and AI creates the projects and tasks with the right manager, owner, deadline and estimated hours. Each logged-in user sees only the work they are allowed to see.

## Team
- Team name: [team name]
- Four members and responsibilities:
  - Qursam Bibi (leader): integration, testing, README, deployment, demo
  - Abdul Hameed: frontend (login, dashboard, project and task screens)
  - Ali Mumtaz: backend (database, seeding, login, role-based access)
  - Muzammil Hussain: AI (prompt, transcript conversion, validation, all-or-nothing save)
- Repository: https://github.com/QURSAM-70179225/Infinity-Hackathon

## What Works
- Login and logout with the ten supplied demo accounts.
- Optional signup, for company emails only (`@novaworks.example`): a new account is always created as a developer agent with no tasks. The role cannot be chosen, so signup cannot give anyone admin or manager access.
- Admin home: all project cards, totals, and Create from Transcript.
- Transcript automation: AI reads the meeting with the team directory and creates real project and task records. Loading, success and clear error states are shown.
- Validation before saving: managers must be managers, owners must be agents, hours must be positive, dates must be valid, and a task cannot be due after its project. If anything is unresolved, nothing is saved and the admin can correct the draft and save again.
- All-or-nothing save in one database transaction. Re-creating a project with the same name replaces it instead of duplicating it.
- Project detail: client, manager, deadline, and task rows with title, description, assigned agent, deadline and estimated hours.
- Manager view: only the projects they manage. Agent view: My Tasks, and only their own tasks inside related projects.
- Access rules are enforced in the API, not only in the interface. Opening another user's project by ID returns 403.
- Team directory. The administrator can change a member between developer agent and project manager.
- Manual management: the administrator can create a project by hand and assign it to a manager. The administrator and the project's own manager can add tasks and assign or reassign them to developer agents. The same checks apply as for AI-created work.
- Developer workload: each developer's total estimated hours are measured against a 40 hour capacity (green up to 32h, yellow up to 40h, red above 40h). Capacity bars appear in the Team Directory, agents see their own capacity meter, and admins and managers get an overload warning. A manager sees only developers on their projects, as hour totals, with no task details from other managers' projects.
- Overload review before saving: if a transcript would put a developer above 40 hours, nothing is saved. The admin sees an overload alert, can reassign tasks with live capacity recalculation or a one-click suggestion, and then saves. The supplied transcript stays within capacity, so it saves directly.
- Deadline reminders: a bell in the top bar lists the logged-in user's tasks that are due within 7 days or overdue, and every task row shows the time left. Reminders are measured from the meeting date in the challenge scenario (7 Oct 2026, set by `VITE_DEMO_DATE`); remove that setting to use the real current date.
- Installable app: on a deployed HTTPS link, an **Install app** button adds the CRM to a phone's home screen or a laptop, with its own icon, opening full screen. The layout adapts to phone, tablet and laptop widths.
- Demo user switcher in the top bar: it performs a real login as the chosen demo account, so every screen reloads with that user's own permissions from the backend.
- Saved records persist in a hosted PostgreSQL database (Supabase).
- Reset demo data button (admin) removes generated projects and tasks and keeps the users.

Not included, as the challenge says they are not required: forgot password, email verification, user management, cost calculation, progress monitoring. Deleting a single project or task is not built; the administrator can reset all generated work.

## Technology Stack
- Frontend: React 19 with Vite, Tailwind CSS 4, React Router 7
- Backend: Node.js 18+ with Express 5
- Database: PostgreSQL hosted on Supabase, accessed with `@supabase/supabase-js`
- AI: Groq chat completions API. The backend picks an available model automatically (`llama-3.3-70b-versatile` preferred), or uses `GROQ_MODEL` if set. OpenRouter is the backup provider.
- Authentication/session approach: passwords are hashed with scrypt. Login returns a signed token (JWT format, HS256, 8 hours). Every request sends it in the `Authorization` header, and the backend loads the user from the database using the token. The role is never taken from the browser.

## Links
- Live application: [URL or Not deployed]
- Demo video: [recording URL]

## Requirements
- Node.js 18 or newer, with npm
- A Supabase project (free)
- A Groq API key (free). Optional: an OpenRouter key as backup

## Run Locally
1. Clone this repository and enter its directory:
   ```sh
   git clone https://github.com/QURSAM-70179225/Infinity-Hackathon.git
   cd Infinity-Hackathon
   ```
2. Install dependencies:
   ```sh
   cd backend
   npm install
   cd ../frontend
   npm install
   cd ..
   ```
3. Copy the environment templates:
   ```sh
   copy backend\.env.example backend\.env
   copy frontend\.env.example frontend\.env
   ```
   On macOS or Linux use `cp` instead of `copy`.
4. Fill in `backend/.env` with your own values (see Environment Variables).
5. Create the database: create a project at supabase.com, then copy the Project URL and the secret key (`sb_secret_...`) from Settings > API Keys into `backend/.env`.
6. Apply the schema: open the Supabase SQL Editor, paste the contents of `backend/sql/schema.sql`, and click Run.
7. Seed all ten demo users. Re-running does not duplicate users:
   ```sh
   cd backend
   npm run seed
   ```
8. Start the backend and the frontend in two terminals. Both must stay running:
   ```sh
   # terminal 1 - API on http://localhost:5000
   cd backend
   npm run dev

   # terminal 2 - app on http://localhost:5173
   cd frontend
   npm run dev
   ```
   Open http://localhost:5173 in a browser.

## Environment Variables
| Variable | Purpose | Where configured |
| --- | --- | --- |
| `SUPABASE_URL` | Database project URL | backend |
| `SUPABASE_SECRET_KEY` | Database secret key | backend only |
| `GROQ_API_KEY` | AI provider credential | backend only |
| `GROQ_MODEL` | Optional: force a specific AI model | backend |
| `OPENROUTER_API_KEY` | Optional backup AI credential | backend only |
| `OPENROUTER_MODEL` | Optional backup model, default `openrouter/free` | backend |
| `SESSION_SECRET` | Signs login tokens | backend only |
| `CORS_ORIGIN` | Frontend URL allowed to call the API when deployed | backend |
| `DB_MODE` | `supabase` (default) or `local` for a file database | backend |
| `PORT` | API port, default 5000 | backend |
| `VITE_API_URL` | Backend endpoint, default `http://localhost:5000` | frontend |
| `VITE_DEMO_DATE` | Optional date that deadline reminders are measured from | frontend |

`.env.example` files with placeholders are in `backend/` and `frontend/`. Real keys are never committed. No AI or database secret is exposed to the browser.

## Demo Login Accounts
These emails are fictional identifiers, not mailboxes. The login page has one-click buttons that fill in a demo account.

| Role | Name | Demo email | Password |
| --- | --- | --- | --- |
| Admin | Admin | admin@novaworks.example | Demo123! |
| Manager | Ayesha Khan | ayesha@novaworks.example | Demo123! |
| Manager | Bilal Ahmed | bilal@novaworks.example | Demo123! |
| Manager | Hina Malik | hina@novaworks.example | Demo123! |
| Agent | Ali Raza | ali@novaworks.example | Demo123! |
| Agent | Hamza Shah | hamza@novaworks.example | Demo123! |
| Agent | Sara Noor | sara@novaworks.example | Demo123! |
| Agent | Usman Tariq | usman@novaworks.example | Demo123! |
| Agent | Zain Abbas | zain@novaworks.example | Demo123! |
| Agent | Maryam Asif | maryam@novaworks.example | Demo123! |

Run `npm run seed` in `backend/` once before testing. It can be run again at any time.

## How Judges Can Test
1. Log in as admin. Create from Transcript is at the top of the home screen.
2. Click **Use supplied transcript** to load the meeting text, or paste your own. The text is also in `docs/TRANSCRIPT.txt`.
3. Click **Create from Transcript**. Expect three projects and twelve tasks.
4. Open UrbanCart Website: manager Ayesha Khan, deadline 20 Oct 2026, four tasks, 40 hours.
5. Log out and log in as Ayesha: only UrbanCart Website appears.
6. Log in as Ali: My Tasks shows only his three UrbanCart tasks.
7. Log in as Hamza: his two API tasks span UrbanCart and QuickServe.
8. While logged in as Ayesha or Ali, change the number in the address bar (`/projects/<id>`) to another project's ID. The app shows an access message and the API returns 403.
9. Refresh the page. Projects and tasks remain.
10. Log in as admin, paste a modified transcript (for example QuickServe integration at 12 hours due 23 October) and create again. The task reflects the new values.

To reset between tests, log in as admin and click **Reset demo data** on the home screen. It deletes generated projects and tasks and keeps the ten users. Creating again from a transcript also replaces projects that have the same name.

## Deployment Details
- Deployment status: [Live / Local only]
- Frontend host: Vercel, [URL]
- Backend host: Render, [URL]
- Database: Supabase hosted PostgreSQL
- Deployed branch/commit: [branch and commit SHA]

Full step-by-step instructions are in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

### How We Deployed
1. Frontend on Vercel: root directory `frontend`, build command `npm run build`, output directory `dist`. `frontend/vercel.json` sends all routes to `index.html`.
2. Backend on Render (Web Service): root directory `backend`, build command `npm install`, start command `npm start`.
3. Database: the same Supabase project, reached over HTTPS. No extra SSL setup is needed.
4. Environment variables on Render: `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`, `SESSION_SECRET`, `DB_MODE`, `CORS_ORIGIN`. On Vercel: `VITE_API_URL`, `VITE_DEMO_DATE`.
5. Schema and seed: `backend/sql/schema.sql` was run in the Supabase SQL Editor, then `npm run seed` was run locally against the same database.
6. `VITE_API_URL` is the Render URL, and `CORS_ORIGIN` on Render is the Vercel URL.
7. Judges open the live link, log in with any demo account above, and use Create from Transcript as admin.

## Known Limitations
- The free AI tier has rate limits. If the AI is busy, the app shows a clear message and saves nothing; try again after a few seconds.
- The Install app button appears only where the browser supports installing (Chrome or Edge over HTTPS). On iPhone the app is added through Safari's Share menu.
- A free Render service sleeps when idle, so the first request after a pause can take up to a minute.
- A task's owner can be changed in the interface. Other task fields can be changed through the API only.
- AI output can vary slightly in wording of descriptions. Owners, dates and hours are validated before saving.

## Submission Summary
- Source repository: https://github.com/QURSAM-70179225/Infinity-Hackathon
- Live link or local demo video: [URL]
- Setup and seed commands: documented above
- Demo login accounts: listed above
- Features completed: login, role-based access enforced in the API, transcript to projects and tasks with validation, project and task screens, team directory, persistent hosted database, reset
