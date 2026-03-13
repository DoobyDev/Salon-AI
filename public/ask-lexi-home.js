import { registerServiceWorker } from "./pwa-runtime.js";
import { createSharedAskLexiPopup } from "./shared-ask-lexi-popup.js";
import { buildPrimaryAskLexiPopupOptions } from "./shared-ask-lexi-presets.js";

const AUTH_TOKEN_KEY = "salon_ai_token";
const AUTH_USER_KEY = "salon_ai_user";

const homeHeaderAskLexiBtn = document.getElementById("homeHeaderAskLexiBtn");
const searchForm = document.getElementById("searchForm");
const clearFiltersBtn = document.getElementById("clearFilters");
const filterName = document.getElementById("filterName");
const filterBusinessType = document.getElementById("filterBusinessType");
const filterLocation = document.getElementById("filterLocation");
const filterPostcode = document.getElementById("filterPostcode");
const filterPhone = document.getElementById("filterPhone");
const salonResults = document.getElementById("salonResults");
const selectedBusiness = document.getElementById("selectedBusiness");
const frontDeskSearchStatus = document.getElementById("frontDeskSearchStatus");
const homeFrontdeskModal = document.getElementById("homeFrontdeskModal");
const homeFrontdeskModalBackdrop = document.getElementById("homeFrontdeskModalBackdrop");
const homeFrontdeskModalClose = document.getElementById("homeFrontdeskModalClose");

let businessCache = [];
let selectedBusinessId = "";

function handleLogoutQueryFlag() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("logout") !== "1") return;
  try {
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  } catch {}
  params.delete("logout");
  const nextUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
  window.history.replaceState({}, "", nextUrl);
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDisplayDate(value) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

function formatPriceGbp(value) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function setFrontDeskStatus(message, isError = false) {
  if (!frontDeskSearchStatus) return;
  frontDeskSearchStatus.textContent = String(message || "");
  frontDeskSearchStatus.style.color = isError ? "#b24d2f" : "var(--ink-soft)";
}

function getFilters() {
  return {
    name: String(filterName?.value || "").trim(),
    businessType: String(filterBusinessType?.value || "").trim(),
    location: String(filterLocation?.value || "").trim(),
    postcode: String(filterPostcode?.value || "").trim(),
    phone: String(filterPhone?.value || "").trim()
  };
}

function buildLexiBookingPrompt(business, extra = "") {
  const service = Array.isArray(business?.services) && business.services.length ? business.services[0].name : "a service";
  const slot = Array.isArray(business?.availableSlots) && business.availableSlots.length ? business.availableSlots[0] : "the next suitable slot";
  const base = `Help me book ${service} at ${business?.name || "this salon"} for ${slot}.`;
  return extra ? `${base} ${extra}`.trim() : base;
}

handleLogoutQueryFlag();
registerServiceWorker();

const homeLexiPopup = createSharedAskLexiPopup(
  buildPrimaryAskLexiPopupOptions({
    triggerButtons: [homeHeaderAskLexiBtn],
    source: "homepage",
    role: "public"
  })
);

function openHomeLexiPrompt(prompt = "", trigger = null) {
  homeLexiPopup.open("", trigger);
  homeLexiPopup.setInputValue(prompt);
}

function closeFrontdeskModal() {
  if (!(homeFrontdeskModal instanceof HTMLElement)) return;
  homeFrontdeskModal.hidden = true;
}

function openFrontdeskModal() {
  if (!(homeFrontdeskModal instanceof HTMLElement)) return;
  homeFrontdeskModal.hidden = false;
}

function renderBusinessResults(results) {
  if (!salonResults) return;
  salonResults.innerHTML = "";
  if (!results.length) {
    salonResults.innerHTML = '<div class="empty-state">No salons matched that search yet. Try a broader name or another area.</div>';
    return;
  }

  results.forEach((business) => {
    const card = document.createElement("article");
    card.className = "home-frontdesk-result";
    card.innerHTML = `
      <div class="home-frontdesk-result-top">
        <h3>${escapeHtml(business.name)}</h3>
        <span class="workspace-badge">${escapeHtml(String(business.type || "Salon").replaceAll("_", " "))}</span>
      </div>
      <div class="home-frontdesk-result-meta">
        <span>${escapeHtml(business.location?.city || "")}</span>
        <span>${escapeHtml(business.location?.postcode || "")}</span>
        <span>${escapeHtml(business.phone || "Phone hidden")}</span>
      </div>
      <p>${escapeHtml(business.description || business.websiteSummary || "Customer-facing salon information will appear in the preview.")}</p>
      <small>Services: ${escapeHtml((business.services || []).map((service) => service.name).slice(0, 3).join(", ") || "Service menu loading")}</small>
      <div class="home-frontdesk-result-actions">
        <button class="btn" type="button" data-frontdesk-open="${escapeHtml(business.id)}">Open front desk</button>
        <button class="btn btn-ghost" type="button" data-frontdesk-lexi="${escapeHtml(business.id)}">Ask Lexi to help book</button>
      </div>
    `;
    salonResults.appendChild(card);
  });
}

