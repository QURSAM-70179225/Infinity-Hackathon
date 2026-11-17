// Developer workload: total estimated hours per developer agent against a 40 hour capacity.
//   ok   -> up to 32h  (green)
//   high -> above 32h, up to 40h (yellow)
//   over -> above 40h  (red)
const db = require("./db");

const CAPACITY = 40;
const WARNING_FROM = 32;

function statusFor(hours) {
  if (hours > CAPACITY) return "over";
  if (hours > WARNING_FROM) return "high";
  return "ok";
}

// Adds up task hours per developer id. Tasks of skipped projects are left out.
function sumHours(tasks, skipProjectIds = []) {
  const hours = new Map();
  for (const task of tasks) {
    if (skipProjectIds.includes(task.project_id)) continue;
    hours.set(task.assignee_id, (hours.get(task.assignee_id) || 0) + Number(task.estimated_hours));
  }
  return hours;
}

// What each role may see:
//   ADMIN   -> every developer
//   MANAGER -> only developers working on their projects. They get the developer's total hours
//              across all projects (needed to spot overload) and the hours inside their own
//              projects, but never titles or details of tasks in other managers' projects.
//   AGENT   -> only their own entry
async function getWorkloadFor(user) {
  const [users, projects, tasks] = await Promise.all([db.listUsers(), db.listProjects(), db.listTasks()]);
  const total = sumHours(tasks);
  let agents = users.filter((u) => u.role === "AGENT");
  let mine = null;

  if (user.role === "AGENT") {
    agents = agents.filter((u) => u.id === user.id);
  } else if (user.role === "MANAGER") {
    const myProjectIds = projects.filter((p) => p.manager_id === user.id).map((p) => p.id);
    mine = sumHours(tasks.filter((t) => myProjectIds.includes(t.project_id)));
    agents = agents.filter((u) => mine.has(u.id));
  }

  return agents.map((agent) => {
    const hours = total.get(agent.id) || 0;
    return {
      id: agent.id,
      ref: agent.ref,
      name: agent.name,
      specialization: agent.specialization,
      hours,
      capacity: CAPACITY,
      status: statusFor(hours),
      ...(mine ? { hoursInYourProjects: mine.get(agent.id) || 0 } : {}),
    };
  });
}

// Used before saving a transcript draft: existing hours plus the draft's hours.
// Projects that the draft will replace (same name) are not counted twice.
// `clean` is the validated draft, where managerId and assigneeId are real user ids.
async function projectDraftWorkload(clean, users) {
  const [projects, tasks] = await Promise.all([db.listProjects(), db.listTasks()]);
  const draftNames = clean.projects.map((p) => p.name.toLowerCase());
  const replaced = projects.filter((p) => draftNames.includes(p.name.toLowerCase())).map((p) => p.id);
  const baseline = sumHours(tasks, replaced);

  const projected = new Map(baseline);
  for (const project of clean.projects) {
    for (const task of project.tasks) {
      projected.set(task.assigneeId, (projected.get(task.assigneeId) || 0) + task.estimatedHours);
    }
  }

  const agents = users
    .filter((u) => u.role === "AGENT")
    .map((u) => ({ ref: u.ref, name: u.name, specialization: u.specialization, hours: baseline.get(u.id) || 0 }));
  const overloaded = users
    .filter((u) => u.role === "AGENT" && (projected.get(u.id) || 0) > CAPACITY)
    .map((u) => ({ ref: u.ref, name: u.name, hours: projected.get(u.id) }));

  return { agents, overloaded };
}

module.exports = { CAPACITY, getWorkloadFor, projectDraftWorkload };
