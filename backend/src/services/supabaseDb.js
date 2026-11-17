// Database queries against Supabase (hosted PostgreSQL).
const { getSupabase } = require("../utils/supabase");
const { httpError } = require("../utils/httpError");

const PUBLIC_USER_FIELDS = "id, ref, name, email, role, specialization, skills";

// Supabase returns { data, error }. This turns an error into a thrown error.
function unwrap({ data, error }) {
  if (error) {
    if (String(error.message).includes("fetch failed")) {
      throw httpError(503, "Cannot reach Supabase. Check the internet connection (try a phone hotspot), or set DB_MODE=local in backend/.env to use the local database.");
    }
    throw httpError(500, `Database error: ${error.message}`);
  }
  return data;
}

async function getUserByEmail(email) {
  return unwrap(await getSupabase().from("users").select("*").eq("email", email).maybeSingle());
}

async function getUserById(id) {
  return unwrap(await getSupabase().from("users").select("*").eq("id", id).maybeSingle());
}

// Never includes password hashes.
async function listUsers() {
  return unwrap(await getSupabase().from("users").select(PUBLIC_USER_FIELDS).order("id"));
}

// Insert or update by unique email, so seeding twice never duplicates users.
async function upsertUsers(rows) {
  unwrap(await getSupabase().from("users").upsert(rows, { onConflict: "email" }));
  return (await listUsers()).length;
}

// Adds one new user and returns the saved row.
async function createUser(row) {
  return unwrap(await getSupabase().from("users").insert(row).select("*").single());
}

// Changes fields of one user (used when the admin changes a role).
async function updateUser(id, fields) {
  return unwrap(await getSupabase().from("users").update(fields).eq("id", id).select(PUBLIC_USER_FIELDS).single());
}

async function createProject(row) {
  return unwrap(await getSupabase().from("projects").insert(row).select("*").single());
}

async function createTask(row) {
  return unwrap(await getSupabase().from("tasks").insert(row).select("*").single());
}

async function updateTask(id, fields) {
  return unwrap(await getSupabase().from("tasks").update(fields).eq("id", id).select("*").single());
}

async function listProjects() {
  return unwrap(await getSupabase().from("projects").select("*").order("deadline").order("id"));
}

async function listTasks() {
  return unwrap(await getSupabase().from("tasks").select("*").order("deadline").order("id"));
}

// Calls the SQL function that saves every project and task in one transaction.
async function saveDraft(draft) {
  return unwrap(await getSupabase().rpc("create_projects_from_draft", { draft, replace_existing: true }));
}

// Deletes generated projects; their tasks go with them (cascade). Users stay.
async function deleteAllProjects() {
  unwrap(await getSupabase().from("projects").delete().gt("id", 0));
}

module.exports = { getUserByEmail, getUserById, listUsers, upsertUsers, createUser, updateUser, createProject, createTask, updateTask, listProjects, listTasks, saveDraft, deleteAllProjects };
