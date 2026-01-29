import { env } from "../../config/env.js";

export async function createSolmanTicket(_t: { subject: string; description: string }) {
  if (!env.solmanEnabled) throw new Error("Solman down/disabled");
  return { externalId: `SOL-${Math.floor(Math.random() * 100000)}` };
}