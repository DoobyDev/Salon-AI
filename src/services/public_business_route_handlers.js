export function createPublicBusinessRouteHandlers({
  prisma,
  parsePageSize,
  decodeCursor,
  encodeCursor,
  businessTypeSearchValues,
  makeCacheKey,
  getCached,
  setCached,
  mapBusiness,
  getAvailableSlotsForBusiness
} = {}) {
  async function searchBusinessesHandler(req, res) {
    const name = String(req.query.name || "");
    const location = String(req.query.location || "");
    const postcode = String(req.query.postcode || "");
    const phone = String(req.query.phone || "");
    const businessType = String(req.query.businessType || "");
    const includeSlots = String(req.query.includeSlots || "").trim() === "1";
    const limit = parsePageSize(req.query.limit, 25);
    const cursorPayload = decodeCursor(req.query.cursor);
    const cursorDate = cursorPayload?.createdAt ? new Date(cursorPayload.createdAt) : null;
    const cursorId = cursorPayload?.id ? String(cursorPayload.id) : "";

    const filterAnd = [
      name ? { name: { contains: name, mode: "insensitive" } } : {},
      postcode ? { postcode: { contains: postcode, mode: "insensitive" } } : {},
      phone ? { phone: { contains: phone, mode: "insensitive" } } : {},
      businessType ? { type: { in: businessTypeSearchValues(businessType) } } : {},
      location
        ? {
            OR: [
              { city: { contains: location, mode: "insensitive" } },
              { country: { contains: location, mode: "insensitive" } }
            ]
          }
        : {}
    ];

    if (cursorDate && cursorId) {
      filterAnd.push({
        OR: [
          { createdAt: { lt: cursorDate } },
          { AND: [{ createdAt: cursorDate }, { id: { lt: cursorId } }] }
        ]
      });
    }

    const cacheKey = makeCacheKey([
      "search:v2",
      name,
      location,
      postcode,
      phone,
      businessType,
      includeSlots ? "slots" : "noslots",
      limit,
      req.query.cursor || ""
    ]);
    if (!includeSlots) {
      const cached = await getCached(cacheKey);
      if (cached) return res.json(cached);
    }

    const businesses = await prisma.business.findMany({
      where: { AND: filterAnd },
      include: { services: true },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1
    });

    const hasMore = businesses.length > limit;
    const pageRows = businesses.slice(0, limit);
    const mapped = includeSlots
      ? await Promise.all(
          pageRows.map(async (business) => mapBusiness(business, { includeSlots: true, availableSlots: await getAvailableSlotsForBusiness(business) }))
        )
      : pageRows.map((business) => mapBusiness(business, { includeSlots: false }));
    const last = pageRows[pageRows.length - 1];
    const nextCursor = hasMore && last ? encodeCursor({ id: last.id, createdAt: last.createdAt.toISOString() }) : null;

    const payload = {
      results: mapped,
      pagination: {
        limit,
        hasMore,
        nextCursor
      }
    };
    if (!includeSlots) await setCached(cacheKey, payload, 15_000);
    return res.json(payload);
  }

  async function publicBusinessDetailHandler(req, res) {
    const business = await prisma.business.findUnique({
      where: { id: req.params.businessId },
      include: { services: true }
    });
    if (!business) return res.status(404).json({ error: "Business not found." });
    const slots = await getAvailableSlotsForBusiness(business);
    return res.json({ business: mapBusiness(business, { includeSlots: true, availableSlots: slots }) });
  }

  return {
    searchBusinessesHandler,
    publicBusinessDetailHandler
  };
}
