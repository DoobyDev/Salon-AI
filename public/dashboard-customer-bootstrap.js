// Customer experience bootstrap runtime.
export function createCustomerBootstrapRuntime(deps) {
  const {
    getUserRole,
    getCustomerSalonDirectory,
    setCustomerSalonResults,
    setSelectedCustomerSalonId,
    setCustomerLexiCalendarMonthCursor,
    setCustomerLexiSelectedDateKey,
    setCustomerReceptionTranscript,
    renderCustomerSearchResults,
    renderCustomerSelectedSalon,
    renderCustomerReceptionChat,
    refreshCustomerDashboard
  } = deps || {};

  function initializeCustomerExperience() {
    if (getUserRole?.() !== "customer") return;
    const directory = Array.isArray(getCustomerSalonDirectory?.()) ? getCustomerSalonDirectory() : [];
    setCustomerSalonResults?.(directory.slice());
    setSelectedCustomerSalonId?.(directory[0]?.id || "");
    setCustomerLexiCalendarMonthCursor?.(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    setCustomerLexiSelectedDateKey?.("");
    setCustomerReceptionTranscript?.([
      {
        role: "ai",
        text: "Hi, I'm Lexi. How can I help today?"
      }
    ]);
    renderCustomerSearchResults?.();
    renderCustomerSelectedSalon?.();
    renderCustomerReceptionChat?.();
    refreshCustomerDashboard?.();
  }

  return {
    initializeCustomerExperience
  };
}
