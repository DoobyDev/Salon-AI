export function createCrmSegmentsService({ normalizeBookingDateTime }) {
  function customerKeyFromBooking(booking) {
    const email = String(booking?.customerEmail || "").trim().toLowerCase();
    const phone = String(booking?.customerPhone || "").trim();
    if (email) return `email:${email}`;
    if (phone) return `phone:${phone}`;
    return `name:${String(booking?.customerName || "guest").trim().toLowerCase()}`;
  }

  function buildCrmSegments(bookings) {
    const nowMs = Date.now();
    const rollups = new Map();

    bookings.forEach((booking) => {
      const key = customerKeyFromBooking(booking);
      if (!rollups.has(key)) {
        rollups.set(key, {
          customerKey: key,
          customerName: String(booking.customerName || "Client").trim(),
          customerEmail: String(booking.customerEmail || "").trim().toLowerCase(),
          customerPhone: String(booking.customerPhone || "").trim(),
          totalSpend: 0,
          visitCount: 0,
          cancelledCount: 0,
          upcomingConfirmed: 0,
          lastVisitAt: null,
          lastService: ""
        });
      }
      const row = rollups.get(key);
      const normalized = normalizeBookingDateTime(booking.date, booking.time);
      const startsAt = normalized ? new Date(`${normalized.date}T${normalized.time}:00`).getTime() : null;
      const validStart = Number.isFinite(startsAt) ? startsAt : null;

      if (booking.status === "cancelled") {
        row.cancelledCount += 1;
      } else {
        row.visitCount += 1;
        row.totalSpend += Number(booking.price || 0);
        if (validStart && validStart > nowMs && booking.status === "confirmed") {
          row.upcomingConfirmed += 1;
        }
        if (validStart && validStart <= nowMs) {
          if (!row.lastVisitAt || validStart > row.lastVisitAt) {
            row.lastVisitAt = validStart;
            row.lastService = String(booking.service || "").trim();
          }
        }
      }
    });

    const customers = Array.from(rollups.values()).map((row) => {
      const daysSinceLastVisit = row.lastVisitAt ? Math.floor((nowMs - row.lastVisitAt) / (1000 * 60 * 60 * 24)) : null;
      const totalAppointments = row.visitCount + row.cancelledCount;
      const cancellationRate = totalAppointments ? row.cancelledCount / totalAppointments : 0;
      return {
        ...row,
        totalSpend: Number(row.totalSpend.toFixed(2)),
        daysSinceLastVisit,
        cancellationRate: Number((cancellationRate * 100).toFixed(1))
      };
    });

    const toLead = (customer, message) => ({
      customerKey: customer.customerKey,
      customerName: customer.customerName,
      customerEmail: customer.customerEmail,
      customerPhone: customer.customerPhone,
      daysSinceLastVisit: customer.daysSinceLastVisit,
      totalSpend: customer.totalSpend,
      message
    });

    const highValueLapsed = customers
      .filter((c) => c.totalSpend >= 250 && (c.daysSinceLastVisit || 0) >= 35 && c.upcomingConfirmed === 0)
      .map((c) =>
        toLead(
          c,
          `Hi ${c.customerName}, we miss seeing you. Enjoy a loyalty priority slot this week for your next visit.`
        )
      );

    const atRiskCancellers = customers
      .filter((c) => c.visitCount + c.cancelledCount >= 3 && c.cancellationRate >= 30 && c.upcomingConfirmed === 0)
      .map((c) =>
        toLead(
          c,
          `Hi ${c.customerName}, we can reserve a flexible slot and send reminders so your next appointment is easier to keep.`
        )
      );

    const vipRegulars = customers
      .filter((c) => c.totalSpend >= 400 && c.visitCount >= 5 && (c.daysSinceLastVisit || 0) <= 35)
      .map((c) =>
        toLead(
          c,
          `Hi ${c.customerName}, as one of our VIP clients, you have priority access to premium appointments this week.`
        )
      );

    const newClients = customers
      .filter((c) => c.visitCount === 1 && (c.daysSinceLastVisit || 0) <= 21 && c.upcomingConfirmed === 0)
      .map((c) =>
        toLead(
          c,
          `Hi ${c.customerName}, thanks for visiting us. We would love to welcome you back with a tailored follow-up appointment.`
        )
      );

    return {
      segments: [
        { id: "high_value_lapsed", label: "High-Value Lapsed", leads: highValueLapsed },
        { id: "at_risk_cancellers", label: "At-Risk Cancellers", leads: atRiskCancellers },
        { id: "vip_regulars", label: "VIP Regulars", leads: vipRegulars },
        { id: "new_clients_followup", label: "New Client Follow-Up", leads: newClients }
      ],
      summary: {
        totalCustomers: customers.length,
        actionableLeads: highValueLapsed.length + atRiskCancellers.length + vipRegulars.length + newClients.length
      }
    };
  }

  return {
    customerKeyFromBooking,
    buildCrmSegments
  };
}
