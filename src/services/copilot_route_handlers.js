export function createCopilotRouteHandlers({
  isLexiRestrictedDataRequest,
  lexiRestrictedDataReply,
  subscriberCopilotService,
  adminCopilotService,
  writeAuditLog
} = {}) {
  async function subscriberCopilotHandler(req, res) {
    const question = String(req.body?.question || "").trim();
    const context = req.body?.context && typeof req.body.context === "object" ? req.body.context : null;
    if (!question) return res.status(400).json({ error: "Question is required." });
    if (question.length > 1200) return res.status(400).json({ error: "Question is too long." });

    if (isLexiRestrictedDataRequest(question, { role: "subscriber" })) {
      return res.json({
        answer: lexiRestrictedDataReply("subscriber dashboard", { role: "subscriber" }),
        findings: ["Private customer/user/business data and secrets are protected."],
        suggestedActions: [
          "Ask for a summary, guidance, or operational recommendation instead of raw personal data.",
          "Use role-based dashboard tools for authorized work without exposing protected data."
        ],
        snapshot: null
      });
    }

    try {
      const snapshot = await subscriberCopilotService.buildSubscriberCopilotSnapshot(req);
      if (!snapshot?.business?.id) {
        return res.status(400).json({ error: "No business scope available for subscriber copilot." });
      }

      const copilot = await subscriberCopilotService.buildSubscriberCopilotResponse({ question, snapshot, context });
      await writeAuditLog({
        actorId: req.auth.sub,
        actorRole: req.auth.role,
        action: "subscriber.copilot_query",
        entityType: "system",
        metadata: {
          questionLength: question.length,
          businessId: snapshot.business.id,
          hasUiContext: Boolean(context)
        }
      });

      return res.json({
        answer: copilot.answer,
        findings: copilot.findings,
        suggestedActions: copilot.suggestedActions,
        snapshot
      });
    } catch (error) {
      return res.status(500).json({ error: error.message || "Subscriber copilot unavailable." });
    }
  }

  async function adminCopilotHandler(req, res) {
    const question = String(req.body?.question || "").trim();
    const context = req.body?.context && typeof req.body.context === "object" ? req.body.context : null;
    if (!question) return res.status(400).json({ error: "Question is required." });
    if (question.length > 1200) return res.status(400).json({ error: "Question is too long." });

    if (isLexiRestrictedDataRequest(question, { role: "admin" })) {
      return res.json({
        answer: lexiRestrictedDataReply("admin/platform", { role: "admin" }),
        findings: ["Protected data, credentials, and internal system details are not disclosed in Lexi chat."],
        suggestedFixes: [
          "Ask for diagnostics summaries, trends, or recommended actions instead of raw protected data.",
          "Use approved admin tools and role-based access workflows for authorized support tasks."
        ],
        snapshot: null
      });
    }

    try {
      const snapshot = await adminCopilotService.buildAdminCopilotSnapshot(req);
      const copilot = await adminCopilotService.buildAdminCopilotResponse({ question, snapshot, context });
      await writeAuditLog({
        actorId: req.auth.sub,
        actorRole: req.auth.role,
        action: "admin.copilot_query",
        entityType: "system",
        metadata: {
          questionLength: question.length,
          hasManagedBusinessScope: Boolean(snapshot?.managedBusiness?.selected),
          hasUiContext: Boolean(context)
        }
      });

      return res.json({
        answer: copilot.answer,
        findings: copilot.findings,
        suggestedFixes: copilot.suggestedFixes,
        snapshot
      });
    } catch (error) {
      return res.status(500).json({ error: error.message || "Admin copilot unavailable." });
    }
  }

  return {
    subscriberCopilotHandler,
    adminCopilotHandler
  };
}
