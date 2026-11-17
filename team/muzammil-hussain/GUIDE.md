# Muzammil Hussain - AI: transcript to projects and tasks

You own the main feature: the admin pastes a meeting, and real records are created.

## Your files
| File | What it does |
|---|---|
| `backend/src/services/ai.js` | Builds the prompt, calls Groq (backup: OpenRouter), and reads the JSON reply |
| `backend/src/utils/validateDraft.js` | Checks every project and task before anything is saved |
| `backend/src/controllers/transcriptController.js` | The admin-only routes: create from transcript, and save a corrected draft |
| `backend/sql/schema.sql` (function at the bottom) | `create_projects_from_draft` saves all projects and tasks in one transaction |
| `docs/TRANSCRIPT.txt` | The supplied meeting transcript |

## Phase 1 - Foundation (0:00-0:25)
1. Read the prompt in `ai.js` (`buildMessages`). The rules are numbered; learn what each one prevents.
2. Check `backend/.env` has `GROQ_API_KEY`. `OPENROUTER_API_KEY` is the backup.

## Phase 2 and 3 - The core flow (0:25-1:30)
1. Start the backend (`npm run dev`) and the frontend.
2. Log in as admin, click **Use supplied transcript**, then **Create from Transcript**.
3. Expected: "Created 3 projects and 12 tasks."
4. Compare with the answer key:

| Project | Manager | Deadline | Tasks | Hours |
|---|---|---|---|---|
| UrbanCart Website | Ayesha | 20 Oct | 4 | 40 |
| QuickServe Mobile App | Bilal | 24 Oct | 4 | 46 |
| HelpDeskPro AI Assistant | Hina | 22 Oct | 4 | 38 |

5. Check the four corrected values:
   - UrbanCart deadline is 20 October, not 18.
   - Website integration and testing is due 19 October, not 17.
   - Mobile integration and testing is 10 hours, not 8.
   - Assistant evaluation and testing belongs to Maryam, not Zain.
6. Check what must not exist: no Kamran, and no payment, inventory, maps or email tasks.

If a value is wrong, fix it in the prompt rules in `ai.js`, not by hardcoding an answer. Judges test with a changed transcript.

## Phase 4 - Reset and changed input (1:30-1:50)
1. Click **Reset demo data**. Projects disappear, users stay.
2. Changed-input test: paste the transcript, change the final QuickServe integration values to 12 hours and 23 October in both places they appear (the 09:28 section and the final recap), and create again. Only that task should change.

## Phase 6 - Ship (2:10-2:30)
Rehearse the AI part of the demo and the answers below.

## How it works, in your words
1. **Admin only.** The route is behind `requireRole("ADMIN")`.
2. **Directory.** The backend sends the AI the team list: code, name, role, specialization, skills. No emails and no passwords.
3. **Prompt.** The AI is told to use final decisions only, ignore rejected features, use only people in the directory, and return one JSON object in a fixed shape.
4. **Model.** Temperature is 0 for steady output. The backend asks Groq which models the key can use and picks from a preferred list. If Groq fails, OpenRouter is tried.
5. **Validation.** `validateDraft.js` checks: project name and client exist, the manager is a real MANAGER, each owner is a real AGENT, hours are positive, dates are real dates, and no task is due after its project.
6. **Unresolved.** If anything fails, the API answers 422 with the list of problems and saves nothing. The admin can correct the draft and save it; it is validated again.
7. **Save.** One SQL function inserts every project and task in a single transaction. If one insert fails, all of them are rolled back.
8. **Duplicates.** The button is disabled while processing, the backend refuses a second request while one runs, and a project with the same name is replaced instead of duplicated.

## Questions judges may ask
- *Is the result hardcoded?* No. Nothing is prefilled. Change the transcript and the records change.
- *What if the AI invents a person?* Validation rejects any name or code that is not in the directory, and nothing is saved.
- *What if the AI call fails halfway?* Nothing is saved, because saving only happens after a complete, valid draft, in one transaction.
- *Why temperature 0?* The task is extraction, so we want the same answer every time, not creativity.
- *Are passwords sent to the AI?* No. Only the directory fields listed above.

## Added later (also yours)
| File | What it does |
|---|---|
| `backend/src/services/workload.js` (`projectDraftWorkload`) | Existing hours plus the draft's hours per developer |
| `backend/src/controllers/transcriptController.js` | Now three steps: validate, check workload, save |
| `frontend/src/components/OverloadReview.jsx` | The review screen with reassign dropdowns and live capacity bars |

- **Overload check:** after validation, if any developer would be above 40 hours, the API answers 409 with the draft and saves nothing.
- **Review:** the admin reassigns tasks; totals recalculate in the browser. Saving sends the draft back, and the server validates and checks it again.
- **Save anyway:** the admin may accept the overload on purpose; that is the only way past the check.
- **No double counting:** projects that the draft will replace are left out of the existing hours.
- The supplied transcript stays within capacity (highest is Hamza at 30h), so it saves directly.
