
const SPAM_KEYWORDS = [
    "win", "prize", "winner", "lottery", "gift card", "free money", "viagra", "cialis",
    "dating", "casino", "slots", "bitcoin", "crypto", "investment", "guaranteed profit",
    "verify your account", "update your billing", "suspended account", "urgent action required",
    "buy now", "click here", "subscribe", "limited time offer"
];

const SPAM_PATTERNS = [
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i, // emails (simple)
    /https?:\/\/[^\s]+/i, // urls
];

export function detectSpam(input: { subject: string; description: string }): { isSpam: boolean; reason?: string } {
    const text = `${input.subject} ${input.description}`.toLowerCase();

    // Check for keywords
    for (const keyword of SPAM_KEYWORDS) {
        if (text.includes(keyword.toLowerCase())) {
            return { isSpam: true, reason: `Keyword match: ${keyword}` };
        }
    }

    // Check for high density of links or special characters could be added here
    const urlMatches = text.match(/https?:\/\//g) || [];
    if (urlMatches.length > 3) {
        return { isSpam: true, reason: "Too many URLs" };
    }

    return { isSpam: false };
}
