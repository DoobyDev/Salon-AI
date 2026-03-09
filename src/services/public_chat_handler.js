export function createPublicChatHandler({
  publicChatRouteService,
  publicChatErrorService,
  publicLexiMemoryService
} = {}) {
  return async function publicChatHandler(req, res) {
    let userMessage = "";
    let business = null;
    let history = [];
    let memory = {};

    try {
      userMessage = String(req.body?.message || "").trim();
      history = Array.isArray(req.body?.history) ? req.body.history : [];
      memory = publicLexiMemoryService.normalizeLexiConversationMemory(req.body?.memory);

      const response = await publicChatRouteService.handlePublicChatRequest(req);
      business = response.business || null;

      return res.status(response.statusCode || 200).json(response.body || {});
    } catch (error) {
      const errorResponse = await publicChatErrorService.handlePublicChatError({
        error,
        business,
        userMessage,
        history,
        memory
      });
      return res.status(errorResponse.statusCode || 500).json(errorResponse.body || {});
    }
  };
}
