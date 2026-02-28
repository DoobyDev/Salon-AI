const chatWindow = document.getElementById("chatWindow");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatClear = document.getElementById("chatClear");
const frontdeskSection = document.getElementById("frontdesk");
const frontdeskChatShell = frontdeskSection?.querySelector(".chat-shell") || null;
const salonMeta = document.getElementById("salonMeta");
const heroSalonMeta = document.getElementById("heroSalonMeta");
const bookingsList = document.getElementById("bookingsList");
const liveBookingSummary = document.getElementById("liveBookingSummary");
const heroLexiCalendarSummary = document.getElementById("heroLexiCalendarSummary");
const heroLexiAskBtn = document.getElementById("heroLexiAskBtn");
const heroLexiBookBtn = document.getElementById("heroLexiBookBtn");
const heroLexiCalendarFocus = document.getElementById("heroLexiCalendarFocus");
const heroLexiCalendarNote = document.getElementById("heroLexiCalendarNote");
const heroLexiBookingsCount = document.getElementById("heroLexiBookingsCount");
const heroLexiBookingsRevenue = document.getElementById("heroLexiBookingsRevenue");
const heroLexiSuggestedPrompt = document.getElementById("heroLexiSuggestedPrompt");
const heroLexiPromptHint = document.getElementById("heroLexiPromptHint");
const lexiPromptButtons = Array.from(document.querySelectorAll(".lexi-prompt-btn"));
const lexiBookingGuideNext = document.getElementById("lexiBookingGuideNext");
const lexiGuideStepService = document.getElementById("lexiGuideStepService");
const lexiGuideStepDate = document.getElementById("lexiGuideStepDate");
const lexiGuideStepTime = document.getElementById("lexiGuideStepTime");
const lexiGuideStepDetails = document.getElementById("lexiGuideStepDetails");
const lexiGuideStepConfirm = document.getElementById("lexiGuideStepConfirm");
const lexiGuideServiceValue = document.getElementById("lexiGuideServiceValue");
const lexiGuideDateValue = document.getElementById("lexiGuideDateValue");
const lexiGuideTimeValue = document.getElementById("lexiGuideTimeValue");
const lexiGuideDetailsValue = document.getElementById("lexiGuideDetailsValue");
const lexiGuideConfirmValue = document.getElementById("lexiGuideConfirmValue");

const searchForm = document.getElementById("searchForm");
const clearFiltersBtn = document.getElementById("clearFilters");
const salonResults = document.getElementById("salonResults");
const selectedBusiness = document.getElementById("selectedBusiness");
const bookingStepSearch = document.getElementById("bookingStepSearch");
const bookingStepChoose = document.getElementById("bookingStepChoose");
const bookingStepBook = document.getElementById("bookingStepBook");
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
const homeModuleGrid = document.getElementById("homeModuleGrid");
const homeTrialModal = document.getElementById("homeTrialModal");
const homeTrialModalClose = document.getElementById("homeTrialModalClose");
const homeTrialCancel = document.getElementById("homeTrialCancel");
const homeTrialForm = document.getElementById("homeTrialForm");
const homeTrialSubmit = document.getElementById("homeTrialSubmit");
const homeTrialMsg = document.getElementById("homeTrialMsg");
const homeTrialRegisterName = document.getElementById("homeTrialRegisterName");
const homeTrialRegisterEmail = document.getElementById("homeTrialRegisterEmail");
const homeTrialRegisterPassword = document.getElementById("homeTrialRegisterPassword");
const homeTrialBusinessType = document.getElementById("homeTrialBusinessType");
const homeTrialBusinessName = document.getElementById("homeTrialBusinessName");
const homeTrialBusinessCity = document.getElementById("homeTrialBusinessCity");
const homeTrialBusinessCountry = document.getElementById("homeTrialBusinessCountry");
const homeTrialBusinessPostcode = document.getElementById("homeTrialBusinessPostcode");
const homeTrialBusinessPhone = document.getElementById("homeTrialBusinessPhone");
const homeTrialBusinessWebsite = document.getElementById("homeTrialBusinessWebsite");
const homeTrialTeamSize = document.getElementById("homeTrialTeamSize");
const homeTrialPrimaryGoal = document.getElementById("homeTrialPrimaryGoal");
const homeTrialSetupNotes = document.getElementById("homeTrialSetupNotes");
const homeTrialPaymentConsent = document.getElementById("homeTrialPaymentConsent");
const homeTrialTemplatePreview = document.getElementById("homeTrialTemplatePreview");
const homeTrialTriggers = Array.from(document.querySelectorAll("[data-open-trial-modal]"));
const homeLoginModal = document.getElementById("homeLoginModal");
const homeLoginModalClose = document.getElementById("homeLoginModalClose");
const homeLoginTriggers = Array.from(document.querySelectorAll("[data-open-login-modal]"));
const homeLoginRoleTriggers = Array.from(document.querySelectorAll("[data-login-role]"));
const homeSubscriberSigninModal = document.getElementById("homeSubscriberSigninModal");
const homeSubscriberSigninClose = document.getElementById("homeSubscriberSigninClose");
const homeSubscriberSigninForm = document.getElementById("homeSubscriberSigninForm");
const homeSubscriberSigninEmail = document.getElementById("homeSubscriberSigninEmail");
const homeSubscriberSigninPassword = document.getElementById("homeSubscriberSigninPassword");
const homeSubscriberSigninSubmit = document.getElementById("homeSubscriberSigninSubmit");
const homeSubscriberSigninMsg = document.getElementById("homeSubscriberSigninMsg");
const homeSubscriberModeSignin = document.getElementById("homeSubscriberModeSignin");
const homeSubscriberModeAdmin = document.getElementById("homeSubscriberModeAdmin");
const homeSubscriberSigninPanel = document.getElementById("homeSubscriberSigninPanel");
const homeAdminSigninPanel = document.getElementById("homeAdminSigninPanel");
const homeSubscriberModeSwitchers = Array.from(document.querySelectorAll("[data-home-subscriber-mode]"));
const homeSubscriberSigninTriggers = Array.from(document.querySelectorAll("[data-open-subscriber-signin-modal]"));
const homeAdminSigninModal = document.getElementById("homeAdminSigninModal");
const homeAdminSigninClose = document.getElementById("homeAdminSigninClose");
const homeAdminSigninForm = document.getElementById("homeAdminSigninForm");
const homeAdminSigninEmail = document.getElementById("homeAdminSigninEmail");
const homeAdminSigninPassword = document.getElementById("homeAdminSigninPassword");
const homeAdminSigninSubmit = document.getElementById("homeAdminSigninSubmit");
const homeAdminSigninMsg = document.getElementById("homeAdminSigninMsg");
const homeAdminSigninTriggers = Array.from(document.querySelectorAll("[data-open-admin-signin-modal]"));
const homeCustomerAccessModal = document.getElementById("homeCustomerAccessModal");
const homeCustomerAccessClose = document.getElementById("homeCustomerAccessClose");
const homeCustomerAccessTriggers = Array.from(document.querySelectorAll("[data-open-customer-access-modal]"));
const homeCustomerModeSignIn = document.getElementById("homeCustomerModeSignIn");
const homeCustomerModeSignUp = document.getElementById("homeCustomerModeSignUp");
const homeCustomerSigninPanel = document.getElementById("homeCustomerSigninPanel");
const homeCustomerSignupPanel = document.getElementById("homeCustomerSignupPanel");
const homeCustomerSigninForm = document.getElementById("homeCustomerSigninForm");
const homeCustomerSigninEmail = document.getElementById("homeCustomerSigninEmail");
const homeCustomerSigninPassword = document.getElementById("homeCustomerSigninPassword");
const homeCustomerSigninSubmit = document.getElementById("homeCustomerSigninSubmit");
const homeCustomerSigninMsg = document.getElementById("homeCustomerSigninMsg");
const homeCustomerSignupForm = document.getElementById("homeCustomerSignupForm");
const homeCustomerSignupName = document.getElementById("homeCustomerSignupName");
const homeCustomerSignupEmail = document.getElementById("homeCustomerSignupEmail");
const homeCustomerSignupPassword = document.getElementById("homeCustomerSignupPassword");
const homeCustomerSignupPhone = document.getElementById("homeCustomerSignupPhone");
const homeCustomerSignupCity = document.getElementById("homeCustomerSignupCity");
const homeCustomerSignupService = document.getElementById("homeCustomerSignupService");
const homeCustomerSignupNotes = document.getElementById("homeCustomerSignupNotes");
const homeCustomerPaymentConsent = document.getElementById("homeCustomerPaymentConsent");
const homeCustomerSignupTerms = document.getElementById("homeCustomerSignupTerms");
const homeCustomerSignupUpdates = document.getElementById("homeCustomerSignupUpdates");
const homeCustomerSignupSubmit = document.getElementById("homeCustomerSignupSubmit");
const homeCustomerSignupMsg = document.getElementById("homeCustomerSignupMsg");
const homeCustomerModeSwitchers = Array.from(document.querySelectorAll("[data-home-customer-mode]"));

