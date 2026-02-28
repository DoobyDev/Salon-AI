import { describe, it, expect } from "vitest";
import jwt from "jsonwebtoken";
import request from "supertest";
import { app } from "../server.js";

function makeToken(payload = {}) {
  return jwt.sign(
    {
      sub: payload.sub || "subscriber_staff",
      role: payload.role || "subscriber",
      email: payload.email || "owner@example.com",
      businessId: payload.businessId || `biz_staff_${Date.now()}`
    },
    process.env.JWT_SECRET || "dev-insecure-change-me",
    { expiresIn: "1h" }
  );
}

describe("staff roster operations", () => {
  it("supports member lifecycle and rota updates", async () => {
    const businessId = `biz_staff_${Date.now()}`;
    const token = makeToken({ businessId });

    const createRes = await request(app)
      .post("/api/staff-roster/upsert")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Jordan",
        role: "Barber",
        availability: "on_duty",
        shiftDays: ["mon", "tue"]
      });

    expect(createRes.status).toBe(200);
    expect(createRes.body.member.name).toBe("Jordan");
    const staffId = createRes.body.member.id;

    const availabilityRes = await request(app)
      .post(`/api/staff-roster/${staffId}/availability`)
      .set("Authorization", `Bearer ${token}`)
      .send({ availability: "off_duty" });
    expect(availabilityRes.status).toBe(200);
    expect(availabilityRes.body.member.availability).toBe("off_duty");

    const rotaRes = await request(app)
      .post("/api/staff-roster/rota/bulk")
      .set("Authorization", `Bearer ${token}`)
      .send({
        weekStart: "2026-02-23",
        updates: [{ staffId, day: "mon", status: "scheduled", shift: "am" }]
      });
    expect(rotaRes.status).toBe(200);
    expect(rotaRes.body.weekStart).toBe("2026-02-23");
    expect(rotaRes.body.cells?.[staffId]?.mon?.status).toBe("scheduled");

    const resetRes = await request(app)
      .post("/api/staff-roster/rota/reset")
      .set("Authorization", `Bearer ${token}`)
      .send({ weekStart: "2026-02-23" });
    expect(resetRes.status).toBe(200);
    expect(resetRes.body.weekStart).toBe("2026-02-23");
    expect(Object.keys(resetRes.body.cells || {})).toHaveLength(0);

    const deleteRes = await request(app)
      .delete(`/api/staff-roster/${staffId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.members.some((member) => member.id === staffId)).toBe(false);
  });
});
