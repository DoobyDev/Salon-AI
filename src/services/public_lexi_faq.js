export function createPublicLexiFaqService() {
  function buildServiceGuidanceFaqReply({ qLower = "", bizName = "the salon", serviceExamples = "", business = null } = {}) {
    if (/balayage/.test(qLower) && /(do you do|consultation|consultations|need|major change|big change)/.test(qLower)) {
      return "Yes, balayage is a good option if you want softer, lower-maintenance colour. A consultation is a good idea if this is your first balayage, you're lifting from darker colour, or you want help choosing the right tone.";
    }
    if (/highlights?/.test(qLower) && /(do you do|consultation|consultations|need|major change|big change)/.test(qLower)) {
      return "Yes, highlights are absolutely an option. A consultation helps if you want a big change, you're correcting old colour, or you're not sure how bright or high-maintenance you want to go.";
    }
    if (/keratin/.test(qLower) && /(do you do|consultation|consultations|need|major change|big change)/.test(qLower)) {
      return "Yes, keratin treatments can be a strong option for smoothing and cutting down styling time. A consultation is useful if you're pregnant, colour-treated, or deciding between smoothing and straightening results.";
    }
    if (/extensions?/.test(qLower) && /(do you do|consultation|consultations|need|major change|big change)/.test(qLower)) {
      return "Yes, extensions usually start with a consultation so the colour match, method, length, and upkeep are planned properly. That's the best first step before booking the full appointment.";
    }
    if (/(colour correction|color correction)/.test(qLower) && /(do you do|consultation|consultations|need|major change|big change)/.test(qLower)) {
      return "Yes, colour correction normally starts with a consultation. It helps assess what's already on the hair, what's realistically achievable, and how much time will be needed safely.";
    }
    if (/(bridal|event styling|updo)/.test(qLower) && /(do you do|consultation|consultations|need|major change|big change)/.test(qLower)) {
      return "Yes, special-occasion styling is something Lexi can help with. A consultation or trial is usually the best first step so the look, timing, and any prep are planned properly.";
    }
    if (/(balayage|highlights|keratin|extensions|colour correction|color correction|bridal|event styling|updo)/.test(qLower) && /(do you do|consultation|consultations|need|major change|big change)/.test(qLower)) {
      return "Yes. A consultation is usually the right first step if you're making a big change, correcting old work, or you want help choosing the best option for your hair and upkeep level.";
    }
    if (/(speciali[sz]e|hair type|curly|natural hair|fine hair|thick hair|textured hair|coily|afro|wavy)/.test(qLower)) {
      return "Yes. Tell me your hair type, thickness, length, and the result you want, and I'll guide you towards the right service, upkeep level, and whether a consultation makes sense first.";
    }
    if (/balayage/.test(qLower)) {
      return "Balayage gives a softer lived-in finish and usually grows out more gently than full highlights. If you want, tell me the look you're after and I'll help with maintenance, timing, and whether a consultation makes sense.";
    }
    if (/highlights?/.test(qLower)) {
      return "Highlights are good if you want more lift and brightness from root to end. Tell me how blonde or low-maintenance you want it, and I'll help narrow down the right option.";
    }
    if (/keratin/.test(qLower)) {
      return "Keratin is mainly about smoothing, taming frizz, and making styling easier. If you tell me your hair type and the result you want, I'll help you decide if it's the right fit.";
    }
    if (/extensions?/.test(qLower)) {
      return "Extensions can work really well for extra length, fullness, or both. The main things are colour match, method, upkeep, and budget, so tell me what you want the end result to feel like.";
    }
    if (/(colour correction|color correction)/.test(qLower)) {
      return "Colour correction is usually more involved than a standard colour appointment, so the safest approach is to assess the current colour, condition, and target result first. Tell me what's happened so far and I'll guide the next step.";
    }
    if (/(bridal|event styling|updo)/.test(qLower)) {
      return "Event styling is usually about the look, how long it needs to hold, and whether you want a trial first. Tell me the occasion and the style you have in mind and I'll guide you from there.";
    }
    if (/(consultation|consultations|major change|big change|before i change|before a big colour|before a big color)/.test(qLower)) {
      return "Yes, a consultation is the right first step before a major change. Tell me what you're thinking about and I'll guide the best next step.";
    }
    if (/(service|services|what do you offer|treatment)/.test(qLower)) {
      return `${bizName} offers services like ${serviceExamples}. Tell me the result you want, and I'll narrow it down to the best fit.`;
    }
    if (/(what do you recommend|what would you recommend|what should i book|what should i get|what suits me|what would suit me best)/.test(qLower)) {
      return "Tell me your goal, your hair or skin type, how much upkeep you want, and whether this is for maintenance or a bigger change. I'll narrow it down to the best option.";
    }
    if (/(what's the difference between|difference between|which is better|which is best)\b/.test(qLower)) {
      return "Tell me the two services or looks you're comparing, and I'll explain the difference in result, upkeep, timing, and who each option suits best.";
    }
    if (/(do you do men's haircuts|men'?s haircut|skin fades?|beard trims?|barber services?)/.test(qLower)) {
      return `Yes, ${bizName} can help with barber-style services like cuts, fades, and beard work if they're part of the listed offering. Tell me the look you want, and I'll guide the best next step.`;
    }
    if (/(do you do beauty treatments|beauty services|lashes|brows|waxing|facials|nails)/.test(qLower)) {
      return `Yes, ${bizName} can help with beauty services if they're part of the current offering. Tell me the treatment you're interested in, and I'll explain the best next step, timing, and prep if needed.`;
    }
    if (/(do you sell products|do you stock products|what products do you have|what products do you recommend|what should i use at home)/.test(qLower)) {
      return "Yes, I can help with product guidance. Tell me your hair or skin type, the result you want, and any issues like dryness, frizz, breakage, sensitivity, or colour fade, and I'll point you in the right direction.";
    }
    if (/(what products are good for|best product for|recommend a product for|aftercare for|home care for)/.test(qLower)) {
      return "Tell me the concern first, like dryness, breakage, frizz, curl definition, colour maintenance, scalp balance, lash care, brow upkeep, or post-treatment aftercare, and I'll keep the recommendation practical.";
    }
    if (/(price|cost|how much|pricing)/.test(qLower)) {
      return "Prices usually depend on the service, hair length or density, and the time needed, so I won't guess if the exact price is not listed. Tell me what you're considering, and I'll explain what drives the price.";
    }
    if (/(how long does it take|how long will it take|appointment length|how long is a|how much time should i allow)/.test(qLower)) {
      return "That usually depends on the service, the starting point, and whether it's maintenance or a bigger change. Tell me the service you're thinking about, and I'll give you a realistic timing guide.";
    }
    if (/(can i get booked in today|can i book today|same day|today availability|today slots)/.test(qLower)) {
      return "Possibly. Tell me the service and your rough time window today, and I'll check the best available options.";
    }
    if (/(do i need a consultation|should i book a consultation|consultation first)/.test(qLower)) {
      return "Usually yes if you're making a bigger change, correcting previous work, booking extensions, or you're unsure which service fits best. Tell me what you're planning, and I'll tell you whether a consultation is the right first step.";
    }
    if (/(can you help me book|help me book|book for me|can i book with you)/.test(qLower)) {
      return "Yes. Tell me the service, day, and rough time you want, and I'll move it forward from there.";
    }
    if (/(price range|colour price|color price|long hair|thick hair surcharge|charge extra|consultations free|free consultation|package deal|package deals|membership|memberships)/.test(qLower)) {
      return "Usually it depends on the service, time needed, and hair length or thickness. Tell me the service you're thinking about and I'll explain the likely pricing factors clearly.";
    }
    if (/(policy|deposit|late|cancellation|cancelation|no show|no-show|grace period)/.test(qLower)) {
      return "Most salons have policies around deposits, late arrivals, cancellations, and no-shows. Tell me which one you want to check, and I'll keep it clear and simple.";
    }
    if (/(is there parking|parking nearby|can i park|where do i park)/.test(qLower)) {
      const addressBits = [business?.address, business?.city, business?.postcode].filter(Boolean).join(", ");
      return addressBits
        ? `${bizName} is at ${addressBits}. If parking details are part of the business profile I can help with those too, and I can also help you choose the best booking time from here.`
        : `I can help with location and parking questions for ${bizName}. If the full parking details are not listed yet, I can still help you with the booking side straight away.`;
    }
    if (/(book in advance|book ahead|walk-?ins?|availability this week|this week availability|how long does .* take|how long .* service .* take)/.test(qLower)) {
      return "Usually the key things are the service, how flexible you are on timing, and whether you want a specific stylist. Tell me the service and day you want, and I'll keep it simple with the best next booking option.";
    }
    if (/(specific stylist|choose a stylist|pick a stylist|how experienced|experience of stylists|best stylist|who is best|photos of previous work|previous work|portfolio)/.test(qLower)) {
      return "I can help with stylist guidance in a general way, but I won't invent staff details that aren't listed. Tell me the result you want, like blonde work, colour correction, or curly cutting, and I'll point you in the right direction.";
    }
    if (/(don'?t know what i want|not sure what i want|unsure what i want|recommend.*service|what should i get)/.test(qLower)) {
      return "Let's narrow it down. Tell me your goal, how much upkeep you want, and any recent colour or chemical history, and I'll suggest the strongest options.";
    }
    if (/(i'm a new client|new client|first time here|first visit)/.test(qLower)) {
      return "That's easy. Tell me the service or result you want, and I'll guide the best next step, what to expect, and whether anything should be shared before the appointment.";
    }
    if (/(i already have an account|existing customer|returning customer|i've booked before)/.test(qLower)) {
      return "If you've booked before, sign in when you're ready and Lexi can help you continue from there. If you're still deciding on a service or time first, I can help with that here.";
    }
    return null;
  }

  function buildGeneralPublicLexiFaqReply({ qLower = "", bizName = "the salon", business = null } = {}) {
    if (/(what can you do for me|how can you help me|how can lexi help)/.test(qLower)) {
      return "I can help with products, services, aftercare, recommendations, live availability, bookings, account access, and app questions. If you're ready, tell me what you're trying to do and I'll take the next step with you.";
    }
    if (/(where are you located|where are you|location|address|parking|payment methods|forms of payment|card|cash)/.test(qLower)) {
      const addressBits = [business?.address, business?.city, business?.postcode].filter(Boolean).join(", ");
      if (addressBits) {
        return `${bizName} is at ${addressBits}. If you want, I can also help with the best day, time, or booking step from here.`;
      }
      return `I can help with location, parking, and payment questions for ${bizName}. If the full public details are not listed yet, I can still help with the booking side straight away.`;
    }
    if (/(open|opening hours|hours|closing time|when are you open)/.test(qLower)) {
      return `I can help with opening-hours questions for ${bizName} if the business profile includes them. If you don't see the hours listed yet, I can still help you plan the best day/time to book.`;
    }
    if (/(shampoo|conditioner|product|aftercare|hair mask|styling product|sulfate|ingredients)/.test(qLower)) {
      return "Yes, I can help with product and aftercare questions. Tell me your hair type (for example curly, fine, colour-treated, dry, oily scalp) and what you're trying to improve, and I'll give practical guidance.";
    }
    if (/(first appointment|before my appointment|before my first visit|before my first appointment)/.test(qLower)) {
      return "For a first appointment, bring a clear idea of the result you want and a couple of reference photos if you have them. If you've had recent colour, extensions, allergies, or scalp sensitivity, mention that straight away so the appointment can be planned properly.";
    }
    if (/(ammonia-?free|organic colour|organic color|sell products|retail products|products in salon|maintain my hair|prepare for my appointment|wash my hair before|new client discount|first time client)/.test(qLower)) {
      return "Yes. Tell me the service you're planning and I'll give you the most useful prep, product, or aftercare guidance first.";
    }
    if (/(skin|allergy|reaction|medical|rash|infection|burn)/.test(qLower)) {
      return "I can give general beauty and aftercare guidance, but I can't give medical advice. If you describe the treatment type and what happened, I can suggest safe next steps and when to contact a qualified professional.";
    }
    if (/(how does this app work|how to use|dashboard|lexi|subscriber|customer|admin|what can this app do|app features|how does lexi work)/.test(qLower)) {
      return "Lexi handles booking support, salon questions, and front-desk guidance, while the app gives different tools to customers, subscribers, and admins. If you want, tell me which part you want explained and I'll keep it simple.";
    }
    if (/(weather|forecast|temperature)/.test(qLower)) {
      return "I don't have live weather lookup in free fallback mode, but if you tell me your city, I can suggest how weather usually affects walk-ins, cancellations, and demand planning for salons and barbershops.";
    }
    return null;
  }

  return {
    buildServiceGuidanceFaqReply,
    buildGeneralPublicLexiFaqReply
  };
}
