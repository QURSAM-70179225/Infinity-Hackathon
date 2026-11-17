// Checks the AI draft before anything is saved.
// Returns { errors, clean }. If errors is not empty, nothing may be saved.
// `clean` is the same draft with directory codes (PM01, DEV01) replaced by real user ids.

function isRealDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

const text = (value) => (typeof value === "string" ? value.trim() : "");

// Finds a user by directory code or by exact name, ignoring upper/lower case.
function findUser(users, value) {
  const wanted = text(String(value ?? "")).toLowerCase();
  if (!wanted) return null;
  return users.find((u) => u.ref.toLowerCase() === wanted || u.name.toLowerCase() === wanted) || null;
}

function validateDraft(draft, users) {
  const errors = [];
  const clean = { projects: [] };

  if (!draft || !Array.isArray(draft.projects) || draft.projects.length === 0) {
    return { errors: ["No projects were found in the transcript."], clean };
  }

  const seenNames = new Set();

  draft.projects.forEach((project, i) => {
    const label = text(project?.name) || `Project ${i + 1}`;
    const name = text(project?.name);
    const clientName = text(project?.clientName);
    const deadline = text(project?.deadline);

    if (!name) errors.push(`${label}: project name is missing.`);
    if (name && seenNames.has(name.toLowerCase())) errors.push(`${label}: this project appears more than once.`);
    seenNames.add(name.toLowerCase());
    if (!clientName) errors.push(`${label}: client name is missing.`);
    if (!isRealDate(deadline)) errors.push(`${label}: project deadline is missing or not a valid date (YYYY-MM-DD).`);

    const manager = findUser(users, project?.managerId);
    if (!manager) errors.push(`${label}: manager "${project?.managerId ?? "none"}" is not in the team directory.`);
    else if (manager.role !== "MANAGER") errors.push(`${label}: ${manager.name} is not a manager.`);

    const tasks = Array.isArray(project?.tasks) ? project.tasks : [];
    if (tasks.length === 0) errors.push(`${label}: no tasks were found.`);

    const cleanTasks = tasks.map((task, j) => {
      const taskLabel = `${label} / ${text(task?.title) || `Task ${j + 1}`}`;
      const title = text(task?.title);
      const taskDeadline = text(task?.deadline);
      const hours = Number(task?.estimatedHours);

      if (!title) errors.push(`${taskLabel}: task title is missing.`);

      const assignee = findUser(users, task?.assigneeId);
      if (!assignee) errors.push(`${taskLabel}: owner "${task?.assigneeId ?? "none"}" is not in the team directory.`);
      else if (assignee.role !== "AGENT") errors.push(`${taskLabel}: ${assignee.name} is not a developer agent.`);

      if (!Number.isFinite(hours) || hours <= 0) errors.push(`${taskLabel}: estimated hours must be a positive number.`);

      if (!isRealDate(taskDeadline)) errors.push(`${taskLabel}: task deadline is missing or not a valid date (YYYY-MM-DD).`);
      else if (isRealDate(deadline) && taskDeadline > deadline) {
        errors.push(`${taskLabel}: task deadline ${taskDeadline} is after the project deadline ${deadline}.`);
      }

      return {
        title,
        description: text(task?.description),
        assigneeId: assignee ? assignee.id : null,
        deadline: taskDeadline,
        estimatedHours: hours,
      };
    });

    clean.projects.push({
      name,
      clientName,
      description: text(project?.description),
      managerId: manager ? manager.id : null,
      deadline,
      tasks: cleanTasks,
    });
  });

  return { errors, clean };
}

module.exports = { validateDraft, isRealDate };
