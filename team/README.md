# Team Guides

One folder per team member. Each guide lists that member's phases, the files they own, what each file does, how to test it, and the questions judges are likely to ask.

| Member | Area | Guide |
|---|---|---|
| Ali Mumtaz | Backend: database, seeding, login, access rules | [ali-mumtaz/GUIDE.md](ali-mumtaz/GUIDE.md) |
| Muzammil Hussain | AI: prompt, transcript conversion, validation, save | [muzammil-hussain/GUIDE.md](muzammil-hussain/GUIDE.md) |
| Abdul Hameed | Frontend: every screen and its states | [abdul-hameed/GUIDE.md](abdul-hameed/GUIDE.md) |
| Qursam Bibi | Integration, testing, README, deployment, demo | [qursam-bibi/GUIDE.md](qursam-bibi/GUIDE.md) |

The code itself lives in `frontend/` and `backend/`, in one working app. These guides point to the files; they do not hold copies of the code.

## Start order
1. Qursam: Supabase keys in `backend/.env`, run `backend/sql/schema.sql`, run `npm run seed`.
2. Everyone: `git pull`, then `npm install` in `backend` and `frontend`.
3. Start both servers and follow your own guide.
