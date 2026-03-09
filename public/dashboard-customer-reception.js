// Customer search + reception chat runtime.
export function createCustomerReceptionRuntime(deps) {
  const {
    doc = document,
    t,
    normalizeText,
    escapeHtml,
    formatBusinessTypeLabel,
    getCustomerSalonDirectory,
    getCustomerSalonResults,
    setCustomerSalonResults,
    getSelectedCustomerSalonId,
    setSelectedCustomerSalonId,
    getCustomerReceptionTranscript,
    customerSearchResults,
    customerSelectedSalonLabel,
    customerSalonContact,
    customerAvailableSlots,
    customerSearchQuery,
    customerSearchService,
    customerSearchBusinessType,
    customerSearchLocation,
    customerSearchRating,
    customerSearchDate,
    customerReceptionMessages,
    customerReceptionInput,
    customerChatGuideHint,
    renderCustomerControlCenter,
    getBookingRows,
    renderCustomerLexiCalendar
  } = deps || {};

  function getSelectedCustomerSalon() {
    const selectedId = getSelectedCustomerSalonId?.();
    const fromResults = (getCustomerSalonResults?.() || []).find((salon) => salon.id === selectedId);
    if (fromResults) return fromResults;
    return (getCustomerSalonDirectory?.() || []).find((salon) => salon.id === selectedId) || null;
  }

  function renderCustomerSearchResults() {
    if (!customerSearchResults) return;
    customerSearchResults.innerHTML = "";
    const results = getCustomerSalonResults?.() || [];
    if (!results.length) {
      customerSearchResults.innerHTML = "<li>No businesses match those filters yet. Try widening your search a little.</li>";
      return;
    }
    const selectedId = getSelectedCustomerSalonId?.();
    results.forEach((salon) => {
      const isSelected = salon.id === selectedId;
      const item = doc.createElement("li");
      item.innerHTML = `
      <div>
        <strong>${salon.name}</strong><br />
        <small>${salon.city} | ${formatBusinessTypeLabel?.(salon.businessType)} | Rating ${salon.rating.toFixed(1)} | ${salon.services.join(", ")}</small>
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
        : "Choose a business from the search results.";
    }
    if (customerSalonContact) {
      customerSalonContact.innerHTML = salon
        ? `<strong>Contact</strong><br /><small>${salon.phone} | ${salon.email}<br />${salon.address}</small>`
        : "<small>Choose a business to see contact details and availability.</small>";
    }
    if (customerAvailableSlots) {
      customerAvailableSlots.innerHTML = "";
      if (!salon) {
        customerAvailableSlots.innerHTML = "<li>Choose a business to see available booking times.</li>";
        renderCustomerLexiCalendar?.();
        return;
      }
      if (!Array.isArray(salon.availableSlots) || !salon.availableSlots.length) {
        customerAvailableSlots.innerHTML = "<li>There are no open slots showing right now.</li>";
        renderCustomerLexiCalendar?.();
        return;
      }
      salon.availableSlots.forEach((slot) => {
        const li = doc.createElement("li");
        li.innerHTML = `<strong>${slot}</strong><br /><small>${escapeHtml?.(t?.("dashboard.slot_request_help", "Ask Lexi to help you request this slot."))}</small>`;
        customerAvailableSlots.appendChild(li);
      });
    }
    renderCustomerControlCenter?.(getBookingRows?.() || []);
    renderCustomerLexiCalendar?.();
  }

  function runCustomerSalonSearch() {
    const query = normalizeText?.(customerSearchQuery?.value);
    const service = normalizeText?.(customerSearchService?.value);
    const businessType = normalizeText?.(customerSearchBusinessType?.value);
    const location = normalizeText?.(customerSearchLocation?.value);
    const minRating = Number(customerSearchRating?.value || 0);
    const desiredDate = String(customerSearchDate?.value || "").trim();
    const currentSelected = getSelectedCustomerSalonId?.();
    const results = (getCustomerSalonDirectory?.() || []).filter((salon) => {
      if (Number.isFinite(minRating) && minRating > 0 && salon.rating < minRating) return false;
      if (location && !normalizeText?.(salon.city).includes(location)) return false;
      if (service) {
        const hasService = salon.services.some((entry) => normalizeText?.(entry).includes(service));
        if (!hasService) return false;
      }
      if (businessType) {
        if (normalizeText?.(salon.businessType) !== businessType) return false;
      }
      if (query) {
        const specialistList = Array.isArray(salon.specialists) && salon.specialists.length ? salon.specialists : (salon.barbers || []);
        const blob = [salon.name, salon.city, ...salon.services, ...specialistList].map((entry) => normalizeText?.(entry)).join(" ");
        if (!blob.includes(query)) return false;
      }
      if (desiredDate) {
        const hasDateMatch = salon.availableSlots.some((slot) => String(slot).startsWith(desiredDate));
        if (!hasDateMatch) return false;
      }
      return true;
    });
    setCustomerSalonResults?.(results);
    if (!results.some((salon) => salon.id === currentSelected)) {
      setSelectedCustomerSalonId?.(results[0]?.id || "");
    }
    renderCustomerSearchResults();
    renderCustomerSelectedSalon();
  }

  function renderCustomerReceptionChat() {
    if (!customerReceptionMessages) return;
    customerReceptionMessages.innerHTML = "";
    (getCustomerReceptionTranscript?.() || []).forEach((entry) => {
      const msg = doc.createElement("div");
      msg.className = `customer-chat-msg ${entry.role === "user" ? "user" : "ai"}`;
      msg.textContent = entry.text;
      customerReceptionMessages.appendChild(msg);
    });
    customerReceptionMessages.scrollTop = customerReceptionMessages.scrollHeight;
  }

  function normalizeCustomerLexiTypos(text) {
    let message = normalizeText?.(text);
    const aliases = [
      ["moday", "monday"],
      ["monay", "monday"],
      ["wednsday", "wednesday"],
      ["thurday", "thursday"],
      ["thrusday", "thursday"],
      ["frday", "friday"],
      ["saterday", "saturday"],
      ["sundey", "sunday"],
      ["tomorow", "tomorrow"],
      ["tommorow", "tomorrow"],
      ["avaiable", "available"],
      ["availble", "available"],
      ["avialable", "available"],
      ["availabilty", "availability"],
      ["bokking", "booking"],
      ["bookng", "booking"],
      ["appoinment", "appointment"],
      ["calender", "calendar"],
      ["dashbord", "dashboard"],
      ["subcriber", "subscriber"],
      ["renenue", "revenue"]
    ];
    aliases.forEach(([wrong, correct]) => {
      message = message.replaceAll(wrong, correct);
    });
    return message;
  }

  function getReceptionReply(inputText) {
    const message = normalizeCustomerLexiTypos(inputText);
    const salon = getSelectedCustomerSalon();
    if (!message) return "Tell me what you're looking for and I'll guide you from there.";
    if (/(password|api key|token|secret|all customers|customer list|phone numbers|emails|addresses|personal data|private data)/.test(message)) {
      return "I can help with bookings and app questions, but I can't share private account or personal data.";
    }
    if (/(how does this app work|what can lexi do|what can the app do|dashboard|module|modules|subscriber|admin|customer dashboard|demo mode|booking confirmation|pending booking|notification|notifications|how .*work|gdpr|privacy|data protection|lexi)/.test(message)) {
      return "Lexi helps with services, availability, bookings, and front-desk questions, while the app gives salon owners control over the diary, staff, and business side. If you want, I can explain a specific part instead of the whole system.";
    }
    if (/(find|search).*(salon|barber|beauty)|business search/.test(message)) {
      return "Use the search filters to narrow it down by name, service, area, rating, or date. Once you've picked a business, I'll help with services, slots, and the booking.";
    }
    if (message.includes("slot") || message.includes("available") || message.includes("book")) {
      if (!salon) return "Pick a business first and I'll help you check the best slots.";
      if (message.includes("confirm")) {
        return "You can request the booking from the slots shown here. Some businesses confirm manually first, so you'll get a confirmation once the salon approves it.";
      }
      const nextSlot = salon.availableSlots[0];
      return nextSlot
        ? `${salon.name} has availability at ${nextSlot}. If you want, I can help you pick the best time around that.`
        : `${salon.name} doesn't have any open slots listed right now.`;
    }
    if (message.includes("phone") || message.includes("email") || message.includes("contact")) {
      if (!salon) return "Pick a business first and I'll show you the contact details.";
      return `You can reach ${salon.name} at ${salon.phone} or ${salon.email}.`;
    }
    if (message.includes("service")) {
      if (!salon) return "Pick a business first and I'll run through the services with you.";
      return `${salon.name} offers ${salon.services.join(", ")}. Tell me the result you want and I'll point you to the best option.`;
    }
    if (/(policy|deposit|late|cancellation|cancelation|no show|no-show)/.test(message)) {
      return "I can walk you through deposits, late arrivals, cancellations, or no-show policy. Tell me which part you want to check.";
    }
    if (message.includes("calendar") || message.includes("planner")) {
      return "The booking calendar lets you compare day, week, and month availability and work out the best time to book.";
    }
    if (message.includes("bookings") || message.includes("appointment")) {
      return "I can help you with booking questions, open slots, services, contact details, and how confirmation works in the app.";
    }
    return "Ask me about services, open times, booking help, policies, or how the app works, and I'll keep it simple.";
  }

  function appendCustomerLexiChat(prompt, fallbackReply = "") {
    const text = String(prompt || "").trim();
    if (!text) return;
    const transcript = getCustomerReceptionTranscript?.();
    transcript.push({ role: "user", text });
    transcript.push({ role: "ai", text: String(fallbackReply || getReceptionReply(text)).trim() || "Tell me what you'd like to book and I'll help you narrow it down." });
    renderCustomerReceptionChat();
  }

  function queueCustomerLexiPrompt(prompt) {
    const text = String(prompt || "").trim();
    if (!text) return;
    if (customerReceptionInput) customerReceptionInput.value = text;
    appendCustomerLexiChat(text);
    updateCustomerChatGuideHint();
  }

  function appendCustomerLexiGuidance(text) {
    const message = String(text || "").trim();
    if (!message) return;
    getCustomerReceptionTranscript?.().push({ role: "ai", text: message });
    renderCustomerReceptionChat();
  }

  function updateCustomerChatGuideHint() {
    if (!customerChatGuideHint) return;
    const salon = getSelectedCustomerSalon();
    if (!salon) {
      customerChatGuideHint.textContent = "Choose a business first for more accurate booking guidance.";
      return;
    }
    customerChatGuideHint.textContent = `Lexi is ready to guide bookings, services, and available times for ${salon.name}.`;
  }

  return {
    getSelectedCustomerSalon,
    renderCustomerSearchResults,
    renderCustomerSelectedSalon,
    runCustomerSalonSearch,
    renderCustomerReceptionChat,
    normalizeCustomerLexiTypos,
    getReceptionReply,
    appendCustomerLexiChat,
    queueCustomerLexiPrompt,
    appendCustomerLexiGuidance,
    updateCustomerChatGuideHint
  };
}
