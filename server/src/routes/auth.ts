import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { User } from "../models/User";
import { signToken } from "../middleware/auth";
const router = Router();
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = z.object({ username: z.string().min(3).max(30), email: z.string().email(), password: z.string().min(6) }).parse(req.body);
    if (await User.findOne({ $or: [{ email }, { username }] })) return res.status(409).json({ error: "taken" });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed });
    res.status(201).json({ token: signToken(user.id, username), user: { id: user.id, username, email } });
  } catch (err) { if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors }); res.status(500).json({ error: "server error" }); }
});
router.post("/login", async (req, res) => {
  try {
    const { email, password } = z.object({ email: z.string().email(), password: z.string() }).parse(req.body);
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: "bad credentials" });
    res.json({ token: signToken(user.id, user.username), user: { id: user.id, username: user.username, email } });
  } catch (err) { if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors }); res.status(500).json({ error: "server error" }); }
});
export { router as authRoutes };
