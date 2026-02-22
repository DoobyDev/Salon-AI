import { describe, it, expect } from "vitest";
import jwt from "jsonwebtoken";
import request from "supertest";
import { app } from "../server.js";

function makeToken(payload = {}) {
  return jwt.sign(
    {
      sub: payload.sub || "subscriber_waitlist",
      role: payload.role || "subscriber",
      email: payload.email || "owner@example.com",
      businessId: payload.businessId || `biz_waitlist_${Date.now()}`
    },
    process.env.JWT_SECRET || "dev-insecure-change-me",
    { expiresIn: "1h" }
  );
}

describe("waitlist operations", () => {
  it("supports add, contact(backfill), and remove lifecycle", async () => {
    const businessId = `biz_waitlist_${Date.now()}`;
    const token = makeToken({ businessId });

    const createRes = await request(app)
      .post("/api/waitlist/upsert")
      .set("Authorization", `Bearer ${token}`)
      .send({
        customerName: "Taylor Knox",
        customerPhone: "+12025550199",
        service: "Skin Fade"
      });
    expect(createRes.status).toBe(200);
    expect(createRes.body.entry.customerName).toBe("Taylor Knox");
    const entryId = createRes.body.entry.id;
    expect(typeof entryId).toBe("string");

    const listRes = await request(app).get("/api/waitlist").set("Authorization", `Bearer ${token}`);
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.entries)).toBe(true);
    expect(listRes.body.entries.some((entry) => entry.id === entryId)).toBe(true);
    expect(listRes.body.summary.totalEntries).toBeGreaterThanOrEqual(1);

    const contactRes = await request(app)
      .post(`/api/waitlist/${entryId}/backfill`)
      .set("Authorization", `Bearer ${token}`)
      .send({});
    expect(contactRes.status).toBe(200);
    expect(contactRes.body.entry.status).toBe("contacted");

    const removeRes = await request(app)
      .delete(`/api/waitlist/${entryId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(removeRes.status).toBe(200);
    expect(removeRes.body.entries.some((entry) => entry.id === entryId)).toBe(false);
  });

  it("rejects customer role access", async () => {
    const token = makeToken({ role: "customer", businessId: null, email: "customer@example.com" });
    const res = await request(app).get("/api/waitlist").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it("records rebooking prompt sent activity", async () => {
    const token = makeToken({ businessId: `biz_ops_${Date.now()}` });
    const res = await request(app)
      .post("/api/operations/rebooking/mark-sent")
      .set("Authorization", `Bearer ${token}`)
      .send({ customerKey: "email:test@example.com", customerName: "Test", service: "Haircut" });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
