const SUBSCRIBER_COPILOT_SYSTEM_PROMPT =
  "You are Lexi, the lead AI receptionist and business copilot for a salon SaaS dashboard. You are the star front-desk assistant in this product: fast, accurate, confident, polished, and natural. You can answer broad questions like a ChatGPT-style assistant, including hair salon, barbershop, beauty salon, treatment, operations, pricing, staffing, cancellation, finance, and app how-to questions, and you can also answer subscriber business/dashboard questions using the provided sanitized snapshot and current UI context. Use the snapshot and UI context only when relevant to the user's question. Follow GDPR/UK GDPR and data-protection principles: data minimization, least disclosure, and purpose limitation. Do not reveal personal customer data, payment credentials, auth/security secrets, or platform-internal sensitive details. Never share subscriber business data publicly or treat internal dashboard data as public information. You may use current customer record notes, prep guidance, recovery context, and booking draft context to make advice more useful, but do not restate private contact details or dump raw records. You may explain app features, modules, workflows, booking logic, and how Lexi works, but do not disclose personal data in chat. If the question is general and not about the subscriber's business, answer it directly and do not force dashboard analysis. Return JSON with keys: answer (string), findings (array of strings), suggestedActions (array of strings). For general questions, findings/suggestedActions can still be short practical bullets. Style rules: answer first, keep it concise by default (usually 1-2 short sentences, maximum 4 unless asked for depth), sound like a premium receptionist and experienced salon owner/operator (not a report engine), and ask at most one follow-up question when needed. Use clear everyday language. No long preambles. Do not repeat capability lists in simple greetings. Be strong on pricing, policy, staffing, revenue, operational guidance, and appointment-prep guidance when relevant, and suggest tasteful upsells only when clearly relevant. Avoid robotic phrases like 'I reviewed your snapshot' unless the user asks for an analysis/report.";

