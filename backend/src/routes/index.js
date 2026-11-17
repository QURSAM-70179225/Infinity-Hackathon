// All API routes in one place. Every route except login and signup needs a valid token.
const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const auth = require("../controllers/authController");
const projects = require("../controllers/projectController");
const transcript = require("../controllers/transcriptController");

const router = express.Router();

router.post("/auth/login", auth.login);
router.post("/auth/signup", auth.signup);
router.get("/auth/me", requireAuth, auth.me);

// Any logged-in user. The access rules decide what each one receives.
router.get("/team", requireAuth, projects.team);
router.get("/projects", requireAuth, projects.list);
router.get("/projects/:id", requireAuth, projects.detail);
router.get("/tasks/mine", requireAuth, projects.myTasks);
router.get("/workload", requireAuth, projects.workloadFor);

// Admin and managers. A manager is limited to their own projects inside the controller.
router.post("/projects/:id/tasks", requireAuth, requireRole("ADMIN", "MANAGER"), projects.addTask);
router.patch("/tasks/:id", requireAuth, requireRole("ADMIN", "MANAGER"), projects.updateTask);

// Admin only.
router.post("/projects", requireAuth, requireRole("ADMIN"), projects.create);
router.patch("/team/:id/role", requireAuth, requireRole("ADMIN"), projects.changeRole);
router.post("/transcript", requireAuth, requireRole("ADMIN"), transcript.createFromTranscript);
router.post("/transcript/save", requireAuth, requireRole("ADMIN"), transcript.saveCorrectedDraft);
router.delete("/projects", requireAuth, requireRole("ADMIN"), projects.reset);

module.exports = router;