const history = [];
let llmEnabled = false;
let businessCache = [];
let selectedBusinessId = "";
let metricsAnimated = false;
let homeDemoTimeframe = "today";
let homeDemoQuickFilter = "";
let homeDemoCustomRange = null;
let homeDemoLiveTick = 0;
let latestPublicDemoBookings = [];
let homeLexiPopupOpen = false;
let homeLexiPopupOverlay = null;
let homeLexiPopupContainer = null;
let homeLexiChatPlaceholder = null;
let homeLexiPopupLastFocus = null;
let lexiBookingGuideState = createLexiBookingGuideState();
const homeDemoDisplayValues = {
  revenue: 0,
  cancels: 0,
  targetPct: 0
};

const CHATBOT_WELCOME_MESSAGE = "Hi I'm Lexi, how can I help you today?";
const AUTH_TOKEN_KEY = "salon_ai_token";
const AUTH_USER_KEY = "salon_ai_user";
const DEFAULT_LEXI_PROMPTS = [
  {
    label: "Book this week",
    prompt: "I want to book an appointment this week."
  },
  {
    label: "Choose a service",
    prompt: "What service would you recommend for me?"
  },
  {
    label: "Check times",
    prompt: "Can you check available times for me?"
  }
];
const GENERIC_SERVICE_KEYWORDS = [
  "haircut",
  "cut and finish",
  "blow dry",
  "blowout",
  "balayage",
  "highlights",
  "ombre",
  "colour correction",
  "color correction",
  "colour",
  "color",
  "skin fade",
  "fade",
  "beard trim",
  "beard treatment",
  "brow wax",
  "brow tint",
  "lashes",
  "facial",
  "waxing",
  "extensions",
  "keratin",
  "smoothing treatment",
  "bridal styling",
  "manicure",
  "pedicure"
];

const HOME_TRIAL_TEMPLATES = {
  hair_salon: {
    label: "Hair Salon",
    services: ["Haircut", "Blowout", "Color Refresh"],
    hours: "Mon-Wed 9:00-18:00, Thu-Fri 9:00-20:00, Sat 9:00-17:00"
  },
  barbershop: {
    label: "Barbershop",
    services: ["Skin Fade", "Classic Cut", "Beard Trim"],
    hours: "Mon-Wed 9:00-19:00, Thu-Fri 9:00-20:00, Sat 10:00-18:00"
  },
  beauty_salon: {
    label: "Beauty Salon",
    services: ["Signature Facial", "Brow Shaping", "Gel Manicure"],
    hours: "Mon-Wed 10:00-18:00, Thu-Fri 10:00-19:00, Sat 9:00-17:00"
  }
};

