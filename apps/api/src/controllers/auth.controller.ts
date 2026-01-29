import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../db/prisma.js";
import { env } from "../config/env.js";
import { audit } from "../services/audit/audit.service.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

function ensureOrgEmail(email: string) {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!env.orgDomain) return;
  if (domain !== env.orgDomain.toLowerCase()) {
    const err: any = new Error("Organization email required");
    err.status = 403;
    throw err;
  }
}

function signAccess(user: { id: string; email: string; role: any }) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    env.jwtAccessSecret,
    { expiresIn: `${env.jwtAccessTtlMin}m` }
  );
}

async function signRefresh(userId: string) {
  const jti = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + env.jwtRefreshTtlDays * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({ data: { id: jti, userId, expiresAt } });

  const token = jwt.sign({ sub: userId, jti }, env.jwtRefreshSecret, {
    expiresIn: `${env.jwtRefreshTtlDays}d`
  });

  return { token, jti, expiresAt };
}

export async function login(req: any, res: any) {
  const body = loginSchema.parse(req.body);
  ensureOrgEmail(body.email);

  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(body.password, user.password);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const accessToken = signAccess(user);
  const refresh = await signRefresh(user.id);

  await audit({ actorId: user.id, action: "LOGIN", entity: "User", entityId: user.id });

  res.json({
    accessToken,
    refreshToken: refresh.token,
    user: { id: user.id, email: user.email, role: user.role }
  });
}

export async function refresh(req: any, res: any) {
  const schema = z.object({ refreshToken: z.string().min(20) });
  const { refreshToken } = schema.parse(req.body);

  let payload: any;
  try {
    payload = jwt.verify(refreshToken, env.jwtRefreshSecret);
  } catch {
    return res.status(401).json({ error: "Invalid refresh token" });
  }

  const tokenRow = await prisma.refreshToken.findUnique({ where: { id: payload.jti } });
  if (!tokenRow || tokenRow.revokedAt) return res.status(401).json({ error: "Refresh revoked" });
  if (tokenRow.expiresAt < new Date()) return res.status(401).json({ error: "Refresh expired" });

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) return res.status(401).json({ error: "User not found" });

  const accessToken = signAccess(user);
  res.json({ accessToken, user: { id: user.id, email: user.email, role: user.role } });
}

export async function register(req: any, res: any) {
  const body = loginSchema.parse(req.body); // reuse login schema (email/pass)
  ensureOrgEmail(body.email);

  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) return res.status(409).json({ error: "User already exists" });

  const hash = await bcrypt.hash(body.password, 10);
  const user = await prisma.user.create({
    data: { email: body.email, password: hash }
  });

  const accessToken = signAccess(user);
  const refresh = await signRefresh(user.id);

  await audit({ actorId: user.id, action: "REGISTER", entity: "User", entityId: user.id });

  res.status(201).json({
    accessToken,
    refreshToken: refresh.token,
    user: { id: user.id, email: user.email, role: user.role }
  });
}

export async function me(req: any, res: any) {
  const user = req.user;
  res.json({ user });
}

export async function logout(req: any, res: any) {
  const schema = z.object({ refreshToken: z.string().min(20) });
  const { refreshToken } = schema.parse(req.body);

  try {
    const payload: any = jwt.verify(refreshToken, env.jwtRefreshSecret);
    await prisma.refreshToken.update({
      where: { id: payload.jti },
      data: { revokedAt: new Date() }
    });
    await audit({ actorId: payload.sub, action: "LOGOUT", entity: "User", entityId: payload.sub });
  } catch {
    // ignore token parsing errors (logout should be idempotent)
  }

  res.json({ ok: true });
}