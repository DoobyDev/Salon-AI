export function createBusinessProfileHandlers({
  prisma,
  resolveManagedBusinessId,
  businessProfileService,
  socialMediaService,
  reminderSettingsService,
  normalizeBusinessType,
  isValidEmail,
  isValidPhone,
  isValidOptionalHttpUrl,
  normalizeBookingDateTime,
  parseOpenHours,
  addMinutesToTime,
  timeToMinutes,
  dayKeyFromDate,
  isBookingSlotInPast,
  getSlotCapacityForBusinessDate,
  isSlotAtCapacity,
  clearReadCache,
  writeAuditLog
} = {}) {
  function formatDateWithWeekday(date) {
    const value = new Date(`${date}T12:00:00`);
    return Number.isNaN(value.getTime())
      ? date
      : value.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }

  async function businessBookingSuggestionsHandler(req, res) {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

    const serviceName = String(req.query?.service || "").trim();
    const requestedDate = String(req.query?.date || "").trim();
    const daysAhead = Math.min(10, Math.max(1, Number(req.query?.daysAhead || 7)));
    if (!serviceName || !requestedDate) {
      return res.status(400).json({ error: "Service and date are required." });
    }

    const normalizedDate = normalizeBookingDateTime(requestedDate, "12:00");
    if (!normalizedDate) return res.status(400).json({ error: "Invalid booking date." });

    let business;
    try {
      business = await businessProfileService.loadBusinessProfile(businessId);
    } catch (error) {
      if (error?.statusCode === 404) return res.status(404).json({ error: "Business not found." });
      throw error;
    }

    const service = (Array.isArray(business.services) ? business.services : []).find(
      (row) => String(row.name || "").trim().toLowerCase() === serviceName.toLowerCase()
    );
    if (!service) return res.status(400).json({ error: "Selected service is not offered by this business." });

    async function buildDay(dateKey) {
      const dateObj = new Date(`${dateKey}T12:00:00`);
      if (Number.isNaN(dateObj.getTime())) {
        return { date: dateKey, label: dateKey, closed: true, suggestions: [] };
      }
      const dayHours = parseOpenHours(JSON.parse(business.hoursJson || "{}")[dayKeyFromDate(dateObj)]);
      if (!dayHours) {
        return { date: dateKey, label: formatDateWithWeekday(dateKey), closed: true, suggestions: [] };
      }

      const durationMin = Math.max(5, Number(service.durationMin || 45));
      const lastStart = addMinutesToTime(dayHours.close, -durationMin);
      const capacity = await getSlotCapacityForBusinessDate(businessId, dateKey);
      const suggestions = [];
      let cursor = dayHours.open;

      while (timeToMinutes(cursor) <= timeToMinutes(lastStart)) {
        if (!isBookingSlotInPast(dateKey, cursor)) {
          const atCapacity = await isSlotAtCapacity({
            businessId,
            date: dateKey,
            time: cursor,
            capacity
          });
          if (!atCapacity) suggestions.push(cursor);
        }
        cursor = addMinutesToTime(cursor, 30);
      }

      return {
        date: dateKey,
        label: formatDateWithWeekday(dateKey),
        closed: false,
        suggestions: suggestions.slice(0, 8)
      };
    }

    const currentDay = await buildDay(normalizedDate.date);
    const nearbyDays = [];
    for (let offset = 1; offset <= daysAhead; offset += 1) {
      const nextDate = new Date(`${normalizedDate.date}T12:00:00`);
      nextDate.setDate(nextDate.getDate() + offset);
      const candidateKey = nextDate.toISOString().slice(0, 10);
      const candidate = await buildDay(candidateKey);
      if (candidate.closed || !candidate.suggestions.length) continue;
      nearbyDays.push(candidate);
      if (nearbyDays.length >= 4) break;
    }

    return res.json({
      service: {
        name: service.name,
        durationMin: Number(service.durationMin || 45),
        price: Number(service.price || 0)
      },
      currentDay,
      nearbyDays
    });
  }

  async function businessProfileGetHandler(req, res) {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

    let business;
    try {
      business = await businessProfileService.loadBusinessProfile(businessId);
    } catch (error) {
      if (error?.statusCode === 404) return res.status(404).json({ error: "Business not found." });
      throw error;
    }

    return res.json(businessProfileService.formatBusinessProfileResponse(business));
  }

  async function businessProfileSaveHandler(req, res) {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

    const payload = req.body || {};
    const name = String(payload.name || "").trim();
    const type = normalizeBusinessType(payload.type);
    const phone = String(payload.phone || "").trim();
    const email = String(payload.email || "").trim().toLowerCase();
    const city = String(payload.city || "").trim();
    const country = String(payload.country || "").trim();
    const postcode = String(payload.postcode || "").trim();
    const address = String(payload.address || "").trim();
    const description = String(payload.description || "").trim();
    const websiteUrl = String(payload.websiteUrl || "").trim();
    const websiteTitle = String(payload.websiteTitle || "").trim();
    const websiteSummary = String(payload.websiteSummary || "").trim();
    const websiteImageUrl = String(payload.websiteImageUrl || "").trim();

    if (!name || !phone || !email || !city || !country || !postcode || !address) {
      return res.status(400).json({ error: "Missing required business profile fields." });
    }
    if (!isValidEmail(email)) return res.status(400).json({ error: "Invalid business email format." });
    if (!isValidPhone(phone)) return res.status(400).json({ error: "Invalid business phone format." });
    if (!isValidOptionalHttpUrl(websiteUrl)) return res.status(400).json({ error: "Invalid website URL." });
    if (!isValidOptionalHttpUrl(websiteImageUrl)) return res.status(400).json({ error: "Invalid website image URL." });

    let saved;
    try {
      saved = await businessProfileService.saveBusinessProfile(businessId, {
        name,
        type,
        phone,
        email,
        city,
        country,
        postcode,
        address,
        description,
        websiteUrl,
        websiteTitle,
        websiteSummary,
        websiteImageUrl,
        hours: payload.hours,
        services: payload.services
      });
    } catch (error) {
      if (error?.statusCode === 404) return res.status(404).json({ error: "Business not found." });
      return res.status(400).json({ error: error.message || "Invalid business profile payload." });
    }

    clearReadCache();
    await writeAuditLog({
      actorId: req.auth.sub,
      actorRole: req.auth.role,
      action: "business.profile_updated",
      entityType: "business",
      entityId: businessId,
      metadata: { businessId, type, serviceCount: saved.normalizedServices.length }
    });

    return res.json(businessProfileService.formatBusinessProfileResponse(saved.business));
  }

  async function applyBusinessTemplateHandler(req, res) {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

    const requestedType = normalizeBusinessType(req.body?.type);
    let updated;
    try {
      updated = await businessProfileService.applyBusinessTemplate(businessId, requestedType);
    } catch (error) {
      if (error?.statusCode === 404) return res.status(404).json({ error: "Business not found." });
      throw error;
    }

    clearReadCache();
    await writeAuditLog({
      actorId: req.auth.sub,
      actorRole: req.auth.role,
      action: "business.template_applied",
      entityType: "business",
      entityId: businessId,
      metadata: { businessId, type: requestedType }
    });

    return res.json(businessProfileService.formatBusinessProfileResponse(updated));
  }

  async function businessSocialMediaGetHandler(req, res) {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: {
        socialFacebook: true,
        socialInstagram: true,
        socialTwitter: true,
        socialLinkedin: true,
        socialTiktok: true
      }
    });
    if (!business) return res.status(404).json({ error: "Business not found." });

    const scoped = await socialMediaService.loadSocialMediaExtras(businessId);
    return res.json({
      socialFacebook: String(business.socialFacebook || ""),
      socialInstagram: String(business.socialInstagram || ""),
      socialTwitter: String(business.socialTwitter || ""),
      socialLinkedin: String(business.socialLinkedin || ""),
      socialTiktok: String(business.socialTiktok || ""),
      customSocial: scoped.customSocial,
      socialImageUrl: scoped.socialImageUrl
    });
  }

  async function businessSocialMediaSaveHandler(req, res) {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

    const socialFacebook = String(req.body?.socialFacebook || "").trim();
    const socialInstagram = String(req.body?.socialInstagram || "").trim();
    const socialTwitter = String(req.body?.socialTwitter || "").trim();
    const socialLinkedin = String(req.body?.socialLinkedin || "").trim();
    const socialTiktok = String(req.body?.socialTiktok || "").trim();
    const customSocial = String(req.body?.customSocial || "").trim();
    const socialImageUrl = String(req.body?.socialImageUrl || "").trim();

    const invalid = [
      { label: "Facebook", value: socialFacebook },
      { label: "Instagram", value: socialInstagram },
      { label: "Twitter", value: socialTwitter },
      { label: "LinkedIn", value: socialLinkedin },
      { label: "TikTok", value: socialTiktok },
      { label: "Other", value: customSocial },
      { label: "Image URL", value: socialImageUrl }
    ].find((item) => !isValidOptionalHttpUrl(item.value));
    if (invalid) return res.status(400).json({ error: `Invalid ${invalid.label} URL.` });

    const business = await prisma.business.findUnique({ where: { id: businessId }, select: { id: true } });
    if (!business) return res.status(404).json({ error: "Business not found." });

    await prisma.business.update({
      where: { id: businessId },
      data: {
        socialFacebook: socialFacebook || null,
        socialInstagram: socialInstagram || null,
        socialTwitter: socialTwitter || null,
        socialLinkedin: socialLinkedin || null,
        socialTiktok: socialTiktok || null
      }
    });

    await socialMediaService.saveSocialMediaExtras(businessId, { customSocial, socialImageUrl });
    clearReadCache();

    await writeAuditLog({
      actorId: req.auth.sub,
      actorRole: req.auth.role,
      action: "business.social_media_updated",
      entityType: "business",
      entityId: businessId,
      metadata: { businessId }
    });

    return res.json({
      socialFacebook,
      socialInstagram,
      socialTwitter,
      socialLinkedin,
      socialTiktok,
      customSocial,
      socialImageUrl
    });
  }

  async function businessReminderSettingsGetHandler(req, res) {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

    const settings = await reminderSettingsService.getReminderSettingsForBusiness(businessId);
    return res.json({ settings });
  }

  async function businessReminderSettingsSaveHandler(req, res) {
    const businessId = await resolveManagedBusinessId(req);
    if (!businessId) return res.status(400).json({ error: "Subscriber business not found." });

    const settings = await reminderSettingsService.saveReminderSettingsForBusiness(businessId, {
      liveRemindersEnabled: Boolean(req.body?.liveRemindersEnabled),
      channelPreference: String(req.body?.channelPreference || "").trim().toLowerCase(),
      reminderLeadHours: Number(req.body?.reminderLeadHours || 24),
      manualFallbackEnabled: Boolean(req.body?.manualFallbackEnabled)
    });

    await writeAuditLog({
      actorId: req.auth.sub,
      actorRole: req.auth.role,
      action: "business.reminder_settings_saved",
      entityType: "business_settings",
      entityId: businessId,
      metadata: {
        businessId,
        liveRemindersEnabled: settings.liveRemindersEnabled,
        channelPreference: settings.channelPreference,
        reminderLeadHours: settings.reminderLeadHours,
        manualFallbackEnabled: settings.manualFallbackEnabled
      }
    });

    return res.json({ settings });
  }

  return {
    businessProfileGetHandler,
    businessProfileSaveHandler,
    businessBookingSuggestionsHandler,
    applyBusinessTemplateHandler,
    businessSocialMediaGetHandler,
    businessSocialMediaSaveHandler,
    businessReminderSettingsGetHandler,
    businessReminderSettingsSaveHandler
  };
}
