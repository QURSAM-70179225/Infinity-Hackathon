# Database

## Choice
Supabase (hosted PostgreSQL). The app is deployed on Render and Vercel, where local files are not kept, so the data lives in a hosted database. Only the backend talks to it.

## Setup
1. Create a project at supabase.com.
2. Copy the Project URL and the secret key (`sb_secret_...`) from Settings > API Keys.
3. Add them to `backend/.env`:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SECRET_KEY=sb_secret_your_key_here
   DB_MODE=supabase
   ```
4. Open the Supabase SQL Editor, paste all of `backend/sql/schema.sql`, and click Run.
5. Seed the ten demo users:
   ```
   cd backend
   npm run seed
   ```

## Tables
| Table | Columns | Purpose |
|---|---|---|
| `users` | id, ref, name, email, password_hash, role, specialization, skills | The team. `ref` is the directory code (PM01, DEV01). `role` is ADMIN, MANAGER or AGENT |
| `projects` | id, name, client_name, description, manager_id, deadline | One row per client project. `manager_id` points to a user |
| `tasks` | id, project_id, title, description, assignee_id, deadline, estimated_hours, status, completed_at | One row per task. Deleted with its project. `status` is `todo`, `in_progress` or `done`; `completed_at` is set when it reaches done |

## The save function
`create_projects_from_draft(draft, replace_existing)` in `schema.sql` inserts every project and task of a transcript in one transaction. If one insert fails, all are rolled back. A project with the same name is replaced, so running a transcript twice does not duplicate it.

## Security
- Row level security is on for all three tables, with no public policies. A browser key gets no data.
- The backend uses the secret key, which stays in `backend/.env` and in the Render environment settings.
- Passwords are stored as scrypt hashes.

## Local mode
If Supabase cannot be reached (for example on a restricted network), set `DB_MODE=local` in `backend/.env` and run `npm run seed` again. Data is then stored in `backend/data/db.json`. All features work the same. A deployed app must use `DB_MODE=supabase`.

## To explain to judges
- Supabase is hosted PostgreSQL, so data survives restarts and redeploys.
- Only the backend holds the secret key; the browser never sees it.
- One file, `backend/src/services/db.js`, chooses the database. The rest of the code is the same for both.
