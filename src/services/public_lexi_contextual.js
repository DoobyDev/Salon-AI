import {
  formatCurrencyGBP,
  nextDateForWeekday,
  resolveLexiDateKeyFromQuestion,
  weekdayFromText
} from "./public_lexi_helpers.js";
import {
  formatDisplayDateGb,
  formatLexiBookingDate,
  formatLexiSlotLabelForDisplay
} from "./display_formatting.js";

export function createPublicLexiContextualService({
  getPrisma,
  publicBusinessSearchService,
  getAvailableSlotsForBusiness,
  isLexiSalonInfoIntent
} = {}) {
  function prismaClient() {
    return typeof getPrisma === "function" ? getPrisma() : null;
  }

  async function buildContextualReply({
    q = "",
    qLower = "",
    business = null,
    bizName = "the salon",
    draftSummary = null,
    recentDateKey = "",
    recentTimeHint = "",
    serviceReplyHint = null
  } = {}) {
    const prisma = prismaClient();

    if (/(find|search|show).*(salon|barber|barbershop|beauty)/.test(qLower)) {
      const locationMatch = q.match(/\b(?:in|near)\s+([a-zA-Z\s'-]{2,40})$/i);
      const location = locationMatch ? String(locationMatch[1] || "").trim() : "";
      const typeMatch = qLower.includes("barber") ? "barber" : qLower.includes("beauty") ? "beauty" : "salon";
      const results = await publicBusinessSearchService.searchPublicSubscribedBusinesses({ location, businessType: typeMatch, limit: 5 });
      if (!results.length) {
        return `I couldn't find any subscribed ${typeMatch} businesses${location ? ` near ${location}` : ""} right now. Try another area, or tell me the service you want and I'll search that way.`;
      }
      const lines = results
        .slice(0, 4)
        .map((row) => `${row.name} (${row.city})${row.services?.length ? ` - services include ${row.services.slice(0, 2).map((service) => service.name).join(", ")}` : ""}`);
      return `I found ${results.length} subscribed ${typeMatch} business${results.length === 1 ? "" : "es"}${location ? ` near ${location}` : ""}: ${lines.join(" | ")}. Tell me which one you'd like, and I'll check availability.`;
    }

    if (/(show|tell me|give me).*(info|information|details).*(for|about)\s+/.test(qLower) || /(about)\s+[a-z0-9\s'&-]+$/.test(qLower)) {
      const aboutMatch = q.match(/(?:for|about)\s+([a-z0-9\s'&.-]{2,60})$/i);
      const targetName = String(aboutMatch?.[1] || "").trim();
      if (targetName) {
        const matches = await publicBusinessSearchService.searchPublicSubscribedBusinesses({ query: targetName, limit: 3 });
        const exact = matches.find((row) => String(row.name || "").toLowerCase() === targetName.toLowerCase()) || matches[0];
        if (exact) {
          const servicePreview = (exact.services || []).slice(0, 4).map((service) => service.name).join(", ");
          return `${exact.name} is a subscribed ${exact.type} business in ${exact.city}. ${exact.description || ""}${servicePreview ? ` Services include ${servicePreview}.` : ""} ${exact.phone ? `Phone: ${exact.phone}.` : ""}${exact.websiteUrl ? ` Website: ${exact.websiteUrl}.` : ""} Ask me to check available slots if you'd like to book.`;
        }
      }
    }

    if (/\bbook\b/.test(qLower) && /\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{4}-\d{2}-\d{2})\b/.test(qLower)) {
      let targetBusiness = business;
      const atMatch = q.match(/\bat\s+([a-z0-9\s'&.-]{2,50})/i);
      const requestedName = String(atMatch?.[1] || "").trim();
      if (requestedName) {
        const found = await prisma.business.findFirst({
          where: {
            name: { contains: requestedName, mode: "insensitive" },
            subscription: { is: { status: { in: ["active", "trialing", "trial", "past_due"] } } }
          },
          include: { services: true, subscription: true },
          orderBy: [{ rating: "desc" }, { createdAt: "desc" }]
        });
        if (found) targetBusiness = found;
      }
      if (!targetBusiness?.id) {
        return "Tell me the salon, barber, or beauty business name and I'll check the best slots for the day you want.";
      }
      const dateKey = resolveLexiDateKeyFromQuestion(qLower);
      if (!dateKey) {
        return `I can help you book at ${targetBusiness.name}. Tell me the day or date you want (for example tomorrow, Monday, or 2026-02-24) and I'll check slots.`;
      }
      const slots = await getAvailableSlotsForBusiness(targetBusiness, 14);
      const filtered = slots.filter((slot) => String(slot).startsWith(dateKey)).slice(0, 8);
      const labelDate = formatLexiBookingDate(dateKey, { weekday: true });
      const filteredDisplay = filtered.map(formatLexiSlotLabelForDisplay);
      if (!filtered.length) {
        return `I can't see any available slots for ${targetBusiness.name} on ${labelDate}. If you want, I can check another day or help you find another subscribed business.`;
      }
      return `Yes, you can book at ${targetBusiness.name} on ${labelDate}. Available slots I can see are: ${filteredDisplay.join(", ")}. Tell me your service and preferred time, and I can help you book it.`;
    }

    if (/(are there|any|do you have).*(booking|bookings).*(monday|tuesday|wednesday|thursday|friday|saturday|sunday)|\bbookings?\s+for\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/.test(qLower)) {
      const weekday = weekdayFromText(qLower);
      const isAvailabilityIntent = /(available|availability|slot|slots|space|free)/.test(qLower);
      if (weekday !== null && business?.id && !isAvailabilityIntent) {
        const target = nextDateForWeekday(weekday);
        const dateKey = target.toISOString().slice(0, 10);
        const rows = await prisma.booking.findMany({
          where: { businessId: business.id, date: dateKey },
          select: { status: true, time: true, service: true },
          orderBy: { time: "asc" }
        });
        const active = rows.filter((row) => String(row.status || "").toLowerCase() !== "cancelled");
        const cancelled = rows.length - active.length;
        const label = formatLexiBookingDate(dateKey, { weekday: true });
        if (!rows.length) {
          return `I can't see any bookings for ${bizName} on ${label} yet. If you want, I can help you check availability or suggest a good time to book.`;
        }
        const preview = active
          .slice(0, 3)
          .map((row) => `${String(row.time || "").slice(0, 5)} ${row.service || "appointment"}`)
          .filter(Boolean)
          .join(", ");
        return `Yes, ${bizName} has ${rows.length} booking${rows.length === 1 ? "" : "s"} on ${label}${cancelled ? ` (${cancelled} cancelled)` : ""}. ${preview ? `The first bookings I can see are: ${preview}.` : ""}`;
      }
    }

    if (/(available|availability|slots?|space).*(monday|tuesday|wednesday|thursday|friday|saturday|sunday)|\b(slots?|space)\s+for\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/.test(qLower)) {
      const weekday = weekdayFromText(qLower);
      if (weekday !== null && business?.id) {
        const target = nextDateForWeekday(weekday);
        const dateKey = target.toISOString().slice(0, 10);
        const slots = await getAvailableSlotsForBusiness(business, 14);
        const filtered = slots.filter((slot) => String(slot).startsWith(dateKey)).slice(0, 8);
        const label = formatLexiBookingDate(dateKey, { weekday: true });
        const filteredDisplay = filtered.map(formatLexiSlotLabelForDisplay);
        if (!filtered.length) {
          return `I can't see any available slots for ${bizName} on ${label} right now. If you want, I can check another day.`;
        }
        return `Yes, there are available slots for ${bizName} on ${label}. Here are some times: ${filteredDisplay.join(", ")}.`;
      }
    }

    if (/(today'?s|today).*(revenue|renenue|takings|sales)|\b(revenue|renenue|takings|sales)\b.*\btoday\b/.test(qLower)) {
      if (business?.id) {
        const todayKey = new Date().toISOString().slice(0, 10);
        const rows = await prisma.booking.findMany({
          where: { businessId: business.id, date: todayKey },
          select: { status: true, price: true, service: true }
        });
        const completedOrConfirmed = rows.filter((row) => {
          const status = String(row.status || "").toLowerCase();
          return status === "confirmed" || status === "completed";
        });
        const cancelled = rows.filter((row) => String(row.status || "").toLowerCase() === "cancelled").length;
        const revenue = completedOrConfirmed.reduce((sum, row) => sum + Number(row.price || 0), 0);
        if (!rows.length) {
          return `I can't see any bookings for ${bizName} today yet, so there's no booking revenue recorded for today right now.`;
        }
        return `For ${bizName} today, I can see ${rows.length} booking${rows.length === 1 ? "" : "s"}${cancelled ? ` (${cancelled} cancelled)` : ""} and an estimated booking revenue of ${formatCurrencyGBP(revenue)} from confirmed/completed appointments.`;
      }
      return "I can help with today's revenue/takings, but I need a business context to check booking-based revenue.";
    }

    if (/(book|booking|appointment|slot|availability|available time|what time)/.test(qLower) && !isLexiSalonInfoIntent(qLower)) {
      if (draftSummary?.summary && draftSummary.summary !== `on ${recentDateKey}`) {
        if (!draftSummary.hasName || !draftSummary.hasPhone) {
          return `I've got ${draftSummary.summary} at ${draftSummary.businessName}. I just need your name and phone number to finish the booking.`;
        }
        if (!draftSummary.confirmed) {
          return `I've got ${draftSummary.summary} at ${draftSummary.businessName}. If you're happy with that, tell me to confirm it.`;
        }
        return `You're already booked in for ${draftSummary.summary} at ${draftSummary.businessName}.`;
      }
      if (recentDateKey && !serviceReplyHint?.name && !recentTimeHint) {
        return `Yes. ${formatDisplayDateGb(recentDateKey, { day: "2-digit", month: "2-digit", year: "numeric" })} works. What service would you like, and what time suits you best?`;
      }
      if (recentDateKey && !serviceReplyHint?.name) {
        return `I've got ${formatLexiBookingDate(recentDateKey, { weekday: true })} at ${recentTimeHint}. What service would you like to book?`;
      }
      if (recentDateKey && serviceReplyHint?.name && !recentTimeHint) {
        return `I've got ${serviceReplyHint.name} on ${formatLexiBookingDate(recentDateKey, { weekday: true })}. What time would you like?`;
      }
      return "Yes. What service would you like, and what day works best?";
    }

    return null;
  }

  return {
    buildContextualReply
  };
}
