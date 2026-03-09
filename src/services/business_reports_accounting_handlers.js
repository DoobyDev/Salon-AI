export function createBusinessReportsAccountingHandlers({
  resolveManagedBusinessId,
  isValidEmail,
  randomUUID,
  businessReportQueueService,
  writeAuditLog,
  accountingIntegrationsService,
  supportedAccountingProviders
} = {}) {
  async function businessReportEmailHandler(req, res) {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

    const recipientEmail = String(req.body?.recipientEmail || "").trim().toLowerCase();
    const subject = String(req.body?.subject || "").trim();
    const note = String(req.body?.note || "").trim();
    const report = req.body?.report && typeof req.body.report === "object" ? req.body.report : null;
    if (!recipientEmail) return res.status(400).json({ error: "Recipient email is required." });
    if (!isValidEmail(recipientEmail)) return res.status(400).json({ error: "Invalid recipient email format." });
    if (!report) return res.status(400).json({ error: "Report payload is required." });

    const queuedAt = new Date().toISOString();
    const item = {
      id: randomUUID(),
      businessId,
      recipientEmail,
      subject: subject || `Business Report (${queuedAt.slice(0, 10)})`,
      note,
      report,
      queuedAt,
      status: "queued",
      requestedBy: {
        userId: String(req.auth?.sub || ""),
        role: String(req.auth?.role || ""),
        email: String(req.auth?.email || "")
      }
    };
    await businessReportQueueService.enqueueBusinessReportEmailRequest(item);

    await writeAuditLog({
      actorId: req.auth.sub,
      actorRole: req.auth.role,
      action: "business_report.email_queued",
      entityType: "business_report",
      entityId: item.id,
      metadata: { businessId, recipientEmail }
    });

    return res.json({
      ok: true,
      queued: true,
      deliveryMode: "queue",
      id: item.id,
      queuedAt
    });
  }

  async function accountingIntegrationsListHandler(req, res) {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

    const record = await accountingIntegrationsService.loadAccountingIntegrationsRecord(businessId);
    return res.json({
      providers: accountingIntegrationsService.summarizeBusinessAccountingIntegrations(record),
      supportedProviders: supportedAccountingProviders
    });
  }

  async function accountingIntegrationsConnectHandler(req, res) {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

    const provider = accountingIntegrationsService.normalizeAccountingProvider(req.body?.provider);
    const accountLabel = String(req.body?.accountLabel || "").trim();
    const syncMode = String(req.body?.syncMode || "daily").trim().toLowerCase();
    const allowedSyncModes = new Set(["daily", "weekly", "manual"]);
    if (!provider) return res.status(400).json({ error: "Unsupported provider." });
    if (!accountLabel) return res.status(400).json({ error: "Account label is required." });
    if (!allowedSyncModes.has(syncMode)) return res.status(400).json({ error: "Unsupported sync mode." });

    const result = await accountingIntegrationsService.connectAccountingIntegration(businessId, {
      provider,
      accountLabel,
      syncMode
    });

    await writeAuditLog({
      actorId: req.auth.sub,
      actorRole: req.auth.role,
      action: "integration.accounting_connected",
      entityType: "integration",
      entityId: `${businessId}:${provider}`,
      metadata: { provider, syncMode }
    });

    return res.json({
      provider: result.provider,
      providers: result.providers
    });
  }

  async function accountingIntegrationsDisconnectHandler(req, res) {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

    const provider = accountingIntegrationsService.normalizeAccountingProvider(req.params.provider);
    if (!provider) return res.status(400).json({ error: "Unsupported provider." });

    let result;
    try {
      result = await accountingIntegrationsService.disconnectAccountingIntegration(businessId, provider);
    } catch (error) {
      if (error?.statusCode === 404) {
        return res.status(404).json({ error: "Provider is not connected for this business." });
      }
      throw error;
    }

    await writeAuditLog({
      actorId: req.auth.sub,
      actorRole: req.auth.role,
      action: "integration.accounting_disconnected",
      entityType: "integration",
      entityId: `${businessId}:${provider}`,
      metadata: { provider }
    });

    return res.json({
      provider: result.provider,
      providers: result.providers
    });
  }

  return {
    businessReportEmailHandler,
    accountingIntegrationsListHandler,
    accountingIntegrationsConnectHandler,
    accountingIntegrationsDisconnectHandler
  };
}
