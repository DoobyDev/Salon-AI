export function createPublicLexiIntroService() {
  function buildIntroReply({
    q = "",
    introducedName = "",
    hasPendingBookingContext = false
  } = {}) {
    const isGreetingOnly = /^(hi|hello|hey|hiya|hey lexi|hi lexi)[!.]?\s*$/i.test(q);

    if (!introducedName && isGreetingOnly) {
      return "Hi, I'm Lexi. What are we booking or figuring out today?";
    }
    if (!q) {
      return "Hi, I'm Lexi. Tell me the service, day, or question and I'll guide the next step.";
    }
    if (introducedName && !hasPendingBookingContext) {
      const displayName = introducedName.charAt(0).toUpperCase() + introducedName.slice(1);
      return `Hi ${displayName}, lovely to meet you. What would you like help with today?`;
    }

    return null;
  }

  return {
    buildIntroReply
  };
}
