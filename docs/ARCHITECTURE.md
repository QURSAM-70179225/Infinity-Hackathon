# Architecture

## Overview
```
Browser or installed app (React + Vite + Tailwind)
        |  HTTPS, JSON, Authorization: Bearer <token>
        v
Express API (Node.js)  --->  Groq API (LLM), backup OpenRouter
        |
        v
Supabase (hosted PostgreSQL): users, projects, tasks
(or a local JSON file when DB_MODE=local)
```

## Folders
| Folder | Purpose |
|---|---|
| `frontend/public` | App icons, web app manifest, service worker |
| `frontend/src/pages` | Login, Signup, Dashboard, ProjectDetail, MyTasks, Team |
| `frontend/src/components` | Layout, ProjectCard, TaskTable, TranscriptPanel, OverloadReview, CapacityBar, WorkloadAlert, Reminders, AddTaskForm, NewProjectForm, InstallButton, shared states |
| `frontend/src/services` | `api.js`: every call to the backend |
| `frontend/src/utils` | Login state, formatting, capacity rules, deadline maths, demo accounts, supplied transcript |
| `backend/src/routes` | The list of API routes |
| `backend/src/middleware` | `requireAuth`, `requireRole` |
| `backend/src/controllers` | Request handling for auth, projects and team, transcript, Kanban board |
| `backend/tests` | Automated tests, run with `npm test` |
| `backend/src/services` | `db.js` (chooses the database), `supabaseDb.js`, `localDb.js`, `access.js` role rules, `workload.js` capacity, `ai.js` LLM call |
| `backend/src/utils` | Password hashing, tokens, draft validation, demo users |
| `backend/sql` | Database schema and the transactional save function |

## API endpoints
| Method | Route | Who | Purpose |
|---|---|---|---|
| GET | `/api/health` | anyone | Server check |
| POST | `/api/auth/login` | anyone | Email and password to token |
| POST | `/api/auth/signup` | anyone with a company email | New account, always a developer agent |
| GET | `/api/auth/me` | logged in | Current user |
| GET | `/api/team` | logged in | Team directory |
| GET | `/api/projects` | logged in | Projects this user may see |
| GET | `/api/projects/:id` | logged in | One project, 403 if not allowed |
| GET | `/api/tasks/mine` | logged in | Tasks this user may see |
| GET | `/api/workload` | logged in | Developer hours against capacity, limited by role |
| GET | `/api/projects/:id/board` | logged in | Kanban board of one project; 404 if not allowed |
| GET | `/api/board/my-tasks` | logged in | Kanban board of the user's own tasks |
| PATCH | `/api/tasks/:id/status` | admin, project's manager, the assignee | Change a task's status only |
| POST | `/api/projects/:id/tasks` | admin, project's manager | Add a task and assign an agent |
| PATCH | `/api/tasks/:id` | admin, project's manager | Edit or reassign a task |
| POST | `/api/projects` | admin | Create a project by hand and assign a manager |
| PATCH | `/api/team/:id/role` | admin | Make a member a manager or an agent |
| POST | `/api/transcript` | admin | Transcript to saved projects and tasks |
| POST | `/api/transcript/save` | admin | Save a reviewed or corrected draft after validation |
| DELETE | `/api/projects` | admin | Reset generated projects and tasks |

## Access rules (`backend/src/services/access.js`, `workload.js`)
| Role | Projects | Tasks | Workload |
|---|---|---|---|
| ADMIN | All | All | Every developer |
| MANAGER | Where they are the manager | All tasks in those projects | Developers on their projects, as hour totals only |
| AGENT | Those containing their tasks | Only their own | Only their own |

The current user always comes from the signed login token and a database lookup. A role or user id sent by the browser is never trusted. The demo user switcher performs a real login for the same reason.

## AI integration
- Provider: Groq chat completions, temperature 0, JSON mode. Backup: OpenRouter.
- Input: the transcript and the team directory (code, name, role, specialization, skills). No emails or passwords.
- Output: `{ projects: [{ name, clientName, description, managerId, deadline, tasks: [...] }] }`
- Step 1, validation: real manager, real agent, positive hours, real dates, task not after project deadline. On failure: 422, nothing saved.
- Step 2, workload: existing hours plus the draft's hours per developer. Above 40 hours: 409 with the draft for review, nothing saved.
- Step 3, save: one SQL function inserts everything in a single transaction.

## Workload rules
- Capacity is 40 hours per developer.
- Green up to 32h, yellow above 32h up to 40h, red above 40h.
- The same rule is in `backend/src/services/workload.js` and `frontend/src/utils/capacity.js`.

## Installable app
- `manifest.webmanifest` gives the app its name, colours and icons.
- `sw.js` keeps a copy of the app shell. API requests are never cached.
- `InstallButton.jsx` shows an Install button only when the browser reports the app can be installed.

## Data model
See `backend/sql/schema.sql`. One manager has many projects, one project has many tasks, one agent has many tasks across projects. Deleting a project deletes its tasks.

## Technical decisions
- Role rules live on the server, so hiding a button is never the only protection.
- Saving uses one SQL function, so a failure cannot leave half-created projects.
- No extra packages for hashing or tokens: Node's built-in `crypto` is used.
- Supabase is called only from the backend with the secret key; row level security is on.
- `db.js` is the only file that knows which database is in use, so switching between Supabase and the local file changes nothing else.
