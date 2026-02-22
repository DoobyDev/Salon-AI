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
    count: vi.fn().mockResolvedValue(7)
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
});
