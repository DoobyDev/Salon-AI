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

function uniqueBusinessId(prefix = "biz_profit") {
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

describe("profitability summary api", () => {
  it("returns default profitability summary", async () => {
    prisma.booking.findMany.mockResolvedValue([]);
    const token = makeToken({ role: "subscriber", businessId: uniqueBusinessId("biz_profit_default") });
    const res = await request(app).get("/api/profitability-summary").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.summary.grossRevenue).toBe(0);
    expect(res.body.summary.totalCosts).toBe(0);
    expect(Array.isArray(res.body.payrollEntries)).toBe(true);
  });

  it("upserts payroll and costs, then computes profit summary", async () => {
    const businessId = uniqueBusinessId("biz_profit_compute");
    const token = makeToken({ role: "subscriber", businessId });
    prisma.booking.findMany.mockResolvedValue([
      { id: "b1", status: "confirmed", price: 200 },
      { id: "b2", status: "completed", price: 100 },
      { id: "b3", status: "cancelled", price: 90 }
    ]);

    const payrollRes = await request(app)
      .post("/api/profitability/payroll/upsert")
      .set("Authorization", `Bearer ${token}`)
      .send({
        staffName: "Jordan Miles",
        role: "Barber",
        hours: 10,
        hourlyRate: 20,
        bonus: 15
      });
    expect(payrollRes.status).toBe(200);
    expect(payrollRes.body.summary.payrollTotal).toBe(215);
    const payrollEntryId = payrollRes.body.payrollEntry.id;
    expect(payrollEntryId).toBeTruthy();

    const costsRes = await request(app)
      .post("/api/profitability/costs/upsert")
      .set("Authorization", `Bearer ${token}`)
      .send({
        rent: 100,
        utilities: 50,
        software: 25,
        other: 10,
        cogsPercent: 10
      });
    expect(costsRes.status).toBe(200);
    expect(costsRes.body.summary.grossRevenue).toBe(300);
    expect(costsRes.body.summary.cogsAmount).toBe(30);
    expect(costsRes.body.summary.fixedCostsTotal).toBe(185);
    expect(costsRes.body.summary.totalCosts).toBe(430);
    expect(costsRes.body.summary.estimatedProfit).toBe(-130);
  });

  it("removes payroll entry", async () => {
    const businessId = uniqueBusinessId("biz_profit_remove");
    const token = makeToken({ role: "subscriber", businessId });
    prisma.booking.findMany.mockResolvedValue([{ id: "b1", status: "confirmed", price: 80 }]);

    const payrollRes = await request(app)
      .post("/api/profitability/payroll/upsert")
      .set("Authorization", `Bearer ${token}`)
      .send({
        staffName: "Amira Cole",
        role: "Stylist",
        hours: 5,
        hourlyRate: 30,
        bonus: 0
      });
    expect(payrollRes.status).toBe(200);
    const entryId = payrollRes.body.payrollEntry.id;

    const deleteRes = await request(app)
      .delete(`/api/profitability/payroll/${entryId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.summary.payrollTotal).toBe(0);
    expect(deleteRes.body.payrollEntries).toHaveLength(0);
  });

  it("validates and restricts profitability routes", async () => {
    const token = makeToken({ role: "subscriber", businessId: uniqueBusinessId("biz_profit_validate") });
    const invalid = await request(app)
      .post("/api/profitability/costs/upsert")
      .set("Authorization", `Bearer ${token}`)
      .send({
        rent: 100,
        utilities: 50,
        software: 25,
        other: 10,
        cogsPercent: 99
      });
    expect(invalid.status).toBe(400);
    expect(invalid.body.error).toContain("COGS percent");

    const customerToken = makeToken({ role: "customer", businessId: null, email: "customer@example.com" });
    const forbidden = await request(app)
      .get("/api/profitability-summary")
      .set("Authorization", `Bearer ${customerToken}`);
    expect(forbidden.status).toBe(403);
  });
});
