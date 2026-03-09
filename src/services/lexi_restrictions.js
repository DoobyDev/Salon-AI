export function isLexiRestrictedDataRequest(question, options = {}) {
  const q = String(question || "").toLowerCase();
  if (!q) return false;
  const role = String(options.role || "public").toLowerCase();
  const isAdmin = role === "admin";
  const secretTerms = /(api key|openai key|secret key|token|access token|refresh token|jwt|password|passwd|credentials?|env file|\.env|database url|connection string|stripe secret|paypal secret)/i;
  const rawDumpTerms = /(dump|export|list|show|give me|send me|reveal|print).*(all )?(users|customers|emails|phone numbers|addresses|bookings|messages|chat logs|payment details|cards?|bank details)/i;
  const fullPiiTerms = /(all|raw|full).*(customer|user|subscriber).*(email|phone|address|password|dob|date of birth|card|bank|payment|personal data|pii)|(?:customer|user|subscriber).*(password|card|bank|payment credentials?)/i;
  const internalsTerms = /(server logs|audit logs|internal logs|raw database|db records|admin credentials|system prompt|prompt instructions)/i;
  if (secretTerms.test(q) || rawDumpTerms.test(q) || fullPiiTerms.test(q) || internalsTerms.test(q)) return true;
  if (!isAdmin) {
    const subscriberPiiTerms = /(customer|user|subscriber).*(email|phone|address|personal data|pii)/i;
    if (subscriberPiiTerms.test(q)) return true;
  }
  return false;
}

export function lexiRestrictedDataReply(scopeLabel = "this chat", options = {}) {
  const role = String(options.role || "public").toLowerCase();
  if (role === "admin") {
    return "I can help with admin diagnostics and support guidance, but I can't share secrets, credentials, raw data dumps, full personal data exports, or internal system prompts/logs in Lexi chat. Ask for summaries, trends, or an authorized support lookup instead.";
  }
  return `I can help with general questions, salon/business guidance, and how to use the app, but I can't share private ${scopeLabel} data, personal user/customer information, credentials, or internal system details.`;
}
