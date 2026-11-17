// Kanban board tests. Run with: npm test
// They use the local file database in a temporary file, so they never touch real data,
// and a stand-in AI reply, so they need no API key and no internet.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");

process.env.DB_MODE = "local";
process.env.LOCAL_DB_FILE = path.join(os.tmpdir(), `novaworks-board-test-${process.pid}.json`);
process.env.SESSION_SECRET = "test-secret";
process.env.GROQ_API_KEY = "test";
delete process.env.GROQ_MODEL;

const db = require("../src/services/db");
const app = require("../src/index");
const { DEMO_USERS, DEMO_PASSWORD } = require("../src/utils/demoUsers");
const { hashPassword } = require("../src/utils/password");

const realFetch = global.fetch;
let aiDraft = { projects: [] };
let server, base;
const tokens = {};
const ids = {}; // user ids by first name
const taskIds = {}; // task ids by title

async function call(method, route, who, body) {
  const response = await realFetch(base + route, {
    method,
    headers: { "Content-Type": "application/json", ...(who ? { Authorization: `Bearer ${tokens[who]}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: response.status, data: await response.json() };
}

const statusOf = async (title) => (await db.listTasks()).find((t) => t.id === taskIds[title]);

test.before(async () => {
  fs.rmSync(process.env.LOCAL_DB_FILE, { force: true });
  // Stand-in for the AI provider: answers with whatever draft the test sets.
  global.fetch = async (url, options) => {
    url = String(url);
    if (url.startsWith("http://127.0.0.1")) return realFetch(url, options);
    if (url.endsWith("/models")) return new Response(JSON.stringify({ data: [{ id: "llama-3.3-70b-versatile" }] }));
    return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(aiDraft) } }] }));
  };

  await db.upsertUsers(DEMO_USERS.map((u) => ({ ...u, password_hash: hashPassword(DEMO_PASSWORD) })));
  for (const user of await db.listUsers()) ids[user.name.split(" ")[0]] = user.id;

  // Two approved projects: Ayesha manages one, Bilal the other.
  const task = (title, assignee, hours) => ({ title, description: "scope", assigneeId: ids[assignee], deadline: "2026-10-15", estimatedHours: hours });
  await db.saveDraft({
    projects: [
      { name: "UrbanCart Website", clientName: "UrbanCart", description: "d", managerId: ids.Ayesha, deadline: "2026-10-20", tasks: [task("Product catalog UI", "Ali", 12), task("Product and cart APIs", "Hamza", 14)] },
      { name: "QuickServe Mobile App", clientName: "QuickServe", description: "d", managerId: ids.Bilal, deadline: "2026-10-24", tasks: [task("Login and profile screens", "Sara", 8), task("Booking and account APIs", "Hamza", 16)] },
    ],
  });
  for (const t of await db.listTasks()) taskIds[t.title] = t.id;

  await new Promise((resolve) => { server = app.listen(0, "127.0.0.1", resolve); });
  base = `http://127.0.0.1:${server.address().port}/api`;
  for (const name of ["admin", "ayesha", "bilal", "ali", "hamza", "sara"]) {
    const login = await realFetch(`${base}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: `${name}@novaworks.example`, password: DEMO_PASSWORD }) });
    tokens[name] = (await login.json()).token;
  }
});

test.after(() => {
  global.fetch = realFetch;
  server.close();
  fs.rmSync(process.env.LOCAL_DB_FILE, { force: true });
});

test("1. admin can move any task to any status", async () => {
  for (const status of ["in_progress", "done", "todo"]) {
    const result = await call("PATCH", `/tasks/${taskIds["Login and profile screens"]}/status`, "admin", { status });
    assert.equal(result.status, 200);
    assert.equal(result.data.task.status, status);
  }
});

test("2. manager can move a task in their own project", async () => {
  const result = await call("PATCH", `/tasks/${taskIds["Product catalog UI"]}/status`, "ayesha", { status: "in_progress" });
  assert.equal(result.status, 200);
  assert.equal((await statusOf("Product catalog UI")).status, "in_progress");
});

test("3. manager moving a task in another manager's project gets 404 and nothing changes", async () => {
  const before = await statusOf("Login and profile screens");
  const result = await call("PATCH", `/tasks/${taskIds["Login and profile screens"]}/status`, "ayesha", { status: "done" });
  assert.equal(result.status, 404);
  assert.deepEqual(await statusOf("Login and profile screens"), before);
});

test("4. agent can move their own task", async () => {
  const result = await call("PATCH", `/tasks/${taskIds["Product and cart APIs"]}/status`, "hamza", { status: "in_progress" });
  assert.equal(result.status, 200);
  assert.equal((await statusOf("Product and cart APIs")).status, "in_progress");
});

test("5. agent moving another agent's task gets 404 and nothing changes", async () => {
  const before = await statusOf("Product and cart APIs");
  const result = await call("PATCH", `/tasks/${taskIds["Product and cart APIs"]}/status`, "ali", { status: "done" });
  assert.equal(result.status, 404);
  assert.deepEqual(await statusOf("Product and cart APIs"), before);
});

test("6. invalid status returns 400 and nothing changes", async () => {
  const before = await statusOf("Product catalog UI");
  const result = await call("PATCH", `/tasks/${taskIds["Product catalog UI"]}/status`, "ali", { status: "blocked" });
  assert.equal(result.status, 400);
  assert.deepEqual(await statusOf("Product catalog UI"), before);
});

test("7. PATCH with extra fields returns 400 and nothing changes", async () => {
  const before = await statusOf("Product catalog UI");
  const result = await call("PATCH", `/tasks/${taskIds["Product catalog UI"]}/status`, "admin", { status: "done", title: "Hacked", assignee_id: ids.Sara });
  assert.equal(result.status, 400);
  assert.deepEqual(await statusOf("Product catalog UI"), before);
});

test("8. moving to done sets completed_at, moving out clears it", async () => {
  const id = taskIds["Booking and account APIs"];
  await call("PATCH", `/tasks/${id}/status`, "hamza", { status: "done" });
  const done = await statusOf("Booking and account APIs");
  assert.equal(done.status, "done");
  assert.ok(done.completed_at, "completed_at should be set");
  assert.ok(!Number.isNaN(Date.parse(done.completed_at)));

  await call("PATCH", `/tasks/${id}/status`, "hamza", { status: "in_progress" });
  const reopened = await statusOf("Booking and account APIs");
  assert.equal(reopened.status, "in_progress");
  assert.equal(reopened.completed_at, null);
});

test("9. board returns only the tasks the logged-in user may see", async () => {
  const titles = (board) => [...board.todo, ...board.in_progress, ...board.done].map((t) => t.title).sort();
  const projects = await db.listProjects();
  const urban = projects.find((p) => p.name.startsWith("Urban")).id;
  const quick = projects.find((p) => p.name.startsWith("Quick")).id;

  assert.deepEqual(titles((await call("GET", `/projects/${urban}/board`, "admin")).data.board), ["Product and cart APIs", "Product catalog UI"]);
  assert.deepEqual(titles((await call("GET", `/projects/${urban}/board`, "ayesha")).data.board), ["Product and cart APIs", "Product catalog UI"]);
  assert.equal((await call("GET", `/projects/${quick}/board`, "ayesha")).status, 404);
  // An agent sees only their own task inside a project they work on.
  assert.deepEqual(titles((await call("GET", `/projects/${urban}/board`, "ali")).data.board), ["Product catalog UI"]);
  assert.equal((await call("GET", `/projects/${quick}/board`, "ali")).status, 404);
  // My tasks: only tasks assigned to the user, across projects.
  assert.deepEqual(titles((await call("GET", "/board/my-tasks", "hamza")).data.board), ["Booking and account APIs", "Product and cart APIs"]);
  assert.deepEqual(titles((await call("GET", "/board/my-tasks", "admin")).data.board), []);
  assert.equal((await call("GET", "/board/my-tasks")).status, 401);
});

test("10. draft items that were not approved never appear on the board", async () => {
  // This draft would put Hamza above 40 hours, so it is held for review and not saved.
  aiDraft = { projects: [{ name: "Draft Project", clientName: "X", description: "d", managerId: "PM01", deadline: "2026-10-30", tasks: [{ title: "Draft only task", description: "d", assigneeId: "DEV02", deadline: "2026-10-25", estimatedHours: 20 }] }] };
  const held = await call("POST", "/transcript", "admin", { transcript: "Ayesha: planning meeting. ".repeat(10) });
  assert.equal(held.status, 409);

  const mine = (await call("GET", "/board/my-tasks", "hamza")).data.board;
  const all = [...mine.todo, ...mine.in_progress, ...mine.done].map((t) => t.title);
  assert.ok(!all.includes("Draft only task"));
  assert.ok(!(await db.listProjects()).some((p) => p.name === "Draft Project"));
});

test("11. a status change is still there when the board is loaded again", async () => {
  await call("PATCH", `/tasks/${taskIds["Product catalog UI"]}/status`, "ali", { status: "done" });
  const board = (await call("GET", "/board/my-tasks", "ali")).data.board;
  assert.deepEqual(board.done.map((t) => t.title), ["Product catalog UI"]);
  assert.equal(board.todo.length + board.in_progress.length, 0);
  // Read straight from the stored file as well.
  const stored = JSON.parse(fs.readFileSync(process.env.LOCAL_DB_FILE, "utf8")).tasks.find((t) => t.id === taskIds["Product catalog UI"]);
  assert.equal(stored.status, "done");
});
