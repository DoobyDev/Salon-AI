export function nextDateForWeekday(weekdayIndex, fromDate = new Date()) {
  const base = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  const diff = (weekdayIndex - base.getDay() + 7) % 7;
  base.setDate(base.getDate() + diff);
  return base;
}

export function normalizeLexiTypos(text) {
  let q = String(text || "").toLowerCase();
  const aliases = [
    ["moday", "monday"],
    ["monay", "monday"],
    ["monda", "monday"],
    ["tuseday", "tuesday"],
    ["tuesay", "tuesday"],
    ["wednsday", "wednesday"],
    ["wedesday", "wednesday"],
    ["wensday", "wednesday"],
    ["thurday", "thursday"],
    ["thrusday", "thursday"],
    ["thurdsay", "thursday"],
    ["frday", "friday"],
    ["saterday", "saturday"],
    ["satarday", "saturday"],
    ["sundey", "sunday"],
    ["tomorow", "tomorrow"],
    ["tommorow", "tomorrow"],
    ["avaiable", "available"],
    ["availble", "available"],
    ["avialable", "available"],
    ["availabilty", "availability"],
    ["slto", "slot"],
    ["sltos", "slots"],
    ["bokking", "booking"],
    ["boooking", "booking"],
    ["bookng", "booking"],
    ["bookin", "booking"],
    ["bok", "book"],
    ["boook", "book"],
    ["bokk", "book"],
    ["greatt", "great"],
    ["goood", "good"],
    ["okee", "okay"],
    ["okkk", "ok"],
    ["yees", "yes"],
    ["yess", "yes"],
    ["cnfirm", "confirm"],
    ["confrim", "confirm"],
    ["confim", "confirm"],
    ["comfirm", "confirm"],
    ["sigin", "sign in"],
    ["signin", "sign in"],
    ["signn in", "sign in"],
    ["sing up", "sign up"],
    ["signup", "sign up"],
    ["sin up", "sign up"],
    ["accout", "account"],
    ["acount", "account"],
    ["loggin", "login"],
    ["log in", "login"],
    ["canel", "cancel"],
    ["cnacel", "cancel"],
    ["cancell", "cancel"],
    ["reshedule", "reschedule"],
    ["rescedule", "reschedule"],
    ["avaiblity", "availability"],
    ["avalability", "availability"],
    ["availiblity", "availability"],
    ["appoinment", "appointment"],
    ["calender", "calendar"],
    ["dashbord", "dashboard"],
    ["deashboard", "dashboard"],
    ["subcriber", "subscriber"],
    ["recptionist", "receptionist"],
    ["renenue", "revenue"],
    ["haiecut", "haircut"],
    ["haircuit", "haircut"],
    ["haricut", "haircut"],
    ["hair cutt", "haircut"],
    ["colur", "colour"],
    ["colr", "colour"],
    ["colourr", "colour"],
    ["balyage", "balayage"],
    ["baleyage", "balayage"],
    ["baliage", "balayage"],
    ["highlites", "highlights"],
    ["higlights", "highlights"],
    ["hilights", "highlights"],
    ["extenstions", "extensions"],
    ["extentions", "extensions"],
    ["extentions", "extensions"],
    ["keratine", "keratin"],
    ["keritain", "keratin"],
    ["beard trimm", "beard trim"],
    ["facail", "facial"],
    ["facal", "facial"],
    ["lasheses", "lashes"],
    ["brouw", "brow"],
    ["waxxing", "waxing"],
    ["pedacure", "pedicure"],
    ["manacure", "manicure"]
  ];
  for (const [wrong, correct] of aliases) {
    q = q.replaceAll(wrong, correct);
  }
  return q;
}

export function weekdayFromText(text) {
  const q = normalizeLexiTypos(String(text || "").toLowerCase());
  const map = [
    ["sunday", 0],
    ["monday", 1],
    ["tuesday", 2],
    ["wednesday", 3],
    ["thursday", 4],
    ["friday", 5],
    ["saturday", 6]
  ];
  const hit = map.find(([name]) => q.includes(name));
  return hit ? hit[1] : null;
}

