const db = require("../services/db");
const ai = require("../services/ai");
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

// Validates a draft and saves it only if everything is valid. All or nothing.
async function validateAndSave(draft, users) {
  const { errors, clean } = validateDraft(draft, users);
  if (errors.length) {
    throw httpError(422, "Some details could not be resolved. Nothing was saved.", { errors, draft });
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
    const result = await validateAndSave(draft, users);
    res.status(201).json({ ...result, provider, model });
  } finally {
    busy = false;
  }
}

// POST /api/transcript/save  { draft }   (admin only)
// Used after the admin corrects a draft that failed validation. It is validated again.
async function saveCorrectedDraft(req, res) {
  if (busy) throw httpError(409, "A transcript is already being processed. Please wait.");
  busy = true;
  try {
    const users = await db.listUsers();
    res.status(201).json(await validateAndSave(req.body?.draft, users));
  } finally {
    busy = false;
  }
}

module.exports = { createFromTranscript, saveCorrectedDraft };
