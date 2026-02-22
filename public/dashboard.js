const params = new URLSearchParams(window.location.search);
const isMockMode = params.get("mock") === "1";
const roleParam = String(params.get("role") || "").trim().toLowerCase();
const adminBusinessParam = String(params.get("businessId") || "").trim();

const AUTH_TOKEN_KEY = "salon_ai_token";
const AUTH_USER_KEY = "salon_ai_user";
const token = sessionStorage.getItem(AUTH_TOKEN_KEY);
const userRaw = sessionStorage.getItem(AUTH_USER_KEY);

if (!isMockMode && (!token || !userRaw)) {
  window.location.href = "/auth";
}

const mockRole = roleParam || "subscriber";
const user = isMockMode
  ? {
      id: "mock-user-1",
      role: mockRole,
      name: "Morgan Blake",
      email: "morgan@lumenstudio.example"
    }
  : JSON.parse(userRaw || "{}");
const currentRole = String(user.role || "").trim().toLowerCase();
if (document.body) {
  document.body.setAttribute("data-role", currentRole);
}

const dashTitle = document.getElementById("dashTitle");
const dashUser = document.getElementById("dashUser");
const dashRoleHint = document.getElementById("dashRoleHint");
const dashActionStatus = document.getElementById("dashActionStatus");
const dashIdentityBlock = dashTitle?.parentElement || null;
const frontDeskSection = document.getElementById("frontDeskSection");
const customerSearchSection = document.getElementById("customerSearchSection");
const customerSearchForm = document.getElementById("customerSearchForm");
const customerSearchQuery = document.getElementById("customerSearchQuery");
const customerSearchService = document.getElementById("customerSearchService");
const customerSearchBusinessType = document.getElementById("customerSearchBusinessType");
const customerSearchLocation = document.getElementById("customerSearchLocation");
const customerSearchRating = document.getElementById("customerSearchRating");
const customerSearchDate = document.getElementById("customerSearchDate");
const customerSearchReset = document.getElementById("customerSearchReset");
const customerSearchResults = document.getElementById("customerSearchResults");
const customerReceptionSection = document.getElementById("customerReceptionSection");
const customerReceptionMessages = document.getElementById("customerReceptionMessages");
const customerReceptionForm = document.getElementById("customerReceptionForm");
const customerReceptionInput = document.getElementById("customerReceptionInput");
const customerSlotsSection = document.getElementById("customerSlotsSection");
const customerSelectedSalonLabel = document.getElementById("customerSelectedSalonLabel");
const customerSalonContact = document.getElementById("customerSalonContact");
const customerAvailableSlots = document.getElementById("customerAvailableSlots");
const customerHistorySection = document.getElementById("customerHistorySection");
const customerBookingHistory = document.getElementById("customerBookingHistory");
const customerAnalyticsSection = document.getElementById("customerAnalyticsSection");
const customerAnalyticsGrid = document.getElementById("customerAnalyticsGrid");
const metricsGrid = document.getElementById("metricsGrid");
const subscriberCommandCenterSection = document.getElementById("subscriberCommandCenterSection");
const commandCenterCards = document.getElementById("commandCenterCards");
const commandCenterActions = document.getElementById("commandCenterActions");
const commandCenterStatus = document.getElementById("commandCenterStatus");
const bookingsList = document.getElementById("bookings");
const bookingSearch = document.getElementById("bookingSearch");
const bookingStatus = document.getElementById("bookingStatus");
const bookingSort = document.getElementById("bookingSort");
const statusChips = document.getElementById("statusChips");
const bookingTools = document.getElementById("bookingTools");
const bookingOperationsSection = bookingTools?.closest("section") || null;
const businessGrowthSection = document.getElementById("businessGrowthSection");
const billingLiveBanner = document.getElementById("billingLiveBanner");
const billingLiveMeta = document.getElementById("billingLiveMeta");
const yearlySavingsLine = document.getElementById("yearlySavingsLine");
const onboardingChecklist = document.getElementById("onboardingChecklist");
const first7DaysGrid = document.getElementById("first7DaysGrid");
const moduleNavigatorSection = document.getElementById("moduleNavigatorSection");
const moduleNavigatorIntro = document.getElementById("moduleNavigatorIntro");
const moduleCards = document.getElementById("moduleCards");
const moduleDetails = document.getElementById("moduleDetails");
const loadMoreBookingsBtn = document.getElementById("loadMoreBookings");
const bookingsCountLabel = document.getElementById("bookingsCountLabel");
const subscriberCalendarSection = document.getElementById("subscriberCalendarSection");
const bookingCalendarGrid = document.getElementById("bookingCalendarGrid");
const calendarMonthLabel = document.getElementById("calendarMonthLabel");
const calendarLegend = document.getElementById("calendarLegend");
const calendarPrev = document.getElementById("calendarPrev");
const calendarNext = document.getElementById("calendarNext");
const accountingIntegrationsSection = document.getElementById("accountingIntegrationsSection");
const accountingConnectForm = document.getElementById("accountingConnectForm");
const accountingProvider = document.getElementById("accountingProvider");
const accountingAccountLabel = document.getElementById("accountingAccountLabel");
const accountingSyncMode = document.getElementById("accountingSyncMode");
const accountingStatusNote = document.getElementById("accountingStatusNote");
const accountingIntegrationsList = document.getElementById("accountingIntegrationsList");
const accountingLivePanel = document.getElementById("accountingLivePanel");
const accountingLiveCards = document.getElementById("accountingLiveCards");
const accountingLiveGauges = document.getElementById("accountingLiveGauges");
const accountingLiveRevenueBars = document.getElementById("accountingLiveRevenueBars");
const accountingLiveCancelBars = document.getElementById("accountingLiveCancelBars");
const accountingLiveNote = document.getElementById("accountingLiveNote");
const accountingTimeframeSwitch = document.getElementById("accountingTimeframeSwitch");
const accountingTfToday = document.getElementById("accountingTfToday");
const accountingTf7d = document.getElementById("accountingTf7d");
const accountingTf30d = document.getElementById("accountingTf30d");
const accountingQuickFilterGroup = document.getElementById("accountingQuickFilterGroup");
const accountingQfWeek = document.getElementById("accountingQfWeek");
const accountingQfMonth = document.getElementById("accountingQfMonth");
const accountingCustomFrom = document.getElementById("accountingCustomFrom");
const accountingCustomTo = document.getElementById("accountingCustomTo");
const accountingCustomApply = document.getElementById("accountingCustomApply");
const logoutBtn = document.getElementById("logoutBtn");
const manageModeToggle = document.getElementById("manageModeToggle");
const uiDensityToggle = document.getElementById("uiDensityToggle");
const subscriptionBillingCycle = document.getElementById("subscriptionBillingCycle");
const subscriptionBillingProvider = document.getElementById("subscriptionBillingProvider");
const startBilling = document.getElementById("startBilling");
const manageBilling = document.getElementById("manageBilling");
const adminBusinessScope = document.getElementById("adminBusinessScope");
const adminBusinessSelect = document.getElementById("adminBusinessSelect");
const adminBusinessStatus = document.getElementById("adminBusinessStatus");
const accountingBookingExportBtn = document.getElementById("accountingBookingExportBtn");
const accountingPlatformExportBtn = document.getElementById("accountingPlatformExportBtn");
let bookingRows = [];
let nextBookingsCursor = null;
let calendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let accountingRows = [];
let accountingLivePayload = null;
let accountingLiveTimerId = null;
let accountingLiveTimeframe = "today";
let accountingLiveRangeFrom = "";
let accountingLiveRangeTo = "";
let accountingLiveQuickFilter = "";
let subscriberCommandCenter = null;
let staffRosterRows = [];
let staffSummary = null;
let waitlistRows = [];
let waitlistSummary = null;
let operationsInsights = null;
let crmSegmentsPayload = null;
let commercialPayload = null;
let revenueAttributionPayload = null;
let profitabilityPayload = null;
let managedBusinessId = "";
let adminBusinessOptions = [];
let customerSalonResults = [];
let selectedCustomerSalonId = "";
let customerReceptionTranscript = [];
let activeModuleKey = "";
let billingSummary = null;
const MANAGE_MODE_STORAGE_KEY = "salon_ai_manage_mode_v1";
const UI_DENSITY_STORAGE_KEY = "salon_ai_ui_density_v1";
let manageModeEnabled = false;
const socialMediaSection = document.getElementById("socialMediaSection");
const socialMediaForm = document.getElementById("socialMediaForm");
const facebookInput = document.getElementById("facebookInput");
const instagramInput = document.getElementById("instagramInput");
const twitterInput = document.getElementById("twitterInput");
const linkedinInput = document.getElementById("linkedinInput");
const tiktokInput = document.getElementById("tiktokInput");
const customSocialInput = document.getElementById("customSocialInput");
const socialImageInput = document.getElementById("socialImageInput");
const socialMediaPreview = document.getElementById("socialMediaPreview");
const businessProfileSection = document.getElementById("businessProfileSection");
const businessProfileForm = document.getElementById("businessProfileForm");
const businessProfileStatus = document.getElementById("businessProfileStatus");
const businessProfileName = document.getElementById("businessProfileName");
const businessProfileType = document.getElementById("businessProfileType");
const businessProfilePhone = document.getElementById("businessProfilePhone");
const businessProfileEmail = document.getElementById("businessProfileEmail");
const businessProfileCity = document.getElementById("businessProfileCity");
const businessProfileCountry = document.getElementById("businessProfileCountry");
const businessProfilePostcode = document.getElementById("businessProfilePostcode");
const businessProfileAddress = document.getElementById("businessProfileAddress");
const businessProfileDescription = document.getElementById("businessProfileDescription");
const businessProfileWebsiteUrl = document.getElementById("businessProfileWebsiteUrl");
const businessProfileWebsiteTitle = document.getElementById("businessProfileWebsiteTitle");
const businessProfileWebsiteSummary = document.getElementById("businessProfileWebsiteSummary");
const businessProfileWebsiteImageUrl = document.getElementById("businessProfileWebsiteImageUrl");
const businessHoursMonday = document.getElementById("businessHoursMonday");
const businessHoursTuesday = document.getElementById("businessHoursTuesday");
const businessHoursWednesday = document.getElementById("businessHoursWednesday");
const businessHoursThursday = document.getElementById("businessHoursThursday");
const businessHoursFriday = document.getElementById("businessHoursFriday");
const businessHoursSaturday = document.getElementById("businessHoursSaturday");
const businessHoursSunday = document.getElementById("businessHoursSunday");
const businessProfileServices = document.getElementById("businessProfileServices");
const businessProfileApplyTemplate = document.getElementById("businessProfileApplyTemplate");
const staffRosterSection = document.getElementById("staffRosterSection");
const staffRosterForm = document.getElementById("staffRosterForm");
const staffNameInput = document.getElementById("staffNameInput");
const staffRoleInput = document.getElementById("staffRoleInput");
const staffAvailabilityInput = document.getElementById("staffAvailabilityInput");
const staffShiftDaysInput = document.getElementById("staffShiftDaysInput");
const staffSummaryCards = document.getElementById("staffSummaryCards");
const staffRosterList = document.getElementById("staffRosterList");
const staffStatusNote = document.getElementById("staffStatusNote");
const waitlistSection = document.getElementById("waitlistSection");
const waitlistForm = document.getElementById("waitlistForm");
const waitlistNameInput = document.getElementById("waitlistNameInput");
const waitlistPhoneInput = document.getElementById("waitlistPhoneInput");
const waitlistEmailInput = document.getElementById("waitlistEmailInput");
const waitlistServiceInput = document.getElementById("waitlistServiceInput");
const waitlistDateInput = document.getElementById("waitlistDateInput");
const waitlistSummaryCards = document.getElementById("waitlistSummaryCards");
const waitlistList = document.getElementById("waitlistList");
const waitlistStatusNote = document.getElementById("waitlistStatusNote");
const operationsInsightsSection = document.getElementById("operationsInsightsSection");
const noShowRiskList = document.getElementById("noShowRiskList");
const rebookingPromptList = document.getElementById("rebookingPromptList");
const operationsStatusNote = document.getElementById("operationsStatusNote");
const crmSection = document.getElementById("crmSection");
const crmSegmentsList = document.getElementById("crmSegmentsList");
const crmStatusNote = document.getElementById("crmStatusNote");
const commercialSection = document.getElementById("commercialSection");
const commercialSummaryCards = document.getElementById("commercialSummaryCards");
const membershipForm = document.getElementById("membershipForm");
const membershipNameInput = document.getElementById("membershipNameInput");
const membershipPriceInput = document.getElementById("membershipPriceInput");
const membershipCycleInput = document.getElementById("membershipCycleInput");
const membershipBenefitsInput = document.getElementById("membershipBenefitsInput");
const membershipList = document.getElementById("membershipList");
const packageForm = document.getElementById("packageForm");
const packageNameInput = document.getElementById("packageNameInput");
const packagePriceInput = document.getElementById("packagePriceInput");
const packageSessionsInput = document.getElementById("packageSessionsInput");
const packageList = document.getElementById("packageList");
const giftCardForm = document.getElementById("giftCardForm");
const giftPurchaserInput = document.getElementById("giftPurchaserInput");
const giftRecipientInput = document.getElementById("giftRecipientInput");
const giftBalanceInput = document.getElementById("giftBalanceInput");
const giftExpiresInput = document.getElementById("giftExpiresInput");
const giftCardList = document.getElementById("giftCardList");
const commercialStatusNote = document.getElementById("commercialStatusNote");
const revenueAttributionSection = document.getElementById("revenueAttributionSection");
const revenueSummaryCards = document.getElementById("revenueSummaryCards");
const revenueSpendForm = document.getElementById("revenueSpendForm");
const revenueChannelInput = document.getElementById("revenueChannelInput");
const revenueSpendInput = document.getElementById("revenueSpendInput");
const revenueChannelList = document.getElementById("revenueChannelList");
const revenueStatusNote = document.getElementById("revenueStatusNote");
const profitabilitySection = document.getElementById("profitabilitySection");
const profitSummaryCards = document.getElementById("profitSummaryCards");
const profitPayrollForm = document.getElementById("profitPayrollForm");
const profitStaffNameInput = document.getElementById("profitStaffNameInput");
const profitStaffRoleInput = document.getElementById("profitStaffRoleInput");
const profitStaffHoursInput = document.getElementById("profitStaffHoursInput");
const profitStaffRateInput = document.getElementById("profitStaffRateInput");
const profitStaffBonusInput = document.getElementById("profitStaffBonusInput");
const profitPayrollList = document.getElementById("profitPayrollList");
const profitCostsForm = document.getElementById("profitCostsForm");
const profitRentInput = document.getElementById("profitRentInput");
const profitUtilitiesInput = document.getElementById("profitUtilitiesInput");
const profitSoftwareInput = document.getElementById("profitSoftwareInput");
const profitOtherInput = document.getElementById("profitOtherInput");
const profitCogsPercentInput = document.getElementById("profitCogsPercentInput");
const profitStatusNote = document.getElementById("profitStatusNote");
// Mock data for Front Desk preview
const frontDeskMock = {
  logo: "/icons/barber.svg",
  name: "Glow Studio Salon",
  rating: "4.5/5",
  description: "Premium color and styling studio in central London.",
  social: [
    { label: "Facebook", url: "https://facebook.com/glowstudio", icon: "<svg width='20' height='20' viewBox='0 0 24 24'><path fill='#4267B2' d='M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 5.02 3.68 9.16 8.44 9.88v-6.99h-2.54v-2.89h2.54V9.89c0-2.5 1.49-3.89 3.77-3.89c1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.89h-2.34v6.99C18.32 21.16 22 17.02 22 12z'/></svg>" },
    { label: "Instagram", url: "https://instagram.com/glowstudio", icon: "<svg width='20' height='20' viewBox='0 0 24 24'><path fill='#E1306C' d='M12 2.2c3.2 0 3.584.012 4.85.07c1.17.056 1.97.24 2.43.41c.59.21 1.01.46 1.46.91c.45.45.7.87.91 1.46c.17.46.35 1.26.41 2.43c.058 1.266.07 1.65.07 4.85s-.012 3.584-.07 4.85c-.056 1.17-.24 1.97-.41 2.43c-.21.59-.46 1.01-.91 1.46c-.45.45-.87.7-1.46.91c-.46.17-1.26.35-2.43.41c-1.266.058-1.65.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.056-1.97-.24-2.43-.41c-.59-.21-1.01-.46-1.46-.91c-.45-.45-.7-.87-.91-1.46c-.17-.46-.35-1.26-.41-2.43c-.058-1.266-.07-1.65-.07-4.85s.012-3.584.07-4.85c.056-1.17.24-1.97.41-2.43c.21-.59.46-1.01.91-1.46c.45-.45.87-.7 1.46-.91c.46-.17 1.26-.35 2.43-.41c1.266-.058 1.65-.07 4.85-.07zm0-2.2C8.74 0 8.332.012 7.05.07c-1.28.058-2.16.24-2.91.41c-.75.17-1.36.46-1.91.91c-.55.45-.94.87-1.39 1.46c-.45.59-.74 1.2-.91 1.91c-.17.75-.35 1.63-.41 2.91C.012 8.332 0 8.74 0 12c0 3.26.012 3.668.07 4.95c.058 1.28.24 2.16.41 2.91c.17.75.46 1.36.91 1.91c.45.55.87.94 1.46 1.39c.59.45 1.2.74 1.91.91c.75.17 1.63.35 2.91.41c1.282.058 1.69.07 4.95.07c3.26 0 3.668-.012 4.95-.07c1.28-.058 2.16-.24 2.91-.41c.75-.17 1.36-.46 1.91-.91c.55-.45.94-.87 1.39-1.46c.45-.59.74-1.2.91-1.91c.17-.75.35-1.63.41-2.91c.058-1.282.07-1.69.07-4.95c0-3.26-.012-3.668-.07-4.95c-.058-1.28-.24-2.16-.41-2.91c-.17-.75-.46-1.36-.91-1.91c-.45-.55-.87-.94-1.46-1.39c-.59-.45-1.2-.74-1.91-.91c-.75-.17-1.63-.35-2.91-.41C15.668.012 15.26 0 12 0z'/></svg>" }
  ],
  services: [
    { name: "Balayage", price: "$230", duration: "180min", image: "/icons/balayage.svg" },
    { name: "Blowout", price: "$50", duration: "45min", image: "/icons/blowout.svg" },
    { name: "Women's Haircut", price: "$85", duration: "60min", image: "/icons/haircut.svg" }
  ],
  reviews: [
    { text: "Amazing color and service!", rating: "5/5", author: "Ava T." },
    { text: "Best beauty business in London.", rating: "4/5", author: "Daniel R." }
  ],
  analytics: [
    { label: "Bookings", value: "128" },
    { label: "Revenue", value: "$14,920" },
    { label: "No-Show Rate", value: "3.6%" },
    { label: "Repeat Client Rate", value: "62%" }
  ],
  aiChat: "How can I help you today?"
};

const customerSalonDirectory = [
  {
    id: "salon-urban-fade",
    name: "Urban Fade Studio",
    businessType: "barbershop",
    city: "Downtown",
    rating: 4.8,
    services: ["fade", "beard trim", "line up"],
    barbers: ["Marcus", "Jay", "Ivy"],
    specialists: ["Marcus", "Jay", "Ivy"],
    phone: "(555) 210-9901",
    email: "hello@urbanfade.example",
    address: "125 Main St, Downtown",
    availableSlots: ["2026-02-24 10:00", "2026-02-24 14:30", "2026-02-25 09:15"]
  },
  {
    id: "salon-luxe-color",
    name: "Luxe Color Loft",
    businessType: "hair_salon",
    city: "Midtown",
    rating: 4.7,
    services: ["balayage", "highlights", "blowout"],
    barbers: ["Amara", "Nina"],
    specialists: ["Amara", "Nina"],
    phone: "(555) 210-4410",
    email: "book@luxecolor.example",
    address: "42 Elm Ave, Midtown",
    availableSlots: ["2026-02-23 11:30", "2026-02-24 16:00", "2026-02-26 13:45"]
  },
  {
    id: "salon-classic-chair",
    name: "Classic Chair Barbers",
    businessType: "barbershop",
    city: "Uptown",
    rating: 4.4,
    services: ["skin fade", "buzz cut", "hot towel shave"],
    barbers: ["Devin", "Luis"],
    specialists: ["Devin", "Luis"],
    phone: "(555) 210-7788",
    email: "team@classicchair.example",
    address: "88 Pine Rd, Uptown",
    availableSlots: ["2026-02-22 15:00", "2026-02-23 09:45", "2026-02-25 12:30"]
  },
  {
    id: "salon-willow-style",
    name: "Willow Style House",
    businessType: "beauty_salon",
    city: "West End",
    rating: 4.6,
    services: ["brow shaping", "lash lift", "keratin treatment"],
    barbers: ["Tara", "Mila"],
    specialists: ["Tara", "Mila"],
    phone: "(555) 210-1266",
    email: "care@willowstyle.example",
    address: "9 Willow Ln, West End",
    availableSlots: ["2026-02-24 08:45", "2026-02-24 17:15", "2026-02-27 11:00"]
  }
];

function formatBusinessTypeLabel(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "hair_salon") return "Hair Salon";
  if (normalized === "barbershop") return "Barbershop";
  if (normalized === "beauty_salon") return "Beauty Salon";
  return "General";
}

function renderFrontDeskMock() {
  document.getElementById("businessLogo").src = frontDeskMock.logo;
  document.getElementById("frontDeskBusinessName").textContent = frontDeskMock.name;
  document.getElementById("frontDeskRating").textContent = frontDeskMock.rating;
  document.getElementById("frontDeskDescription").textContent = frontDeskMock.description;
  const socialIcons = document.getElementById("frontDeskSocialIcons");
  socialIcons.innerHTML = "";
  frontDeskMock.social.forEach((s) => {
    const a = document.createElement("a");
    a.href = s.url;
    a.target = "_blank";
    a.innerHTML = s.icon;
    a.title = s.label;
    socialIcons.appendChild(a);
  });
  const services = document.getElementById("frontDeskServices");
  services.innerHTML = "";
  frontDeskMock.services.forEach((svc) => {
    const div = document.createElement("div");
    div.style = "background:rgba(124,234,216,0.08);border-radius:10px;padding:0.6rem;display:flex;align-items:center;gap:0.5rem;min-width:120px;";
    div.innerHTML = `<img src='${svc.image}' alt='' style='width:32px;height:32px;border-radius:8px;background:#fff;' /> <span style='font-weight:600;color:var(--ink);'>${svc.name}</span> <span style='color:var(--muted);'>${svc.price} | ${svc.duration}</span>`;
    services.appendChild(div);
  });
  const reviews = document.getElementById("frontDeskReviews");
  reviews.innerHTML = "";
  frontDeskMock.reviews.forEach((rev) => {
    const div = document.createElement("div");
    div.style = "background:rgba(124,234,216,0.08);border-radius:10px;padding:0.5rem;";
    div.innerHTML = `<span style='font-weight:600;color:var(--ink);'>${rev.rating}</span> <span style='color:var(--muted);'>${rev.text}</span> <span style='color:#7cead8;'>- ${rev.author}</span>`;
    reviews.appendChild(div);
  });
  const analytics = document.getElementById("frontDeskAnalytics");
  analytics.innerHTML = "";
  frontDeskMock.analytics.forEach((stat) => {
    const div = document.createElement("div");
    div.innerHTML = `<span style='font-weight:600;color:var(--ink);'>${stat.label}:</span> <span style='color:var(--muted);'>${stat.value}</span>`;
    analytics.appendChild(div);
  });
  document.getElementById("frontDeskAIChat").textContent = frontDeskMock.aiChat;
}

