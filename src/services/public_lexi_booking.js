export function createPublicLexiBookingService({
  normalizeLexiTypos,
  getAvailableSlotsForBusiness,
  formatLexiSlotLabelForDisplay
} = {}) {
  function isLexiBookingIntentSignal(qLower, draft) {
    return Boolean(
      draft?.hasService ||
        draft?.hasDate ||
        draft?.hasTime ||
        /(book|booking|appointment|slot|slots|availability|available|time|today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|haircut|trim|blow dry|blowout|balayage|highlights|facial|wax|lashes|brow|fade|beard)/.test(
          qLower
        )
    );
  }

  function isLexiSalonInfoIntent(qLower) {
    return /(do you do|what do you offer|what services|speciali[sz]e|hair type|curly|natural hair|fine hair|thick hair|textured hair|coily|afro|wavy|consultation|consultations|major change|big change|price|cost|pricing|price range|charge extra|free consultation|package|membership|policy|deposit|late|cancellation|cancelation|walk-?ins?|book in advance|book ahead|availability this week|how long does|specific stylist|choose a stylist|pick a stylist|how experienced|best stylist|who is best|photos of previous work|portfolio|what should i get|where are you|location|address|parking|payment methods|forms of payment|card|cash|aftercare|product|products|shampoo|conditioner|hair mask|styling product|sulfate|ingredients|ammonia-?free|organic colour|organic color|sell products|retail products|maintain my hair|prepare for my appointment|first appointment|wash my hair before|new client discount|first time client)/.test(
      qLower
    );
  }

  async function maybeBuildLexiBookingReply({ qLower, draft, business, lastAssistantText = "" }) {
    if (!draft?.businessId || !business?.id || !isLexiBookingIntentSignal(qLower, draft)) return null;
    if (
      isLexiSalonInfoIntent(qLower) &&
      !/(book|booking|slot|slots|availability|available|time works|what time|can i have|i'll take|ill take|works best|book that|book it|confirm)/.test(
        qLower
      )
    ) {
      return null;
    }
    const normalizedLastAssistant = normalizeLexiTypos(String(lastAssistantText || "").toLowerCase());
    const lastAssistantAskedToBook = /would you like me to book that for you/.test(normalizedLastAssistant);
    const wantsConfirmation =
      /(^(ok|okay|yes|yeah|yep|sure|great|perfect|fine|good)$|^(ok|okay)\s+(great|good|fine|perfect|works)$|^(yes|yeah|yep|sure)\s+(great|good|fine|perfect|works)$|yes\b.*(book|confirm)|yes\b.*(great|fine|good|perfect|works)|that sounds good|sounds good|sounds great|that's great|thats great|that's fine|thats fine|that's good|thats good|book that|book it|book that for me|can i book that|can you book that|please book that|please book it|confirm that|confirm it|lock it in|lock that in|go ahead|yes please|that works|do it|sort that|sort that out|make that booking|get that booked|put that in|reserve that|hold that|is that booked|is that all booked|is that confirmed|is that all set)/.test(
        qLower
      ) ||
      (lastAssistantAskedToBook && /^(ok|okay|yes|yeah|yep|sure|great|perfect|fine|good|sounds good|sounds great|that works)$/.test(qLower));

    if (draft.hasService && draft.hasDate && !draft.hasTime) {
      const wantsAvailability = /(available|availability|slot|slots|space|can i|get|looking|need|want|book|appointment|what have you got|what do you have)/.test(
        qLower
      );
      if (wantsAvailability) {
        const slots = await getAvailableSlotsForBusiness(business, 14);
        const filtered = slots.filter((slot) => String(slot).startsWith(draft.dateKey)).slice(0, 6);
        if (!filtered.length) {
          return `I can't see any open times for a ${draft.service} at ${draft.businessName} on ${draft.dateLabel}. If you want, I can check another day.`;
        }
        return `Yes. For a ${draft.service} at ${draft.businessName} on ${draft.dateLabel}, I can do ${filtered
          .map(formatLexiSlotLabelForDisplay)
          .join(", ")}. Which time works best?`;
      }
      return `${draft.service} is fine. What time works best on ${draft.dateLabel}?`;
    }

    if (draft.hasService && !draft.hasDate) {
      return `${draft.service} is fine. What day would you like?`;
    }

    if (!draft.hasService && draft.hasDate && draft.hasTime) {
      return `I've got ${draft.dateLabel} at ${draft.time}. What service would you like to book?`;
    }

    if (draft.hasService && draft.hasDate && draft.hasTime) {
      if (draft.confirmed) {
        return `You're all set for ${draft.service} at ${draft.businessName} on ${draft.dateLabel} at ${draft.time}.`;
      }
      if (wantsConfirmation && !draft.hasContact) {
        return `Almost there. I've got your ${draft.service} at ${draft.businessName} on ${draft.dateLabel} at ${draft.time}. I just need your name and phone number to book it in properly.`;
      }
      if (wantsConfirmation && draft.hasContact) {
        return `Perfect. I've got everything for your ${draft.service} at ${draft.businessName} on ${draft.dateLabel} at ${draft.time}. Tell me to confirm it and I'll finish the booking.`;
      }
      return `Perfect. I've got your ${draft.service} at ${draft.businessName} on ${draft.dateLabel} at ${draft.time}. Would you like me to book that for you?`;
    }

    return null;
  }

  return {
    isLexiBookingIntentSignal,
    isLexiSalonInfoIntent,
    maybeBuildLexiBookingReply
  };
}
