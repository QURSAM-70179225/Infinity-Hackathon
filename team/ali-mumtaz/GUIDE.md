# Ali Mumtaz - Backend: database, login, access rules

You own the part judges test hardest: each user must get only their own data, even if they call the API directly.

## Your files
| File | What it does |
|---|---|
| `backend/sql/schema.sql` | Creates `users`, `projects`, `tasks`, and the SQL function that saves everything in one transaction |
| `backend/src/utils/demoUsers.js` | The ten supplied demo accounts with their directory codes (PM01, DEV01...) |
| `backend/src/seed.js` | Inserts the ten users with hashed passwords. Upserts by email, so re-running never duplicates |
| `backend/src/utils/password.js` | Hashes and checks passwords with scrypt |
| `backend/src/utils/token.js` | Creates and verifies the signed login token |
| `backend/src/middleware/auth.js` | `requireAuth` finds the user from the token; `requireRole` blocks wrong roles |
| `backend/src/controllers/authController.js` | Login and "who am I" |
| `backend/src/services/db.js` | Every database query in one place |
| `backend/src/services/access.js` | The role rules: who may see which project and task |
| `backend/src/controllers/projectController.js` | Projects list, project detail, my tasks, team directory, reset |
| `backend/src/routes/index.js` | The list of API routes |
| `backend/src/index.js` | Starts the server and handles errors |

## Phase 1 - Foundation (0:00-0:25)
1. Open Supabase > SQL Editor > New query. Paste all of `backend/sql/schema.sql` and click Run. It should say Success.
2. In Table Editor, check that `users`, `projects` and `tasks` exist.
3. In a terminal: `cd backend`, then `npm run seed`. Expected: `Seed complete. Users in database: 10.`
4. Run `npm run seed` a second time. It must still say 10.

## Phase 2 - Login and access (0:25-0:55)
1. Start the API: `npm run dev`. Open http://localhost:5000/api/health and expect `{"ok":true}`.
2. Read `auth.js` and `access.js` until you can explain them line by line.
3. Log in from the frontend as admin, Ayesha and Ali.

## Phase 3 and 4 - Core flow and role views (0:55-1:50)
After Muzammil creates projects from the transcript, check these:
| Logged in as | Must see |
|---|---|
| Admin | 3 projects, 12 tasks |
| Ayesha | Only UrbanCart Website, 4 tasks |
| Bilal | Only QuickServe Mobile App |
| Ali | Only UrbanCart, and only his 3 tasks |
| Hamza | 2 tasks: one in UrbanCart, one in QuickServe |

Direct access test: log in as Ayesha, open a QuickServe project by typing `/projects/<its id>` in the address bar. The page must show the access message. In the browser Network tab the request shows status 403.

## Phase 6 - Ship (2:10-2:30)
Deploy the backend on Render: New > Web Service > your repo. Root directory `backend`, build `npm install`, start `npm start`. Add the environment variables from `backend/.env` in the Environment tab, plus `CORS_ORIGIN` set to the Vercel URL.

## How it works, in your words
- **Passwords:** stored as a scrypt hash with a random salt. The real password is never saved.
- **Login:** the backend checks the password and returns a token signed with `SESSION_SECRET`. The browser cannot change the token without breaking the signature.
- **Every request:** `requireAuth` verifies the token, then loads the user from the database. The role comes from the database, never from what the browser sends.
- **Access rules:** `access.js` filters the data on the server. An admin gets everything, a manager gets projects where `manager_id` is their ID, an agent gets only tasks where `assignee_id` is their ID and the projects those tasks belong to.
- **Project detail:** if the project is not in the user's allowed list, the API answers 403.

## Questions judges may ask
- *Can an agent see another agent's tasks by calling the API?* No. The filter is in `access.js` on the server, so the data never leaves the backend.
- *Where does the role come from?* From the database, looked up with the user ID inside the signed token.
- *What happens if the seed runs twice?* Nothing changes. It upserts by the unique email.
- *Why is the secret key only in the backend?* It has full database access. Row level security is on, so a browser key gets no data.

## Added later (also yours)
| File | What it does |
|---|---|
| `backend/src/services/db.js` | Chooses the database: Supabase, or a local file when `DB_MODE=local` |
| `backend/src/services/supabaseDb.js`, `localDb.js` | The same query functions for each database |
| `backend/src/services/workload.js` | Developer hours against the 40 hour capacity, limited by role |
| `backend/src/controllers/authController.js` (signup) | New accounts: company email only, always a developer agent |
| `backend/src/controllers/projectController.js` | Also: create project, add task, reassign task, change role, workload |

- **Signup:** the role is never read from the request, so nobody can sign up as admin.
- **Role change:** admin only. Refused while the member still has tasks or still manages projects.
- **Tasks:** a manager can add or reassign tasks only inside their own projects; the check is in `access.getProjectFor`.
- **Workload for managers:** they receive hour totals for developers on their projects, never task details from other managers' projects.
- **Deploy:** follow `docs/DEPLOYMENT.md`, section 2.
