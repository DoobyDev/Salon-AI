const chatWindow = document.getElementById("chatWindow");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const salonMeta = document.getElementById("salonMeta");
const bookingsList = document.getElementById("bookingsList");
const liveBookingSummary = document.getElementById("liveBookingSummary");

const searchForm = document.getElementById("searchForm");
const clearFiltersBtn = document.getElementById("clearFilters");
const salonResults = document.getElementById("salonResults");
const selectedBusiness = document.getElementById("selectedBusiness");
const liveAreaLabel = document.getElementById("liveAreaLabel");
const appStatus = document.getElementById("appStatus");

const filterName = document.getElementById("filterName");
const filterBusinessType = document.getElementById("filterBusinessType");
const filterLocation = document.getElementById("filterLocation");
const filterPostcode = document.getElementById("filterPostcode");
const filterPhone = document.getElementById("filterPhone");
const homeDemoTimeframeSwitch = document.getElementById("homeDemoTimeframeSwitch");
const homeDemoQuickFilters = document.getElementById("homeDemoQuickFilters");
const homeDemoFrom = document.getElementById("homeDemoFrom");
const homeDemoTo = document.getElementById("homeDemoTo");
const homeDemoCustomApply = document.getElementById("homeDemoCustomApply");
const homeDemoCards = document.getElementById("homeDemoCards");
const homeDemoGauges = document.getElementById("homeDemoGauges");
const homeDemoRevenueBars = document.getElementById("homeDemoRevenueBars");
const homeDemoCancelBars = document.getElementById("homeDemoCancelBars");
const homeDemoRevenueSparkline = document.getElementById("homeDemoRevenueSparkline");
const homeDemoCancelSparkline = document.getElementById("homeDemoCancelSparkline");
const homeDemoNote = document.getElementById("homeDemoNote");
const homeDemoWindowLabel = document.getElementById("homeDemoWindowLabel");
const homeDemoWindowRevenue = document.getElementById("homeDemoWindowRevenue");
const homeDemoWindowRevenueTrend = document.getElementById("homeDemoWindowRevenueTrend");
const homeDemoWindowCancels = document.getElementById("homeDemoWindowCancels");
const homeDemoWindowCancelTrend = document.getElementById("homeDemoWindowCancelTrend");
const homeDemoTargetPct = document.getElementById("homeDemoTargetPct");

