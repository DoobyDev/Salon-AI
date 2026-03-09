export function createPublicLexiMemoryService({
  formatLexiBookingDate
} = {}) {
  function normalizeLexiConversationMemory(input = {}) {
    const source = input && typeof input === "object" ? input : {};
    return {
      businessId: String(source.businessId || "").trim(),
      businessName: String(source.businessName || "").trim(),
      service: String(source.service || "").trim(),
      date: String(source.date || "").trim(),
      time: String(source.time || "").trim(),
      name: String(source.name || "").trim(),
      phone: String(source.phone || "").trim(),
      email: String(source.email || "").trim(),
      confirmed: Boolean(source.confirmed)
    };
  }

  function buildLexiDraftSummary(memory, fallbackBusinessName = "the salon") {
    const safeMemory = normalizeLexiConversationMemory(memory);
    const businessName = safeMemory.businessName || fallbackBusinessName;
    const parts = [];
    if (safeMemory.service) parts.push(safeMemory.service);
    if (safeMemory.date) parts.push(`on ${safeMemory.date}`);
    if (safeMemory.time) parts.push(`at ${safeMemory.time}`);
    return {
      businessName,
      summary: parts.join(" ").trim(),
      hasName: Boolean(safeMemory.name),
      hasPhone: Boolean(safeMemory.phone),
      hasEmail: Boolean(safeMemory.email),
      confirmed: Boolean(safeMemory.confirmed)
    };
  }

  function buildLexiBookingDraftState({
    business,
    memory,
    serviceReplyHint,
    recentDateKey,
    recentTimeHint,
    currentName = "",
    currentPhone = "",
    currentEmail = ""
  } = {}) {
    const safeMemory = normalizeLexiConversationMemory(memory);
    const businessName = safeMemory.businessName || String(business?.name || "the salon").trim() || "the salon";
    const service = String(serviceReplyHint?.name || safeMemory.service || "").trim();
    const dateKey = String(recentDateKey || "").trim();
    const time = String(recentTimeHint || "").trim();
    const name = String(currentName || safeMemory.name || "").trim();
    const phone = String(currentPhone || safeMemory.phone || "").trim();
    const email = String(currentEmail || safeMemory.email || "").trim();
    return {
      businessId: safeMemory.businessId || String(business?.id || "").trim(),
      businessName,
      service,
      dateKey,
      time,
      name,
      phone,
      email,
      confirmed: Boolean(safeMemory.confirmed),
      hasService: Boolean(service),
      hasDate: Boolean(dateKey),
      hasTime: Boolean(time),
      hasContact: Boolean(name && phone),
      dateLabel: dateKey ? formatLexiBookingDate(dateKey, { weekday: true }) : "",
      summary: [
        service,
        dateKey ? `on ${formatLexiBookingDate(dateKey, { weekday: true })}` : "",
        time ? `at ${time}` : ""
      ]
        .filter(Boolean)
        .join(" ")
    };
  }

  return {
    normalizeLexiConversationMemory,
    buildLexiDraftSummary,
    buildLexiBookingDraftState
  };
}
