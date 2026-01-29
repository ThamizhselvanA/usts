import { env } from "../../config/env.js";
import { ruleBasedClassify } from "./routingRules.js";

export async function aiSuggest(input: { subject: string; description: string }) {
  if (!env.aiEnabled) throw new Error("AI disabled");

  // Stub “AI”: you can replace with real model later.
  // Keep it assistive: return suggestions only.
  const rules = ruleBasedClassify(input);
  return {
    category: rules.category,
    priority: rules.priority,
    targetSystem: rules.targetSystem,
    confidence: 0.65
  };
}