const history = [];
let llmEnabled = false;
let businessCache = [];
let selectedBusinessId = "";
let metricsAnimated = false;
let homeDemoTimeframe = "today";
let homeDemoQuickFilter = "";
let homeDemoCustomRange = null;
let homeDemoLiveTick = 0;
const homeDemoDisplayValues = {
  revenue: 0,
  cancels: 0,
  targetPct: 0
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function appendMessage(role, content) {
  const el = document.createElement("div");
  el.className = `msg ${role}`;
  el.textContent = content;
  chatWindow.appendChild(el);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

let appStatusTimer = null;
function setAppStatus(message, isError = false, autoClearMs = 4200) {
  if (!appStatus) return;
  appStatus.textContent = String(message || "").trim();
  appStatus.style.color = isError ? "#ff8d72" : "#aac1df";
  if (appStatusTimer) {
    window.clearTimeout(appStatusTimer);
    appStatusTimer = null;
  }
  if (!appStatus.textContent || autoClearMs <= 0) return;
  appStatusTimer = window.setTimeout(() => {
    if (appStatus) appStatus.textContent = "";
    appStatusTimer = null;
  }, autoClearMs);
}

function formatMoney(value) {
  const num = Number(value || 0);
  if (!Number.isFinite(num)) return "$0";
  return `$${Math.round(num).toLocaleString()}`;
}

function formatRelativeTime(iso) {
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return "just now";
  const diffSec = Math.max(0, Math.floor((Date.now() - dt.getTime()) / 1000));
  if (diffSec < 10) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const mins = Math.floor(diffSec / 60);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

function timeframeLabel(key) {
  if (key === "7d") return "Last 7 Days";
  if (key === "30d") return "Last 30 Days";
  if (key === "custom") return "Custom Range";
  return "Today";
}

function animateNumber(from, to, duration, onUpdate, onDone) {
  const start = performance.now();
  const initial = Number(from || 0);
  const target = Number(to || 0);
  const delta = target - initial;
  if (!Number.isFinite(initial) || !Number.isFinite(target)) {
    onUpdate(target);
    if (typeof onDone === "function") onDone();
    return;
  }
  if (Math.abs(delta) < 0.5) {
    onUpdate(target);
    if (typeof onDone === "function") onDone();
    return;
  }
  const tick = (now) => {
    const progress = Math.min(1, (now - start) / Math.max(1, duration));
    const eased = 1 - (1 - progress) * (1 - progress);
    onUpdate(initial + delta * eased);
    if (progress < 1) {
      requestAnimationFrame(tick);
      return;
    }
    if (typeof onDone === "function") onDone();
  };
  requestAnimationFrame(tick);
}

function updateQuickButtonStates(active) {
  const quickButtons = Array.from(homeDemoQuickFilters?.querySelectorAll("button[data-quick]") || []);
  quickButtons.forEach((btn) => {
    const hit = btn.getAttribute("data-quick") === active;
    btn.classList.toggle("active", hit);
    btn.setAttribute("aria-pressed", hit ? "true" : "false");
  });
  if (homeDemoCustomApply) {
    const isCustom = active === "custom";
    homeDemoCustomApply.classList.toggle("active", isCustom);
    homeDemoCustomApply.setAttribute("aria-pressed", isCustom ? "true" : "false");
  }
}

function renderSparkline(container, series, variant) {
  if (!container) return;
  const values = Array.isArray(series) && series.length ? series : [0, 0];
  const width = 260;
  const height = 42;
  const pad = 4;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = Math.max(1, max - min);
  const xStep = values.length > 1 ? (width - pad * 2) / (values.length - 1) : 0;
  const points = values.map((value, index) => {
    const x = pad + index * xStep;
    const y = height - pad - ((value - min) / spread) * (height - pad * 2);
    return { x, y };
  });
  const pointString = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const first = points[0];
  const last = points[points.length - 1];
  const linePath = points.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaPath = `M ${first.x.toFixed(1)} ${height - pad} ${linePath} L ${last.x.toFixed(1)} ${height - pad} Z`;
  const wrapperClass = variant === "cancel" ? "sparkline-wrap cancel" : "sparkline-wrap";
  container.className = wrapperClass;
  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path class="sparkline-area" d="${areaPath}"></path>
      <polyline class="sparkline-line" points="${pointString}"></polyline>
      <circle class="sparkline-dot" cx="${last.x.toFixed(1)}" cy="${last.y.toFixed(1)}" r="2.6"></circle>
    </svg>
  `;
}

function withLiveDrift(raw) {
  const revenueFactor = 1 + Math.sin(homeDemoLiveTick / 2.6) * 0.018;
  const shortFactor = 1 + Math.cos(homeDemoLiveTick / 1.9) * 0.03;
  const cancelFactor = 1 + Math.sin(homeDemoLiveTick / 2.2) * 0.08;
  const periodRevenue = Math.max(0, Math.round(raw.periodRevenue * revenueFactor));
  const target = Math.max(1, Math.round(raw.target));
  const cancellations = Math.max(0, Math.round(raw.cancellations * cancelFactor));
  const revenueSeries = raw.revenueSeries.map((value, index) => {
    const wiggle = 1 + Math.sin((homeDemoLiveTick + index) / 2.5) * 0.05;
    return Math.max(1, Math.round(value * wiggle));
  });
  const cancelSeries = raw.cancelSeries.map((value, index) => {
    const wiggle = 1 + Math.cos((homeDemoLiveTick + index) / 2.1) * 0.16;
    return Math.max(0, Math.round(value * wiggle));
  });
  const targetPct = Number(((periodRevenue / target) * 100).toFixed(1));
  const cancellationPct = Number(((cancellations / Math.max(1, cancelSeries.reduce((sum, n) => sum + n, 0) + 18)) * 100).toFixed(1));
  const revenueTrend = Number((raw.revenueTrend + Math.sin(homeDemoLiveTick / 3.4) * 1.2).toFixed(1));
  const cancelTrend = Number((raw.cancelTrend + Math.cos(homeDemoLiveTick / 3.2) * 0.6).toFixed(1));
  return {
    ...raw,
    periodRevenue,
    lastHourRevenue: Math.max(0, Math.round(raw.lastHourRevenue * shortFactor)),
    last15mRevenue: Math.max(0, Math.round(raw.last15mRevenue * shortFactor)),
    cancellations,
    target,
    targetPct,
    cancellationPct,
    revenueTrend,
    cancelTrend,
    revenueSeries,
    cancelSeries
  };
}

function buildHomeDemoDataset(mode) {
  const base = {
    today: {
      periodRevenue: 1840,
      lastHourRevenue: 320,
      last15mRevenue: 105,
      cancellations: 2,
      target: 2500,
      targetPct: 73.6,
      cancellationPct: 14.3,
      revenueTrend: 9.4,
      cancelTrend: -2.1,
      revenueSeries: [120, 180, 260, 300, 340, 320],
      cancelSeries: [0, 1, 0, 1, 0, 0],
      labels: ["9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM"]
    },
    "7d": {
      periodRevenue: 12980,
      lastHourRevenue: 410,
      last15mRevenue: 125,
      cancellations: 8,
      target: 17500,
      targetPct: 74.2,
      cancellationPct: 9.8,
      revenueTrend: 11.2,
      cancelTrend: -1.3,
      revenueSeries: [1380, 1640, 1790, 2010, 2240, 1920],
      cancelSeries: [1, 0, 2, 1, 2, 2],
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    },
    "30d": {
      periodRevenue: 52140,
      lastHourRevenue: 460,
      last15mRevenue: 150,
      cancellations: 34,
      target: 70000,
      targetPct: 74.5,
      cancellationPct: 7.6,
      revenueTrend: 14.8,
      cancelTrend: -0.9,
      revenueSeries: [8120, 9050, 9880, 10420, 11260, 12410],
      cancelSeries: [6, 5, 7, 4, 6, 6],
      labels: ["W1", "W2", "W3", "W4", "W5", "W6"]
    }
  };
  if (mode !== "custom") return withLiveDrift(base[mode] || base.today);

  const from = homeDemoCustomRange?.from || "";
  const to = homeDemoCustomRange?.to || "";
  if (!from || !to) return base.today;
  const fromDate = new Date(`${from}T00:00:00`);
  const toDate = new Date(`${to}T00:00:00`);
  const days = Math.max(1, Math.floor((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  const revenue = Math.round(days * 1420);
  const target = Math.round(days * 1900);
  const targetPct = Number(((revenue / Math.max(1, target)) * 100).toFixed(1));
  const cancellations = Math.max(1, Math.round(days / 4));
  return withLiveDrift({
    periodRevenue: revenue,
    lastHourRevenue: Math.max(140, Math.round(revenue / Math.max(8, days))),
    last15mRevenue: Math.max(40, Math.round(revenue / Math.max(30, days * 3))),
    cancellations,
    target,
    targetPct,
    cancellationPct: Number(((cancellations / Math.max(1, days * 2)) * 100).toFixed(1)),
    revenueTrend: 8.1,
    cancelTrend: -1.1,
    revenueSeries: [0.52, 0.61, 0.74, 0.81, 0.92, 1].map((m) => Math.round((revenue / 6) * m)),
    cancelSeries: [1, 0, 2, 1, 1, Math.max(1, cancellations - 5)],
    labels: ["S1", "S2", "S3", "S4", "S5", "S6"]
  });
}

function renderHomeDemoDashboard() {
  if (!homeDemoCards || !homeDemoGauges || !homeDemoRevenueBars || !homeDemoCancelBars) return;
  const mode = homeDemoCustomRange ? "custom" : homeDemoTimeframe;
  const model = buildHomeDemoDataset(mode);
  const periodText = mode === "custom" && homeDemoCustomRange
    ? `${homeDemoCustomRange.from} to ${homeDemoCustomRange.to}`
    : timeframeLabel(mode);

  homeDemoCards.innerHTML = "";
  [
    { label: `${periodText} Revenue`, value: formatMoney(model.periodRevenue) },
    { label: "Last 60m Revenue", value: formatMoney(model.lastHourRevenue) },
    { label: "Last 15m Revenue", value: formatMoney(model.last15mRevenue) },
    { label: `${periodText} Cancellations`, value: String(model.cancellations) }
  ].forEach((entry) => {
    const article = document.createElement("article");
    article.innerHTML = `<p>${entry.label}</p><strong>${entry.value}</strong>`;
    homeDemoCards.appendChild(article);
  });

  homeDemoGauges.innerHTML = `
    <article class="gauge-card">
      <div class="gauge-ring" style="--gauge-progress:${Math.min(100, Math.max(0, model.targetPct))}">
        <span>${Math.round(model.targetPct)}%</span>
      </div>
      <small>Target progress (${formatMoney(model.target)} target)</small>
    </article>
    <article class="gauge-card">
      <div class="gauge-ring" style="--gauge-progress:${Math.min(100, Math.max(0, model.cancellationPct))}">
        <span>${Math.round(model.cancellationPct)}%</span>
      </div>
      <small>Cancellation rate</small>
    </article>
  `;

  const maxRevenue = Math.max(1, ...model.revenueSeries);
  homeDemoRevenueBars.innerHTML = "";
  model.revenueSeries.forEach((value, index) => {
    const h = Math.max(8, Math.round((value / maxRevenue) * 108));
    const label = model.labels[index] || `P${index + 1}`;
    const col = document.createElement("article");
    col.className = "live-bar-col";
    col.innerHTML = `<div class="live-bar revenue" style="--bar-height:${h}px"></div><small>${label}</small><small>${formatMoney(value)}</small>`;
    homeDemoRevenueBars.appendChild(col);
  });

  const maxCancels = Math.max(1, ...model.cancelSeries);
  homeDemoCancelBars.innerHTML = "";
  model.cancelSeries.forEach((value, index) => {
    const h = Math.max(8, Math.round((value / maxCancels) * 108));
    const label = model.labels[index] || `P${index + 1}`;
    const col = document.createElement("article");
    col.className = "live-bar-col";
    col.innerHTML = `<div class="live-bar cancel" style="--bar-height:${h}px"></div><small>${label}</small><small>${value}</small>`;
    homeDemoCancelBars.appendChild(col);
  });

  if (homeDemoWindowLabel) homeDemoWindowLabel.textContent = periodText;
  if (homeDemoWindowRevenue) {
    animateNumber(homeDemoDisplayValues.revenue, model.periodRevenue, 420, (value) => {
      homeDemoWindowRevenue.textContent = formatMoney(value);
    }, () => {
      homeDemoDisplayValues.revenue = model.periodRevenue;
    });
  }
  if (homeDemoWindowRevenueTrend) homeDemoWindowRevenueTrend.textContent = `+${model.revenueTrend}%`;
  if (homeDemoWindowCancels) {
    animateNumber(homeDemoDisplayValues.cancels, model.cancellations, 360, (value) => {
      homeDemoWindowCancels.textContent = String(Math.round(value));
    }, () => {
      homeDemoDisplayValues.cancels = model.cancellations;
    });
  }
  if (homeDemoWindowCancelTrend) homeDemoWindowCancelTrend.textContent = `${model.cancelTrend}%`;
  if (homeDemoTargetPct) {
    animateNumber(homeDemoDisplayValues.targetPct, model.targetPct, 380, (value) => {
      homeDemoTargetPct.textContent = `${Math.round(value)}%`;
    }, () => {
      homeDemoDisplayValues.targetPct = model.targetPct;
    });
  }
  renderSparkline(homeDemoRevenueSparkline, model.revenueSeries, "revenue");
  renderSparkline(homeDemoCancelSparkline, model.cancelSeries, "cancel");
  if (homeDemoNote) homeDemoNote.textContent = `Demo sync ${formatRelativeTime(new Date().toISOString())}.`;
}

function setHomeDemoTimeframe(next) {
  homeDemoCustomRange = null;
  homeDemoQuickFilter = "";
  homeDemoTimeframe = next === "7d" || next === "30d" ? next : "today";
  const timeframeButtons = Array.from(homeDemoTimeframeSwitch?.querySelectorAll("button[data-timeframe]") || []);
  timeframeButtons.forEach((btn) => {
    const active = btn.getAttribute("data-timeframe") === homeDemoTimeframe;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-selected", active ? "true" : "false");
  });
  updateQuickButtonStates("");
  if (homeDemoFrom) homeDemoFrom.value = "";
  if (homeDemoTo) homeDemoTo.value = "";
  renderHomeDemoDashboard();
}

function applyHomeDemoQuickFilter(kind) {
  const now = new Date();
  homeDemoQuickFilter = kind;
  updateQuickButtonStates(kind);
  const timeframeButtons = Array.from(homeDemoTimeframeSwitch?.querySelectorAll("button[data-timeframe]") || []);
  timeframeButtons.forEach((btn) => {
    btn.classList.remove("active");
    btn.setAttribute("aria-selected", "false");
  });

  if (kind === "week") {
    const weekday = now.getDay();
    const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
    const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset).toISOString().slice(0, 10);
    const to = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().slice(0, 10);
    homeDemoCustomRange = { from, to };
  } else if (kind === "month") {
    const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const to = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().slice(0, 10);
    homeDemoCustomRange = { from, to };
  }

  if (homeDemoFrom) homeDemoFrom.value = homeDemoCustomRange?.from || "";
  if (homeDemoTo) homeDemoTo.value = homeDemoCustomRange?.to || "";
  renderHomeDemoDashboard();
}

function applyHomeDemoCustomRange() {
  const from = String(homeDemoFrom?.value || "").trim();
  const to = String(homeDemoTo?.value || "").trim();
  if (!from || !to) return;
  if (from > to) return;
  homeDemoQuickFilter = "custom";
  homeDemoCustomRange = { from, to };
  updateQuickButtonStates("custom");
  const timeframeButtons = Array.from(homeDemoTimeframeSwitch?.querySelectorAll("button[data-timeframe]") || []);
  timeframeButtons.forEach((btn) => {
    btn.classList.remove("active");
    btn.setAttribute("aria-selected", "false");
  });
  renderHomeDemoDashboard();
}

function initializeHomeDemoDashboard() {
  if (!homeDemoTimeframeSwitch) return;
  homeDemoTimeframeSwitch.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const timeframe = String(target.getAttribute("data-timeframe") || "").trim().toLowerCase();
    if (!timeframe) return;
    setHomeDemoTimeframe(timeframe);
  });
  homeDemoQuickFilters?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const key = String(target.getAttribute("data-quick") || "").trim().toLowerCase();
    if (!key) return;
    applyHomeDemoQuickFilter(key);
  });
  homeDemoCustomApply?.addEventListener("click", () => {
    applyHomeDemoCustomRange();
  });
  setHomeDemoTimeframe("today");
  window.setInterval(() => {
    homeDemoLiveTick += 1;
    renderHomeDemoDashboard();
  }, 12000);
}

function animateCounters() {
  if (metricsAnimated) return;
  metricsAnimated = true;
  const counters = Array.from(document.querySelectorAll(".count-up"));
  counters.forEach((counter) => {
    const target = Number(counter.getAttribute("data-target") || "0");
    const hasPercent = counter.textContent.includes("%");
    const hasCurrency = counter.textContent.includes("$");
    const duration = 1200;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      const value = Math.round(target * eased);

      if (hasCurrency) {
        counter.textContent = `$${value.toLocaleString()}`;
      } else if (hasPercent) {
        counter.textContent = `${value}%`;
      } else {
        counter.textContent = value.toLocaleString();
      }

      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  });
}

function setupRevealAnimations() {
  const nodes = Array.from(document.querySelectorAll(".reveal"));
  if (!nodes.length) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          if (entry.target.id === "dashboards" || entry.target.classList.contains("dashboard-showcase")) {
            animateCounters();
          }
        }
      });
    },
    { threshold: 0.18 }
  );
  nodes.forEach((node) => observer.observe(node));
}

function renderBookings(bookings) {
  bookingsList.innerHTML = "";
  if (!bookings.length) {
    const item = document.createElement("li");
    item.className = "booking-item";
    item.textContent = "No live bookings yet. First booking appears here.";
    bookingsList.appendChild(item);
    return;
  }

  bookings.forEach((b) => {
    const item = document.createElement("li");
    item.className = "booking-item";
    item.textContent = `${b.customerName || b.guest_name}: ${b.service} on ${b.date} at ${b.time} (${b.businessName || b.stylist || "Front Desk"})`;
    bookingsList.appendChild(item);
  });
}

function getFilters() {
  return {
    name: filterName.value.trim(),
    businessType: String(filterBusinessType?.value || "").trim(),
    location: filterLocation.value.trim(),
    postcode: filterPostcode.value.trim(),
    phone: filterPhone.value.trim()
  };
}

function updateLiveSummary(results, location) {
  const locationLabel = location || "your area";
  liveBookingSummary.textContent = `${results.length} businesses found in ${locationLabel}. Open slots appear when you view a front desk profile.`;
  liveAreaLabel.textContent = `Live availability scan for ${locationLabel}: ${results.length} businesses matched.`;
}

function renderBusinessDetails(business) {
  const serviceRows = business.services
    .map((s) => `<li>${escapeHtml(s.name)} - ${s.duration} mins - $${s.price}</li>`)
    .join("");

  const slots = business.availableSlots.map((slot) => `<li>${escapeHtml(slot)}</li>`).join("");
  selectedBusiness.innerHTML = `
    <h3>${escapeHtml(business.name)} Front Desk</h3>
    <p>${escapeHtml(business.location.city)}, ${escapeHtml(business.location.country)} | ${escapeHtml(business.location.postcode)} | ${escapeHtml(business.phone)}</p>
    <p><strong>Rating:</strong> ${business.rating} / 5</p>
    <p>${escapeHtml(business.description || "Business profile information loaded.")}</p>
    <h4>Service Menu</h4>
    <ul class="highlights">${serviceRows}</ul>
    <h4>Available Booking Slots</h4>
    <ul class="slot-list">${slots}</ul>
    <div class="salon-actions">
      <button class="btn btn-quickbook" data-salon-id="${escapeHtml(business.id)}">Book with AI Receptionist</button>
    </div>
  `;
}

function renderBusinessResults(results) {
  salonResults.innerHTML = "";
  if (!results.length) {
    const item = document.createElement("li");
    item.className = "salon-item";
    item.textContent = "No hair/beauty businesses found for these filters.";
    salonResults.appendChild(item);
    return;
  }

  results.forEach((business) => {
    const item = document.createElement("li");
    item.className = "salon-item";
    item.innerHTML = `
      <h4>${escapeHtml(business.name)}</h4>
      <p>${escapeHtml(business.location.city)}, ${escapeHtml(business.location.country)} | ${escapeHtml(business.location.postcode)}</p>
      <p>${escapeHtml(business.phone)} | Rating: ${business.rating} | slots shown in profile</p>
      <p>Services: ${escapeHtml(business.services.map((s) => s.name).join(", "))}</p>
      <div class="salon-actions">
        <button class="btn btn-view" data-salon-id="${escapeHtml(business.id)}">Open Profile</button>
        <button class="btn btn-ghost btn-quickbook" data-salon-id="${escapeHtml(business.id)}">Quick Book</button>
      </div>
    `;
    salonResults.appendChild(item);
  });
}

async function searchBusinesses() {
  const filters = getFilters();
  const params = new URLSearchParams({ ...filters, limit: "25" });
  setAppStatus("Searching businesses...", false, 0);
  try {
    const response = await fetch(`/api/search/businesses?${params.toString()}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to search businesses right now.");
    const results = Array.isArray(data.results) ? data.results : [];
    businessCache = results;
    renderBusinessResults(results);
    updateLiveSummary(results, filters.location);
    setAppStatus(results.length ? `Found ${results.length} result${results.length === 1 ? "" : "s"}.` : "No matches found. Try broader filters.");
  } catch (error) {
    businessCache = [];
    renderBusinessResults([]);
    updateLiveSummary([], filters.location);
    setAppStatus(error.message, true);
  }
}

function quickBookBusiness(business) {
  selectedBusinessId = business.id;
  const slot = business.availableSlots[0] || "tomorrow 2:00 PM";
  const defaultService = business.services[0]?.name || "Signature Service";
  chatInput.value = `Book ${defaultService} at ${business.name} on ${slot}. My name is `;
  chatInput.focus();
  document.querySelector(".receptionist-live").scrollIntoView({ behavior: "smooth" });
}

async function loadConfig() {
  const response = await fetch("/api/config");
  const config = await response.json();
  llmEnabled = Boolean(config.llmEnabled);
  const featured = config.featuredBusiness;
  const policyText = config?.cancellationPolicy?.feeRule || "Cancellation policy unavailable.";

  if (featured) {
    salonMeta.textContent = `${featured.name} | ${featured.phone} | ${featured.location.address}, ${featured.location.city} | Cancellation: ${policyText}`;
    liveBookingSummary.textContent = `${featured.availableSlots.length} slots available today at ${featured.name}.`;
    selectedBusinessId = featured.id;
  } else {
    salonMeta.textContent = `No featured business configured yet. Cancellation: ${policyText}`;
    liveBookingSummary.textContent = "No live availability yet. Add businesses to see slots.";
    selectedBusinessId = "";
  }

  if (!llmEnabled) {
    appendMessage(
      "assistant",
      "AI chat is disabled. Add OPENAI_API_KEY in environment variables and restart the server."
    );
  } else {
    appendMessage("assistant", "Welcome to AI Hair & Beauty Receptionist. I can help you book now.");
  }
}

async function loadBookings() {
  try {
    const response = await fetch("/api/bookings/public-demo");
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to load demo bookings.");
    renderBookings(data.bookings || []);
  } catch (error) {
    renderBookings([]);
    setAppStatus(error.message, true);
  }
}

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;

  appendMessage("user", message);
  history.push({ role: "user", content: message });
  chatInput.value = "";

  const thinking = document.createElement("div");
  thinking.className = "msg assistant";
  thinking.textContent = "Working on that...";
  chatWindow.appendChild(thinking);

  try {
    setAppStatus("AI is preparing a response...", false, 0);
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history, businessId: selectedBusinessId })
    });
    const data = await response.json();
    thinking.remove();

    const reply = data.reply || "I could not answer right now.";
    appendMessage("assistant", reply);
    history.push({ role: "assistant", content: reply });
    setAppStatus(data.bookingCreated ? "Booking captured successfully." : "Response received.");

    if (data.bookingCreated) await loadBookings();
  } catch {
    thinking.remove();
    appendMessage("assistant", "Network error. Please try again.");
    setAppStatus("Network error. Please try again.", true);
  }
});

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await searchBusinesses();
});

