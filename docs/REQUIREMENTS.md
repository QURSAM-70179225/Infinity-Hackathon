# Requirements

## 1. Software (install before the event)
| Tool | Version | Check with |
|---|---|---|
| Node.js | 18 or newer (LTS) | `node -v` |
| npm | comes with Node | `npm -v` |
| Git | any recent | `git --version` |
| VS Code | any recent | `code -v` |
| Chrome | any recent | – |

## 2. Accounts and keys
- [ ] Groq account + API key (tested)
- [ ] Backup AI key (OpenRouter free models)
- [ ] GitHub account, logged in
- [ ] Supabase account + project (URL and secret key in `backend/.env`)
- [ ] Vercel account (frontend) and Render account (backend)

## 3. Project dependencies
**Frontend** (`frontend/package.json`): React, Vite
**Backend** (`backend/package.json`): express, cors, dotenv, @supabase/supabase-js

## 4. Functional requirements (fill after the problem is announced)
| # | The app must... | Priority | Done |
|---|---|---|---|
| F1 | _TBD_ | Must | [ ] |
| F2 | _TBD_ | Must | [ ] |
| F3 | _TBD_ | Nice to have | [ ] |

## 5. Non-functional requirements
- Core flow works end to end in the live demo.
- Works with different inputs (judges may test their own).
- Clear error message if the AI call fails.
- API key stays in `backend/.env`, never in the frontend or on GitHub.
