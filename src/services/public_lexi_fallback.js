export function createPublicLexiFallbackService({
  normalizeLexiTypos,
  normalizeLexiReplyText,
  extractLexiIntroducedName,
  extractLexiRequestedService,
  extractLexiTimeFromQuestion,
  resolveLexiDateKeyFromQuestion,
  publicLexiMemoryService,
  publicLexiParsingService,
  publicLexiIntroService,
  publicLexiDiscoveryService,
  publicLexiBookingService,
  publicLexiConversationService,
  publicLexiContextualService,
  publicLexiFaqService
} = {}) {
  async function buildFallbackReply(message, business, history = [], memory = {}) {
    const q = String(message || "").trim();
    const qLower = normalizeLexiTypos(q.toLowerCase());
    const bizName = String(business?.name || "the salon").trim() || "the salon";
    const services = Array.isArray(business?.services) ? business.services.slice(0, 6) : [];
    const serviceNames = services.map((service) => String(service?.name || "").trim()).filter(Boolean);
    const serviceExamples = serviceNames.length ? serviceNames.slice(0, 4).join(", ") : "haircuts, colour, barber services, and beauty treatments";
    const safeHistory = Array.isArray(history) ? history : [];
    const safeMemory = publicLexiMemoryService.normalizeLexiConversationMemory(memory);
    const priorMessages = safeHistory
      .filter((entry) => entry && typeof entry.content === "string" && (entry.role === "user" || entry.role === "assistant"))
      .slice(-8);
    const lastAssistantText = String([...priorMessages].reverse().find((entry) => entry.role === "assistant")?.content || "");
    const recentUserText = priorMessages
      .filter((entry) => entry.role === "user")
      .slice(-4)
      .map((entry) => String(entry.content || ""))
      .join(" ");
    const introducedName = extractLexiIntroducedName(q);
    const currentDateKey = resolveLexiDateKeyFromQuestion(qLower);
    const currentTimeHint = extractLexiTimeFromQuestion(qLower);
    const memoryDateKey = resolveLexiDateKeyFromQuestion(safeMemory.date);
    const memoryTimeHint = extractLexiTimeFromQuestion(safeMemory.time);
    const recentDateKey = currentDateKey || memoryDateKey || resolveLexiDateKeyFromQuestion(recentUserText);
    const recentTimeHint = currentTimeHint || memoryTimeHint || extractLexiTimeFromQuestion(recentUserText);
    const currentPhone = publicLexiParsingService.extractLexiPhoneFromText(q);
    const currentName = publicLexiParsingService.extractLexiNameFromDetails(q);
    const currentEmail = String((q.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i) || [])[0] || "").trim().toLowerCase();
    const serviceReplyHint = extractLexiRequestedService(q, business)
      || (safeMemory.service ? { name: safeMemory.service, matched: "memory-service" } : null)
      || extractLexiRequestedService(recentUserText, business);
    const hasPendingBookingContext = Boolean((safeMemory.businessId || business?.id) && serviceReplyHint?.name && recentDateKey && recentTimeHint);
    const draftSummary = publicLexiMemoryService.buildLexiDraftSummary({
      ...safeMemory,
      businessName: safeMemory.businessName || bizName,
      service: serviceReplyHint?.name || safeMemory.service,
      date: recentDateKey || safeMemory.date,
      time: recentTimeHint || safeMemory.time
    }, bizName);
    const bookingDraft = publicLexiMemoryService.buildLexiBookingDraftState({
      business,
      memory: safeMemory,
      serviceReplyHint,
      recentDateKey,
      recentTimeHint,
      currentName,
      currentPhone,
      currentEmail
    });

    const introReply = publicLexiIntroService.buildIntroReply({
      q,
      introducedName,
      hasPendingBookingContext
    });
    if (introReply) {
      return introReply;
    }

    const discoveryReply = await publicLexiDiscoveryService.maybeBuildLexiBusinessDiscoveryReply({
      message: q,
      qLower,
      business,
      serviceReplyHint
    });
    if (discoveryReply) {
      return discoveryReply;
    }

    const draftDrivenReply = await publicLexiBookingService.maybeBuildLexiBookingReply({
      qLower,
      draft: bookingDraft,
      business,
      lastAssistantText
    });
    if (draftDrivenReply) {
      return draftDrivenReply;
    }

    const conversationReply = await publicLexiConversationService.buildConversationReply({
      q,
      qLower,
      business,
      bizName,
      introducedName,
      hasPendingBookingContext,
      serviceReplyHint,
      recentDateKey,
      recentTimeHint,
      safeMemory,
      draftSummary,
      lastAssistantText
    });
    if (conversationReply) {
      return conversationReply;
    }

    const contextualReply = await publicLexiContextualService.buildContextualReply({
      q,
      qLower,
      business,
      bizName,
      draftSummary,
      recentDateKey,
      recentTimeHint,
      serviceReplyHint
    });
    if (contextualReply) {
      return contextualReply;
    }

    const serviceGuidanceFaqReply = publicLexiFaqService.buildServiceGuidanceFaqReply({
      qLower,
      bizName,
      serviceExamples,
      business
    });
    if (serviceGuidanceFaqReply) {
      return serviceGuidanceFaqReply;
    }

    const generalFaqReply = publicLexiFaqService.buildGeneralPublicLexiFaqReply({
      qLower,
      bizName,
      business
    });
    if (generalFaqReply) {
      return generalFaqReply;
    }

    return "Tell me what you need, and I'll keep it simple. You can ask about products, services, bookings, availability, customer access, or the business side of the app.";
  }

  async function buildFallbackReplySafe(message, business, history = [], memory = {}) {
    try {
      return normalizeLexiReplyText(await buildFallbackReply(message, business, history, memory), { maxSentences: 2, maxChars: 320 });
    } catch (error) {
      console.error("Lexi fallback reply error:", error?.message || error);
      return "I can still help. I hit a temporary issue just now, so ask again or tell me the service and date you want.";
    }
  }

  return {
    buildFallbackReply,
    buildFallbackReplySafe
  };
}
