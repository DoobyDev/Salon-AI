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

function uniqueBusinessId(prefix = "biz_commercial") {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

beforeEach(() => {
  prisma.auditLog = {
    create: vi.fn().mockResolvedValue({})
  };
});

describe("commercial controls api", () => {
  it("creates membership, package, and gift card records", async () => {
    const businessId = uniqueBusinessId("biz_controls_create");
    const token = makeToken({ role: "subscriber", businessId });

    const membershipRes = await request(app)
      .post("/api/commercial-controls/memberships/upsert")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "VIP Membership",
        price: 89,
        billingCycle: "monthly",
        benefits: "Priority booking"
      });
    expect(membershipRes.status).toBe(200);
    expect(membershipRes.body.membership.name).toBe("VIP Membership");

    const packageRes = await request(app)
      .post("/api/commercial-controls/packages/upsert")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "5x Beard Trim",
        price: 110,
        sessionCount: 5
      });
    expect(packageRes.status).toBe(200);
    expect(packageRes.body.package.name).toBe("5x Beard Trim");

    const giftRes = await request(app)
      .post("/api/commercial-controls/gift-cards/issue")
      .set("Authorization", `Bearer ${token}`)
      .send({
        purchaserName: "Ava Thompson",
        recipientName: "Daniel Ruiz",
        initialBalance: 150
      });
    expect(giftRes.status).toBe(200);
    expect(giftRes.body.giftCard.remainingBalance).toBe(150);

    const summaryRes = await request(app)
      .get("/api/commercial-controls")
      .set("Authorization", `Bearer ${token}`);
    expect(summaryRes.status).toBe(200);
    expect(summaryRes.body.summary.activeMemberships).toBe(1);
    expect(summaryRes.body.summary.activePackages).toBe(1);
    expect(summaryRes.body.summary.activeGiftCards).toBe(1);
    expect(summaryRes.body.summary.outstandingGiftBalance).toBe(150);
  });

  it("redeems gift-card balance", async () => {
    const businessId = uniqueBusinessId("biz_controls_redeem");
    const token = makeToken({ role: "subscriber", businessId });

    const giftRes = await request(app)
      .post("/api/commercial-controls/gift-cards/issue")
      .set("Authorization", `Bearer ${token}`)
      .send({
        purchaserName: "Lina Patel",
        recipientName: "Owen Price",
        initialBalance: 120
      });
    expect(giftRes.status).toBe(200);
    const giftCardId = giftRes.body.giftCard.id;

    const redeemRes = await request(app)
      .post(`/api/commercial-controls/gift-cards/${giftCardId}/redeem`)
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 45 });
    expect(redeemRes.status).toBe(200);
    expect(redeemRes.body.giftCard.remainingBalance).toBe(75);
    expect(redeemRes.body.giftCard.status).toBe("active");
  });

  it("validates redeem amount against remaining balance", async () => {
    const businessId = uniqueBusinessId("biz_controls_validate");
    const token = makeToken({ role: "subscriber", businessId });

    const giftRes = await request(app)
      .post("/api/commercial-controls/gift-cards/issue")
      .set("Authorization", `Bearer ${token}`)
      .send({
        purchaserName: "Lina Patel",
        recipientName: "Owen Price",
        initialBalance: 80
      });
    expect(giftRes.status).toBe(200);
    const giftCardId = giftRes.body.giftCard.id;

    const redeemRes = await request(app)
      .post(`/api/commercial-controls/gift-cards/${giftCardId}/redeem`)
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 120 });
    expect(redeemRes.status).toBe(400);
    expect(redeemRes.body.error).toContain("exceeds remaining balance");
  });

  it("blocks customer role from commercial controls", async () => {
    const token = makeToken({ role: "customer", businessId: null, email: "customer@example.com" });
    const res = await request(app)
      .get("/api/commercial-controls")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});
