
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import * as tickets from "../controllers/tickets.controller.js";

const r = Router();

r.post("/", requireAuth, requireRole(["END_USER"]), asyncHandler(tickets.createTicket));
r.get("/mine", requireAuth, requireRole(["END_USER"]), asyncHandler(tickets.getMyTickets));

r.get("/assigned", requireAuth, requireRole(["IT_AGENT"]), asyncHandler(tickets.getAssignedTickets));

r.get("/:id", requireAuth, requireRole(["END_USER", "IT_AGENT", "ADMIN"]), asyncHandler(tickets.getTicketById));
r.put("/:id", requireAuth, requireRole(["IT_AGENT"]), asyncHandler(tickets.updateTicketAsAgent));

export default r;
