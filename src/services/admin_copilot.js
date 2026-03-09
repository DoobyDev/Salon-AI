const ADMIN_COPILOT_SYSTEM_PROMPT =
  "You are Lexi, the lead AI receptionist and operations assistant for a salon SaaS admin dashboard. You are the star front-desk assistant in this product: fast, accurate, confident, polished, and easy to talk to. You can answer broad questions like a ChatGPT-style assistant, including salon/barber/beauty/business guidance and app how-to questions, and you can also answer admin/platform/managed-business diagnostics questions using the provided sanitized snapshot and current admin UI context. Use the snapshot and UI context only when relevant. Follow GDPR/UK GDPR and data-protection principles: data minimization, least disclosure, and purpose limitation. Do not request or reveal secrets, personal data, payment credentials, tokens, or security-sensitive details. Never share business data publicly or present internal dashboard data as public information. You may explain app features, modules, workflows, and how the platform works, but do not disclose personal user/customer/subscriber data in chat. You may use selected-business context and alert-board context to make advice more useful, but do not dump raw internal records. If the question is general and not about the admin dashboard or a managed business, answer it directly and do not force diagnostics language. Return JSON with keys: answer (string), findings (array of strings), suggestedFixes (array of strings). For general questions, findings/suggestedFixes can be short practical bullets. Style rules: answer the user's question immediately in the first sentence, keep answers tight by default (usually 1-2 short sentences, maximum 4 unless they ask for detail), use plain everyday language, and ask at most one follow-up question when needed. Sound like a calm, experienced salon owner or front-desk manager who knows the business inside out. Be premium, reassuring, solution-oriented, and human. No long preambles. Avoid robotic phrasing like 'I reviewed a snapshot' unless the user explicitly asks for a report.";

