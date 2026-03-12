import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { app, prisma } from "../server.js";

function makeToken(payload = {}) {
  return jwt.sign(
    {
      sub: payload.sub || "admin_1",
      role: payload.role || "admin",
      email: payload.email || "admin@example.com",
      businessId: payload.businessId || null
    },
    process.env.JWT_SECRET || "dev-insecure-change-me",
    { expiresIn: "1h" }
  );
}

beforeEach(() => {
  prisma.booking = {
    findMany: vi.fn().mockResolvedValue([
      {
        id: "booking_1",
        businessId: "biz_1",
        businessName: "North Lane Studio",
        customerEmail: "preview@example.com",
        customerName: "Ava Hart",
        service: "Cut",
        date: "2026-03-20",
        status: "confirmed",
        notes: null
      }
    ])
  };
  prisma.user = {
    findFirst: vi.fn().mockResolvedValue({
      name: "Ava Hart",
      email: "preview@example.com"
    }),
    findUnique: vi.fn()
  };
  prisma.business = {
    findUnique: vi.fn().mockResolvedValue({
      id: "biz_1",
      name: "North Lane Studio"
    })
  };
});

describe("customer dashboard admin preview", () => {
  it("lets admins preview customer dashboard analytics for a specific customer email", async () => {
    const token = makeToken();
    const res = await request(app)
      .get("/api/dashboard/customer?customerEmail=preview@example.com")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(prisma.booking.findMany).toHaveBeenCalledWith({
      where: { customerEmail: "preview@example.com" }
    });
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { email: "preview@example.com" },
      select: { name: true, email: true }
    });
    expect(res.body.analytics.totalBookings).toBe(1);
    expect(res.body.analytics.upcomingBookings).toBe(1);
  });
});
