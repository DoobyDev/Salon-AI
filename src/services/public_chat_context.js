export function createPublicChatContextService({
  getPrisma,
  isLexiAppQuestion,
  extractLexiRequestedService,
  publicLexiParsingService,
  publicBusinessSearchService
} = {}) {
  const publicSubscriptionStatuses = ["active", "trialing", "trial", "past_due"];

  function prismaClient() {
    return typeof getPrisma === "function" ? getPrisma() : null;
  }

  async function resolvePublicChatBusiness(businessId = "") {
    const prisma = prismaClient();
    const normalizedBusinessId = String(businessId || "").trim();
    const preferredBusiness =
      (await prisma.business.findFirst({
        where: normalizedBusinessId
          ? {
              id: normalizedBusinessId,
              subscription: { is: { status: { in: publicSubscriptionStatuses } } }
            }
          : {
              subscription: { is: { status: { in: publicSubscriptionStatuses } } }
            },
        include: { services: true, subscription: true },
        orderBy: [{ rating: "desc" }, { createdAt: "desc" }]
      })) || null;

    if (preferredBusiness || normalizedBusinessId) {
      return preferredBusiness;
    }

    return prisma.business.findFirst({
      include: { services: true, subscription: true }
    });
  }

  async function buildNoBusinessPublicChatReply(userMessage = "") {
    const trimmedMessage = String(userMessage || "").trim();
    const userMessageLower = trimmedMessage.toLowerCase();
    const locationHint = publicLexiParsingService.extractLexiLocationHint(trimmedMessage);
    const serviceHint = extractLexiRequestedService(trimmedMessage);

    if (locationHint && serviceHint?.name) {
      const businessType = publicLexiParsingService.inferBusinessTypeFromLexiService(serviceHint.name, userMessageLower);
      const matches = await publicBusinessSearchService.searchPublicSubscribedBusinesses({
        location: locationHint,
        service: serviceHint.name,
        businessType,
        limit: 4
      });
      if (matches.length) {
        const summary = matches.map((row) => `${row.name} (${row.city})`).join(" | ");
        return `For ${serviceHint.name} near ${locationHint}, the strongest subscribed matches I can see are ${summary}. Tell me which one you prefer, and I'll help with availability.`;
      }
    }

    const shortFollowUp = trimmedMessage.split(/\s+/).filter(Boolean).length <= 5;
    const likelyBusinessNameOnly =
      shortFollowUp &&
      !isLexiAppQuestion(userMessageLower) &&
      !/(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{4}-\d{2}-\d{2})/i.test(userMessageLower);

    if (likelyBusinessNameOnly) {
      const matches = await publicBusinessSearchService.searchPublicSubscribedBusinesses({ query: trimmedMessage, limit: 5 });
      if (matches.length) {
        const summary = matches.slice(0, 4).map((row) => `${row.name} (${row.city})`).join(" | ");
        return `I found ${matches.length} subscribed business${matches.length === 1 ? "" : "es"} matching "${trimmedMessage}": ${summary}. Tell me which one you want and what day or date, and I'll check available slots.`;
      }
      return `I couldn't find a subscribed business matching "${trimmedMessage}" right now. If you want, tell me the town or city and I'll search nearby salons, barbers, or beauty businesses.`;
    }

    const looksFinderOrAvailability = /(find|search|salon|barber|beauty|slot|availability|available|free space|book\b|booking|appointment)/i.test(userMessageLower);
    if (looksFinderOrAvailability) {
      return "Start with the business name, for example SLH Cuts, or the area you want, and I'll look for subscribed businesses and available slots.";
    }

    return "I can help with app questions and salon, barber, or beauty guidance right away. If you want availability or booking help, tell me a business name or location and I'll search for subscribed businesses.";
  }

  return {
    resolvePublicChatBusiness,
    buildNoBusinessPublicChatReply
  };
}
