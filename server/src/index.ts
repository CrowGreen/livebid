import express from "express";
import { createServer } from "http";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { authRoutes } from "./routes/auth";
import { auctionRoutes } from "./routes/auctions";
import { setupWebSocket } from "./websocket/auctionWs";
dotenv.config();
const app = express(); const server = createServer(app);
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json());
app.use("/api/auth", authRoutes); app.use("/api/auctions", auctionRoutes);
app.get("/api/health", (_, res) => res.json({ ok: true }));
setupWebSocket(server);
const PORT = process.env.PORT || 3001;
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/livebid").then(() => {
  console.log("mongo connected"); server.listen(PORT, () => console.log("listening on " + PORT));
}).catch((e) => { console.error(e); process.exit(1); });
