import mongoose from "mongoose";
import request, { Response } from "supertest";
import app from "../app.js";

describe("Text Analyzer API Routes", () => {
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI2ODQxNzQ0YjMwMGM1MGZkYjAzNmZhMjQiLCJyb2xlIjoidXNlciIsImlhdCI6MTc0OTEyMTMwMSwiZXhwIjoxNzQ5MjA3NzAxfQ.UJ6-9CzY6qQGcFOX-6G_eKwtcLOjn56KiYbW_VE3mhM";

  const testText =
    "The quick brown fox jumps over the lazy dog. The lazy dog slept in the sun.";

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("Public Routes", () => {
    it("should return word count", async () => {
      const res: Response = await request(app)
        .post("/api/analyzer/word-count")
        .send({ text: testText });
      expect(res.statusCode).toBe(200);
      expect(res.body.wordCount).toBeDefined();
      expect(res.body.wordCount).toBe(16);
    });

    it("should return character count", async () => {
      const res: Response = await request(app)
        .post("/api/analyzer/character-count")
        .send({ text: testText });
      expect(res.statusCode).toBe(200);
      expect(res.body.characterCount).toBeDefined();
      expect(res.body.characterCount).toBe(75);
    });

    it("should return sentence count", async () => {
      const res: Response = await request(app)
        .post("/api/analyzer/sentence-count")
        .send({ text: testText });
      expect(res.statusCode).toBe(200);
      expect(res.body.sentenceCount).toBeDefined();
      expect(res.body.sentenceCount).toBe(2);
    });

    it("should return paragraph count", async () => {
      const res: Response = await request(app)
        .post("/api/analyzer/paragraph-count")
        .send({ text: testText });
      expect(res.statusCode).toBe(200);
      expect(res.body.paragraphCount).toBeDefined();
      expect(res.body.paragraphCount).toBe(1);
    });

    it("should return longest words", async () => {
      const res: Response = await request(app)
        .post("/api/analyzer/longest-words")
        .send({ text: testText });
      expect(res.statusCode).toBe(200);
      expect(res.body.longestWord).toBeDefined();
      expect(res.body.longestWord).toEqual("quick");
    });

    it("should return complete analysis", async () => {
      const res: Response = await request(app)
        .post("/api/analyzer/complete")
        .send({ text: testText });
      expect(res.statusCode).toBe(200);
      expect(res.body.analysis).toBeDefined();
      expect(res.body.analysis.wordCount).toBe(16);
      expect(res.body.analysis.characterCount).toBe(75);
      expect(res.body.analysis.sentenceCount).toBe(2);
      expect(res.body.analysis.paragraphCount).toBe(1);
      expect(res.body.analysis.longestWord).toEqual("quick");
    });
  });

  describe("Protected Routes", () => {
    let createdId: string | undefined;

    it("should add text for analysis", async () => {
      const res: Response = await request(app)
        .post("/api/analyzer/add")
        .set("Authorization", `Bearer ${token}`)
        .send({ text: "This is a protected route test." });
      expect([200, 201]).toContain(res.statusCode);
      expect(res.body.data._id).toBeDefined();
      createdId = res.body.data._id;
    });

    it("should get all text analyses for the user", async () => {
      const res: Response = await request(app)
        .get("/api/analyzer/all")
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("should get one text analysis by ID", async () => {
      if (!createdId) {
        console.log("Skipping test: No ID was created");
        return;
      }

      try {
        const res: Response = await request(app)
          .get(`/api/analyzer/one/${createdId}`)
          .set("Authorization", `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body._id).toBeDefined();
      } catch (error) {
        console.error("Error in get one analysis test:", error);
        throw error;
      }
    });

    it("should return 404 or 400 for getting invalid ID", async () => {
      const res: Response = await request(app)
        .get(`/api/analyzer/one/invalidid`)
        .set("Authorization", `Bearer ${token}`);
      expect([400, 404]).toContain(res.statusCode);
    });

    it("should delete one analysis by ID", async () => {
      if (!createdId) {
        console.log("Skipping test: No ID was created");
        return;
      }

      try {
        const res: Response = await request(app)
          .delete(`/api/analyzer/delete/${createdId}`)
          .set("Authorization", `Bearer ${token}`);

        expect([200, 204]).toContain(res.statusCode);
      } catch (error) {
        console.error("Error in delete analysis test:", error);
        throw error;
      }
    });

    it("should return 404 or 400 for delete invalid ID", async () => {
      const res: Response = await request(app)
        .delete("/api/analyzer/delete/invalidid")
        .set("Authorization", `Bearer ${token}`);
      expect([400, 404]).toContain(res.statusCode);
    });
  });
});
