# Requirements

## 1. Software
| Tool | Version | Check with |
|---|---|---|
| Node.js | 18 or newer (LTS) | `node -v` |
| npm | comes with Node | `npm -v` |
| Git | any recent | `git --version` |
| Chrome or Edge | any recent | - |

## 2. Accounts and keys
- Supabase project: URL and secret key
- Groq API key
- Optional: OpenRouter key as AI backup
- For deployment: GitHub, Render and Vercel accounts

## 3. Project dependencies
**Frontend:** React, Vite, Tailwind CSS, React Router
**Backend:** express, cors, dotenv, @supabase/supabase-js. Hashing and tokens use Node's built-in `crypto`.

## 4. Functional requirements
| # | The app must... | Source | Done |
|---|---|---|---|
| F1 | Log in and out with the ten supplied demo accounts | Challenge | [x] |
| F2 | Show the admin all project cards and Create from Transcript | Challenge | [x] |
| F3 | Show a team directory with names and specializations | Challenge | [x] |
| F4 | Show project detail: client, manager, deadline, tasks | Challenge | [x] |
| F5 | Show task rows: title, description, agent, deadline, hours | Challenge | [x] |
| F6 | Limit managers to their projects and agents to their tasks, in the API | Challenge | [x] |
| F7 | Save projects and tasks so they remain after a refresh | Challenge | [x] |
| F8 | Create projects and tasks from a transcript with AI, all or nothing | Challenge | [x] |
| F9 | Ask for a correction when required information is unclear | Challenge | [x] |
| F10 | Warn when a developer is above 40 hours and review before saving | Extra | [x] |
| F11 | Let managers add and reassign tasks; let the admin manage roles and projects | Extra | [x] |
| F12 | Remind users of deadlines | Extra | [x] |
| F13 | Install on a phone or laptop and adapt to screen size | Extra | [x] |

## 5. Non-functional requirements
- Core flow works end to end in the live demo.
- Works with different inputs (judges may test their own transcript).
- Clear error message if the AI call or the database fails; nothing is half saved.
- Keys stay in the backend, never in the frontend or on GitHub.
- The user is identified from the login token, never from a value sent by the browser.
