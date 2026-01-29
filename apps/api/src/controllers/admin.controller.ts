import { prisma } from "../db/prisma.js";

export async function metrics(_req: any, res: any) {
  const [users, tickets] = await Promise.all([
    prisma.user.count(),
    prisma.ticket.count()
  ]);

  const byStatus = await prisma.ticket.groupBy({
    by: ["status"],
    _count: { status: true }
  });

  res.json({
    users,
    tickets,
    byStatus: byStatus.map((s: any) => ({ status: s.status, count: s._count.status }))
  });
}

export async function auditLogs(req: any, res: any) {
  const limit = Math.min(Number(req.query.limit || 50), 200);
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit
  });
  res.json({ logs });
}

export async function tickets(_req: any, res: any) {
  const tickets = await prisma.ticket.findMany({
    orderBy: { updatedAt: "desc" },
    take: 50
  });
  res.json({ tickets });
}