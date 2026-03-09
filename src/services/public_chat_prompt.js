export function createPublicChatPromptService({
  buildPublicLexiSystemPrompt,
  mapBusiness
} = {}) {
  function buildPublicChatMessages({ business, history = [], userMessage = "" } = {}) {
    const safeHistory = Array.isArray(history) ? history : [];
    return [
      {
        role: "system",
        content: buildPublicLexiSystemPrompt(business)
      },
      {
        role: "system",
        content: `Business profile:\n${JSON.stringify(mapBusiness(business, { includeSlots: false }), null, 2)}`
      },
      ...safeHistory.filter((entry) => entry && (entry.role === "user" || entry.role === "assistant") && typeof entry.content === "string"),
      { role: "user", content: String(userMessage || "") }
    ];
  }

  return {
    buildPublicChatMessages
  };
}