function renderBusinessDetails(business) {
  if (!selectedBusiness) return;
  const services = Array.isArray(business?.services) ? business.services : [];
  const slots = Array.isArray(business?.availableSlots) ? business.availableSlots : [];
  const image = business?.websiteImageUrl || "/3d-lexi.png";
  const socials = [
    business?.socialInstagram ? { label: "Instagram", href: business.socialInstagram } : null,
    business?.socialFacebook ? { label: "Facebook", href: business.socialFacebook } : null,
    business?.socialTiktok ? { label: "TikTok", href: business.socialTiktok } : null,
    business?.socialLinkedin ? { label: "LinkedIn", href: business.socialLinkedin } : null
  ].filter(Boolean);

  selectedBusiness.innerHTML = `
    <article class="home-frontdesk-preview-card">
      <div class="home-frontdesk-preview-hero">
        <div class="home-frontdesk-preview-visual">
          <img src="${escapeHtml(image)}" alt="${escapeHtml(business?.name || "Salon")} front desk preview" />
        </div>
        <div class="home-frontdesk-preview-copy">
          <div class="home-frontdesk-preview-header">
            <p class="kicker">Customer-facing front desk</p>
            <h3>${escapeHtml(business?.websiteTitle || business?.name || "Selected business")}</h3>
            <p>${escapeHtml(business?.websiteSummary || business?.description || "This profile gives customers a clearer feel for the salon before they book.")}</p>
          </div>
          <div class="home-frontdesk-preview-meta">
            <span>${escapeHtml(business?.location?.address || business?.location?.city || "Location coming through")}</span>
            <span>${escapeHtml(business?.phone || "Phone unavailable")}</span>
            <span>${escapeHtml(business?.email || "Email unavailable")}</span>
          </div>
          <div class="home-frontdesk-preview-links">
            ${
              business?.websiteUrl
                ? `<a href="${escapeHtml(business.websiteUrl)}" target="_blank" rel="noreferrer">Visit website</a>`
                : "<span>Website not linked yet</span>"
            }
            ${socials
              .map((social) => `<a href="${escapeHtml(social.href)}" target="_blank" rel="noreferrer">${escapeHtml(social.label)}</a>`)
              .join("")}
          </div>
          <div class="home-frontdesk-preview-actions">
            <button class="btn ask-lexi-btn" type="button" data-frontdesk-preview-lexi="${escapeHtml(business.id)}">Ask Lexi to book</button>
            <button class="btn btn-ghost" type="button" data-frontdesk-preview-lexi="${escapeHtml(business.id)}" data-frontdesk-followup="Help me choose the right service before I book.">Ask Lexi for service advice</button>
          </div>
        </div>
      </div>
      <section class="home-frontdesk-preview-services">
        <h4>Service menu</h4>
        <div class="home-frontdesk-service-list">
          ${
            services.length
              ? services
                  .slice(0, 8)
                  .map(
                    (service) => `
                      <div class="home-frontdesk-service-row">
                        <strong>${escapeHtml(service.name)}</strong>
                        <span>${escapeHtml(String(service.duration || 0))} mins · ${escapeHtml(formatPriceGbp(service.price || 0))}</span>
                      </div>
                    `
                  )
                  .join("")
              : '<div class="empty-state">Service menu not available yet.</div>'
          }
        </div>
      </section>
      <section class="home-frontdesk-preview-slots">
        <h4>Book with Lexi instead of calling</h4>
        <div class="home-frontdesk-slot-list">
          ${
            slots.length
              ? slots
                  .slice(0, 6)
                  .map(
                    (slot) => `
                      <div class="home-frontdesk-slot-row">
                        <strong>${escapeHtml(slot)}</strong>
                        <button class="btn btn-ghost btn-small" type="button" data-frontdesk-slot="${escapeHtml(slot)}" data-frontdesk-slot-business="${escapeHtml(business.id)}">Ask Lexi for this slot</button>
                      </div>
                    `
                  )
                  .join("")
              : '<div class="empty-state">Next available slots will appear here when this business has them ready.</div>'
          }
        </div>
      </section>
      <section class="home-frontdesk-preview-about">
        <h4>What this public front desk shows</h4>
        <p>Only customer-facing business information is shown here: business name, address, phone, website, service menu, images, socials, and live booking guidance. Private dashboard details stay hidden.</p>
      </section>
    </article>
  `;

  openFrontdeskModal();
}