window.addEventListener("DOMContentLoaded", renderFrontDeskMock);
function renderSocialMediaPreview(data) {
  if (!socialMediaPreview) return;
  socialMediaPreview.innerHTML = "";
  const icons = {
    Facebook: "<svg width='20' height='20' viewBox='0 0 24 24'><path fill='#4267B2' d='M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 5.02 3.68 9.16 8.44 9.88v-6.99h-2.54v-2.89h2.54V9.89c0-2.5 1.49-3.89 3.77-3.89c1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.89h-2.34v6.99C18.32 21.16 22 17.02 22 12z'/></svg>",
    Instagram: "<svg width='20' height='20' viewBox='0 0 24 24'><path fill='#E1306C' d='M12 2.2c3.2 0 3.584.012 4.85.07c1.17.056 1.97.24 2.43.41c.59.21 1.01.46 1.46.91c.45.45.7.87.91 1.46c.17.46.35 1.26.41 2.43c.058 1.266.07 1.65.07 4.85s-.012 3.584-.07 4.85c-.056 1.17-.24 1.97-.41 2.43c-.21.59-.46 1.01-.91 1.46c-.45.45-.87.7-1.46.91c-.46.17-1.26.35-2.43.41c-1.266.058-1.65.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.056-1.97-.24-2.43-.41c-.59-.21-1.01-.46-1.46-.91c-.45-.45-.7-.87-.91-1.46c-.17-.46-.35-1.26-.41-2.43c-.058-1.266-.07-1.65-.07-4.85s.012-3.584.07-4.85c.056-1.17.24-1.97.41-2.43c.21-.59.46-1.01.91-1.46c.45-.45.87-.7 1.46-.91c.46-.17 1.26-.35 2.43-.41c1.266-.058 1.65-.07 4.85-.07zm0-2.2C8.74 0 8.332.012 7.05.07c-1.28.058-2.16.24-2.91.41c-.75.17-1.36.46-1.91.91c-.55.45-.94.87-1.39 1.46c-.45.59-.74 1.2-.91 1.91c-.17.75-.35 1.63-.41 2.91C.012 8.332 0 8.74 0 12c0 3.26.012 3.668.07 4.95c.058 1.28.24 2.16.41 2.91c.17.75.46 1.36.91 1.91c.45.55.87.94 1.46 1.39c.59.45 1.2.74 1.91.91c.75.17 1.63.35 2.91.41c1.282.058 1.69.07 4.95.07c3.26 0 3.668-.012 4.95-.07c1.28-.058 2.16-.24 2.91-.41c.75-.17 1.36-.46 1.91-.91c.55-.45.94-.87 1.39-1.46c.45-.59.74-1.2.91-1.91c.17-.75.35-1.63.41-2.91c.058-1.282.07-1.69.07-4.95c0-3.26-.012-3.668-.07-4.95c-.058-1.28-.24-2.16-.41-2.91c-.17-.75-.46-1.36-.91-1.91c-.45-.55-.87-.94-1.46-1.39c-.59-.45-1.2-.74-1.91-.91c-.75-.17-1.63-.35-2.91-.41C15.668.012 15.26 0 12 0z'/></svg>",
    Twitter: "<svg width='20' height='20' viewBox='0 0 24 24'><path fill='#1DA1F2' d='M22.46 6c-.77.35-1.6.59-2.46.69a4.28 4.28 0 0 0 1.88-2.36c-.83.49-1.75.85-2.72 1.04A4.27 4.27 0 0 0 16.11 4c-2.36 0-4.28 1.92-4.28 4.28c0 .34.04.67.11.98C7.69 8.98 4.07 7.1 1.64 4.16c-.37.64-.58 1.38-.58 2.17c0 1.5.76 2.83 1.92 3.61c-.71-.02-1.38-.22-1.97-.54v.05c0 2.1 1.5 3.85 3.5 4.25c-.36.1-.74.16-1.13.16c-.28 0-.54-.03-.8-.08c.54 1.68 2.1 2.9 3.95 2.93c-1.45 1.14-3.28 1.82-5.27 1.82c-.34 0-.67-.02-1-.06c1.88 1.21 4.12 1.92 6.53 1.92c7.84 0 12.13-6.5 12.13-12.13c0-.18-.01-.36-.02-.54c.83-.6 1.55-1.34 2.12-2.19z'/></svg>",
    LinkedIn: "<svg width='20' height='20' viewBox='0 0 24 24'><path fill='#0077B5' d='M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11.75 20h-2.5v-8.75h2.5v8.75zm-1.25-10.25c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5s1.5.67 1.5 1.5s-.67 1.5-1.5 1.5zm13 10.25h-2.5v-4.25c0-1.02-.02-2.33-1.42-2.33c-1.42 0-1.64 1.11-1.64 2.25v4.33h-2.5v-8.75h2.4v1.19h.03c.33-.63 1.13-1.29 2.33-1.29c2.5 0 2.96 1.64 2.96 3.77v5.08zm-10.25-8.75h-2.5v8.75h2.5v-8.75zm-1.25-1.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5s1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z'/></svg>",
    TikTok: "<svg width='20' height='20' viewBox='0 0 24 24'><path fill='#000000' d='M12.5 2v14.5c0 2.21-1.79 4-4 4s-4-1.79-4-4c0-2.21 1.79-4 4-4c.34 0 .67.04 1 .09V2h3zm7.5 7c-1.1 0-2-.9-2-2V2h-3v7c0 2.21 1.79 4 4 4c.34 0 .67-.04 1-.09V9z'/></svg>"
  };
  const links = [
    { key: "socialFacebook", label: "Facebook", value: data.socialFacebook },
    { key: "socialInstagram", label: "Instagram", value: data.socialInstagram },
    { key: "socialTwitter", label: "Twitter", value: data.socialTwitter },
    { key: "socialLinkedin", label: "LinkedIn", value: data.socialLinkedin },
    { key: "socialTiktok", label: "TikTok", value: data.socialTiktok },
    { key: "customSocial", label: "Other", value: data.customSocial }
  ];
  links.forEach((item) => {
    if (item.value) {
      const div = document.createElement("div");
      div.innerHTML = `
        ${icons[item.label] || ""} <strong>${item.label}:</strong> <a href="${item.value}" target="_blank">${item.value}</a>
        <span class="manage-only" style="margin-left:0.45rem;">
          <button class="btn btn-ghost social-edit-link" type="button" data-social-key="${item.key}" data-social-label="${item.label}" data-social-value="${item.value.replaceAll('"', "&quot;")}">Edit</button>
          <button class="btn btn-ghost social-delete-link" type="button" data-social-key="${item.key}" data-social-label="${item.label}">Delete</button>
        </span>
      `;
      socialMediaPreview.appendChild(div);
    }
  });
  if (data.socialImageUrl) {
    const img = document.createElement("img");
    img.src = data.socialImageUrl;
    img.alt = "Social Media Image";
    img.style.maxWidth = "120px";
    img.style.marginTop = "0.5rem";
    socialMediaPreview.appendChild(img);
    const imageActions = document.createElement("div");
    imageActions.className = "manage-only";
    imageActions.style.marginTop = "0.45rem";
    imageActions.innerHTML =
      '<button class="btn btn-ghost social-clear-image" type="button">Delete Image</button>';
    socialMediaPreview.appendChild(imageActions);
  }
}

function setSocialMediaFormValues(data) {
  if (facebookInput) facebookInput.value = String(data?.socialFacebook || "");
  if (instagramInput) instagramInput.value = String(data?.socialInstagram || "");
  if (twitterInput) twitterInput.value = String(data?.socialTwitter || "");
  if (linkedinInput) linkedinInput.value = String(data?.socialLinkedin || "");
  if (tiktokInput) tiktokInput.value = String(data?.socialTiktok || "");
  if (customSocialInput) customSocialInput.value = String(data?.customSocial || "");
  if (socialImageInput) socialImageInput.value = String(data?.socialImageUrl || "");
}

function validateHttpUrl(url) {
  if (!url) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

async function loadSocialMediaLinks() {
  if (!canManageBusinessModules()) return;
  const res = await fetch(withManagedBusiness("/api/businesses/me/social-media"), { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to load social media links.");
  setSocialMediaFormValues(data);
  renderSocialMediaPreview(data);
  renderBusinessGrowthPanel();
}

function collectSocialMediaPayloadFromInputs() {
  return {
    socialFacebook: String(facebookInput?.value || "").trim(),
    socialInstagram: String(instagramInput?.value || "").trim(),
    socialTwitter: String(twitterInput?.value || "").trim(),
    socialLinkedin: String(linkedinInput?.value || "").trim(),
    socialTiktok: String(tiktokInput?.value || "").trim(),
    customSocial: String(customSocialInput?.value || "").trim(),
    socialImageUrl: String(socialImageInput?.value || "").trim()
  };
}

function validateSocialPayload(payload) {
  const fields = [
    { name: "Facebook", value: payload.socialFacebook },
    { name: "Instagram", value: payload.socialInstagram },
    { name: "Twitter", value: payload.socialTwitter },
    { name: "LinkedIn", value: payload.socialLinkedin },
    { name: "TikTok", value: payload.socialTiktok },
    { name: "Other", value: payload.customSocial },
    { name: "Image URL", value: payload.socialImageUrl }
  ];
  for (const field of fields) {
    if (field.value && !validateHttpUrl(field.value)) {
      throw new Error(`Invalid URL for ${field.name}. Please enter a valid link.`);
    }
  }
}

async function saveSocialMediaLinks(payload) {
  validateSocialPayload(payload);
  const res = await fetch(withManagedBusiness("/api/businesses/me/social-media"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to save social media.");
  setSocialMediaFormValues(data);
  renderSocialMediaPreview(data);
  renderBusinessGrowthPanel();
}

function setBusinessProfileStatus(message, isError = false) {
  if (!businessProfileStatus) return;
  businessProfileStatus.textContent = String(message || "");
  businessProfileStatus.style.color = isError ? "#ffadb5" : "var(--muted)";
}

function formatServicesForEditor(rows = []) {
  return (Array.isArray(rows) ? rows : [])
    .map((row) => `${String(row.name || "").trim()} | ${Number(row.durationMin || 0)} | ${Number(row.price || 0)}`)
    .filter((line) => !line.startsWith(" | "))
    .join("\n");
}

function parseServiceEditorText(value) {
  const lines = String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const services = lines.map((line) => {
    const parts = line.split("|").map((part) => part.trim());
    if (parts.length < 3) {
      throw new Error("Service format must be: Name | DurationMin | Price");
    }
    const [name, durationRaw, priceRaw] = parts;
    const durationMin = Number(durationRaw);
    const price = Number(priceRaw);
    if (!name || !Number.isFinite(durationMin) || durationMin < 5 || !Number.isFinite(price) || price < 0) {
      throw new Error("Each service requires a valid name, duration (>=5), and price (>=0).");
    }
    return { name, durationMin, price };
  });
  if (!services.length) {
    throw new Error("Add at least one service.");
  }
  return services;
}

function getBusinessHoursPayload() {
  return {
    monday: String(businessHoursMonday?.value || "").trim() || "Closed",
    tuesday: String(businessHoursTuesday?.value || "").trim() || "Closed",
    wednesday: String(businessHoursWednesday?.value || "").trim() || "Closed",
    thursday: String(businessHoursThursday?.value || "").trim() || "Closed",
    friday: String(businessHoursFriday?.value || "").trim() || "Closed",
    saturday: String(businessHoursSaturday?.value || "").trim() || "Closed",
    sunday: String(businessHoursSunday?.value || "").trim() || "Closed"
  };
}

function setBusinessProfileFormValues(profile) {
  const business = profile && typeof profile === "object" ? profile : {};
  if (businessProfileName) businessProfileName.value = String(business.name || "");
  if (businessProfileType) businessProfileType.value = String(business.type || "hair_salon");
  if (businessProfilePhone) businessProfilePhone.value = String(business.phone || "");
  if (businessProfileEmail) businessProfileEmail.value = String(business.email || "");
  if (businessProfileCity) businessProfileCity.value = String(business.city || "");
  if (businessProfileCountry) businessProfileCountry.value = String(business.country || "");
  if (businessProfilePostcode) businessProfilePostcode.value = String(business.postcode || "");
  if (businessProfileAddress) businessProfileAddress.value = String(business.address || "");
  if (businessProfileDescription) businessProfileDescription.value = String(business.description || "");
  if (businessProfileWebsiteUrl) businessProfileWebsiteUrl.value = String(business.websiteUrl || "");
  if (businessProfileWebsiteTitle) businessProfileWebsiteTitle.value = String(business.websiteTitle || "");
  if (businessProfileWebsiteSummary) businessProfileWebsiteSummary.value = String(business.websiteSummary || "");
  if (businessProfileWebsiteImageUrl) businessProfileWebsiteImageUrl.value = String(business.websiteImageUrl || "");
  const hours = business.hours && typeof business.hours === "object" ? business.hours : {};
  if (businessHoursMonday) businessHoursMonday.value = String(hours.monday || "Closed");
  if (businessHoursTuesday) businessHoursTuesday.value = String(hours.tuesday || "Closed");
  if (businessHoursWednesday) businessHoursWednesday.value = String(hours.wednesday || "Closed");
  if (businessHoursThursday) businessHoursThursday.value = String(hours.thursday || "Closed");
  if (businessHoursFriday) businessHoursFriday.value = String(hours.friday || "Closed");
  if (businessHoursSaturday) businessHoursSaturday.value = String(hours.saturday || "Closed");
  if (businessHoursSunday) businessHoursSunday.value = String(hours.sunday || "Closed");
  if (businessProfileServices) businessProfileServices.value = formatServicesForEditor(business.services || []);

  if (business.name) document.getElementById("frontDeskBusinessName").textContent = String(business.name);
  if (typeof business.description === "string") document.getElementById("frontDeskDescription").textContent = business.description || "Business description goes here.";
  const serviceShell = document.getElementById("frontDeskServices");
  if (serviceShell) {
    serviceShell.innerHTML = "";
    (Array.isArray(business.services) ? business.services : []).slice(0, 6).forEach((svc) => {
      const div = document.createElement("div");
      div.style = "background:rgba(124,234,216,0.08);border-radius:10px;padding:0.6rem;display:flex;align-items:center;gap:0.5rem;min-width:120px;";
      div.innerHTML = `<span style='font-weight:600;color:var(--ink);'>${escapeHtml(svc.name || "Service")}</span> <span style='color:var(--muted);'>$${Number(svc.price || 0)} | ${Number(svc.durationMin || 0)}min</span>`;
      serviceShell.appendChild(div);
    });
  }
}

async function loadBusinessProfile() {
  if (!canManageBusinessModules()) return;
  const res = await fetch(withManagedBusiness("/api/businesses/me/profile"), { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to load business profile.");
  setBusinessProfileFormValues(data.business || {});
  renderBusinessGrowthPanel();
}

async function saveBusinessProfile(payload) {
  const res = await fetch(withManagedBusiness("/api/businesses/me/profile"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to save business profile.");
  setBusinessProfileFormValues(data.business || {});
  renderBusinessGrowthPanel();
}

async function applyBusinessTemplate(type) {
  const res = await fetch(withManagedBusiness("/api/businesses/me/profile/apply-template"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ type: String(type || "").trim() })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to apply template.");
  setBusinessProfileFormValues(data.business || {});
  renderBusinessGrowthPanel();
}

socialMediaForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    setDashActionStatus("Saving social links...");
    await saveSocialMediaLinks(collectSocialMediaPayloadFromInputs());
    setDashActionStatus("Social links saved.");
  } catch (error) {
    setDashActionStatus(error.message, true);
  }
});

businessProfileForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!canManageBusinessModules()) return;
  setBusinessProfileStatus("Saving business profile...");
  try {
    const services = parseServiceEditorText(String(businessProfileServices?.value || ""));
    await saveBusinessProfile({
      name: String(businessProfileName?.value || "").trim(),
      type: String(businessProfileType?.value || "hair_salon").trim(),
      phone: String(businessProfilePhone?.value || "").trim(),
      email: String(businessProfileEmail?.value || "").trim(),
      city: String(businessProfileCity?.value || "").trim(),
      country: String(businessProfileCountry?.value || "").trim(),
      postcode: String(businessProfilePostcode?.value || "").trim(),
      address: String(businessProfileAddress?.value || "").trim(),
      description: String(businessProfileDescription?.value || "").trim(),
      websiteUrl: String(businessProfileWebsiteUrl?.value || "").trim(),
      websiteTitle: String(businessProfileWebsiteTitle?.value || "").trim(),
      websiteSummary: String(businessProfileWebsiteSummary?.value || "").trim(),
      websiteImageUrl: String(businessProfileWebsiteImageUrl?.value || "").trim(),
      hours: getBusinessHoursPayload(),
      services
    });
    setBusinessProfileStatus("Business profile saved.");
    showManageToast("Business profile saved.");
  } catch (error) {
    setBusinessProfileStatus(error.message, true);
  }
});

businessProfileApplyTemplate?.addEventListener("click", async () => {
  if (!canManageBusinessModules()) return;
  const templateType = String(businessProfileType?.value || "hair_salon").trim();
  const confirmed = window.confirm(
    "Reset to selected template defaults now?\n\nThis will replace:\n- Business type\n- Description\n- Opening hours\n- Services list\n\nIt will NOT change your name, phone, email, location, or website fields."
  );
  if (!confirmed) return;
  setBusinessProfileStatus("Applying template...");
  try {
    await applyBusinessTemplate(templateType);
    setBusinessProfileStatus("Template applied. Services and hours were updated.");
    showManageToast("Template applied.");
  } catch (error) {
    setBusinessProfileStatus(error.message, true);
  }
});
dashTitle.textContent = `${String(currentRole || "user").toUpperCase()} Dashboard`;
if (currentRole === "subscriber" || currentRole === "admin") {
  dashUser.textContent = "";
  hideSection(dashUser);
} else {
  dashUser.textContent = `${user.name || "User"} (${user.email || "unknown"})`;
}
if (dashRoleHint) {
  if (currentRole === "customer") {
    dashRoleHint.textContent = "Use Search -> AI Chat -> Slots to book quickly, then track your visits and personal analytics.";
  } else if (currentRole === "subscriber") {
    dashRoleHint.textContent = "Pick a module, take one action, then move to the next. This keeps daily operations fast and simple.";
  } else if (currentRole === "admin") {
    dashRoleHint.textContent = "Switch business scope, monitor live revenue health, and focus on cancellations and subscription movement.";
  } else {
    dashRoleHint.textContent = "";
  }
}
if (currentRole === "subscriber") {
  managedBusinessId = String(user.businessId || "").trim();
} else if (currentRole === "admin") {
  managedBusinessId = adminBusinessParam;
  if (adminBusinessScope) {
    adminBusinessScope.style.display = "inline-flex";
  }
}

function headers() {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };
}

let dashActionTimerId = null;
function setDashActionStatus(message, isError = false, autoClearMs = 4200) {
  if (!dashActionStatus) return;
  dashActionStatus.textContent = String(message || "").trim();
  dashActionStatus.style.color = isError ? "#ffadb5" : "var(--muted)";
  if (dashActionTimerId) {
    window.clearTimeout(dashActionTimerId);
    dashActionTimerId = null;
  }
  if (!dashActionStatus.textContent || autoClearMs <= 0) return;
  dashActionTimerId = window.setTimeout(() => {
    if (dashActionStatus) dashActionStatus.textContent = "";
    dashActionTimerId = null;
  }, autoClearMs);
}

function loadUiDensityPreference() {
  try {
    const value = String(localStorage.getItem(UI_DENSITY_STORAGE_KEY) || "").trim().toLowerCase();
    return value === "compact" ? "compact" : "comfortable";
  } catch {
    return "comfortable";
  }
}

function setUiDensity(mode) {
  const next = String(mode || "").trim().toLowerCase() === "compact" ? "compact" : "comfortable";
  if (document.body) {
    document.body.setAttribute("data-density", next);
  }
  if (uiDensityToggle && uiDensityToggle.value !== next) {
    uiDensityToggle.value = next;
  }
  try {
    localStorage.setItem(UI_DENSITY_STORAGE_KEY, next);
  } catch {
    // Ignore storage errors.
  }
}

function initializeUiDensity() {
  setUiDensity(loadUiDensityPreference());
}

function canManageBusinessModules() {
  if (user.role === "subscriber") return true;
  if (user.role === "admin") return Boolean(String(managedBusinessId || "").trim());
  return false;
}

function withManagedBusiness(path) {
  if (user.role !== "admin") return path;
  const scope = String(managedBusinessId || "").trim();
  if (!scope) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}businessId=${encodeURIComponent(scope)}`;
}

function setAdminBusinessStatus(message, isError = false) {
  if (!adminBusinessStatus) return;
  adminBusinessStatus.textContent = message || "";
  adminBusinessStatus.style.color = isError ? "#ffadb5" : "var(--muted)";
}

function parseExportFileName(disposition, fallback = "accounting_export.csv") {
  const value = String(disposition || "");
  const match = value.match(/filename="?([^";]+)"?/i);
  return match?.[1] ? match[1] : fallback;
}

async function runAccountingExport(url, button, successMessage, options = {}) {
  const requireManagedBusiness = options.requireManagedBusiness !== false;
  if (requireManagedBusiness && !canManageBusinessModules()) {
    setAccountingStatus("Select a managed business before exporting accounting data.", true);
    return;
  }
  setAccountingStatus("Preparing accounting export...");
  if (button) button.disabled = true;
  try {
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) {
      let message = "Unable to export accounting CSV.";
      try {
        const data = await res.json();
        message = data.error || message;
      } catch {
        // Ignore parse error and keep fallback message.
      }
      throw new Error(message);
    }
    const fileName = parseExportFileName(res.headers.get("content-disposition"), "accounting_export.csv");
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    setAccountingStatus(successMessage || "Accounting CSV exported.");
  } catch (error) {
    setAccountingStatus(error.message, true);
  } finally {
    if (button) button.disabled = false;
  }
}

function syncAdminBusinessQueryParam() {
  if (user.role !== "admin") return;
  const url = new URL(window.location.href);
  if (managedBusinessId) {
    url.searchParams.set("businessId", managedBusinessId);
  } else {
    url.searchParams.delete("businessId");
  }
  const target = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState({}, "", target);
}

function addMetric(label, value) {
  const card = document.createElement("article");
  card.className = "dash-card";
  card.innerHTML = `<p>${label}</p><strong>${value}</strong>`;
  metricsGrid.appendChild(card);
}

function hideSection(sectionEl) {
  if (sectionEl) {
    sectionEl.style.display = "none";
  }
}

function showSection(sectionEl) {
  if (sectionEl) {
    sectionEl.style.display = "";
  }
}

function formatDateShort(value) {
  if (!value) return "N/A";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "N/A";
  return dt.toLocaleDateString();
}

function moduleDefinitionsForRole() {
  if (user.role === "customer") {
    return [
      {
        key: "customer_search",
        section: customerSearchSection,
        label: "Business Search",
        features: ["Advanced filters", "Business type targeting", "Rating/date match"],
        howItWorks: "Filter by service, location, rating, date, and business type.",
        howItHelps: "Find the best local option faster and reduce booking friction."
      },
      {
        key: "customer_chat",
        section: customerReceptionSection,
        label: "AI Receptionist",
        features: ["Live AI receptionist", "Service Q&A", "Booking guidance"],
        howItWorks: "Ask the AI receptionist for slots, services, and contact details.",
        howItHelps: "Get answers instantly and convert intent into booked appointments."
      },
      {
        key: "customer_slots",
        section: customerSlotsSection,
        label: "Slots and Contact",
        features: ["Available time slots", "Phone/email visibility", "Selected business context"],
        howItWorks: "View live slot windows and contact info for selected businesses.",
        howItHelps: "Speed up decision-making and reduce drop-off before booking."
      },
      {
        key: "customer_history",
        section: customerHistorySection,
        label: "Visit and Booking History",
        features: ["Past visits", "Upcoming bookings", "Single timeline view"],
        howItWorks: "Track previous and upcoming appointments in one place.",
        howItHelps: "Improves rebooking confidence and customer retention."
      },
      {
        key: "customer_analytics",
        section: customerAnalyticsSection,
        label: "Personal Analytics",
        features: ["Booking trends", "Completion/cancel view", "Personal-only metrics"],
        howItWorks: "Summarizes completion, cancellations, and activity trends.",
        howItHelps: "Gives customers a simple view of personal booking behavior."
      }
    ];
  }

  if (user.role === "subscriber" || user.role === "admin") {
    return [
      {
        key: "overview",
        section: metricsGrid,
        label: "Overview Metrics",
        features: ["KPI snapshot", "Revenue/bookings pulse", "Quick health check"],
        howItWorks: "Shows top-line KPI cards for bookings, revenue, and platform health.",
        howItHelps: "Gives a fast daily pulse before diving into deeper modules."
      },
      {
        key: "frontdesk",
        section: frontDeskSection,
        label: "Front Desk Profile",
        features: ["Public profile preview", "Service presentation", "Trust signals"],
        howItWorks: "Displays business profile, featured services, reviews, and AI reception summary.",
        howItHelps: "Keeps your public-facing experience aligned with what customers see."
      },
      {
        key: "command_center",
        section: subscriberCommandCenterSection,
        label: "Command Center",
        features: ["Daily action queue", "7-day outlook", "Risk highlights"],
        howItWorks: "Rolls up today and next-7-day operational risk and revenue signals.",
        howItHelps: "Prioritizes what to act on first to protect bookings and revenue."
      },
      {
        key: "business_profile",
        section: businessProfileSection,
        label: "Business Profile",
        features: ["Edit core details", "Service/hours updates", "Template reset"],
        howItWorks: "Edit core profile, service menu, hours, and apply templates.",
        howItHelps: "Keeps booking data accurate and improves conversion quality."
      },
      {
        key: "booking_ops",
        section: bookingOperationsSection,
        label: "Booking Operations",
        features: ["Search and filters", "Status workflows", "High-volume handling"],
        howItWorks: "Search, filter, reschedule, and manage booking records quickly.",
        howItHelps: "Reduces admin time and keeps appointment flow reliable."
      },
      {
        key: "calendar",
        section: subscriberCalendarSection,
        label: "Calendar",
        features: ["Monthly demand map", "Peak day visibility", "Capacity planning cue"],
        howItWorks: "Shows booking density by day across the current month.",
        howItHelps: "Highlights demand peaks and staffing pressure points."
      },
      {
        key: "accounting",
        section: accountingIntegrationsSection,
        label: "Accounting",
        features: ["Live revenue stream", "Provider connections", "CSV export"],
        howItWorks: "Connect providers, stream revenue, and export accounting CSVs.",
        howItHelps: "Cuts manual reconciliation and improves financial visibility."
      },
      {
        key: "staff",
        section: staffRosterSection,
        label: "Staff and Capacity",
        features: ["Roster controls", "Availability status", "Shift-day tracking"],
        howItWorks: "Manage team availability and shift coverage against demand.",
        howItHelps: "Prevents overbooking and improves service delivery consistency."
      },
      {
        key: "waitlist",
        section: waitlistSection,
        label: "Waitlist",
        features: ["Demand capture", "Backfill workflows", "Cancellation recovery"],
        howItWorks: "Capture demand and backfill cancelled slots quickly.",
        howItHelps: "Recovers otherwise lost revenue from last-minute cancellations."
      },
      {
        key: "operations",
        section: operationsInsightsSection,
        label: "No-Show and Rebooking",
        features: ["Risk scoring", "Rebooking prompts", "Priority outreach"],
        howItWorks: "Highlights at-risk bookings and inactive-client rebooking prompts.",
        howItHelps: "Improves occupancy and lifts repeat bookings."
      },
      {
        key: "crm",
        section: crmSection,
        label: "CRM and Campaigns",
        features: ["Customer segments", "Campaign prompts", "Retention targeting"],
        howItWorks: "Groups customers into segments and campaign-ready actions.",
        howItHelps: "Supports retention and targeted reactivation outreach."
      },
      {
        key: "commercial",
        section: commercialSection,
        label: "Memberships and Packages",
        features: ["Membership plans", "Service bundles", "Gift card controls"],
        howItWorks: "Manage plans, bundles, and gift cards from one control point.",
        howItHelps: "Creates predictable recurring revenue and better cash flow."
      },
      {
        key: "revenue",
        section: revenueAttributionSection,
        label: "Revenue Attribution",
        features: ["Channel tracking", "Spend vs revenue", "ROI comparisons"],
        howItWorks: "Tracks channel revenue, spend, and return by source.",
        howItHelps: "Improves marketing allocation and ROI decisions."
      },
      {
        key: "profitability",
        section: profitabilitySection,
        label: "Profitability and Payroll",
        features: ["Payroll inputs", "Cost modeling", "Margin/breakeven insight"],
        howItWorks: "Combines payroll and cost inputs to estimate margin and breakeven.",
        howItHelps: "Clarifies what drives profit and where to optimize."
      },
      {
        key: "social",
        section: socialMediaSection,
        label: "Social Presence",
        features: ["Profile link manager", "Channel consistency", "Brand reach support"],
        howItWorks: "Central place to update social links and media profile data.",
        howItHelps: "Strengthens brand trust and helps convert profile visitors."
      }
    ];
  }
  return [];
}

function renderModuleNavigator() {
  if (!moduleNavigatorSection || !moduleCards || !moduleDetails) return;
  const modules = moduleDefinitionsForRole().filter((mod) => Boolean(mod.section));
  if (!modules.length) {
    hideSection(moduleNavigatorSection);
    return;
  }
  showSection(moduleNavigatorSection);
  if (moduleNavigatorIntro) {
    moduleNavigatorIntro.textContent = user.role === "customer"
      ? "Switch between customer tools, with quick guidance on what each tool does."
      : "Switch between business modules, with feature highlights and business impact guidance.";
  }

  moduleCards.innerHTML = "";
  modules.forEach((mod) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `module-card${mod.key === activeModuleKey ? " active" : ""}`;
    btn.setAttribute("data-module-key", mod.key);
    const featurePreview = Array.isArray(mod.features) && mod.features.length
      ? mod.features.slice(0, 2).join(" | ")
      : mod.howItWorks;
    btn.innerHTML = `<strong>${mod.label}</strong><small>${featurePreview}</small><small>${mod.howItHelps}</small>`;
    moduleCards.appendChild(btn);
  });

  const active = modules.find((mod) => mod.key === activeModuleKey) || modules[0];
  activeModuleKey = active.key;
  const featureItems = Array.isArray(active.features) && active.features.length
    ? active.features.map((item) => `<li>${item}</li>`).join("")
    : "<li>Use this section for focused daily decisions.</li>";
  moduleDetails.innerHTML = `
    <strong>${active.label}</strong>
    <p style="margin-top:0.35rem;"><strong>Main features:</strong></p>
    <ul style="margin:0.1rem 0 0.45rem 1rem;color:var(--muted);display:grid;gap:0.18rem;">${featureItems}</ul>
    <p><strong>How it works:</strong> ${active.howItWorks}</p>
    <p><strong>How it helps:</strong> ${active.howItHelps}</p>
  `;
}

function focusModuleByKey(moduleKey) {
  const key = String(moduleKey || "").trim();
  if (!key) return;
  const modules = moduleDefinitionsForRole().filter((mod) => Boolean(mod.section));
  const found = modules.find((mod) => mod.key === key);
  if (!found) return;
  activeModuleKey = found.key;
  applyModuleVisibility();
  found.section?.classList.remove("panel-focus");
  void found.section?.offsetWidth;
  found.section?.classList.add("panel-focus");
  window.setTimeout(() => {
    found.section?.classList.remove("panel-focus");
  }, 700);
  found.section?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function applyModuleVisibility() {
  const modules = moduleDefinitionsForRole().filter((mod) => Boolean(mod.section));
  if (!modules.length) return;
  const active = modules.find((mod) => mod.key === activeModuleKey) || modules[0];
  activeModuleKey = active.key;
  modules.forEach((mod) => {
    if (mod.key === active.key) showSection(mod.section);
    else hideSection(mod.section);
  });
  renderModuleNavigator();
}

function initializeModuleNavigator() {
  const modules = moduleDefinitionsForRole().filter((mod) => Boolean(mod.section));
  if (!modules.length) {
    hideSection(moduleNavigatorSection);
    return;
  }
  if (!activeModuleKey || !modules.some((mod) => mod.key === activeModuleKey)) {
    activeModuleKey = modules[0].key;
  }
  applyModuleVisibility();
  moduleCards?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const card = target.closest("[data-module-key]");
    if (!(card instanceof HTMLElement)) return;
    const next = String(card.getAttribute("data-module-key") || "").trim();
    if (!next || next === activeModuleKey) return;
    activeModuleKey = next;
    applyModuleVisibility();
  });
}

function renderBusinessGrowthPanel() {
  if (!(user.role === "subscriber" || user.role === "admin")) {
    hideSection(businessGrowthSection);
    return;
  }
  showSection(businessGrowthSection);

  if (billingLiveBanner) {
    const status = String(billingSummary?.status || "inactive").toLowerCase();
    const plan = String(billingSummary?.planLabel || "Subscriber");
    billingLiveBanner.textContent = `Plan: ${plan} (${status})`;
  }
  if (billingLiveMeta) {
    const renewal = billingSummary?.currentPeriodEnd
      ? `Next renewal: ${formatDateShort(billingSummary.currentPeriodEnd)}`
      : "Next renewal: Not available yet";
    billingLiveMeta.textContent = renewal;
  }
  if (yearlySavingsLine) {
    const pct = Number(billingSummary?.yearlyDiscountPercent || 16.6).toFixed(1);
    const savePerYear = Number((Number(billingSummary?.monthlyFee || 29.99) * 12 - Number(billingSummary?.yearlyFee || 299.99)).toFixed(2));
    yearlySavingsLine.textContent = `Yearly billing saves £${savePerYear} per year (${pct}% off).`;
  }

  if (onboardingChecklist) {
    const profileDone = Boolean(String(businessProfileName?.value || "").trim() && String(businessProfilePhone?.value || "").trim() && String(businessProfileEmail?.value || "").trim());
    const servicesCount = String(businessProfileServices?.value || "").split("\n").map((line) => line.trim()).filter(Boolean).length;
    const servicesDone = servicesCount >= 3;
    const hoursDone = [businessHoursMonday, businessHoursTuesday, businessHoursWednesday, businessHoursThursday, businessHoursFriday, businessHoursSaturday, businessHoursSunday]
      .every((input) => Boolean(String(input?.value || "").trim()));
    const socialDone = [facebookInput, instagramInput, twitterInput, linkedinInput, tiktokInput, customSocialInput]
      .some((input) => Boolean(String(input?.value || "").trim()));
    const accountingDone = accountingRows.some((row) => row?.connected);
    const bookingsDone = bookingRows.length > 0;

    const items = [
      { label: "Business profile completed", ok: profileDone, moduleKey: "business_profile" },
      { label: "Service menu has 3+ services", ok: servicesDone, moduleKey: "business_profile" },
      { label: "Opening hours configured", ok: hoursDone, moduleKey: "business_profile" },
      { label: "Social links added", ok: socialDone, moduleKey: "social" },
      { label: "Accounting linked", ok: accountingDone, moduleKey: "accounting" },
      { label: "First booking received", ok: bookingsDone, moduleKey: "frontdesk" }
    ];
    const completeCount = items.filter((item) => item.ok).length;
    onboardingChecklist.innerHTML = "";
    const summary = document.createElement("li");
    summary.innerHTML = `<strong>${completeCount}/${items.length} completed</strong> - finish these for a strong launch in under 2 minutes.`;
    onboardingChecklist.appendChild(summary);
    items.forEach((item) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span>${item.ok ? "Done" : "Pending"}: ${item.label}</span>
        <button class="btn btn-ghost" type="button" data-module-jump="${item.moduleKey}" style="padding:0.25rem 0.55rem;font-size:0.72rem;margin-left:0.45rem;">${item.ok ? "Review" : "Open"}</button>
      `;
      onboardingChecklist.appendChild(li);
    });
  }

  if (first7DaysGrid) {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const recent = bookingRows.filter((row) => {
      const ts = new Date(row.createdAt || `${row.date || ""}T${String(row.time || "00:00").slice(0, 5)}:00`).getTime();
      return Number.isFinite(ts) && ts >= sevenDaysAgo;
    });
    const bookings = recent.length;
    const completed = recent.filter((row) => String(row.status || "").toLowerCase() === "completed").length;
    const cancelled = recent.filter((row) => String(row.status || "").toLowerCase() === "cancelled").length;
    const revenue = recent
      .filter((row) => String(row.status || "").toLowerCase() !== "cancelled")
      .reduce((sum, row) => sum + Number(row.price || 0), 0);
    const cards = [
      { label: "Bookings", value: String(bookings) },
      { label: "Completed", value: String(completed) },
      { label: "Cancelled", value: String(cancelled) },
      { label: "Revenue", value: formatMoney(revenue) }
    ];
    first7DaysGrid.innerHTML = "";
    cards.forEach((card) => {
      const article = document.createElement("article");
      article.innerHTML = `<p>${card.label}</p><strong>${card.value}</strong>`;
      first7DaysGrid.appendChild(article);
    });
  }
}

