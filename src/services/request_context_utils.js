export function createRequestContextUtils({ corsOrigin, prisma }) {
  function canMutateBooking(req, booking) {
    if (!req.auth || !booking) return false;
    if (req.auth.role === "admin") return true;
    if (req.auth.role === "subscriber" && req.auth.businessId && req.auth.businessId === booking.businessId) return true;
    if (req.auth.role === "customer" && req.auth.email && req.auth.email === booking.customerEmail) return true;
    return false;
  }

  function getCorsOptions() {
    if (corsOrigin === "*") return { origin: true };
    const allowed = corsOrigin.split(",").map((v) => v.trim()).filter(Boolean);
    return {
      origin: (origin, callback) => {
        if (!origin || allowed.includes(origin)) return callback(null, true);
        return callback(new Error("CORS blocked"));
      }
    };
  }

  async function resolveManagedBusinessId(req) {
    if (!req.auth) return "";
    if (req.auth.role === "subscriber") return String(req.auth.businessId || "").trim();
    if (req.auth.role !== "admin") return "";

    const fromQuery = String(req.query?.businessId || "").trim();
    if (fromQuery) return fromQuery;
    const fromBody = String(req.body?.businessId || "").trim();
    if (fromBody) return fromBody;
    const fromHeader = String(req.headers["x-business-id"] || "").trim();
    if (fromHeader) return fromHeader;

    const fallbackBusiness = await prisma.business.findFirst({
      select: { id: true },
      orderBy: { createdAt: "asc" }
    });
    return String(fallbackBusiness?.id || "").trim();
  }

  return {
    canMutateBooking,
    getCorsOptions,
    resolveManagedBusinessId
  };
}
