import { beforeEach, describe, expect, it, vi } from "vitest";
import jwt from "jsonwebtoken";
import request from "supertest";
import { app, prisma } from "../server.js";

function makeToken(payload = {}) {
  return jwt.sign(
    {
      sub: payload.sub || "user_1",
      role: payload.role || "subscriber",
      email: payload.email || "owner@example.com",
      businessId: payload.businessId || "biz_1"
    },
    process.env.JWT_SECRET || "dev-insecure-change-me",
    { expiresIn: "1h" }
  );
}

beforeEach(() => {
  prisma.business = {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn()
  };
  prisma.auditLog = {
    create: vi.fn().mockResolvedValue({})
  };
});

describe("admin managed businesses", () => {
  it("blocks non-admin users from listing managed businesses", async () => {
    const token = makeToken({ role: "subscriber", businessId: "biz_1" });
    const res = await request(app).get("/api/admin/businesses").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it("returns admin business options", async () => {
    prisma.business.findMany.mockResolvedValue([
      { id: "biz_1", name: "Glow Studio", type: "salon", city: "London", country: "UK" },
      { id: "biz_2", name: "North Fade", type: "barber", city: "Leeds", country: "UK" }
    ]);

    const token = makeToken({ role: "admin", businessId: null, email: "admin@example.com" });
    const res = await request(app).get("/api/admin/businesses").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.businesses)).toBe(true);
    expect(res.body.businesses).toHaveLength(2);
    expect(res.body.businesses[0].id).toBe("biz_1");
    expect(res.body.businesses[1].id).toBe("biz_2");
  });
});

describe("managed social media endpoints", () => {
  it("returns social-media payload for subscriber business", async () => {
    prisma.business.findUnique.mockResolvedValue({
      socialFacebook: "https://facebook.com/glow",
      socialInstagram: "https://instagram.com/glow",
      socialTwitter: "",
      socialLinkedin: "",
      socialTiktok: ""
    });

    const token = makeToken({ role: "subscriber", businessId: "biz_social_1" });
    const res = await request(app).get("/api/businesses/me/social-media").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.socialFacebook).toContain("facebook.com");
    expect(res.body.socialInstagram).toContain("instagram.com");
    expect(typeof res.body.customSocial).toBe("string");
    expect(typeof res.body.socialImageUrl).toBe("string");
  });

  it("supports admin business scoping via query parameter", async () => {
    prisma.business.findUnique.mockResolvedValue({
      socialFacebook: "",
      socialInstagram: "https://instagram.com/adminscope",
      socialTwitter: "",
      socialLinkedin: "",
      socialTiktok: ""
    });

    const token = makeToken({ role: "admin", businessId: null, email: "admin@example.com" });
    const res = await request(app)
      .get("/api/businesses/me/social-media?businessId=biz_admin_scope")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.socialInstagram).toContain("adminscope");
  });

  it("validates URL format on save", async () => {
    const token = makeToken({ role: "subscriber", businessId: "biz_social_invalid" });
    const res = await request(app)
      .post("/api/businesses/me/social-media")
      .set("Authorization", `Bearer ${token}`)
      .send({
        socialFacebook: "not-a-valid-url",
        socialInstagram: "https://instagram.com/ok"
      });

    expect(res.status).toBe(400);
    expect(String(res.body.error || "").toLowerCase()).toContain("invalid");
  });
});