export function extractLexiIntroducedName(text) {
  const raw = String(text || "").trim();
  if (!raw) return "";
  const match = raw.match(/\b(?:i am|i'm|im|my name is)\s+([a-z][a-z'-]{1,24})\b/i);
  if (!match) return "";
  const name = String(match[1] || "").trim();
  if (!name) return "";
  const blockedMatches = new Set([
    "looking",
    "wanting",
    "want",
    "trying",
    "here",
    "booking",
    "book",
    "getting",
    "interested",
    "thinking",
    "needing",
    "after"
  ]);
  if (blockedMatches.has(name.toLowerCase())) return "";
  return `${name.charAt(0).toUpperCase()}${name.slice(1).toLowerCase()}`;
}

export function extractLexiTimeFromQuestion(text) {
  const q = normalizeLexiTypos(String(text || "").toLowerCase());
  if (!q) return "";
  const ampmMatch = q.match(/\b(\d{1,2})(?:(?::|\.)(\d{2}))?\s*(am|pm)\b/);
  if (ampmMatch) {
    const hour = Number(ampmMatch[1]);
    const minute = String(ampmMatch[2] || "00").padStart(2, "0");
    return `${hour}:${minute}${ampmMatch[3]}`;
  }
  const bareTimeMatch = q.match(/\b(\d{1,2})(?:(?::|\.)(\d{2}))\b/);
  if (bareTimeMatch) {
    const hour = Number(bareTimeMatch[1]);
    const minute = String(bareTimeMatch[2] || "00").padStart(2, "0");
    if (hour >= 0 && hour <= 23) {
      return `${hour}:${minute}`;
    }
  }
  const twentyFourMatch = q.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (twentyFourMatch) {
    return `${twentyFourMatch[1]}:${twentyFourMatch[2]}`;
  }
  return "";
}

export function extractLexiRequestedService(text, business) {
  const raw = String(text || "").trim();
  if (!raw) return null;
  const q = normalizeLexiTypos(raw.toLowerCase());
  const genericMap = [
    ["hair cut and colour", "Cut and Colour"],
    ["hair cut and color", "Cut and Colour"],
    ["haircut and colour", "Cut and Colour"],
    ["haircut and color", "Cut and Colour"],
    ["cut and colour", "Cut and Colour"],
    ["cut and color", "Cut and Colour"],
    ["cut & colour", "Cut and Colour"],
    ["cut & color", "Cut and Colour"],
    ["hair cut", "Haircut"],
    ["haircut", "Haircut"],
    ["cut and finish", "Cut and Finish"],
    ["trim", "Trim"],
    ["blow dry", "Blow Dry"],
    ["blowout", "Blowout"],
    ["color refresh", "Color Refresh"],
    ["colour refresh", "Color Refresh"],
    ["colour", "Colour Service"],
    ["color", "Colour Service"],
    ["balayage", "Balayage"],
    ["highlights", "Highlights"],
    ["fade", "Fade"],
    ["skin fade", "Skin Fade"],
    ["beard trim", "Beard Trim"],
    ["facial", "Facial"],
    ["brow", "Brow Treatment"],
    ["lashes", "Lash Treatment"],
    ["wax", "Waxing"],
    ["manicure", "Manicure"],
    ["pedicure", "Pedicure"]
  ];
  const genericMatch = genericMap.find(([needle]) => q.includes(needle));
  if (genericMatch) {
    return { name: genericMatch[1], matched: "generic-service" };
  }
  const services = Array.isArray(business?.services) ? business.services : [];
  const exactMatch = services.find((service) => {
    const name = normalizeLexiTypos(String(service?.name || "").toLowerCase());
    return name && q.includes(name);
  });
  if (exactMatch) {
    return { name: String(exactMatch.name || "").trim(), matched: "business-service" };
  }
  return null;
}

export function lexiIncludesAny(text, phrases = []) {
  const q = normalizeLexiTypos(String(text || "").toLowerCase());
  return phrases.some((phrase) => q.includes(normalizeLexiTypos(String(phrase || "").toLowerCase())));
}

export const LEXI_APP_HELP_PHRASES = [
  "how does the app work",
  "how does lexi work",
  "what can this app do",
  "what can lexi do",
  "what does lexi do",
  "how do i use the app",
  "how do i use lexi",
  "what is this app",
  "how do bookings work",
  "what happens after i book",
  "customer account",
  "customer login",
  "customer sign in",
  "customer sign up",
  "create account",
  "sign in",
  "sign up",
  "login",
  "register",
  "dashboard",
  "admin",
  "subscriber",
  "customer",
  "front desk",
  "receptionist",
  "waitlist",
  "calendar",
  "diary",
  "notifications",
  "billing",
  "subscription",
  "privacy",
  "gdpr",
  "data protection"
];

