export function createPublicLexiDiscoveryService({
  searchPublicSubscribedBusinesses,
  extractLexiLocationHint,
  inferBusinessTypeFromLexiService
} = {}) {
  async function maybeBuildLexiBusinessDiscoveryReply({
    message = "",
    qLower = "",
    business = null,
    serviceReplyHint = null
  } = {}) {
    const location = extractLexiLocationHint(message);
    const requestedService = String(serviceReplyHint?.name || "").trim();
    const inferredType = inferBusinessTypeFromLexiService(requestedService, qLower);
    const wantsDiscovery =
      /(looking for|find me|find a|recommend|who does|who can do|where can i get|which salon|which barber|which beauty|best salon|best barber|best beauty|in my area|near me|near|around)/.test(
        qLower
      );
    const hasDiscoveryContext = Boolean(location || wantsDiscovery);
    if (!hasDiscoveryContext) return null;
    if (!requestedService && !inferredType && !/(salon|barber|barbershop|beauty)/.test(qLower)) return null;

    const results = await searchPublicSubscribedBusinesses({
      location,
      service: requestedService,
      businessType: inferredType,
      limit: 4
    });

    if (!results.length) {
      if (location && requestedService) {
        return `I couldn't find a subscribed business for ${requestedService} near ${location} right now. If you want, tell me a nearby area or I can suggest another similar service to search for.`;
      }
      if (location) {
        return `I couldn't find a strong subscribed match near ${location} yet. Tell me the service or style you want, and I'll narrow it down properly.`;
      }
      if (requestedService) {
        return `I can help you choose the right subscribed business for ${requestedService}. Tell me the area you want, and I'll suggest the best matches.`;
      }
      return "Tell me the service or style you want and the area that suits you, and I'll suggest subscribed businesses that fit.";
    }

    const summary = results
      .map((row) => {
        const topServices = Array.isArray(row.services)
          ? row.services
              .slice(0, 2)
              .map((service) => service.name)
              .filter(Boolean)
              .join(", ")
          : "";
        return `${row.name} (${row.city})${topServices ? ` - ${topServices}` : ""}`;
      })
      .join(" | ");

    if (requestedService && location) {
      return `For ${requestedService} near ${location}, the strongest subscribed matches I can see are ${summary}. Tell me which one feels right, and I'll help with availability.`;
    }
    if (requestedService) {
      return `For ${requestedService}, the strongest subscribed matches I can see are ${summary}. Tell me the area you want or which one you prefer, and I'll take it forward.`;
    }
    return `The strongest subscribed matches I can see are ${summary}. Tell me the service or look you want, and I'll narrow it down properly.`;
  }

  return {
    maybeBuildLexiBusinessDiscoveryReply
  };
}
