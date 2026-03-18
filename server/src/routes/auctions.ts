import { Router } from "express";
import { z } from "zod";
import { Auction } from "../models/Auction";
import { Bid } from "../models/Bid";
import { requireAuth } from "../middleware/auth";
const router = Router();
const createBody = z.object({ title: z.string().min(1).max(200), description: z.string().max(2000).optional(), startPrice: z.number().positive(), bidIncrement: z.number().positive().optional(), category: z.string().optional(), duration: z.number().int().min(10).max(3600).optional() });
router.get("/", async (req, res) => {
  const f: any = {}; if (req.query.status) f.status = req.query.status; if (req.query.category) f.category = req.query.category;
  const auctions = await Auction.find(f).populate("seller", "username").sort({ createdAt: -1 }).limit(20).lean();
  const r = await Promise.all(auctions.map(async (a) => ({ ...a, bidCount: await Bid.countDocuments({ auction: a._id }) })));
  res.json(r);
});
router.get("/:id", async (req, res) => {
  const a = await Auction.findById(req.params.id).populate("seller", "username").lean();
  if (!a) return res.status(404).json({ error: "not found" });
  const bids = await Bid.find({ auction: a._id }).populate("user", "username").sort({ amount: -1 }).limit(20).lean();
  res.json({ ...a, recentBids: bids });
});
router.post("/", requireAuth, async (req, res) => {
  try { const d = createBody.parse(req.body); const a = await Auction.create({ ...d, seller: (req as any).userId }); res.status(201).json(a); }
  catch (err) { if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors }); res.status(500).json({ error: "create failed" }); }
});
export { router as auctionRoutes };
