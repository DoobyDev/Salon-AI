export function normalizeBusinessType(input) {
  const raw = String(input || "").trim().toLowerCase();
  if (["hair_salon", "hair salon", "hair", "salon", "women salon", "unisex salon"].includes(raw)) return "hair_salon";
  if (["barbershop", "barber shop", "barber", "mens salon"].includes(raw)) return "barbershop";
  if (["beauty_salon", "beauty salon", "beauty", "spa", "nails", "lash", "lashes", "brows", "skincare"].includes(raw)) return "beauty_salon";
  if (["hybrid", "hair_beauty", "hair-beauty", "hair&beauty", "hair and beauty", "both"].includes(raw)) return "hair_salon";
  return "hair_salon";
}

export function businessTypeSearchValues(type) {
  const normalized = normalizeBusinessType(type);
  if (normalized === "hair_salon") return ["hair_salon", "hair", "salon"];
  if (normalized === "barbershop") return ["barbershop", "barber"];
  if (normalized === "beauty_salon") return ["beauty_salon", "beauty"];
  return ["hair_salon", "barbershop", "beauty_salon", "hair", "salon", "barber", "beauty"];
}

export function defaultServicesByBusinessType(type) {
  const normalized = normalizeBusinessType(type);
  if (normalized === "beauty_salon") {
    return [
      { name: "Signature Facial", durationMin: 60, price: 95 },
      { name: "Brow Shaping", durationMin: 30, price: 35 },
      { name: "Gel Manicure", durationMin: 45, price: 45 }
    ];
  }
  if (normalized === "barbershop") {
    return [
      { name: "Skin Fade", durationMin: 40, price: 55 },
      { name: "Classic Cut", durationMin: 35, price: 45 },
      { name: "Beard Trim", durationMin: 30, price: 30 }
    ];
  }
  return [
    { name: "Haircut", durationMin: 45, price: 60 },
    { name: "Blowout", durationMin: 45, price: 55 },
    { name: "Color Refresh", durationMin: 90, price: 120 }
  ];
}

export function defaultHoursByBusinessType(type) {
  const normalized = normalizeBusinessType(type);
  if (normalized === "barbershop") {
    return {
      monday: "09:00-19:00",
      tuesday: "09:00-19:00",
      wednesday: "09:00-19:00",
      thursday: "09:00-20:00",
      friday: "09:00-20:00",
      saturday: "10:00-18:00",
      sunday: "Closed"
    };
  }
  if (normalized === "beauty_salon") {
    return {
      monday: "10:00-18:00",
      tuesday: "10:00-18:00",
      wednesday: "10:00-18:00",
      thursday: "10:00-19:00",
      friday: "10:00-19:00",
      saturday: "09:00-17:00",
      sunday: "Closed"
    };
  }
  return {
    monday: "09:00-18:00",
    tuesday: "09:00-18:00",
    wednesday: "09:00-18:00",
    thursday: "09:00-20:00",
    friday: "09:00-20:00",
    saturday: "09:00-17:00",
    sunday: "Closed"
  };
}

export function defaultDescriptionByBusinessType(type, businessName) {
  const normalized = normalizeBusinessType(type);
  const name = String(businessName || "This business").trim();
  if (normalized === "barbershop") {
    return `${name} is a modern barbershop powered by Hair & Beauty AI Receptionist.`;
  }
  if (normalized === "beauty_salon") {
    return `${name} is a professional beauty salon powered by Hair & Beauty AI Receptionist.`;
  }
  return `${name} is a premium hair salon powered by Hair & Beauty AI Receptionist.`;
}

export function parseHours(hoursJson) {
  try {
    return JSON.parse(hoursJson);
  } catch {
    return {};
  }
}

export function createBusinessProfileInputUtils({ parseOpenHours, timeToMinutes }) {
  function normalizeBusinessHoursInput(input) {
    const source = input && typeof input === "object" ? input : {};
    const keys = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    const normalized = {};
    for (const key of keys) {
      const raw = String(source[key] || "Closed").trim();
      if (!raw || raw.toLowerCase() === "closed") {
        normalized[key] = "Closed";
        continue;
      }
      const parsed = parseOpenHours(raw);
      if (!parsed) {
        throw new Error(`Invalid hours for ${key}. Use HH:MM-HH:MM or Closed.`);
      }
      if (timeToMinutes(parsed.close) <= timeToMinutes(parsed.open)) {
        throw new Error(`Invalid hours for ${key}. Closing time must be after opening time.`);
      }
      normalized[key] = `${parsed.open}-${parsed.close}`;
    }
    return normalized;
  }

  function normalizeBusinessServicesInput(input) {
    const source = Array.isArray(input) ? input : [];
    const rows = source
      .map((row) => ({
        name: String(row?.name || "").trim(),
        durationMin: Number(row?.durationMin || 0),
        price: Number(row?.price || 0)
      }))
      .filter((row) => row.name);
    if (!rows.length) throw new Error("At least one service is required.");
    const invalid = rows.find((row) => !Number.isFinite(row.durationMin) || row.durationMin < 5 || !Number.isFinite(row.price) || row.price < 0);
    if (invalid) throw new Error("Each service must include a valid name, duration (>=5), and price (>=0).");
    return rows;
  }

  return {
    normalizeBusinessHoursInput,
    normalizeBusinessServicesInput
  };
}
