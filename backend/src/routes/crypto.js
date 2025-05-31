import express from "express";
import { liveStats, historical } from "../services/coingecko.js";

const router = express.Router();

/**
 * GET /price/:symbol
 * Return latest price, 24 h % change, 24 h volume.
 */
router.get("/price/:symbol", async (req, res) => {
  try {
    const stats = await liveStats(req.params.symbol);
    res.json({
      symbol: req.params.symbol.toUpperCase(),
      price_usd: stats.usd,
      percent_change_24h: stats.usd_24h_change,
      volume_24h: stats.usd_24h_vol,
    });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

/**
 * GET /historical/:symbol?days=30
 * Return average & max close price over N days (1–365).
 */
router.get("/historical/:symbol", async (req, res) => {
  const days = Math.min(Math.max(parseInt(req.query.days ?? "30", 10), 1), 365);
  try {
    const closes = await historical(req.params.symbol, days);
    const avg = closes.reduce((a, b) => a + b, 0) / closes.length;
    const max = Math.max(...closes);
    res.json({
      symbol: req.params.symbol.toUpperCase(),
      days,
      avg_close_usd: +avg.toFixed(4),
      max_close_usd: max,
    });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

export default router;