const HOME_MODULE_DETAILS = {
  business_information: {
    title: "Business Information",
    badge: "Start here",
    summary: "This is the main place for salon details. It gives you one popup area to review and update the information Lexi, customers, and the dashboard rely on every day.",
    bullets: [
      "Edit business name, contact details, and opening hours",
      "Keep customer-facing salon information correct",
      "Support cleaner booking and front desk communication"
    ]
  },
  staff_setup: {
    title: "Staff Setup",
    badge: "Use daily",
    summary: "This popup is for staff setup and rota control. It gives salon owners a quick way to manage availability, adjust team cover, and edit the rota when the day changes.",
    bullets: [
      "Edit staff rota and shift coverage",
      "Keep availability clear for booking capacity",
      "Reduce scheduling confusion during busy periods"
    ]
  },
  salon_features: {
    title: "Salon Features",
    badge: "Setup",
    summary: "This area is for the services and features your salon offers. It lets the business control what the salon can do and what should be visible through Lexi and the wider app.",
    bullets: [
      "Set the services and salon capabilities you offer",
      "Keep Lexi aligned with real salon options",
      "Avoid showing features the salon does not use"
    ]
  },
  social_media: {
    title: "Social Media",
    badge: "Marketing",
    summary: "This popup helps the salon manage linked social accounts. It keeps your business profile connected so customers can find the salon, and the team can keep sharing in one place.",
    bullets: [
      "Link salon social media accounts",
      "Keep brand and contact channels consistent",
      "Support sharing and discovery from one place"
    ]
  },
  accounting: {
    title: "Accounting",
    badge: "Admin",
    summary: "This area is for sending salon revenue information to an accountant or linking accounting systems. It keeps the salon's numbers easier to share and reconcile.",
    bullets: [
      "Send revenue information to your accountant",
      "Link accounting accounts where needed",
      "Support cleaner export and reporting workflows"
    ]
  },
  finance: {
    title: "Finance",
    badge: "Key view",
    summary: "This popup should give salon owners an easy view of revenue without digging through complex screens. It is focused on clear day, week, month, and year totals.",
    bullets: [
      "Show daily salon revenue clearly",
      "Show weekly, monthly, and yearly revenue in one view",
      "Keep financial performance simple to understand"
    ]
  },
  cancellations: {
    title: "Cancellations",
    badge: "Control",
    summary: "This area gives the subscriber direct control over the salon cancellation fee and related cancellation settings. It keeps the policy simple to review and adjust.",
    bullets: [
      "Let subscribers control the cancellation fee",
      "Keep the salon policy easy to update",
      "Reduce confusion around charges and missed bookings"
    ]
  }
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function saveSessionAuth(token, user) {
  sessionStorage.setItem(AUTH_TOKEN_KEY, token);
  sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

function setHomeTrialMessage(text, state = "") {
  if (!homeTrialMsg) return;
  homeTrialMsg.textContent = String(text || "");
  homeTrialMsg.classList.remove("error", "success");
  if (state) homeTrialMsg.classList.add(state);
}

function renderHomeTrialTemplatePreview() {
  if (!homeTrialTemplatePreview) return;
  const key = String(homeTrialBusinessType?.value || "hair_salon").trim().toLowerCase();
  const template = HOME_TRIAL_TEMPLATES[key] || HOME_TRIAL_TEMPLATES.hair_salon;
  homeTrialTemplatePreview.innerHTML = `
    <strong>Starter Template: ${escapeHtml(template.label)}</strong>
    <small><strong>Default services:</strong> ${escapeHtml(template.services.join(", "))}</small>
    <small><strong>Default hours:</strong> ${escapeHtml(template.hours)}, Sun Closed</small>
  `;
}

let lastHomeTrialTrigger = null;
let lastHomeLoginTrigger = null;
let lastHomeSubscriberSigninTrigger = null;
let lastHomeAdminSigninTrigger = null;
let lastHomeCustomerAccessTrigger = null;
let homeSubscriberAccessMode = "subscriber";
let homeCustomerAccessMode = "signin";
function openHomeTrialModal(trigger = null) {
  if (!homeTrialModal) return;
  if (homeLoginModal?.classList.contains("is-open")) closeHomeLoginModal();
  if (homeSubscriberSigninModal?.classList.contains("is-open")) closeHomeSubscriberSigninModal();
  if (homeAdminSigninModal?.classList.contains("is-open")) closeHomeAdminSigninModal();
  if (homeCustomerAccessModal?.classList.contains("is-open")) closeHomeCustomerAccessModal();
  if (trigger instanceof HTMLElement) lastHomeTrialTrigger = trigger;
  homeTrialModal.classList.add("is-open");
  homeTrialModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  renderHomeTrialTemplatePreview();
  setHomeTrialMessage("", "");
  window.requestAnimationFrame(() => homeTrialRegisterName?.focus());
}

function closeHomeTrialModal() {
  if (!homeTrialModal) return;
  homeTrialModal.classList.remove("is-open");
  homeTrialModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  if (lastHomeTrialTrigger instanceof HTMLElement) lastHomeTrialTrigger.focus();
}

function openHomeLoginModal(trigger = null) {
  if (!homeLoginModal) return;
  if (homeTrialModal?.classList.contains("is-open")) closeHomeTrialModal();
  if (homeSubscriberSigninModal?.classList.contains("is-open")) closeHomeSubscriberSigninModal();
  if (homeAdminSigninModal?.classList.contains("is-open")) closeHomeAdminSigninModal();
  if (homeCustomerAccessModal?.classList.contains("is-open")) closeHomeCustomerAccessModal();
  if (trigger instanceof HTMLElement) lastHomeLoginTrigger = trigger;
  homeLoginModal.classList.add("is-open");
  homeLoginModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  window.requestAnimationFrame(() => homeLoginRoleTriggers[0]?.focus());
}

function closeHomeLoginModal() {
  if (!homeLoginModal) return;
  homeLoginModal.classList.remove("is-open");
  homeLoginModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  if (lastHomeLoginTrigger instanceof HTMLElement) lastHomeLoginTrigger.focus();
}

function setHomeSubscriberSigninMessage(text, state = "") {
  if (!homeSubscriberSigninMsg) return;
  homeSubscriberSigninMsg.textContent = String(text || "");
  homeSubscriberSigninMsg.classList.remove("error", "success");
  if (state) homeSubscriberSigninMsg.classList.add(state);
}

function setHomeSubscriberAccessMode(mode) {
  const nextMode = mode === "admin" ? "admin" : "subscriber";
  homeSubscriberAccessMode = nextMode;
  homeSubscriberModeSignin?.classList.toggle("is-active", nextMode === "subscriber");
  homeSubscriberModeAdmin?.classList.toggle("is-active", nextMode === "admin");
  homeSubscriberModeSignin?.setAttribute("aria-selected", nextMode === "subscriber" ? "true" : "false");
  homeSubscriberModeAdmin?.setAttribute("aria-selected", nextMode === "admin" ? "true" : "false");
  if (homeSubscriberSigninPanel) {
    homeSubscriberSigninPanel.classList.toggle("is-active", nextMode === "subscriber");
    homeSubscriberSigninPanel.hidden = nextMode !== "subscriber";
  }
  if (homeAdminSigninPanel) {
    homeAdminSigninPanel.classList.toggle("is-active", nextMode === "admin");
    homeAdminSigninPanel.hidden = nextMode !== "admin";
  }
}

function openHomeSubscriberSigninModal(trigger = null, mode = "subscriber") {
  if (!homeSubscriberSigninModal) return;
  if (homeTrialModal?.classList.contains("is-open")) closeHomeTrialModal();
  if (homeLoginModal?.classList.contains("is-open")) closeHomeLoginModal();
  if (homeAdminSigninModal?.classList.contains("is-open")) closeHomeAdminSigninModal();
  if (homeCustomerAccessModal?.classList.contains("is-open")) closeHomeCustomerAccessModal();
  if (trigger instanceof HTMLElement) lastHomeSubscriberSigninTrigger = trigger;
  homeSubscriberSigninModal.classList.add("is-open");
  homeSubscriberSigninModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  setHomeSubscriberSigninMessage("");
  setHomeAdminSigninMessage("");
  setHomeSubscriberAccessMode(mode);
  window.requestAnimationFrame(() => {
    if (homeSubscriberAccessMode === "admin") {
      homeAdminSigninEmail?.focus();
      return;
    }
    homeSubscriberSigninEmail?.focus();
  });
}

function closeHomeSubscriberSigninModal() {
  if (!homeSubscriberSigninModal) return;
  homeSubscriberSigninModal.classList.remove("is-open");
  homeSubscriberSigninModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  if (lastHomeSubscriberSigninTrigger instanceof HTMLElement) lastHomeSubscriberSigninTrigger.focus();
}

function setHomeAdminSigninMessage(text, state = "") {
  if (!homeAdminSigninMsg) return;
  homeAdminSigninMsg.textContent = String(text || "");
  homeAdminSigninMsg.classList.remove("error", "success");
  if (state) homeAdminSigninMsg.classList.add(state);
}

function openHomeAdminSigninModal(trigger = null) {
  if (!homeAdminSigninModal && homeSubscriberSigninModal) {
    if (trigger instanceof HTMLElement) lastHomeAdminSigninTrigger = trigger;
    openHomeSubscriberSigninModal(trigger, "admin");
    return;
  }
  if (!homeAdminSigninModal) return;
  if (homeTrialModal?.classList.contains("is-open")) closeHomeTrialModal();
  if (homeLoginModal?.classList.contains("is-open")) closeHomeLoginModal();
  if (homeSubscriberSigninModal?.classList.contains("is-open")) closeHomeSubscriberSigninModal();
  if (homeCustomerAccessModal?.classList.contains("is-open")) closeHomeCustomerAccessModal();
  if (trigger instanceof HTMLElement) lastHomeAdminSigninTrigger = trigger;
  homeAdminSigninModal.classList.add("is-open");
  homeAdminSigninModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  setHomeAdminSigninMessage("");
  window.requestAnimationFrame(() => homeAdminSigninEmail?.focus());
}

function closeHomeAdminSigninModal() {
  if (!homeAdminSigninModal) return;
  homeAdminSigninModal.classList.remove("is-open");
  homeAdminSigninModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  if (lastHomeAdminSigninTrigger instanceof HTMLElement) lastHomeAdminSigninTrigger.focus();
}

function openHomeCustomerAccessModal(trigger = null) {
  if (!homeCustomerAccessModal) return;
  if (homeTrialModal?.classList.contains("is-open")) closeHomeTrialModal();
  if (homeLoginModal?.classList.contains("is-open")) closeHomeLoginModal();
  if (homeSubscriberSigninModal?.classList.contains("is-open")) closeHomeSubscriberSigninModal();
  if (homeAdminSigninModal?.classList.contains("is-open")) closeHomeAdminSigninModal();
  if (trigger instanceof HTMLElement) lastHomeCustomerAccessTrigger = trigger;
  homeCustomerAccessModal.classList.add("is-open");
  homeCustomerAccessModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  setHomeCustomerAccessMode(homeCustomerAccessMode || "signin");
  window.requestAnimationFrame(() => {
    if (homeCustomerAccessMode === "signup") {
      homeCustomerSignupName?.focus();
      return;
    }
    homeCustomerSigninEmail?.focus();
  });
}

function closeHomeCustomerAccessModal() {
  if (!homeCustomerAccessModal) return;
  homeCustomerAccessModal.classList.remove("is-open");
  homeCustomerAccessModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  if (lastHomeCustomerAccessTrigger instanceof HTMLElement) lastHomeCustomerAccessTrigger.focus();
}

function setHomeCustomerSigninMessage(text, state = "") {
  if (!homeCustomerSigninMsg) return;
  homeCustomerSigninMsg.textContent = String(text || "");
  homeCustomerSigninMsg.classList.remove("error", "success");
  if (state) homeCustomerSigninMsg.classList.add(state);
}

function setHomeCustomerSignupMessage(text, state = "") {
  if (!homeCustomerSignupMsg) return;
  homeCustomerSignupMsg.textContent = String(text || "");
  homeCustomerSignupMsg.classList.remove("error", "success");
  if (state) homeCustomerSignupMsg.classList.add(state);
}

function setHomeCustomerAccessMode(mode) {
  const nextMode = mode === "signup" ? "signup" : "signin";
  homeCustomerAccessMode = nextMode;
  homeCustomerModeSignIn?.classList.toggle("is-active", nextMode === "signin");
  homeCustomerModeSignUp?.classList.toggle("is-active", nextMode === "signup");
  homeCustomerModeSignIn?.setAttribute("aria-selected", nextMode === "signin" ? "true" : "false");
  homeCustomerModeSignUp?.setAttribute("aria-selected", nextMode === "signup" ? "true" : "false");
  if (homeCustomerSigninPanel) {
    homeCustomerSigninPanel.classList.toggle("is-active", nextMode === "signin");
    homeCustomerSigninPanel.hidden = nextMode !== "signin";
  }
  if (homeCustomerSignupPanel) {
    homeCustomerSignupPanel.classList.toggle("is-active", nextMode === "signup");
    homeCustomerSignupPanel.hidden = nextMode !== "signup";
  }
}

function ensureHomeModuleOverlay() {
  let overlay = document.getElementById("homeModuleOverlay");
  if (overlay) return overlay;
  overlay = document.createElement("div");
  overlay.id = "homeModuleOverlay";
  overlay.className = "home-module-overlay";
  document.body.appendChild(overlay);
  return overlay;
}

function openHomeModuleModal(moduleKey) {
  const detail = HOME_MODULE_DETAILS[String(moduleKey || "").trim()];
  if (!detail) return;
  const overlay = ensureHomeModuleOverlay();
  overlay.innerHTML = `
    <section class="home-module-modal" role="dialog" aria-modal="true" aria-labelledby="homeModuleModalTitle">
      <div class="home-module-modal-head">
        <div>
          <h3 id="homeModuleModalTitle">${escapeHtml(detail.title)}</h3>
          <div class="home-module-modal-meta">
            <span class="home-module-chip">${escapeHtml(detail.badge)}</span>
            <span class="home-module-chip soft">Homepage quick view</span>
          </div>
        </div>
        <button type="button" class="home-module-close" aria-label="Close">x</button>
      </div>
      <section class="home-module-pane">
        <h4>What this helps with</h4>
        <p>${escapeHtml(detail.summary)}</p>
      </section>
      <section class="home-module-pane">
        <h4>What you can do here</h4>
        <ul class="home-module-feature-list">${detail.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </section>
      <div class="home-module-modal-actions">
        <small class="home-module-modal-hint">Press Esc or click outside to close.</small>
        <button type="button" class="btn btn-ghost home-module-dismiss">Close</button>
        <a class="btn" href="#dashboards">View Dashboard Demo</a>
      </div>
    </section>
  `;
  overlay.classList.add("is-open");

  const close = () => {
    overlay.classList.remove("is-open");
    overlay.innerHTML = "";
    document.removeEventListener("keydown", onKeyDown);
  };
  const onKeyDown = (event) => {
    if (event.key === "Escape") close();
  };
  document.addEventListener("keydown", onKeyDown);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  }, { once: true });
  overlay.querySelector(".home-module-close")?.addEventListener("click", close);
  overlay.querySelector(".home-module-dismiss")?.addEventListener("click", close);
}

