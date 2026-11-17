# Architecture

## Overview
```
Browser (React + Vite)
        |  HTTP / JSON
        v
Express API (Node.js)  --->  Groq API (LLM)
        |
        v
Supabase (hosted PostgreSQL)
```

## Folders
| Folder | Purpose |
|---|---|
| `frontend/src/components` | Reusable UI elements |
| `frontend/src/pages` | Main screens |
| `frontend/src/services` | Calls to the backend API |
| `backend/src/routes` | API routes |
| `backend/src/controllers` | Request handling logic |
| `backend/src/services` | AI / LLM calls, data logic |
| `docs/` | Product, architecture, team, demo notes |

## API endpoints
| Method | Route | Purpose | Request | Response |
|---|---|---|---|---|
| GET | `/api/health` | Server check | – | `{ ok: true }` |
| _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |

## AI integration
- Provider: Groq (OpenAI-compatible endpoint: https://api.groq.com/openai/v1/chat/completions)
- Backup provider: OpenRouter
- Model: _TBD_ (backup: _TBD_)
- Prompt: _TBD_
- Output format: JSON, validated before sending to the frontend
- If the AI call fails: show a clear error message, do not crash

## Data model
Supabase (hosted PostgreSQL) via `@supabase/supabase-js`. Tables and queries: see [DATABASE.md](DATABASE.md).

## Environment variables (`backend/.env`)
| Name | Purpose |
|---|---|
| `GROQ_API_KEY` | Groq API key — never commit |
| `OPENROUTER_API_KEY` | Backup key (optional) — never commit |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SECRET_KEY` | Supabase secret key — backend only, never commit |
| `PORT` | Backend port (default 5000) |

## Technical decisions (judges may ask why)
- _TBD: decision — reason_
