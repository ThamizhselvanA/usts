
import { prisma } from "../../db/prisma.js";

export async function audit(params: {
  actorId?: string;
  action: string;
  entity: string;
  entityId?: string;
  meta?: any;
}) {
  return prisma.auditLog.create({
    data: {
      actorId: params.actorId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      meta: params.meta ?? undefined
    }
  });
}
