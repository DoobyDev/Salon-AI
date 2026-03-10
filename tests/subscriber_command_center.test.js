import { describe, expect, it } from "vitest";
import { buildSubscriberRecommendedActions } from "../src/services/subscriber_command_center.js";

describe("subscriber command center helper", () => {
  it("returns cancellation, demand, and confirmation actions when signals are weak", () => {
    const actions = buildSubscriberRecommendedActions({
      lateCancellations: [{ id: "c1" }],
      todayConfirmed: [{ id: "b1" }, { id: "b2" }],
      noShowRate: 33.3
    });

    expect(actions.map((action) => action.id)).toEqual([
      "fill-cancellations",
      "boost-today-demand",
      "tighten-confirmations"
    ]);
  });

  it("returns maintain-momentum when the day looks healthy", () => {
    const actions = buildSubscriberRecommendedActions({
      lateCancellations: [],
      todayConfirmed: [{ id: "b1" }, { id: "b2" }, { id: "b3" }],
      noShowRate: 0
    });

    expect(actions).toHaveLength(1);
    expect(actions[0].id).toBe("maintain-momentum");
  });
});
