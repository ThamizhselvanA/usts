import { env } from "../../config/env.js";

export async function createGlpiTicket(_t: { subject: string; description: string }) {
  if (!env.glpiEnabled) throw new Error("GLPI down/disabled");
  // pretend GLPI returns an ID
  return { externalId: `GLPI-${Math.floor(Math.random() * 100000)}` };
}
