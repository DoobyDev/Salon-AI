import { beforeEach, describe, expect, it, vi } from "vitest";
import jwt from "jsonwebtoken";
import request from "supertest";
import { app, prisma } from "../server.js";

function makeToken(payload = {}) {
  return jwt.sign(
    {
      sub: payload.sub || "subscriber_1",
      role: payload.role || "subscriber",
      email: payload.email || "owner@example.com",
      businessId: payload.businessId || "biz_1"
    },
    process.env.JWT_SECRET || "dev-insecure-change-me",
    { expiresIn: "1h" }
  );
}

function toDateString(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

beforeEach(() => {
  prisma.booking = {
    findMany: vi.fn()
  };
  prisma.auditLog = {
    count: vi.fn().mockResolvedValue(7),
    findMany: vi.fn().mockResolvedValue([])
  };
});

describe("subscriber dashboard command center", () => {
  it("returns command center metrics and high-priority actions", async () => {
    prisma.booking.findMany.mockResolvedValue([
      { id: "b1", date: toDateString(0), time: "09:00", status: "confirmed", price: 60 },
      { id: "b2", date: toDateString(0), time: "12:00", status: "confirmed", price: 90 },
      { id: "b3", date: toDateString(0), time: "15:00", status: "cancelled", price: 50 },
      { id: "b4", date: toDateString(1), time: "11:00", status: "confirmed", price: 120 },
      { id: "b5", date: toDateString(8), time: "10:30", status: "confirmed", price: 85 },
      { id: "b6", date: toDateString(-1), time: "14:00", status: "cancelled", price: 40 }
    ]);

    const token = makeToken({ role: "subscriber", businessId: "biz_1" });
    const res = await request(app).get("/api/dashboard/subscriber").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.commandCenter.today.totalBookings).toBe(3);
    expect(res.body.commandCenter.today.confirmedBookings).toBe(2);
    expect(res.body.commandCenter.today.estimatedRevenue).toBe(150);
    expect(res.body.commandCenter.today.lastMinuteCancellations).toBe(1);
    expect(res.body.commandCenter.next7Days.confirmedBookings).toBe(3);
    expect(res.body.commandCenter.next7Days.estimatedRevenue).toBe(270);
    expect(res.body.commandCenter.serviceHealth.cancellationRate).toBe(33.3);
    expect(Array.isArray(res.body.operationsInsights.noShowRisk)).toBe(true);
    expect(Array.isArray(res.body.operationsInsights.rebookingPrompts)).toBe(true);

    const actionIds = res.body.commandCenter.recommendedActions.map((a) => a.id);
    expect(actionIds).toContain("fill-cancellations");
    expect(actionIds).toContain("boost-today-demand");
    expect(actionIds).toContain("tighten-confirmations");
  });

  it("returns maintain-momentum action for healthy booking flow", async () => {
    prisma.booking.findMany.mockResolvedValue([
      { id: "b1", date: toDateString(0), time: "09:00", status: "confirmed", price: 60 },
      { id: "b2", date: toDateString(0), time: "12:00", status: "confirmed", price: 90 },
      { id: "b3", date: toDateString(0), time: "15:00", status: "confirmed", price: 70 },
      { id: "b4", date: toDateString(1), time: "10:30", status: "confirmed", price: 85 }
    ]);

    const token = makeToken({ role: "subscriber", businessId: "biz_1" });
    const res = await request(app).get("/api/dashboard/subscriber").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.commandCenter.serviceHealth.cancellationRate).toBe(0);
    expect(res.body.commandCenter.recommendedActions).toHaveLength(1);
    expect(res.body.commandCenter.recommendedActions[0].id).toBe("maintain-momentum");
  });

  it("rejects non-subscriber roles", async () => {
    const token = makeToken({ role: "customer", businessId: null, email: "customer@example.com" });
    const res = await request(app).get("/api/dashboard/subscriber").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it("surfaces setup-incomplete readiness when live channels are not configured", async () => {
    prisma.booking.findMany.mockResolvedValue([
      {
        id: "b1",
        businessId: "biz_1",
        customerName: "Alex",
        customerEmail: "alex@example.com",
        customerPhone: "07123456789",
        service: "Cut",
        date: toDateString(1),
        time: "10:00",
        status: "confirmed",
        price: 60
      }
    ]);

    const token = makeToken({ role: "subscriber", businessId: "biz_1" });
    const res = await request(app)
      .get("/api/dashboard/subscriber")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.communications.readiness.status).toBe("setup");
    expect(res.body.communications.readiness.label).toBe("Setup incomplete");
    expect(res.body.communications.readiness.summary).toMatch(/not configured/i);
  });

  it("lists reminders due soon and distinguishes scheduled reminder delivery logs", async () => {
    const now = new Date();
    const bookingDate = toDateString(1);
    const dueSoonTime = `${String((now.getHours() + 2) % 24).padStart(2, "0")}:00`;

    prisma.booking.findMany.mockResolvedValue([
      {
        id: "b_due",
        businessId: "biz_1",
        customerName: "Taylor",
        customerEmail: "taylor@example.com",
        customerPhone: "07111111111",
        service: "Colour",
        date: bookingDate,
        time: dueSoonTime,
        status: "confirmed",
        price: 120
      }
    ]);
    prisma.auditLog.findMany.mockResolvedValue([
      {
        action: "notification.delivery",
        createdAt: new Date().toISOString(),
        metadata: JSON.stringify({
          businessId: "biz_1",
          deliveryType: "scheduled_reminder",
          outcome: "sent"
        })
      },
      {
        action: "booking.reminder_marked",
        createdAt: new Date().toISOString(),
        metadata: JSON.stringify({
          businessId: "biz_1"
        })
      }
    ]);

    const token = makeToken({ role: "subscriber", businessId: "biz_1" });
    const res = await request(app)
      .get("/api/dashboard/subscriber")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.communications.summary.remindersLogged).toBe(1);
    expect(res.body.communications.summary.scheduledReminderNotificationsSent).toBe(1);
    expect(Array.isArray(res.body.communications.dueSoon)).toBe(true);
    expect(res.body.communications.dueSoon.length).toBeGreaterThan(0);
    expect(res.body.communications.dueSoon[0].bookingId).toBe("b_due");
    expect(res.body.communications.dueSoon[0].reachable).toBe(true);
  });
});
