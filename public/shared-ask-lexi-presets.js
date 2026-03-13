export function buildPrimaryAskLexiPopupOptions(options = {}) {
  const {
    triggerButtons = [],
    source = "homepage",
    role = "public"
  } = options;

  return {
    triggerButtons,
    pageLabel: "Homepage",
    title: "Ask Lexi",
    subtitle: "AI salon receptionist",
    description: "Ask about services, timings, prep, rebooking, or how Ask Lexi supports the salon owner workspace.",
    assistantIntro: "Hello, I'm Lexi. I can help with salon bookings, service questions, prep advice, or how the owner dashboard works.",
    portraitNote: "Lexi is presented clearly here on purpose: one professional portrait panel, one conversation panel, and no extra clutter.",
    supportBadge: "Public-facing concierge",
    statusLabel: "Homepage live",
    promptHeading: "Popular first questions",
    formNote: "Ask about bookings, services, prep, or how the owner workspace supports the salon.",
    insightRows: [
      { label: "Role", value: "AI salon receptionist" },
      { label: "Best for", value: "Bookings, prep, service fit" },
      { label: "Tone", value: "Calm, premium, useful" }
    ],
    capabilityChips: ["Booking help", "Service guidance", "Owner overview"],
    promptChips: [
      { label: "Book balayage", prompt: "Book a balayage this Friday after 4 PM." },
      { label: "Owner overview", prompt: "What does Ask Lexi do for salon owners?" },
      { label: "Accounting export", prompt: "How do accounting exports work?" }
    ],
    inputPlaceholder: "Ask about services, timings, bookings, prep, or how the app works",
    buildRequestBody: ({ message, history }) => ({
      message,
      history,
      source,
      role
    })
  };
}
