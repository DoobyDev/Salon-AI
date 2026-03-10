function buildSubscriberCustomerKey(booking = {}) {
  const email = String(booking.customerEmail || "").trim().toLowerCase();
  const phone = String(booking.customerPhone || "").trim();
  if (email) return `email:${email}`;
  if (phone) return `phone:${phone}`;
  return `name:${String(booking.customerName || "guest").trim().toLowerCase()}`;
}

export function buildSubscriberNoShowRisk(normalizedBookings = [], nowMs = Date.now()) {
  const bookings = Array.isArray(normalizedBookings) ? normalizedBookings : [];

  return bookings
    .filter((booking) => booking.status === "confirmed" && booking.startsAt?.getTime?.() > nowMs)
    .map((booking) => {
      const history = bookings.filter(
        (candidate) =>
          buildSubscriberCustomerKey(candidate) === buildSubscriberCustomerKey(booking) &&
          candidate.startsAt?.getTime?.() < booking.startsAt.getTime()
      );
      const historyCount = history.length;
      const cancelledCount = history.filter((candidate) => candidate.status === "cancelled").length;
      const cancellationRate = historyCount ? cancelledCount / historyCount : 0;
      const leadHours = (booking.startsAt.getTime() - nowMs) / (1000 * 60 * 60);

      let score = 5;
      const reasons = [];
      if (leadHours <= 6) {
        score += 35;
        reasons.push("Very short lead time.");
      } else if (leadHours <= 24) {
        score += 22;
        reasons.push("Booking is within 24 hours.");
      } else if (leadHours <= 48) {
        score += 12;
        reasons.push("Booking is within 48 hours.");
      }
      if (cancellationRate >= 0.5) {
        score += 35;
        reasons.push("High previous cancellation rate.");
      } else if (cancellationRate >= 0.25) {
        score += 22;
        reasons.push("Moderate previous cancellation rate.");
      } else if (cancellationRate >= 0.1) {
        score += 10;
        reasons.push("Some previous cancellations.");
      }
      const price = Number(booking.price || 0);
      if (price >= 100) {
        score += 5;
        reasons.push("High-value appointment.");
      }

      const riskScore = Math.min(99, Math.max(0, Math.round(score)));
      const riskLevel = riskScore >= 70 ? "high" : riskScore >= 40 ? "medium" : "low";
      return {
        bookingId: booking.id,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone || "",
        customerEmail: booking.customerEmail || "",
        service: booking.service,
        date: booking.normalizedDate,
        time: booking.time,
        riskScore,
        riskLevel,
        reasons
      };
    })
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 10);
}

export function buildSubscriberRebookingPrompts(normalizedBookings = [], nowMs = Date.now()) {
  const bookings = Array.isArray(normalizedBookings) ? normalizedBookings : [];
  const groupedByCustomer = new Map();

  bookings.forEach((booking) => {
    const key = buildSubscriberCustomerKey(booking);
    const current = groupedByCustomer.get(key) || [];
    current.push(booking);
    groupedByCustomer.set(key, current);
  });

  const rebookingPrompts = [];
  groupedByCustomer.forEach((entries, customerKey) => {
    const nonCancelledPast = entries.filter((row) => row.status !== "cancelled" && row.startsAt?.getTime?.() < nowMs);
    if (!nonCancelledPast.length) return;
    const hasFutureConfirmed = entries.some((row) => row.status === "confirmed" && row.startsAt?.getTime?.() > nowMs);
    if (hasFutureConfirmed) return;

    nonCancelledPast.sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime());
    const lastVisit = nonCancelledPast[0];
    const daysSince = Math.floor((nowMs - lastVisit.startsAt.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince < 28) return;
    const customerName = String(lastVisit.customerName || "Client").trim();
    const serviceName = String(lastVisit.service || "a service").trim();
    rebookingPrompts.push({
      customerKey,
      customerName,
      customerPhone: lastVisit.customerPhone || "",
      customerEmail: lastVisit.customerEmail || "",
      lastService: serviceName,
      daysSinceLastVisit: daysSince,
      suggestedMessage: `Hi ${customerName}, it has been ${daysSince} days since your ${serviceName}. We have new availability this week and would love to book your next visit.`
    });
  });

  return rebookingPrompts.sort((a, b) => b.daysSinceLastVisit - a.daysSinceLastVisit).slice(0, 10);
}
