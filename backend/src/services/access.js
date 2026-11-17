// Role-based access rules. Every data request goes through here,
// so a user can never receive a project or task they are not allowed to see.
//   ADMIN   -> all projects, all tasks
//   MANAGER -> only projects they manage, with all tasks in them
//   AGENT   -> only projects that contain their tasks, and only their own tasks
const db = require("./db");

function shapeTask(task, project, usersById) {
  const assignee = usersById.get(task.assignee_id);
  const manager = usersById.get(project.manager_id);
  return {
    id: task.id,
    projectId: project.id,
    projectName: project.name,
    managerName: manager ? manager.name : "Unknown",
    title: task.title,
    description: task.description || "",
    deadline: task.deadline,
    estimatedHours: Number(task.estimated_hours),
    status: task.status || "todo",
    completedAt: task.completed_at || null,
    assignee: assignee
      ? { id: assignee.id, name: assignee.name, specialization: assignee.specialization }
      : { id: null, name: "Unknown", specialization: "" },
  };
}

async function getProjectsFor(user) {
  const [users, projects, tasks] = await Promise.all([db.listUsers(), db.listProjects(), db.listTasks()]);
  const usersById = new Map(users.map((u) => [u.id, u]));
  const visible = [];

  for (const project of projects) {
    let projectTasks = tasks.filter((t) => t.project_id === project.id);

    if (user.role === "MANAGER" && project.manager_id !== user.id) continue;
    if (user.role === "AGENT") {
      projectTasks = projectTasks.filter((t) => t.assignee_id === user.id);
      if (projectTasks.length === 0) continue;
    }

    const manager = usersById.get(project.manager_id);
    const shapedTasks = projectTasks.map((t) => shapeTask(t, project, usersById));
    visible.push({
      id: project.id,
      name: project.name,
      clientName: project.client_name,
      description: project.description || "",
      deadline: project.deadline,
      manager: manager
        ? { id: manager.id, name: manager.name, specialization: manager.specialization }
        : { id: null, name: "Unknown", specialization: "" },
      tasks: shapedTasks,
      taskCount: shapedTasks.length,
      totalHours: shapedTasks.reduce((sum, t) => sum + t.estimatedHours, 0),
    });
  }
  return visible;
}

// Returns the project only if this user may see it, otherwise null.
async function getProjectFor(user, projectId) {
  const projects = await getProjectsFor(user);
  return projects.find((p) => String(p.id) === String(projectId)) || null;
}

async function getTasksFor(user) {
  const projects = await getProjectsFor(user);
  return projects
    .flatMap((p) => p.tasks)
    .sort((a, b) => String(a.deadline).localeCompare(String(b.deadline)));
}

module.exports = { getProjectsFor, getProjectFor, getTasksFor };
