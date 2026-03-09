export function createPublicLexiParsingService({
  normalizeLexiTypos,
  extractLexiIntroducedName
} = {}) {
  function extractLexiLocationHint(text) {
    const source = String(text || "").trim();
    if (!source) return "";
    const match = source.match(/\b(?:in|near|around|close to)\s+([A-Za-z][A-Za-z\s'-]{1,40}?)(?=(?:\s+\b(?:for|with|that|who|which|on|this|today|tomorrow|please)\b|[?.!,]|$))/i);
    return match ? String(match[1] || "").trim() : "";
  }

  function inferBusinessTypeFromLexiService(serviceName = "", question = "") {
    const combined = normalizeLexiTypos(`${serviceName} ${question}`.toLowerCase());
    if (/(fade|skin fade|beard|clipper|line up|shape up|barber)/.test(combined)) return "barber";
    if (/(facial|lashes|lash|brow|brows|wax|waxing|nails|manicure|pedicure|beauty|skin|skincare|makeup)/.test(combined)) return "beauty";
    if (/(hair|haircut|cut|colour|color|balayage|highlights|blow dry|blowout|extensions|keratin|toner|roots?)/.test(combined)) return "salon";
    return "";
  }

  function extractLexiPhoneFromText(text) {
    const match = String(text || "").match(/(?:\+?\d[\d\s().-]{7,24}\d)/);
    return match ? String(match[0] || "").trim() : "";
  }

  function extractLexiNameFromDetails(text) {
    const raw = String(text || "").trim();
    if (!raw) return "";
    const direct = extractLexiIntroducedName(raw);
    if (direct) return direct;
    const beforeNumber = raw.split(/\b(?:and\s+)?(?:my\s+number\s+is|my\s+phone\s+is|phone\s+is|number\s+is)\b/i)[0] || "";
    const cleaned = beforeNumber
      .replace(/^[,\s]+|[,\s]+$/g, "")
      .replace(/\b(?:it'?s|its|this is)\b/gi, "")
      .trim();
    if (!cleaned || cleaned.length > 50 || /\d/.test(cleaned)) return "";
    if (!/^[A-Za-z][A-Za-z' -]{1,48}$/.test(cleaned)) return "";
    const parts = cleaned.split(/\s+/).filter(Boolean);
    if (!parts.length || parts.length > 4) return "";
    return parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(" ");
  }

  return {
    extractLexiLocationHint,
    inferBusinessTypeFromLexiService,
    extractLexiPhoneFromText,
    extractLexiNameFromDetails
  };
}
