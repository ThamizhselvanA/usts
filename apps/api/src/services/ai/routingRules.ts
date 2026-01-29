import { detectSpam } from "./spamFilter.js";

export function ruleBasedClassify(input: { subject: string; description: string }) {
  const text = `${input.subject}\n${input.description}`.toLowerCase();

  const spam = detectSpam(input);

  let category = "General IT";
  if (text.includes("wifi") || text.includes("network") || text.includes("lan")) category = "Network";
  if (text.includes("laptop") || text.includes("printer") || text.includes("mouse")) category = "Hardware";
  if (text.includes("sap") || text.includes("solman")) category = "Enterprise App";

  let priority: "Low" | "Medium" | "High" | "Critical" = "Medium";
  if (text.includes("down") || text.includes("outage")) priority = "High";
  if (text.includes("critical") || text.includes("sev1")) priority = "Critical";

  // Decide target system (stub logic)
  const targetSystem = category === "Enterprise App" ? "SOLMAN" : "GLPI";

  return { category, priority, targetSystem, isSpam: spam.isSpam, spamReason: spam.reason };
}
