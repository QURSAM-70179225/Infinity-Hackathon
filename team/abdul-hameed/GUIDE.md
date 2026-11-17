# Abdul Hameed - Frontend: every screen and its states

You own what the judges see first. Every button on screen works; there are no fake screens.

## Your files
| File | What it does |
|---|---|
| `frontend/src/pages/Login.jsx` | Login form with one-click demo accounts |
| `frontend/src/pages/Dashboard.jsx` | Project cards, totals, and (for admin) Create from Transcript and Reset |
| `frontend/src/pages/ProjectDetail.jsx` | Client, manager, deadline and the task rows |
| `frontend/src/pages/MyTasks.jsx` | Agent home: only their tasks |
| `frontend/src/pages/Team.jsx` | Read-only team directory |
| `frontend/src/components/Layout.jsx` | Sidebar with navigation for the logged-in role, and logout |
| `frontend/src/components/TranscriptPanel.jsx` | Transcript box with loading, success, error and correction states |
| `frontend/src/components/ProjectCard.jsx` | One project card |
| `frontend/src/components/TaskTable.jsx` | Task rows with owner, deadline and hours |
| `frontend/src/components/States.jsx` | Shared loading, error, empty states and avatar |
| `frontend/src/components/Icon.jsx` | Small inline icons |
| `frontend/src/App.jsx` | Routes, and the guard that sends logged-out users to login |
| `frontend/src/index.css` | Tailwind import and the entrance animation |
| `frontend/vite.config.js` | Vite with React and Tailwind |

## Phase 1 - Foundation (0:00-0:25)
1. `cd frontend`, then `npm install`, then `npm run dev`. Open http://localhost:5173.
2. The login page should appear with the dark panel on the left and the form on the right.
3. If the page is unstyled, check that `@tailwindcss/vite` is installed and listed in `vite.config.js`.

## Phase 2 - Login and layout (0:25-0:55)
1. Click a demo account chip, then Log in.
2. Admin and managers land on the projects page. Agents land on My Tasks.
3. The sidebar changes per role: admin sees All Projects, a manager sees My Projects, an agent sees My Tasks first.
4. Log out returns to the login page. Refreshing while logged in keeps you logged in.

## Phase 3 - Core flow screens (0:55-1:30)
Check every state of the transcript panel:
| State | How to see it | What appears |
|---|---|---|
| Empty | Nothing typed | Create button is disabled |
| Loading | Click Create | Spinner, button disabled, short explanation |
| Success | Valid transcript | Green banner with counts, cards appear below |
| Error | Stop the backend, click Create | Red banner with a clear message |
| Needs correction | AI could not resolve a person or date | Amber box listing the problems, with an editable draft |

## Phase 4 - Role views (1:30-1:50)
1. Project detail shows client, manager, deadline, task count, hours and the task table.
2. As an agent, the detail page shows only their tasks and a note saying so.
3. Typing another project's ID in the address bar shows the "no access" screen.
4. Team Directory lists all ten people in three groups.

## Phase 5 - Polish (1:50-2:10)
- Narrow the browser window: the sidebar becomes a top bar and cards stack.
- Tab through the login form with the keyboard: focus rings are visible.
- Look for any text that is cut off or any card that is misaligned.

## Phase 6 - Ship (2:10-2:30)
Deploy on Vercel: New Project > your repo. Root directory `frontend`, framework Vite. Add `VITE_API_URL` with the Render backend URL, then deploy.

## How it works, in your words
- **Routing:** React Router. `Protected` in `App.jsx` sends anyone without a login to `/login`.
- **Login state:** `utils/auth.jsx` keeps the user in React context. The token is in `localStorage`, and on refresh the app asks the backend who the token belongs to.
- **API calls:** all go through `services/api.js`, which adds the token and turns failures into readable messages.
- **Security:** the interface hides what a role should not see, but the real protection is in the backend. The frontend never receives other users' data.
- **Design:** one accent colour (indigo) with amber highlights, one font, the same card shape and spacing everywhere, and the same loading, error and empty components on every page.

## Questions judges may ask
- *What stops an agent from opening the admin page?* The admin panel is not rendered for them, and the backend rejects the request with 403 anyway.
- *Where is the token stored?* In `localStorage`, sent in the `Authorization` header.
- *Is the transcript button result prefilled?* No. "Use supplied transcript" only fills the input text. The projects come from the AI.