function isDashboardManagerRole() {
  return user.role === "subscriber" || user.role === "admin";
}

function loadManageModePreference() {
  try {
    return localStorage.getItem(MANAGE_MODE_STORAGE_KEY) === "on";
  } catch {
    return false;
  }
}

function setManageMode(enabled) {
  manageModeEnabled = Boolean(enabled);
  if (document.body) {
    document.body.setAttribute("data-manage-mode", manageModeEnabled ? "on" : "off");
  }
  if (manageModeToggle) {
    manageModeToggle.textContent = `Manage Mode: ${manageModeEnabled ? "On" : "Off"}`;
    manageModeToggle.setAttribute("aria-pressed", manageModeEnabled ? "true" : "false");
  }
  try {
    localStorage.setItem(MANAGE_MODE_STORAGE_KEY, manageModeEnabled ? "on" : "off");
  } catch {
    // Ignore storage errors.
  }
}

function initializeManageMode() {
  if (!isDashboardManagerRole()) {
    if (manageModeToggle) hideSection(manageModeToggle);
    setManageMode(false);
    return;
  }
  setManageMode(loadManageModePreference());
}

function ensureManageToastStack() {
  let stack = document.getElementById("manageToastStack");
  if (stack) return stack;
  stack = document.createElement("div");
  stack.id = "manageToastStack";
  stack.className = "manage-toast-stack";
  document.body.appendChild(stack);
  return stack;
}

function showManageToast(message, type = "success") {
  const text = String(message || "").trim();
  if (!text) return;
  const stack = ensureManageToastStack();
  const toast = document.createElement("div");
  toast.className = `manage-toast${type === "error" ? " error" : ""}`;
  toast.textContent = text;
  stack.appendChild(toast);
  window.setTimeout(() => {
    toast.remove();
  }, 2800);
}

function ensureManageModalOverlay() {
  let overlay = document.getElementById("manageModalOverlay");
  if (overlay) return overlay;
  overlay = document.createElement("div");
  overlay.id = "manageModalOverlay";
  overlay.className = "manage-modal-overlay";
  document.body.appendChild(overlay);
  return overlay;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function openManageForm({ title, fields = [], submitLabel = "Save" } = {}) {
  const overlay = ensureManageModalOverlay();
  overlay.innerHTML = "";
  overlay.style.display = "flex";
  const form = document.createElement("form");
  form.className = "manage-modal";
  form.innerHTML = `
    <h3>${escapeHtml(title || "Manage Item")}</h3>
    <div class="manage-modal-grid"></div>
    <div class="manage-modal-actions">
      <button type="button" class="btn btn-ghost manage-modal-cancel">Cancel</button>
      <button type="submit" class="btn">${escapeHtml(submitLabel)}</button>
    </div>
  `;
  const grid = form.querySelector(".manage-modal-grid");
  fields.forEach((field) => {
    const wrapper = document.createElement("label");
    wrapper.setAttribute("for", `manage-field-${field.id}`);
    const label = document.createElement("span");
    label.textContent = field.label || field.id;
    wrapper.appendChild(label);
    let control;
    const type = String(field.type || "text").toLowerCase();
    if (type === "select") {
      control = document.createElement("select");
      (field.options || []).forEach((option) => {
        const op = document.createElement("option");
        op.value = String(option.value);
        op.textContent = String(option.label);
        if (String(option.value) === String(field.value || "")) op.selected = true;
        control.appendChild(op);
      });
    } else if (type === "textarea") {
      control = document.createElement("textarea");
      control.rows = Number(field.rows || 3);
      control.value = String(field.value || "");
    } else {
      control = document.createElement("input");
      control.type = type;
      control.value = String(field.value || "");
      if (field.placeholder) control.placeholder = String(field.placeholder);
    }
    control.id = `manage-field-${field.id}`;
    control.name = field.id;
    if (field.required) control.required = true;
    wrapper.appendChild(control);
    grid?.appendChild(wrapper);
  });
  overlay.appendChild(form);
  const firstControl = form.querySelector("input,select,textarea");
  if (firstControl instanceof HTMLElement) firstControl.focus();

  return new Promise((resolve) => {
    const close = (result) => {
      overlay.style.display = "none";
      overlay.innerHTML = "";
      resolve(result);
    };
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const values = {};
      fields.forEach((field) => {
        const el = form.querySelector(`[name="${field.id}"]`);
        if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
          values[field.id] = String(el.value || "").trim();
        }
      });
      close(values);
    });
    const cancel = form.querySelector(".manage-modal-cancel");
    cancel?.addEventListener("click", () => close(null));
    overlay.addEventListener(
      "click",
      (event) => {
        if (event.target === overlay) close(null);
      },
      { once: true }
    );
  });
}

async function openManageConfirm({ title, message, confirmLabel = "Confirm" } = {}) {
  const overlay = ensureManageModalOverlay();
  overlay.innerHTML = "";
  overlay.style.display = "flex";
  const shell = document.createElement("div");
  shell.className = "manage-modal";
  shell.innerHTML = `
    <h3>${escapeHtml(title || "Confirm Action")}</h3>
    <p style="margin:0;color:var(--muted);">${escapeHtml(message || "Please confirm this action.")}</p>
    <div class="manage-modal-actions">
      <button type="button" class="btn btn-ghost manage-modal-cancel">Cancel</button>
      <button type="button" class="btn manage-modal-confirm">${escapeHtml(confirmLabel)}</button>
    </div>
  `;
  overlay.appendChild(shell);
  return new Promise((resolve) => {
    const close = (result) => {
      overlay.style.display = "none";
      overlay.innerHTML = "";
      resolve(result);
    };
    shell.querySelector(".manage-modal-cancel")?.addEventListener("click", () => close(false));
    shell.querySelector(".manage-modal-confirm")?.addEventListener("click", () => close(true));
    overlay.addEventListener(
      "click",
      (event) => {
        if (event.target === overlay) close(false);
      },
      { once: true }
    );
  });
}

function formatMoney(value) {
  const numeric = Number(value || 0);
  if (!Number.isFinite(numeric)) return "$0.00";
  return `$${numeric.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function setCommandCenterStatus(message, isError = false) {
  if (!commandCenterStatus) return;
  commandCenterStatus.textContent = message || "";
  commandCenterStatus.style.color = isError ? "#ffadb5" : "var(--muted)";
}

function focusBookingOperations() {
  const section = bookingTools || bookingsList;
  section?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function writeToClipboard(text) {
  if (!navigator?.clipboard?.writeText) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

async function runCommandCenterAction(actionId) {
  if (!actionId) return;
  if (!bookingStatus || !bookingSort) return;

  if (actionId === "fill-cancellations") {
    bookingStatus.value = "cancelled";
    setActiveStatusChip("cancelled");
    applyBookingFilters();
    (waitlistSection || bookingTools || bookingsList)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setCommandCenterStatus("Showing cancelled bookings and opening waitlist tools for fast backfill.");
    return;
  }

  if (actionId === "boost-today-demand") {
    const offerTemplate = "Same-day availability just opened up. Reply now to reserve your slot.";
    const copied = await writeToClipboard(offerTemplate);
    bookingStatus.value = "all";
    setActiveStatusChip("all");
    bookingSort.value = "newest";
    applyBookingFilters();
    focusBookingOperations();
    setCommandCenterStatus(
      copied
        ? "Campaign template copied. Use it for SMS/email blast now."
        : "Campaign idea ready: Send a same-day availability offer to recent clients."
    );
    return;
  }

  if (actionId === "tighten-confirmations") {
    bookingStatus.value = "confirmed";
    setActiveStatusChip("confirmed");
    bookingSort.value = "newest";
    applyBookingFilters();
    focusBookingOperations();
    setCommandCenterStatus("Focused on confirmed bookings. Prioritize reminders for today's appointments.");
    return;
  }

  if (actionId === "maintain-momentum") {
    bookingStatus.value = "confirmed";
    setActiveStatusChip("confirmed");
    bookingSort.value = "oldest";
    applyBookingFilters();
    focusBookingOperations();
    setCommandCenterStatus("Stable day. Focus your team on rebooking and upsells at checkout.");
  }
}

function renderCommandCenter() {
  if (!subscriberCommandCenterSection || !commandCenterCards || !commandCenterActions) return;
  if (user.role !== "subscriber") {
    subscriberCommandCenterSection.style.display = "none";
    return;
  }

  const data = subscriberCommandCenter || {
    today: { totalBookings: 0, confirmedBookings: 0, estimatedRevenue: 0, lastMinuteCancellations: 0 },
    next7Days: { confirmedBookings: 0, estimatedRevenue: 0 },
    serviceHealth: { cancellationRate: 0 },
    recommendedActions: [{ label: "Load bookings", detail: "No command-center data yet." }]
  };

  const cards = [
    { label: "Today's Bookings", value: data.today?.totalBookings ?? 0 },
    { label: "Today's Revenue", value: formatMoney(data.today?.estimatedRevenue ?? 0) },
    { label: "Next 7 Days", value: data.next7Days?.confirmedBookings ?? 0 },
    { label: "Cancellation Rate", value: `${Number(data.serviceHealth?.cancellationRate || 0).toFixed(1)}%` }
  ];

  commandCenterCards.innerHTML = "";
  cards.forEach((card) => {
    const article = document.createElement("article");
    article.className = "command-card";
    article.innerHTML = `<p>${card.label}</p><strong>${card.value}</strong>`;
    commandCenterCards.appendChild(article);
  });

  const actions = Array.isArray(data.recommendedActions) ? data.recommendedActions : [];
  commandCenterActions.innerHTML = "";
  actions.forEach((action) => {
    const li = document.createElement("li");
    const actionId = String(action.id || "").trim();
    li.innerHTML = `
      <div><strong>${action.label || "Action"}</strong></div>
      <small>${action.detail || ""}</small>
      <div class="action-controls">
        <button class="btn btn-ghost command-action-run" type="button" data-action-id="${actionId}">Run Action</button>
      </div>
    `;
    commandCenterActions.appendChild(li);
  });
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function toDateKey(dateValue) {
  return `${dateValue.getFullYear()}-${pad2(dateValue.getMonth() + 1)}-${pad2(dateValue.getDate())}`;
}

function parseBookingDate(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const safe = new Date(`${raw}T12:00:00`);
    return Number.isNaN(safe.getTime()) ? null : safe;
  }
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function renderSubscriberCalendar() {
  if (!bookingCalendarGrid || !calendarMonthLabel || !calendarLegend) return;

  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const monthLabel = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(
    firstDay
  );
  calendarMonthLabel.textContent = monthLabel;

  const bookingCountByDate = new Map();
  bookingRows.forEach((booking) => {
    const bookingDate = parseBookingDate(booking.date);
    if (!bookingDate) return;
    const key = toDateKey(bookingDate);
    bookingCountByDate.set(key, (bookingCountByDate.get(key) || 0) + 1);
  });

  bookingCalendarGrid.innerHTML = "";
  const weekdayOffset = firstDay.getDay();
  for (let i = 0; i < weekdayOffset; i += 1) {
    const spacer = document.createElement("div");
    spacer.className = "calendar-day empty";
    bookingCalendarGrid.appendChild(spacer);
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let monthlyBookings = 0;
  let activeDays = 0;

  for (let day = 1; day <= daysInMonth; day += 1) {
    const currentDate = new Date(year, month, day);
    const key = toDateKey(currentDate);
    const count = bookingCountByDate.get(key) || 0;
    if (count > 0) {
      monthlyBookings += count;
      activeDays += 1;
    }

    const cell = document.createElement("article");
    cell.className = `calendar-day${count > 0 ? " has-bookings" : ""}`;
    cell.innerHTML = `<strong>${day}</strong><small>${count > 0 ? `${count} booking${count === 1 ? "" : "s"}` : "No bookings"}</small>`;
    bookingCalendarGrid.appendChild(cell);
  }

  calendarLegend.textContent =
    monthlyBookings > 0
      ? `${monthlyBookings} bookings across ${activeDays} day${activeDays === 1 ? "" : "s"} this month.`
      : "No bookings scheduled this month yet.";
}

function getSelectedCustomerSalon() {
  const fromResults = customerSalonResults.find((salon) => salon.id === selectedCustomerSalonId);
  if (fromResults) return fromResults;
  return customerSalonDirectory.find((salon) => salon.id === selectedCustomerSalonId) || null;
}

function renderCustomerSearchResults() {
  if (!customerSearchResults) return;
  customerSearchResults.innerHTML = "";
  if (!customerSalonResults.length) {
    customerSearchResults.innerHTML = "<li>No businesses match these filters yet.</li>";
    return;
  }
  customerSalonResults.forEach((salon) => {
    const isSelected = salon.id === selectedCustomerSalonId;
    const item = document.createElement("li");
    item.innerHTML = `
      <div>
        <strong>${salon.name}</strong><br />
        <small>${salon.city} | ${formatBusinessTypeLabel(salon.businessType)} | Rating ${salon.rating.toFixed(1)} | ${salon.services.join(", ")}</small>
      </div>
      <button class="btn ${isSelected ? "" : "btn-ghost"} customer-select-salon" type="button" data-salon-id="${salon.id}">
        ${isSelected ? "Selected" : "Select"}
      </button>
    `;
    customerSearchResults.appendChild(item);
  });
}

function renderCustomerSelectedSalon() {
  const salon = getSelectedCustomerSalon();
  if (customerSelectedSalonLabel) {
    customerSelectedSalonLabel.textContent = salon
      ? `${salon.name} in ${salon.city}`
      : "Select a business from search results.";
  }
  if (customerSalonContact) {
    customerSalonContact.innerHTML = salon
      ? `<strong>Contact</strong><br /><small>${salon.phone} | ${salon.email}<br />${salon.address}</small>`
      : "<small>No business selected yet.</small>";
  }
  if (customerAvailableSlots) {
    customerAvailableSlots.innerHTML = "";
    if (!salon) {
      customerAvailableSlots.innerHTML = "<li>Pick a business to view available booking slots.</li>";
      return;
    }
    if (!Array.isArray(salon.availableSlots) || !salon.availableSlots.length) {
      customerAvailableSlots.innerHTML = "<li>No open slots right now.</li>";
      return;
    }
    salon.availableSlots.forEach((slot) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${slot}</strong><br /><small>Call or chat with AI Receptionist to request this slot.</small>`;
      customerAvailableSlots.appendChild(li);
    });
  }
}

function runCustomerSalonSearch() {
  const query = normalizeText(customerSearchQuery?.value);
  const service = normalizeText(customerSearchService?.value);
  const businessType = normalizeText(customerSearchBusinessType?.value);
  const location = normalizeText(customerSearchLocation?.value);
  const minRating = Number(customerSearchRating?.value || 0);
  const desiredDate = String(customerSearchDate?.value || "").trim();

  customerSalonResults = customerSalonDirectory.filter((salon) => {
    if (Number.isFinite(minRating) && minRating > 0 && salon.rating < minRating) return false;
    if (location && !normalizeText(salon.city).includes(location)) return false;
    if (service) {
      const hasService = salon.services.some((entry) => normalizeText(entry).includes(service));
      if (!hasService) return false;
    }
    if (businessType) {
      if (normalizeText(salon.businessType) !== businessType) return false;
    }
    if (query) {
      const specialistList = Array.isArray(salon.specialists) && salon.specialists.length ? salon.specialists : (salon.barbers || []);
      const blob = [salon.name, salon.city, ...salon.services, ...specialistList].map((entry) => normalizeText(entry)).join(" ");
      if (!blob.includes(query)) return false;
    }
    if (desiredDate) {
      const hasDateMatch = salon.availableSlots.some((slot) => String(slot).startsWith(desiredDate));
      if (!hasDateMatch) return false;
    }
    return true;
  });

  if (!customerSalonResults.some((salon) => salon.id === selectedCustomerSalonId)) {
    selectedCustomerSalonId = customerSalonResults[0]?.id || "";
  }
  renderCustomerSearchResults();
  renderCustomerSelectedSalon();
}

