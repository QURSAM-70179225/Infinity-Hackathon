# Master Prompt

Paste this into the AI coding tool after the problem is announced. Fill the blanks first.

```
You are helping my 4-person team build an MVP in a 3-hour hackathon.
Follow every rule in AGENTS.md at the project root.

PROBLEM STATEMENT:
[paste the official problem here]

OUR CORE FLOW (the one thing that must work):
1. User does: [ ]
2. App does: [ ]
3. User gets: [ ]

MVP FEATURES (max 3):
- [ ]
- [ ]
- [ ]

TECH STACK (already set up, do not change):
- Frontend: React + Vite in /frontend
- Backend: Node.js + Express in /backend, entry backend/src/index.js, port 5000
- AI: Groq API, key GROQ_API_KEY in backend/.env (backup OPENROUTER_API_KEY)
- Data: Supabase (PostgreSQL) via @supabase/supabase-js, client in backend/src/utils/supabase.js

FIRST, give a short plan: API routes, the AI prompt, database tables (as SQL), and files to create.
THEN give complete files with full paths, the commands to run, and a 5-line explanation.
```

## Follow-up prompts
- "Add only this feature: ..."
- "Fix this error: [paste the full error]"
- "Make this screen look more polished without changing how it works."
- "Explain this file in simple words so I can explain it to judges."
