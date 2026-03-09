export function createPublicBusinessProfileService({
  parseHours
} = {}) {
  function isPublicSubscriptionStatus(status) {
    const normalized = String(status || "").toLowerCase();
    return ["active", "trialing", "trial", "past_due"].includes(normalized);
  }

  function mapPublicBusinessProfile(business) {
    if (!business) return null;
    return {
      id: business.id,
      name: business.name,
      type: business.type,
      city: business.city,
      country: business.country,
      postcode: business.postcode,
      address: business.address,
      rating: Number(business.rating || 0),
      description: business.description || "",
      phone: business.phone || "",
      email: business.email || "",
      websiteUrl: business.websiteUrl || null,
      websiteTitle: business.websiteTitle || null,
      websiteSummary: business.websiteSummary || null,
      hours: typeof parseHours === "function" ? parseHours(business.hoursJson) : {},
      services: Array.isArray(business.services)
        ? business.services.map((service) => ({
            name: service.name,
            durationMin: Number(service.durationMin || 0),
            price: Number(service.price || 0)
          }))
        : []
    };
  }

  return {
    isPublicSubscriptionStatus,
    mapPublicBusinessProfile
  };
}
