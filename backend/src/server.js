import express from "express";
import dotenv from "dotenv";
import cryptoRoutes from "./routes/crypto.js";

dotenv.config();

const app = express();
app.use("/api", cryptoRoutes);

const PORT = process.env.PORT ?? 8000;
app.listen(PORT, () => console.log(`✓ API up on http://127.0.0.1:${PORT}`));

