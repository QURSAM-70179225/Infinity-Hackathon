// Kanban board: tasks in three columns, To Do / In Progress / Done.
// Who may read and change a task's status:
//   ADMIN   -> any task
//   MANAGER -> tasks in projects they manage
//   AGENT   -> tasks assigned to them
// Anything else answers 404, so the existence of other people's work is not revealed.
const db = require("../services/db");
const access = require("../services/access");
const { httpError } = require("../utils/httpError");

const STATUSES = ["todo", "in_progress", "done"];

function toColumns(tasks) {
  const columns = { todo: [], in_progress: [], done: [] };
  for (const task of tasks) columns[task.status].push(task);
  return columns;
}

// GET /api/projects/:id/board -> this project's tasks, grouped by status.
async function projectBoard(req, res) {
  const project = await access.getProjectFor(req.user, req.params.id);
  if (!project) throw httpError(404, "Project not found.");
  res.json({ project: { id: project.id, name: project.name }, board: toColumns(project.tasks) });
}

// GET /api/board/my-tasks -> only tasks assigned to the logged-in user, for any role.
async function myBoard(req, res) {
  const tasks = await access.getTasksFor(req.user);
  res.json({ board: toColumns(tasks.filter((task) => task.assignee.id === req.user.id)) });
}

// PATCH /api/tasks/:id/status  { status }
// Only the status may be sent. Any other field is refused, so this route cannot edit a task.
async function changeStatus(req, res) {
  const body = req.body || {};
  const keys = Object.keys(body);
  if (keys.length !== 1 || keys[0] !== "status") {
    throw httpError(400, "Send only the status field.");
  }
  if (!STATUSES.includes(body.status)) {
    throw httpError(400, "Status must be todo, in_progress or done.");
  }

  // getTasksFor returns only the tasks this user is allowed to see and change.
  const allowed = await access.getTasksFor(req.user);
  const task = allowed.find((t) => String(t.id) === String(req.params.id));
  if (!task) throw httpError(404, "Task not found.");

  // completed_at is set when a task reaches Done and cleared when it leaves Done.
  let completedAt = null;
  if (body.status === "done") completedAt = task.status === "done" && task.completedAt ? task.completedAt : new Date().toISOString();

  await db.updateTask(task.id, { status: body.status, completed_at: completedAt });
  res.json({ task: { ...task, status: body.status, completedAt } });
}

module.exports = { projectBoard, myBoard, changeStatus };
