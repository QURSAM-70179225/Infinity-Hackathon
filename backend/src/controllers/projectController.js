const db = require("../services/db");
const access = require("../services/access");
const workload = require("../services/workload");
const { httpError } = require("../utils/httpError");
const { isRealDate } = require("../utils/validateDraft");

const text = (value) => (typeof value === "string" ? value.trim() : "");

// GET /api/projects -> only the projects this user may see.
async function list(req, res) {
  res.json({ projects: await access.getProjectsFor(req.user) });
}

// GET /api/projects/:id -> 403 if the project belongs to someone else.
async function detail(req, res) {
  const project = await access.getProjectFor(req.user, req.params.id);
  if (!project) throw httpError(403, "You do not have access to this project.");
  res.json({ project });
}

// GET /api/tasks/mine -> tasks this user may see (an agent gets only their own).
async function myTasks(req, res) {
  res.json({ tasks: await access.getTasksFor(req.user) });
}

// GET /api/team -> directory: names and specializations, no passwords.
async function team(req, res) {
  const users = await db.listUsers();
  res.json({
    team: users.map(({ id, ref, name, role, specialization, skills }) => ({ id, ref, name, role, specialization, skills })),
  });
}

// GET /api/workload -> developer hours against the 40 hour capacity, limited by role.
async function workloadFor(req, res) {
  res.json({ capacity: workload.CAPACITY, workload: await workload.getWorkloadFor(req.user) });
}

// DELETE /api/projects -> admin reset of generated projects and tasks. Users are kept.
async function reset(req, res) {
  await db.deleteAllProjects();
  res.json({ message: "All generated projects and tasks were removed. Demo users are unchanged." });
}

// POST /api/projects  (admin) -> create a project by hand and assign it to a manager.
async function create(req, res) {
  const name = text(req.body?.name);
  const clientName = text(req.body?.clientName);
  const deadline = text(req.body?.deadline);
  if (!name) throw httpError(400, "Enter a project name.");
  if (!clientName) throw httpError(400, "Enter the client name.");
  if (!isRealDate(deadline)) throw httpError(400, "Enter a valid project deadline.");

  const users = await db.listUsers();
  const manager = users.find((u) => String(u.id) === String(req.body?.managerId));
  if (!manager || manager.role !== "MANAGER") throw httpError(400, "Choose a project manager from the team directory.");

  const existing = await db.listProjects();
  if (existing.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
    throw httpError(409, "A project with this name already exists.");
  }

  const project = await db.createProject({
    name,
    client_name: clientName,
    description: text(req.body?.description),
    manager_id: manager.id,
    deadline,
  });
  res.status(201).json({ id: project.id, message: `Project created and assigned to ${manager.name}.` });
}

// Reads task fields from a request and checks them against the project and the team.
// With `existing` (an update), only the fields that were sent are checked and changed.
function readTaskFields(body, project, users, existing) {
  const fields = {};
  const sent = (key) => !existing || body[key] !== undefined;

  if (sent("title")) {
    fields.title = text(body.title);
    if (!fields.title) throw httpError(400, "Enter a task title.");
  }
  if (sent("description")) fields.description = text(body.description);
  if (sent("assigneeId")) {
    const assignee = users.find((u) => String(u.id) === String(body.assigneeId));
    if (!assignee || assignee.role !== "AGENT") throw httpError(400, "Choose a developer agent from the team directory.");
    fields.assignee_id = assignee.id;
  }
  if (sent("deadline")) {
    fields.deadline = text(body.deadline);
    if (!isRealDate(fields.deadline)) throw httpError(400, "Enter a valid task deadline.");
    if (fields.deadline > project.deadline) {
      throw httpError(400, `The task deadline cannot be after the project deadline (${project.deadline}).`);
    }
  }
  if (sent("estimatedHours")) {
    fields.estimated_hours = Number(body.estimatedHours);
    if (!Number.isFinite(fields.estimated_hours) || fields.estimated_hours <= 0) {
      throw httpError(400, "Estimated hours must be a positive number.");
    }
  }
  return fields;
}

// POST /api/projects/:id/tasks  (admin, or the manager of this project) -> add and assign a task.
async function addTask(req, res) {
  // getProjectFor returns the project only if this user may manage it.
  const project = await access.getProjectFor(req.user, req.params.id);
  if (!project) throw httpError(403, "You can only add tasks to your own projects.");

  const fields = readTaskFields(req.body || {}, project, await db.listUsers(), null);
  const task = await db.createTask({ project_id: project.id, ...fields });
  res.status(201).json({ id: task.id, message: "Task created." });
}

// PATCH /api/tasks/:id  (admin, or the manager of the task's project) -> edit or reassign a task.
async function updateTask(req, res) {
  const task = (await db.listTasks()).find((t) => String(t.id) === String(req.params.id));
  if (!task) throw httpError(404, "Task not found.");

  const project = await access.getProjectFor(req.user, task.project_id);
  if (!project) throw httpError(403, "You can only change tasks in your own projects.");

  const fields = readTaskFields(req.body || {}, project, await db.listUsers(), task);
  if (Object.keys(fields).length === 0) throw httpError(400, "Nothing to change.");

  await db.updateTask(task.id, fields);
  res.json({ message: "Task updated." });
}

// PATCH /api/team/:id/role  (admin) -> make a member a project manager or a developer agent.
async function changeRole(req, res) {
  const role = text(req.body?.role).toUpperCase();
  if (!["MANAGER", "AGENT"].includes(role)) throw httpError(400, "Role must be MANAGER or AGENT.");

  const users = await db.listUsers();
  const member = users.find((u) => String(u.id) === String(req.params.id));
  if (!member) throw httpError(404, "Team member not found.");
  if (member.role === "ADMIN") throw httpError(400, "The administrator's role cannot be changed.");
  if (member.role === role) return res.json({ message: "No change needed." });

  // Keep the data consistent: a manager with projects, or an agent with tasks, must hand them over first.
  if (role === "AGENT" && (await db.listProjects()).some((p) => p.manager_id === member.id)) {
    throw httpError(409, `${member.name} still manages projects. Reset or reassign them first.`);
  }
  if (role === "MANAGER" && (await db.listTasks()).some((t) => t.assignee_id === member.id)) {
    throw httpError(409, `${member.name} still has tasks assigned. Reassign those tasks first.`);
  }

  // New directory code: next free PMxx for a manager, DEVxx for an agent.
  const prefix = role === "MANAGER" ? "PM" : "DEV";
  const numbers = users.map((u) => Number((String(u.ref).match(new RegExp(`^${prefix}(\\d+)$`)) || [])[1] || 0));
  const ref = `${prefix}${String(Math.max(0, ...numbers) + 1).padStart(2, "0")}`;

  await db.updateUser(member.id, { role, ref });
  res.json({ message: `${member.name} is now a ${role === "MANAGER" ? "project manager" : "developer agent"}.` });
}

module.exports = { list, detail, myTasks, team, workloadFor, reset, create, addTask, updateTask, changeRole };
