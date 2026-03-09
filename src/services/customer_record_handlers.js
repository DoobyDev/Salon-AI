export function createCustomerRecordHandlers({
  resolveManagedBusinessId,
  customerRecordsService,
  writeAuditLog
} = {}) {
  async function customerRecordsListHandler(req, res) {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

    const records = await customerRecordsService.getCustomerRecordsForBusiness(businessId);
    return res.json({ records });
  }

  async function customerRecordsUpsertHandler(req, res) {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

    const customerKey = String(req.body?.customerKey || "").trim();
    const customerName = String(req.body?.customerName || "").trim();
    const customerEmail = String(req.body?.customerEmail || "").trim().toLowerCase();
    const customerPhone = String(req.body?.customerPhone || "").trim();

    if (!customerKey || !customerName) {
      return res.status(400).json({ error: "Customer key and name are required." });
    }

    const record = await customerRecordsService.upsertCustomerRecordForBusiness(businessId, {
      customerKey,
      customerName,
      customerEmail,
      customerPhone,
      allergies: String(req.body?.allergies || "").trim(),
      formulaNotes: String(req.body?.formulaNotes || "").trim(),
      consultationNotes: String(req.body?.consultationNotes || "").trim(),
      visitPrepNotes: String(req.body?.visitPrepNotes || "").trim(),
      preferredStylist: String(req.body?.preferredStylist || "").trim(),
      patchTestRequired: Boolean(req.body?.patchTestRequired)
    });

    await writeAuditLog({
      actorId: req.auth.sub,
      actorRole: req.auth.role,
      action: "customer.record_saved",
      entityType: "customer_record",
      entityId: customerKey,
      metadata: { businessId, customerName }
    });

    return res.json({ record });
  }

  return {
    customerRecordsListHandler,
    customerRecordsUpsertHandler
  };
}
