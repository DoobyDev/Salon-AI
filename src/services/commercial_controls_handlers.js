export function createCommercialControlsHandlers({
  resolveManagedBusinessId,
  commercialControlsService,
  supportedMembershipCycles,
  supportedCommercialStatus,
  supportedShipmentStatus,
  randomUUID,
  parseBooleanInput,
  writeAuditLog
} = {}) {
  async function commercialControlsHandler(req, res) {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

    const record = await commercialControlsService.loadCommercialRecord(businessId);
    return res.json({
      ...record,
      summary: commercialControlsService.summarizeCommercialRecord(record)
    });
  }

  async function upsertMembershipHandler(req, res) {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

    const id = String(req.body?.id || "").trim() || randomUUID();
    const name = String(req.body?.name || "").trim();
    const price = Number(req.body?.price || 0);
    const billingCycle = String(req.body?.billingCycle || "monthly").trim().toLowerCase();
    const status = String(req.body?.status || "active").trim().toLowerCase();
    const benefits = String(req.body?.benefits || "").trim();
    if (!name) return res.status(400).json({ error: "Membership name is required." });
    if (!Number.isFinite(price) || price < 0) return res.status(400).json({ error: "Membership price must be valid." });
    if (!supportedMembershipCycles.has(billingCycle)) return res.status(400).json({ error: "Unsupported billing cycle." });
    if (!supportedCommercialStatus.has(status)) return res.status(400).json({ error: "Unsupported membership status." });

    const result = await commercialControlsService.upsertMembership(businessId, {
      id,
      name,
      price,
      billingCycle,
      status,
      benefits
    });

    await writeAuditLog({
      actorId: req.auth.sub,
      actorRole: req.auth.role,
      action: "commercial.membership_upserted",
      entityType: "commercial",
      entityId: id,
      metadata: { businessId, billingCycle, status }
    });

    return res.json({
      membership: result.membership,
      ...result.record,
      summary: result.summary
    });
  }

  async function upsertPackageHandler(req, res) {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

    const id = String(req.body?.id || "").trim() || randomUUID();
    const name = String(req.body?.name || "").trim();
    const price = Number(req.body?.price || 0);
    const sessionCount = Math.floor(Number(req.body?.sessionCount || 0));
    const remainingSessions = req.body?.remainingSessions === undefined
      ? sessionCount
      : Math.floor(Number(req.body?.remainingSessions || 0));
    const status = String(req.body?.status || "active").trim().toLowerCase();
    if (!name) return res.status(400).json({ error: "Package name is required." });
    if (!Number.isFinite(price) || price < 0) return res.status(400).json({ error: "Package price must be valid." });
    if (!Number.isInteger(sessionCount) || sessionCount <= 0) {
      return res.status(400).json({ error: "Session count must be greater than zero." });
    }
    if (!Number.isInteger(remainingSessions) || remainingSessions < 0 || remainingSessions > sessionCount) {
      return res.status(400).json({ error: "Remaining sessions must be between 0 and session count." });
    }
    if (!supportedCommercialStatus.has(status)) return res.status(400).json({ error: "Unsupported package status." });

    const result = await commercialControlsService.upsertPackage(businessId, {
      id,
      name,
      price,
      sessionCount,
      remainingSessions,
      status
    });

    await writeAuditLog({
      actorId: req.auth.sub,
      actorRole: req.auth.role,
      action: "commercial.package_upserted",
      entityType: "commercial",
      entityId: id,
      metadata: { businessId, sessionCount, status }
    });

    return res.json({
      package: result.package,
      ...result.record,
      summary: result.summary
    });
  }

  async function issueGiftCardHandler(req, res) {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

    const purchaserName = String(req.body?.purchaserName || "").trim();
    const recipientName = String(req.body?.recipientName || "").trim();
    const initialBalance = Number(req.body?.initialBalance || 0);
    const codeInput = String(req.body?.code || "").trim().toUpperCase();
    const expiresAtInput = String(req.body?.expiresAt || "").trim();
    if (!purchaserName) return res.status(400).json({ error: "Purchaser name is required." });
    if (!recipientName) return res.status(400).json({ error: "Recipient name is required." });
    if (!Number.isFinite(initialBalance) || initialBalance <= 0) {
      return res.status(400).json({ error: "Gift card balance must be greater than zero." });
    }
    if (expiresAtInput && Number.isNaN(new Date(expiresAtInput).getTime())) {
      return res.status(400).json({ error: "Gift card expiry date is invalid." });
    }

    const result = await commercialControlsService.issueGiftCard(businessId, {
      purchaserName,
      recipientName,
      initialBalance,
      code: codeInput,
      expiresAt: expiresAtInput || null
    });

    await writeAuditLog({
      actorId: req.auth.sub,
      actorRole: req.auth.role,
      action: "commercial.gift_card_issued",
      entityType: "commercial",
      entityId: result.giftCard.id,
      metadata: { businessId, code: result.giftCard.code, initialBalance: result.giftCard.initialBalance }
    });

    return res.json({
      giftCard: result.giftCard,
      ...result.record,
      summary: result.summary
    });
  }

  async function redeemGiftCardHandler(req, res) {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });
    const giftCardId = String(req.params.giftCardId || "").trim();
    if (!giftCardId) return res.status(400).json({ error: "Gift card id is required." });

    const amount = Number(req.body?.amount || 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: "Redeem amount must be greater than zero." });
    }

    let result;
    try {
      result = await commercialControlsService.redeemGiftCard(businessId, giftCardId, amount);
    } catch (error) {
      if (error?.statusCode === 404) return res.status(404).json({ error: "Gift card not found." });
      if (error?.statusCode === 400) {
        return res.status(400).json({ error: error.publicMessage || "Unable to redeem gift card." });
      }
      throw error;
    }

    await writeAuditLog({
      actorId: req.auth.sub,
      actorRole: req.auth.role,
      action: "commercial.gift_card_redeemed",
      entityType: "commercial",
      entityId: giftCardId,
      metadata: { businessId, amount: Number(amount.toFixed(2)), remainingBalance: result.remainingBalance }
    });

    return res.json({
      giftCard: result.giftCard,
      ...result.record,
      summary: result.summary
    });
  }

  async function upsertMerchHandler(req, res) {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

    const id = String(req.body?.id || "").trim() || randomUUID();
    const name = String(req.body?.name || "").trim();
    const description = String(req.body?.description || "").trim();
    const imageUrl = String(req.body?.imageUrl || "").trim();
    const salePrice = Number(req.body?.salePrice || 0);
    const shippingAvailable = parseBooleanInput(req.body?.shippingAvailable);
    const shippingCost = Number(req.body?.shippingCost || 0);
    const inventory = Math.max(0, Math.floor(Number(req.body?.inventory || 0)));
    const status = String(req.body?.status || "active").trim().toLowerCase();

    if (!name) return res.status(400).json({ error: "Product name is required." });
    if (!description) return res.status(400).json({ error: "Product description is required." });
    if (!Number.isFinite(salePrice) || salePrice < 0) return res.status(400).json({ error: "Sale price must be valid." });
    if (!Number.isFinite(shippingCost) || shippingCost < 0) return res.status(400).json({ error: "Shipping cost must be valid." });
    if (!supportedCommercialStatus.has(status)) return res.status(400).json({ error: "Unsupported product status." });

    const result = await commercialControlsService.upsertMerchItem(businessId, {
      id,
      name,
      description,
      imageUrl,
      salePrice,
      shippingAvailable,
      shippingCost,
      inventory,
      status
    });

    await writeAuditLog({
      actorId: req.auth.sub,
      actorRole: req.auth.role,
      action: "commercial.merch_upserted",
      entityType: "commercial",
      entityId: id,
      metadata: { businessId, shippingAvailable, inventory, status }
    });

    return res.json({
      merchItem: result.merchItem,
      ...result.record,
      summary: result.summary
    });
  }

  async function createMerchShipmentHandler(req, res) {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

    const merchId = String(req.params.merchId || "").trim();
    const customerName = String(req.body?.customerName || "").trim();
    const customerEmail = String(req.body?.customerEmail || "").trim().toLowerCase();
    const shippingAddress = String(req.body?.shippingAddress || "").trim();
    const shippingCity = String(req.body?.shippingCity || "").trim();
    const shippingPostcode = String(req.body?.shippingPostcode || "").trim();
    const shippingCountry = String(req.body?.shippingCountry || "").trim();
    const shippingFee = Number(req.body?.shippingFee || 0);
    const trackingRef = String(req.body?.trackingRef || "").trim();
    const status = String(req.body?.status || "preparing").trim().toLowerCase();

    if (!merchId) return res.status(400).json({ error: "Product id is required." });
    if (!customerName) return res.status(400).json({ error: "Customer name is required." });
    if (!shippingAddress) return res.status(400).json({ error: "Shipping address is required." });
    if (!Number.isFinite(shippingFee) || shippingFee < 0) return res.status(400).json({ error: "Shipping fee must be valid." });
    if (!supportedShipmentStatus.has(status)) return res.status(400).json({ error: "Unsupported shipment status." });

    let result;
    try {
      result = await commercialControlsService.createMerchShipment(businessId, merchId, {
        customerName,
        customerEmail,
        shippingAddress,
        shippingCity,
        shippingPostcode,
        shippingCountry,
        shippingFee,
        trackingRef,
        status
      });
    } catch (error) {
      if (error?.statusCode === 404) return res.status(404).json({ error: "Product not found." });
      if (error?.statusCode === 400) {
        return res.status(400).json({ error: error.publicMessage || "Unable to create shipment." });
      }
      throw error;
    }

    await writeAuditLog({
      actorId: req.auth.sub,
      actorRole: req.auth.role,
      action: "commercial.merch_shipment_created",
      entityType: "commercial",
      entityId: result.shipment.id,
      metadata: { businessId, merchId, customerName, status }
    });

    return res.json({
      merchItem: result.merchItem,
      shipment: result.shipment,
      ...result.record,
      summary: result.summary
    });
  }

  return {
    commercialControlsHandler,
    upsertMembershipHandler,
    upsertPackageHandler,
    issueGiftCardHandler,
    redeemGiftCardHandler,
    upsertMerchHandler,
    createMerchShipmentHandler
  };
}
