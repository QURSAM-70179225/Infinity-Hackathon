# Database

**Choice:** Supabase (hosted PostgreSQL).
**Why:** the app is deployed on Render / Vercel, where local files are not kept, so the data must live in a hosted database. Supabase is free, needs no server setup, and has a simple JavaScript client.

The backend talks to Supabase. The frontend never talks to the database directly.

## Setup (once)
1. Create a project at supabase.com and wait for it to finish setting up.
2. Copy the **Project URL** and the **secret key** (`sb_secret_...`) from Settings → API Keys.
3. Add both to `backend/.env`:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=sb_secret_your_key_here
```
4. Install the client:
```
cd backend
npm install @supabase/supabase-js
```
The secret key has full access to the database. Keep it in the backend only.

## 1. Connection file — create tomorrow as `backend/src/utils/supabase.js`
```js
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

module.exports = supabase;
```
`require("dotenv").config()` must run first, at the top of `backend/src/index.js`.

## 2. Create tables (Supabase dashboard → SQL Editor → Run)
```sql
create table items (
  id bigint generated always as identity primary key,
  title text not null,
  result jsonb,
  created_at timestamptz default now()
);
```
Replace `items` and its columns with what the problem needs.

## 3. Common queries
```js
const supabase = require("../utils/supabase");

// Insert (returns the new row)
const { data, error } = await supabase
  .from("items")
  .insert({ title, result })
  .select()
  .single();

// Read all
const { data, error } = await supabase
  .from("items")
  .select("*")
  .order("id", { ascending: false });

// Read one
const { data, error } = await supabase
  .from("items")
  .select("*")
  .eq("id", id)
  .single();

// Update
const { error } = await supabase.from("items").update({ title }).eq("id", id);

// Delete
const { error } = await supabase.from("items").delete().eq("id", id);
```
Always check `error` after every query and return a clear message if it is set.

## 4. Storing AI output
Use a `jsonb` column and pass the JSON object directly. No `JSON.stringify` needed.

## 5. Deployment
Add the same variables in the Render dashboard (Environment tab) for the backend:
`GROQ_API_KEY`, `OPENROUTER_API_KEY`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY`.
The `.env` file is not uploaded, so the deployed app fails without them.

## Tables (fill after the problem is announced)
| Table | Columns | Purpose |
|---|---|---|
| _TBD_ | _TBD_ | _TBD_ |

## To explain to judges
- Supabase is hosted PostgreSQL, so data survives restarts and redeploys.
- Only the backend holds the secret key; the browser never sees it.
- The Supabase client builds parameterised queries, which prevents SQL injection.
