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
    create: vi.fn().mockResolvedValue({})
  };
});

describe("crm segments and campaign logging", () => {
  it("builds CRM segments for subscriber business", async () => {
    prisma.booking.findMany.mockResolvedValue([
      {
        id: "h1",
        customerName: "Ava Thompson",
        customerEmail: "ava@example.com",
        customerPhone: "+12025550111",
        service: "Balayage",
        price: 150,
        status: "completed",
        date: toDateString(-60),
        time: "10:00"
      },
      {
        id: "h2",
        customerName: "Ava Thompson",
        customerEmail: "ava@example.com",
        customerPhone: "+12025550111",
        service: "Cut + Color",
        price: 170,
        status: "completed",
        date: toDateString(-40),
        time: "11:00"
      },
      {
        id: "n1",
        customerName: "Daniel Ruiz",
        customerEmail: "daniel@example.com",
        customerPhone: "+12025550112",
        service: "Skin Fade",
        price: 45,
        status: "completed",
        date: toDateString(-10),
        time: "12:00"
      }
    ]);

    const token = makeToken({ role: "subscriber", businessId: "biz_1" });
    const res = await request(app).get("/api/crm/segments").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.segments)).toBe(true);
    expect(res.body.summary.totalCustomers).toBe(2);

    const highValue = res.body.segments.find((s) => s.id === "high_value_lapsed");
    expect(highValue).toBeTruthy();
    expect(Array.isArray(highValue.leads)).toBe(true);
    expect(highValue.leads.some((lead) => lead.customerKey === "email:ava@example.com")).toBe(true);

    const newClients = res.body.segments.find((s) => s.id === "new_clients_followup");
    expect(newClients).toBeTruthy();
    expect(newClients.leads.some((lead) => lead.customerKey === "email:daniel@example.com")).toBe(true);
  });

  it("rejects non-subscriber access to CRM segments", async () => {
    const token = makeToken({ role: "customer", businessId: null, email: "customer@example.com" });
    const res = await request(app).get("/api/crm/segments").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it("logs CRM campaign send events", async () => {
    const token = makeToken({ role: "subscriber", businessId: "biz_1" });
    const res = await request(app)
      .post("/api/crm/campaigns/send")
      .set("Authorization", `Bearer ${token}`)
      .send({
        segmentId: "high_value_lapsed",
        customerKey: "email:ava@example.com",
        customerName: "Ava Thompson",
        message: "Welcome back offer for this week.",
        channel: "manual"
      });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(prisma.auditLog.create).toHaveBeenCalledTimes(1);
  });

  it("validates required campaign payload fields", async () => {
    const token = makeToken({ role: "subscriber", businessId: "biz_1" });
    const res = await request(app)
      .post("/api/crm/campaigns/send")
      .set("Authorization", `Bearer ${token}`)
      .send({
        segmentId: "high_value_lapsed",
        customerKey: "email:ava@example.com",
        customerName: "Ava Thompson"
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Campaign message is required.");
  });
});
