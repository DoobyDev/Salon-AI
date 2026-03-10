export function buildSubscriberRecommendedActions({
  lateCancellations = [],
  todayConfirmed = [],
  noShowRate = 0
} = {}) {
  const cancellations = Array.isArray(lateCancellations) ? lateCancellations : [];
  const confirmedToday = Array.isArray(todayConfirmed) ? todayConfirmed : [];
  const safeNoShowRate = Number(noShowRate || 0);
  const recommendedActions = [];

  if (cancellations.length > 0) {
    recommendedActions.push({
      id: "fill-cancellations",
      label: "Fill cancellation gaps",
      detail: `${cancellations.length} last-minute cancellation${cancellations.length === 1 ? "" : "s"} today.`
    });
  }
  if (confirmedToday.length < 3) {
    recommendedActions.push({
      id: "boost-today-demand",
      label: "Boost today's demand",
      detail: "Low confirmed bookings today. Send a same-day offer to recent clients."
    });
  }
  if (safeNoShowRate >= 10) {
    recommendedActions.push({
      id: "tighten-confirmations",
      label: "Tighten confirmations",
      detail: `No-show/cancelled rate is ${safeNoShowRate}%. Enable reminder cadence and deposit prompts.`
    });
  }
  if (!recommendedActions.length) {
    recommendedActions.push({
      id: "maintain-momentum",
      label: "Maintain momentum",
      detail: "Today looks healthy. Focus on upsells and rebooking at checkout."
    });
  }

  return recommendedActions;
}
