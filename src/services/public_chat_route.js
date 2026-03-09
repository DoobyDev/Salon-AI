export function createPublicChatRouteService({
  openai,
  openAiModel = "gpt-4o-mini",
  isOpenAiQuotaCircuitActive,
  clearOpenAiQuotaCircuit,
  normalizeLexiReplyText,
  formatDisplayDateWithWeekdayGb,
  isLexiRestrictedDataRequest,
  lexiRestrictedDataReply,
  publicLexiMemoryService,
  publicChatContextService,
  publicLexiFallbackService,
  writeAuditLog,
  getPublicChatToolDefinitions,
  publicChatPromptService,
  publicChatToolsService
} = {}) {
  async function handlePublicChatRequest(req) {
    const userMessage = String(req.body?.message || "").trim();
    const history = Array.isArray(req.body?.history) ? req.body.history : [];
    const memory = publicLexiMemoryService.normalizeLexiConversationMemory(req.body?.memory);
    const businessId = String(req.body?.businessId || "").trim();
    const canUseOpenAi = Boolean(openai) && !isOpenAiQuotaCircuitActive();

    if (!userMessage) {
      return {
        business: null,
        statusCode: 400,
        body: { error: "Message is required." }
      };
    }

    if (isLexiRestrictedDataRequest(userMessage, { role: "public" })) {
      return {
        business: null,
        statusCode: 200,
        body: {
          reply: lexiRestrictedDataReply("app or business", { role: "public" })
        }
      };
    }

    const userMessageLower = userMessage.toLowerCase();
    if (/(what('s| is)?\s+(the\s+)?date\b|today'?s date|what day is it)/i.test(userMessageLower)) {
      const now = new Date();
      return {
        business: null,
        statusCode: 200,
        body: { reply: `Today is ${formatDisplayDateWithWeekdayGb(now.toISOString())}.` }
      };
    }
    if (/(what('s| is)?\s+(the\s+)?time\b|current time|time is it)/i.test(userMessageLower)) {
      const now = new Date();
      const formattedTime = now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit"
      });
      return {
        business: null,
        statusCode: 200,
        body: { reply: `The time is ${formattedTime}.` }
      };
    }

    const business = await publicChatContextService.resolvePublicChatBusiness(businessId);

    if (!business && !canUseOpenAi) {
      return {
        business: null,
        statusCode: 200,
        body: {
          reply: "Tell me the salon, barber, or beauty business name, or just send the area you want, and I'll look for subscribed businesses and available slots.",
          fallback: true,
          fallbackMode: isOpenAiQuotaCircuitActive() ? "quota" : "local"
        }
      };
    }

    if (!business) {
      return {
        business: null,
        statusCode: 200,
        body: {
          reply: await publicChatContextService.buildNoBusinessPublicChatReply(userMessage)
        }
      };
    }

    if (!canUseOpenAi) {
      return {
        business,
        statusCode: 200,
        body: {
          reply: await publicLexiFallbackService.buildFallbackReplySafe(userMessage, business, history, memory),
          fallback: true,
          fallbackMode: isOpenAiQuotaCircuitActive() ? "quota" : "local"
        }
      };
    }

    await writeAuditLog({
      actorRole: "anonymous",
      action: "chat.request",
      entityType: "chat",
      metadata: { businessId: business.id }
    });

    const completion = await openai.chat.completions.create({
      model: openAiModel,
      temperature: 0.2,
      max_tokens: 280,
      messages: publicChatPromptService.buildPublicChatMessages({
        business,
        history,
        userMessage
      }),
      tools: getPublicChatToolDefinitions(),
      tool_choice: "auto"
    });

    const choice = completion.choices?.[0]?.message;
    clearOpenAiQuotaCircuit();

    if (choice?.tool_calls?.length) {
      const call = choice.tool_calls[0];
      const toolResponse = await publicChatToolsService.handlePublicChatToolCall(call, { business });
      if (toolResponse) {
        return {
          business,
          statusCode: toolResponse.statusCode || 200,
          body: toolResponse.body || {}
        };
      }
    }

    return {
      business,
      statusCode: 200,
      body: {
        reply: normalizeLexiReplyText(choice?.content || "I can help you book an appointment.", { maxSentences: 2, maxChars: 320 })
      }
    };
  }

  return {
    handlePublicChatRequest
  };
}
