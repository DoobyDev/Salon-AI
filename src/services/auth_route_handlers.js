export function createAuthRouteHandlers({
  prisma,
  bcrypt,
  signToken,
  clearReadCache,
  writeAuditLog,
  isValidEmail,
  isValidPhone,
  isValidOptionalHttpUrl,
  normalizeBusinessType,
  defaultDescriptionByBusinessType,
  defaultHoursByBusinessType,
  defaultServicesByBusinessType
} = {}) {
  function ensureDatabaseReady(res) {
    if (prisma?.__isAvailable) return true;
    res.status(503).json({
      error: "The database is currently unavailable. Check the server database connection and try again."
    });
    return false;
  }

  async function registerSubscriberHandler(req, res) {
    if (!ensureDatabaseReady(res)) return;
    const payload = req.body || {};
    const name = String(payload.name || "").trim();
    const email = String(payload.email || "").trim().toLowerCase();
    const password = String(payload.password || "");
    const businessName = String(payload.businessName || "").trim();
    const city = String(payload.city || "").trim();
    const country = String(payload.country || "").trim();
    const postcode = String(payload.postcode || "").trim();
    const phone = String(payload.phone || "").trim();
    const businessType = normalizeBusinessType(payload.businessType);
    const websiteUrl = String(payload.websiteUrl || "").trim();
    const teamSize = String(payload.teamSize || "").trim();
    const primaryGoal = String(payload.primaryGoal || "").trim();
    const setupNotes = String(payload.setupNotes || "").trim();
    const paymentConsentAccepted = Boolean(payload.paymentConsentAccepted);

    if (!name || !email || !password || !businessName || !city || !country || !postcode || !phone) {
      return res.status(400).json({ error: "Missing required fields." });
    }
    if (!isValidEmail(email)) return res.status(400).json({ error: "Invalid email format." });
    if (!isValidPhone(phone)) return res.status(400).json({ error: "Invalid phone format." });
    if (!isValidOptionalHttpUrl(websiteUrl)) return res.status(400).json({ error: "Invalid website URL." });
    if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters." });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "Email already exists." });

    const business = await prisma.business.create({
      data: {
        name: businessName,
        type: businessType,
        phone,
        email,
        city,
        country,
        postcode,
        address: `${city} City Centre`,
        description: defaultDescriptionByBusinessType(businessType, businessName),
        websiteUrl: websiteUrl || null,
        websiteTitle: payload.websiteTitle || null,
        websiteSummary: payload.websiteSummary || null,
        websiteImageUrl: payload.websiteImageUrl || null,
        hoursJson: JSON.stringify(defaultHoursByBusinessType(businessType)),
        services: {
          create: defaultServicesByBusinessType(businessType)
        }
      }
    });

    const user = await prisma.user.create({
      data: {
        role: "subscriber",
        name,
        email,
        passwordHash: await bcrypt.hash(password, 10),
        businessId: business.id
      }
    });

    const token = signToken(user);
    clearReadCache();
    await writeAuditLog({
      actorId: user.id,
      actorRole: user.role,
      action: "auth.register_subscriber",
      entityType: "user",
      entityId: user.id,
      metadata: {
        businessId: business.id,
        onboarding: {
          websiteUrl: websiteUrl || null,
          teamSize: teamSize || null,
          primaryGoal: primaryGoal || null,
          setupNotes: setupNotes || null,
          paymentConsentAccepted
        }
      }
    });
    return res.status(201).json({ token, user: { id: user.id, role: user.role, email: user.email } });
  }

  async function registerCustomerHandler(req, res) {
    if (!ensureDatabaseReady(res)) return;
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    const phone = String(req.body?.phone || "").trim();
    const city = String(req.body?.city || "").trim();
    const country = String(req.body?.country || "").trim();
    const preferredService = String(req.body?.preferredService || "").trim();
    const notes = String(req.body?.notes || "").trim();
    const paymentConsentAccepted = Boolean(req.body?.paymentConsentAccepted);
    const termsAccepted = Boolean(req.body?.termsAccepted);
    const updatesOptIn = Boolean(req.body?.updatesOptIn);
    if (!name || !email || !password) return res.status(400).json({ error: "Missing required fields." });
    if (!isValidEmail(email)) return res.status(400).json({ error: "Invalid email format." });
    if (phone && !isValidPhone(phone)) return res.status(400).json({ error: "Invalid phone format." });
    if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters." });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "Email already exists." });
    const linkedBookings = await prisma.booking.findMany({
      where: { customerEmail: email },
      select: {
        id: true,
        businessId: true,
        customerPhone: true,
        createdAt: true
      },
      orderBy: [{ createdAt: "desc" }],
      take: 100
    });
    const latestLinkedBooking = linkedBookings[0] || null;
    const linkedBusinessCount = new Set(
      linkedBookings
        .map((booking) => String(booking?.businessId || "").trim())
        .filter(Boolean)
    ).size;
    const linkedCustomerPhone = String(phone || latestLinkedBooking?.customerPhone || "").trim() || null;

    const user = await prisma.user.create({
      data: {
        role: "customer",
        name,
        email,
        passwordHash: await bcrypt.hash(password, 10)
      }
    });

    const token = signToken(user);
    clearReadCache();
    await writeAuditLog({
      actorId: user.id,
      actorRole: user.role,
      action: "auth.register_customer",
      entityType: "user",
      entityId: user.id,
      metadata: {
        onboarding: {
          phone: phone || null,
          city: city || null,
          country: country || null,
          preferredService: preferredService || null,
          notes: notes || null,
          paymentConsentAccepted,
          termsAccepted,
          updatesOptIn,
          linkedVisitCount: linkedBookings.length,
          linkedBusinessCount,
          linkedFromWalkInEmail: linkedBookings.length > 0
        }
      }
    });
    return res.status(201).json({
      token,
      user: {
        id: user.id,
        role: user.role,
        email: user.email,
        phone: linkedCustomerPhone
      }
    });
  }

  async function loginHandler(req, res) {
    if (!ensureDatabaseReady(res)) return;
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    const requestedRole = String(req.body?.requestedRole || "").trim().toLowerCase();
    if (!email || !password) return res.status(400).json({ error: "Email and password required." });
    if (!isValidEmail(email)) return res.status(400).json({ error: "Invalid email format." });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      await writeAuditLog({
        actorRole: "anonymous",
        action: "auth.login_failed",
        entityType: "user",
        metadata: { email }
      });
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      await writeAuditLog({
        actorId: user.id,
        actorRole: user.role,
        action: "auth.login_failed",
        entityType: "user",
        entityId: user.id
      });
      return res.status(401).json({ error: "Invalid credentials." });
    }

    if (requestedRole === "admin" && user.role !== "admin") {
      await writeAuditLog({
        actorId: user.id,
        actorRole: user.role,
        action: "auth.login_failed_role_mismatch",
        entityType: "user",
        entityId: user.id,
        metadata: {
          requestedRole,
          actualRole: user.role
        }
      });
      return res.status(403).json({ error: "Admin access is only available to admin accounts." });
    }

    let effectiveRole = user.role;
    let effectiveBusinessId = user.businessId || null;
    const canRoleSwitch = user.role === "admin" && ["admin", "subscriber", "customer"].includes(requestedRole);
    if (canRoleSwitch) {
      effectiveRole = requestedRole;
    }
    if (effectiveRole === "subscriber" && !effectiveBusinessId) {
      const fallbackBusiness = await prisma.business.findFirst({
        select: { id: true },
        orderBy: { createdAt: "asc" }
      });
      effectiveBusinessId = fallbackBusiness?.id || null;
    }

    if (effectiveRole === "subscriber" && !effectiveBusinessId) {
      return res.status(400).json({ error: "No business available for subscriber login." });
    }

    const sessionUser = {
      ...user,
      role: effectiveRole,
      businessId: effectiveBusinessId
    };
    let customerPhone = null;
    if (effectiveRole === "customer" && user.email) {
      const latestCustomerBooking = await prisma.booking.findFirst({
        where: { customerEmail: user.email },
        select: { customerPhone: true },
        orderBy: [{ createdAt: "desc" }]
      });
      customerPhone = String(latestCustomerBooking?.customerPhone || "").trim() || null;
    }
    const token = signToken(sessionUser);
    await writeAuditLog({
      actorId: user.id,
      actorRole: user.role,
      action: "auth.login_success",
      entityType: "user",
      entityId: user.id,
      metadata: {
        requestedRole: requestedRole || null,
        effectiveRole,
        roleSwitched: canRoleSwitch
      }
    });
    return res.json({
      token,
      user: {
        id: user.id,
        role: effectiveRole,
        email: user.email,
        businessId: effectiveBusinessId,
        name: user.name,
        phone: customerPhone
      }
    });
  }

  return {
    registerSubscriberHandler,
    registerCustomerHandler,
    loginHandler
  };
}
