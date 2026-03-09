export function createPublicBusinessSearchService({
  getPrisma,
  businessTypeSearchValues,
  mapPublicBusinessProfile
} = {}) {
  function prismaClient() {
    return typeof getPrisma === "function" ? getPrisma() : null;
  }

  async function searchPublicSubscribedBusinesses({ query = "", location = "", service = "", businessType = "", limit = 5 } = {}) {
    const prisma = prismaClient();
    const q = String(query || "").trim();
    const loc = String(location || "").trim();
    const svc = String(service || "").trim();
    const type = String(businessType || "").trim();
    const take = Math.min(10, Math.max(1, Number(limit || 5)));
    const andFilters = [];
    if (q) {
      andFilters.push({
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } }
        ]
      });
    }
    if (loc) {
      andFilters.push({
        OR: [
          { city: { contains: loc, mode: "insensitive" } },
          { country: { contains: loc, mode: "insensitive" } },
          { postcode: { contains: loc, mode: "insensitive" } }
        ]
      });
    }
    if (type) {
      andFilters.push({ type: { in: businessTypeSearchValues(type) } });
    }
    if (svc) {
      andFilters.push({
        services: { some: { name: { contains: svc, mode: "insensitive" } } }
      });
    }

    const rows = await prisma.business.findMany({
      where: {
        AND: andFilters,
        subscription: {
          is: {
            status: { in: ["active", "trialing", "trial", "past_due"] }
          }
        }
      },
      include: {
        services: { orderBy: [{ createdAt: "asc" }, { name: "asc" }] },
        subscription: true
      },
      orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
      take
    });
    return rows.map(mapPublicBusinessProfile);
  }

  return {
    searchPublicSubscribedBusinesses
  };
}
