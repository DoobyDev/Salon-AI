export function createCommercialControlsService({
  getPrisma,
  readCommercialControlsFile,
  writeCommercialControlsFile,
  supportedMembershipCycles,
  supportedCommercialStatus,
  supportedGiftCardStatus,
  supportedShipmentStatus,
  randomUuid
} = {}) {
  function prismaClient() {
    return typeof getPrisma === "function" ? getPrisma() : null;
  }

  function normalizeCommercialRecord(record) {
    const source = record && typeof record === "object" ? record : {};
    const memberships = (Array.isArray(source.memberships) ? source.memberships : [])
      .map((item) => {
        const price = Number(item?.price || 0);
        const billingCycle = String(item?.billingCycle || "monthly").trim().toLowerCase();
        const status = String(item?.status || "active").trim().toLowerCase();
        return {
          id: String(item?.id || "").trim(),
          name: String(item?.name || "").trim(),
          price: Number.isFinite(price) ? Number(price.toFixed(2)) : 0,
          billingCycle: supportedMembershipCycles.has(billingCycle) ? billingCycle : "monthly",
          status: supportedCommercialStatus.has(status) ? status : "active",
          benefits: String(item?.benefits || "").trim(),
          updatedAt: item?.updatedAt || null
        };
      })
      .filter((item) => item.id && item.name);

    const packages = (Array.isArray(source.packages) ? source.packages : [])
      .map((item) => {
        const price = Number(item?.price || 0);
        const sessionCount = Math.max(1, Math.floor(Number(item?.sessionCount || 1)));
        const remainingSessions = Math.max(
          0,
          Math.min(sessionCount, Math.floor(Number(item?.remainingSessions ?? sessionCount)))
        );
        const status = String(item?.status || "active").trim().toLowerCase();
        return {
          id: String(item?.id || "").trim(),
          name: String(item?.name || "").trim(),
          price: Number.isFinite(price) ? Number(price.toFixed(2)) : 0,
          sessionCount,
          remainingSessions,
          status: supportedCommercialStatus.has(status) ? status : "active",
          updatedAt: item?.updatedAt || null
        };
      })
      .filter((item) => item.id && item.name);

    const giftCards = (Array.isArray(source.giftCards) ? source.giftCards : [])
      .map((item) => {
        const initialBalance = Math.max(0, Number(item?.initialBalance || 0));
        const remainingBalance = Math.max(0, Number(item?.remainingBalance ?? initialBalance));
        const status = String(item?.status || "active").trim().toLowerCase();
        return {
          id: String(item?.id || "").trim(),
          code: String(item?.code || "").trim(),
          purchaserName: String(item?.purchaserName || "").trim(),
          recipientName: String(item?.recipientName || "").trim(),
          initialBalance: Number(initialBalance.toFixed(2)),
          remainingBalance: Number(remainingBalance.toFixed(2)),
          status:
            remainingBalance <= 0
              ? "redeemed"
              : supportedGiftCardStatus.has(status)
                ? status
                : "active",
          issuedAt: item?.issuedAt || null,
          expiresAt: item?.expiresAt || null,
          updatedAt: item?.updatedAt || null
        };
      })
      .filter((item) => item.id && item.code);

    const merch = (Array.isArray(source.merch) ? source.merch : [])
      .map((item) => {
        const salePrice = Number(item?.salePrice || 0);
        const shippingCost = Math.max(0, Number(item?.shippingCost || 0));
        const inventory = Math.max(0, Math.floor(Number(item?.inventory || 0)));
        const status = String(item?.status || "active").trim().toLowerCase();
        const shipments = (Array.isArray(item?.shipments) ? item.shipments : [])
          .map((shipment) => {
            const shipmentStatus = String(shipment?.status || "preparing").trim().toLowerCase();
            const shippingFee = Math.max(0, Number(shipment?.shippingFee || 0));
            return {
              id: String(shipment?.id || "").trim(),
              customerName: String(shipment?.customerName || "").trim(),
              customerEmail: String(shipment?.customerEmail || "").trim().toLowerCase(),
              shippingAddress: String(shipment?.shippingAddress || "").trim(),
              shippingCity: String(shipment?.shippingCity || "").trim(),
              shippingPostcode: String(shipment?.shippingPostcode || "").trim(),
              shippingCountry: String(shipment?.shippingCountry || "").trim(),
              shippingFee: Number(shippingFee.toFixed(2)),
              trackingRef: String(shipment?.trackingRef || "").trim(),
              status: supportedShipmentStatus.has(shipmentStatus) ? shipmentStatus : "preparing",
              createdAt: shipment?.createdAt || null,
              updatedAt: shipment?.updatedAt || null
            };
          })
          .filter((shipment) => shipment.id && shipment.customerName && shipment.shippingAddress);
        return {
          id: String(item?.id || "").trim(),
          name: String(item?.name || "").trim(),
          description: String(item?.description || "").trim(),
          imageUrl: String(item?.imageUrl || "").trim(),
          salePrice: Number.isFinite(salePrice) ? Number(salePrice.toFixed(2)) : 0,
          shippingAvailable: Boolean(item?.shippingAvailable),
          shippingCost: Number(shippingCost.toFixed(2)),
          inventory,
          status: supportedCommercialStatus.has(status) ? status : "active",
          updatedAt: item?.updatedAt || null,
          shipments
        };
      })
      .filter((item) => item.id && item.name);

    return { memberships, packages, giftCards, merch };
  }

  function summarizeCommercialRecord(record) {
    const normalized = normalizeCommercialRecord(record);
    const outstandingGiftBalance = normalized.giftCards
      .filter((gift) => gift.status === "active")
      .reduce((sum, gift) => sum + Number(gift.remainingBalance || 0), 0);
    return {
      activeMemberships: normalized.memberships.filter((m) => m.status === "active").length,
      activePackages: normalized.packages.filter((p) => p.status === "active").length,
      activeGiftCards: normalized.giftCards.filter((g) => g.status === "active").length,
      outstandingGiftBalance: Number(outstandingGiftBalance.toFixed(2)),
      activeMerchItems: normalized.merch.filter((item) => item.status === "active").length,
      shippableMerchItems: normalized.merch.filter((item) => item.status === "active" && item.shippingAvailable).length,
      pendingMerchShipments: normalized.merch.reduce(
        (sum, item) => sum + item.shipments.filter((shipment) => shipment.status === "preparing" || shipment.status === "shipped").length,
        0
      ),
      merchCatalogValue: Number(
        normalized.merch
          .filter((item) => item.status === "active")
          .reduce((sum, item) => sum + Number(item.salePrice || 0) * Number(item.inventory || 0), 0)
          .toFixed(2)
      )
    };
  }

  function hasPrismaCommercialControlModels() {
    const prisma = prismaClient();
    return Boolean(
      prisma?.commercialMembership &&
      prisma?.commercialPackage &&
      prisma?.commercialGiftCard &&
      typeof prisma.commercialMembership.findMany === "function" &&
      typeof prisma.commercialMembership.deleteMany === "function" &&
      typeof prisma.commercialMembership.createMany === "function" &&
      typeof prisma.commercialPackage.findMany === "function" &&
      typeof prisma.commercialPackage.deleteMany === "function" &&
      typeof prisma.commercialPackage.createMany === "function" &&
      typeof prisma.commercialGiftCard.findMany === "function" &&
      typeof prisma.commercialGiftCard.deleteMany === "function" &&
      typeof prisma.commercialGiftCard.createMany === "function"
    );
  }

  function isPrismaCommercialStorageUnavailable(error) {
    const code = String(error?.code || "").trim();
    if (code === "P2021" || code === "P2022") return true;
    const msg = String(error?.message || "").toLowerCase();
    if (msg.includes("prisma is not initialized")) return true;
    return msg.includes("commercial");
  }

  function mapCommercialMembershipDbRow(row) {
    return {
      id: String(row?.id || "").trim(),
      name: String(row?.name || "").trim(),
      price: Number(Number(row?.price || 0).toFixed(2)),
      billingCycle: String(row?.billingCycle || "monthly").trim().toLowerCase(),
      status: String(row?.status || "active").trim().toLowerCase(),
      benefits: String(row?.benefits || "").trim(),
      updatedAt: row?.updatedAt ? new Date(row.updatedAt).toISOString() : null
    };
  }

  function mapCommercialPackageDbRow(row) {
    return {
      id: String(row?.id || "").trim(),
      name: String(row?.name || "").trim(),
      price: Number(Number(row?.price || 0).toFixed(2)),
      sessionCount: Math.floor(Number(row?.sessionCount || 1)),
      remainingSessions: Math.floor(Number(row?.remainingSessions || 0)),
      status: String(row?.status || "active").trim().toLowerCase(),
      updatedAt: row?.updatedAt ? new Date(row.updatedAt).toISOString() : null
    };
  }

  function mapCommercialGiftCardDbRow(row) {
    return {
      id: String(row?.id || "").trim(),
      code: String(row?.code || "").trim(),
      purchaserName: String(row?.purchaserName || "").trim(),
      recipientName: String(row?.recipientName || "").trim(),
      initialBalance: Number(Number(row?.initialBalance || 0).toFixed(2)),
      remainingBalance: Number(Number(row?.remainingBalance || 0).toFixed(2)),
      status: String(row?.status || "active").trim().toLowerCase(),
      issuedAt: row?.issuedAt ? new Date(row.issuedAt).toISOString() : null,
      expiresAt: row?.expiresAt ? new Date(row.expiresAt).toISOString() : null,
      updatedAt: row?.updatedAt ? new Date(row.updatedAt).toISOString() : null
    };
  }

  async function loadCommercialRecordFromPrisma(businessId) {
    if (!hasPrismaCommercialControlModels()) return null;
    const prisma = prismaClient();
    try {
      const [memberships, packages, giftCards] = await Promise.all([
        prisma.commercialMembership.findMany({ where: { businessId }, orderBy: [{ updatedAt: "asc" }, { id: "asc" }] }),
        prisma.commercialPackage.findMany({ where: { businessId }, orderBy: [{ updatedAt: "asc" }, { id: "asc" }] }),
        prisma.commercialGiftCard.findMany({ where: { businessId }, orderBy: [{ issuedAt: "asc" }, { id: "asc" }] })
      ]);
      return normalizeCommercialRecord({
        memberships: memberships.map(mapCommercialMembershipDbRow),
        packages: packages.map(mapCommercialPackageDbRow),
        giftCards: giftCards.map(mapCommercialGiftCardDbRow)
      });
    } catch (error) {
      if (isPrismaCommercialStorageUnavailable(error)) return null;
      throw error;
    }
  }

  async function loadCommercialRecord(businessId) {
    const all = await readCommercialControlsFile();
    const fileRecord = normalizeCommercialRecord(all?.[businessId]);
    const dbRecord = await loadCommercialRecordFromPrisma(businessId);
    if (!dbRecord) return fileRecord;
    return normalizeCommercialRecord({
      ...fileRecord,
      memberships: dbRecord.memberships,
      packages: dbRecord.packages,
      giftCards: dbRecord.giftCards
    });
  }

  async function saveCommercialRecord(businessId, record) {
    const normalized = normalizeCommercialRecord(record);

    if (hasPrismaCommercialControlModels()) {
      const prisma = prismaClient();
      try {
        await prisma.commercialMembership.deleteMany({ where: { businessId } });
        if (normalized.memberships.length) {
          await prisma.commercialMembership.createMany({
            data: normalized.memberships.map((row) => ({
              id: row.id,
              businessId,
              name: row.name,
              price: Number(row.price || 0),
              billingCycle: row.billingCycle,
              status: row.status,
              benefits: row.benefits || ""
            }))
          });
        }

        await prisma.commercialPackage.deleteMany({ where: { businessId } });
        if (normalized.packages.length) {
          await prisma.commercialPackage.createMany({
            data: normalized.packages.map((row) => ({
              id: row.id,
              businessId,
              name: row.name,
              price: Number(row.price || 0),
              sessionCount: Math.floor(Number(row.sessionCount || 1)),
              remainingSessions: Math.floor(Number(row.remainingSessions || 0)),
              status: row.status
            }))
          });
        }

        await prisma.commercialGiftCard.deleteMany({ where: { businessId } });
        if (normalized.giftCards.length) {
          await prisma.commercialGiftCard.createMany({
            data: normalized.giftCards.map((row) => ({
              id: row.id,
              businessId,
              code: row.code,
              purchaserName: row.purchaserName,
              recipientName: row.recipientName,
              initialBalance: Number(row.initialBalance || 0),
              remainingBalance: Number(row.remainingBalance || 0),
              status: row.status,
              issuedAt: row.issuedAt ? new Date(row.issuedAt) : new Date(),
              expiresAt: row.expiresAt ? new Date(row.expiresAt) : null
            }))
          });
        }
      } catch (error) {
        if (!isPrismaCommercialStorageUnavailable(error)) throw error;
      }
    }

    const all = await readCommercialControlsFile();
    all[businessId] = normalized;
    await writeCommercialControlsFile(all);
    return normalized;
  }

  async function upsertMembership(businessId, payload) {
    const record = await loadCommercialRecord(businessId);
    const rows = Array.isArray(record.memberships) ? record.memberships : [];
    const index = rows.findIndex((item) => item.id === payload.id);
    const membership = {
      id: payload.id,
      name: payload.name,
      price: Number(Number(payload.price || 0).toFixed(2)),
      billingCycle: payload.billingCycle,
      status: payload.status,
      benefits: payload.benefits || "",
      updatedAt: new Date().toISOString()
    };
    if (index >= 0) rows[index] = membership;
    else rows.push(membership);
    record.memberships = rows;
    await saveCommercialRecord(businessId, record);
    return { membership, record, summary: summarizeCommercialRecord(record) };
  }

  async function upsertPackage(businessId, payload) {
    const record = await loadCommercialRecord(businessId);
    const rows = Array.isArray(record.packages) ? record.packages : [];
    const index = rows.findIndex((item) => item.id === payload.id);
    const pkg = {
      id: payload.id,
      name: payload.name,
      price: Number(Number(payload.price || 0).toFixed(2)),
      sessionCount: payload.sessionCount,
      remainingSessions: payload.remainingSessions,
      status: payload.status,
      updatedAt: new Date().toISOString()
    };
    if (index >= 0) rows[index] = pkg;
    else rows.push(pkg);
    record.packages = rows;
    await saveCommercialRecord(businessId, record);
    return { package: pkg, record, summary: summarizeCommercialRecord(record) };
  }

  async function issueGiftCard(businessId, payload) {
    const record = await loadCommercialRecord(businessId);
    const rows = Array.isArray(record.giftCards) ? record.giftCards : [];
    const code = payload.code || `GIFT-${randomUuid().slice(0, 8).toUpperCase()}`;
    const id = randomUuid();
    const now = new Date().toISOString();
    const giftCard = {
      id,
      code,
      purchaserName: payload.purchaserName,
      recipientName: payload.recipientName,
      initialBalance: Number(Number(payload.initialBalance || 0).toFixed(2)),
      remainingBalance: Number(Number(payload.initialBalance || 0).toFixed(2)),
      status: "active",
      issuedAt: now,
      expiresAt: payload.expiresAt || null,
      updatedAt: now
    };
    rows.push(giftCard);
    record.giftCards = rows;
    await saveCommercialRecord(businessId, record);
    return { giftCard, record, summary: summarizeCommercialRecord(record) };
  }

  async function redeemGiftCard(businessId, giftCardId, amount) {
    const record = await loadCommercialRecord(businessId);
    const rows = Array.isArray(record.giftCards) ? record.giftCards : [];
    const index = rows.findIndex((item) => item.id === giftCardId);
    if (index < 0) throw Object.assign(new Error("Gift card not found."), { statusCode: 404 });
    if (rows[index].status !== "active") {
      throw Object.assign(new Error("Gift card is not active."), { statusCode: 400, publicMessage: "Gift card is not active." });
    }
    if (amount > Number(rows[index].remainingBalance || 0)) {
      throw Object.assign(new Error("Redeem amount exceeds remaining balance."), {
        statusCode: 400,
        publicMessage: "Redeem amount exceeds remaining balance."
      });
    }
    const nextBalance = Number((Number(rows[index].remainingBalance || 0) - amount).toFixed(2));
    rows[index] = {
      ...rows[index],
      remainingBalance: nextBalance,
      status: nextBalance <= 0 ? "redeemed" : "active",
      updatedAt: new Date().toISOString()
    };
    record.giftCards = rows;
    await saveCommercialRecord(businessId, record);
    return { giftCard: rows[index], record, summary: summarizeCommercialRecord(record), remainingBalance: nextBalance };
  }

  async function upsertMerchItem(businessId, payload) {
    const record = await loadCommercialRecord(businessId);
    const rows = Array.isArray(record.merch) ? record.merch : [];
    const index = rows.findIndex((item) => item.id === payload.id);
    const current = index >= 0 ? rows[index] : null;
    const merchItem = {
      id: payload.id,
      name: payload.name,
      description: payload.description,
      imageUrl: payload.imageUrl || "",
      salePrice: Number(Number(payload.salePrice || 0).toFixed(2)),
      shippingAvailable: Boolean(payload.shippingAvailable),
      shippingCost: Number(Number(payload.shippingCost || 0).toFixed(2)),
      inventory: Math.max(0, Math.floor(Number(payload.inventory || 0))),
      status: payload.status,
      updatedAt: new Date().toISOString(),
      shipments: Array.isArray(current?.shipments) ? current.shipments : []
    };
    if (index >= 0) rows[index] = merchItem;
    else rows.push(merchItem);
    record.merch = rows;
    await saveCommercialRecord(businessId, record);
    return { merchItem, record, summary: summarizeCommercialRecord(record) };
  }

  async function createMerchShipment(businessId, merchId, payload) {
    const record = await loadCommercialRecord(businessId);
    const rows = Array.isArray(record.merch) ? record.merch : [];
    const index = rows.findIndex((item) => item.id === merchId);
    if (index < 0) throw Object.assign(new Error("Product not found."), { statusCode: 404 });
    if (!rows[index].shippingAvailable) {
      throw Object.assign(new Error("Shipping is not enabled for this product."), {
        statusCode: 400,
        publicMessage: "Shipping is not enabled for this product."
      });
    }

    const now = new Date().toISOString();
    const shipment = {
      id: randomUuid(),
      customerName: payload.customerName,
      customerEmail: payload.customerEmail || "",
      shippingAddress: payload.shippingAddress,
      shippingCity: payload.shippingCity || "",
      shippingPostcode: payload.shippingPostcode || "",
      shippingCountry: payload.shippingCountry || "",
      shippingFee: Number(Number(payload.shippingFee || 0).toFixed(2)),
      trackingRef: payload.trackingRef || "",
      status: payload.status,
      createdAt: now,
      updatedAt: now
    };
    rows[index] = {
      ...rows[index],
      inventory: Math.max(0, Number(rows[index].inventory || 0) - 1),
      updatedAt: now,
      shipments: [shipment, ...(Array.isArray(rows[index].shipments) ? rows[index].shipments : [])]
    };
    record.merch = rows;
    await saveCommercialRecord(businessId, record);
    return { merchItem: rows[index], shipment, record, summary: summarizeCommercialRecord(record) };
  }

  return {
    normalizeCommercialRecord,
    summarizeCommercialRecord,
    loadCommercialRecord,
    saveCommercialRecord,
    upsertMembership,
    upsertPackage,
    issueGiftCard,
    redeemGiftCard,
    upsertMerchItem,
    createMerchShipment
  };
}
