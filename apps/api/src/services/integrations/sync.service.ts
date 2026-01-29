import { prisma } from "../../db/prisma.js";
import { createGlpiTicket } from "./glpi.client.js";
import { createSolmanTicket } from "./solman.client.js";
import { audit } from "../audit/audit.service.js";

const MAX_ATTEMPTS = 8;

export function startSyncWorker() {
  setInterval(async () => {
    const jobs = await prisma.syncJob.findMany({
      where: { status: "PENDING", nextRunAt: { lte: new Date() } },
      take: 5,
      include: { ticket: true }
    });

    for (const job of jobs) {
      await prisma.syncJob.update({ where: { id: job.id }, data: { status: "PROCESSING" } });

      try {
        const ticket = job.ticket;
        const system = job.system;

        const created =
          system === "GLPI"
            ? await createGlpiTicket({ subject: ticket.subject, description: ticket.description })
            : await createSolmanTicket({ subject: ticket.subject, description: ticket.description });

        await prisma.externalTicketRef.create({
          data: {
            ticketId: ticket.id,
            system,
            externalId: created.externalId,
            lastSyncAt: new Date()
          }
        });

        await prisma.syncJob.update({ where: { id: job.id }, data: { status: "DONE" } });

        await audit({
          action: "SYNC_SUCCESS",
          entity: "Ticket",
          entityId: ticket.id,
          meta: { system, externalId: created.externalId }
        });
      } catch (e: any) {
        const attempts = job.attempts + 1;
        const backoffMin = Math.min(60, attempts * 2);
        const nextRun = new Date(Date.now() + backoffMin * 60_000);

        await prisma.syncJob.update({
          where: { id: job.id },
          data: {
            status: attempts >= MAX_ATTEMPTS ? "FAILED" : "PENDING",
            attempts,
            lastError: e?.message || "Sync error",
            nextRunAt: nextRun
          }
        });

        await audit({
          action: "SYNC_FAILED",
          entity: "Ticket",
          entityId: job.ticketId,
          meta: { system: job.system, attempts, error: e?.message }
        });
      }
    }
  }, 3000);
}