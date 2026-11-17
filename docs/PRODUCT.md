# Product Essentials

## 1. Problem
After a planning meeting, someone has to type every project, task, owner, deadline and estimate into the CRM by hand. It is slow and decisions that changed during the meeting get entered wrongly.

## 2. Target user
NovaWorks Technologies: one administrator, three project managers and six developer agents.

## 3. Core flow
1. The administrator logs in and pastes the meeting transcript.
2. AI reads it with the team directory and returns projects and tasks using only final decisions.
3. The app validates the result and saves it. Managers see their projects; agents see their tasks.

## 4. MVP features
- [x] Login with ten seeded demo accounts and role-based access enforced in the API
- [x] Create from Transcript: AI to validated, saved projects and tasks
- [x] Project cards, project detail with task rows, My Tasks, team directory

## 5. Not building
Signup, forgot password, user management, cost calculation, progress monitoring.

## 6. Where AI is used
Transcript plus team directory go to the model. It returns one JSON object of projects and tasks. The backend validates it and saves it in one transaction.

## 7. Why it is useful
A one-hour meeting becomes a complete, assigned plan in seconds, and each person sees only their own work.

## 8. What we would build next
Editing tasks, progress tracking, deadline reminders, a calendar view.
