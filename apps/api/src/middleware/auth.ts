import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export type JwtUser = { sub: string; email: string; role: "END_USER" | "IT_AGENT" | "ADMIN" };

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });

  try {
    const token = header.slice("Bearer ".length);
    const payload = jwt.verify(token, env.jwtAccessSecret) as JwtUser;
    (req as any).user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid/expired token" });
  }
}