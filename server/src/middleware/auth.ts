import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { IncomingMessage } from "http";
const secret = process.env.JWT_SECRET || "dev-secret";
interface TokenPayload { userId: string; username: string; }
export function signToken(userId: string, username: string): string {
  return jwt.sign({ userId, username }, secret, { expiresIn: "24h" });
}
export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, secret) as TokenPayload;
}
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) return res.status(401).json({ error: "auth required" });
  try { const p = verifyToken(h.slice(7)); (req as any).userId = p.userId; (req as any).username = p.username; next(); }
  catch { res.status(401).json({ error: "bad token" }); }
}
export function authenticateWs(req: IncomingMessage): TokenPayload | null {
  try { const url = new URL(req.url || "", "http://" + req.headers.host); const t = url.searchParams.get("token"); return t ? verifyToken(t) : null; }
  catch { return null; }
}
