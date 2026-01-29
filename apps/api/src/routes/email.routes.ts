
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { ruleBasedClassify } from "../services/ai/routingRules.js";
import { audit } from "../services/audit/audit.service.js";
import bcrypt from "bcrypt";

const r = Router();

r.post("/email/inbound", async (req, res) => {
  const body = z.object({
    from: z.string().email(),
    subject: z.string().min(3),
    text: z.string().min(3)
  }).parse(req.body);

  // For scaffold: auto-create user if org email (password random)
  const domain = body.from.split("@")[1]?.toLowerCase();
  if (process.env.ORG_DOMAIN && domain !== process.env.ORG_DOMAIN.toLowerCase()) {
    return res.status(403).json({ error: "Org email required" });
  }

  let user = await prisma.user.findUnique({ where: { email: body.from } });
  if (!user) {
    const randomPass = await bcrypt.hash(Math.random().toString(36), 10);
    user = await prisma.user.create({
      data: { email: body.from, password: randomPass, role: "END_USER" }
    });
  }

  const r1 = ruleBasedClassify({ subject: body.subject, description: body.text });
  const agent = await prisma.user.findFirst({ where: { role: "IT_AGENT" } });

  const ticket = await prisma.ticket.create({
    data: {
      subject: body.subject,
      description: body.text,
      category: r1.category,
      priority: r1.priority,
      createdById: user.id,
      assignedToId: agent?.id ?? null
    }
  });

  await prisma.syncJob.create({ data: { ticketId: ticket.id, system: r1.targetSystem } });

  await audit({
    actorId: user.id,
    action: "TICKET_CREATED_VIA_EMAIL",
    entity: "Ticket",
    entityId: ticket.id
  });

  res.json({ ok: true, ticketId: ticket.id });
});

export default r;
