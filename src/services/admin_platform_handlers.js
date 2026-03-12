const adminAccountSelect = {
  id: true,
  role: true,
  name: true,
  email: true,
  businessId: true,
  createdAt: true,
  business: {
    select: {
      id: true,
      name: true,
      type: true,
      city: true,
      country: true,
      subscription: {
        select: {
          status: true,
          plan: true
        }
      }
    }
  }
};

export function createAdminPlatformHandlers({
  prisma,
  adminAppUsageService,
  liveRevenueAnalyticsService,
  adminAccountSupportService,
  freeSubscriberAccessService,
  isValidEmail,
  writeAuditLog
} = {}) {
  function parseAuditMetadata(value) {
    if (!value) return {};
    if (typeof value === "object") return value;
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  }

  function buildBusinessHealth({ subscriptionStatus, bookingCount, upcomingCount }) {
    if (subscriptionStatus === "active" && bookingCount >= 20) return "Healthy and active";
    if (subscriptionStatus === "active" && upcomingCount > 0) return "Active with upcoming work";
    if (subscriptionStatus === "active") return "Active but quiet";
    return "Needs attention";
  }

  async function adminDashboardHandler(_req, res) {
    const now = new Date();
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
    const weekStartKey = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, "0")}-${String(weekStart.getDate()).padStart(2, "0")}`;
    const monthStartKey = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, "0")}-${String(monthStart.getDate()).padStart(2, "0")}`;

    const [
      businesses,
      users,
      subscribers,
      customers,
      activeMonthlySubscribers,
      activeYearlySubscribers,
      freeLifetimeSubscribers,
      customerSignupsThisMonth,
      customerSignupsThisYear,
      subscriberSignupsThisMonth,
      subscriberSignupsThisYear,
      bookings,
      cancelled,
      todayBookings,
      weekBookings,
      monthBookings,
      todayLexiBookings,
      weekLexiBookings,
      monthLexiBookings,
      todayRevenueAggregate,
      weekRevenueAggregate,
      monthRevenueAggregate,
      usage
    ] = await Promise.all([
      prisma.business.count(),
      prisma.user.count(),
      prisma.user.count({ where: { role: "subscriber" } }),
      prisma.user.count({ where: { role: "customer" } }),
      prisma.subscription.count({ where: { status: "active", plan: "monthly" } }),
      prisma.subscription.count({ where: { status: "active", plan: "yearly" } }),
      freeSubscriberAccessService?.countActiveEntries?.() || 0,
      prisma.user.count({ where: { role: "customer", createdAt: { gte: monthStart } } }),
      prisma.user.count({ where: { role: "customer", createdAt: { gte: yearStart } } }),
      prisma.user.count({ where: { role: "subscriber", createdAt: { gte: monthStart } } }),
      prisma.user.count({ where: { role: "subscriber", createdAt: { gte: yearStart } } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: "cancelled" } }),
      prisma.booking.count({ where: { date: todayKey } }),
      prisma.booking.count({ where: { date: { gte: weekStartKey, lte: todayKey } } }),
      prisma.booking.count({ where: { date: { gte: monthStartKey, lte: todayKey } } }),
      prisma.booking.count({ where: { source: "lexi", date: todayKey } }),
      prisma.booking.count({ where: { source: "lexi", date: { gte: weekStartKey, lte: todayKey } } }),
      prisma.booking.count({ where: { source: "lexi", date: { gte: monthStartKey, lte: todayKey } } }),
      prisma.booking.aggregate({ where: { status: { not: "cancelled" }, date: todayKey }, _sum: { price: true } }),
      prisma.booking.aggregate({ where: { status: { not: "cancelled" }, date: { gte: weekStartKey, lte: todayKey } }, _sum: { price: true } }),
      prisma.booking.aggregate({ where: { status: { not: "cancelled" }, date: { gte: monthStartKey, lte: todayKey } }, _sum: { price: true } }),
      adminAppUsageService.computeAdminAppUsageAnalytics(14)
    ]);

    return res.json({
      analytics: {
        totalBusinesses: businesses,
        totalUsers: users,
        totalSubscribers: subscribers,
        totalCustomers: customers,
        activeAppUsers: subscribers + customers,
        activeMonthlySubscribers,
        activeYearlySubscribers,
        freeLifetimeSubscribers,
        customerSignupsThisMonth,
        customerSignupsThisYear,
        subscriberSignupsThisMonth,
        subscriberSignupsThisYear,
        totalBookings: bookings,
        todayBookings,
        weekBookings,
        monthBookings,
        todayLexiBookings,
        weekLexiBookings,
        monthLexiBookings,
        todayRevenue: Number(todayRevenueAggregate?._sum?.price || 0),
        weekRevenue: Number(weekRevenueAggregate?._sum?.price || 0),
        monthRevenue: Number(monthRevenueAggregate?._sum?.price || 0),
        cancelledBookings: cancelled,
        conversionRate: bookings ? Number((((bookings - cancelled) / bookings) * 100).toFixed(1)) : 0
      },
      usage
    });
  }

  async function adminRevenueAnalyticsHandler(_req, res) {
    const payload = await liveRevenueAnalyticsService.computeAdminRevenueAnalytics(6);
    return res.json(payload);
  }

  async function adminRevenueAnalyticsExportHandler(req, res) {
    const format = String(req.query?.format || "csv").trim().toLowerCase();
    if (format !== "csv") {
      return res.status(400).json({ error: "Only csv export format is currently supported." });
    }

    const payload = await liveRevenueAnalyticsService.computeAdminRevenueAnalytics(6);
    const generatedAt = new Date().toISOString();
    const csv = liveRevenueAnalyticsService.buildAdminRevenueAnalyticsCsv(payload, generatedAt);
    const fileDate = generatedAt.slice(0, 10);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=\"admin_revenue_analytics_${fileDate}.csv\"`);
    return res.status(200).send(csv);
  }

  async function adminBusinessesHandler(_req, res) {
    const todayKey = new Date().toISOString().slice(0, 10);
    const lookbackStart = new Date();
    lookbackStart.setDate(lookbackStart.getDate() - 30);
    const businesses = await prisma.business.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        city: true,
        country: true,
        phone: true,
        email: true,
        address: true,
        postcode: true,
        rating: true,
        createdAt: true,
        subscription: {
          select: {
            status: true,
            plan: true,
            currentPeriodEnd: true
          }
        },
        users: {
          where: { role: "subscriber" },
          orderBy: [{ createdAt: "asc" }],
          take: 1,
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        services: {
          orderBy: [{ name: "asc" }],
          take: 4,
          select: {
            id: true,
            name: true
          }
        },
        bookings: {
          orderBy: [{ date: "desc" }, { time: "desc" }],
          take: 3,
          select: {
            id: true,
            customerName: true,
            service: true,
            date: true,
            time: true,
            status: true,
            price: true
          }
        },
        _count: {
          select: {
            bookings: true,
            services: true
          }
        }
      },
      orderBy: [{ name: "asc" }, { createdAt: "asc" }]
    });

    const enrichedBusinesses = await Promise.all(
      businesses.map(async (business) => {
        const [upcomingBookings, cancelledBookings, revenueAggregate, customerEmails, notificationLogs] = await Promise.all([
          prisma.booking.count({
            where: {
              businessId: business.id,
              status: "confirmed",
              date: { gte: todayKey }
            }
          }),
          prisma.booking.count({
            where: {
              businessId: business.id,
              status: "cancelled"
            }
          }),
          prisma.booking.aggregate({
            where: {
              businessId: business.id,
              status: { not: "cancelled" }
            },
            _sum: {
              price: true
            }
          }),
          prisma.booking.findMany({
            where: {
              businessId: business.id,
              customerEmail: { not: null }
            },
            distinct: ["customerEmail"],
            select: {
              customerEmail: true
            }
          }),
          prisma.auditLog.findMany({
            where: {
              action: "notification.delivery",
              createdAt: { gte: lookbackStart },
              metadata: { contains: business.id }
            },
            orderBy: [{ createdAt: "desc" }],
            take: 20,
            select: {
              metadata: true,
              createdAt: true
            }
          })
        ]);

        const owner = business.users[0] || null;
        const subscription = business.subscription || null;
        const sentNotifications = notificationLogs.filter((row) => parseAuditMetadata(row.metadata).outcome === "sent").length;
        const failedNotifications = notificationLogs.filter((row) => parseAuditMetadata(row.metadata).outcome === "failed").length;
        return {
          id: business.id,
          name: business.name,
          type: business.type,
          city: business.city || "",
          country: business.country || "",
          phone: business.phone || "",
          email: business.email || "",
          address: business.address || "",
          postcode: business.postcode || "",
          rating: Number(business.rating || 0),
          createdAt: business.createdAt,
          owner: owner
            ? {
                id: owner.id,
                name: owner.name || "",
                email: owner.email || ""
              }
            : null,
          subscription: subscription
            ? {
                status: subscription.status || "inactive",
                plan: subscription.plan || "starter",
                currentPeriodEnd: subscription.currentPeriodEnd || null
              }
            : null,
          stats: {
            bookingCount: business._count?.bookings || 0,
            serviceCount: business._count?.services || 0,
            upcomingBookings,
            cancelledBookings,
            customerCount: customerEmails.length,
            revenue: Number(revenueAggregate?._sum?.price || 0),
            notificationSentCount: sentNotifications,
            notificationFailedCount: failedNotifications,
            healthLabel: buildBusinessHealth({
              subscriptionStatus: String(subscription?.status || "").trim().toLowerCase(),
              bookingCount: business._count?.bookings || 0,
              upcomingCount: upcomingBookings
            })
          },
          services: business.services.map((service) => ({
            id: service.id,
            name: service.name
          })),
          recentBookings: business.bookings.map((booking) => ({
            id: booking.id,
            customerName: booking.customerName,
            service: booking.service,
            date: booking.date,
            time: booking.time,
            status: booking.status,
            price: Number(booking.price || 0)
          }))
        };
      })
    );

    return res.json({
      businesses: enrichedBusinesses
    });
  }

  async function adminAccountsHandler(req, res) {
    const query = String(req.query?.query || "").trim();
    if (query.length > 120) return res.status(400).json({ error: "Search query is too long." });

    const where = {
      role: { in: ["subscriber", "customer"] },
      ...(query
        ? {
            OR: [
              { name: { contains: query } },
              { email: { contains: query } },
              { business: { is: { name: { contains: query } } } },
              { business: { is: { city: { contains: query } } } },
              { business: { is: { country: { contains: query } } } }
            ]
          }
        : {})
    };

    const users = await prisma.user.findMany({
      where,
      take: query ? 18 : 10,
      orderBy: [{ createdAt: "desc" }],
      select: adminAccountSelect
    });

    const accounts = (await Promise.all(users.map((user) => adminAccountSupportService.buildAdminSupportAccountPayload(user)))).filter(Boolean);
    return res.json({ accounts });
  }

  async function adminAccountUpdateHandler(req, res) {
    const userId = String(req.params.userId || "").trim();
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const businessName = String(req.body?.businessName || "").trim();
    if (!userId) return res.status(400).json({ error: "User id is required." });
    if (!name || !email) return res.status(400).json({ error: "Name and email are required." });
    if (!isValidEmail(email)) return res.status(400).json({ error: "Invalid email format." });

    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: adminAccountSelect
    });
    if (!existing || !["subscriber", "customer"].includes(String(existing.role || "").trim().toLowerCase())) {
      return res.status(404).json({ error: "Account not found." });
    }

    const duplicate = await prisma.user.findUnique({ where: { email } });
    if (duplicate && String(duplicate.id || "").trim() !== userId) {
      return res.status(409).json({ error: "That email is already in use." });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email
      }
    });

    if (existing.role === "subscriber" && existing.businessId) {
      const businessData = {};
      if (businessName) businessData.name = businessName;
      if (email && email !== existing.email) businessData.email = email;
      if (Object.keys(businessData).length) {
        await prisma.business.update({
          where: { id: existing.businessId },
          data: businessData
        });
      }
    }

    if (existing.role === "customer" && email !== existing.email) {
      await prisma.booking.updateMany({
        where: { customerEmail: existing.email },
        data: { customerEmail: email }
      });
    }

    await writeAuditLog({
      actorId: req.auth.sub,
      actorRole: req.auth.role,
      action: "admin.account_updated",
      entityType: "user",
      entityId: userId,
      metadata: {
        accountRole: existing.role,
        businessId: existing.businessId || null
      }
    });

    const updated = await prisma.user.findUnique({
      where: { id: userId },
      select: adminAccountSelect
    });

    return res.json({ account: await adminAccountSupportService.buildAdminSupportAccountPayload(updated) });
  }

  async function adminFreeSubscriberAccessListHandler(_req, res) {
    const entries = await freeSubscriberAccessService.listEntries();
    return res.json({ entries });
  }

  async function adminFreeSubscriberAccessGrantHandler(req, res) {
    const email = String(req.body?.email || "").trim().toLowerCase();
    if (!email) return res.status(400).json({ error: "Email is required." });
    if (!isValidEmail(email)) return res.status(400).json({ error: "Invalid email format." });
    const entries = await freeSubscriberAccessService.grantEmail(email, {
      actorId: req.auth.sub,
      actorRole: req.auth.role
    });
    return res.json({ entries });
  }

  async function adminFreeSubscriberAccessRevokeHandler(req, res) {
    const email = String(req.params.email || "").trim().toLowerCase();
    if (!email) return res.status(400).json({ error: "Email is required." });
    const entries = await freeSubscriberAccessService.revokeEmail(email, {
      actorId: req.auth.sub,
      actorRole: req.auth.role
    });
    return res.json({ entries });
  }

  return {
    adminDashboardHandler,
    adminRevenueAnalyticsHandler,
    adminRevenueAnalyticsExportHandler,
    adminBusinessesHandler,
    adminAccountsHandler,
    adminAccountUpdateHandler,
    adminFreeSubscriberAccessListHandler,
    adminFreeSubscriberAccessGrantHandler,
    adminFreeSubscriberAccessRevokeHandler
  };
}
