# Product Essentials

## 1. Problem
After a planning meeting, someone has to type every project, task, owner, deadline and estimate into the CRM by hand. It is slow, and decisions that changed during the meeting get entered wrongly.

## 2. Target user
NovaWorks Technologies: one administrator, three project managers and six developer agents.

## 3. Core flow
1. The administrator logs in and pastes the meeting transcript.
2. AI reads it with the team directory and returns projects and tasks using only final decisions.
3. The app validates the result, checks developer workload, and saves it. Managers see their projects; agents see their tasks.

## 4. Features
**Required by the challenge**
- [x] Login with ten seeded demo accounts and role-based access enforced in the API
- [x] Create from Transcript: AI to validated, saved projects and tasks
- [x] Project cards, project detail with task rows, My Tasks, team directory
- [x] Persistent hosted database

**Added on top**
- [x] Developer workload against a 40 hour capacity, with overload warnings
- [x] Overload review before saving a transcript, with reassign suggestions
- [x] Manual management: admin creates projects and changes roles; managers add and reassign tasks
- [x] Signup for company emails, always as a developer agent
- [x] Deadline reminders and time-left badges
- [x] Demo user switcher that performs a real login
- [x] Installable on phones and laptops, with a layout that adapts to screen size

## 5. Not building
Forgot password, email verification, cost calculation, progress monitoring.

## 6. Where AI is used
The transcript and the team directory go to the model. It returns one JSON object of projects and tasks. The backend validates it, checks workload, and saves it in one transaction.

## 7. Why it is useful
A one-hour meeting becomes a complete, assigned plan in seconds. Nobody is given more work than they have capacity for, and each person sees only their own work.

## 8. What we would build next
Task status and progress, email reminders, a calendar view, a native mobile app.
