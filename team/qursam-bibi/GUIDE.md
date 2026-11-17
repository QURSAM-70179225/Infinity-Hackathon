# Qursam Bibi - Leader: integration, testing, README, deployment, demo

You connect the three parts, prove the app works against the answer key, and submit.

## Your files
| File | What it does |
|---|---|
| `README.md` | Required for evaluation. Fill the bracketed parts: team name, repository URL, live link, video link |
| `backend/.env` | Real keys. Never commit this file |
| `backend/.env.example`, `frontend/.env.example` | Safe templates with placeholders |
| `frontend/src/services/api.js` | The single place where the frontend talks to the backend |
| `frontend/src/utils/auth.jsx` | Login state shared across pages |
| `frontend/src/utils/sampleTranscript.js` | The supplied transcript text for the "Use supplied transcript" button |
| `docs/TRANSCRIPT.txt` | The same transcript as a file |
| `docs/DEMO_SCRIPT.md` | Your talking points |
| `team/` | One guide per member |

## Phase 1 - Foundation (0:00-0:25)
1. Supabase: copy the Project URL and the secret key (`sb_secret_...`) from Settings > API Keys.
2. Add both to `backend/.env`:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SECRET_KEY=sb_secret_your_key
   ```
3. Run `backend/sql/schema.sql` in the Supabase SQL Editor.
4. `cd backend`, then `npm run seed`. Expect 10 users.
5. Push to GitHub and add the three teammates as collaborators.

## Phase 2 - Connect (0:25-0:55)
1. Terminal 1: `cd backend`, `npm run dev`. Terminal 2: `cd frontend`, `npm run dev`.
2. Log in as admin, Ayesha and Ali. Each lands on the right home.

## Phase 3 - Full flow (0:55-1:30)
Admin > Use supplied transcript > Create from Transcript > 3 projects, 12 tasks. Refresh: they remain.

## Phase 5 - Test against the answer key (1:50-2:10)
- [ ] 3 projects, 12 tasks
- [ ] Hours: UrbanCart 40, QuickServe 46, HelpDeskPro 38
- [ ] UrbanCart deadline 20 Oct; its integration task due 19 Oct
- [ ] QuickServe integration is 10 hours
- [ ] HelpDeskPro testing is owned by Maryam
- [ ] No Kamran; no payment, inventory, maps or email tasks
- [ ] Ayesha sees only UrbanCart
- [ ] Ali sees only his 3 tasks
- [ ] Hamza sees 2 tasks across UrbanCart and QuickServe
- [ ] Another project's ID in the address bar shows the no-access screen
- [ ] Refresh keeps the data
- [ ] Changed transcript (QuickServe integration 12 hours, 23 Oct) changes only that task
- [ ] Reset demo data removes projects and keeps users

## Phase 6 - Ship (2:10-2:30)
1. Fill the bracketed parts of `README.md`.
2. Record the demo video: login, transcript conversion, created projects and tasks, the three role views, refresh.
3. After Ali and Abdul deploy, open the live link and repeat the login and create steps on it.
4. Commit and push. Check on GitHub that `.env` is not in the repository.
5. Stop coding when time ends.

## Demo order (about 3 minutes)
1. The problem: after a planning meeting, someone types every project and task by hand.
2. Log in as admin, load the transcript, click Create. Show the three cards.
3. Open UrbanCart: manager, deadline 20 October, four tasks with owners and hours.
4. Point out the corrections the AI respected, and that Kamran and the payment tasks are not there.
5. Log in as Ayesha, then Ali, then Hamza. Show each sees only their work.
6. Type another project's ID in the address bar to show access is blocked.
7. Refresh to show the data is saved.
8. What is next: editing tasks, progress tracking, calendar view.

## Questions judges may ask you
- *How do the parts connect?* React calls the Express API; the API checks the token, applies the role rules, calls the AI for transcripts, and reads and writes Supabase.
- *What was the hardest part?* Making the AI follow final decisions, and making sure nothing is saved unless the whole draft is valid.
- *What would you build next?* Editing, progress tracking, notifications.

## Added later
| File | What it does |
|---|---|
| `docs/DEPLOYMENT.md` | Step-by-step: GitHub, Render, Vercel, connect, test, install on a phone |
| `docs/DEMO_SCRIPT.md` | Filled demo order and short answers |
| `CHANGELOG.md` | What was built, in order |

Extra checks before submitting:
- [ ] Team Directory shows capacity bars; nobody is red after the supplied transcript
- [ ] Top-bar switcher changes the view for Ayesha, Ali and Hamza
- [ ] Bell shows deadline reminders
- [ ] Signup refuses a Gmail address and accepts `@novaworks.example`
- [ ] On the live link, **Install app** appears on the phone
