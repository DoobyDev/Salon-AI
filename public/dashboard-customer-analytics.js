// Customer dashboard analytics/control-center runtime.
export function createCustomerAnalyticsRuntime(deps) {
  const {
    doc = document,
    getUserRole,
    getUserEmail,
    getBookingRows,
    getSelectedCustomerSalon,
    parseBookingDate,
    formatBookingStatusLabel,
    normalizeText,
    escapeHtml,
    renderCustomerLexiCalendar,
    customerBookingHistory,
    customerHistoryIntro,
    customerAnalyticsGrid,
    customerControlMetricGrid
  } = deps || {};

  function renderCustomerBookingHistory(rows = []) {
    if (!customerBookingHistory) return;
    customerBookingHistory.innerHTML = "";
    if (customerHistoryIntro) {
      customerHistoryIntro.textContent = rows.length
        ? `Showing previous salon visits and upcoming appointments linked to ${getUserEmail?.() || "your email address"}.`
        : "Any walk-ins or appointments booked with this email will appear here automatically.";
    }
    if (!rows.length) {
      customerBookingHistory.innerHTML = "<li>No visits booked yet.</li>";
      return;
    }
    const sorted = rows
      .slice()
      .sort((a, b) => `${b.date || ""} ${b.time || ""}`.localeCompare(`${a.date || ""} ${a.time || ""}`));
    const now = new Date();
    sorted.forEach((row) => {
      const bookingDate = parseBookingDate?.(row.date);
      const isPast = bookingDate ? bookingDate < now : false;
      const visitLabel = isPast ? "Previous salon visit" : "Upcoming appointment";
      const li = doc.createElement("li");
      li.innerHTML = `
      <strong>${row.businessName || "Business"} | ${row.service || "Service"}</strong><br />
      <small>${row.date || "N/A"} at ${row.time || "N/A"} | ${formatBookingStatusLabel?.(row.status)} | ${visitLabel}</small>
    `;
      customerBookingHistory.appendChild(li);
    });
  }

  function renderCustomerAnalytics(rows = []) {
    if (!customerAnalyticsGrid) return;
    customerAnalyticsGrid.innerHTML = "";
    const total = rows.length;
    const completed = rows.filter((row) => normalizeText?.(row.status) === "completed").length;
    const cancelled = rows.filter((row) => normalizeText?.(row.status) === "cancelled").length;
    const upcoming = rows.filter((row) => {
      const date = parseBookingDate?.(row.date);
      return date && date >= new Date() && normalizeText?.(row.status) !== "cancelled";
    }).length;
    const uniqueSalons = new Set(rows.map((row) => normalizeText?.(row.businessName)).filter(Boolean)).size;
    const completionRate = total ? Math.round((completed / total) * 100) : 0;
    const cards = [
      { label: "Total Bookings", value: String(total) },
      { label: "Completed Visits", value: String(completed) },
      { label: "Upcoming Bookings", value: String(upcoming) },
      { label: "Cancellation Count", value: String(cancelled) },
      { label: "Completion Rate", value: `${completionRate}%` },
      { label: "Businesses Visited", value: String(uniqueSalons) }
    ];
    cards.forEach((card) => {
      const article = doc.createElement("article");
      article.className = "dash-card";
      article.innerHTML = `<p>${card.label}</p><strong>${card.value}</strong>`;
      customerAnalyticsGrid.appendChild(article);
    });
  }

  function renderCustomerControlCenter(rows = []) {
    if (!customerControlMetricGrid) return;
    const salon = getSelectedCustomerSalon?.();
    const total = rows.length;
    const upcomingRows = rows.filter((row) => {
      const date = parseBookingDate?.(row?.date);
      return date && date >= new Date() && normalizeText?.(row?.status) !== "cancelled";
    });
    const uniqueSalons = new Set(rows.map((row) => normalizeText?.(row?.businessName)).filter(Boolean)).size;
    const latestVisit = rows
      .filter((row) => parseBookingDate?.(row?.date))
      .sort((a, b) => parseBookingDate?.(b?.date) - parseBookingDate?.(a?.date))[0] || null;
    const openSlots = Array.isArray(salon?.availableSlots) ? salon.availableSlots.length : 0;
    const cards = [
      {
        label: "My Bookings",
        value: String(total),
        meta: total ? `${upcomingRows.length} upcoming` : "No bookings yet"
      },
      {
        label: "Selected Salon",
        value: salon?.name || "Choose a salon",
        meta: salon ? `${salon.city} | ${openSlots} open slots` : "Pick a business to view live availability"
      },
      {
        label: "Visit History",
        value: latestVisit?.date || "No visits yet",
        meta: latestVisit ? `${latestVisit.businessName || "Business"} | ${formatBookingStatusLabel?.(latestVisit.status)}` : "Your most recent booking will show here"
      },
      {
        label: "Salons Visited",
        value: String(uniqueSalons),
        meta: uniqueSalons ? "Tracked from your booking history" : "Build up your profile as you book"
      }
    ];
    customerControlMetricGrid.innerHTML = "";
    cards.forEach((card) => {
      const article = doc.createElement("article");
      article.className = "customer-control-metric-card";
      article.innerHTML = `
      <p>${escapeHtml?.(card.label)}</p>
      <strong>${escapeHtml?.(card.value)}</strong>
      <small>${escapeHtml?.(card.meta)}</small>
    `;
      customerControlMetricGrid.appendChild(article);
    });
  }

  function refreshCustomerDashboard() {
    if (getUserRole?.() !== "customer") return;
    const rows = getBookingRows?.() || [];
    renderCustomerControlCenter(rows);
    renderCustomerBookingHistory(rows);
    renderCustomerAnalytics(rows);
    renderCustomerLexiCalendar?.();
  }

  return {
    renderCustomerBookingHistory,
    renderCustomerAnalytics,
    renderCustomerControlCenter,
    refreshCustomerDashboard
  };
}
