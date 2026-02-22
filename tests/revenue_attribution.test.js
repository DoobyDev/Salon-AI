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

function uniqueBusinessId(prefix = "biz_revenue") {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

beforeEach(() => {
  prisma.booking = {
    findMany: vi.fn()
  };
  prisma.auditLog = {
    create: vi.fn().mockResolvedValue({})
  };
});

describe("revenue attribution api", () => {
  it("returns channel rollups and summary", async () => {
    prisma.booking.findMany.mockResolvedValue([
      { id: "b1", source: "manual", status: "confirmed", price: 120 },
      { id: "b2", source: "manual", status: "completed", price: 80 },
      { id: "b3", source: "instagram", status: "confirmed", price: 150 },
      { id: "b4", source: "ai", status: "cancelled", price: 90 }
    ]);

    const token = makeToken({ role: "subscriber", businessId: uniqueBusinessId("biz_revenue_rollup") });
    const res = await request(app).get("/api/revenue-attribution").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.channels)).toBe(true);
    expect(res.body.summary.totalRevenue).toBe(350);
    expect(res.body.summary.totalAttributedBookings).toBe(3);

    const direct = res.body.channels.find((row) => row.channel === "direct");
    expect(direct).toBeTruthy();
    expect(direct.bookings).toBe(2);
    expect(direct.revenue).toBe(200);

    const instagram = res.body.channels.find((row) => row.channel === "instagram");
    expect(instagram).toBeTruthy();
    expect(instagram.bookings).toBe(1);
    expect(instagram.revenue).toBe(150);
  });

  it("applies spend and computes roi", async () => {
    const businessId = uniqueBusinessId("biz_revenue_spend");
    prisma.booking.findMany.mockResolvedValue([
      { id: "b1", source: "manual", status: "confirmed", price: 300 },
      { id: "b2", source: "instagram", status: "confirmed", price: 200 }
    ]);
    const token = makeToken({ role: "subscriber", businessId });

    const saveRes = await request(app)
      .post("/api/revenue-attribution/spend")
      .set("Authorization", `Bearer ${token}`)
      .send({ channel: "manual", spend: 100 });
    expect(saveRes.status).toBe(200);

    const direct = saveRes.body.channels.find((row) => row.channel === "direct");
    expect(direct).toBeTruthy();
    expect(direct.spend).toBe(100);
    expect(direct.roiPercent).toBe(200);

    const readRes = await request(app).get("/api/revenue-attribution").set("Authorization", `Bearer ${token}`);
    expect(readRes.status).toBe(200);
    const persistedDirect = readRes.body.channels.find((row) => row.channel === "direct");
    expect(persistedDirect.spend).toBe(100);
  });

  it("validates spend payload", async () => {
    const token = makeToken({ role: "subscriber", businessId: uniqueBusinessId("biz_revenue_invalid") });
    const res = await request(app)
      .post("/api/revenue-attribution/spend")
      .set("Authorization", `Bearer ${token}`)
      .send({ channel: "instagram", spend: -10 });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Spend must be");
  });

  it("rejects non-subscriber roles", async () => {
    const token = makeToken({ role: "customer", businessId: null, email: "customer@example.com" });
    const res = await request(app).get("/api/revenue-attribution").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});
