import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function upsertUser(email: string, role: Role, password: string) {
  const hash = await bcrypt.hash(password, 10);
  return prisma.user.upsert({
    where: { email },
    update: { role, password: hash },
    create: { email, role, password: hash },
  });
}

async function main() {
  await upsertUser("admin@powergrid.com", Role.ADMIN, "Admin123!");
  await upsertUser("agent@powergrid.com", Role.IT_AGENT, "Agent123!");
  await upsertUser("user@powergrid.com", Role.END_USER, "User123!");
  console.log("Seed complete");
}

main().finally(async () => prisma.$disconnect());