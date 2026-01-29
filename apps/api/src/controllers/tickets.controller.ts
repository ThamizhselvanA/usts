import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { aiSuggest } from "../services/ai/aiService.js";
import { ruleBasedClassify } from "../services/ai/routingRules.js";
import { audit } from "../services/audit/audit.service.js";

const createSchema = z.object({
  subject: z.string().min(3).max(140),
  description: z.string().min(10).max(5000)
});

export async function createTicket(req: any, res: any) {
  const user = req.user; // END_USER enforced by route
  const body = createSchema.parse(req.body);

  // Always have a non-null fallback first (fixes "possibly null")
  const fallback = ruleBasedClassify(body);

  let suggested: { category: string; priority: string; targetSystem: string; confidence?: number } = {
    ...fallback,
    confidence: 0.0
  };

  try {
    const ai = await aiSuggest(body);
    suggested = ai;
  } catch {
    // keep fallback
  }

  const agent = await prisma.user.findFirst({ where: { role: "IT_AGENT" } });

  const ticket = await prisma.ticket.create({
    data: {
      subject: body.subject,
      description: body.description,
      category: suggested.category,
      priority: suggested.priority,
      createdById: user.sub,
      assignedToId: agent?.id ?? null,
      isSpam: (suggested as any).isSpam ?? false,
      spamReason: (suggested as any).spamReason ?? null
    }
  });

  await audit({
    actorId: user.sub,
    action: "TICKET_CREATED",
    entity: "Ticket",
    entityId: ticket.id,
    meta: {
      aiConfidence: suggested.confidence ?? 0,
      assignedToId: agent?.id ?? null,
      isSpam: ticket.isSpam,
      spamReason: ticket.spamReason
    }
  });

  // Only enqueue external sync if NOT spam
  if (!ticket.isSpam) {
    await prisma.syncJob.create({
      data: { ticketId: ticket.id, system: suggested.targetSystem }
    });
  }

  res.status(201).json({ ticketId: ticket.id, isSpam: ticket.isSpam });
}

export async function getMyTickets(req: any, res: any) {
  const user = req.user;
  const tickets = await prisma.ticket.findMany({
    where: { createdById: user.sub },
    orderBy: { updatedAt: "desc" }
  });
  res.json({ tickets });
}

export async function getAssignedTickets(req: any, res: any) {
  const user = req.user;
  const tickets = await prisma.ticket.findMany({
    where: { assignedToId: user.sub },
    orderBy: { updatedAt: "desc" }
  });
  res.json({ tickets });
}

export async function getTicketById(req: any, res: any) {
  const user = req.user;
  const id = z.object({ id: z.string().min(1) }).parse(req.params).id;

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: { externalRefs: true }
  });
  if (!ticket) return res.status(404).json({ error: "Not found" });

  const auditLogs = await prisma.auditLog.findMany({
    where: { entity: "Ticket", entityId: id },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  const ticketWithLogs = { ...ticket, auditLogs };

  // access rules per locked roles
  if (user.role === "END_USER" && ticket.createdById !== user.sub) return res.status(403).json({ error: "Forbidden" });
  if (user.role === "IT_AGENT" && ticket.assignedToId !== user.sub) return res.status(403).json({ error: "Forbidden" });

  res.json({ ticket: ticketWithLogs });
}

export async function updateTicketAsAgent(req: any, res: any) {
  const user = req.user; // IT_AGENT enforced
  const params = z.object({ id: z.string().min(1) }).parse(req.params);

  const body = z.object({
    status: z.enum(["OPEN", "IN_PROGRESS", "ON_HOLD", "RESOLVED", "CLOSED", "REOPENED"]),
    note: z.string().max(1000).optional()
  }).parse(req.body);

  const ticket = await prisma.ticket.findUnique({ where: { id: params.id } });
  if (!ticket) return res.status(404).json({ error: "Not found" });
  if (ticket.assignedToId !== user.sub) return res.status(403).json({ error: "Forbidden" });

  const updated = await prisma.ticket.update({
    where: { id: params.id },
    data: { status: body.status }
  });

  await audit({
    actorId: user.sub,
    action: "TICKET_STATUS_UPDATED",
    entity: "Ticket",
    entityId: updated.id,
    meta: { status: body.status, note: body.note ?? null }
  });

  res.json({ ok: true });
}