function renderCustomerReceptionChat() {
  if (!customerReceptionMessages) return;
  customerReceptionMessages.innerHTML = "";
  customerReceptionTranscript.forEach((entry) => {
    const msg = document.createElement("div");
    msg.className = `customer-chat-msg ${entry.role === "user" ? "user" : "ai"}`;
    msg.textContent = entry.text;
    customerReceptionMessages.appendChild(msg);
  });
  customerReceptionMessages.scrollTop = customerReceptionMessages.scrollHeight;
}

function getReceptionReply(inputText) {
  const message = normalizeText(inputText);
  const salon = getSelectedCustomerSalon();
  if (!message) return "Please type your question and I can help.";
  if (message.includes("slot") || message.includes("available") || message.includes("book")) {
    if (!salon) return "Select a business first and I can walk you through available slots.";
    const nextSlot = salon.availableSlots[0];
    return nextSlot
      ? `${salon.name} has upcoming availability at ${nextSlot}.`
      : `${salon.name} has no open slots listed right now.`;
  }
  if (message.includes("phone") || message.includes("email") || message.includes("contact")) {
    if (!salon) return "Select a business first and I will share contact info.";
    return `You can reach ${salon.name} at ${salon.phone} or ${salon.email}.`;
  }
  if (message.includes("service")) {
    if (!salon) return "Select a business first and I can list services.";
    return `${salon.name} services include ${salon.services.join(", ")}.`;
  }
  return "I can help with business search, available slots, services, and contact details.";
}

function renderCustomerBookingHistory(rows = []) {
  if (!customerBookingHistory) return;
  customerBookingHistory.innerHTML = "";
  if (!rows.length) {
    customerBookingHistory.innerHTML = "<li>No booking history yet.</li>";
    return;
  }
  const sorted = rows
    .slice()
    .sort((a, b) => `${b.date || ""} ${b.time || ""}`.localeCompare(`${a.date || ""} ${a.time || ""}`));
  const now = new Date();
  sorted.forEach((row) => {
    const bookingDate = parseBookingDate(row.date);
    const isPast = bookingDate ? bookingDate < now : false;
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${row.businessName || "Business"} | ${row.service || "Service"}</strong><br />
      <small>${row.date || "N/A"} at ${row.time || "N/A"} | ${row.status || "unknown"} | ${isPast ? "Past visit" : "Upcoming booking"}</small>
    `;
    customerBookingHistory.appendChild(li);
  });
}

function renderCustomerAnalytics(rows = []) {
  if (!customerAnalyticsGrid) return;
  customerAnalyticsGrid.innerHTML = "";
  const total = rows.length;
  const completed = rows.filter((row) => normalizeText(row.status) === "completed").length;
  const cancelled = rows.filter((row) => normalizeText(row.status) === "cancelled").length;
  const upcoming = rows.filter((row) => {
    const date = parseBookingDate(row.date);
    return date && date >= new Date() && normalizeText(row.status) !== "cancelled";
  }).length;
  const uniqueSalons = new Set(rows.map((row) => normalizeText(row.businessName)).filter(Boolean)).size;
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
    const article = document.createElement("article");
    article.className = "dash-card";
    article.innerHTML = `<p>${card.label}</p><strong>${card.value}</strong>`;
    customerAnalyticsGrid.appendChild(article);
  });
}

function refreshCustomerDashboard() {
  if (user.role !== "customer") return;
  renderCustomerBookingHistory(bookingRows);
  renderCustomerAnalytics(bookingRows);
}

function initializeCustomerExperience() {
  if (user.role !== "customer") return;
  customerSalonResults = customerSalonDirectory.slice();
  selectedCustomerSalonId = customerSalonResults[0]?.id || "";
  customerReceptionTranscript = [
    {
      role: "ai",
      text: "Hi, I can help you find hair and beauty businesses, available slots, and contact details."
    }
  ];
  renderCustomerSearchResults();
  renderCustomerSelectedSalon();
  renderCustomerReceptionChat();
  refreshCustomerDashboard();
}

function formatProviderLabel(value) {
  const provider = String(value || "").trim().toLowerCase();
  const map = {
    quickbooks: "QuickBooks",
    xero: "Xero",
    freshbooks: "FreshBooks",
    sage: "Sage"
  };
  return map[provider] || provider;
}

function formatDateTime(value) {
  if (!value) return "N/A";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "N/A";
  return parsed.toLocaleString();
}

function setAccountingStatus(message, isError = false) {
  if (!accountingStatusNote) return;
  accountingStatusNote.textContent = message || "";
  accountingStatusNote.style.color = isError ? "#ffadb5" : "var(--muted)";
}

function setAccountingLiveNote(message, isError = false) {
  if (!accountingLiveNote) return;
  accountingLiveNote.textContent = message || "";
  accountingLiveNote.style.color = isError ? "#ffadb5" : "var(--muted)";
}

function formatRelativeTime(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "just now";
  const diffSec = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
  if (diffSec < 10) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const minutes = Math.floor(diffSec / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

function timeframeLabel(value) {
  const key = String(value || "").trim().toLowerCase();
  if (key === "7d") return "Last 7 Days";
  if (key === "30d") return "Last 30 Days";
  if (key === "custom") return "Custom Range";
  return "Today";
}

function setAccountingTimeframe(nextTimeframe, { reload = true } = {}) {
  const safe = nextTimeframe === "7d" || nextTimeframe === "30d" ? nextTimeframe : "today";
  accountingLiveTimeframe = safe;
  setQuickFilterVisualState("");
  accountingLiveRangeFrom = "";
  accountingLiveRangeTo = "";
  if (accountingCustomFrom) accountingCustomFrom.value = "";
  if (accountingCustomTo) accountingCustomTo.value = "";
  const buttons = [accountingTfToday, accountingTf7d, accountingTf30d];
  buttons.forEach((btn) => {
    if (!btn) return;
    const active = String(btn.getAttribute("data-timeframe") || "") === safe;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-selected", active ? "true" : "false");
  });
  if (reload) {
    loadAccountingLiveRevenue().catch(() => {});
  }
}

function setQuickFilterVisualState(key) {
  accountingLiveQuickFilter = key || "";
  const entries = [
    [accountingQfWeek, "week"],
    [accountingQfMonth, "month"]
  ];
  entries.forEach(([btn, id]) => {
    if (!btn) return;
    btn.classList.toggle("active", accountingLiveQuickFilter === id);
  });
  if (accountingLiveQuickFilter) {
    [accountingTfToday, accountingTf7d, accountingTf30d].forEach((btn) => {
      if (!btn) return;
      btn.classList.remove("active");
      btn.setAttribute("aria-selected", "false");
    });
  }
}

function setAccountingLiveRange(from, to, { reload = true } = {}) {
  accountingLiveRangeFrom = String(from || "").trim();
  accountingLiveRangeTo = String(to || "").trim();
  if (accountingCustomFrom) accountingCustomFrom.value = accountingLiveRangeFrom;
  if (accountingCustomTo) accountingCustomTo.value = accountingLiveRangeTo;
  if (reload) {
    loadAccountingLiveRevenue().catch(() => {});
  }
}

function getThisWeekRange() {
  const now = new Date();
  const weekday = now.getDay();
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const from = start.toISOString().slice(0, 10);
  const to = end.toISOString().slice(0, 10);
  return { from, to };
}

function getThisMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const from = start.toISOString().slice(0, 10);
  const to = end.toISOString().slice(0, 10);
  return { from, to };
}

function renderAccountingLiveRevenue() {
  if (
    !accountingLivePanel ||
    !accountingLiveCards ||
    !accountingLiveGauges ||
    !accountingLiveRevenueBars ||
    !accountingLiveCancelBars
  ) return;
  if (!isDashboardManagerRole()) {
    accountingLivePanel.style.display = "none";
    return;
  }

  accountingLivePanel.style.display = "";
  const mode = String(accountingLivePayload?.mode || "business");
  const timeframe = String(accountingLivePayload?.timeframe || accountingLiveTimeframe || "today");
  const rangeFrom = String(accountingLivePayload?.range?.from || "");
  const rangeTo = String(accountingLivePayload?.range?.to || "");
  const periodText = timeframe === "custom" && rangeFrom && rangeTo ? `${rangeFrom} to ${rangeTo}` : timeframeLabel(timeframe);
  if (timeframe !== accountingLiveTimeframe) {
    accountingLiveTimeframe = timeframe === "7d" || timeframe === "30d" ? timeframe : "today";
    [accountingTfToday, accountingTf7d, accountingTf30d].forEach((btn) => {
      if (!btn) return;
      const active = String(btn.getAttribute("data-timeframe") || "") === accountingLiveTimeframe;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
  }
  if (timeframe === "custom" && rangeFrom && rangeTo) {
    setQuickFilterVisualState(accountingLiveQuickFilter || "custom");
    if (accountingCustomFrom) accountingCustomFrom.value = rangeFrom;
    if (accountingCustomTo) accountingCustomTo.value = rangeTo;
    accountingLiveRangeFrom = rangeFrom;
    accountingLiveRangeTo = rangeTo;
  }
  const cards = accountingLivePayload?.cards || {};
  const gauges = accountingLivePayload?.gauges || {};
  const hourlyRows = Array.isArray(accountingLivePayload?.stream?.hourly) ? accountingLivePayload.stream.hourly : [];
  const weeklyRows = Array.isArray(accountingLivePayload?.stream?.weekly) ? accountingLivePayload.stream.weekly : [];

  accountingLiveCards.innerHTML = "";
  const cardRows = mode === "platform"
    ? [
        { label: `Estimated MRR (${periodText})`, value: formatMoney(cards.todayRevenue || 0) },
        { label: `Estimated Revenue (${periodText})`, value: formatMoney(cards.todayCancelledRevenue || 0) },
        { label: "Subscription Cancellations", value: String(cards.todayBookings || 0) },
        { label: "Booking Cancellations", value: String(cards.todayCancellations || 0) }
      ]
    : [
        { label: `${periodText} Revenue`, value: formatMoney(cards.todayRevenue || 0) },
        { label: "Last 60m Revenue", value: formatMoney(cards.lastHourRevenue || 0) },
        { label: "Last 15m Revenue", value: formatMoney(cards.last15MinRevenue || 0) },
        { label: `${periodText} Cancellations`, value: String(cards.todayCancellations || 0) }
      ];
  cardRows.forEach((card) => {
    const article = document.createElement("article");
    article.innerHTML = `<p>${card.label}</p><strong>${card.value}</strong>`;
    accountingLiveCards.appendChild(article);
  });

  const targetProgress = Number(gauges.targetProgressPct || 0);
  const cancellationRate = Number(gauges.cancellationRatePct || 0);
  accountingLiveGauges.innerHTML = `
    <article class="gauge-card">
      <div class="gauge-ring" style="--gauge-progress:${Math.min(100, Math.max(0, targetProgress))}">
        <span>${Math.round(targetProgress)}%</span>
      </div>
      <small>${mode === "platform" ? "MRR goal progress" : "Daily target progress"} (${formatMoney(gauges.dailyTarget || 0)} target)</small>
    </article>
    <article class="gauge-card">
      <div class="gauge-ring" style="--gauge-progress:${Math.min(100, Math.max(0, cancellationRate))}">
        <span>${Math.round(cancellationRate)}%</span>
      </div>
      <small>${mode === "platform" ? "Subscription churn signal" : "Cancellation rate today"}</small>
    </article>
  `;

  const flowRows = hourlyRows.length ? hourlyRows : weeklyRows.slice(-6);
  const maxRevenue = Math.max(1, ...flowRows.map((row) => Number(row.revenue || 0)));
  accountingLiveRevenueBars.innerHTML = "";
  flowRows.forEach((row) => {
    const height = Math.max(8, Math.round((Number(row.revenue || 0) / maxRevenue) * 108));
    const col = document.createElement("article");
    col.className = "live-bar-col";
    col.innerHTML = `
      <div class="live-bar revenue" style="--bar-height:${height}px"></div>
      <small>${escapeHtml(row.label || "")}</small>
      <small>${escapeHtml(formatMoney(row.revenue || 0))}</small>
    `;
    accountingLiveRevenueBars.appendChild(col);
  });

  const maxCancels = Math.max(1, ...flowRows.map((row) => Number(row.cancellations || 0)));
  accountingLiveCancelBars.innerHTML = "";
  flowRows.forEach((row) => {
    const height = Math.max(8, Math.round((Number(row.cancellations || 0) / maxCancels) * 108));
    const col = document.createElement("article");
    col.className = "live-bar-col";
    col.innerHTML = `
      <div class="live-bar cancel" style="--bar-height:${height}px"></div>
      <small>${escapeHtml(row.label || "")}</small>
      <small>${Number(row.cancellations || 0)}</small>
    `;
    accountingLiveCancelBars.appendChild(col);
  });

  const stamp = formatRelativeTime(accountingLivePayload?.generatedAt);
  const scopeText = mode === "platform" ? "Platform" : "Business";
  setAccountingLiveNote(
    `${scopeText} live sync (${periodText}) ${stamp}. Auto-refresh every ${Number(accountingLivePayload?.refreshIntervalSec || 15)}s.`
  );
}

async function loadAccountingLiveRevenue({ silent = false } = {}) {
  if (isMockMode) {
    if (accountingLivePayload && typeof accountingLivePayload === "object") {
      accountingLivePayload.timeframe = accountingLiveRangeFrom && accountingLiveRangeTo ? "custom" : accountingLiveTimeframe;
      accountingLivePayload.range = accountingLiveRangeFrom && accountingLiveRangeTo
        ? { from: accountingLiveRangeFrom, to: accountingLiveRangeTo }
        : undefined;
      accountingLivePayload.generatedAt = new Date().toISOString();
    }
    renderAccountingLiveRevenue();
    return;
  }
  try {
    const params = new URLSearchParams();
    params.set("timeframe", accountingLiveRangeFrom && accountingLiveRangeTo ? "custom" : accountingLiveTimeframe || "today");
    if (accountingLiveRangeFrom && accountingLiveRangeTo) {
      params.set("from", accountingLiveRangeFrom);
      params.set("to", accountingLiveRangeTo);
    }
    let endpoint = "";
    if (canManageBusinessModules()) {
      params.set("scope", "business");
      endpoint = withManagedBusiness(`/api/accounting-integrations/live-revenue?${params.toString()}`);
    } else if (user.role === "admin") {
      params.set("scope", "platform");
      endpoint = `/api/accounting-integrations/live-revenue?${params.toString()}`;
    }
    if (!endpoint) {
      renderAccountingLiveRevenue();
      return;
    }
    const res = await fetch(endpoint, { headers: headers() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to load live accounting revenue.");
    accountingLivePayload = data || null;
    renderAccountingLiveRevenue();
  } catch (error) {
    if (!silent) setAccountingStatus(error.message, true);
    setAccountingLiveNote(error.message, true);
  }
}

function startAccountingLiveStream() {
  if (accountingLiveTimerId) {
    window.clearInterval(accountingLiveTimerId);
    accountingLiveTimerId = null;
  }
  if (!isDashboardManagerRole()) return;
  if (isMockMode) {
    renderAccountingLiveRevenue();
    return;
  }
  loadAccountingLiveRevenue().catch(() => {});
  accountingLiveTimerId = window.setInterval(() => {
    loadAccountingLiveRevenue({ silent: true }).catch(() => {});
  }, 15000);
}

function setStaffStatus(message, isError = false) {
  if (!staffStatusNote) return;
  staffStatusNote.textContent = message || "";
  staffStatusNote.style.color = isError ? "#ffadb5" : "var(--muted)";
}

function parseShiftDaysInput(raw) {
  return String(raw || "")
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
}

function renderStaffSummary() {
  if (!staffSummaryCards) return;
  const summary = staffSummary || {
    totalMembers: 0,
    onDutyCount: 0,
    offDutyCount: 0,
    scheduledTodayCount: 0,
    estimatedChairCapacityToday: 0
  };
  const cards = [
    { label: "Team Members", value: summary.totalMembers || 0 },
    { label: "On Duty", value: summary.onDutyCount || 0 },
    { label: "Scheduled Today", value: summary.scheduledTodayCount || 0 },
    { label: "Chair Capacity", value: summary.estimatedChairCapacityToday || 0 }
  ];
  staffSummaryCards.innerHTML = "";
  cards.forEach((card) => {
    const article = document.createElement("article");
    article.innerHTML = `<p>${card.label}</p><strong>${card.value}</strong>`;
    staffSummaryCards.appendChild(article);
  });
}

function renderStaffRoster() {
  if (!staffRosterList) return;
  staffRosterList.innerHTML = "";
  if (!staffRosterRows.length) {
    staffRosterList.innerHTML =
      "<li><div class='staff-meta'><strong>No staff members yet.</strong><br /><small>Add your team to unlock capacity planning.</small><br /><button class='btn btn-ghost' type='button' data-module-jump='staff' style='margin-top:0.45rem;padding:0.32rem 0.65rem;font-size:0.75rem;'>Open Staff Setup</button></div></li>";
    return;
  }
  staffRosterRows.forEach((member) => {
    const li = document.createElement("li");
    const days =
      Array.isArray(member.shiftDays) && member.shiftDays.length ? member.shiftDays.join(", ") : "No shift days";
    li.innerHTML = `
      <div class="staff-meta">
        <strong>${member.name} (${member.role || "staff"})</strong><br />
        <small>Status: ${member.availability === "on_duty" ? "On duty" : "Off duty"} | Shift: ${days}</small>
      </div>
      <div class="staff-actions">
        <button class="btn btn-ghost manage-only staff-toggle" type="button" data-id="${member.id}" data-next="${
      member.availability === "on_duty" ? "off_duty" : "on_duty"
    }">
          Edit Status
        </button>
        <button class="btn btn-ghost manage-only staff-edit" type="button" data-id="${member.id}">Edit</button>
        <button class="btn btn-ghost manage-only staff-remove" type="button" data-id="${member.id}">Delete</button>
      </div>
    `;
    staffRosterList.appendChild(li);
  });
}

function applyStaffRosterPayload(data) {
  staffRosterRows = Array.isArray(data?.members) ? data.members : [];
  staffSummary = data?.summary || null;
  renderStaffSummary();
  renderStaffRoster();
}

async function loadStaffRoster() {
  if (!canManageBusinessModules()) return;
  const res = await fetch(withManagedBusiness("/api/staff-roster"), { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to load staff roster.");
  applyStaffRosterPayload(data);
}

async function upsertStaffMember(payload) {
  const res = await fetch(withManagedBusiness("/api/staff-roster/upsert"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to save staff member.");
  applyStaffRosterPayload(data);
}

async function updateStaffAvailability(staffId, availability) {
  const res = await fetch(withManagedBusiness(`/api/staff-roster/${encodeURIComponent(staffId)}/availability`), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ availability })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to update staff availability.");
  applyStaffRosterPayload(data);
}

async function removeStaffMember(staffId) {
  const res = await fetch(withManagedBusiness(`/api/staff-roster/${encodeURIComponent(staffId)}`), {
    method: "DELETE",
    headers: headers()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to remove staff member.");
  applyStaffRosterPayload(data);
}

function setWaitlistStatus(message, isError = false) {
  if (!waitlistStatusNote) return;
  waitlistStatusNote.textContent = message || "";
  waitlistStatusNote.style.color = isError ? "#ffadb5" : "var(--muted)";
}

function parseWaitlistDateTime(raw) {
  const value = String(raw || "").trim();
  if (!value) return { preferredDate: "", preferredTime: "" };
  const dateTime = new Date(value);
  if (Number.isNaN(dateTime.getTime())) return null;
  const yyyy = dateTime.getFullYear();
  const mm = String(dateTime.getMonth() + 1).padStart(2, "0");
  const dd = String(dateTime.getDate()).padStart(2, "0");
  const hh = String(dateTime.getHours()).padStart(2, "0");
  const min = String(dateTime.getMinutes()).padStart(2, "0");
  return { preferredDate: `${yyyy}-${mm}-${dd}`, preferredTime: `${hh}:${min}` };
}

function renderWaitlistSummary() {
  if (!waitlistSummaryCards) return;
  const summary = waitlistSummary || { totalEntries: 0, waitingCount: 0, contactedCount: 0, bookedCount: 0 };
  const cards = [
    { label: "Waitlist Entries", value: summary.totalEntries || 0 },
    { label: "Waiting", value: summary.waitingCount || 0 },
    { label: "Contacted/Booked", value: (summary.contactedCount || 0) + (summary.bookedCount || 0) }
  ];
  waitlistSummaryCards.innerHTML = "";
  cards.forEach((card) => {
    const article = document.createElement("article");
    article.innerHTML = `<p>${card.label}</p><strong>${card.value}</strong>`;
    waitlistSummaryCards.appendChild(article);
  });
}

function renderWaitlist() {
  if (!waitlistList) return;
  waitlistList.innerHTML = "";
  if (!waitlistRows.length) {
    waitlistList.innerHTML =
      "<li><div class='waitlist-meta'><strong>No waitlist entries yet.</strong><br /><small>Add clients to backfill cancellations quickly.</small><br /><button class='btn btn-ghost' type='button' data-module-jump='waitlist' style='margin-top:0.45rem;padding:0.32rem 0.65rem;font-size:0.75rem;'>Open Waitlist</button></div></li>";
    return;
  }
  waitlistRows.forEach((entry) => {
    const preferred =
      entry.preferredDate && entry.preferredTime ? `${entry.preferredDate} ${entry.preferredTime}` : "Flexible";
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="waitlist-meta">
        <strong>${entry.customerName} (${entry.status})</strong><br />
        <small>${entry.service || "Any service"} | ${preferred} | ${entry.customerPhone || entry.customerEmail || "No contact"}</small>
      </div>
      <div class="waitlist-actions">
        <button class="btn btn-ghost manage-only waitlist-backfill" type="button" data-id="${entry.id}" ${
      entry.status === "waiting" ? "" : "disabled"
    }>Edit Status</button>
        <button class="btn btn-ghost manage-only waitlist-edit" type="button" data-id="${entry.id}">Edit</button>
        <button class="btn btn-ghost manage-only waitlist-remove" type="button" data-id="${entry.id}">Delete</button>
      </div>
    `;
    waitlistList.appendChild(li);
  });
}

function applyWaitlistPayload(data) {
  waitlistRows = Array.isArray(data?.entries) ? data.entries : [];
  waitlistSummary = data?.summary || null;
  renderWaitlistSummary();
  renderWaitlist();
}