export function createAdminCopilotService({
  getPrisma,
  openai,
  stripeConfigured = false,
  paypalConfigured = false,
  getRedisUrl,
  isRedisEnabled,
  resolveManagedBusinessId,
  normalizeLexiTypos,
  normalizeLexiReplyText,
  openAiModel = "gpt-4o-mini"
} = {}) {
  function prismaClient() {
    return typeof getPrisma === "function" ? getPrisma() : null;
  }

  function buildAdminCopilotHeuristicResponse(question, snapshot) {
    const q = String(question || "").trim();
    const qLower = normalizeLexiTypos(q.toLowerCase());
    const findings = [];
    const suggestedFixes = [];
    const platform = snapshot?.platform || {};
    const health = snapshot?.health || {};
    const scope = snapshot?.managedBusiness || null;
    const cancelRate = Number(platform.cancelRatePct || 0);
    const looksLikeAdminDiagnostics =
      /admin|platform|diagnostic|diagnostics|scope|subscriber|billing|bookings|calendar|cancell|accounting|redis|prisma|api|server|dashboard|managed business|business/i.test(
        q
      );
    const looksLikeRealtimeGeneral = /weather|temperature|forecast|news|stock|price of|traffic/i.test(qLower);

    if (!looksLikeAdminDiagnostics) {
      const generalAnswer = looksLikeRealtimeGeneral
        ? "I can help with salon and business planning, but I don't have live weather lookup in this chat yet. If you tell me your city, I can still suggest how weather usually affects walk-ins, cancellations, and demand."
        : "Yes, I can help with general salon, barber, beauty, and business questions here, and I can also use admin or managed-business context when your question is about the dashboard.";
      return {
        answer: generalAnswer,
        findings: [
          scope?.selected
            ? `Managed business context is available (${scope.name || "selected business"}) if you want business-specific guidance.`
            : "No managed business is selected right now, but general guidance is still available."
        ],
        suggestedFixes: [
          "Ask your general question directly (services, products, client experience, operations ideas, etc.).",
          "For business-specific diagnostics, mention the dashboard/module or the managed business issue you want checked."
        ]
      };
    }

    if (!health.prismaReady) {
      findings.push("Database diagnostics are partially unavailable because Prisma queries failed.");
      suggestedFixes.push("Verify Prisma client generation and database connectivity, then retry the copilot query.");
    }
    if (!health.openaiConfigured) {
      findings.push("OpenAI API is not configured for enhanced copilot reasoning.");
      suggestedFixes.push("Set OPENAI_API_KEY on the server environment to enable richer copilot responses.");
    }
    if (cancelRate >= 12) {
      findings.push(`Platform cancellation rate is elevated (${cancelRate.toFixed(1)}%).`);
      suggestedFixes.push("Review cancellation workflows, reminder timing, and waitlist backfill usage across active businesses.");
    }
    if (health.redisConfigured && !health.redisEnabled) {
      findings.push("Redis URL is configured but runtime is using inline fallback queues/cache behavior.");
      suggestedFixes.push("Confirm Redis connectivity and runtime startup logs so queue-backed features run as expected.");
    }
    if ((/subscriber|business|scope/i.test(q) || q.length < 8) && !scope?.selected) {
      findings.push("No managed business scope is selected for this admin session.");
      suggestedFixes.push("Select a managed business in the admin scope dropdown for business-specific diagnostics.");
    }
    if (!findings.length) {
      findings.push("No obvious platform-wide configuration red flags were detected in the sanitized snapshot.");
      suggestedFixes.push("Use a more specific question (billing, bookings, calendar, cancellations, accounting, admin scope) for targeted diagnostics.");
    }

    const answerParts = [
      "Here's a quick admin summary based on the current platform snapshot.",
      scope?.selected
        ? `I also included checks for ${scope.name || "the selected business"}.`
        : "No managed business is selected, so this is a platform-level view.",
      findings.length ? `Main thing to look at: ${findings[0]}` : ""
    ].filter(Boolean);

    return {
      answer: answerParts.join(" "),
      findings: findings.slice(0, 6),
      suggestedFixes: suggestedFixes.slice(0, 6)
    };
  }

  function summarizeAdminUiContext(context) {
    if (!context || typeof context !== "object") return [];
    const notes = [];
    if (context.selectedBusiness?.name) {
      notes.push(
        `Selected business context is active for ${context.selectedBusiness.name} with ${context.selectedBusiness.upcomingBookings || 0} upcoming booking(s) and health labelled as ${
          context.selectedBusiness.healthLabel || "unknown"
        }.`
      );
      if (String(context.selectedBusiness.subscriptionStatus || "").trim().toLowerCase() !== "active") {
        notes.push("The selected business subscription is not active.");
      }
      if (context.selectedBusiness.notificationHealth?.summary) {
        notes.push(`Notification health for the selected business: ${context.selectedBusiness.notificationHealth.summary}`);
      }
    }
    if (Array.isArray(context.alerts) && context.alerts.length) {
      notes.push(`Admin alert board currently shows ${context.alerts.length} highlighted business alert${context.alerts.length === 1 ? "" : "s"}.`);
      const lead = context.alerts[0];
      if (lead?.businessName) {
        notes.push(`${lead.businessName} is one of the strongest alert cases right now: ${(lead.reasons || []).slice(0, 1).join(" ")}`);
      }
    }
    return notes.slice(0, 5);
  }

  function buildAdminNotificationGuidance(question, context) {
    const qLower = normalizeLexiTypos(String(question || "").toLowerCase());
    if (!/notification|notifications|delivery|deliverability|reminder|reminders|sms|email|message|messages|communication/.test(qLower)) {
      return null;
    }
    const selected = context?.selectedBusiness;
    const notificationHealth = selected?.notificationHealth;
    if (!selected?.name || !notificationHealth) return null;
    const issues = Array.isArray(notificationHealth.issues) ? notificationHealth.issues : [];
    const nextSteps = Array.isArray(notificationHealth.nextSteps) ? notificationHealth.nextSteps : [];
    return {
      answer: `${selected.name} is currently showing ${String(notificationHealth.summary || "notification issues").toLowerCase()} Best next step: ${String(nextSteps[0] || "review reminder setup and recent contact data quality").replace(/\.$/, "")}.`,
      findings: [
        `${selected.name} has ${Number(notificationHealth.sent || 0)} successful notification send(s) and ${Number(notificationHealth.failed || 0)} failed channel attempt(s) in the recent log.`,
        ...issues.slice(0, 2)
      ],
      suggestedFixes: nextSteps.slice(0, 3)
    };
  }

  function buildAdminAlertGuidance(question, context) {
    const qLower = normalizeLexiTypos(String(question || "").toLowerCase());
    if (!/alert|attention|risk|which business|which salon|which barbershop|who needs help|quiet|cancel|upcoming|subscription/.test(qLower)) {
      return null;
    }
    const alerts = Array.isArray(context?.alerts) ? context.alerts : [];
    if (!alerts.length) return null;
    const lead = alerts[0];
    const leadReason = Array.isArray(lead.reasons) && lead.reasons.length ? lead.reasons[0] : "It needs review.";
    return {
      answer: `${lead.businessName || "One business"} needs the fastest attention right now because ${leadReason.toLowerCase()} Best next step: open that business and review bookings, subscription health, and recent activity together.`,
      findings: [
        `${lead.businessName || "This business"} is currently flagged as ${lead.label || "needs review"}.`,
        ...((Array.isArray(lead.reasons) ? lead.reasons : []).slice(0, 2))
      ],
      suggestedFixes: [
        `Open ${lead.businessName || "that business"} from the alert board and review the business detail panel.`,
        "Check whether the issue is weak demand, cancellations, or subscription status before taking action.",
        "Use admin outreach or subscriber guidance to push the right operational fix."
      ]
    };
  }

  async function buildAdminCopilotSnapshot(req) {
    const prisma = prismaClient();
    const snapshot = {
      platform: {
        businesses: null,
        users: null,
        bookings: null,
        cancelledBookings: null,
        cancelRatePct: null
      },
      managedBusiness: {
        selected: false,
        id: null,
        name: "",
        bookings: null,
        cancelledBookings: null,
        users: null
      },
      health: {
        prismaReady: true,
        openaiConfigured: Boolean(openai),
        stripeConfigured: Boolean(stripeConfigured),
        paypalConfigured: Boolean(paypalConfigured),
        redisConfigured: Boolean(typeof getRedisUrl === "function" ? getRedisUrl() : ""),
        redisEnabled: typeof isRedisEnabled === "function" ? isRedisEnabled() : false,
        nodeEnv: process.env.NODE_ENV || "development",
        uptimeMinutes: Math.round(process.uptime() / 60)
      }
    };

    try {
      const [businesses, users, bookings, cancelled] = await Promise.all([
        prisma.business.count(),
        prisma.user.count(),
        prisma.booking.count(),
        prisma.booking.count({ where: { status: "cancelled" } })
      ]);
      snapshot.platform = {
        businesses,
        users,
        bookings,
        cancelledBookings: cancelled,
        cancelRatePct: bookings ? Number(((cancelled / bookings) * 100).toFixed(1)) : 0
      };
    } catch {
      snapshot.health.prismaReady = false;
    }

    try {
      const businessId = await resolveManagedBusinessId(req);
      if (businessId) {
        const [business, bookings, cancelledBookings, users] = await Promise.all([
          prisma.business.findUnique({ where: { id: businessId }, select: { id: true, name: true } }),
          prisma.booking.count({ where: { businessId } }),
          prisma.booking.count({ where: { businessId, status: "cancelled" } }),
          prisma.user.count({ where: { businessId } })
        ]);
        snapshot.managedBusiness = {
          selected: Boolean(businessId),
          id: businessId,
          name: business?.name || "",
          bookings,
          cancelledBookings,
          users
        };
      }
    } catch {
      snapshot.health.prismaReady = false;
    }

    return snapshot;
  }

  async function buildAdminCopilotResponse({ question, snapshot, context }) {
    const base = buildAdminCopilotHeuristicResponse(question, snapshot);
    const contextNotes = summarizeAdminUiContext(context);
    const contextBase = contextNotes.length
      ? {
          ...base,
          findings: [...contextNotes, ...(Array.isArray(base.findings) ? base.findings : [])].slice(0, 6)
        }
      : base;
    const alertGuidance = buildAdminAlertGuidance(question, context);
    const finalBase = alertGuidance
      ? {
          ...contextBase,
          answer: alertGuidance.answer,
          findings: [...alertGuidance.findings, ...(Array.isArray(contextBase.findings) ? contextBase.findings : [])].slice(0, 6),
          suggestedFixes: [...alertGuidance.suggestedFixes, ...(Array.isArray(contextBase.suggestedFixes) ? contextBase.suggestedFixes : [])].slice(0, 6)
        }
      : contextBase;
    const notificationGuidance = buildAdminNotificationGuidance(question, context);
    const withNotifications = notificationGuidance
      ? {
          ...finalBase,
          answer: notificationGuidance.answer,
          findings: [...notificationGuidance.findings, ...(Array.isArray(finalBase.findings) ? finalBase.findings : [])].slice(0, 6),
          suggestedFixes: [...notificationGuidance.suggestedFixes, ...(Array.isArray(finalBase.suggestedFixes) ? finalBase.suggestedFixes : [])].slice(0, 6)
        }
      : finalBase;
    if (!openai) {
      return { ...withNotifications, answer: normalizeLexiReplyText(withNotifications.answer, { maxSentences: 2, maxChars: 320 }) };
    }
    try {
      const completion = await openai.chat.completions.create({
        model: openAiModel,
        temperature: 0.2,
        max_tokens: 280,
        messages: [
          {
            role: "system",
            content: ADMIN_COPILOT_SYSTEM_PROMPT
          },
          {
            role: "user",
            content: JSON.stringify({ question, snapshot, uiContext: context, heuristic: withNotifications })
          }
        ]
      });
      const raw = String(completion.choices?.[0]?.message?.content || "").trim();
      const parsed = JSON.parse(raw);
      return {
        answer: normalizeLexiReplyText(String(parsed?.answer || withNotifications.answer), { maxSentences: 2, maxChars: 320 }),
        findings: Array.isArray(parsed?.findings) ? parsed.findings.slice(0, 6).map(String) : withNotifications.findings,
        suggestedFixes: Array.isArray(parsed?.suggestedFixes) ? parsed.suggestedFixes.slice(0, 6).map(String) : withNotifications.suggestedFixes
      };
    } catch {
      return { ...withNotifications, answer: normalizeLexiReplyText(withNotifications.answer, { maxSentences: 2, maxChars: 320 }) };
    }
  }

  return {
    buildAdminCopilotSnapshot,
    buildAdminCopilotResponse
  };
}