export function createSubscriberCopilotService({
  getPrisma,
  openai,
  resolveManagedBusinessId,
  normalizeLexiTypos,
  normalizeLexiReplyText,
  stripeConfigured = false,
  paypalConfigured = false,
  openAiModel = "gpt-4o-mini"
} = {}) {
  function prismaClient() {
    return typeof getPrisma === "function" ? getPrisma() : null;
  }

  function buildSubscriberCopilotHeuristicResponse(question, snapshot) {
    const q = String(question || "").trim();
    const qLower = normalizeLexiTypos(q.toLowerCase());
    const business = snapshot?.business || {};
    const bookings = snapshot?.bookings || {};
    const findings = [];
    const suggestedActions = [];
    const cancelRate = Number(bookings.cancelRatePct || 0);
    const upcoming7d = Number(bookings.upcoming7d || 0);
    const total = Number(bookings.total || 0);

    if (!business.id) {
      return {
        answer: "Subscriber Copilot could not detect a business context for this session.",
        findings: ["No business scope is available for the current subscriber session."],
        suggestedActions: ["Sign in again or contact support if your subscriber account is not linked to a business."]
      };
    }
    const looksGeneral =
      /weather|forecast|temperature|news|trend|marketing idea|product|ingredients|aftercare|shampoo|conditioner|hair type|skin care|beauty advice|how does this app work|how to use/i.test(
        qLower
      );
    const looksBusinessSpecific = /booking|calendar|diary|staff|capacity|waitlist|cancel|revenue|finance|crm|retention|dashboard|business/i.test(
      qLower
    );
    if (looksGeneral && !looksBusinessSpecific) {
      return {
        answer: /weather|forecast|temperature/i.test(qLower)
          ? "I can help with salon and business planning, but I don't have live weather lookup in fallback mode. If you tell me your city, I can still suggest how weather usually affects bookings, walk-ins, and cancellation patterns."
          : "Yes, I can help with that. Ask me your salon, barber, beauty, product, aftercare, or app-use question and I'll answer in plain language. I can also use your business dashboard context when you want business-specific advice.",
        findings: [
          `Business context is available for ${business.name || "your business"} if you want advice tailored to your salon.`,
          "Protected customer and business data is not shared in Lexi chat."
        ],
        suggestedActions: [
          "Ask your question directly in plain language.",
          "If you want business-specific advice, mention the module or issue (for example bookings, cancellations, staff cover, or growth)."
        ]
      };
    }

    if (total === 0) {
      findings.push("No bookings are currently recorded for this business.");
      suggestedActions.push("Review front-desk profile, services, and booking flow; then test a booking end-to-end from the customer side.");
    }
    if (cancelRate >= 12) {
      findings.push(`Cancellation rate is elevated at ${cancelRate.toFixed(1)}%.`);
      suggestedActions.push("Prioritize reminder timing, waitlist backfill, and same-day recovery offers to reduce lost slots.");
    }
    if (upcoming7d <= 5 && total > 0) {
      findings.push(`Upcoming 7-day booking volume is light (${upcoming7d} bookings).`);
      suggestedActions.push("Run a short rebooking campaign for recent customers and promote off-peak slots.");
    }
    if (!findings.length) {
      findings.push("Booking and operations snapshot looks stable based on current sanitized metrics.");
      suggestedActions.push("Focus on repeat-booking prompts, upsells, and reducing operational friction during peak windows.");
    }

    if (/waitlist|cancel/i.test(q) && cancelRate < 5) {
      findings.push("Cancellation pressure appears relatively controlled in the current snapshot.");
      suggestedActions.push("Keep waitlist workflows active so last-minute gaps are still recoverable during busy periods.");
    }
    if (/staff|capacity/i.test(q)) {
      suggestedActions.push("Use the calendar + booking operations filters to compare peak booking days against roster coverage.");
    }

    const topicLabel =
      /staff|capacity|rota|cover/.test(qLower)
        ? "staffing and capacity"
        : /waitlist|cancel|gap|backfill/.test(qLower)
          ? "cancellations and waitlist recovery"
          : /revenue|takings|money|cash|profit|finance/.test(qLower)
            ? "revenue and finance signals"
            : /calendar|diary|week|month|day|slot/.test(qLower)
              ? "calendar and booking load"
              : /review|referral|campaign|crm|retention|growth|social/.test(qLower)
                ? "growth and retention opportunities"
                : "business operations";
    const leadFinding = findings[0] || "Current booking and operations signals were reviewed.";
    const leadAction = suggestedActions[0] || "Open the relevant module and work through the highest-impact action first.";

    return {
      answer: `I checked ${topicLabel} for ${business.name || "your business"}. The main thing I can see is: ${leadFinding} Best next step: ${leadAction}`,
      findings: findings.slice(0, 6),
      suggestedActions: suggestedActions.slice(0, 6)
    };
  }

  function summarizeSubscriberUiContext(context) {
    if (!context || typeof context !== "object") return [];
    const notes = [];
    if (context.selectedCustomer?.name) {
      const nextBooking = context.selectedCustomer.nextBooking;
      notes.push(
        nextBooking
          ? `Selected customer context is active for ${context.selectedCustomer.name} with an upcoming ${nextBooking.service || "appointment"} on ${nextBooking.date || ""} at ${nextBooking.time || ""}.`
          : `Selected customer context is active for ${context.selectedCustomer.name}.`
      );
      if (context.selectedCustomer.record?.patchTestRequired) {
        notes.push("The selected customer record flags that a patch test is required.");
      }
      if (context.selectedCustomer.record?.visitPrepNotes) {
        notes.push(`Client prep guidance exists: ${context.selectedCustomer.record.visitPrepNotes}`);
      }
      if (context.selectedCustomer.record?.formulaNotes) {
        notes.push("Client colour or technical formula notes are saved.");
      }
    }
    if (context.selectedRecovery?.type) {
      notes.push(
        `Recovery context is active for ${context.selectedRecovery.customerName || "a client"} around ${
          context.selectedRecovery.service || "an appointment"
        } ${context.selectedRecovery.date ? `on ${context.selectedRecovery.date}` : ""}${context.selectedRecovery.time ? ` at ${context.selectedRecovery.time}` : ""}.`
      );
    }
    if (context.selectedMessageTask?.type) {
      notes.push(`Message board context is active for a ${context.selectedMessageTask.type} task.`);
    }
    if (context.selectedDayCoverage?.pressureLabel) {
      notes.push(
        `Selected day coverage is currently flagged as ${context.selectedDayCoverage.pressureLabel.toLowerCase()} with ${
          context.selectedDayCoverage.assignedBookings || 0
        } assigned booking(s), ${context.selectedDayCoverage.unassignedBookings || 0} unassigned, and ${
          context.selectedDayCoverage.conflictCount || 0
        } clash(es).`
      );
    }
    if (context.bookingDraft?.service || context.bookingDraft?.customerName) {
      notes.push(
        `A booking draft is in progress for ${context.bookingDraft.customerName || "a client"}${context.bookingDraft.service ? ` for ${context.bookingDraft.service}` : ""}.`
      );
      if (context.bookingDraft.record?.patchTestRequired) {
        notes.push("The booking draft record indicates patch-test checking is needed.");
      }
      if (context.bookingDraft.record?.visitPrepNotes) {
        notes.push(`Booking draft prep guidance exists: ${context.bookingDraft.record.visitPrepNotes}`);
      }
      if (context.bookingDraft.record?.consultationNotes) {
        notes.push("Consultation notes are available for the booking draft.");
      }
    }
    return notes.slice(0, 6);
  }

  function buildCoverageActionsFromContext(question, context) {
    const qLower = normalizeLexiTypos(String(question || "").toLowerCase());
    const coverage = context?.selectedDayCoverage;
    if (!coverage || typeof coverage !== "object") return null;
    if (!/day|diary|today|calendar|slot|staff|rota|cover|coverage|booking/.test(qLower)) return null;

    const findings = [];
    const suggestedActions = [];

    if (coverage.pressureLabel === "No team cover planned") {
      findings.push("The selected day has live bookings but no rota cover planned.");
      suggestedActions.push("Open the weekly team planner for that week and add cover before accepting more work into that day.");
    } else if (coverage.pressureLabel === "Under-covered day") {
      findings.push("More bookings are assigned than the planned cover comfortably supports.");
      suggestedActions.push("Reassign bookings, add another team member to that day, or move lower-priority work into a lighter slot.");
    } else if (coverage.pressureLabel === "Bookings still need assigning") {
      findings.push("Some live bookings are still unassigned to a stylist.");
      suggestedActions.push("Assign each unallocated booking to a stylist so the day can be reviewed properly by person.");
    } else if (coverage.pressureLabel === "Stylist clashes to review") {
      findings.push("One or more stylist-assigned bookings overlap in the current diary.");
      suggestedActions.push("Open the stylist day view, move the clashing booking, or switch one appointment to another available stylist.");
    } else if (coverage.pressureLabel === "Coverage looks workable") {
      findings.push("The selected day looks operationally balanced right now.");
      suggestedActions.push("Focus on confirmation messages, upsells, and filling any smaller off-peak gaps.");
    }

    if (coverage.unassignedBookings > 0 && !suggestedActions.some((item) => /assign/i.test(item))) {
      suggestedActions.push("Use the day diary or booking panel to assign the remaining bookings to named stylists.");
    }
    if (coverage.conflictCount > 0 && !suggestedActions.some((item) => /clash|overlap|move/i.test(item))) {
      suggestedActions.push("Review the flagged stylist clashes before the day starts so the front desk is not fixing them late.");
    }

    if (!findings.length) return null;
    return { findings: findings.slice(0, 4), suggestedActions: suggestedActions.slice(0, 5) };
  }

  async function buildSubscriberCopilotSnapshot(req) {
    const prisma = prismaClient();
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) {
      return {
        business: { id: null, name: "", type: "" },
        bookings: { total: 0, cancelled: 0, confirmed: 0, completed: 0, upcoming7d: 0, cancelRatePct: 0 },
        health: {
          openaiConfigured: Boolean(openai),
          accountingSignalsAvailable: Boolean(stripeConfigured || paypalConfigured)
        }
      };
    }

    const today = new Date();
    const from = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const to = new Date(from);
    to.setDate(to.getDate() + 7);
    const fromKey = from.toISOString().slice(0, 10);
    const toKey = to.toISOString().slice(0, 10);

    const [business, total, cancelled, confirmed, completed, upcoming7d] = await Promise.all([
      prisma.business.findUnique({ where: { id: businessId }, select: { id: true, name: true, type: true } }),
      prisma.booking.count({ where: { businessId } }),
      prisma.booking.count({ where: { businessId, status: "cancelled" } }),
      prisma.booking.count({ where: { businessId, status: "confirmed" } }),
      prisma.booking.count({ where: { businessId, status: "completed" } }),
      prisma.booking.count({ where: { businessId, date: { gte: fromKey, lte: toKey }, status: "confirmed" } })
    ]);

    return {
      business: {
        id: business?.id || businessId,
        name: business?.name || "",
        type: business?.type || ""
      },
      bookings: {
        total,
        cancelled,
        confirmed,
        completed,
        upcoming7d,
        cancelRatePct: total ? Number(((cancelled / total) * 100).toFixed(1)) : 0
      },
      health: {
        openaiConfigured: Boolean(openai),
        accountingSignalsAvailable: Boolean(stripeConfigured || paypalConfigured)
      }
    };
  }

  async function buildSubscriberCopilotResponse({ question, snapshot, context }) {
    const base = buildSubscriberCopilotHeuristicResponse(question, snapshot);
    const contextNotes = summarizeSubscriberUiContext(context);
    const coverageGuidance = buildCoverageActionsFromContext(question, context);
    const enrichedBase = contextNotes.length
      ? {
          ...base,
          findings: [...contextNotes, ...(Array.isArray(base.findings) ? base.findings : [])].slice(0, 6),
          suggestedActions: Array.isArray(base.suggestedActions) ? base.suggestedActions : []
        }
      : base;
    const finalBase = coverageGuidance
      ? {
          ...enrichedBase,
          findings: [...coverageGuidance.findings, ...(Array.isArray(enrichedBase.findings) ? enrichedBase.findings : [])].slice(0, 6),
          suggestedActions: [...coverageGuidance.suggestedActions, ...(Array.isArray(enrichedBase.suggestedActions) ? enrichedBase.suggestedActions : [])].slice(0, 6),
          answer: `For the selected day, the main issue is ${coverageGuidance.findings[0].toLowerCase()} Best next step: ${coverageGuidance.suggestedActions[0]}`
        }
      : enrichedBase;
    if (!openai) {
      return { ...finalBase, answer: normalizeLexiReplyText(finalBase.answer, { maxSentences: 2, maxChars: 320 }) };
    }
    try {
      const completion = await openai.chat.completions.create({
        model: openAiModel,
        temperature: 0.2,
        max_tokens: 280,
        messages: [
          {
            role: "system",
            content: SUBSCRIBER_COPILOT_SYSTEM_PROMPT
          },
          {
            role: "user",
            content: JSON.stringify({ question, snapshot, uiContext: context, heuristic: finalBase })
          }
        ]
      });
      const raw = String(completion.choices?.[0]?.message?.content || "").trim();
      const parsed = JSON.parse(raw);
      return {
        answer: normalizeLexiReplyText(String(parsed?.answer || finalBase.answer), { maxSentences: 2, maxChars: 320 }),
        findings: Array.isArray(parsed?.findings) ? parsed.findings.slice(0, 6).map(String) : finalBase.findings,
        suggestedActions: Array.isArray(parsed?.suggestedActions)
          ? parsed.suggestedActions.slice(0, 6).map(String)
          : finalBase.suggestedActions
      };
    } catch {
      return { ...finalBase, answer: normalizeLexiReplyText(finalBase.answer, { maxSentences: 2, maxChars: 320 }) };
    }
  }

  return {
    buildSubscriberCopilotSnapshot,
    buildSubscriberCopilotResponse
  };
}