async function loadWaitlist() {
  if (!canManageBusinessModules()) return;
  const res = await fetch(withManagedBusiness("/api/waitlist"), { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to load waitlist.");
  applyWaitlistPayload(data);
}

async function upsertWaitlistEntry(payload) {
  const res = await fetch(withManagedBusiness("/api/waitlist/upsert"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to save waitlist entry.");
  applyWaitlistPayload(data);
}

async function markWaitlistContacted(entryId) {
  const res = await fetch(withManagedBusiness(`/api/waitlist/${encodeURIComponent(entryId)}/backfill`), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({})
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to update waitlist entry.");
  applyWaitlistPayload(data);
}

async function removeWaitlistEntry(entryId) {
  const res = await fetch(withManagedBusiness(`/api/waitlist/${encodeURIComponent(entryId)}`), {
    method: "DELETE",
    headers: headers()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to remove waitlist entry.");
  applyWaitlistPayload(data);
}

function setOperationsStatus(message, isError = false) {
  if (!operationsStatusNote) return;
  operationsStatusNote.textContent = message || "";
  operationsStatusNote.style.color = isError ? "#ffadb5" : "var(--muted)";
}

function setCrmStatus(message, isError = false) {
  if (!crmStatusNote) return;
  crmStatusNote.textContent = message || "";
  crmStatusNote.style.color = isError ? "#ffadb5" : "var(--muted)";
}

async function markRebookingPromptSent(payload) {
  const res = await fetch(withManagedBusiness("/api/operations/rebooking/mark-sent"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload || {})
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to mark rebooking prompt as sent.");
  return data;
}

function renderOperationsInsights() {
  if (!operationsInsightsSection || !noShowRiskList || !rebookingPromptList) return;
  if (!canManageBusinessModules()) {
    operationsInsightsSection.style.display = "none";
    return;
  }

  const riskRows = Array.isArray(operationsInsights?.noShowRisk) ? operationsInsights.noShowRisk : [];
  const promptRows = Array.isArray(operationsInsights?.rebookingPrompts) ? operationsInsights.rebookingPrompts : [];

  noShowRiskList.innerHTML = "";
  if (!riskRows.length) {
    noShowRiskList.innerHTML = "<li><small>No high-risk bookings right now.</small></li>";
  } else {
    riskRows.forEach((row) => {
      const item = document.createElement("li");
      const reasonText = Array.isArray(row.reasons) ? row.reasons.join(" ") : "";
      item.innerHTML = `
        <strong>${row.customerName} - ${row.service}</strong>
        <small>${row.date} ${row.time} | Risk: ${row.riskLevel} (${row.riskScore})</small>
        <small>${reasonText}</small>
        <div class="ops-actions">
          <button class="btn btn-ghost ops-send-reminder" type="button" data-booking-id="${row.bookingId}" data-customer-name="${row.customerName}" data-service="${row.service}">Mark Reminder Sent</button>
        </div>
      `;
      noShowRiskList.appendChild(item);
    });
  }

  rebookingPromptList.innerHTML = "";
  if (!promptRows.length) {
    rebookingPromptList.innerHTML = "<li><small>No rebooking candidates right now.</small></li>";
  } else {
    promptRows.forEach((row) => {
      const item = document.createElement("li");
      item.innerHTML = `
        <strong>${row.customerName}</strong>
        <small>${row.daysSinceLastVisit} days since ${row.lastService}</small>
        <small>${row.suggestedMessage}</small>
        <div class="ops-actions">
          <button class="btn btn-ghost ops-copy-rebooking" type="button" data-message="${row.suggestedMessage.replaceAll('"', "&quot;")}">Copy Prompt</button>
          <button class="btn btn-ghost ops-mark-rebooking" type="button" data-customer-key="${row.customerKey}" data-customer-name="${row.customerName}" data-service="${row.lastService}">Mark Sent</button>
        </div>
      `;
      rebookingPromptList.appendChild(item);
    });
  }
}

function renderCrmSegments() {
  if (!crmSection || !crmSegmentsList) return;
  if (!canManageBusinessModules()) {
    crmSection.style.display = "none";
    return;
  }

  const segments = Array.isArray(crmSegmentsPayload?.segments) ? crmSegmentsPayload.segments : [];
  crmSegmentsList.innerHTML = "";

  if (!segments.length) {
    crmSegmentsList.innerHTML = "<li><small>No CRM segments available yet.</small></li>";
    return;
  }

  segments.forEach((segment) => {
    const leads = Array.isArray(segment?.leads) ? segment.leads : [];
    const firstLead = leads[0] || null;
    const sampleMessage = String(firstLead?.message || "").trim();
    const sampleCustomerKey = String(firstLead?.customerKey || "").trim();
    const sampleCustomerName = String(firstLead?.customerName || "").trim();
    const segmentId = String(segment?.id || "").trim();
    const leadCount = leads.length;
    const listItem = document.createElement("li");
    listItem.innerHTML = `
      <strong>${segment.label || "Segment"}</strong>
      <small>${leadCount} ${leadCount === 1 ? "lead" : "leads"} ready for outreach.</small>
      <small>${sampleMessage || "No recommended message yet."}</small>
      <div class="crm-actions">
        <button class="btn btn-ghost crm-copy-message" type="button" data-segment-id="${segmentId}" data-message="${sampleMessage.replaceAll('"', "&quot;")}">Copy Template</button>
        <button class="btn btn-ghost crm-mark-sent" type="button" data-segment-id="${segmentId}" data-customer-key="${sampleCustomerKey}" data-customer-name="${sampleCustomerName}" data-message="${sampleMessage.replaceAll('"', "&quot;")}" ${
      sampleCustomerKey ? "" : "disabled"
    }>Mark Campaign Sent</button>
        <button class="btn btn-ghost manage-only crm-edit-template" type="button" data-segment-id="${segmentId}" data-message="${sampleMessage.replaceAll('"', "&quot;")}">Edit</button>
        <button class="btn btn-ghost manage-only crm-delete-segment" type="button" data-segment-id="${segmentId}">Delete</button>
      </div>
    `;
    crmSegmentsList.appendChild(listItem);
  });
}

async function loadCrmSegments() {
  if (!canManageBusinessModules()) return;
  const res = await fetch(withManagedBusiness("/api/crm/segments"), { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to load CRM segments.");
  crmSegmentsPayload = data;
  renderCrmSegments();
}

async function sendCrmCampaign(payload) {
  const res = await fetch(withManagedBusiness("/api/crm/campaigns/send"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload || {})
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to save CRM campaign activity.");
  return data;
}

function setCommercialStatus(message, isError = false) {
  if (!commercialStatusNote) return;
  commercialStatusNote.textContent = message || "";
  commercialStatusNote.style.color = isError ? "#ffadb5" : "var(--muted)";
}

function renderCommercialControls() {
  if (!commercialSection || !commercialSummaryCards || !membershipList || !packageList || !giftCardList) return;
  if (!canManageBusinessModules()) {
    commercialSection.style.display = "none";
    return;
  }

  const summary = commercialPayload?.summary || {};
  const memberships = Array.isArray(commercialPayload?.memberships) ? commercialPayload.memberships : [];
  const packages = Array.isArray(commercialPayload?.packages) ? commercialPayload.packages : [];
  const giftCards = Array.isArray(commercialPayload?.giftCards) ? commercialPayload.giftCards : [];

  commercialSummaryCards.innerHTML = "";
  [
    { label: "Active Memberships", value: String(summary.activeMemberships || 0) },
    { label: "Active Packages", value: String(summary.activePackages || 0) },
    { label: "Active Gift Cards", value: String(summary.activeGiftCards || 0) },
    { label: "Outstanding Gift Balance", value: formatMoney(summary.outstandingGiftBalance || 0) }
  ].forEach((card) => {
    const article = document.createElement("article");
    article.innerHTML = `<p>${card.label}</p><strong>${card.value}</strong>`;
    commercialSummaryCards.appendChild(article);
  });

  membershipList.innerHTML = "";
  if (!memberships.length) {
    membershipList.innerHTML = "<li><small>No membership plans yet.</small></li>";
  } else {
      memberships.forEach((plan) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <strong>${plan.name}</strong>
          <small>${formatMoney(plan.price)} / ${plan.billingCycle} (${plan.status})</small>
          <small>${plan.benefits || "No benefits text set."}</small>
          <div class="commercial-actions manage-only">
            <button class="btn btn-ghost commercial-edit-membership" type="button" data-membership-id="${plan.id}">Edit</button>
            <button class="btn btn-ghost commercial-delete-membership" type="button" data-membership-id="${plan.id}">Delete</button>
          </div>
        `;
        membershipList.appendChild(li);
      });
    }

  packageList.innerHTML = "";
  if (!packages.length) {
    packageList.innerHTML = "<li><small>No service packages yet.</small></li>";
  } else {
      packages.forEach((item) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <strong>${item.name}</strong>
          <small>${formatMoney(item.price)} | Sessions: ${item.remainingSessions}/${item.sessionCount}</small>
          <small>Status: ${item.status}</small>
          <div class="commercial-actions manage-only">
            <button class="btn btn-ghost commercial-edit-package" type="button" data-package-id="${item.id}">Edit</button>
            <button class="btn btn-ghost commercial-delete-package" type="button" data-package-id="${item.id}">Delete</button>
          </div>
        `;
        packageList.appendChild(li);
      });
    }

  giftCardList.innerHTML = "";
  if (!giftCards.length) {
    giftCardList.innerHTML = "<li><small>No gift cards issued yet.</small></li>";
  } else {
    giftCards.forEach((gift) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${gift.code} - ${gift.recipientName}</strong>
        <small>Balance: ${formatMoney(gift.remainingBalance)} / ${formatMoney(gift.initialBalance)} (${gift.status})</small>
        <small>Issued: ${formatDateTime(gift.issuedAt)} | Expires: ${gift.expiresAt ? formatDateTime(gift.expiresAt) : "Not set"}</small>
        <div class="commercial-actions">
          <button class="btn btn-ghost commercial-redeem-gift" type="button" data-gift-card-id="${gift.id}" ${
        gift.status === "active" ? "" : "disabled"
      }>Redeem Amount</button>
        </div>
      `;
      giftCardList.appendChild(li);
    });
  }
}

function applyCommercialPayload(data) {
  commercialPayload = {
    memberships: Array.isArray(data?.memberships) ? data.memberships : [],
    packages: Array.isArray(data?.packages) ? data.packages : [],
    giftCards: Array.isArray(data?.giftCards) ? data.giftCards : [],
    summary: data?.summary || null
  };
  renderCommercialControls();
}

async function loadCommercialControls() {
  if (!canManageBusinessModules()) return;
  const res = await fetch(withManagedBusiness("/api/commercial-controls"), { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to load commercial controls.");
  applyCommercialPayload(data);
}

async function upsertMembership(payload) {
  const res = await fetch(withManagedBusiness("/api/commercial-controls/memberships/upsert"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload || {})
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to save membership.");
  applyCommercialPayload(data);
}

async function upsertPackage(payload) {
  const res = await fetch(withManagedBusiness("/api/commercial-controls/packages/upsert"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload || {})
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to save package.");
  applyCommercialPayload(data);
}

async function issueGiftCard(payload) {
  const res = await fetch(withManagedBusiness("/api/commercial-controls/gift-cards/issue"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload || {})
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to issue gift card.");
  applyCommercialPayload(data);
}

async function redeemGiftCard(giftCardId, amount) {
  const res = await fetch(withManagedBusiness(`/api/commercial-controls/gift-cards/${encodeURIComponent(giftCardId)}/redeem`), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ amount })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to redeem gift card.");
  applyCommercialPayload(data);
}

function setRevenueStatus(message, isError = false) {
  if (!revenueStatusNote) return;
  revenueStatusNote.textContent = message || "";
  revenueStatusNote.style.color = isError ? "#ffadb5" : "var(--muted)";
}

function toChannelLabel(channel) {
  return String(channel || "direct")
    .split("_")
    .filter(Boolean)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

function renderRevenueAttribution() {
  if (!revenueAttributionSection || !revenueSummaryCards || !revenueChannelList) return;
  if (!canManageBusinessModules()) {
    revenueAttributionSection.style.display = "none";
    return;
  }
  const summary = revenueAttributionPayload?.summary || {};
  const channels = Array.isArray(revenueAttributionPayload?.channels) ? revenueAttributionPayload.channels : [];

  revenueSummaryCards.innerHTML = "";
  [
    { label: "Attributed Revenue", value: formatMoney(summary.totalRevenue || 0) },
    { label: "Channel Spend", value: formatMoney(summary.totalSpend || 0) },
    {
      label: "Blended ROI",
      value: typeof summary.blendedRoiPercent === "number" ? `${summary.blendedRoiPercent}%` : "n/a"
    },
    { label: "Best Revenue Channel", value: toChannelLabel(summary.bestRevenueChannel || "n/a") }
  ].forEach((card) => {
    const article = document.createElement("article");
    article.innerHTML = `<p>${card.label}</p><strong>${card.value}</strong>`;
    revenueSummaryCards.appendChild(article);
  });

  revenueChannelList.innerHTML = "";
  if (!channels.length) {
    revenueChannelList.innerHTML = "<li><small>No channel data yet.</small></li>";
    return;
  }
  channels.forEach((row) => {
    const roiText = typeof row.roiPercent === "number" ? `${row.roiPercent}%` : "n/a";
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${row.label || toChannelLabel(row.channel)}</strong>
      <small>Bookings: ${row.bookings} | Revenue: ${formatMoney(row.revenue)} | Spend: ${formatMoney(row.spend)}</small>
      <small>ROI: ${roiText} | Share: ${row.sharePercent}% | Cancelled: ${row.cancelledBookings || 0}</small>
      <div class="commercial-actions manage-only">
        <button class="btn btn-ghost revenue-edit-spend" type="button" data-channel="${row.channel}" data-spend="${row.spend}">Edit</button>
        <button class="btn btn-ghost revenue-delete-spend" type="button" data-channel="${row.channel}">Delete</button>
      </div>
    `;
    revenueChannelList.appendChild(li);
  });
}

function applyRevenueAttributionPayload(data) {
  revenueAttributionPayload = data || { channels: [], summary: null };
  renderRevenueAttribution();
}

async function loadRevenueAttribution() {
  if (!canManageBusinessModules()) return;
  const res = await fetch(withManagedBusiness("/api/revenue-attribution"), { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to load revenue attribution.");
  applyRevenueAttributionPayload(data);
}

async function saveRevenueChannelSpend(payload) {
  const res = await fetch(withManagedBusiness("/api/revenue-attribution/spend"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload || {})
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to save channel spend.");
  applyRevenueAttributionPayload(data);
}

function setProfitabilityStatus(message, isError = false) {
  if (!profitStatusNote) return;
  profitStatusNote.textContent = message || "";
  profitStatusNote.style.color = isError ? "#ffadb5" : "var(--muted)";
}

function renderProfitabilitySummary() {
  if (!profitabilitySection || !profitSummaryCards || !profitPayrollList) return;
  if (!canManageBusinessModules()) {
    profitabilitySection.style.display = "none";
    return;
  }
  const summary = profitabilityPayload?.summary || {};
  const payrollEntries = Array.isArray(profitabilityPayload?.payrollEntries) ? profitabilityPayload.payrollEntries : [];
  const fixedCosts = profitabilityPayload?.fixedCosts || {};
  const cogsPercent = Number(profitabilityPayload?.cogsPercent || 0);

  profitSummaryCards.innerHTML = "";
  [
    { label: "Gross Revenue", value: formatMoney(summary.grossRevenue || 0) },
    { label: "Total Costs", value: formatMoney(summary.totalCosts || 0) },
    { label: "Estimated Profit", value: formatMoney(summary.estimatedProfit || 0) },
    {
      label: "Profit Margin",
      value: typeof summary.profitMarginPercent === "number" ? `${summary.profitMarginPercent}%` : "n/a"
    },
    { label: "Break-even Revenue", value: summary.breakevenRevenue === null ? "n/a" : formatMoney(summary.breakevenRevenue) }
  ].forEach((card) => {
    const article = document.createElement("article");
    article.innerHTML = `<p>${card.label}</p><strong>${card.value}</strong>`;
    profitSummaryCards.appendChild(article);
  });

  profitPayrollList.innerHTML = "";
  if (!payrollEntries.length) {
    profitPayrollList.innerHTML = "<li><small>No payroll entries yet. Add payroll to get realistic profit projections.</small><br /><button class='btn btn-ghost' type='button' data-module-jump='profitability' style='margin-top:0.45rem;padding:0.32rem 0.65rem;font-size:0.75rem;'>Open Profitability</button></li>";
  } else {
    payrollEntries.forEach((entry) => {
      const total = Number(entry.hours || 0) * Number(entry.hourlyRate || 0) + Number(entry.bonus || 0);
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${entry.staffName}${entry.role ? ` (${entry.role})` : ""}</strong>
        <small>${entry.hours}h x ${formatMoney(entry.hourlyRate)} + bonus ${formatMoney(entry.bonus || 0)}</small>
        <small>Total payroll cost: ${formatMoney(total)}</small>
        <div class="profit-actions">
          <button class="btn btn-ghost manage-only profit-edit-payroll" type="button" data-entry-id="${entry.id}">Edit</button>
          <button class="btn btn-ghost manage-only profit-remove-payroll" type="button" data-entry-id="${entry.id}">Delete</button>
        </div>
      `;
      profitPayrollList.appendChild(li);
    });
  }

  if (profitRentInput) profitRentInput.value = String(fixedCosts.rent || "");
  if (profitUtilitiesInput) profitUtilitiesInput.value = String(fixedCosts.utilities || "");
  if (profitSoftwareInput) profitSoftwareInput.value = String(fixedCosts.software || "");
  if (profitOtherInput) profitOtherInput.value = String(fixedCosts.other || "");
  if (profitCogsPercentInput) profitCogsPercentInput.value = String(cogsPercent || "");
}

function applyProfitabilityPayload(data) {
  profitabilityPayload = data || { payrollEntries: [], fixedCosts: {}, cogsPercent: 0, summary: null };
  renderProfitabilitySummary();
}

async function loadProfitabilitySummary() {
  if (!canManageBusinessModules()) return;
  const res = await fetch(withManagedBusiness("/api/profitability-summary"), { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to load profitability summary.");
  applyProfitabilityPayload(data);
}

async function upsertPayrollInput(payload) {
  const res = await fetch(withManagedBusiness("/api/profitability/payroll/upsert"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload || {})
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to save payroll entry.");
  applyProfitabilityPayload(data);
}

async function removePayrollInput(entryId) {
  const res = await fetch(withManagedBusiness(`/api/profitability/payroll/${encodeURIComponent(entryId)}`), {
    method: "DELETE",
    headers: headers()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to remove payroll entry.");
  applyProfitabilityPayload(data);
}

async function upsertProfitabilityCosts(payload) {
  const res = await fetch(withManagedBusiness("/api/profitability/costs/upsert"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload || {})
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to save cost inputs.");
  applyProfitabilityPayload(data);
}

function renderAccountingIntegrations() {
  if (!accountingIntegrationsList) return;
  accountingIntegrationsList.innerHTML = "";
  if (!accountingRows.length) {
    accountingIntegrationsList.innerHTML = "<p class='accounting-note'>No providers available.</p>";
    return;
  }

  accountingRows.forEach((row) => {
    const connected = row.status === "connected" || row.connected === true;
    const card = document.createElement("article");
    card.className = `integration-card${connected ? " connected" : ""}`;
    card.innerHTML = `
      <div class="integration-top">
        <strong>${formatProviderLabel(row.provider)}</strong>
        <span class="integration-status ${connected ? "connected" : ""}">
          ${connected ? "Connected" : "Not connected"}
        </span>
      </div>
      <p class="integration-meta">Account: ${row.accountLabel || "Not linked"}</p>
      <p class="integration-meta">Sync mode: ${row.syncMode || "daily"}</p>
      <p class="integration-meta">Last updated: ${formatDateTime(row.updatedAt || row.connectedAt)}</p>
      <div class="integration-actions">
        ${
          connected
            ? `
                <button class="btn btn-ghost manage-only accounting-edit-provider" type="button" data-provider="${row.provider}" data-account-label="${String(row.accountLabel || "").replaceAll('"', "&quot;")}" data-sync-mode="${row.syncMode || "daily"}">Edit</button>
                <button class="btn btn-ghost manage-only accounting-delete-provider" type="button" data-provider="${row.provider}">Delete</button>
              `
            : `<button class="btn btn-ghost manage-only accounting-connect-provider" type="button" data-provider="${row.provider}">Add</button>`
        }
      </div>
    `;
    accountingIntegrationsList.appendChild(card);
  });
}

async function loadAccountingIntegrations() {
  if (!canManageBusinessModules()) {
    renderAccountingLiveRevenue();
    return;
  }
  const res = await fetch(withManagedBusiness("/api/accounting-integrations"), { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to load accounting integrations.");
  accountingRows = Array.isArray(data.providers) ? data.providers : [];
  renderAccountingIntegrations();
  await loadAccountingLiveRevenue({ silent: true });
  renderBusinessGrowthPanel();
}

async function connectAccountingIntegration(provider, accountLabel, syncMode) {
  const res = await fetch(withManagedBusiness("/api/accounting-integrations/connect"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ provider, accountLabel, syncMode })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to connect provider.");
  accountingRows = Array.isArray(data.providers) ? data.providers : accountingRows;
  renderAccountingIntegrations();
  renderBusinessGrowthPanel();
}

async function disconnectAccountingIntegration(provider) {
  const res = await fetch(withManagedBusiness(`/api/accounting-integrations/${encodeURIComponent(provider)}/disconnect`), {
    method: "POST",
    headers: headers()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to disconnect provider.");
  accountingRows = Array.isArray(data.providers) ? data.providers : accountingRows;
  renderAccountingIntegrations();
  renderBusinessGrowthPanel();
}

async function createBooking(payload) {
  const res = await fetch("/api/bookings", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to create booking.");
  return data.booking;
}

function setupManagedSectionActions() {
  if (!isDashboardManagerRole()) return;

  if (bookingOperationsSection && !document.getElementById("bookingManageRow")) {
    const row = document.createElement("div");
    row.id = "bookingManageRow";
    row.className = "manage-row manage-only";
    row.innerHTML = '<button id="manageAddBooking" class="btn btn-ghost" type="button">Add Booking</button>';
    const heading = bookingOperationsSection.querySelector("h2");
    if (heading?.parentElement) {
      heading.parentElement.insertBefore(row, heading.nextSibling);
    } else {
      bookingOperationsSection.prepend(row);
    }
  }

  if (staffRosterSection && !document.getElementById("staffManageRow")) {
    const row = document.createElement("div");
    row.id = "staffManageRow";
    row.className = "manage-row manage-only";
    row.innerHTML = '<button id="manageAddStaff" class="btn btn-ghost" type="button">Add Staff</button>';
    const heading = staffRosterSection.querySelector("h2");
    if (heading?.parentElement) {
      heading.parentElement.insertBefore(row, heading.nextSibling);
    } else {
      staffRosterSection.prepend(row);
    }
  }

  if (waitlistSection && !document.getElementById("waitlistManageRow")) {
    const row = document.createElement("div");
    row.id = "waitlistManageRow";
    row.className = "manage-row manage-only";
    row.innerHTML = '<button id="manageAddWaitlist" class="btn btn-ghost" type="button">Add Waitlist Entry</button>';
    const heading = waitlistSection.querySelector("h2");
    if (heading?.parentElement) {
      heading.parentElement.insertBefore(row, heading.nextSibling);
    } else {
      waitlistSection.prepend(row);
    }
  }

  if (socialMediaSection && !document.getElementById("socialManageRow")) {
    const row = document.createElement("div");
    row.id = "socialManageRow";
    row.className = "manage-row manage-only";
    row.innerHTML =
      '<button id="manageAddSocialLink" class="btn btn-ghost" type="button">Add Social Link</button><button id="manageClearSocialLinks" class="btn btn-ghost" type="button">Delete All Links</button>';
    const heading = socialMediaSection.querySelector("h2");
    if (heading?.parentElement) {
      heading.parentElement.insertBefore(row, heading.nextSibling);
    } else {
      socialMediaSection.prepend(row);
    }
  }

  if (crmSection && !document.getElementById("crmManageRow")) {
    const row = document.createElement("div");
    row.id = "crmManageRow";
    row.className = "manage-row manage-only";
    row.innerHTML = '<button id="manageAddCrmCampaign" class="btn btn-ghost" type="button">Add Campaign Activity</button>';
    const heading = crmSection.querySelector("h2");
    if (heading?.parentElement) {
      heading.parentElement.insertBefore(row, heading.nextSibling);
    } else {
      crmSection.prepend(row);
    }
  }

  if (commercialSection && !document.getElementById("commercialManageRow")) {
    const row = document.createElement("div");
    row.id = "commercialManageRow";
    row.className = "manage-row manage-only";
    row.innerHTML =
      '<button id="manageAddMembership" class="btn btn-ghost" type="button">Add Membership</button><button id="manageAddPackage" class="btn btn-ghost" type="button">Add Package</button><button id="manageAddGiftCard" class="btn btn-ghost" type="button">Add Gift Card</button>';
    const heading = commercialSection.querySelector("h2");
    if (heading?.parentElement) {
      heading.parentElement.insertBefore(row, heading.nextSibling);
    } else {
      commercialSection.prepend(row);
    }
  }

  if (accountingIntegrationsSection && !document.getElementById("accountingManageRow")) {
    const row = document.createElement("div");
    row.id = "accountingManageRow";
    row.className = "manage-row manage-only";
    row.innerHTML =
      '<button id="manageAddAccountingIntegration" class="btn btn-ghost" type="button">Add Integration</button><button id="manageDisconnectAllAccounting" class="btn btn-ghost" type="button">Delete All Integrations</button>';
    const heading = accountingIntegrationsSection.querySelector("h2");
    if (heading?.parentElement) {
      heading.parentElement.insertBefore(row, heading.nextSibling);
    } else {
      accountingIntegrationsSection.prepend(row);
    }
  }

  if (revenueAttributionSection && !document.getElementById("revenueManageRow")) {
    const row = document.createElement("div");
    row.id = "revenueManageRow";
    row.className = "manage-row manage-only";
    row.innerHTML = '<button id="manageAddRevenueSpend" class="btn btn-ghost" type="button">Add Spend</button>';
    const heading = revenueAttributionSection.querySelector("h2");
    if (heading?.parentElement) {
      heading.parentElement.insertBefore(row, heading.nextSibling);
    } else {
      revenueAttributionSection.prepend(row);
    }
  }

  if (profitabilitySection && !document.getElementById("profitManageRow")) {
    const row = document.createElement("div");
    row.id = "profitManageRow";
    row.className = "manage-row manage-only";
    row.innerHTML =
      '<button id="manageAddPayrollEntry" class="btn btn-ghost" type="button">Add Payroll</button><button id="manageEditCostInputs" class="btn btn-ghost" type="button">Edit Costs</button><button id="manageDeleteCostInputs" class="btn btn-ghost" type="button">Delete Costs</button>';
    const heading = profitabilitySection.querySelector("h2");
    if (heading?.parentElement) {
      heading.parentElement.insertBefore(row, heading.nextSibling);
    } else {
      profitabilitySection.prepend(row);
    }
  }
}

function renderBookings(bookings) {
  bookingsList.innerHTML = "";
  if (!bookings.length) {
    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <strong>No bookings yet.</strong><br />
        <small style="color:var(--muted);">Try the AI receptionist flow or share your booking link to get your first appointment.</small>
      </div>
      <div style="margin-top:0.45rem;">
        <button class="btn btn-ghost" type="button" data-module-jump="frontdesk" style="padding:0.32rem 0.65rem;font-size:0.75rem;">Open Front Desk</button>
      </div>
    `;
    bookingsList.appendChild(li);
    return;
  }
  bookings.forEach((b) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div>${b.customerName} - ${b.service} on ${b.date} at ${b.time} (${b.status})</div>
      <div style="margin-top:0.4rem;display:flex;gap:0.4rem;">
        <button class="btn btn-ghost manage-only cancel-booking" data-id="${b.id}" ${b.status === "cancelled" ? "disabled" : ""}>Delete</button>
        <button class="btn btn-ghost manage-only reschedule-booking" data-id="${b.id}" ${b.status === "cancelled" ? "disabled" : ""}>Edit</button>
      </div>
    `;
    bookingsList.appendChild(li);
  });
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function getFilteredBookings() {
  const query = normalizeText(bookingSearch?.value);
  const statusFilter = normalizeText(bookingStatus?.value || "all");
  const sortMode = normalizeText(bookingSort?.value || "newest");

  let rows = bookingRows.slice();
  if (statusFilter !== "all") {
    rows = rows.filter((b) => normalizeText(b.status) === statusFilter);
  }
  if (query) {
    rows = rows.filter((b) => {
      const blob = [
        b.customerName,
        b.service,
        b.date,
        b.time,
        b.status,
        b.businessName
      ]
        .map((v) => normalizeText(v))
        .join(" ");
      return blob.includes(query);
    });
  }

  if (sortMode === "oldest") {
    rows.sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""));
  } else if (sortMode === "status") {
    rows.sort((a, b) => normalizeText(a.status).localeCompare(normalizeText(b.status)));
  } else {
    rows.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  }

  return rows;
}

function applyBookingFilters() {
  const filtered = getFilteredBookings();
  renderBookings(filtered);
  if (bookingsCountLabel) {
    bookingsCountLabel.textContent = `Showing ${filtered.length} of ${bookingRows.length} loaded bookings`;
  }
  refreshCustomerDashboard();
}

function setActiveStatusChip(status) {
  if (!statusChips) return;
  const chips = Array.from(statusChips.querySelectorAll(".status-chip"));
  chips.forEach((chip) => {
    const chipStatus = chip.getAttribute("data-status");
    chip.classList.toggle("active", chipStatus === status);
  });
}

async function cancelBooking(bookingId) {
  if (isMockMode) {
    bookingRows = bookingRows.map((row) => (row.id === bookingId ? { ...row, status: "cancelled" } : row));
    return;
  }
  const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
    method: "PATCH",
    headers: headers()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to cancel booking.");
}

async function rescheduleBooking(bookingId) {
  const values = await openManageForm({
    title: "Edit Booking",
    submitLabel: "Save",
    fields: [
      { id: "date", label: "New Date", type: "date", required: true },
      { id: "time", label: "New Time", type: "time", required: true }
    ]
  });
  if (!values) return;

  if (isMockMode) {
    bookingRows = bookingRows.map((row) =>
      row.id === bookingId ? { ...row, date: values.date.trim(), time: values.time.trim() } : row
    );
    return;
  }

  const res = await fetch(`/api/bookings/${bookingId}/reschedule`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ date: values.date.trim(), time: values.time.trim() })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to reschedule booking.");
}

async function loadAdminBusinessOptions() {
  if (user.role !== "admin") return;
  const res = await fetch("/api/admin/businesses", { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to load businesses.");
  const rows = Array.isArray(data.businesses) ? data.businesses : [];
  adminBusinessOptions = rows;
  if (!adminBusinessSelect) return;

  adminBusinessSelect.innerHTML = "";
  rows.forEach((business) => {
    const option = document.createElement("option");
    option.value = String(business.id || "");
    const location = [business.city, business.country].filter(Boolean).join(", ");
    option.textContent = location ? `${business.name} (${location})` : String(business.name || "Unnamed business");
    adminBusinessSelect.appendChild(option);
  });

  if (!rows.length) {
    managedBusinessId = "";
    setAdminBusinessStatus("No businesses available.", true);
    return;
  }

  const selected =
    rows.find((business) => business.id === managedBusinessId)?.id ||
    rows.find((business) => business.id === adminBusinessParam)?.id ||
    rows[0].id;

  managedBusinessId = String(selected || "").trim();
  adminBusinessSelect.value = managedBusinessId;
  syncAdminBusinessQueryParam();
  setAdminBusinessStatus(`Viewing ${rows.find((business) => business.id === managedBusinessId)?.name || "selected business"}.`);
}

async function reloadAdminManagedDashboard() {
  if (user.role !== "admin") return;
  metricsGrid.innerHTML = "";
  nextBookingsCursor = null;
  updateLoadMoreState(false);
  setAdminBusinessStatus("Loading business dashboard...");
  if (adminBusinessSelect) adminBusinessSelect.disabled = true;
  try {
    const tasks = [
      loadMetrics(),
      loadBookings({ append: false }),
      loadBillingSummary(),
      loadBusinessProfile(),
      loadSocialMediaLinks(),
      loadAccountingIntegrations(),
      loadStaffRoster(),
      loadWaitlist(),
      loadCrmSegments(),
      loadCommercialControls(),
      loadRevenueAttribution(),
      loadProfitabilitySummary()
    ];
    const settled = await Promise.allSettled(tasks);
    const hasError = settled.some((result) => result.status === "rejected");
    if (hasError) {
      setAdminBusinessStatus("Loaded with some errors. Check module status notes.", true);
      return;
    }
    const selectedName = adminBusinessOptions.find((business) => business.id === managedBusinessId)?.name;
    setAdminBusinessStatus(`Viewing ${selectedName || "selected business"}.`);
  } finally {
    if (adminBusinessSelect) adminBusinessSelect.disabled = false;
  }
}

async function loadMetrics() {
  if (user.role === "admin") {
    const adminRes = await fetch("/api/dashboard/admin", { headers: headers() });
    const adminData = await adminRes.json();
    if (!adminRes.ok) throw new Error(adminData.error || "Unable to load dashboard metrics.");
    Object.entries(adminData.analytics || {}).forEach(([k, v]) => addMetric(k, v));

    if (!managedBusinessId) {
      subscriberCommandCenter = null;
      operationsInsights = null;
      renderCommandCenter();
      renderOperationsInsights();
      return;
    }

    const managedRes = await fetch(withManagedBusiness("/api/dashboard/subscriber"), { headers: headers() });
    const managedData = await managedRes.json();
    if (!managedRes.ok) throw new Error(managedData.error || "Unable to load managed business metrics.");
    subscriberCommandCenter = managedData.commandCenter || null;
    renderCommandCenter();
    operationsInsights = managedData.operationsInsights || null;
    renderOperationsInsights();
    return;
  }

  const endpoint = `/api/dashboard/${user.role}`;
  const res = await fetch(endpoint, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to load dashboard metrics.");
  const analytics = data.analytics || {};
  if (user.role === "subscriber") {
    subscriberCommandCenter = data.commandCenter || null;
    renderCommandCenter();
    operationsInsights = data.operationsInsights || null;
    renderOperationsInsights();
  }
  Object.entries(analytics).forEach(([k, v]) => addMetric(k, v));
}

async function loadBillingSummary() {
  if (!(user.role === "subscriber" || user.role === "admin")) return;
  const res = await fetch(withManagedBusiness("/api/billing/subscriber-summary"), { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to load billing summary.");
  billingSummary = data || null;
}

function updateLoadMoreState(isLoading = false) {
  if (!loadMoreBookingsBtn) return;
  if (nextBookingsCursor) {
    loadMoreBookingsBtn.style.display = "inline-flex";
    loadMoreBookingsBtn.disabled = isLoading;
    loadMoreBookingsBtn.textContent = isLoading ? "Loading..." : "Load More";
  } else {
    loadMoreBookingsBtn.style.display = "none";
  }
}

async function loadBookings({ append = false } = {}) {
  const params = new URLSearchParams({ limit: "50" });
  if (user.role === "admin" && managedBusinessId) {
    params.set("businessId", managedBusinessId);
  }
  if (append && nextBookingsCursor) params.set("cursor", nextBookingsCursor);
  const res = await fetch(`/api/me/bookings?${params.toString()}`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to load bookings.");
  const rows = Array.isArray(data.bookings) ? data.bookings : [];
  if (user.role === "admin" && !managedBusinessId) {
    managedBusinessId = String(rows.find((row) => row?.businessId)?.businessId || "").trim();
  }
  bookingRows = append ? bookingRows.concat(rows) : rows;
  nextBookingsCursor = data?.pagination?.nextCursor || null;
  updateLoadMoreState(false);
  applyBookingFilters();
  renderSubscriberCalendar();
  renderBusinessGrowthPanel();
}

async function createCheckout() {
  const billingProvider = String(subscriptionBillingProvider?.value || "stripe").trim().toLowerCase();
  if (billingProvider === "paypal") {
    await createPayPalCheckout();
    return;
  }
  const billingCycle = String(subscriptionBillingCycle?.value || "monthly").trim().toLowerCase();
  const res = await fetch("/api/billing/create-checkout-session", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ billingCycle })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Billing session failed.");
  if (data.url) window.location.href = data.url;
}

async function createPayPalCheckout() {
  const billingCycle = String(subscriptionBillingCycle?.value || "monthly").trim().toLowerCase();
  const res = await fetch("/api/billing/create-paypal-subscription", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ billingCycle })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "PayPal session failed.");
  if (data.url) window.location.href = data.url;
}

async function createPortal() {
  const billingProvider = String(subscriptionBillingProvider?.value || "stripe").trim().toLowerCase();
  if (billingProvider === "paypal") {
    throw new Error("PayPal billing changes are managed in your PayPal account.");
  }
  const res = await fetch("/api/billing/create-portal-session", {
    method: "POST",
    headers: headers()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Portal session failed.");
  if (data.url) window.location.href = data.url;
}

logoutBtn.addEventListener("click", () => {
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  window.location.href = "/auth";
});

startBilling.addEventListener("click", async () => {
  if (isMockMode) {
    setDashActionStatus("Mock mode: billing checkout is disabled.", true);
    return;
  }
  try {
    setDashActionStatus("Opening secure checkout...");
    await createCheckout();
  } catch (error) {
    setDashActionStatus(error.message, true);
  }
});

manageBilling.addEventListener("click", async () => {
  if (isMockMode) {
    setDashActionStatus("Mock mode: billing portal is disabled.", true);
    return;
  }
  try {
    setDashActionStatus("Opening billing portal...");
    await createPortal();
  } catch (error) {
    setDashActionStatus(error.message, true);
  }
});

bookingsList?.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const bookingId = target.getAttribute("data-id");
  if (!bookingId) return;
  if (!isDashboardManagerRole() || !manageModeEnabled) return;

  try {
    if (target.classList.contains("cancel-booking")) {
      const confirmed = await openManageConfirm({
        title: "Delete Booking",
        message: "Cancel this booking?",
        confirmLabel: "Delete"
      });
      if (!confirmed) return;
      await cancelBooking(bookingId);
      showManageToast("Booking deleted.");
    }
    if (target.classList.contains("reschedule-booking")) {
      await rescheduleBooking(bookingId);
      showManageToast("Booking updated.");
    }
    if (isMockMode) {
      applyBookingFilters();
      renderSubscriberCalendar();
      return;
    }
    metricsGrid.innerHTML = "";
    await Promise.all([loadMetrics(), loadBookings({ append: false })]);
  } catch (error) {
    setDashActionStatus(error.message, true);
  }
});

loadMoreBookingsBtn?.addEventListener("click", async () => {
  if (!nextBookingsCursor) return;
  try {
    updateLoadMoreState(true);
    await loadBookings({ append: true });
  } catch (error) {
    updateLoadMoreState(false);
    setDashActionStatus(error.message, true);
  }
});

adminBusinessSelect?.addEventListener("change", async () => {
  if (user.role !== "admin") return;
  const nextBusinessId = String(adminBusinessSelect.value || "").trim();
  if (!nextBusinessId || nextBusinessId === managedBusinessId) return;
  managedBusinessId = nextBusinessId;
  syncAdminBusinessQueryParam();
  await reloadAdminManagedDashboard();
});

manageModeToggle?.addEventListener("click", () => {
  if (!isDashboardManagerRole()) return;
  setManageMode(!manageModeEnabled);
  showManageToast(`Manage Mode ${manageModeEnabled ? "enabled" : "disabled"}.`);
});

uiDensityToggle?.addEventListener("change", () => {
  setUiDensity(uiDensityToggle.value);
});

accountingBookingExportBtn?.addEventListener("click", async () => {
  await runAccountingExport(
    withManagedBusiness("/api/accounting-integrations/export?scope=business&format=csv"),
    accountingBookingExportBtn,
    "Booking accounting CSV exported.",
    { requireManagedBusiness: true }
  );
});

accountingPlatformExportBtn?.addEventListener("click", async () => {
  await runAccountingExport(
    "/api/accounting-integrations/export?scope=platform&format=csv",
    accountingPlatformExportBtn,
    "Platform revenue CSV exported.",
    { requireManagedBusiness: false }
  );
});

accountingTimeframeSwitch?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const timeframe = String(target.getAttribute("data-timeframe") || "").trim().toLowerCase();
  if (!timeframe) return;
  setAccountingTimeframe(timeframe, { reload: true });
});

accountingQfWeek?.addEventListener("click", () => {
  const range = getThisWeekRange();
  setQuickFilterVisualState("week");
  setAccountingLiveRange(range.from, range.to, { reload: true });
});

accountingQfMonth?.addEventListener("click", () => {
  const range = getThisMonthRange();
  setQuickFilterVisualState("month");
  setAccountingLiveRange(range.from, range.to, { reload: true });
});

accountingCustomApply?.addEventListener("click", () => {
  const from = String(accountingCustomFrom?.value || "").trim();
  const to = String(accountingCustomTo?.value || "").trim();
  if (!from || !to) {
    setAccountingLiveNote("Select both start and end dates for custom range.", true);
    return;
  }
  if (from > to) {
    setAccountingLiveNote("Custom range is invalid: start date must be before end date.", true);
    return;
  }
  setQuickFilterVisualState("custom");
  setAccountingLiveRange(from, to, { reload: true });
});

initializeUiDensity();
initializeManageMode();
setupManagedSectionActions();
setAccountingTimeframe(accountingLiveTimeframe, { reload: false });
startAccountingLiveStream();

window.addEventListener("beforeunload", () => {
  if (accountingLiveTimerId) {
    window.clearInterval(accountingLiveTimerId);
    accountingLiveTimerId = null;
  }
});

if (user.role !== "subscriber") {
  if (subscriptionBillingCycle) subscriptionBillingCycle.style.display = "none";
  if (subscriptionBillingProvider) subscriptionBillingProvider.style.display = "none";
  startBilling.style.display = "none";
  manageBilling.style.display = "none";
}
if (user.role !== "subscriber" && user.role !== "admin") {
  hideSection(businessGrowthSection);
  hideSection(businessProfileSection);
  hideSection(socialMediaSection);
  hideSection(accountingIntegrationsSection);
  hideSection(subscriberCommandCenterSection);
  hideSection(staffRosterSection);
  hideSection(waitlistSection);
  hideSection(operationsInsightsSection);
  hideSection(crmSection);
  hideSection(commercialSection);
  hideSection(revenueAttributionSection);
  hideSection(profitabilitySection);
}
if (user.role !== "customer") {
  hideSection(customerSearchSection);
  hideSection(customerReceptionSection);
  hideSection(customerSlotsSection);
  hideSection(customerHistorySection);
  hideSection(customerAnalyticsSection);
}
if (user.role !== "admin") {
  hideSection(accountingPlatformExportBtn);
}
if (user.role === "customer") {
  bookingStatus.value = "all";
  setActiveStatusChip("all");
  hideSection(dashIdentityBlock);
  hideSection(frontDeskSection);
  hideSection(subscriberCalendarSection);
  hideSection(bookingOperationsSection);
  hideSection(metricsGrid);
  hideSection(businessProfileSection);
  hideSection(socialMediaSection);
  hideSection(accountingIntegrationsSection);
  hideSection(subscriberCommandCenterSection);
  hideSection(staffRosterSection);
  hideSection(waitlistSection);
  hideSection(revenueAttributionSection);
  hideSection(profitabilitySection);
  hideSection(adminBusinessScope);
  initializeCustomerExperience();
}
if (user.role !== "subscriber" && user.role !== "admin") {
  bookingSort.value = "newest";
}
initializeModuleNavigator();
renderBusinessGrowthPanel();
document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const trigger = target.closest("[data-module-jump]");
  if (!(trigger instanceof HTMLElement)) return;
  const next = String(trigger.getAttribute("data-module-jump") || "").trim();
  if (!next) return;
  focusModuleByKey(next);
});
bookingSearch?.addEventListener("input", applyBookingFilters);
bookingStatus?.addEventListener("change", () => {
  setActiveStatusChip(bookingStatus.value);
  applyBookingFilters();
});
bookingSort?.addEventListener("change", applyBookingFilters);

customerSearchForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  runCustomerSalonSearch();
});

customerSearchReset?.addEventListener("click", () => {
  if (customerSearchQuery) customerSearchQuery.value = "";
  if (customerSearchService) customerSearchService.value = "";
  if (customerSearchBusinessType) customerSearchBusinessType.value = "";
  if (customerSearchLocation) customerSearchLocation.value = "";
  if (customerSearchRating) customerSearchRating.value = "";
  if (customerSearchDate) customerSearchDate.value = "";
  runCustomerSalonSearch();
});

customerSearchResults?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (!target.classList.contains("customer-select-salon")) return;
  const salonId = String(target.getAttribute("data-salon-id") || "").trim();
  if (!salonId) return;
  selectedCustomerSalonId = salonId;
  renderCustomerSearchResults();
  renderCustomerSelectedSalon();
});

customerReceptionForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = String(customerReceptionInput?.value || "").trim();
  if (!text) return;
  customerReceptionTranscript.push({ role: "user", text });
  customerReceptionTranscript.push({ role: "ai", text: getReceptionReply(text) });
  if (customerReceptionInput) customerReceptionInput.value = "";
  renderCustomerReceptionChat();
});

document.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (!isDashboardManagerRole() || !manageModeEnabled) return;

  if (target.id === "manageAddBooking") {
    const businessId = String(managedBusinessId || user.businessId || "").trim();
    if (!businessId) {
      showManageToast("No business selected for booking creation.", "error");
      return;
    }
    const values = await openManageForm({
      title: "Add Booking",
      submitLabel: "Create Booking",
      fields: [
        { id: "customerName", label: "Customer Name", required: true },
        { id: "customerPhone", label: "Customer Phone", required: true, placeholder: "+12025550111" },
        { id: "customerEmail", label: "Customer Email" },
        { id: "service", label: "Service", required: true },
        { id: "date", label: "Date", type: "date", required: true },
        { id: "time", label: "Time", type: "time", required: true }
      ]
    });
    if (!values) return;
    try {
      await createBooking({ businessId, ...values });
      await loadBookings({ append: false });
      if (user.role !== "customer") {
        metricsGrid.innerHTML = "";
        await loadMetrics();
      }
      showManageToast("Booking created.");
    } catch (error) {
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.id === "manageAddStaff") {
    const values = await openManageForm({
      title: "Add Staff Member",
      submitLabel: "Save Staff",
      fields: [
        { id: "name", label: "Name", required: true },
        { id: "role", label: "Role", value: "stylist" },
        { id: "availability", label: "Availability", value: "on_duty" },
        { id: "shiftDays", label: "Shift Days (comma-separated)" }
      ]
    });
    if (!values) return;
    try {
      await upsertStaffMember({
        name: values.name,
        role: values.role,
        availability: values.availability,
        shiftDays: String(values.shiftDays || "")
          .split(",")
          .map((value) => String(value || "").trim().toLowerCase())
          .filter(Boolean)
      });
      showManageToast("Staff member added.");
    } catch (error) {
      setStaffStatus(error.message, true);
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.id === "manageAddWaitlist") {
    const values = await openManageForm({
      title: "Add Waitlist Entry",
      submitLabel: "Save Entry",
      fields: [
        { id: "customerName", label: "Customer Name", required: true },
        { id: "customerPhone", label: "Customer Phone" },
        { id: "customerEmail", label: "Customer Email" },
        { id: "service", label: "Service Preference" },
        { id: "preferredDate", label: "Preferred Date", type: "date" },
        { id: "preferredTime", label: "Preferred Time", type: "time" }
      ]
    });
    if (!values) return;
    try {
      await upsertWaitlistEntry({
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        customerEmail: String(values.customerEmail || "").toLowerCase(),
        service: values.service,
        preferredDate: values.preferredDate,
        preferredTime: values.preferredTime
      });
      showManageToast("Waitlist entry added.");
    } catch (error) {
      setWaitlistStatus(error.message, true);
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.id === "manageAddSocialLink") {
    const values = await openManageForm({
      title: "Add Social Link",
      submitLabel: "Add Link",
      fields: [
        { id: "label", label: "Platform", value: "Facebook" },
        { id: "link", label: "Profile URL", required: true }
      ]
    });
    if (!values) return;
    const label = String(values.label || "").trim().toLowerCase();
    const link = String(values.link || "").trim();
    if (!link) return;
    const payload = collectSocialMediaPayloadFromInputs();
    const fieldByLabel = {
      facebook: "socialFacebook",
      instagram: "socialInstagram",
      twitter: "socialTwitter",
      linkedin: "socialLinkedin",
      tiktok: "socialTiktok",
      other: "customSocial"
    };
    const key = fieldByLabel[label] || "customSocial";
    payload[key] = link;
    try {
      await saveSocialMediaLinks(payload);
      showManageToast("Social link added.");
    } catch (error) {
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.id === "manageClearSocialLinks") {
    const confirmed = await openManageConfirm({
      title: "Delete Social Links",
      message: "Remove all social links and image?",
      confirmLabel: "Delete"
    });
    if (!confirmed) return;
    try {
      await saveSocialMediaLinks({
        socialFacebook: "",
        socialInstagram: "",
        socialTwitter: "",
        socialLinkedin: "",
        socialTiktok: "",
        customSocial: "",
        socialImageUrl: ""
      });
      showManageToast("Social links deleted.");
    } catch (error) {
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.classList.contains("social-edit-link")) {
    const key = String(target.getAttribute("data-social-key") || "").trim();
    if (!key) return;
    const current = String(target.getAttribute("data-social-value") || "").trim();
    const values = await openManageForm({
      title: "Edit Social Link",
      submitLabel: "Save",
      fields: [{ id: "url", label: "Profile URL", required: true, value: current }]
    });
    if (!values) return;
    const next = String(values.url || "").trim();
    if (!next) return;
    const payload = collectSocialMediaPayloadFromInputs();
    payload[key] = next;
    try {
      await saveSocialMediaLinks(payload);
      showManageToast("Social link updated.");
    } catch (error) {
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.classList.contains("social-delete-link")) {
    const confirmed = await openManageConfirm({
      title: "Delete Social Link",
      message: "Remove this social link?",
      confirmLabel: "Delete"
    });
    if (!confirmed) return;
    const key = String(target.getAttribute("data-social-key") || "").trim();
    if (!key) return;
    const payload = collectSocialMediaPayloadFromInputs();
    payload[key] = "";
    try {
      await saveSocialMediaLinks(payload);
      showManageToast("Social link deleted.");
    } catch (error) {
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.classList.contains("social-clear-image")) {
    const confirmed = await openManageConfirm({
      title: "Delete Social Image",
      message: "Remove social profile image?",
      confirmLabel: "Delete"
    });
    if (!confirmed) return;
    const payload = collectSocialMediaPayloadFromInputs();
    payload.socialImageUrl = "";
    try {
      await saveSocialMediaLinks(payload);
      showManageToast("Social image deleted.");
    } catch (error) {
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.id === "manageAddCrmCampaign") {
    const values = await openManageForm({
      title: "Add CRM Campaign Activity",
      submitLabel: "Save",
      fields: [
        { id: "segmentId", label: "Segment ID", required: true, value: "high_value_lapsed" },
        { id: "customerKey", label: "Customer Key", required: true },
        { id: "customerName", label: "Customer Name" },
        { id: "message", label: "Campaign Message", type: "textarea", required: true }
      ]
    });
    if (!values) return;
    const segmentId = String(values.segmentId || "").trim();
    const customerKey = String(values.customerKey || "").trim();
    const customerName = String(values.customerName || "").trim();
    const message = String(values.message || "").trim();
    if (!segmentId || !customerKey || !message) return;
    try {
      setCrmStatus("Saving campaign activity...");
      await sendCrmCampaign({ segmentId, customerKey, customerName, message, channel: "manual" });
      setCrmStatus("Campaign activity saved.");
      showManageToast("CRM campaign activity added.");
    } catch (error) {
      setCrmStatus(error.message, true);
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.classList.contains("crm-edit-template")) {
    const segmentId = String(target.getAttribute("data-segment-id") || "").trim();
    const currentMessage = String(target.getAttribute("data-message") || "").trim();
    if (!segmentId) return;
    const values = await openManageForm({
      title: "Edit CRM Template",
      submitLabel: "Save",
      fields: [{ id: "message", label: "Template Message", type: "textarea", required: true, value: currentMessage }]
    });
    if (!values) return;
    const nextMessage = String(values.message || "").trim();
    if (!nextMessage) return;
    const segments = Array.isArray(crmSegmentsPayload?.segments) ? crmSegmentsPayload.segments : [];
    const segment = segments.find((row) => String(row?.id || "") === segmentId);
    if (!segment) return;
    const leads = Array.isArray(segment.leads) ? segment.leads.slice() : [];
    if (!leads.length) {
      leads.push({ customerKey: "", customerName: "", message: nextMessage });
    } else {
      leads[0] = { ...leads[0], message: nextMessage };
    }
    segment.leads = leads;
    renderCrmSegments();
    setCrmStatus("Template updated in this session.");
    showManageToast("CRM template updated.");
    return;
  }

  if (target.classList.contains("crm-delete-segment")) {
    const confirmed = await openManageConfirm({
      title: "Delete CRM Segment",
      message: "Remove this segment from dashboard view?",
      confirmLabel: "Delete"
    });
    if (!confirmed) return;
    const segmentId = String(target.getAttribute("data-segment-id") || "").trim();
    if (!segmentId) return;
    const segments = Array.isArray(crmSegmentsPayload?.segments) ? crmSegmentsPayload.segments : [];
    crmSegmentsPayload = {
      ...(crmSegmentsPayload || {}),
      segments: segments.filter((row) => String(row?.id || "") !== segmentId)
    };
    renderCrmSegments();
    setCrmStatus("Segment removed from dashboard view.");
    showManageToast("CRM segment deleted.");
    return;
  }

  if (target.id === "manageAddMembership") {
    const values = await openManageForm({
      title: "Add Membership",
      submitLabel: "Save",
      fields: [
        { id: "name", label: "Membership Name", required: true },
        { id: "price", label: "Price", type: "number", required: true, value: "0" },
        { id: "billingCycle", label: "Billing Cycle", value: "monthly" },
        { id: "benefits", label: "Benefits" }
      ]
    });
    if (!values) return;
    const name = String(values.name || "").trim();
    const price = Number(values.price || 0);
    const billingCycle = String(values.billingCycle || "monthly").trim();
    const benefits = String(values.benefits || "").trim();
    try {
      setCommercialStatus("Saving membership...");
      await upsertMembership({ name, price, billingCycle, benefits, status: "active" });
      setCommercialStatus("Membership saved.");
      showManageToast("Membership added.");
    } catch (error) {
      setCommercialStatus(error.message, true);
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.id === "manageAddPackage") {
    const values = await openManageForm({
      title: "Add Package",
      submitLabel: "Save",
      fields: [
        { id: "name", label: "Package Name", required: true },
        { id: "price", label: "Price", type: "number", required: true, value: "0" },
        { id: "sessionCount", label: "Session Count", type: "number", required: true, value: "1" }
      ]
    });
    if (!values) return;
    const name = String(values.name || "").trim();
    const price = Number(values.price || 0);
    const sessionCount = Number(values.sessionCount || 1);
    try {
      setCommercialStatus("Saving package...");
      await upsertPackage({ name, price, sessionCount, status: "active" });
      setCommercialStatus("Package saved.");
      showManageToast("Package added.");
    } catch (error) {
      setCommercialStatus(error.message, true);
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.id === "manageAddGiftCard") {
    const values = await openManageForm({
      title: "Issue Gift Card",
      submitLabel: "Issue",
      fields: [
        { id: "purchaserName", label: "Purchaser Name", required: true },
        { id: "recipientName", label: "Recipient Name", required: true },
        { id: "initialBalance", label: "Initial Balance", type: "number", required: true, value: "0" },
        { id: "expiresAt", label: "Expiry Date", type: "date" }
      ]
    });
    if (!values) return;
    const purchaserName = String(values.purchaserName || "").trim();
    const recipientName = String(values.recipientName || "").trim();
    const initialBalance = Number(values.initialBalance || 0);
    const expiresAt = String(values.expiresAt || "").trim();
    if (!purchaserName || !recipientName || !Number.isFinite(initialBalance) || initialBalance <= 0) return;
    try {
      setCommercialStatus("Issuing gift card...");
      await issueGiftCard({ purchaserName, recipientName, initialBalance, expiresAt });
      setCommercialStatus("Gift card issued.");
      showManageToast("Gift card issued.");
    } catch (error) {
      setCommercialStatus(error.message, true);
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.classList.contains("commercial-edit-membership")) {
    const membershipId = String(target.getAttribute("data-membership-id") || "").trim();
    if (!membershipId) return;
    const memberships = Array.isArray(commercialPayload?.memberships) ? commercialPayload.memberships : [];
    const membership = memberships.find((row) => String(row?.id || "") === membershipId);
    if (!membership) return;
    const values = await openManageForm({
      title: "Edit Membership",
      submitLabel: "Save",
      fields: [
        { id: "name", label: "Membership Name", required: true, value: membership.name || "" },
        { id: "price", label: "Price", type: "number", required: true, value: String(membership.price || 0) },
        { id: "billingCycle", label: "Billing Cycle", value: membership.billingCycle || "monthly" },
        { id: "benefits", label: "Benefits", value: membership.benefits || "" }
      ]
    });
    if (!values) return;
    const name = String(values.name || "").trim();
    const price = Number(values.price || 0);
    const billingCycle = String(values.billingCycle || "monthly").trim();
    const benefits = String(values.benefits || "").trim();
    try {
      setCommercialStatus("Updating membership...");
      await upsertMembership({ id: membershipId, name, price, billingCycle, benefits, status: membership.status || "active" });
      setCommercialStatus("Membership updated.");
      showManageToast("Membership updated.");
    } catch (error) {
      setCommercialStatus(error.message, true);
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.classList.contains("commercial-delete-membership")) {
    const confirmed = await openManageConfirm({
      title: "Delete Membership",
      message: "Set this membership to inactive?",
      confirmLabel: "Delete"
    });
    if (!confirmed) return;
    const membershipId = String(target.getAttribute("data-membership-id") || "").trim();
    if (!membershipId) return;
    const memberships = Array.isArray(commercialPayload?.memberships) ? commercialPayload.memberships : [];
    const membership = memberships.find((row) => String(row?.id || "") === membershipId);
    if (!membership) return;
    try {
      setCommercialStatus("Deactivating membership...");
      await upsertMembership({
        id: membershipId,
        name: membership.name,
        price: Number(membership.price || 0),
        billingCycle: membership.billingCycle || "monthly",
        benefits: membership.benefits || "",
        status: "inactive"
      });
      setCommercialStatus("Membership deactivated.");
      showManageToast("Membership deleted.");
    } catch (error) {
      setCommercialStatus(error.message, true);
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.classList.contains("commercial-edit-package")) {
    const packageId = String(target.getAttribute("data-package-id") || "").trim();
    if (!packageId) return;
    const packages = Array.isArray(commercialPayload?.packages) ? commercialPayload.packages : [];
    const packageRow = packages.find((row) => String(row?.id || "") === packageId);
    if (!packageRow) return;
    const values = await openManageForm({
      title: "Edit Package",
      submitLabel: "Save",
      fields: [
        { id: "name", label: "Package Name", required: true, value: packageRow.name || "" },
        { id: "price", label: "Price", type: "number", required: true, value: String(packageRow.price || 0) },
        { id: "sessionCount", label: "Session Count", type: "number", required: true, value: String(packageRow.sessionCount || 1) }
      ]
    });
    if (!values) return;
    const name = String(values.name || "").trim();
    const price = Number(values.price || 0);
    const sessionCount = Number(values.sessionCount || 1);
    try {
      setCommercialStatus("Updating package...");
      await upsertPackage({ id: packageId, name, price, sessionCount, status: packageRow.status || "active" });
      setCommercialStatus("Package updated.");
      showManageToast("Package updated.");
    } catch (error) {
      setCommercialStatus(error.message, true);
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.classList.contains("commercial-delete-package")) {
    const confirmed = await openManageConfirm({
      title: "Delete Package",
      message: "Set this package to inactive?",
      confirmLabel: "Delete"
    });
    if (!confirmed) return;
    const packageId = String(target.getAttribute("data-package-id") || "").trim();
    if (!packageId) return;
    const packages = Array.isArray(commercialPayload?.packages) ? commercialPayload.packages : [];
    const packageRow = packages.find((row) => String(row?.id || "") === packageId);
    if (!packageRow) return;
    try {
      setCommercialStatus("Deactivating package...");
      await upsertPackage({
        id: packageId,
        name: packageRow.name,
        price: Number(packageRow.price || 0),
        sessionCount: Number(packageRow.sessionCount || 1),
        status: "inactive"
      });
      setCommercialStatus("Package deactivated.");
      showManageToast("Package deleted.");
    } catch (error) {
      setCommercialStatus(error.message, true);
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.id === "manageAddAccountingIntegration") {
    const values = await openManageForm({
      title: "Add Accounting Integration",
      submitLabel: "Save",
      fields: [
        { id: "provider", label: "Provider", value: String(accountingProvider?.value || "quickbooks"), required: true },
        { id: "accountLabel", label: "Account Label", value: String(accountingAccountLabel?.value || "Main Ledger"), required: true },
        { id: "syncMode", label: "Sync Mode", value: String(accountingSyncMode?.value || "daily"), required: true }
      ]
    });
    if (!values) return;
    const provider = String(values.provider || "quickbooks").trim().toLowerCase();
    const accountLabel = String(values.accountLabel || "").trim();
    const syncMode = String(values.syncMode || "daily").trim().toLowerCase();
    if (!provider || !accountLabel) return;
    try {
      setAccountingStatus("Linking provider...");
      await connectAccountingIntegration(provider, accountLabel, syncMode);
      setAccountingStatus(`${formatProviderLabel(provider)} linked successfully.`);
      showManageToast("Accounting integration added.");
    } catch (error) {
      setAccountingStatus(error.message, true);
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.id === "manageDisconnectAllAccounting") {
    const confirmed = await openManageConfirm({
      title: "Delete All Integrations",
      message: "Disconnect all connected accounting integrations?",
      confirmLabel: "Delete"
    });
    if (!confirmed) return;
    const connectedProviders = accountingRows
      .filter((row) => row.status === "connected" || row.connected === true)
      .map((row) => String(row.provider || "").trim())
      .filter(Boolean);
    if (!connectedProviders.length) return;
    try {
      for (const provider of connectedProviders) {
        await disconnectAccountingIntegration(provider);
      }
      setAccountingStatus("All integrations disconnected.");
      showManageToast("All accounting integrations deleted.");
    } catch (error) {
      setAccountingStatus(error.message, true);
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.classList.contains("accounting-connect-provider")) {
    const provider = String(target.getAttribute("data-provider") || "").trim();
    if (!provider) return;
    const values = await openManageForm({
      title: "Add Integration",
      submitLabel: "Save",
      fields: [
        { id: "accountLabel", label: "Account Label", value: "Main Ledger", required: true },
        { id: "syncMode", label: "Sync Mode", value: "daily", required: true }
      ]
    });
    if (!values) return;
    const accountLabel = String(values.accountLabel || "").trim();
    const syncMode = String(values.syncMode || "daily").trim().toLowerCase();
    if (!accountLabel) return;
    try {
      setAccountingStatus("Linking provider...");
      await connectAccountingIntegration(provider, accountLabel, syncMode);
      setAccountingStatus(`${formatProviderLabel(provider)} linked successfully.`);
      showManageToast("Accounting integration added.");
    } catch (error) {
      setAccountingStatus(error.message, true);
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.classList.contains("accounting-edit-provider")) {
    const provider = String(target.getAttribute("data-provider") || "").trim();
    if (!provider) return;
    const currentLabel = String(target.getAttribute("data-account-label") || "").trim();
    const currentSync = String(target.getAttribute("data-sync-mode") || "daily").trim();
    const values = await openManageForm({
      title: "Edit Integration",
      submitLabel: "Save",
      fields: [
        { id: "accountLabel", label: "Account Label", value: currentLabel || "Main Ledger", required: true },
        { id: "syncMode", label: "Sync Mode", value: currentSync || "daily", required: true }
      ]
    });
    if (!values) return;
    const accountLabel = String(values.accountLabel || "").trim();
    const syncMode = String(values.syncMode || "daily").trim().toLowerCase();
    if (!accountLabel) return;
    try {
      setAccountingStatus("Updating integration...");
      await connectAccountingIntegration(provider, accountLabel, syncMode);
      setAccountingStatus(`${formatProviderLabel(provider)} updated.`);
      showManageToast("Accounting integration updated.");
    } catch (error) {
      setAccountingStatus(error.message, true);
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.classList.contains("accounting-delete-provider")) {
    const confirmed = await openManageConfirm({
      title: "Delete Integration",
      message: "Disconnect this accounting integration?",
      confirmLabel: "Delete"
    });
    if (!confirmed) return;
    const provider = String(target.getAttribute("data-provider") || "").trim();
    if (!provider) return;
    try {
      setAccountingStatus(`Disconnecting ${formatProviderLabel(provider)}...`);
      await disconnectAccountingIntegration(provider);
      setAccountingStatus(`${formatProviderLabel(provider)} disconnected.`);
      showManageToast("Accounting integration deleted.");
    } catch (error) {
      setAccountingStatus(error.message, true);
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.id === "manageAddRevenueSpend") {
    const values = await openManageForm({
      title: "Add Revenue Spend",
      submitLabel: "Save",
      fields: [
        { id: "channel", label: "Channel", value: "direct", required: true },
        { id: "spend", label: "Spend", type: "number", value: "0", required: true }
      ]
    });
    if (!values) return;
    const channel = String(values.channel || "").trim().toLowerCase();
    const spend = Number(values.spend || 0);
    if (!channel || !Number.isFinite(spend) || spend < 0) return;
    try {
      setRevenueStatus("Saving channel spend...");
      await saveRevenueChannelSpend({ channel, spend });
      setRevenueStatus("Channel spend saved.");
      showManageToast("Revenue spend added.");
    } catch (error) {
      setRevenueStatus(error.message, true);
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.classList.contains("revenue-edit-spend")) {
    const channel = String(target.getAttribute("data-channel") || "").trim().toLowerCase();
    const currentSpend = Number(target.getAttribute("data-spend") || 0);
    if (!channel) return;
    const values = await openManageForm({
      title: "Edit Revenue Spend",
      submitLabel: "Save",
      fields: [{ id: "spend", label: "Spend", type: "number", value: String(currentSpend), required: true }]
    });
    if (!values) return;
    const spend = Number(values.spend || currentSpend);
    if (!Number.isFinite(spend) || spend < 0) return;
    try {
      setRevenueStatus("Updating channel spend...");
      await saveRevenueChannelSpend({ channel, spend });
      setRevenueStatus("Channel spend updated.");
      showManageToast("Revenue spend updated.");
    } catch (error) {
      setRevenueStatus(error.message, true);
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.classList.contains("revenue-delete-spend")) {
    const confirmed = await openManageConfirm({
      title: "Delete Revenue Spend",
      message: "Set this channel spend to zero?",
      confirmLabel: "Delete"
    });
    if (!confirmed) return;
    const channel = String(target.getAttribute("data-channel") || "").trim().toLowerCase();
    if (!channel) return;
    try {
      setRevenueStatus("Removing channel spend...");
      await saveRevenueChannelSpend({ channel, spend: 0 });
      setRevenueStatus("Channel spend removed.");
      showManageToast("Revenue spend deleted.");
    } catch (error) {
      setRevenueStatus(error.message, true);
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.id === "manageAddPayrollEntry") {
    const values = await openManageForm({
      title: "Add Payroll Entry",
      submitLabel: "Save",
      fields: [
        { id: "staffName", label: "Staff Name", required: true },
        { id: "role", label: "Role" },
        { id: "hours", label: "Hours", type: "number", required: true, value: "0" },
        { id: "hourlyRate", label: "Hourly Rate", type: "number", required: true, value: "0" },
        { id: "bonus", label: "Bonus", type: "number", value: "0" }
      ]
    });
    if (!values) return;
    const staffName = String(values.staffName || "").trim();
    if (!staffName) return;
    const role = String(values.role || "").trim();
    const hours = Number(values.hours || 0);
    const hourlyRate = Number(values.hourlyRate || 0);
    const bonus = Number(values.bonus || 0);
    if (![hours, hourlyRate, bonus].every((value) => Number.isFinite(value) && value >= 0)) return;
    try {
      setProfitabilityStatus("Saving payroll entry...");
      await upsertPayrollInput({ staffName, role, hours, hourlyRate, bonus });
      setProfitabilityStatus("Payroll entry saved.");
      showManageToast("Payroll entry added.");
    } catch (error) {
      setProfitabilityStatus(error.message, true);
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.id === "manageEditCostInputs") {
    const values = await openManageForm({
      title: "Edit Cost Inputs",
      submitLabel: "Save",
      fields: [
        { id: "rent", label: "Rent", type: "number", value: String(profitRentInput?.value || 0) },
        { id: "utilities", label: "Utilities", type: "number", value: String(profitUtilitiesInput?.value || 0) },
        { id: "software", label: "Software", type: "number", value: String(profitSoftwareInput?.value || 0) },
        { id: "other", label: "Other Fixed Costs", type: "number", value: String(profitOtherInput?.value || 0) },
        { id: "cogsPercent", label: "COGS %", type: "number", value: String(profitCogsPercentInput?.value || 0) }
      ]
    });
    if (!values) return;
    const rent = Number(values.rent || 0);
    const utilities = Number(values.utilities || 0);
    const software = Number(values.software || 0);
    const other = Number(values.other || 0);
    const cogsPercent = Number(values.cogsPercent || 0);
    if ([rent, utilities, software, other, cogsPercent].some((value) => !Number.isFinite(value) || value < 0) || cogsPercent > 95) return;
    try {
      setProfitabilityStatus("Saving cost inputs...");
      await upsertProfitabilityCosts({ rent, utilities, software, other, cogsPercent });
      setProfitabilityStatus("Cost inputs saved.");
      showManageToast("Cost inputs updated.");
    } catch (error) {
      setProfitabilityStatus(error.message, true);
      showManageToast(error.message, "error");
    }
    return;
  }

  if (target.id === "manageDeleteCostInputs") {
    const confirmed = await openManageConfirm({
      title: "Delete Cost Inputs",
      message: "Reset all cost inputs to zero?",
      confirmLabel: "Delete"
    });
    if (!confirmed) return;
    try {
      setProfitabilityStatus("Removing cost inputs...");
      await upsertProfitabilityCosts({ rent: 0, utilities: 0, software: 0, other: 0, cogsPercent: 0 });
      setProfitabilityStatus("Cost inputs removed.");
      showManageToast("Cost inputs deleted.");
    } catch (error) {
      setProfitabilityStatus(error.message, true);
      showManageToast(error.message, "error");
    }
    return;
  }
});

statusChips?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (!target.classList.contains("status-chip")) return;
  const status = target.getAttribute("data-status");
  if (!status) return;
  bookingStatus.value = status;
  setActiveStatusChip(status);
  applyBookingFilters();
});

commandCenterActions?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (!target.classList.contains("command-action-run")) return;
  const actionId = target.getAttribute("data-action-id");
  runCommandCenterAction(actionId).catch(() => {
    setCommandCenterStatus("Could not run this action right now.", true);
  });
});

calendarPrev?.addEventListener("click", () => {
  calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1);
  renderSubscriberCalendar();
});

calendarNext?.addEventListener("click", () => {
  calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1);
  renderSubscriberCalendar();
});

if (user.role === "subscriber" || user.role === "admin") {
  renderSubscriberCalendar();
}

accountingConnectForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const provider = String(accountingProvider?.value || "").trim();
  const accountLabel = String(accountingAccountLabel?.value || "").trim();
  const syncMode = String(accountingSyncMode?.value || "daily").trim();
  if (!provider || !accountLabel) {
    setAccountingStatus("Provider and account label are required.", true);
    return;
  }
  try {
    setAccountingStatus("Linking provider...");
    await connectAccountingIntegration(provider, accountLabel, syncMode);
    setAccountingStatus(`${formatProviderLabel(provider)} linked successfully.`);
    if (accountingAccountLabel) accountingAccountLabel.value = "";
  } catch (error) {
    setAccountingStatus(error.message, true);
  }
});

accountingIntegrationsList?.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const provider = String(target.getAttribute("data-provider") || "").trim();
  if (!provider) return;

  if (target.classList.contains("prefill-accounting")) {
    if (accountingProvider) accountingProvider.value = provider;
    if (accountingAccountLabel) accountingAccountLabel.focus();
    return;
  }

  if (!target.classList.contains("disconnect-accounting")) return;
  try {
    setAccountingStatus(`Disconnecting ${formatProviderLabel(provider)}...`);
    await disconnectAccountingIntegration(provider);
    setAccountingStatus(`${formatProviderLabel(provider)} disconnected.`);
  } catch (error) {
    setAccountingStatus(error.message, true);
  }
});

staffRosterForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = String(staffNameInput?.value || "").trim();
  const role = String(staffRoleInput?.value || "staff").trim();
  const availability = String(staffAvailabilityInput?.value || "off_duty").trim();
  const shiftDays = parseShiftDaysInput(staffShiftDaysInput?.value || "");
  if (!name) {
    setStaffStatus("Staff name is required.", true);
    return;
  }
  try {
    setStaffStatus("Saving staff member...");
    await upsertStaffMember({ name, role, availability, shiftDays });
    if (staffNameInput) staffNameInput.value = "";
    if (staffShiftDaysInput) staffShiftDaysInput.value = "";
    setStaffStatus("Staff member saved.");
  } catch (error) {
    setStaffStatus(error.message, true);
  }
});

staffRosterList?.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const staffId = String(target.getAttribute("data-id") || "").trim();
  if (!staffId) return;
  if (!isDashboardManagerRole() || !manageModeEnabled) return;
  try {
    if (target.classList.contains("staff-edit")) {
      const member = staffRosterRows.find((row) => String(row.id || "") === staffId);
      if (!member) return;
      const values = await openManageForm({
        title: "Edit Staff Member",
        submitLabel: "Save",
        fields: [
          { id: "name", label: "Name", required: true, value: member.name || "" },
          { id: "role", label: "Role", value: member.role || "staff" },
          { id: "availability", label: "Availability", value: member.availability || "off_duty" },
          {
            id: "shiftDays",
            label: "Shift days comma-separated",
            value: Array.isArray(member.shiftDays) && member.shiftDays.length ? member.shiftDays.join(",") : ""
          }
        ]
      });
      if (!values) return;
      setStaffStatus("Saving staff member...");
      await upsertStaffMember({
        id: staffId,
        name: values.name,
        role: values.role,
        availability: values.availability,
        shiftDays: String(values.shiftDays || "")
          .split(",")
          .map((value) => String(value || "").trim().toLowerCase())
          .filter(Boolean)
      });
      setStaffStatus("Staff member updated.");
      showManageToast("Staff member updated.");
      return;
    }
    if (target.classList.contains("staff-toggle")) {
      const next = String(target.getAttribute("data-next") || "off_duty").trim();
      setStaffStatus("Updating availability...");
      await updateStaffAvailability(staffId, next);
      setStaffStatus("Availability updated.");
      return;
    }
    if (target.classList.contains("staff-remove")) {
      const confirmed = await openManageConfirm({
        title: "Delete Staff Member",
        message: "Remove this staff member?",
        confirmLabel: "Delete"
      });
      if (!confirmed) return;
      setStaffStatus("Removing staff member...");
      await removeStaffMember(staffId);
      setStaffStatus("Staff member removed.");
      showManageToast("Staff member deleted.");
    }
  } catch (error) {
    setStaffStatus(error.message, true);
  }
});

waitlistForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const customerName = String(waitlistNameInput?.value || "").trim();
  const customerPhone = String(waitlistPhoneInput?.value || "").trim();
  const customerEmail = String(waitlistEmailInput?.value || "").trim().toLowerCase();
  const service = String(waitlistServiceInput?.value || "").trim();
  const preferred = parseWaitlistDateTime(waitlistDateInput?.value || "");
  if (!customerName) {
    setWaitlistStatus("Customer name is required.", true);
    return;
  }
  if (!customerPhone && !customerEmail) {
    setWaitlistStatus("Phone or email is required.", true);
    return;
  }
  if (waitlistDateInput?.value && !preferred) {
    setWaitlistStatus("Preferred date/time is invalid. Use a valid date/time.", true);
    return;
  }
  try {
    setWaitlistStatus("Saving waitlist entry...");
    await upsertWaitlistEntry({
      customerName,
      customerPhone,
      customerEmail,
      service,
      preferredDate: preferred?.preferredDate || "",
      preferredTime: preferred?.preferredTime || "",
      notes: ""
    });
    if (waitlistNameInput) waitlistNameInput.value = "";
    if (waitlistPhoneInput) waitlistPhoneInput.value = "";
    if (waitlistEmailInput) waitlistEmailInput.value = "";
    if (waitlistServiceInput) waitlistServiceInput.value = "";
    if (waitlistDateInput) waitlistDateInput.value = "";
    setWaitlistStatus("Waitlist entry saved.");
  } catch (error) {
    setWaitlistStatus(error.message, true);
  }
});

waitlistList?.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const entryId = String(target.getAttribute("data-id") || "").trim();
  if (!entryId) return;
  if (!isDashboardManagerRole() || !manageModeEnabled) return;
  try {
    if (target.classList.contains("waitlist-edit")) {
      const entry = waitlistRows.find((row) => String(row.id || "") === entryId);
      if (!entry) return;
      const values = await openManageForm({
        title: "Edit Waitlist Entry",
        submitLabel: "Save",
        fields: [
          { id: "customerName", label: "Customer Name", required: true, value: entry.customerName || "" },
          { id: "customerPhone", label: "Customer Phone", value: entry.customerPhone || "" },
          { id: "customerEmail", label: "Customer Email", value: entry.customerEmail || "" },
          { id: "service", label: "Service", value: entry.service || "" },
          { id: "preferredDate", label: "Preferred Date", type: "date", value: entry.preferredDate || "" },
          { id: "preferredTime", label: "Preferred Time", type: "time", value: entry.preferredTime || "" }
        ]
      });
      if (!values) return;
      setWaitlistStatus("Saving waitlist entry...");
      await upsertWaitlistEntry({
        id: entryId,
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        customerEmail: String(values.customerEmail || "").toLowerCase(),
        service: values.service,
        preferredDate: values.preferredDate,
        preferredTime: values.preferredTime
      });
      setWaitlistStatus("Waitlist entry updated.");
      showManageToast("Waitlist entry updated.");
      return;
    }
    if (target.classList.contains("waitlist-backfill")) {
      setWaitlistStatus("Marking waitlist entry as contacted...");
      await markWaitlistContacted(entryId);
      setWaitlistStatus("Waitlist entry marked as contacted.");
      return;
    }
    if (target.classList.contains("waitlist-remove")) {
      const confirmed = await openManageConfirm({
        title: "Delete Waitlist Entry",
        message: "Remove this waitlist entry?",
        confirmLabel: "Delete"
      });
      if (!confirmed) return;
      setWaitlistStatus("Removing waitlist entry...");
      await removeWaitlistEntry(entryId);
      setWaitlistStatus("Waitlist entry removed.");
      showManageToast("Waitlist entry deleted.");
    }
  } catch (error) {
    setWaitlistStatus(error.message, true);
  }
});

noShowRiskList?.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (!target.classList.contains("ops-send-reminder")) return;
  const bookingId = String(target.getAttribute("data-booking-id") || "").trim();
  const customerName = String(target.getAttribute("data-customer-name") || "").trim();
  const service = String(target.getAttribute("data-service") || "").trim();
  if (!bookingId) return;
  try {
    setOperationsStatus("Saving reminder activity...");
    await markRebookingPromptSent({ customerKey: `booking:${bookingId}`, customerName, service });
    setOperationsStatus("Reminder activity logged.");
  } catch (error) {
    setOperationsStatus(error.message, true);
  }
});

rebookingPromptList?.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  if (target.classList.contains("ops-copy-rebooking")) {
    const message = String(target.getAttribute("data-message") || "").trim();
    if (!message) return;
    const copied = await writeToClipboard(message);
    setOperationsStatus(copied ? "Rebooking prompt copied to clipboard." : "Clipboard unavailable on this browser.", !copied);
    return;
  }

  if (!target.classList.contains("ops-mark-rebooking")) return;
  const customerKey = String(target.getAttribute("data-customer-key") || "").trim();
  const customerName = String(target.getAttribute("data-customer-name") || "").trim();
  const service = String(target.getAttribute("data-service") || "").trim();
  if (!customerKey) return;
  try {
    setOperationsStatus("Saving rebooking activity...");
    await markRebookingPromptSent({ customerKey, customerName, service });
    setOperationsStatus("Rebooking prompt marked as sent.");
  } catch (error) {
    setOperationsStatus(error.message, true);
  }
});

crmSegmentsList?.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  if (target.classList.contains("crm-copy-message")) {
    const message = String(target.getAttribute("data-message") || "").trim();
    if (!message) return;
    const copied = await writeToClipboard(message);
    setCrmStatus(copied ? "Campaign template copied to clipboard." : "Clipboard unavailable on this browser.", !copied);
    return;
  }

  if (!target.classList.contains("crm-mark-sent")) return;
  const segmentId = String(target.getAttribute("data-segment-id") || "").trim();
  const customerKey = String(target.getAttribute("data-customer-key") || "").trim();
  const customerName = String(target.getAttribute("data-customer-name") || "").trim();
  const message = String(target.getAttribute("data-message") || "").trim();
  if (!segmentId || !customerKey || !message) return;
  try {
    setCrmStatus("Saving campaign activity...");
    await sendCrmCampaign({
      segmentId,
      customerKey,
      customerName,
      message,
      channel: "manual"
    });
    setCrmStatus("Campaign activity marked as sent.");
  } catch (error) {
    setCrmStatus(error.message, true);
  }
});

membershipForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = String(membershipNameInput?.value || "").trim();
  const price = Number(membershipPriceInput?.value || 0);
  const billingCycle = String(membershipCycleInput?.value || "monthly").trim().toLowerCase();
  const benefits = String(membershipBenefitsInput?.value || "").trim();
  if (!name) {
    setCommercialStatus("Membership name is required.", true);
    return;
  }
  if (!Number.isFinite(price) || price < 0) {
    setCommercialStatus("Membership price must be valid.", true);
    return;
  }
  try {
    setCommercialStatus("Saving membership...");
    await upsertMembership({ name, price, billingCycle, benefits, status: "active" });
    if (membershipNameInput) membershipNameInput.value = "";
    if (membershipPriceInput) membershipPriceInput.value = "";
    if (membershipBenefitsInput) membershipBenefitsInput.value = "";
    setCommercialStatus("Membership saved.");
  } catch (error) {
    setCommercialStatus(error.message, true);
  }
});

packageForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = String(packageNameInput?.value || "").trim();
  const price = Number(packagePriceInput?.value || 0);
  const sessionCount = Math.floor(Number(packageSessionsInput?.value || 0));
  if (!name) {
    setCommercialStatus("Package name is required.", true);
    return;
  }
  if (!Number.isFinite(price) || price < 0) {
    setCommercialStatus("Package price must be valid.", true);
    return;
  }
  if (!Number.isInteger(sessionCount) || sessionCount <= 0) {
    setCommercialStatus("Package sessions must be greater than zero.", true);
    return;
  }
  try {
    setCommercialStatus("Saving package...");
    await upsertPackage({ name, price, sessionCount, status: "active" });
    if (packageNameInput) packageNameInput.value = "";
    if (packagePriceInput) packagePriceInput.value = "";
    if (packageSessionsInput) packageSessionsInput.value = "";
    setCommercialStatus("Package saved.");
  } catch (error) {
    setCommercialStatus(error.message, true);
  }
});

giftCardForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const purchaserName = String(giftPurchaserInput?.value || "").trim();
  const recipientName = String(giftRecipientInput?.value || "").trim();
  const initialBalance = Number(giftBalanceInput?.value || 0);
  const expiresAt = String(giftExpiresInput?.value || "").trim();
  if (!purchaserName || !recipientName) {
    setCommercialStatus("Purchaser and recipient names are required.", true);
    return;
  }
  if (!Number.isFinite(initialBalance) || initialBalance <= 0) {
    setCommercialStatus("Gift-card balance must be greater than zero.", true);
    return;
  }
  try {
    setCommercialStatus("Issuing gift card...");
    await issueGiftCard({ purchaserName, recipientName, initialBalance, expiresAt });
    if (giftPurchaserInput) giftPurchaserInput.value = "";
    if (giftRecipientInput) giftRecipientInput.value = "";
    if (giftBalanceInput) giftBalanceInput.value = "";
    if (giftExpiresInput) giftExpiresInput.value = "";
    setCommercialStatus("Gift card issued.");
  } catch (error) {
    setCommercialStatus(error.message, true);
  }
});

giftCardList?.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (!target.classList.contains("commercial-redeem-gift")) return;
  const giftCardId = String(target.getAttribute("data-gift-card-id") || "").trim();
  if (!giftCardId) return;
  const values = await openManageForm({
    title: "Redeem Gift Card",
    submitLabel: "Redeem",
    fields: [{ id: "amount", label: "Redeem Amount", type: "number", required: true, value: "0" }]
  });
  if (!values) return;
  const amount = Number(values.amount || 0);
  if (!Number.isFinite(amount) || amount <= 0) {
    setCommercialStatus("Redeem amount must be greater than zero.", true);
    return;
  }
  try {
    setCommercialStatus("Applying gift-card redemption...");
    await redeemGiftCard(giftCardId, amount);
    setCommercialStatus("Gift-card balance updated.");
    showManageToast("Gift-card balance updated.");
  } catch (error) {
    setCommercialStatus(error.message, true);
    showManageToast(error.message, "error");
  }
});

revenueSpendForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const channel = String(revenueChannelInput?.value || "").trim();
  const spend = Number(revenueSpendInput?.value || 0);
  if (!channel) {
    setRevenueStatus("Channel is required.", true);
    return;
  }
  if (!Number.isFinite(spend) || spend < 0) {
    setRevenueStatus("Spend must be a valid number >= 0.", true);
    return;
  }
  try {
    setRevenueStatus("Saving channel spend...");
    await saveRevenueChannelSpend({ channel, spend });
    if (revenueSpendInput) revenueSpendInput.value = "";
    setRevenueStatus("Channel spend saved.");
  } catch (error) {
    setRevenueStatus(error.message, true);
  }
});

profitPayrollForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const staffName = String(profitStaffNameInput?.value || "").trim();
  const role = String(profitStaffRoleInput?.value || "").trim();
  const hours = Number(profitStaffHoursInput?.value || 0);
  const hourlyRate = Number(profitStaffRateInput?.value || 0);
  const bonus = Number(profitStaffBonusInput?.value || 0);
  if (!staffName) {
    setProfitabilityStatus("Staff name is required.", true);
    return;
  }
  if (!Number.isFinite(hours) || hours < 0 || !Number.isFinite(hourlyRate) || hourlyRate < 0 || !Number.isFinite(bonus) || bonus < 0) {
    setProfitabilityStatus("Payroll values must be valid numbers >= 0.", true);
    return;
  }
  try {
    setProfitabilityStatus("Saving payroll entry...");
    await upsertPayrollInput({ staffName, role, hours, hourlyRate, bonus });
    if (profitStaffNameInput) profitStaffNameInput.value = "";
    if (profitStaffRoleInput) profitStaffRoleInput.value = "";
    if (profitStaffHoursInput) profitStaffHoursInput.value = "";
    if (profitStaffRateInput) profitStaffRateInput.value = "";
    if (profitStaffBonusInput) profitStaffBonusInput.value = "";
    setProfitabilityStatus("Payroll entry saved.");
  } catch (error) {
    setProfitabilityStatus(error.message, true);
  }
});

profitPayrollList?.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const entryId = String(target.getAttribute("data-entry-id") || "").trim();
  if (!entryId) return;
  if (!isDashboardManagerRole() || !manageModeEnabled) return;
  if (!target.classList.contains("profit-remove-payroll") && !target.classList.contains("profit-edit-payroll")) return;
  try {
    if (target.classList.contains("profit-edit-payroll")) {
      const entries = Array.isArray(profitabilityPayload?.payrollEntries) ? profitabilityPayload.payrollEntries : [];
      const entry = entries.find((row) => String(row?.id || "") === entryId);
      if (!entry) return;
      const values = await openManageForm({
        title: "Edit Payroll Entry",
        submitLabel: "Save",
        fields: [
          { id: "staffName", label: "Staff Name", required: true, value: entry.staffName || "" },
          { id: "role", label: "Role", value: entry.role || "" },
          { id: "hours", label: "Hours", type: "number", value: String(entry.hours || 0), required: true },
          { id: "hourlyRate", label: "Hourly Rate", type: "number", value: String(entry.hourlyRate || 0), required: true },
          { id: "bonus", label: "Bonus", type: "number", value: String(entry.bonus || 0) }
        ]
      });
      if (!values) return;
      const hours = Number(values.hours || 0);
      const hourlyRate = Number(values.hourlyRate || 0);
      const bonus = Number(values.bonus || 0);
      if (![hours, hourlyRate, bonus].every((value) => Number.isFinite(value) && value >= 0)) return;
      setProfitabilityStatus("Updating payroll entry...");
      await upsertPayrollInput({
        id: entryId,
        staffName: values.staffName,
        role: values.role,
        hours,
        hourlyRate,
        bonus
      });
      setProfitabilityStatus("Payroll entry updated.");
      showManageToast("Payroll entry updated.");
      return;
    }
    const confirmed = await openManageConfirm({
      title: "Delete Payroll Entry",
      message: "Remove this payroll entry?",
      confirmLabel: "Delete"
    });
    if (!confirmed) return;
    setProfitabilityStatus("Removing payroll entry...");
    await removePayrollInput(entryId);
    setProfitabilityStatus("Payroll entry removed.");
    showManageToast("Payroll entry deleted.");
  } catch (error) {
    setProfitabilityStatus(error.message, true);
  }
});

profitCostsForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const rent = Number(profitRentInput?.value || 0);
  const utilities = Number(profitUtilitiesInput?.value || 0);
  const software = Number(profitSoftwareInput?.value || 0);
  const other = Number(profitOtherInput?.value || 0);
  const cogsPercent = Number(profitCogsPercentInput?.value || 0);
  const values = [rent, utilities, software, other, cogsPercent];
  if (values.some((value) => !Number.isFinite(value) || value < 0)) {
    setProfitabilityStatus("Cost values must be valid numbers >= 0.", true);
    return;
  }
  if (cogsPercent > 95) {
    setProfitabilityStatus("COGS percent must be 95 or less.", true);
    return;
  }
  try {
    setProfitabilityStatus("Saving cost inputs...");
    await upsertProfitabilityCosts({ rent, utilities, software, other, cogsPercent });
    setProfitabilityStatus("Cost inputs saved.");
  } catch (error) {
    setProfitabilityStatus(error.message, true);
  }
});

function loadMockDashboard() {
  const now = new Date();
  const thisMonth = now.getMonth() + 1;
  const year = now.getFullYear();
  const mm = String(thisMonth).padStart(2, "0");

  metricsGrid.innerHTML = "";
  addMetric("monthlyBookings", "128");
  addMetric("monthlyRevenue", "$14,920");
  addMetric("noShowRate", "3.6%");
  addMetric("repeatClientRate", "62%");

  bookingRows = [
    { id: "b1", customerName: "Ava Thompson", service: "Balayage + Toner", date: `${year}-${mm}-06`, time: "10:30", status: "confirmed", businessName: "Lumen Studio", createdAt: `${year}-${mm}-01T10:30:00Z` },
    { id: "b2", customerName: "Daniel Ruiz", service: "Skin Fade", date: `${year}-${mm}-08`, time: "14:00", status: "completed", businessName: "Lumen Studio", createdAt: `${year}-${mm}-02T11:00:00Z` },
    { id: "b3", customerName: "Priya Nair", service: "Blowout", date: `${year}-${mm}-12`, time: "16:15", status: "confirmed", businessName: "Lumen Studio", createdAt: `${year}-${mm}-03T12:00:00Z` },
    { id: "b4", customerName: "Mason Lee", service: "Beard Trim", date: `${year}-${mm}-15`, time: "09:45", status: "cancelled", businessName: "Lumen Studio", createdAt: `${year}-${mm}-04T12:10:00Z` },
    { id: "b5", customerName: "Chloe Martin", service: "Keratin Treatment", date: `${year}-${mm}-21`, time: "13:30", status: "confirmed", businessName: "Lumen Studio", createdAt: `${year}-${mm}-05T13:20:00Z` }
  ];
  nextBookingsCursor = null;
  updateLoadMoreState(false);
  applyBookingFilters();
  renderSubscriberCalendar();

  accountingRows = [
    { provider: "quickbooks", status: "connected", connected: true, accountLabel: "Main Ledger", syncMode: "daily", updatedAt: new Date(now.getTime() - 86400000).toISOString() },
    { provider: "xero", status: "not_connected", connected: false, accountLabel: "", syncMode: "weekly", updatedAt: null },
    { provider: "freshbooks", status: "not_connected", connected: false, accountLabel: "", syncMode: "manual", updatedAt: null }
  ];
  renderAccountingIntegrations();
  setAccountingStatus("Mock data loaded.");
  accountingLivePayload = {
    timeframe: accountingLiveTimeframe,
    generatedAt: new Date().toISOString(),
    refreshIntervalSec: 15,
    cards: {
      todayRevenue: 1860,
      todayCancelledRevenue: 190,
      todayBookings: 14,
      todayCancellations: 2,
      lastHourRevenue: 340,
      last15MinRevenue: 110,
      lastHourBookings: 3
    },
    gauges: {
      dailyTarget: 2500,
      targetProgressPct: 74.4,
      cancellationRatePct: 14.3
    },
    stream: {
      hourly: [
        { label: "9 AM", revenue: 180, cancellations: 0 },
        { label: "10 AM", revenue: 260, cancellations: 1 },
        { label: "11 AM", revenue: 320, cancellations: 0 },
        { label: "12 PM", revenue: 210, cancellations: 1 },
        { label: "1 PM", revenue: 410, cancellations: 0 },
        { label: "2 PM", revenue: 340, cancellations: 0 }
      ],
      weekly: []
    }
  };
  renderAccountingLiveRevenue();
  subscriberCommandCenter = {
    today: {
      totalBookings: 6,
      confirmedBookings: 5,
      estimatedRevenue: 860,
      lastMinuteCancellations: 1
    },
    next7Days: {
      confirmedBookings: 19,
      estimatedRevenue: 3240
    },
    serviceHealth: {
      cancellationRate: 7.2
    },
    recommendedActions: [
      { label: "Fill cancellation gaps", detail: "1 last-minute cancellation today. Offer waitlist slot." },
      { label: "Boost today's demand", detail: "Send same-day campaign to inactive clients." }
    ]
  };
  renderCommandCenter();
  staffRosterRows = [
    { id: "s1", name: "Jordan Miles", role: "stylist", availability: "on_duty", shiftDays: ["mon", "tue", "wed"] },
    { id: "s2", name: "Amira Cole", role: "stylist", availability: "on_duty", shiftDays: ["thu", "fri", "sat"] },
    { id: "s3", name: "Riley West", role: "receptionist", availability: "off_duty", shiftDays: ["mon", "fri"] }
  ];
  staffSummary = {
    totalMembers: 3,
    onDutyCount: 2,
    offDutyCount: 1,
    scheduledTodayCount: 2,
    estimatedChairCapacityToday: 12
  };
  renderStaffSummary();
  renderStaffRoster();
  setStaffStatus("Mock roster loaded.");
  waitlistRows = [
    {
      id: "w1",
      customerName: "Lina Patel",
      customerPhone: "+12025550111",
      customerEmail: "",
      service: "Skin Fade",
      preferredDate: "",
      preferredTime: "",
      status: "waiting"
    },
    {
      id: "w2",
      customerName: "Owen Price",
      customerPhone: "",
      customerEmail: "owen@example.com",
      service: "Blowout",
      preferredDate: "",
      preferredTime: "",
      status: "contacted"
    }
  ];
  waitlistSummary = {
    totalEntries: 2,
    waitingCount: 1,
    contactedCount: 1,
    bookedCount: 0
  };
  renderWaitlistSummary();
  renderWaitlist();
  setWaitlistStatus("Mock waitlist loaded.");
  operationsInsights = {
    noShowRisk: [
      {
        bookingId: "b4",
        customerName: "Mason Lee",
        service: "Beard Trim",
        date: `${year}-${mm}-15`,
        time: "09:45",
        riskScore: 74,
        riskLevel: "high",
        reasons: ["Very short lead time.", "Moderate previous cancellation rate."]
      }
    ],
    rebookingPrompts: [
      {
        customerKey: "email:owen@example.com",
        customerName: "Owen Price",
        lastService: "Blowout",
        daysSinceLastVisit: 36,
        suggestedMessage:
          "Hi Owen Price, it has been 36 days since your Blowout. We have new availability this week and would love to book your next visit."
      }
    ]
  };
  renderOperationsInsights();
  setOperationsStatus("Operations insights loaded.");
  crmSegmentsPayload = {
    summary: {
      totalCustomers: 14,
      actionableLeads: 4
    },
    segments: [
      {
        id: "high_value_lapsed",
        label: "High-Value Lapsed",
        leads: [
          {
            customerKey: "email:ava@example.com",
            customerName: "Ava Thompson",
            message: "Hi Ava Thompson, we miss seeing you. Enjoy a loyalty priority slot this week for your next visit."
          }
        ]
      },
      {
        id: "new_clients_followup",
        label: "New Client Follow-Up",
        leads: [
          {
            customerKey: "email:daniel@example.com",
            customerName: "Daniel Ruiz",
            message:
              "Hi Daniel Ruiz, thanks for visiting us. We would love to welcome you back with a tailored follow-up appointment."
          }
        ]
      }
    ]
  };
  renderCrmSegments();
  setCrmStatus("CRM segments loaded.");
  commercialPayload = {
    memberships: [
      {
        id: "m1",
        name: "Platinum Grooming Club",
        price: 79,
        billingCycle: "monthly",
        status: "active",
        benefits: "2 cuts + priority booking"
      }
    ],
    packages: [
      {
        id: "p1",
        name: "6x Blowout Bundle",
        price: 250,
        sessionCount: 6,
        remainingSessions: 4,
        status: "active"
      }
    ],
    giftCards: [
      {
        id: "g1",
        code: "GIFT-AB12CD34",
        purchaserName: "Lina Patel",
        recipientName: "Owen Price",
        initialBalance: 120,
        remainingBalance: 90,
        status: "active",
        issuedAt: new Date(now.getTime() - 172800000).toISOString(),
        expiresAt: null
      }
    ],
    summary: {
      activeMemberships: 1,
      activePackages: 1,
      activeGiftCards: 1,
      outstandingGiftBalance: 90
    }
  };
  renderCommercialControls();
  setCommercialStatus("Commercial controls loaded.");
  revenueAttributionPayload = {
    channels: [
      {
        channel: "direct",
        label: "Direct",
        bookings: 9,
        cancelledBookings: 1,
        revenue: 1260,
        spend: 120,
        sharePercent: 56.3,
        roiPercent: 950
      },
      {
        channel: "instagram",
        label: "Instagram",
        bookings: 4,
        cancelledBookings: 0,
        revenue: 580,
        spend: 220,
        sharePercent: 25,
        roiPercent: 163.6
      },
      {
        channel: "ai_assistant",
        label: "AI Assistant",
        bookings: 3,
        cancelledBookings: 0,
        revenue: 430,
        spend: 0,
        sharePercent: 18.7,
        roiPercent: null
      }
    ],
    summary: {
      totalRevenue: 2270,
      totalSpend: 340,
      totalAttributedBookings: 16,
      blendedRoiPercent: 567.6,
      bestRevenueChannel: "direct",
      bestRoiChannel: "direct"
    }
  };
  renderRevenueAttribution();
  setRevenueStatus("Revenue attribution loaded.");
  profitabilityPayload = {
    payrollEntries: [
      {
        id: "pr1",
        staffName: "Jordan Miles",
        role: "Barber",
        hours: 38,
        hourlyRate: 22,
        bonus: 75
      },
      {
        id: "pr2",
        staffName: "Amira Cole",
        role: "Stylist",
        hours: 34,
        hourlyRate: 24,
        bonus: 90
      }
    ],
    fixedCosts: {
      rent: 2200,
      utilities: 320,
      software: 210,
      other: 180
    },
    cogsPercent: 12,
    summary: {
      grossRevenue: 2270,
      nonCancelledBookings: 16,
      averageTicket: 141.88,
      payrollTotal: 1819,
      fixedCostsTotal: 2910,
      cogsAmount: 272.4,
      totalCosts: 5001.4,
      estimatedProfit: -2731.4,
      profitMarginPercent: -120.3,
      breakevenRevenue: 5373.86
    }
  };
  renderProfitabilitySummary();
  setProfitabilityStatus("Profitability summary loaded.");
}

if (isMockMode) {
  loadMockDashboard();
} else {
  (async () => {
    if (user.role === "admin") {
      try {
        await loadAdminBusinessOptions();
      } catch (error) {
        setAdminBusinessStatus(error.message, true);
      }
    }

    if (user.role !== "customer") {
      loadMetrics().catch((error) => {
        metricsGrid.innerHTML = `<article class="dash-card"><p>${error.message}</p></article>`;
      });
    }

    loadBookings({ append: false }).catch((error) => {
      if (bookingsList) {
        bookingsList.innerHTML = `<li>${error.message}</li>`;
      }
    });

    if (user.role === "subscriber" || user.role === "admin") {
      loadBillingSummary()
        .then(() => {
          renderBusinessGrowthPanel();
        })
        .catch((error) => {
          if (billingLiveBanner) billingLiveBanner.textContent = error.message;
        });

      loadBusinessProfile().catch((error) => {
        setBusinessProfileStatus(error.message, true);
      });

      loadSocialMediaLinks().catch((error) => {
        if (socialMediaPreview) {
          socialMediaPreview.innerHTML = `<p>${error.message}</p>`;
        }
      });

      loadAccountingIntegrations().catch((error) => {
        setAccountingStatus(error.message, true);
      });

      loadStaffRoster().catch((error) => {
        setStaffStatus(error.message, true);
      });

      loadWaitlist().catch((error) => {
        setWaitlistStatus(error.message, true);
      });

      loadCrmSegments().catch((error) => {
        setCrmStatus(error.message, true);
      });

      loadCommercialControls().catch((error) => {
        setCommercialStatus(error.message, true);
      });

      loadRevenueAttribution().catch((error) => {
        setRevenueStatus(error.message, true);
      });

      loadProfitabilitySummary().catch((error) => {
        setProfitabilityStatus(error.message, true);
      });
    }
  })();
}


