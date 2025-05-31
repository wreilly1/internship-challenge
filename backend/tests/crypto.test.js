import request from "supertest";
import { jest } from "@jest/globals";
import express from "express";
import routes from "../src/routes/crypto.js";

const app = express();
app.use("/api", routes);

describe("Crypto routes", () => {
  it("returns BTC price", async () => {
    const res = await request(app).get("/api/price/btc");
    expect(res.statusCode).toBe(200);
    expect(res.body.symbol).toBe("BTC");
    expect(res.body).toHaveProperty("price_usd");
  });

  it("404 for nonsense symbol", async () => {
    const res = await request(app).get("/api/price/notacoin");
    expect(res.statusCode).toBe(502);
  });
});

