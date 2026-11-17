# Architecture

## Overview
```
Browser (React + Vite + Tailwind)
        |  HTTPS, JSON, Authorization: Bearer <token>
        v
Express API (Node.js)  --->  Groq API (LLM), backup OpenRouter
        |
        v
Supabase (hosted PostgreSQL): users, projects, tasks
```

## Folders
| Folder | Purpose |
|---|---|
| `frontend/src/pages` | Login, Dashboard, ProjectDetail, MyTasks, Team |
| `frontend/src/components` | Layout, ProjectCard, TaskTable, TranscriptPanel, shared states |
| `frontend/src/services` | `api.js`: every call to the backend |
| `frontend/src/utils` | Login state, formatting, supplied transcript text |
| `backend/src/routes` | The list of API routes |
| `backend/src/middleware` | `requireAuth`, `requireRole` |
| `backend/src/controllers` | Request handling for auth, projects, transcript |
| `backend/src/services` | `db.js` queries, `access.js` role rules, `ai.js` LLM call |
| `backend/src/utils` | Password hashing, tokens, draft validation, demo users |
| `backend/sql` | Database schema and the transactional save function |

## API endpoints
| Method | Route | Who | Purpose |
|---|---|---|---|
| GET | `/api/health` | anyone | Server check |
| POST | `/api/auth/login` | anyone | Email and password to token |
| GET | `/api/auth/me` | logged in | Current user |
| GET | `/api/team` | logged in | Read-only directory |
| GET | `/api/projects` | logged in | Projects this user may see |
| GET | `/api/projects/:id` | logged in | One project, 403 if not allowed |
| GET | `/api/tasks/mine` | logged in | Tasks this user may see |
| GET | `/api/workload` | logged in | Developer hours against the 40 hour capacity, limited by role |
| POST | `/api/auth/signup` | anyone | New account, always a developer agent |
| POST | `/api/projects` | admin | Create a project by hand and assign a manager |
| POST | `/api/projects/:id/tasks` | admin, project's manager | Add a task and assign an agent |
| PATCH | `/api/tasks/:id` | admin, project's manager | Edit or reassign a task |
| PATCH | `/api/team/:id/role` | admin | Make a member a manager or an agent |
| POST | `/api/transcript` | admin | Transcript to saved projects and tasks |
| POST | `/api/transcript/save` | admin | Save a corrected draft after validation |
| DELETE | `/api/projects` | admin | Reset generated projects and tasks |

## Access rules (`backend/src/services/access.js`)
| Role | Projects | Tasks |
|---|---|---|
| ADMIN | All | All |
| MANAGER | Where they are the manager | All tasks in those projects |
| AGENT | Those containing their tasks | Only their own |

## AI integration
- Provider: Groq chat completions, temperature 0, JSON mode. Backup: OpenRouter.
- Input: the transcript and the team directory (code, name, role, specialization, skills).
- Output: `{ projects: [{ name, clientName, description, managerId, deadline, tasks: [...] }] }`
- Validation before saving: real manager, real agent, positive hours, real dates, task not after project deadline.
- On any problem: 422 with the list of issues, nothing saved.

## Data model
See `backend/sql/schema.sql`. One manager has many projects, one project has many tasks, one agent has many tasks across projects. Deleting a project deletes its tasks.

## Technical decisions
- Role rules live on the server, so hiding a button is never the only protection.
- The user comes from the signed token and a database lookup, never from a role sent by the browser.
- Saving uses one SQL function, so a failure cannot leave half-created projects.
- No extra packages for hashing or tokens: Node's built-in `crypto` is used.
- Supabase is called only from the backend with the secret key; row level security is on.
