export function getPublicChatToolDefinitions() {
  return [
    {
      type: "function",
      function: {
        name: "search_public_businesses",
        description: "Search subscribed salon, barber, or beauty businesses using public information only.",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "Business name or search phrase." },
            location: { type: "string", description: "City, postcode, or area." },
            service: { type: "string", description: "Optional service to search for." },
            business_type: { type: "string", description: "salon, barber, or beauty" },
            limit: { type: "number", description: "Max results 1-10" }
          }
        }
      }
    },
    {
      type: "function",
      function: {
        name: "get_business_public_profile",
        description: "Get public profile information for a subscribed business by id or name.",
        parameters: {
          type: "object",
          properties: {
            business_id: { type: "string" },
            business_name: { type: "string" }
          }
        }
      }
    },
    {
      type: "function",
      function: {
        name: "check_available_slots",
        description: "Check available booking slots for a business and optionally filter by date.",
        parameters: {
          type: "object",
          properties: {
            business_id: { type: "string" },
            date: { type: "string", description: "Optional date in YYYY-MM-DD format." },
            days_ahead: { type: "number", description: "Optional number of days ahead to search (1-14)." },
            limit: { type: "number", description: "Optional max number of slots to return (1-12)." }
          }
        }
      }
    },
    {
      type: "function",
      function: {
        name: "create_booking",
        description: "Create a booking when required details are complete.",
        parameters: {
          type: "object",
          properties: {
            business_id: { type: "string" },
            guest_name: { type: "string" },
            service: { type: "string" },
            date: { type: "string" },
            time: { type: "string" },
            phone: { type: "string" },
            email: { type: "string" },
            notes: { type: "string" }
          },
          required: ["business_id", "guest_name", "service", "date", "time", "phone"]
        }
      }
    }
  ];
}