async function loadBusinessDetail(businessId) {
  const response = await fetch(`/api/businesses/${encodeURIComponent(businessId)}`);
  const data = await response.json();
  if (!response.ok || !data?.business) {
    throw new Error(data?.error || "I could not load that salon front desk right now.");
  }
  selectedBusinessId = data.business.id;
  businessCache = businessCache.map((entry) => (entry.id === data.business.id ? data.business : entry));
  renderBusinessDetails(data.business);
  return data.business;
}

async function searchBusinesses(options = {}) {
  const filters = getFilters();
  const params = new URLSearchParams({
    ...filters,
    limit: String(options.limit || 10)
  });
  setFrontDeskStatus("Searching subscribed salons and beauty businesses...");
  const response = await fetch(`/api/search/businesses?${params.toString()}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || "I could not search businesses right now.");
  }
  const results = Array.isArray(data?.results) ? data.results : [];
  businessCache = results;
  renderBusinessResults(results);
  openFrontdeskModal();
  if (!results.length) {
    selectedBusinessId = "";
    if (selectedBusiness) {
      selectedBusiness.innerHTML = '<div class="empty-state">No public front desk matched that search yet.</div>';
    }
    setFrontDeskStatus("No businesses matched that search yet.");
    return;
  }
  setFrontDeskStatus(`Found ${results.length} business${results.length === 1 ? "" : "es"}. Open one to see its customer-facing front desk.`);
  if (options.autoOpenFirst !== false) {
    await loadBusinessDetail(results[0].id);
  }
}

searchForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await searchBusinesses({ autoOpenFirst: true });
  } catch (error) {
    renderBusinessResults([]);
    if (selectedBusiness) {
      selectedBusiness.innerHTML = `<div class="empty-state">${escapeHtml(error?.message || "I could not load the front desk search.")}</div>`;
    }
    setFrontDeskStatus(error?.message || "I could not load the front desk search.", true);
  }
});

clearFiltersBtn?.addEventListener("click", async () => {
  if (filterName) filterName.value = "";
  if (filterBusinessType) filterBusinessType.value = "";
  if (filterLocation) filterLocation.value = "";
  if (filterPostcode) filterPostcode.value = "";
  if (filterPhone) filterPhone.value = "";
  try {
    await searchBusinesses({ autoOpenFirst: true });
  } catch (error) {
    setFrontDeskStatus(error?.message || "I could not refresh the front desk search.", true);
  }
});

salonResults?.addEventListener("click", async (event) => {
  const target = event.target instanceof HTMLElement ? event.target : null;
  if (!target) return;
  const openId = String(target.getAttribute("data-frontdesk-open") || "").trim();
  const lexiId = String(target.getAttribute("data-frontdesk-lexi") || "").trim();
  const businessId = openId || lexiId;
  if (!businessId) return;
  const business = businessCache.find((entry) => entry.id === businessId) || null;
  if (!business) return;

  if (openId) {
    try {
      setFrontDeskStatus("Loading customer-facing front desk...");
      await loadBusinessDetail(businessId);
      setFrontDeskStatus("Front desk loaded.");
    } catch (error) {
      setFrontDeskStatus(error?.message || "I could not load that front desk.", true);
    }
    return;
  }

  openHomeLexiPrompt(buildLexiBookingPrompt(business), target);
});

selectedBusiness?.addEventListener("click", async (event) => {
  const target = event.target instanceof HTMLElement ? event.target : null;
  if (!target) return;

  const slot = String(target.getAttribute("data-frontdesk-slot") || "").trim();
  const slotBusinessId = String(target.getAttribute("data-frontdesk-slot-business") || "").trim();
  const promptBusinessId = String(target.getAttribute("data-frontdesk-preview-lexi") || "").trim();
  const followup = String(target.getAttribute("data-frontdesk-followup") || "").trim();
  const businessId = slotBusinessId || promptBusinessId;
  if (!businessId) return;

  let business = businessCache.find((entry) => entry.id === businessId) || null;
  if (!business || !business.availableSlots?.length) {
    try {
      business = await loadBusinessDetail(businessId);
    } catch (error) {
      setFrontDeskStatus(error?.message || "I could not open Lexi for that business.", true);
      return;
    }
  }

  const prompt = slot
    ? `Help me book ${business.services?.[0]?.name || "a service"} at ${business.name} for ${slot}.`
    : buildLexiBookingPrompt(business, followup);
  openHomeLexiPrompt(prompt, target);
});

homeFrontdeskModalClose?.addEventListener("click", closeFrontdeskModal);
homeFrontdeskModalBackdrop?.addEventListener("click", closeFrontdeskModal);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeFrontdeskModal();
});

searchBusinesses({ autoOpenFirst: false }).catch((error) => {
  renderBusinessResults([]);
  if (selectedBusiness) {
    selectedBusiness.innerHTML = `<div class="empty-state">${escapeHtml(error?.message || "I could not load the public front desk.")}</div>`;
  }
  setFrontDeskStatus(error?.message || "I could not load the public front desk.", true);
});
