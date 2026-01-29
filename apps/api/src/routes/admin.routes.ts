import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { metrics, auditLogs, tickets } from "../controllers/admin.controller.js";

const r = Router();
r.get("/metrics", requireAuth, requireRole(["ADMIN"]), asyncHandler(metrics));
r.get("/audit", requireAuth, requireRole(["ADMIN"]), asyncHandler(auditLogs));
r.get("/tickets", requireAuth, requireRole(["ADMIN"]), asyncHandler(tickets));
export default r;
