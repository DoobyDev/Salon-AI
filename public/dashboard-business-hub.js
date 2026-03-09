export const BUSINESS_HUB_CARD_CONFIG = [
  {
    key: "business_profile",
    title: "Business Information",
    kicker: "Core setup",
    summary: "Business name, contact details, hours, services, and the setup data Lexi and customers rely on.",
    information: [
      "Business name, phone, email, address, postcode, and customer-facing contact details.",
      "Opening hours, operating days, profile setup, and the service information tied to bookings.",
      "The core salon details Lexi, staff, and customers use across the dashboard."
    ],
    jobs: [
      "Update salon profile details when branding, hours, or contact information changes.",
      "Keep customer-facing information accurate before bookings, messages, or follow-up actions happen.",
      "Maintain the setup data the wider platform depends on every day."
    ],
    outcomes: [
      "Cleaner customer communication and fewer avoidable booking mistakes.",
      "A stronger setup foundation for the rest of the business modules.",
      "Better trust because the profile always reflects the real business."
    ]
  },
  {
    key: "staff",
    title: "Staff Setup",
    kicker: "Team control",
    summary: "Team members, shift cover, capacity planning, and the staffing details behind your diary.",
    information: [
      "Staff records, working patterns, rota coverage, and team availability.",
      "Capacity planning that affects diary availability and appointment flow.",
      "Shift coverage details used to manage busy days, leave, and last-minute changes."
    ],
    jobs: [
      "Add, review, or adjust team members and their working schedules.",
      "Check staffing cover before busy periods create pressure on the diary.",
      "Keep rota decisions aligned with real appointment demand."
    ],
    outcomes: [
      "Better day-to-day staffing control and clearer capacity planning.",
      "Less scheduling confusion during peak periods or cover gaps.",
      "A diary that better matches the team actually available to deliver services."
    ]
  },
  {
    key: "frontdesk",
    title: "Salon Features",
    kicker: "Customer view",
    summary: "What customers see about the salon, including front-desk presentation, services, and trust-building details.",
    information: [
      "Public-facing service setup, booking presentation, and salon trust signals.",
      "The features, options, and service visibility customers see before booking.",
      "Front-desk details that shape the salon brand and booking journey."
    ],
    jobs: [
      "Review how services and salon options are presented to customers.",
      "Keep the front-desk experience polished, clear, and easy to trust.",
      "Remove confusion between the real service offer and the visible booking experience."
    ],
    outcomes: [
      "A clearer booking journey with fewer customer drop-offs.",
      "Stronger presentation of the salon brand and service menu.",
      "Better alignment between what the business offers and what customers see."
    ]
  },
  {
    key: "social",
    title: "Social Media",
    kicker: "Brand links",
    summary: "Linked socials, brand touchpoints, and the public profile links tied to the business.",
    information: [
      "Instagram, Facebook, TikTok, and other social profile links tied to the salon.",
      "Public brand touchpoints customers may use before contacting or booking.",
      "Visibility details that support discovery, trust, and brand consistency."
    ],
    jobs: [
      "Update social links when profile names, platforms, or brand destinations change.",
      "Keep customer-facing channels current and easy to reach.",
      "Check that public profile links match the salon identity across platforms."
    ],
    outcomes: [
      "Better brand consistency across the salon's public presence.",
      "Improved discovery from social traffic into bookings or contact.",
      "Less confusion from old, missing, or broken links."
    ]
  },
  {
    key: "merch",
    title: "Merch",
    kicker: "Retail sales",
    summary: "Retail products, pricing, images, and shipment records for in-salon product sales.",
    information: [
      "Retail product listings, pricing, descriptions, images, and customer-facing product details.",
      "Stock visibility and sales tracking for in-salon or shipped merchandise.",
      "Shipment records and fulfilment data for product orders leaving the salon."
    ],
    jobs: [
      "Add, review, and update product listings with the right pricing and presentation.",
      "Track what merchandise is selling alongside the service business.",
      "Create shipment records when customers need products delivered."
    ],
    outcomes: [
      "Stronger retail control and better visibility over non-service revenue.",
      "Cleaner fulfilment workflows for shipped orders.",
      "A more complete customer offer beyond appointments alone."
    ]
  },
  {
    key: "accounting",
    title: "Accounting",
    kicker: "Money admin",
    summary: "Revenue exports, provider links, and the bookkeeping side of the business.",
    information: [
      "Revenue exports, bookkeeping-ready records, and accountant-facing finance data.",
      "Accounting integrations, provider links, and reconciliation support.",
      "The admin side of money handling that supports clean reporting."
    ],
    jobs: [
      "Review exported finance activity before handoff to bookkeeping or accounting support.",
      "Connect and monitor accounting providers where integrations are available.",
      "Keep reporting and reconciliation work organised from one place."
    ],
    outcomes: [
      "Tidier finance admin and faster accountant handoff.",
      "Less manual effort during reconciliation and export tasks.",
      "A clearer bookkeeping workflow inside the dashboard."
    ]
  },
  {
    key: "profitability",
    title: "Finance",
    kicker: "Margin view",
    summary: "Break-even, payroll impact, costs, and the numbers that show what is driving profit.",
    information: [
      "Revenue, break-even position, payroll impact, and cost pressure across the business.",
      "Profit signals that show what is helping or hurting margin.",
      "Owner-level numbers used for pricing, staffing, and commercial decisions."
    ],
    jobs: [
      "Track how payroll and operating costs compare against revenue performance.",
      "Review margin pressure before it turns into a bigger commercial problem.",
      "Use finance signals to support pricing and staffing decisions."
    ],
    outcomes: [
      "Clearer owner visibility over what is driving profit.",
      "Faster understanding of cost pressure and break-even position.",
      "More confident financial decisions based on live business signals."
    ]
  },
  {
    key: "operations",
    title: "Cancellations",
    kicker: "Recovery actions",
    summary: "No-show risk, rebooking opportunities, and the actions that help protect chair time.",
    information: [
      "Cancellation pressure, no-show risk, and missed-appointment patterns.",
      "Rebooking and recovery actions that help protect lost chair time.",
      "The operational signals tied to policy, gaps, and repeat-visit risk."
    ],
    jobs: [
      "Review cancellation and no-show pressure before it damages the week.",
      "Spot rebooking opportunities and quick recovery actions.",
      "Manage the business response to empty slots and lost time."
    ],
    outcomes: [
      "Better protection of booked time and repeat visits.",
      "Clearer response to cancellations and no-show disruption.",
      "Less revenue leakage from unfilled gaps in the diary."
    ]
  }
];

export function getBusinessHubModulesForRole({ role, moduleDefinitionByKey }) {
  if (!(role === "subscriber" || role === "admin")) return [];
  return BUSINESS_HUB_CARD_CONFIG.map((item) => {
    const mod = moduleDefinitionByKey(item.key);
    if (!mod) return null;
    return { ...item, mod };
  }).filter(Boolean);
}
