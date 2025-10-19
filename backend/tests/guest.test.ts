import { describe, expect, test } from "vitest";
import request from "supertest";
import app from "@src/server"; // Adjust import if your Express app is exported differently

describe("Guest API Endpoints", () => {
  test("GET /api/guest should return guests", async () => {
    const res = await request(app).get("/api/guest");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.guests)).toBe(true);
  });

  test("POST /api/guest should create a guest", async () => {
    const guestData = {
      nic: "123456789V",
      name: "Test Guest",
      age: 30,
      contact_no: "0771234567",
      email: "testguest@example.com"
    };
    const res = await request(app).post("/api/guest").send(guestData);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.guest).toMatchObject(guestData);
  });

  test("GET /api/guest/:id should return a guest or 404", async () => {
    const res = await request(app).get("/api/guest/1");
    expect([200, 404]).toContain(res.status);
  });

  test("PUT /api/guest/:id should update a guest", async () => {
    const updateData = { name: "Updated Name" };
    const res = await request(app).put("/api/guest/1").send(updateData);
    expect([200, 404]).toContain(res.status);
  });

  test("DELETE /api/guest/:id should delete a guest", async () => {
    const res = await request(app).delete("/api/guest/1");
    expect([200, 404]).toContain(res.status);
  });
});