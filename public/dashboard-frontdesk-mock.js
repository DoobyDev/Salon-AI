// Front desk mock formatting and rendering helpers.
export function createFrontDeskMockRuntime(deps) {
  const {
    win = window,
    doc = document,
    getFrontDeskMock
  } = deps || {};

  function formatBusinessTypeLabel(value) {
    const normalized = String(value || "").trim().toLowerCase();
    if (normalized === "hair_salon") return "Hair Salon";
    if (normalized === "barbershop") return "Barbershop";
    if (normalized === "beauty_salon") return "Beauty Salon";
    return "General";
  }

  function renderFrontDeskMock() {
    const frontDeskMock = getFrontDeskMock?.();
    if (!frontDeskMock) return;
    const businessLogo = doc.getElementById("businessLogo");
    const frontDeskBusinessName = doc.getElementById("frontDeskBusinessName");
    const frontDeskRating = doc.getElementById("frontDeskRating");
    const frontDeskDescription = doc.getElementById("frontDeskDescription");
    const frontDeskSocialIcons = doc.getElementById("frontDeskSocialIcons");
    const frontDeskServices = doc.getElementById("frontDeskServices");
    const frontDeskReviews = doc.getElementById("frontDeskReviews");
    const frontDeskAnalytics = doc.getElementById("frontDeskAnalytics");
    const frontDeskAIChat = doc.getElementById("frontDeskAIChat");

    if (businessLogo) businessLogo.src = frontDeskMock.logo;
    if (frontDeskBusinessName) frontDeskBusinessName.textContent = frontDeskMock.name;
    if (frontDeskRating) frontDeskRating.textContent = frontDeskMock.rating;
    if (frontDeskDescription) frontDeskDescription.textContent = frontDeskMock.description;

    if (frontDeskSocialIcons) {
      frontDeskSocialIcons.innerHTML = "";
      frontDeskMock.social.forEach((s) => {
        const a = doc.createElement("a");
        a.href = s.url;
        a.target = "_blank";
        a.innerHTML = s.icon;
        a.title = s.label;
        frontDeskSocialIcons.appendChild(a);
      });
    }

    if (frontDeskServices) {
      frontDeskServices.innerHTML = "";
      frontDeskMock.services.forEach((svc) => {
        const div = doc.createElement("div");
        div.style = "background:rgba(124,234,216,0.08);border-radius:10px;padding:0.6rem;display:flex;align-items:center;gap:0.5rem;min-width:120px;";
        div.innerHTML = `<img src='${svc.image}' alt='' style='width:32px;height:32px;border-radius:8px;background:#fff;' /> <span style='font-weight:600;color:var(--ink);'>${svc.name}</span> <span style='color:var(--muted);'>${svc.price} ? ${svc.duration}</span>`;
        frontDeskServices.appendChild(div);
      });
    }

    if (frontDeskReviews) {
      frontDeskReviews.innerHTML = "";
      frontDeskMock.reviews.forEach((rev) => {
        const div = doc.createElement("div");
        div.style = "background:rgba(124,234,216,0.08);border-radius:10px;padding:0.5rem;";
        div.innerHTML = `<span style='font-weight:600;color:var(--ink);'>${rev.rating}</span> <span style='color:var(--muted);'>${rev.text}</span> <span style='color:#7cead8;'>- ${rev.author}</span>`;
        frontDeskReviews.appendChild(div);
      });
    }

    if (frontDeskAnalytics) {
      frontDeskAnalytics.innerHTML = "";
      frontDeskMock.analytics.forEach((stat) => {
        const div = doc.createElement("div");
        div.style = "background:rgba(124,234,216,0.08);border-radius:10px;padding:0.5rem;display:flex;flex-direction:column;gap:0.2rem;";
        div.innerHTML = `<span style='font-size:0.78rem;color:var(--muted);'>${stat.label}</span><strong style='font-size:1.05rem;color:var(--ink);'>${stat.value}</strong>`;
        frontDeskAnalytics.appendChild(div);
      });
    }

    if (frontDeskAIChat) frontDeskAIChat.textContent = frontDeskMock.aiChat;
  }

  function bindFrontDeskMockLoad() {
    win.addEventListener("DOMContentLoaded", renderFrontDeskMock);
  }

  return {
    formatBusinessTypeLabel,
    renderFrontDeskMock,
    bindFrontDeskMockLoad
  };
}
