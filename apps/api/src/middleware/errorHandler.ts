import type { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const msg = typeof err?.message === "string" ? err.message : "Server error";
  const status = Number(err?.status || 500);
  res.status(status).json({ error: msg });
}

