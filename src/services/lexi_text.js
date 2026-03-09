export function repairLexiTextArtifacts(text) {
  return String(text || "")
    .replace(/\u2018|\u2019|\u2032/g, "'")
    .replace(/\u201c|\u201d/g, '"')
    .replace(/\u2013|\u2014/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/Ã¢â‚¬â„¢|Ã¢â‚¬Ëœ/g, "'")
    .replace(/Ã¢â‚¬Å“|Ã¢â‚¬\x9d/g, '"')
    .replace(/Ã¢â‚¬"/g, "-")
    .replace(/Ã¢â‚¬Â¦/g, "...")
    .replace(/Ã‚/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeLexiReplyText(text, options = {}) {
  const raw = repairLexiTextArtifacts(text);
  if (!raw) return "";
  const maxSentences = Math.max(1, Number(options.maxSentences || 2));
  const maxChars = Math.max(80, Number(options.maxChars || 320));
  const sentences = raw.match(/[^.!?]+[.!?]?/g) || [raw];
  let compact = sentences
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .slice(0, maxSentences)
    .join(" ")
    .trim();
  if (compact.length > maxChars) compact = `${compact.slice(0, maxChars - 1).trimEnd()}...`;
  return compact
    .replace(/^I reviewed (?:your|the) snapshot[, ]*/i, "")
    .replace(/^Based on (?:your|the) snapshot[, ]*/i, "")
    .replace(/^Yes\.\s+Yes\./i, "Yes.")
    .replace(/^Hi, I'?m Lexi\.\s+Hi, I'?m Lexi\./i, "Hi, I'm Lexi.")
    .trim();
}
