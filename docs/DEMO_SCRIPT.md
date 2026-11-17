# Demo Script (about 3 minutes)

## The six questions
1. **What problem are you solving?** After a planning meeting, someone types every project and task into the CRM by hand, and changed decisions get entered wrongly.
2. **How does your solution work?** The admin pastes the meeting transcript. AI reads it with the team directory and creates the projects and tasks. Each person then sees only their own work.
3. **What did your team build?** A role-based CRM with a React frontend, an Express API, a Supabase database, and an AI flow that validates everything before saving.
4. **Where is AI used?** In turning the transcript into structured projects and tasks. It follows final decisions, ignores rejected features, and only uses people in the directory.
5. **What makes it useful?** A one-hour meeting becomes an assigned plan in seconds, and nobody is given more than 40 hours without a warning.
6. **What would you build next?** Task progress, email reminders, a calendar view, a native mobile app.

## Live demo steps
1. Login page: point out the ten demo accounts with their reference codes. Log in as Admin.
2. Click **Use supplied transcript**, then **Create from Transcript**. Three project cards appear.
3. Open UrbanCart Website: manager Ayesha, deadline 20 October (not 18), four tasks, 40 hours. The integration task is due 19 October (not 17).
4. Say what is not there: no Kamran, no payment, maps or email tasks.
5. Open Team Directory: capacity bars per developer against 40 hours.
6. Use the top-bar switcher: Ayesha sees only UrbanCart. Ali sees only his three tasks and his capacity meter. Hamza sees two tasks across two projects.
7. As Ayesha, change the project number in the address bar to another project. The app shows the no-access screen.
8. Refresh the page: the data is still there.
9. Click the bell: deadline reminders for the logged-in user.
10. If time allows: paste a short meeting that gives Hamza 12 more hours to show the overload alert and one-click reassign.

## Backup
- [ ] Demo video recorded
- [ ] A changed transcript ready (QuickServe integration 12 hours, 23 October)
- [ ] Who speaks: Qursam Bibi. Who drives the laptop: one teammate.

## Short answers for judge questions
- *Is the result hardcoded?* No. Change the transcript and the records change.
- *Can an agent see another agent's tasks?* No. The filter is on the server, so the data never leaves the backend.
- *Is the switcher a shortcut around login?* No. It logs in as that demo account and gets a new token from the backend.
- *What if the AI fails?* The backup provider is tried. If both fail, nothing is saved and a clear message appears.
