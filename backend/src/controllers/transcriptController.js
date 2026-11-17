const db = require("../services/db");
const ai = require("../services/ai");
const workload = require("../services/workload");
const { validateDraft } = require("../utils/validateDraft");
const { httpError } = require("../utils/httpError");

// Stops a second request while one is still running, so a double click cannot create duplicates.
let busy = false;

// The AI directory: who exists in the company. No emails and no passwords are sent to the AI.
function toDirectory(users) {
  return users
    .filter((u) => u.role !== "ADMIN")
    .map(({ ref, name, role, specialization, skills }) => ({ ref, name, role, specialization, skills }));
}

// The validated draft with directory codes (PM01, DEV01) instead of database ids,
// so the admin can review and change it on screen.
function withRefs(clean, users) {
  const refOf = (id) => users.find((u) => u.id === id).ref;
  return {
    projects: clean.projects.map((project) => ({
      ...project,
      managerId: refOf(project.managerId),
      tasks: project.tasks.map((task) => ({ ...task, assigneeId: refOf(task.assigneeId) })),
    })),
  };
}

// Validates a draft and saves it only if everything is valid. All or nothing.
// Order: 1) people, dates and hours must be valid  2) no developer above 40 hours,
// unless the admin chose to save anyway  3) one transactional save.
async function validateAndSave(draft, users, allowOverload) {
  const { errors, clean } = validateDraft(draft, users);
  if (errors.length) {
    throw httpError(422, "Some details could not be resolved. Nothing was saved.", { errors, draft });
  }

  if (!allowOverload) {
    const { agents, overloaded } = await workload.projectDraftWorkload(clean, users);
    if (overloaded.length) {
      throw httpError(409, "A developer would be above capacity. Nothing was saved.", {
        code: "OVERLOAD",
        capacity: workload.CAPACITY,
        overloaded,
        agents,
        draft: withRefs(clean, users),
      });
    }
  }

  const saved = await db.saveDraft(clean);
  return {
    message: `Created ${saved.projects} projects and ${saved.tasks} tasks.`,
    projects: saved.projects,
    tasks: saved.tasks,
  };
}

// POST /api/transcript  { transcript }   (admin only)
async function createFromTranscript(req, res) {
  const transcript = String(req.body?.transcript || "").trim();
  if (!transcript) throw httpError(400, "Paste the meeting transcript first.");
  if (transcript.length < 80) throw httpError(400, "This transcript is too short to contain projects and tasks.");
  if (busy) throw httpError(409, "A transcript is already being processed. Please wait.");

  busy = true;
  try {
    const users = await db.listUsers();
    const { draft, provider, model } = await ai.generateDraft(transcript, toDirectory(users));
    const result = await validateAndSave(draft, users, false);
    res.status(201).json({ ...result, provider, model });
  } finally {
    busy = false;
  }
}

// POST /api/transcript/save  { draft, allowOverload }   (admin only)
// Used after the admin reviews or corrects a draft. It is validated again on the server.
async function saveCorrectedDraft(req, res) {
  if (busy) throw httpError(409, "A transcript is already being processed. Please wait.");
  busy = true;
  try {
    const users = await db.listUsers();
    res.status(201).json(await validateAndSave(req.body?.draft, users, req.body?.allowOverload === true));
  } finally {
    busy = false;
  }
}

module.exports = { createFromTranscript, saveCorrectedDraft };
