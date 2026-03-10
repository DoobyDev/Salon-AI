import { describe, expect, it } from "vitest";
import {
  buildSubscriberNoShowRisk,
  buildSubscriberRebookingPrompts
} from "../src/services/subscriber_operations_insights.js";

describe("subscriber operations insights helper", () => {
  it("ranks higher-risk future bookings above lower-risk ones", () => {
    const nowMs = new Date("2026-03-10T10:00:00.000Z").getTime();
    const rows = buildSubscriberNoShowRisk(
      [
        {
          id: "past_cancelled",
          customerName: "Alex",
          customerEmail: "alex@example.com",
          status: "cancelled",
          startsAt: new Date("2026-02-20T10:00:00.000Z"),
          normalizedDate: "2026-02-20",
          time: "10:00",
          price: 45
        },
        {
          id: "past_completed",
          customerName: "Alex",
          customerEmail: "alex@example.com",
          status: "confirmed",
          startsAt: new Date("2026-02-10T10:00:00.000Z"),
          normalizedDate: "2026-02-10",
          time: "10:00",
          price: 45
        },
        {
          id: "high_risk",
          customerName: "Alex",
          customerEmail: "alex@example.com",
          customerPhone: "07111111111",
          service: "Colour",
          status: "confirmed",
          startsAt: new Date("2026-03-10T14:00:00.000Z"),
          normalizedDate: "2026-03-10",
          time: "14:00",
          price: 140
        },
        {
          id: "low_risk",
          customerName: "Jordan",
          customerEmail: "jordan@example.com",
          customerPhone: "07222222222",
          service: "Cut",
          status: "confirmed",
          startsAt: new Date("2026-03-12T14:00:00.000Z"),
          normalizedDate: "2026-03-12",
          time: "14:00",
          price: 55
        }
      ],
      nowMs
    );

    expect(rows).toHaveLength(2);
    expect(rows[0].bookingId).toBe("high_risk");
    expect(rows[0].riskLevel).toBe("high");
    expect(rows[0].reasons.join(" ")).toMatch(/short lead time/i);
    expect(rows[1].bookingId).toBe("low_risk");
  });

  it("builds rebooking prompts only for clients without a future confirmed booking", () => {
    const nowMs = new Date("2026-03-10T10:00:00.000Z").getTime();
    const prompts = buildSubscriberRebookingPrompts(
      [
        {
          id: "past_eligible",
          customerName: "Taylor",
          customerEmail: "taylor@example.com",
          customerPhone: "07111111111",
          service: "Balayage",
          status: "confirmed",
          startsAt: new Date("2026-01-20T10:00:00.000Z"),
          normalizedDate: "2026-01-20",
          time: "10:00"
        },
        {
          id: "past_recent",
          customerName: "Casey",
          customerEmail: "casey@example.com",
          service: "Cut",
          status: "confirmed",
          startsAt: new Date("2026-02-25T10:00:00.000Z"),
          normalizedDate: "2026-02-25",
          time: "10:00"
        },
        {
          id: "past_with_future",
          customerName: "Morgan",
          customerEmail: "morgan@example.com",
          service: "Colour",
          status: "confirmed",
          startsAt: new Date("2026-01-10T10:00:00.000Z"),
          normalizedDate: "2026-01-10",
          time: "10:00"
        },
        {
          id: "future_existing",
          customerName: "Morgan",
          customerEmail: "morgan@example.com",
          service: "Colour",
          status: "confirmed",
          startsAt: new Date("2026-03-20T10:00:00.000Z"),
          normalizedDate: "2026-03-20",
          time: "10:00"
        }
      ],
      nowMs
    );

    expect(prompts).toHaveLength(1);
    expect(prompts[0].customerName).toBe("Taylor");
    expect(prompts[0].daysSinceLastVisit).toBeGreaterThanOrEqual(28);
    expect(prompts[0].suggestedMessage).toMatch(/new availability this week/i);
  });
});