function appendMessage(role, content) {
  const el = document.createElement("div");
  el.className = `msg ${role}`;
  el.textContent = content;
  chatWindow.appendChild(el);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function createLexiBookingGuideState() {
  return {
    businessId: "",
    businessName: "",
    service: "",
    date: "",
    time: "",
    name: "",
    phone: "",
    email: "",
    confirmed: false
  };
}

function cleanLexiValue(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function getSelectedBusinessRecord() {
  return businessCache.find((business) => business.id === selectedBusinessId) || null;
}

function isLexiDetailsComplete() {
  return Boolean(lexiBookingGuideState.name && (lexiBookingGuideState.phone || lexiBookingGuideState.email));
}

function getLexiGuideCurrentStep() {
  if (!selectedBusinessId || !lexiBookingGuideState.service) return "service";
  if (!lexiBookingGuideState.date) return "date";
  if (!lexiBookingGuideState.time) return "time";
  if (!isLexiDetailsComplete()) return "details";
  if (!lexiBookingGuideState.confirmed) return "confirm";
  return "complete";
}

function setLexiPromptButton(button, label, prompt) {
  if (!(button instanceof HTMLElement)) return;
  button.textContent = label;
  button.setAttribute("data-lexi-prompt", prompt);
}

function renderLexiPromptButtons() {
  const currentBusiness = getSelectedBusinessRecord();
  const slots = Array.isArray(currentBusiness?.availableSlots) ? currentBusiness.availableSlots : [];
  const topServices = Array.isArray(currentBusiness?.services) ? currentBusiness.services.slice(0, 3) : [];
  const step = getLexiGuideCurrentStep();
  let prompts = DEFAULT_LEXI_PROMPTS;

  if (selectedBusinessId && step === "service" && topServices.length) {
    prompts = topServices.map((service) => ({
      label: service.name,
      prompt: `I want to book ${service.name}.`
    }));
  } else if (selectedBusinessId && (step === "date" || step === "time") && slots.length) {
    prompts = slots.slice(0, 3).map((slot) => ({
      label: slot,
      prompt: `Book ${lexiBookingGuideState.service || "an appointment"} on ${slot}.`
    }));
  } else if (selectedBusinessId && step === "details") {
    prompts = [
      { label: "Share name", prompt: "My name is " },
      { label: "Share phone", prompt: "My phone number is " },
      { label: "Share email", prompt: "My email is " }
    ];
  } else if (selectedBusinessId && step === "confirm") {
    prompts = [
      { label: "Confirm booking", prompt: "Please confirm this booking." },
      { label: "Repeat details", prompt: "Please repeat my booking details." },
      { label: "Add recommendation", prompt: "Do you recommend an add-on for this booking?" }
    ];
  } else if (selectedBusinessId && step === "complete") {
    prompts = [
      { label: "Book again", prompt: "I want to make another booking." },
      { label: "Aftercare advice", prompt: "Can you give me aftercare advice for my appointment?" },
      { label: "Change booking", prompt: "I need to change my booking." }
    ];
  }

  lexiPromptButtons.forEach((button, index) => {
    const nextPrompt = prompts[index] || DEFAULT_LEXI_PROMPTS[index] || DEFAULT_LEXI_PROMPTS[0];
    setLexiPromptButton(button, nextPrompt.label, nextPrompt.prompt);
  });
}

function renderLexiBookingGuide() {
  const currentBusiness = getSelectedBusinessRecord();
  const nextStep = getLexiGuideCurrentStep();
  const selectedLabel = lexiBookingGuideState.businessName || currentBusiness?.name || "this business";
  const detailsBits = [
    lexiBookingGuideState.name ? `Name: ${lexiBookingGuideState.name}` : "",
    lexiBookingGuideState.phone ? `Phone: ${lexiBookingGuideState.phone}` : "",
    lexiBookingGuideState.email ? `Email: ${lexiBookingGuideState.email}` : ""
  ].filter(Boolean);

  if (lexiGuideServiceValue) {
    lexiGuideServiceValue.textContent = lexiBookingGuideState.service || (selectedBusinessId ? `Choose a service at ${selectedLabel}` : "Choose a business first");
  }
  if (lexiGuideDateValue) {
    lexiGuideDateValue.textContent = lexiBookingGuideState.date || "Waiting for date";
  }
  if (lexiGuideTimeValue) {
    lexiGuideTimeValue.textContent = lexiBookingGuideState.time || "Waiting for time";
  }
  if (lexiGuideDetailsValue) {
    lexiGuideDetailsValue.textContent = detailsBits.join(" | ") || "Need name and contact";
  }
  if (lexiGuideConfirmValue) {
    lexiGuideConfirmValue.textContent = lexiBookingGuideState.confirmed
      ? `Confirmed with ${selectedLabel}`
      : isLexiDetailsComplete()
        ? "Ready for Lexi to confirm"
        : "Ready when Lexi has everything";
  }
  if (lexiBookingGuideNext) {
    if (!selectedBusinessId) {
      lexiBookingGuideNext.textContent = "Choose a business below, then Lexi can complete the booking.";
    } else if (nextStep === "service") {
      lexiBookingGuideNext.textContent = `Next: choose the service you want at ${selectedLabel}.`;
    } else if (nextStep === "date") {
      lexiBookingGuideNext.textContent = "Next: tell Lexi the day that works for you.";
    } else if (nextStep === "time") {
      lexiBookingGuideNext.textContent = "Next: choose the time that fits your day.";
    } else if (nextStep === "details") {
      lexiBookingGuideNext.textContent = "Next: share your name and contact details.";
    } else if (nextStep === "confirm") {
      lexiBookingGuideNext.textContent = "Next: ask Lexi to confirm the appointment.";
    } else {
      lexiBookingGuideNext.textContent = "Booking confirmed. Lexi can help with changes, aftercare, or another visit.";
    }
  }

  const steps = [
    { key: "service", node: lexiGuideStepService, complete: Boolean(selectedBusinessId && lexiBookingGuideState.service) },
    { key: "date", node: lexiGuideStepDate, complete: Boolean(lexiBookingGuideState.date) },
    { key: "time", node: lexiGuideStepTime, complete: Boolean(lexiBookingGuideState.time) },
    { key: "details", node: lexiGuideStepDetails, complete: isLexiDetailsComplete() },
    { key: "confirm", node: lexiGuideStepConfirm, complete: Boolean(lexiBookingGuideState.confirmed) }
  ];

  steps.forEach(({ key, node, complete }) => {
    if (!(node instanceof HTMLElement)) return;
    node.classList.toggle("is-complete", complete);
    node.classList.toggle("is-active", !complete && nextStep === key);
  });

  renderLexiPromptButtons();
}

function resetLexiBookingGuide(business = null) {
  lexiBookingGuideState = createLexiBookingGuideState();
  if (business) {
    lexiBookingGuideState.businessId = String(business.id || "");
    lexiBookingGuideState.businessName = cleanLexiValue(business.name);
  }
  renderLexiBookingGuide();
}

function parseLexiBookingText(text, business = getSelectedBusinessRecord()) {
  const source = cleanLexiValue(text);
  const lower = source.toLowerCase();
  const parsed = {
    service: "",
    date: "",
    time: "",
    name: "",
    phone: "",
    email: ""
  };

  const serviceNames = Array.isArray(business?.services)
    ? business.services.map((service) => cleanLexiValue(service.name)).filter(Boolean)
    : [];
  parsed.service = serviceNames.find((serviceName) => lower.includes(serviceName.toLowerCase())) || "";
  if (!parsed.service) {
    parsed.service = GENERIC_SERVICE_KEYWORDS.find((serviceName) => lower.includes(serviceName)) || "";
  }

  const dateMatchers = [
    /\b(today|tomorrow|this week|next week|this weekend|next weekend)\b/i,
    /\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
    /\b\d{1,2}[\/-]\d{1,2}(?:[\/-]\d{2,4})?\b/i,
    /\b(?:jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\s+\d{1,2}(?:st|nd|rd|th)?\b/i
  ];
  for (const matcher of dateMatchers) {
    const match = source.match(matcher);
    if (match) {
      parsed.date = cleanLexiValue(match[0]);
      break;
    }
  }

  const timeMatch = source.match(/\b\d{1,2}(?::\d{2})?\s?(?:am|pm)\b/i) || source.match(/\b(?:morning|afternoon|evening)\b/i);
  if (timeMatch) parsed.time = cleanLexiValue(timeMatch[0]);

  const nameMatch = source.match(/\b(?:my name is|name is|i am|i'm)\s+([a-z][a-z' -]{1,40})/i);
  if (nameMatch) {
    parsed.name = cleanLexiValue(nameMatch[1]).replace(/\b(on|for|at|tomorrow|today)\b.*$/i, "").trim();
  }

  const emailMatch = source.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);
  if (emailMatch) parsed.email = cleanLexiValue(emailMatch[0]).toLowerCase();

  const phoneMatch = source.match(/(?:\+?\d[\d\s\-()]{7,}\d)/);
  if (phoneMatch) parsed.phone = cleanLexiValue(phoneMatch[0]);

  return parsed;
}

function syncLexiBookingGuideFromMessage(text, options = {}) {
  const parsed = parseLexiBookingText(text);
  if (parsed.service) lexiBookingGuideState.service = parsed.service;
  if (parsed.date) lexiBookingGuideState.date = parsed.date;
  if (parsed.time) lexiBookingGuideState.time = parsed.time;
  if (parsed.name) lexiBookingGuideState.name = parsed.name;
  if (parsed.phone) lexiBookingGuideState.phone = parsed.phone;
  if (parsed.email) lexiBookingGuideState.email = parsed.email;
  if (options.bookingCreated) lexiBookingGuideState.confirmed = true;
  renderLexiBookingGuide();
}

function setLexiGuideBusiness(business, options = {}) {
  if (!business) {
    resetLexiBookingGuide();
    return;
  }
  const nextBusinessId = String(business.id || "");
  if (lexiBookingGuideState.businessId !== nextBusinessId) {
    resetLexiBookingGuide(business);
  }
  lexiBookingGuideState.businessId = nextBusinessId;
  lexiBookingGuideState.businessName = cleanLexiValue(business.name);
  if (options.prefillService && !lexiBookingGuideState.service) {
    lexiBookingGuideState.service = cleanLexiValue(options.prefillService);
  }
  if (options.prefillSlot) {
    const parsedSlot = parseLexiBookingText(String(options.prefillSlot), business);
    if (parsedSlot.date && !lexiBookingGuideState.date) lexiBookingGuideState.date = parsedSlot.date;
    if (parsedSlot.time && !lexiBookingGuideState.time) lexiBookingGuideState.time = parsedSlot.time;
  }
  renderLexiBookingGuide();
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
  if (!Number.isFinite(num)) return "GBP 0";
  return `GBP ${Math.round(num).toLocaleString("en-GB")}`;
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

function formatDisplayDate(value) {
  if (!value) return "";
  const parsed = new Date(`${String(value).trim()}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    const fallback = new Date(String(value));
    if (Number.isNaN(fallback.getTime())) return String(value);
    return fallback.toLocaleDateString("en-GB");
  }
  return parsed.toLocaleDateString("en-GB");
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
    ? `${formatDisplayDate(homeDemoCustomRange.from)} to ${formatDisplayDate(homeDemoCustomRange.to)}`
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
    const hasCurrency = counter.textContent.includes("$") || counter.textContent.includes("£");
    const duration = 1200;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      const value = Math.round(target * eased);

      if (hasCurrency) {
        counter.textContent = `£${value.toLocaleString("en-GB")}`;
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
  latestPublicDemoBookings = Array.isArray(bookings) ? bookings.slice() : [];
  bookingsList.innerHTML = "";
  if (!bookings.length) {
    const item = document.createElement("li");
    item.className = "booking-item";
    item.textContent = "No live bookings yet. Your first booking will appear here.";
    bookingsList.appendChild(item);
    renderHeroLexiCalendarStar();
    return;
  }

  bookings.forEach((b) => {
    const item = document.createElement("li");
    item.className = "booking-item";
    item.textContent = `${b.customerName || b.guest_name}: ${b.service} on ${formatDisplayDate(b.date)} at ${b.time} (${b.businessName || b.stylist || "Front Desk"})`;
    bookingsList.appendChild(item);
  });
  renderHeroLexiCalendarStar();
}

function renderHeroLexiCalendarStar() {
  if (!heroLexiBookingsCount) return;
  const rows = Array.isArray(latestPublicDemoBookings) ? latestPublicDemoBookings : [];
  const countsByDate = new Map();
  rows.forEach((row) => {
    const key = String(row?.date || "").trim();
    if (!key) return;
    countsByDate.set(key, (countsByDate.get(key) || 0) + 1);
  });
  const sortedDates = Array.from(countsByDate.keys()).sort();
  const nextDate = sortedDates[0] || "";
  const nextCount = nextDate ? countsByDate.get(nextDate) || 0 : 0;
  const activeBookings = rows.filter((row) => String(row?.status || "").toLowerCase() !== "cancelled");
  const revenue = activeBookings.reduce((sum, row) => sum + Number(row?.price || 0), 0);
  const featuredBusinessHint = selectedBusinessId ? "selected business" : "featured business";

  heroLexiBookingsCount.textContent = `${rows.length} live booking${rows.length === 1 ? "" : "s"}`;
  if (heroLexiBookingsRevenue) {
    heroLexiBookingsRevenue.textContent = `Revenue snapshot: GBP ${Number(revenue || 0).toFixed(0)}`;
  }
  if (heroLexiCalendarFocus) {
    heroLexiCalendarFocus.textContent = nextDate
      ? `${formatDisplayDate(nextDate)} | ${nextCount} booking${nextCount === 1 ? "" : "s"}`
      : "No booking dates yet";
  }
  if (heroLexiCalendarNote) {
    heroLexiCalendarNote.textContent = nextDate
      ? `Ask Lexi to check availability around ${formatDisplayDate(nextDate)} or suggest another time.`
      : "Lexi can still answer service questions and start a booking request.";
  }
  if (heroLexiSuggestedPrompt) {
    heroLexiSuggestedPrompt.textContent = nextDate
      ? `Can you check availability around ${formatDisplayDate(nextDate)} for me?`
      : "Can you help me book an appointment this week?";
  }
  if (heroLexiPromptHint) {
    heroLexiPromptHint.textContent = `Lexi gives short, clear replies and helps move the booking forward for ${featuredBusinessHint}.`;
  }
  if (heroLexiCalendarSummary) {
    heroLexiCalendarSummary.textContent = nextDate
      ? `Live booking activity is loaded. Ask Lexi for the best time on ${formatDisplayDate(nextDate)} or to start a booking request now.`
      : "See live booking movement and ask Lexi the next best question in one view.";
  }
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

function setBookingFlowStep(step = "search") {
  const states = {
    search: bookingStepSearch,
    choose: bookingStepChoose,
    book: bookingStepBook
  };
  Object.entries(states).forEach(([key, node]) => {
    if (!node) return;
    node.classList.toggle("is-active", key === step);
  });
}

function renderBusinessDetails(business) {
  setLexiGuideBusiness(business);
  const serviceRows = business.services
      .map((s) => `<li>${escapeHtml(s.name)} - ${s.duration} mins - £${s.price}</li>`)
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
    <div class="salon-actions selected-business-actions">
      <button class="btn btn-quickbook" data-salon-id="${escapeHtml(business.id)}">Book with Lexi</button>
      <button class="btn btn-ghost btn-quickbook" data-salon-id="${escapeHtml(business.id)}">Let Lexi choose a time</button>
    </div>
  `;
  setBookingFlowStep("choose");
}

function renderBusinessResults(results) {
  salonResults.innerHTML = "";
  if (!results.length) {
    const item = document.createElement("li");
    item.className = "salon-item";
    item.textContent = "No salon, barber, or beauty businesses matched those filters.";
    salonResults.appendChild(item);
    return;
  }

  results.forEach((business) => {
    const item = document.createElement("li");
    item.className = "salon-item";
    item.innerHTML = `
      <h4>${escapeHtml(business.name)}</h4>
      <p>${escapeHtml(business.location.city)}, ${escapeHtml(business.location.country)} | ${escapeHtml(business.location.postcode)}</p>
      <p>${escapeHtml(business.phone)} ? Rating: ${business.rating} ? slots shown in profile</p>
      <p>Services: ${escapeHtml(business.services.map((s) => s.name).join(", "))}</p>
      <div class="salon-actions">
        <button class="btn btn-view" data-salon-id="${escapeHtml(business.id)}">Choose</button>
        <button class="btn btn-ghost btn-quickbook" data-salon-id="${escapeHtml(business.id)}">Ask Lexi to Book</button>
      </div>
    `;
    salonResults.appendChild(item);
  });
}

async function searchBusinesses() {
  const filters = getFilters();
  const params = new URLSearchParams({ ...filters, limit: "25" });
  setAppStatus("Searching subscribed businesses...", false, 0);
  try {
    const response = await fetch(`/api/search/businesses?${params.toString()}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "I can't search businesses right now. Please try again in a moment.");
    const results = Array.isArray(data.results) ? data.results : [];
    businessCache = results;
    renderBusinessResults(results);
    updateLiveSummary(results, filters.location);
    setAppStatus(results.length ? `Found ${results.length} result${results.length === 1 ? "" : "s"}.` : "No matches yet. Try broader filters or another area.");
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
  setLexiGuideBusiness(business, {
    prefillService: defaultService,
    prefillSlot: slot
  });
  chatInput.value = `Book ${defaultService} at ${business.name} on ${slot}. My name is `;
  openHomeLexiPopup();
  setBookingFlowStep("book");
}

function ensureHomeLexiPopup() {
  if (homeLexiPopupOverlay && homeLexiPopupContainer) return { overlay: homeLexiPopupOverlay, container: homeLexiPopupContainer };
  const overlay = document.createElement("div");
  overlay.className = "home-lexi-popup-overlay";
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = `
    <section class="home-lexi-popup" role="dialog" aria-modal="true" aria-labelledby="homeLexiPopupTitle">
      <div class="home-lexi-popup-head">
        <div>
          <p class="home-lexi-popup-kicker">Lexi Chat</p>
          <h3 id="homeLexiPopupTitle">Ask Lexi</h3>
          <p>Short, direct booking help in a focused popup.</p>
        </div>
        <button type="button" class="home-lexi-popup-close" aria-label="Close Lexi chat popup">x</button>
      </div>
      <div class="home-lexi-popup-body"></div>
    </section>
  `;
  document.body.appendChild(overlay);
  const container = overlay.querySelector(".home-lexi-popup-body");
  const closeBtn = overlay.querySelector(".home-lexi-popup-close");
  closeBtn?.addEventListener("click", closeHomeLexiPopup);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closeHomeLexiPopup();
  });
  homeLexiPopupOverlay = overlay;
  homeLexiPopupContainer = container;
  return { overlay, container };
}

function openHomeLexiPopup() {
  if (!(frontdeskChatShell instanceof HTMLElement)) {
    document.querySelector(".receptionist-live")?.scrollIntoView({ behavior: "smooth" });
    chatInput?.focus();
    return;
  }
  const { overlay, container } = ensureHomeLexiPopup();
  if (!(container instanceof HTMLElement)) return;
  if (!homeLexiChatPlaceholder) {
    homeLexiChatPlaceholder = document.createElement("div");
    homeLexiChatPlaceholder.className = "home-lexi-chat-placeholder";
  }
  if (frontdeskChatShell.parentNode && frontdeskChatShell.parentNode !== container) {
    frontdeskChatShell.parentNode.insertBefore(homeLexiChatPlaceholder, frontdeskChatShell);
  }
  homeLexiPopupLastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  container.appendChild(frontdeskChatShell);
  overlay.classList.add("is-open");
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("home-lexi-popup-open");
  homeLexiPopupOpen = true;
  chatInput?.focus();
}

function closeHomeLexiPopup() {
  if (!homeLexiPopupOpen) return;
  if (homeLexiChatPlaceholder?.parentNode && frontdeskChatShell instanceof HTMLElement) {
    homeLexiChatPlaceholder.parentNode.insertBefore(frontdeskChatShell, homeLexiChatPlaceholder);
    homeLexiChatPlaceholder.remove();
  }
  if (homeLexiPopupOverlay) {
    homeLexiPopupOverlay.classList.remove("is-open");
    homeLexiPopupOverlay.setAttribute("aria-hidden", "true");
  }
  document.body.classList.remove("home-lexi-popup-open");
  homeLexiPopupOpen = false;
  if (homeLexiPopupLastFocus instanceof HTMLElement && document.contains(homeLexiPopupLastFocus)) {
    homeLexiPopupLastFocus.focus();
  }
  homeLexiPopupLastFocus = null;
}

async function loadConfig() {
  const response = await fetch("/api/config");
  const config = await response.json();
  llmEnabled = Boolean(config.llmEnabled);
  const featured = config.featuredBusiness;
  const policyText = config?.cancellationPolicy?.feeRule || "Cancellation policy unavailable.";

  if (featured) {
    const featuredMeta = `${featured.name} ? ${featured.phone} ? ${featured.location.address}, ${featured.location.city} ? Cancellation: ${policyText}`;
    salonMeta.textContent = featuredMeta;
    if (heroSalonMeta) {
      heroSalonMeta.textContent = "Lexi can answer service questions, check available slots, and start booking requests using your business profile, services, and front desk details.";
    }
    liveBookingSummary.textContent = `${featured.availableSlots.length} slots available today at ${featured.name}.`;
    selectedBusinessId = featured.id;
  } else {
    salonMeta.textContent = `No featured business configured yet. Cancellation: ${policyText}`;
    if (heroSalonMeta) {
      heroSalonMeta.textContent = "No featured business is set yet. Add your business profile to show Lexi's front-desk experience, availability view, and service guidance on the homepage.";
    }
    liveBookingSummary.textContent = "No live availability is showing yet. Add businesses to display slots.";
    selectedBusinessId = "";
  }
  renderHeroLexiCalendarStar();

  if (!llmEnabled) {
    appendMessage(
      "assistant",
      "Lexi advanced AI is currently offline. Add OPENAI_API_KEY to your environment and restart the server to enable it."
    );
  } else {
    appendMessage("assistant", CHATBOT_WELCOME_MESSAGE);
  }
}

heroLexiAskBtn?.addEventListener("click", () => {
  openHomeLexiPopup();
});

heroLexiBookBtn?.addEventListener("click", () => {
  chatInput.value = "I want to book an appointment this week.";
  openHomeLexiPopup();
  setAppStatus("I've added a booking prompt to Lexi.", false, 1800);
});

lexiPromptButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const prompt = String(button.getAttribute("data-lexi-prompt") || "").trim();
    if (!prompt || !chatInput) return;
    chatInput.value = prompt;
    openHomeLexiPopup();
  });
});

async function loadBookings() {
  try {
    const response = await fetch("/api/bookings/public-demo");
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "I couldn't load the demo bookings right now.");
    renderBookings(data.bookings || []);
  } catch (error) {
    renderBookings([]);
    setAppStatus(error.message, true);
  }
}

chatInput?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  if (event.shiftKey) return;
  event.preventDefault();
  chatForm?.requestSubmit();
});

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;

  syncLexiBookingGuideFromMessage(message);
  appendMessage("user", message);
  history.push({ role: "user", content: message });
  chatInput.value = "";

  const thinking = document.createElement("div");
  thinking.className = "msg assistant";
  thinking.textContent = "Let me check that for you...";
  chatWindow.appendChild(thinking);

  try {
    setAppStatus("Lexi is preparing a reply...", false, 0);
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history, businessId: selectedBusinessId })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(String(data?.error || "I couldn't process that message just now."));
    }
    thinking.remove();

    const reply = data.reply || data.error || "I couldn't answer that right now.";
    appendMessage("assistant", reply);
    history.push({ role: "assistant", content: reply });
    syncLexiBookingGuideFromMessage(reply, { bookingCreated: Boolean(data.bookingCreated) });
    setAppStatus(data.bookingCreated ? "Booking request captured successfully." : "Lexi has replied.");

    if (data.bookingCreated) await loadBookings();
  } catch (error) {
    thinking.remove();
    const errorMessage = String(error?.message || "Connection issue. Please try again.");
    appendMessage("assistant", errorMessage);
    setAppStatus(errorMessage, true);
  }
});

chatClear?.addEventListener("click", () => {
  history.length = 0;
  if (chatWindow) chatWindow.innerHTML = "";
  appendMessage("assistant", CHATBOT_WELCOME_MESSAGE);
  resetLexiBookingGuide(getSelectedBusinessRecord());
  if (chatInput) {
    chatInput.value = "";
    chatInput.focus();
  }
  setAppStatus("Chat cleared.");
});

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setBookingFlowStep("search");
  await searchBusinesses();
});

clearFiltersBtn.addEventListener("click", async () => {
  filterName.value = "";
  if (filterBusinessType) filterBusinessType.value = "";
  filterLocation.value = "";
  filterPostcode.value = "";
  filterPhone.value = "";
  await searchBusinesses();
  setAppStatus("Search filters cleared.");
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
      throw new Error(data.error || "I couldn't load that business profile right now.");
    }
    selectedBusinessId = data.business.id;
    renderBusinessDetails(data.business);
    setAppStatus("Business profile loaded.");
  } else if (target.classList.contains("btn-quickbook")) {
    quickBookBusiness(business);
    setAppStatus("I've added a booking prompt to the Lexi chat.");
  }
  };
  run().catch((error) => {
    setAppStatus(error.message || "I couldn't complete that action right now.", true);
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

homeModuleGrid?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const card = target.closest("[data-home-module]");
  if (!(card instanceof HTMLElement)) return;
  const key = String(card.getAttribute("data-home-module") || "").trim();
  if (!key) return;
  openHomeModuleModal(key);
});

homeTrialTriggers.forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    openHomeTrialModal(trigger);
  });
});

homeTrialModalClose?.addEventListener("click", closeHomeTrialModal);
homeTrialCancel?.addEventListener("click", closeHomeTrialModal);
homeTrialModal?.addEventListener("click", (event) => {
  if (event.target === homeTrialModal) closeHomeTrialModal();
});
homeTrialBusinessType?.addEventListener("change", renderHomeTrialTemplatePreview);

homeLoginTriggers.forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    openHomeLoginModal(trigger);
  });
});
homeLoginModalClose?.addEventListener("click", closeHomeLoginModal);
homeLoginModal?.addEventListener("click", (event) => {
  if (event.target === homeLoginModal) closeHomeLoginModal();
});
homeLoginRoleTriggers.forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    const role = String(trigger.getAttribute("data-login-role") || "").trim().toLowerCase();
    if (role === "subscriber") {
      openHomeSubscriberSigninModal(trigger, "subscriber");
      return;
    }
    if (role === "admin") {
      openHomeSubscriberSigninModal(trigger, "admin");
      return;
    }
    if (role === "customer") {
      setHomeCustomerAccessMode("signin");
      openHomeCustomerAccessModal(trigger);
      return;
    }
    if (role === "customer_signup") {
      setHomeCustomerAccessMode("signup");
      openHomeCustomerAccessModal(trigger);
    }
  });
});

homeSubscriberSigninTriggers.forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    openHomeSubscriberSigninModal(trigger, "subscriber");
  });
});
homeSubscriberSigninClose?.addEventListener("click", closeHomeSubscriberSigninModal);
homeSubscriberSigninModal?.addEventListener("click", (event) => {
  if (event.target === homeSubscriberSigninModal) closeHomeSubscriberSigninModal();
});
homeSubscriberModeSwitchers.forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    const target = event.currentTarget;
    if (!(target instanceof HTMLElement)) return;
    const mode = String(target.getAttribute("data-home-subscriber-mode") || "").trim().toLowerCase();
    if (mode !== "subscriber" && mode !== "admin") return;
    event.preventDefault();
    setHomeSubscriberAccessMode(mode);
    window.requestAnimationFrame(() => {
      if (mode === "admin") {
        homeAdminSigninEmail?.focus();
      } else {
        homeSubscriberSigninEmail?.focus();
      }
    });
  });
});

homeAdminSigninTriggers.forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    openHomeAdminSigninModal(trigger);
  });
});
homeAdminSigninClose?.addEventListener("click", closeHomeAdminSigninModal);
homeAdminSigninModal?.addEventListener("click", (event) => {
  if (event.target === homeAdminSigninModal) closeHomeAdminSigninModal();
});

homeCustomerAccessTriggers.forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    openHomeCustomerAccessModal(trigger);
  });
});
homeCustomerAccessClose?.addEventListener("click", closeHomeCustomerAccessModal);
homeCustomerAccessModal?.addEventListener("click", (event) => {
  if (event.target === homeCustomerAccessModal) closeHomeCustomerAccessModal();
});
homeCustomerModeSwitchers.forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    const target = event.currentTarget;
    if (!(target instanceof HTMLElement)) return;
    const mode = String(target.getAttribute("data-home-customer-mode") || "").trim().toLowerCase();
    if (mode !== "signin" && mode !== "signup") return;
    event.preventDefault();
    setHomeCustomerAccessMode(mode);
  });
});

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const lexiLink = target.closest('a[href="#frontdesk"]');
  if (!(lexiLink instanceof HTMLAnchorElement)) return;
  event.preventDefault();
  openHomeLexiPopup();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (homeLexiPopupOpen) closeHomeLexiPopup();
  if (homeTrialModal?.classList.contains("is-open")) closeHomeTrialModal();
  if (homeLoginModal?.classList.contains("is-open")) closeHomeLoginModal();
  if (homeSubscriberSigninModal?.classList.contains("is-open")) closeHomeSubscriberSigninModal();
  if (homeAdminSigninModal?.classList.contains("is-open")) closeHomeAdminSigninModal();
  if (homeCustomerAccessModal?.classList.contains("is-open")) closeHomeCustomerAccessModal();
});

homeTrialForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!(homeTrialRegisterName && homeTrialRegisterEmail && homeTrialRegisterPassword && homeTrialBusinessType &&
      homeTrialBusinessName && homeTrialBusinessCity && homeTrialBusinessCountry && homeTrialBusinessPostcode && homeTrialBusinessPhone)) {
    return;
  }

  const payload = {
    name: homeTrialRegisterName.value.trim(),
    email: homeTrialRegisterEmail.value.trim(),
    password: homeTrialRegisterPassword.value,
    businessType: homeTrialBusinessType.value,
    businessName: homeTrialBusinessName.value.trim(),
    city: homeTrialBusinessCity.value.trim(),
    country: homeTrialBusinessCountry.value.trim(),
    postcode: homeTrialBusinessPostcode.value.trim(),
    phone: homeTrialBusinessPhone.value.trim(),
    websiteUrl: String(homeTrialBusinessWebsite?.value || "").trim(),
    teamSize: String(homeTrialTeamSize?.value || "").trim(),
    primaryGoal: String(homeTrialPrimaryGoal?.value || "").trim(),
    setupNotes: String(homeTrialSetupNotes?.value || "").trim(),
    paymentConsentAccepted: Boolean(homeTrialPaymentConsent?.checked)
  };

  setHomeTrialMessage("Creating your subscriber workspace...", "");
  if (homeTrialSubmit) homeTrialSubmit.disabled = true;

  try {
    const response = await fetch("/api/auth/register/subscriber", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Registration failed.");
    saveSessionAuth(data.token, data.user);
    setHomeTrialMessage("Account created. Redirecting to your dashboard...", "success");
    window.location.href = `/dashboard?role=${encodeURIComponent(String(data?.user?.role || "subscriber"))}`;
  } catch (error) {
    setHomeTrialMessage(error?.message || "Unable to create account right now.", "error");
  } finally {
    if (homeTrialSubmit) homeTrialSubmit.disabled = false;
  }
});

homeSubscriberSigninForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = String(homeSubscriberSigninEmail?.value || "").trim();
  const password = String(homeSubscriberSigninPassword?.value || "");
  if (!email || !password) return;

  setHomeSubscriberSigninMessage("Signing in...", "");
  if (homeSubscriberSigninSubmit) homeSubscriberSigninSubmit.disabled = true;
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        requestedRole: "subscriber"
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to sign in.");
    saveSessionAuth(data.token, data.user);
    setHomeSubscriberSigninMessage("Signed in. Redirecting...", "success");
    window.location.href = `/dashboard?role=${encodeURIComponent(String(data?.user?.role || "subscriber"))}`;
  } catch (error) {
    setHomeSubscriberSigninMessage(error?.message || "Failed to sign in.", "error");
  } finally {
    if (homeSubscriberSigninSubmit) homeSubscriberSigninSubmit.disabled = false;
  }
});

homeAdminSigninForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = String(homeAdminSigninEmail?.value || "").trim();
  const password = String(homeAdminSigninPassword?.value || "");
  if (!email || !password) return;

  setHomeAdminSigninMessage("Signing in...", "");
  if (homeAdminSigninSubmit) homeAdminSigninSubmit.disabled = true;
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        requestedRole: "admin"
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to sign in.");
    saveSessionAuth(data.token, data.user);
    setHomeAdminSigninMessage("Signed in. Redirecting...", "success");
    window.location.href = `/dashboard?role=${encodeURIComponent(String(data?.user?.role || "admin"))}`;
  } catch (error) {
    setHomeAdminSigninMessage(error?.message || "Failed to sign in.", "error");
  } finally {
    if (homeAdminSigninSubmit) homeAdminSigninSubmit.disabled = false;
  }
});

homeCustomerSigninForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = String(homeCustomerSigninEmail?.value || "").trim();
  const password = String(homeCustomerSigninPassword?.value || "");
  if (!email || !password) return;

  setHomeCustomerSigninMessage("Signing in...", "");
  if (homeCustomerSigninSubmit) homeCustomerSigninSubmit.disabled = true;
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        requestedRole: "customer"
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to sign in.");
    saveSessionAuth(data.token, data.user);
    setHomeCustomerSigninMessage("Signed in. Redirecting...", "success");
    window.location.href = `/dashboard?role=${encodeURIComponent(String(data?.user?.role || "customer"))}`;
  } catch (error) {
    setHomeCustomerSigninMessage(error?.message || "Failed to sign in.", "error");
  } finally {
    if (homeCustomerSigninSubmit) homeCustomerSigninSubmit.disabled = false;
  }
});

homeCustomerSignupForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = String(homeCustomerSignupName?.value || "").trim();
  const email = String(homeCustomerSignupEmail?.value || "").trim();
  const password = String(homeCustomerSignupPassword?.value || "");
  const phone = String(homeCustomerSignupPhone?.value || "").trim();
  const city = String(homeCustomerSignupCity?.value || "").trim();
  const preferredService = String(homeCustomerSignupService?.value || "").trim();
  const notes = String(homeCustomerSignupNotes?.value || "").trim();
  if (!name || !email || !password) return;

  setHomeCustomerSignupMessage("Creating customer account...", "");
  if (homeCustomerSignupSubmit) homeCustomerSignupSubmit.disabled = true;
  try {
    const response = await fetch("/api/auth/register/customer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        phone,
        city,
        preferredService,
        notes,
        paymentConsentAccepted: Boolean(homeCustomerPaymentConsent?.checked),
        termsAccepted: Boolean(homeCustomerSignupTerms?.checked),
        updatesOptIn: Boolean(homeCustomerSignupUpdates?.checked)
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Registration failed.");
    saveSessionAuth(data.token, data.user);
    setHomeCustomerSignupMessage("Account created. Redirecting...", "success");
    window.location.href = `/dashboard?role=${encodeURIComponent(String(data?.user?.role || "customer"))}`;
  } catch (error) {
    setHomeCustomerSignupMessage(error?.message || "Registration failed.", "error");
  } finally {
    if (homeCustomerSignupSubmit) homeCustomerSignupSubmit.disabled = false;
  }
});

renderHomeTrialTemplatePreview();

try {
  await loadConfig();
} catch {
  appendMessage("assistant", "Configuration could not be loaded right now.");
  setAppStatus("Config load failed. Some features may be limited.", true);
}
renderLexiBookingGuide();
await loadBookings();
await searchBusinesses();
initializeHomeDemoDashboard();
setupRevealAnimations();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}



