import mongoose from "mongoose";
import request, { Response } from "supertest";
import app from "../app.js";

describe("Text Analyzer API Routes", () => {
  let token: string | undefined;

  let createdId: string | undefined;

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("Public Routes", () => {
    it("should return new user", async () => {
      const res: Response = await request(app)
        .post("/api/auth/register_user")
        .send({
          name: "test",
          email: "test@gmail.com",
          password: "123456",
          role: "user",
        });
      expect(res.statusCode).toBe(200);
      expect(res.body._id).toBeDefined();
      createdId = res.body._id;
    });

    it("should return tokens after login", async () => {
      const res: Response = await request(app).post("/api/auth/login").send({
        email: "test@gmail.com",
        password: "123456",
      });
      expect(res.statusCode).toBe(200);
      expect(res.body.access_token).toBeDefined();
      token = res.body.access_token;
    });
  });

  describe("Protected Routes", () => {
    it("should get one user by ID", async () => {
      if (!createdId) {
        console.log("Skipping test: No ID was created");
        return;
      }
      const res: Response = await request(app)
        .get(`/api/auth/get_one_user/${createdId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body._id).toBeDefined();
    });

    it("should delete one user by ID", async () => {
      if (!createdId) {
        console.log("Skipping test: No ID was created");
        return;
      }
      const res: Response = await request(app)
        .delete(`/api/auth/delete_user/${createdId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
    });
  });
});
