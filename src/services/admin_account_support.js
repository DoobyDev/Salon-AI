export function createAdminAccountSupportService({
  getPrisma,
  normalizeBookingDateTime
} = {}) {
  function prismaClient() {
    return typeof getPrisma === "function" ? getPrisma() : null;
  }

  async function buildAdminSupportAccountPayload(userRow) {
    const prisma = prismaClient();
    if (!userRow || typeof userRow !== "object") return null;
    const role = String(userRow.role || "").trim().toLowerCase();
    const base = {
      id: String(userRow.id || "").trim(),
      role,
      name: String(userRow.name || "").trim(),
      email: String(userRow.email || "").trim().toLowerCase(),
      createdAt: userRow.createdAt ? new Date(userRow.createdAt).toISOString() : null
    };

    if (role === "subscriber") {
      const businessId = String(userRow.businessId || userRow.business?.id || "").trim();
      const [bookingCount, revenueAgg, latestBooking] = businessId
        ? await Promise.all([
            prisma.booking.count({ where: { businessId } }),
            prisma.booking.aggregate({
              where: { businessId, status: { not: "cancelled" } },
              _sum: { price: true }
            }),
            prisma.booking.findFirst({
              where: { businessId },
              select: { createdAt: true, date: true, time: true },
              orderBy: [{ date: "desc" }, { time: "desc" }, { createdAt: "desc" }]
            })
          ])
        : [0, { _sum: { price: 0 } }, null];

      return {
        ...base,
        business: userRow.business
          ? {
              id: String(userRow.business.id || "").trim(),
              name: String(userRow.business.name || "").trim(),
              type: String(userRow.business.type || "").trim(),
              city: String(userRow.business.city || "").trim(),
              country: String(userRow.business.country || "").trim()
            }
          : null,
        stats: {
          bookingCount,
          revenue: Number(revenueAgg?._sum?.price || 0),
          planStatus: String(userRow.business?.subscription?.status || "not connected").trim(),
          planLabel: String(userRow.business?.subscription?.plan || "no plan").trim(),
          lastBookingAt: latestBooking?.createdAt ? new Date(latestBooking.createdAt).toISOString() : null
        },
        recentVisits: []
      };
    }

    const [visitCount, recentVisits] = await Promise.all([
      prisma.booking.count({ where: { customerEmail: base.email } }),
      prisma.booking.findMany({
        where: { customerEmail: base.email },
        select: {
          id: true,
          businessId: true,
          businessName: true,
          date: true,
          time: true,
          status: true,
          service: true,
          price: true,
          createdAt: true
        },
        orderBy: [{ date: "desc" }, { time: "desc" }, { createdAt: "desc" }],
        take: 6
      })
    ]);
    const linkedBusinesses = new Set(
      recentVisits
        .map((visit) => String(visit?.businessId || "").trim())
        .filter(Boolean)
    ).size;
    const upcomingCount = recentVisits.filter((visit) => {
      const normalized = normalizeBookingDateTime(visit?.date, visit?.time);
      if (!normalized) return false;
      const startsAt = new Date(`${normalized.date}T${normalized.time}:00`);
      return (
        Number.isFinite(startsAt.getTime()) &&
        startsAt.getTime() >= Date.now() &&
        String(visit?.status || "").trim().toLowerCase() === "confirmed"
      );
    }).length;

    return {
      ...base,
      business: null,
      stats: {
        visitCount,
        linkedBusinesses,
        upcomingCount
      },
      recentVisits: recentVisits.map((visit) => ({
        id: String(visit.id || "").trim(),
        businessId: String(visit.businessId || "").trim(),
        businessName: String(visit.businessName || "").trim(),
        date: String(visit.date || "").trim(),
        time: String(visit.time || "").trim(),
        status: String(visit.status || "").trim(),
        service: String(visit.service || "").trim(),
        price: Number(visit.price || 0),
        createdAt: visit.createdAt ? new Date(visit.createdAt).toISOString() : null
      }))
    };
  }

  return {
    buildAdminSupportAccountPayload
  };
}
