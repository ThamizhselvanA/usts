
import type { Request, Response, NextFunction } from "express";

export function requireRole(allow: Array<"END_USER" | "IT_AGENT" | "ADMIN">) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as { role?: string } | undefined;
    if (!user?.role) return res.status(401).json({ error: "Unauthorized" });
    if (!allow.includes(user.role as any)) return res.status(403).json({ error: "Forbidden" });
    next();
  };
}
