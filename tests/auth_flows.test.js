import { beforeEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";
import request from "supertest";
import { app, prisma } from "../server.js";

beforeEach(() => {
  prisma.user = {
    findUnique: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockImplementation(async ({ data }) => ({
      id: "user_1",
      role: data.role,
      email: data.email,
      name: data.name,
      businessId: data.businessId || null,
      passwordHash: data.passwordHash
    }))
  };
  prisma.business = {
    create: vi.fn().mockResolvedValue({ id: "biz_1" }),
    findFirst: vi.fn().mockResolvedValue({ id: "biz_1" })
  };
  prisma.auditLog = {
    create: vi.fn().mockResolvedValue({})
  };
});

describe("auth flows", () => {
  it("registers a subscriber and returns a token", async () => {
    const res = await request(app).post("/api/auth/register/subscriber").send({
      name: "Alex Owner",
      email: "alex@example.com",
      password: "StrongPass123!",
      businessName: "Glow Studio",
      businessType: "hair_salon",
      city: "London",
      country: "UK",
      postcode: "SW1A 1AA",
      phone: "+447700900123",
      websiteUrl: "https://glow.example.com",
      teamSize: "2-5",
      primaryGoal: "more_bookings",
      setupNotes: "Need onboarding help",
      paymentConsentAccepted: true
    });

    expect(res.status).toBe(201);
    expect(typeof res.body.token).toBe("string");
    expect(res.body.user.email).toBe("alex@example.com");
    expect(res.body.user.role).toBe("subscriber");
    expect(prisma.business.create).toHaveBeenCalledTimes(1);
    expect(prisma.business.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          websiteUrl: "https://glow.example.com"
        })
      })
    );
    expect(prisma.user.create).toHaveBeenCalledTimes(1);
  });

  it("registers a customer with optional onboarding fields", async () => {
    const res = await request(app).post("/api/auth/register/customer").send({
      name: "Taylor",
      email: "taylor@example.com",
      password: "StrongPass123!",
      phone: "+447700900999",
      city: "London",
      preferredService: "colour",
      notes: "Prefers evening appointments",
      paymentConsentAccepted: true,
      termsAccepted: true,
      updatesOptIn: false
    });

    expect(res.status).toBe(201);
    expect(typeof res.body.token).toBe("string");
    expect(res.body.user.email).toBe("taylor@example.com");
    expect(res.body.user.role).toBe("customer");
    expect(prisma.user.create).toHaveBeenCalledTimes(1);
  });

  it("rejects login with invalid password", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: "user_1",
      role: "customer",
      name: "Taylor",
      email: "taylor@example.com",
      businessId: null,
      passwordHash: bcrypt.hashSync("correct-password", 4)
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "taylor@example.com",
      password: "wrong-password"
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid credentials.");
  });
});
