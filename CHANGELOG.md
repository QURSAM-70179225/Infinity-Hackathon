# Changelog

What was built during the hackathon, in order.

| Step | Area | What |
|---|---|---|
| 1 | Setup | Project structure, Supabase schema, seed script for the ten demo accounts |
| 2 | Backend | Login with hashed passwords and signed tokens; role rules enforced in the API |
| 3 | AI | Transcript to projects and tasks: prompt, Groq call with OpenRouter backup, validation, all-or-nothing save |
| 4 | Frontend | Login, project cards, project detail, My Tasks, team directory, loading/error/empty states |
| 5 | Data | Local file database mode as a fallback when Supabase is unreachable |
| 6 | Accounts | Signup for company emails only, always as a developer agent |
| 7 | Management | Admin changes roles and creates projects by hand; managers add and reassign tasks |
| 8 | Directory | All ten demo accounts and reference codes shown on the login page and in the team directory |
| 9 | Workload | 40 hour capacity per developer, capacity bars, overload warnings, overload review before saving a transcript |
| 10 | Demo | User switcher in the top bar that performs a real login |
| 11 | Reminders | Deadline reminder bell and time-left badges on tasks |
| 12 | Mobile | Installable app (home screen icon, opens full screen) and small-screen layout fixes |
| 13 | Board | Kanban board with To Do, In Progress and Done; status changes checked on the server; 11 automated tests |
| 14 | Docs | README in the required template, deployment guide, team guides |
