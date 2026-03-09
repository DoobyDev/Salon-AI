import {
  LEXI_AUTH_HELP_PHRASES,
  LEXI_POLICY_HELP_PHRASES,
  isLexiAppQuestion,
  isLexiPublicAvailabilityQuestion,
  isLexiSalonBeautyQuestion,
  lexiIncludesAny,
  normalizeLexiTypos,
  resolveLexiDateKeyFromQuestion
} from "./public_lexi_helpers.js";
import {
  formatDisplayDateGb,
  formatLexiBookingDate,
  formatLexiSlotLabelForDisplay
} from "./display_formatting.js";

export function createPublicLexiConversationService({
  getAvailableSlotsForBusiness
} = {}) {
  async function buildConversationReply({
    q = "",
    qLower = "",
    business = null,
    bizName = "the salon",
    introducedName = "",
    hasPendingBookingContext = false,
    serviceReplyHint = null,
    recentDateKey = "",
    recentTimeHint = "",
    safeMemory = {},
    draftSummary = null,
    lastAssistantText = ""
  } = {}) {
    const isGreetingOnly = /^(hi|hello|hey|hiya|hey lexi|hi lexi)[!.]?\s*$/i.test(q);

    if (!introducedName && isGreetingOnly) {
      return "Hi, I'm Lexi. What are we booking or figuring out today?";
    }
    if (!q) {
      return "Hi, I'm Lexi. Tell me the service, day, or question and I'll guide the next step.";
    }
    if (introducedName && !hasPendingBookingContext) {
      const displayName = introducedName.charAt(0).toUpperCase() + introducedName.slice(1);
      return `Hi ${displayName}, lovely to meet you. What would you like help with today?`;
    }

    if (/(is that all booked in|is that booked in|is that booked|is that confirmed|is that all set|book that in|book it in|confirm that|confirm it)/.test(qLower) && hasPendingBookingContext) {
      const labelDate = formatLexiBookingDate(recentDateKey, { weekday: true });
      const targetBusinessName = safeMemory.businessName || bizName;
      const targetService = String(serviceReplyHint?.name || "").trim();
      if (safeMemory.confirmed) {
        return `Yes, your ${targetService} at ${targetBusinessName} is booked for ${labelDate} at ${recentTimeHint}.`;
      }
      if (!safeMemory.name || !safeMemory.phone) {
        return `Not yet. I have your ${targetService} at ${targetBusinessName} on ${labelDate} at ${recentTimeHint}, but I still need your name and phone number to confirm it.`;
      }
      return `Almost. I have your ${targetService} at ${targetBusinessName} on ${labelDate} at ${recentTimeHint}. Ask me to confirm the booking and I'll book it with the details you've given.`;
    }

    if (hasPendingBookingContext && /(book|booking|appointment|all set|sorted|done|confirm|confirmed|booked in|booked)/.test(qLower)) {
      const labelDate = formatLexiBookingDate(recentDateKey, { weekday: true });
      const targetBusinessName = draftSummary?.businessName || bizName;
      const targetService = String(serviceReplyHint?.name || "").trim();
      if (safeMemory.confirmed) {
        return `Yes, you're booked in for ${targetService} at ${targetBusinessName} on ${labelDate} at ${recentTimeHint}.`;
      }
      if (!draftSummary?.hasName || !draftSummary?.hasPhone) {
        return `I've got your ${targetService} at ${targetBusinessName} on ${labelDate} at ${recentTimeHint}. I just need your name and phone number to lock it in.`;
      }
      return `I've got everything for your ${targetService} at ${targetBusinessName} on ${labelDate} at ${recentTimeHint}. Tell me to confirm it and I'll finish the booking.`;
    }

    if (serviceReplyHint && lastAssistantText && business?.id) {
      const assistantDateKey = resolveLexiDateKeyFromQuestion(lastAssistantText);
      const targetDateKey = recentDateKey || assistantDateKey;
      const lastAssistantLower = normalizeLexiTypos(lastAssistantText.toLowerCase());
      if (targetDateKey && /(bookings? i can see are|available slots i can see are|here are some times|check another day)/.test(lastAssistantLower)) {
        const slots = await getAvailableSlotsForBusiness(business, 14);
        const filtered = slots.filter((slot) => String(slot).startsWith(targetDateKey)).slice(0, 8);
        const labelDate = formatLexiBookingDate(targetDateKey, { weekday: true });
        const targetService = String(serviceReplyHint.name || "").trim();
        if (!filtered.length) {
          return `I can help with a ${targetService} at ${bizName}, but I can't see any open slots on ${labelDate}. If you want, I can check another day.`;
        }
        return `Yes, a ${targetService} is fine. For ${bizName} on ${labelDate}, the next times I can offer are ${filtered.map(formatLexiSlotLabelForDisplay).join(", ")}. Tell me which time you want.`;
      }
    }

    const shortReplyWordCount = q.split(/\s+/).filter(Boolean).length;
    if (shortReplyWordCount > 0 && shortReplyWordCount <= 6 && lastAssistantText) {
      const lastAssistantLower = normalizeLexiTypos(lastAssistantText.toLowerCase());
      if (/(what service|which service can i book|what service would you like)/.test(lastAssistantLower) && recentDateKey && recentTimeHint && serviceReplyHint?.name) {
        return `Perfect. I've got your ${serviceReplyHint.name} at ${bizName} on ${formatLexiBookingDate(recentDateKey, { weekday: true })} at ${recentTimeHint}. Would you like me to book that for you?`;
      }
      if (/(available slots|here are some times|next available slots)/.test(lastAssistantLower) && recentTimeHint) {
        const targetDateKey = recentDateKey || resolveLexiDateKeyFromQuestion(lastAssistantText);
        if (targetDateKey) {
          const labelDate = formatLexiBookingDate(targetDateKey, { weekday: true });
          if (serviceReplyHint?.name) {
            return `Perfect. I've got your ${serviceReplyHint.name} at ${bizName} on ${labelDate} at ${recentTimeHint}. Would you like me to book that for you?`;
          }
          return `Perfect, ${labelDate} at ${recentTimeHint}. What service would you like to book?`;
        }
        if (serviceReplyHint?.name) {
          return `Perfect, ${recentTimeHint} for a ${serviceReplyHint.name}. What day or date would you like?`;
        }
        return `Perfect, ${recentTimeHint} sounds good. What service would you like to book?`;
      }
      if (/(what time|which time|what time suits you best|tell me the time)/.test(lastAssistantLower)) {
        if (recentTimeHint && recentDateKey && serviceReplyHint?.name) {
          const labelDate = formatLexiBookingDate(recentDateKey, { weekday: true });
          return `Perfect. I've got your ${serviceReplyHint.name} at ${bizName} on ${labelDate} at ${recentTimeHint}. Would you like me to book that for you?`;
        }
        if (recentTimeHint && serviceReplyHint?.name) {
          return `Perfect, ${recentTimeHint} for a ${serviceReplyHint.name}. What day or date would you like?`;
        }
      }
      if (/(which one|which business|tell me which one|what business)/.test(lastAssistantLower)) {
        return `Perfect, ${q} sounds good. What day or date would you like? I'll check the available slots for you.`;
      }
      if (/(what service|which service can i book|what service would you like)/.test(lastAssistantLower)) {
        if (recentTimeHint && !recentDateKey) {
          return `Great, ${recentTimeHint} sounds good. What day or date would you like?`;
        }
        if (recentDateKey && !recentTimeHint) {
          return "Great, and what time would suit you best?";
        }
        if (recentDateKey && recentTimeHint) {
          return `Perfect. I've got ${recentTimeHint} on ${formatDisplayDateGb(recentDateKey, { day: "2-digit", month: "2-digit", year: "numeric" })}. What service would you like to book?`;
        }
        return "Great choice. What day or date would you like, and roughly what time suits you best?";
      }
      if (/(what day|which day|what date|tell me the day|tell me the date)/.test(lastAssistantLower)) {
        if (recentDateKey && recentTimeHint) {
          const labelDate = formatLexiBookingDate(recentDateKey, { weekday: true });
          return `Perfect, ${labelDate} at ${recentTimeHint}. What service would you like to book?`;
        }
        return "Perfect. What time would suit you best? I'll check the best options for you.";
      }
    }

    if (business?.id && shortReplyWordCount > 0 && shortReplyWordCount <= 6 && /(\bbest\b|\bthat\b|\byes\b|\byeah\b|\bok\b|\bokay\b|\bsure\b|\bworks\b|\bnorth\b|\bsouth\b|\beast\b|\bwest\b)/.test(qLower)) {
      return `Perfect, ${bizName} sounds great. What service would you like, and what day and time would suit you best?`;
    }

    if (!isLexiAppQuestion(qLower) && !isLexiPublicAvailabilityQuestion(qLower) && !isLexiSalonBeautyQuestion(qLower) && !/(today'?s date|what day is it|what('s| is)?\s+the\s+date|what('s| is)?\s+the\s+time|current time|time is it)/i.test(qLower)) {
      return "Ask me about services, products, bookings, availability, or how the app works, and I'll keep it simple. I just won't show private or personal data in chat.";
    }

    if (lexiIncludesAny(qLower, LEXI_AUTH_HELP_PHRASES)) {
      if (/(do i need|need an account|have to sign in|have to sign up|without an account|guest)/.test(qLower)) {
        if (serviceReplyHint?.name && recentDateKey && !recentTimeHint) {
          return `You don't need an account to chat with me. When you're ready to lock in the booking, I'll open sign in or sign up. What time would you like for ${serviceReplyHint.name} on ${formatLexiBookingDate(recentDateKey, { weekday: true })}?`;
        }
        if (serviceReplyHint?.name && recentDateKey && recentTimeHint) {
          return `You don't need an account to chat with me. When you're ready to lock in the booking, I'll open sign in or sign up. I've got ${serviceReplyHint.name} on ${formatLexiBookingDate(recentDateKey, { weekday: true })} at ${recentTimeHint}.`;
        }
        return "You don't need an account to chat with me. When you're ready to lock in a booking, I'll open sign in or sign up for you. What service would you like, and what day works best?";
      }
      if (/(already have an account|existing account|returning customer)/.test(qLower)) {
        return "If you already have a customer account, just sign in when Lexi opens the customer access popup and she can carry your booking through from there.";
      }
      return "If you're a customer, Lexi can guide you into sign in or sign up when you're ready to confirm a booking. Once you're in, the app helps you manage bookings and appointment history without sharing personal data publicly.";
    }

    if (/(cancel|cancellation|cancel my booking|reschedule|change my booking|move my booking|change appointment|move appointment)/.test(qLower)) {
      if (/(cancel|cancellation|cancel my booking)/.test(qLower)) {
        return "Yes, if you already have a booking, sign in to your customer account and you can cancel it from there. If you want, I can also help you choose a new slot instead of cancelling outright.";
      }
      if (/(reschedule|change my booking|move my booking|change appointment|move appointment)/.test(qLower)) {
        return "Yes, if you're changing an existing booking, sign in to your customer account and you can reschedule it there. If you're still deciding on a new time, I can help you find a better slot first.";
      }
      return "Yes, Lexi can help with booking changes. If you already have a booking, sign in to your customer account to manage it, and if you're still arranging a new appointment I can help you choose a better day or time first.";
    }

    if (/(what can .*do|what does .*do|how .*work|how to use|how do i use|features|feature|modules?)/.test(qLower) || lexiIncludesAny(qLower, ["what can this app do", "what can lexi do", "how does lexi work", "how does the app work"])) {
      return "Lexi can answer product, service, treatment, and aftercare questions, check live availability, guide bookings, help new and returning customers use the app, and move people into sign in or sign up when it's time to confirm. Subscribers and admins then get the business-side dashboard tools.";
    }

    if (lexiIncludesAny(qLower, LEXI_POLICY_HELP_PHRASES)) {
      if (/(privacy|gdpr|data protection|personal data)/.test(qLower)) {
        return "I can explain how the app handles privacy and customer access at a public level, but I won't expose anyone's personal data, account details, or internal system information in chat.";
      }
      if (/(billing|subscription|refund|refunds)/.test(qLower)) {
        return "I can explain the public billing and refund flow, but I won't expose payment details or account-specific billing data in chat.";
      }
      return "I can explain public-facing policy topics like privacy, billing flow, cancellations, and how customer access works. I just won't expose personal data, account secrets, or internal system details in chat.";
    }

    return null;
  }

  return {
    buildConversationReply
  };
}
