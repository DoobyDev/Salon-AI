export function createBusinessAvailabilityService({
  prisma,
  parseHours,
  normalizeBookingDateTime,
  parseOpenHours,
  addMinutesToTime,
  timeToMinutes,
  dayKeyFromDate,
  slotLabel
}) {
  async function getAvailableSlotsForBusiness(business, daysAhead = 4) {
    const hours = parseHours(business.hoursJson);
    const bookings = await prisma.booking.findMany({
      where: {
        businessId: business.id,
        status: "confirmed"
      },
      select: { date: true, time: true }
    });
    const reserved = new Set(
      bookings
        .map((booking) => normalizeBookingDateTime(booking.date, booking.time))
        .filter(Boolean)
        .map((booking) => `${booking.date}|${booking.time}`)
    );

    const now = new Date();
    const nowIsoDate = now.toISOString().slice(0, 10);
    const nowTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const output = [];

    for (let i = 0; i <= daysAhead; i += 1) {
      const dateObj = new Date();
      dateObj.setDate(dateObj.getDate() + i);
      const date = dateObj.toISOString().slice(0, 10);
      const dayKey = dayKeyFromDate(dateObj);
      const dayHours = parseOpenHours(hours[dayKey]);
      if (!dayHours) continue;

      const minServiceDuration = business.services.reduce((min, service) => Math.min(min, Number(service.durationMin || 45)), 45);
      const closeLimit = addMinutesToTime(dayHours.close, -minServiceDuration);
      let cursor = dayHours.open;

      while (timeToMinutes(cursor) <= timeToMinutes(closeLimit)) {
        if (!(date === nowIsoDate && timeToMinutes(cursor) <= timeToMinutes(nowTime))) {
          const key = `${date}|${cursor}`;
          if (!reserved.has(key)) {
            output.push(slotLabel(date, cursor));
          }
        }
        cursor = addMinutesToTime(cursor, 30);
      }
    }
    return output.slice(0, 24);
  }

  function mapBusiness(business, options = {}) {
    const { includeSlots = true, availableSlots = [] } = options;
    return {
      id: business.id,
      name: business.name,
      type: business.type,
      phone: business.phone,
      email: business.email,
      rating: business.rating,
      description: business.description,
      websiteUrl: business.websiteUrl || null,
      websiteTitle: business.websiteTitle || null,
      websiteSummary: business.websiteSummary || null,
      websiteImageUrl: business.websiteImageUrl || null,
      socialFacebook: business.socialFacebook || null,
      socialInstagram: business.socialInstagram || null,
      socialTwitter: business.socialTwitter || null,
      socialLinkedin: business.socialLinkedin || null,
      socialTiktok: business.socialTiktok || null,
      location: {
        city: business.city,
        country: business.country,
        postcode: business.postcode,
        address: business.address
      },
      hours: parseHours(business.hoursJson),
      services: business.services.map((service) => ({
        id: service.id,
        name: service.name,
        duration: service.durationMin,
        price: service.price
      })),
      availableSlots: includeSlots ? availableSlots : []
    };
  }

  function isSlotWithinBusinessHours(business, date, time, durationMin = 45) {
    const dateObj = new Date(`${date}T12:00:00`);
    if (Number.isNaN(dateObj.getTime())) return false;
    const dayKey = dayKeyFromDate(dateObj);
    const hours = parseHours(business?.hoursJson || "{}");
    const dayHours = parseOpenHours(hours[dayKey]);
    if (!dayHours) return false;
    const start = timeToMinutes(time);
    const end = start + Math.max(5, Number(durationMin || 45));
    return start >= timeToMinutes(dayHours.open) && end <= timeToMinutes(dayHours.close);
  }

  return {
    getAvailableSlotsForBusiness,
    mapBusiness,
    isSlotWithinBusinessHours
  };
}