clearFiltersBtn.addEventListener("click", async () => {
  filterName.value = "";
  if (filterBusinessType) filterBusinessType.value = "";
  filterLocation.value = "";
  filterPostcode.value = "";
  filterPhone.value = "";
  await searchBusinesses();
  setAppStatus("Filters cleared.");
});

salonResults.addEventListener("click", (event) => {
  const run = async () => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const businessId = target.getAttribute("data-salon-id");
  if (!businessId) return;
  const business = businessCache.find((b) => b.id === businessId);
  if (!business) return;

  if (target.classList.contains("btn-view")) {
    setAppStatus("Loading business profile...", false, 0);
    const response = await fetch(`/api/businesses/${business.id}`);
    const data = await response.json();
    if (!response.ok || !data.business) {
      throw new Error(data.error || "Could not load selected business.");
    }
    selectedBusinessId = data.business.id;
    renderBusinessDetails(data.business);
    setAppStatus("Business profile loaded.");
  } else if (target.classList.contains("btn-quickbook")) {
    quickBookBusiness(business);
    setAppStatus("Quick booking prompt added to chat.");
  }
  };
  run().catch((error) => {
    setAppStatus(error.message || "Unable to complete that action.", true);
  });
});

selectedBusiness.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (!target.classList.contains("btn-quickbook")) return;

  const businessId = target.getAttribute("data-salon-id");
  if (!businessId) return;
  const business = businessCache.find((b) => b.id === businessId);
  if (!business) return;
  quickBookBusiness(business);
});

try {
  await loadConfig();
} catch {
  appendMessage("assistant", "Configuration could not be loaded right now.");
  setAppStatus("Config load failed. Some features may be limited.", true);
}
await loadBookings();
await searchBusinesses();
initializeHomeDemoDashboard();
setupRevealAnimations();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
