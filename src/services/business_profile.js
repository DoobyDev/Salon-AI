export function createBusinessProfileService({
  getPrisma,
  normalizeBusinessType,
  defaultDescriptionByBusinessType,
  defaultHoursByBusinessType,
  defaultServicesByBusinessType,
  parseHours,
  normalizeBusinessHoursInput,
  normalizeBusinessServicesInput
} = {}) {
  function prismaClient() {
    return typeof getPrisma === "function" ? getPrisma() : null;
  }

  function formatBusinessProfileResponse(business) {
    return {
      business: {
        id: business.id,
        name: business.name,
        type: normalizeBusinessType(business.type),
        phone: String(business.phone || ""),
        email: String(business.email || ""),
        city: String(business.city || ""),
        country: String(business.country || ""),
        postcode: String(business.postcode || ""),
        address: String(business.address || ""),
        description: String(business.description || ""),
        websiteUrl: String(business.websiteUrl || ""),
        websiteTitle: String(business.websiteTitle || ""),
        websiteSummary: String(business.websiteSummary || ""),
        websiteImageUrl: String(business.websiteImageUrl || ""),
        hours: normalizeBusinessHoursInput(parseHours(business.hoursJson)),
        services: (Array.isArray(business.services) ? business.services : []).map((row) => ({
          name: String(row.name || ""),
          durationMin: Number(row.durationMin || 0),
          price: Number(row.price || 0)
        }))
      }
    };
  }

  async function loadBusinessProfile(businessId) {
    const prisma = prismaClient();
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { services: { orderBy: [{ createdAt: "asc" }, { name: "asc" }] } }
    });
    if (!business) {
      throw Object.assign(new Error("Business not found."), { statusCode: 404 });
    }
    return business;
  }

  async function saveBusinessProfile(businessId, payload) {
    const prisma = prismaClient();
    const normalizedHours = normalizeBusinessHoursInput(payload.hours);
    const normalizedServices = normalizeBusinessServicesInput(payload.services);
    const business = await prisma.business.findUnique({ where: { id: businessId }, select: { id: true } });
    if (!business) {
      throw Object.assign(new Error("Business not found."), { statusCode: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.business.update({
        where: { id: businessId },
        data: {
          name: payload.name,
          type: payload.type,
          phone: payload.phone,
          email: payload.email,
          city: payload.city,
          country: payload.country,
          postcode: payload.postcode,
          address: payload.address,
          description: payload.description || defaultDescriptionByBusinessType(payload.type, payload.name),
          websiteUrl: payload.websiteUrl || null,
          websiteTitle: payload.websiteTitle || null,
          websiteSummary: payload.websiteSummary || null,
          websiteImageUrl: payload.websiteImageUrl || null,
          hoursJson: JSON.stringify(normalizedHours)
        }
      });
      await tx.service.deleteMany({ where: { businessId } });
      await tx.service.createMany({
        data: normalizedServices.map((row) => ({
          businessId,
          name: row.name,
          durationMin: row.durationMin,
          price: row.price
        }))
      });
    });

    return {
      business: await loadBusinessProfile(businessId),
      normalizedHours,
      normalizedServices
    };
  }

  async function applyBusinessTemplate(businessId, requestedType) {
    const prisma = prismaClient();
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, name: true }
    });
    if (!business) {
      throw Object.assign(new Error("Business not found."), { statusCode: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.business.update({
        where: { id: businessId },
        data: {
          type: requestedType,
          description: defaultDescriptionByBusinessType(requestedType, business.name),
          hoursJson: JSON.stringify(defaultHoursByBusinessType(requestedType))
        }
      });
      await tx.service.deleteMany({ where: { businessId } });
      await tx.service.createMany({
        data: defaultServicesByBusinessType(requestedType).map((row) => ({
          businessId,
          name: row.name,
          durationMin: row.durationMin,
          price: row.price
        }))
      });
    });

    return await loadBusinessProfile(businessId);
  }

  return {
    formatBusinessProfileResponse,
    loadBusinessProfile,
    saveBusinessProfile,
    applyBusinessTemplate
  };
}
