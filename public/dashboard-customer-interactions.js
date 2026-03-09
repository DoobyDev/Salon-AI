// Customer search and reception form interaction runtime.
export function createCustomerInteractionsRuntime(deps) {
  const {
    getSelectedCustomerSalon,
    renderCustomerSearchResults,
    renderCustomerSelectedSalon,
    runCustomerSalonSearch,
    appendCustomerLexiGuidance,
    updateCustomerChatGuideHint,
    renderCustomerReceptionChat,
    getReceptionReply,
    customerSearchForm,
    customerSearchReset,
    customerSearchResults,
    customerSearchQuery,
    customerSearchService,
    customerSearchBusinessType,
    customerSearchLocation,
    customerSearchRating,
    customerSearchDate,
    customerReceptionForm,
    customerReceptionInput,
    customerReceptionClear,
    getSelectedCustomerSalonId,
    setSelectedCustomerSalonId,
    getCustomerReceptionTranscript,
    setCustomerReceptionTranscript
  } = deps || {};

  function bindCustomerInteractionEvents() {
    customerSearchForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      runCustomerSalonSearch?.();
    });

    customerSearchReset?.addEventListener("click", () => {
      if (customerSearchQuery) customerSearchQuery.value = "";
      if (customerSearchService) customerSearchService.value = "";
      if (customerSearchBusinessType) customerSearchBusinessType.value = "";
      if (customerSearchLocation) customerSearchLocation.value = "";
      if (customerSearchRating) customerSearchRating.value = "";
      if (customerSearchDate) customerSearchDate.value = "";
      runCustomerSalonSearch?.();
    });

    customerSearchResults?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (!target.classList.contains("customer-select-salon")) return;
      const salonId = String(target.getAttribute("data-salon-id") || "").trim();
      if (!salonId) return;
      setSelectedCustomerSalonId?.(salonId);
      renderCustomerSearchResults?.();
      renderCustomerSelectedSalon?.();
      const salon = getSelectedCustomerSalon?.();
      if (salon) {
        appendCustomerLexiGuidance?.(`I've loaded ${salon.name}. Ask me about services, the best time to book, or let me help you choose a slot.`);
        updateCustomerChatGuideHint?.();
      }
    });

    customerReceptionForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      const text = String(customerReceptionInput?.value || "").trim();
      if (!text) return;
      const transcript = Array.isArray(getCustomerReceptionTranscript?.()) ? getCustomerReceptionTranscript() : [];
      transcript.push({ role: "user", text });
      transcript.push({ role: "ai", text: getReceptionReply?.(text) });
      setCustomerReceptionTranscript?.(transcript);
      if (customerReceptionInput) customerReceptionInput.value = "";
      updateCustomerChatGuideHint?.();
      renderCustomerReceptionChat?.();
    });

    customerReceptionClear?.addEventListener("click", () => {
      setCustomerReceptionTranscript?.([
        {
          role: "ai",
          text: "Hi, I'm Lexi. How can I help today?"
        }
      ]);
      if (customerReceptionInput) {
        customerReceptionInput.value = "";
        customerReceptionInput.focus();
      }
      updateCustomerChatGuideHint?.();
      renderCustomerReceptionChat?.();
    });
  }

  return {
    bindCustomerInteractionEvents
  };
}
