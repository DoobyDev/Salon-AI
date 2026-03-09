import { formatCurrencyGBP } from "./public_lexi_helpers.js";

export function createPublicChatToolsService({
  getPrisma,
  publicBusinessSearchService,
  publicBusinessProfileService,
  getAvailableSlotsForBusiness,
  normalizeBookingDateTime,
  isValidPhone,
  isValidEmail,
  isSlotWithinBusinessHours,
  getSlotCapacityForBusinessDate,
  isSlotAtCapacity,
  clearReadCache,
  jobRuntime,
  writeAuditLog
} = {}) {
  function prismaClient() {
    return typeof getPrisma === "function" ? getPrisma() : null;
  }

  async function handlePublicChatToolCall(call, context = {}) {
    const prisma = prismaClient();
    const { business } = context;

    if (!call?.function?.name) return null;

    if (call.function.name === "search_public_businesses") {
      const args = JSON.parse(call.function.arguments || "{}");
      const results = await publicBusinessSearchService.searchPublicSubscribedBusinesses({
        query: String(args.query || "").trim(),
        location: String(args.location || "").trim(),
        service: String(args.service || "").trim(),
        businessType: String(args.business_type || "").trim(),
        limit: Number(args.limit || 5)
      });
      if (!results.length) {
        return {
          statusCode: 200,
          body: { reply: "I couldn't find any subscribed businesses matching that search yet. Try another location, business name, or service." }
        };
      }
      const summary = results
        .slice(0, 5)
        .map((row) => {
          const servicesPreview = (row.services || []).slice(0, 3).map((service) => service.name).join(", ");
          return `${row.name} (${row.type}, ${row.city})${servicesPreview ? ` - ${servicesPreview}` : ""}`;
        })
        .join(" | ");
      return {
        statusCode: 200,
        body: {
          reply: `I found ${results.length} subscribed business${results.length === 1 ? "" : "es"}: ${summary}. Tell me which one you want, and I can check available slots.`,
          businesses: results
        }
      };
    }

    if (call.function.name === "get_business_public_profile") {
      const args = JSON.parse(call.function.arguments || "{}");
      const id = String(args.business_id || "").trim();
      const name = String(args.business_name || "").trim();
      const target = id
        ? await prisma.business.findUnique({
            where: { id },
            include: { services: true, subscription: true }
          })
        : await prisma.business.findFirst({
            where: {
              name: { contains: name, mode: "insensitive" },
              subscription: { is: { status: { in: ["active", "trialing", "trial", "past_due"] } } }
            },
            include: { services: true, subscription: true },
            orderBy: [{ rating: "desc" }, { createdAt: "desc" }]
          });
      if (!target || !publicBusinessProfileService.isPublicSubscriptionStatus(target.subscription?.status)) {
        return {
          statusCode: 200,
          body: { reply: "I couldn't find a subscribed business with that name. Try the business finder first and I can list matching businesses." }
        };
      }
      const profile = publicBusinessProfileService.mapPublicBusinessProfile(target);
      const servicePreview = profile.services
        .slice(0, 5)
        .map((service) => `${service.name} (${service.durationMin} min${Number.isFinite(service.price) ? `, ${formatCurrencyGBP(service.price)}` : ""})`)
        .join(", ");
      return {
        statusCode: 200,
        body: {
          reply: `${profile.name} is a ${profile.type} business in ${profile.city}. ${profile.description || ""}${servicePreview ? ` Services: ${servicePreview}.` : ""} ${profile.phone ? `Phone: ${profile.phone}.` : ""}${profile.websiteUrl ? ` Website: ${profile.websiteUrl}.` : ""} Ask me to check slots if you'd like to book.`,
          businessProfile: profile
        }
      };
    }

    if (call.function.name === "check_available_slots") {
      const args = JSON.parse(call.function.arguments || "{}");
      const targetBusinessId = String(args.business_id || business?.id || "");
      const target = await prisma.business.findUnique({
        where: { id: targetBusinessId },
        include: { services: true, subscription: true }
      });
      if (!target) {
        return { statusCode: 404, body: { error: "Selected business not found." } };
      }
      if (!publicBusinessProfileService.isPublicSubscriptionStatus(target.subscription?.status)) {
        return {
          statusCode: 200,
          body: { reply: "I can only check slots for subscribed businesses in this public chat. Please choose a subscribed business first." }
        };
      }
      const requestedDate = String(args.date || "").trim();
      const daysAheadRaw = Number(args.days_ahead);
      const limitRaw = Number(args.limit);
      const daysAhead = Number.isFinite(daysAheadRaw) ? Math.min(14, Math.max(1, Math.floor(daysAheadRaw))) : 4;
      const limit = Number.isFinite(limitRaw) ? Math.min(12, Math.max(1, Math.floor(limitRaw))) : 8;
      const slots = await getAvailableSlotsForBusiness(target, daysAhead);
      const filtered = requestedDate ? slots.filter((slot) => String(slot).startsWith(requestedDate)) : slots;
      if (!filtered.length) {
        const scope = requestedDate ? ` on ${requestedDate}` : "";
        return {
          statusCode: 200,
          body: { reply: `I couldn't find any available slots for ${target.name}${scope}. Would you like me to check another date?` }
        };
      }
      const slotList = filtered.slice(0, limit).join(", ");
      return {
        statusCode: 200,
        body: {
          reply: requestedDate
            ? `Here are available slots for ${target.name} on ${requestedDate}: ${slotList}.`
            : `Here are the next available slots for ${target.name}: ${slotList}.`
        }
      };
    }

    if (call.function.name === "create_booking") {
      const args = JSON.parse(call.function.arguments || "{}");
      const targetBusinessId = String(args.business_id || business?.id || "");
      const target = await prisma.business.findUnique({
        where: { id: targetBusinessId },
        include: { services: true, subscription: true }
      });
      if (!target) {
        return { statusCode: 404, body: { error: "Selected business not found." } };
      }
      if (!publicBusinessProfileService.isPublicSubscriptionStatus(target.subscription?.status)) {
        return {
          statusCode: 200,
          body: { reply: "I can only create bookings for subscribed businesses in this public chat." }
        };
      }
      const normalized = normalizeBookingDateTime(args.date, args.time);
      if (!normalized) {
        return { statusCode: 400, body: { error: "Invalid date/time format from assistant." } };
      }
      if (!isValidPhone(String(args.phone || "").trim())) {
        return { statusCode: 400, body: { error: "Invalid phone format from assistant." } };
      }
      if (String(args.email || "").trim() && !isValidEmail(String(args.email || "").trim())) {
        return { statusCode: 400, body: { error: "Invalid email format from assistant." } };
      }

      const svc = target.services.find((service) => service.name.toLowerCase() === String(args.service || "").toLowerCase());
      if (!svc) {
        return { statusCode: 200, body: { reply: "That service is not available at this business. Please choose another service." } };
      }
      const durationMin = Math.max(5, Number(svc.durationMin || 45));
      if (!isSlotWithinBusinessHours(target, normalized.date, normalized.time, durationMin)) {
        return {
          statusCode: 200,
          body: { reply: "That time falls outside operating hours for this service. Please choose another slot." }
        };
      }
      const capacity = await getSlotCapacityForBusinessDate(target.id, normalized.date);
      const atCapacity = await isSlotAtCapacity({
        businessId: target.id,
        date: normalized.date,
        time: normalized.time,
        capacity
      });
      if (atCapacity) {
        return { statusCode: 200, body: { reply: "That slot has reached staff capacity. Please choose a different time." } };
      }
      const booking = await prisma.booking.create({
        data: {
          businessId: target.id,
          businessName: target.name,
          customerName: String(args.guest_name || "").trim(),
          customerPhone: String(args.phone || "").trim(),
          customerEmail: String(args.email || "").trim().toLowerCase() || null,
          service: String(args.service || "").trim(),
          price: svc.price,
          date: normalized.date,
          time: normalized.time,
          notes: String(args.notes || "").trim() || null,
          status: "confirmed",
          source: "ai"
        }
      });
      clearReadCache();

      await jobRuntime.enqueueNotification({
        businessName: target.name,
        booking,
        customerEmail: booking.customerEmail || "",
        customerPhone: booking.customerPhone,
        deliveryType: "booking_confirmation"
      });
      await writeAuditLog({
        actorRole: "ai",
        action: "booking.created_ai",
        entityType: "booking",
        entityId: booking.id,
        metadata: { businessId: target.id }
      });

      return {
        statusCode: 200,
        body: {
          reply: `You're all set at ${target.name}. ${booking.customerName} is confirmed for ${booking.service} on ${booking.date} at ${booking.time}. We look forward to seeing you.`,
          bookingCreated: true,
          booking
        }
      };
    }

    return null;
  }

  return {
    handlePublicChatToolCall
  };
}
