// Local database: one JSON file on this computer (backend/data/db.json).
// Same functions as supabaseDb.js, so the rest of the app does not change.
// Used when DB_MODE=local, for example when the venue network blocks Supabase.
const fs = require("fs");
const path = require("path");

const FILE = process.env.LOCAL_DB_FILE || path.join(__dirname, "..", "..", "data", "db.json");
const EMPTY = { users: [], projects: [], tasks: [], nextId: { users: 1, projects: 1, tasks: 1 } };

function read() {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch {
    return JSON.parse(JSON.stringify(EMPTY));
  }
}

// The whole file is written in one step, so a save is all or nothing.
function write(data) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

const withoutPassword = ({ password_hash, ...user }) => user;
const byDeadline = (a, b) => String(a.deadline).localeCompare(String(b.deadline)) || a.id - b.id;

async function getUserByEmail(email) {
  return read().users.find((u) => u.email === email) || null;
}

async function getUserById(id) {
  return read().users.find((u) => u.id === id) || null;
}

async function listUsers() {
  return read().users.map(withoutPassword);
}

// Insert or update by unique email, so seeding twice never duplicates users.
async function upsertUsers(rows) {
  const data = read();
  for (const row of rows) {
    const existing = data.users.find((u) => u.email === row.email);
    if (existing) Object.assign(existing, row);
    else data.users.push({ id: data.nextId.users++, ...row });
  }
  write(data);
  return data.users.length;
}

// Adds one new user and returns the saved row.
async function createUser(row) {
  const data = read();
  const user = { id: data.nextId.users++, ...row };
  data.users.push(user);
  write(data);
  return user;
}

// Changes fields of one user (used when the admin changes a role).
async function updateUser(id, fields) {
  const data = read();
  const user = data.users.find((u) => u.id === id);
  Object.assign(user, fields);
  write(data);
  return withoutPassword(user);
}

async function createProject(row) {
  const data = read();
  const project = { id: data.nextId.projects++, ...row };
  data.projects.push(project);
  write(data);
  return project;
}

async function createTask(row) {
  const data = read();
  const task = { id: data.nextId.tasks++, ...row };
  data.tasks.push(task);
  write(data);
  return task;
}

async function updateTask(id, fields) {
  const data = read();
  const task = data.tasks.find((t) => t.id === id);
  Object.assign(task, fields);
  write(data);
  return task;
}

async function listProjects() {
  return read().projects.sort(byDeadline);
}

async function listTasks() {
  return read().tasks.sort(byDeadline);
}

// Builds every project and task in memory first, then writes once.
async function saveDraft(draft) {
  const data = read();
  let taskCount = 0;

  for (const project of draft.projects) {
    // Replace a project that already exists with the same name, together with its tasks.
    const old = data.projects.filter((p) => p.name.toLowerCase() === project.name.toLowerCase()).map((p) => p.id);
    data.projects = data.projects.filter((p) => !old.includes(p.id));
    data.tasks = data.tasks.filter((t) => !old.includes(t.project_id));

    const id = data.nextId.projects++;
    data.projects.push({
      id,
      name: project.name,
      client_name: project.clientName,
      description: project.description,
      manager_id: project.managerId,
      deadline: project.deadline,
    });

    for (const task of project.tasks) {
      data.tasks.push({
        id: data.nextId.tasks++,
        project_id: id,
        title: task.title,
        description: task.description,
        assignee_id: task.assigneeId,
        deadline: task.deadline,
        estimated_hours: task.estimatedHours,
      });
      taskCount++;
    }
  }

  write(data);
  return { projects: draft.projects.length, tasks: taskCount };
}

// Removes generated projects and tasks. Users stay.
async function deleteAllProjects() {
  const data = read();
  data.projects = [];
  data.tasks = [];
  write(data);
}

module.exports = { getUserByEmail, getUserById, listUsers, upsertUsers, createUser, updateUser, createProject, createTask, updateTask, listProjects, listTasks, saveDraft, deleteAllProjects };