export const LEXI_BOOKING_HELP_PHRASES = [
  "book",
  "booking",
  "appointment",
  "availability",
  "available",
  "slot",
  "slots",
  "reschedule",
  "change my booking",
  "move my booking",
  "cancel my booking",
  "cancel appointment",
  "book me in",
  "fit me in",
  "what times do you have",
  "what have you got",
  "next slot",
  "next available"
];

export const LEXI_AUTH_HELP_PHRASES = [
  "account",
  "need an account",
  "customer account",
  "sign in",
  "signin",
  "log in",
  "login",
  "sign up",
  "signup",
  "register",
  "create account",
  "already have an account"
];

export const LEXI_POLICY_HELP_PHRASES = [
  "privacy",
  "gdpr",
  "data protection",
  "personal data",
  "my data",
  "billing",
  "subscription",
  "refund",
  "refunds",
  "deposit",
  "cancellation policy",
  "late policy",
  "no show"
];

export function isLexiAppQuestion(text) {
  const q = normalizeLexiTypos(String(text || "").toLowerCase());
  if (!q) return false;
  return lexiIncludesAny(q, [...LEXI_APP_HELP_PHRASES, ...LEXI_BOOKING_HELP_PHRASES, ...LEXI_AUTH_HELP_PHRASES, ...LEXI_POLICY_HELP_PHRASES])
    || /(how .*work|what can .*do|find .*salon|find .*barber|find .*beauty|search .*salon|search .*barber|search .*beauty|subscribed businesses?)/.test(q);
}

export function isLexiPublicAvailabilityQuestion(text) {
  const q = normalizeLexiTypos(String(text || "").toLowerCase());
  return /(available|availability|slots?|space)/.test(q) && /(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{4}-\d{2}-\d{2}|\bnext\b)/.test(q);
}

export function isLexiSalonBeautyQuestion(text) {
  const q = normalizeLexiTypos(String(text || "").toLowerCase());
  return /(service|services|treatment|treatments|product|products|hair|salon|barber|barbershop|beauty|facial|nails?|lash|lashes|brow|brows|fade|beard|blowout|silk press|keratin|brazilian blowout|perm|relaxer|extensions?|balayage|ombre|highlight|color correction|root touch|toner|scalp|deep conditioning|bridal|updo|waxing|makeup|aftercare|shampoo|conditioner|heat protectant|serum|pomade|clay|mousse|gel|texture spray)/.test(q);
}

export function formatCurrencyGBP(amount) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(Number(amount || 0));
}

export function resolveLexiDateKeyFromQuestion(question, now = new Date()) {
  const q = normalizeLexiTypos(String(question || "").toLowerCase());
  if (/\btomorrow\b/.test(q)) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }
  if (/\btoday\b/.test(q)) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return d.toISOString().slice(0, 10);
  }
  const explicit = q.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (explicit) return explicit[1];
  const natural = q.match(/\b(?:(mon|monday|tue|tues|tuesday|wed|weds|wednesday|thu|thur|thurs|thursday|fri|friday|sat|saturday|sun|sunday)\s+)?(\d{1,2})(?:st|nd|rd|th)?\s+(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)(?:\s+(\d{4}))?\b/);
  if (natural) {
    const dayNum = Number(natural[2]);
    const monthToken = String(natural[3] || "").slice(0, 3);
    const monthMap = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };
    const monthIndex = monthMap[monthToken];
    if (Number.isFinite(dayNum) && dayNum >= 1 && dayNum <= 31 && Number.isInteger(monthIndex)) {
      let year = Number(natural[4] || new Date(now).getFullYear());
      let candidate = new Date(year, monthIndex, dayNum);
      if (Number.isNaN(candidate.getTime()) || candidate.getMonth() !== monthIndex || candidate.getDate() !== dayNum) {
        candidate = null;
      }
      if (candidate && !natural[4]) {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (candidate < today) {
          candidate = new Date(year + 1, monthIndex, dayNum);
        }
      }
      if (candidate && !Number.isNaN(candidate.getTime())) {
        return candidate.toISOString().slice(0, 10);
      }
    }
  }
  const weekday = weekdayFromText(q);
  if (weekday !== null) return nextDateForWeekday(weekday, now).toISOString().slice(0, 10);
  return "";
}
