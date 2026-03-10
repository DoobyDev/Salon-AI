import { describe, expect, it } from "vitest";
import {
  buildAdminNotificationLexiPrompt,
  evaluateAdminNotificationHealth
} from "../public/dashboard-admin-notification-health.js";

describe("admin notification health helper", () => {
  it("marks zero-activity businesses with upcoming bookings as quiet", () => {
    const result = evaluateAdminNotificationHealth({
      stats: {
        notificationSentCount: 0,
        notificationFailedCount: 0,
        upcomingBookings: 6
      }
    });

    expect(result.status).toBe("quiet");
    expect(result.summary).toMatch(/no recent reminder delivery/i);
    expect(result.nextSteps[0]).toMatch(/check reminder settings/i);
  });

  it("marks all-failed delivery activity as critical", () => {
    const result = evaluateAdminNotificationHealth({
      stats: {
        notificationSentCount: 0,
        notificationFailedCount: 4,
        upcomingBookings: 3
      }
    });

    expect(result.status).toBe("critical");
    expect(result.failed).toBe(4);
    expect(result.summary).toMatch(/failing without any logged successes/i);
  });

  it("adds reminder-volume guidance for busy salons with low recent send activity", () => {
    const result = evaluateAdminNotificationHealth({
      stats: {
        notificationSentCount: 1,
        notificationFailedCount: 0,
        upcomingBookings: 10
      }
    });

    expect(result.issues.some((item) => /healthy number of upcoming bookings/i.test(item))).toBe(true);
    expect(result.nextSteps.some((item) => /review reminder timing/i.test(item))).toBe(true);
  });

  it("builds a Lexi checks prompt using the evaluated health summary", () => {
    const prompt = buildAdminNotificationLexiPrompt(
      {
        name: "Glow Studio",
        stats: {
          notificationSentCount: 2,
          notificationFailedCount: 5,
          upcomingBookings: 8
        }
      },
      "checks"
    );

    expect(prompt).toMatch(/Glow Studio/);
    expect(prompt).toMatch(/notification delivery/i);
    expect(prompt).toMatch(/Failed sends: 5/);
    expect(prompt).toMatch(/Successful sends: 2/);
  });
});
