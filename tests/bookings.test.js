import { describe, it, expect, beforeEach, vi } from "vitest";
import jwt from "jsonwebtoken";
import request from "supertest";
import { app, prisma } from "../server.js";

function makeToken(payload = {}) {
  return jwt.sign(
    {
      sub: payload.sub || "user_1",
      role: payload.role || "customer",
      email: payload.email || "customer@example.com",
      businessId: payload.businessId || null
    },
    process.env.JWT_SECRET || "dev-insecure-change-me",
    { expiresIn: "1h" }
  );
}

function allDayHoursJson() {
  return JSON.stringify({
    sun: "00:00-23:59",
    mon: "00:00-23:59",
    tue: "00:00-23:59",
    wed: "00:00-23:59",
    thu: "00:00-23:59",
    fri: "00:00-23:59",
    sat: "00:00-23:59"
  });
}

beforeEach(() => {
  prisma.booking = {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    create: vi.fn().mockResolvedValue({ id: "new_booking", status: "confirmed" })
  };
  prisma.business = {
    findUnique: vi.fn().mockResolvedValue({
      id: "biz_1",
      name: "Glow",
      hoursJson: allDayHoursJson(),
      services: [{ name: "Haircut", durationMin: 45, price: 45 }]
    })
  };
  prisma.auditLog = {
    create: vi.fn().mockResolvedValue({})
  };
});

describe("public bookings", () => {
  it("returns sanitized demo bookings", async () => {
    prisma.booking.findMany.mockResolvedValue([
      {
        id: "b1",
        customerName: "Alex",
        service: "Haircut",
        date: "2026-02-21",
        time: "14:00",
        businessName: "Glow"
      }
    ]);

    const res = await request(app).get("/api/bookings/public-demo");
    expect(res.status).toBe(200);
    expect(res.body.bookings[0].customerName).toBe("A***");
  });
});

describe("booking lifecycle", () => {
  it("paginates my bookings with next cursor", async () => {
    prisma.booking.findMany.mockResolvedValue([
      { id: "b3", createdAt: new Date("2026-02-20T12:00:00.000Z"), status: "confirmed" },
      { id: "b2", createdAt: new Date("2026-02-19T12:00:00.000Z"), status: "confirmed" },
      { id: "b1", createdAt: new Date("2026-02-18T12:00:00.000Z"), status: "confirmed" }
    ]);

    const token = makeToken({ email: "customer@example.com", role: "customer" });
    const res = await request(app)
      .get("/api/me/bookings?limit=2")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.bookings).toHaveLength(2);
    expect(res.body.pagination.hasMore).toBe(true);
    expect(typeof res.body.pagination.nextCursor).toBe("string");
  });

  it("requires auth for cancel", async () => {
    const res = await request(app).patch("/api/bookings/b1/cancel");
    expect(res.status).toBe(401);
  });

  it("cancels a booking for the booking owner", async () => {
    prisma.booking.findUnique.mockResolvedValue({
      id: "b1",
      businessId: "biz_1",
      customerEmail: "customer@example.com",
      date: "2026-02-21",
      time: "14:00",
      status: "confirmed"
    });
    prisma.booking.update.mockResolvedValue({
      id: "b1",
      status: "cancelled"
    });

    const token = makeToken({ email: "customer@example.com", role: "customer" });
    const res = await request(app)
      .patch("/api/bookings/b1/cancel")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.booking.status).toBe("cancelled");
    expect(typeof res.body.policy.feeApplied).toBe("boolean");
  });

  it("rejects conflicting reschedule slots", async () => {
    const businessId = `biz_conflict_${Date.now()}`;
    prisma.booking.findUnique.mockResolvedValue({
      id: "b1",
      businessId,
      customerEmail: "customer@example.com",
      service: "Haircut",
      date: "2026-02-21",
      time: "14:00",
      status: "confirmed"
    });
    prisma.business.findUnique.mockResolvedValue({
      id: businessId,
      name: "Glow",
      hoursJson: allDayHoursJson(),
      services: [{ name: "Haircut", durationMin: 45, price: 45 }]
    });
    prisma.booking.findFirst.mockResolvedValue({
      id: "b2"
    });

    const token = makeToken({ email: "customer@example.com", role: "customer" });
    const res = await request(app)
      .patch("/api/bookings/b1/reschedule")
      .set("Authorization", `Bearer ${token}`)
      .send({ date: "2026-02-22", time: "10:00" });

    expect([400, 409]).toContain(res.status);
  });
});

describe("booking guardrails", () => {
  it("rejects booking when service is not offered", async () => {
    prisma.business.findUnique.mockResolvedValue({
      id: "biz_1",
      name: "Glow",
      hoursJson: allDayHoursJson(),
      services: [{ name: "Color", durationMin: 90, price: 130 }]
    });

    const res = await request(app).post("/api/bookings").send({
      businessId: "biz_1",
      customerName: "Alex",
      customerPhone: "+12025550111",
      service: "Haircut",
      date: "2026-02-22",
      time: "10:00"
    });

    expect(res.status).toBe(400);
    expect(String(res.body.error || "").toLowerCase()).toContain("service");
  });

  it("rejects booking outside business hours for service duration", async () => {
    prisma.business.findUnique.mockResolvedValue({
      id: "biz_1",
      name: "Glow",
      hoursJson: JSON.stringify({
        sun: "09:00-17:00",
        mon: "09:00-17:00",
        tue: "09:00-17:00",
        wed: "09:00-17:00",
        thu: "09:00-17:00",
        fri: "09:00-17:00",
        sat: "09:00-17:00"
      }),
      services: [{ name: "Haircut", durationMin: 60, price: 45 }]
    });

    const res = await request(app).post("/api/bookings").send({
      businessId: "biz_1",
      customerName: "Alex",
      customerPhone: "+12025550111",
      service: "Haircut",
      date: "2026-02-22",
      time: "23:00"
    });

    expect(res.status).toBe(400);
    expect(String(res.body.error || "").toLowerCase()).toContain("outside operating hours");
  });
});
