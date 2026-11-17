// Turns a meeting transcript into a draft of projects and tasks using an LLM.
// Main provider: Groq. Backup: OpenRouter. Both use the same OpenAI-style chat API.
const { httpError } = require("../utils/httpError");

const GROQ_URL = "https://api.groq.com/openai/v1";
const OPENROUTER_URL = "https://openrouter.ai/api/v1";

// Tried in this order when GROQ_MODEL is not set. Only models the account really has are used.
const PREFERRED_GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "openai/gpt-oss-120b",
  "moonshotai/kimi-k2-instruct",
  "meta-llama/llama-4-maverick-17b-128e-instruct",
  "qwen/qwen3-32b",
  "llama-3.1-8b-instant",
];

const OUTPUT_SHAPE = `{
  "projects": [
    {
      "name": "Project name",
      "clientName": "Client name",
      "description": "Agreed scope in one or two sentences",
      "managerId": "PM01",
      "deadline": "YYYY-MM-DD",
      "tasks": [
        {
          "title": "Task title as agreed",
          "description": "Agreed task scope",
          "assigneeId": "DEV01",
          "deadline": "YYYY-MM-DD",
          "estimatedHours": 12
        }
      ]
    }
  ]
}`;

function buildMessages(transcript, directory) {
  const system = `You turn a meeting transcript into project and task records for a project management CRM.
Return ONLY one JSON object in the required shape. No markdown, no comments, no extra text.

Rules:
1. Use only the FINAL agreed decisions. When a date, estimate or owner is corrected later in the meeting, use the latest confirmed value and drop the earlier one. If there is a final recap, it has the last word.
2. Create one project for each separate client engagement that was agreed. Never merge projects and never invent a project.
3. Create only the tasks that were explicitly agreed, using the agreed task titles. Do not split one agreed task into several and do not merge separate tasks.
4. Never create tasks for features that were rejected, excluded, out of scope or left for the future.
5. "managerId" and "assigneeId" must be a "ref" code from the team directory. A manager must have role MANAGER. A task owner must have role AGENT.
6. Never invent people. Anyone who is not in the team directory (clients, end users, outside contacts) must not be used. If a required person cannot be matched, use null.
7. Dates use YYYY-MM-DD. If a date has no year, use the year of the meeting date given in the transcript. If a required date is unknown, use null.
8. "estimatedHours" is the final agreed effort in hours, as a number. If unknown, use null.
9. Each description is one or two sentences of the agreed scope, including stated exclusions.

Required shape:
${OUTPUT_SHAPE}`;

  const user = `TEAM DIRECTORY (JSON):
${JSON.stringify(directory, null, 2)}

MEETING TRANSCRIPT:
${transcript}`;

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}

// Pulls the JSON object out of the model's reply, even if it added extra text around it.
function extractJson(reply) {
  const start = reply.indexOf("{");
  const end = reply.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("The AI reply did not contain JSON.");
  return JSON.parse(reply.slice(start, end + 1));
}

async function chat(baseUrl, apiKey, model, messages, jsonMode) {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
    signal: AbortSignal.timeout(60000),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${model} answered ${response.status}: ${body.slice(0, 200)}`);
  }
  const data = await response.json();
  const reply = data?.choices?.[0]?.message?.content;
  if (!reply) throw new Error(`${model} returned an empty reply.`);
  return extractJson(reply);
}

// Asks Groq which models this key can use and keeps our preferred ones, best first.
async function pickGroqModels(apiKey) {
  if (process.env.GROQ_MODEL) return [process.env.GROQ_MODEL];
  try {
    const response = await fetch(`${GROQ_URL}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(10000),
    });
    const data = await response.json();
    const available = new Set((data?.data || []).map((m) => m.id));
    const usable = PREFERRED_GROQ_MODELS.filter((id) => available.has(id));
    if (usable.length) return usable.slice(0, 3);
  } catch {
    // Fall through to the default below.
  }
  return PREFERRED_GROQ_MODELS.slice(0, 2);
}

async function generateDraft(transcript, directory) {
  const messages = buildMessages(transcript, directory);
  const failures = [];

  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    for (const model of await pickGroqModels(groqKey)) {
      // First with strict JSON mode, then without it in case the model does not support it.
      for (const jsonMode of [true, false]) {
        try {
          return { draft: await chat(GROQ_URL, groqKey, model, messages, jsonMode), provider: "Groq", model };
        } catch (err) {
          failures.push(err.message);
        }
      }
    }
  }

  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (openRouterKey) {
    const model = process.env.OPENROUTER_MODEL || "openrouter/free";
    try {
      return { draft: await chat(OPENROUTER_URL, openRouterKey, model, messages, false), provider: "OpenRouter", model };
    } catch (err) {
      failures.push(err.message);
    }
  }

  console.error("AI failures:", failures);
  if (!groqKey && !openRouterKey) throw httpError(500, "No AI key is configured. Add GROQ_API_KEY to backend/.env");
  throw httpError(502, "The AI service could not process the transcript right now. Nothing was saved. Please try again.");
}

module.exports = { generateDraft, buildMessages, extractJson };
