import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { authenticateWs } from "../middleware/auth";
import { placeBid, endAuction } from "../services/bidService";
import { Auction } from "../models/Auction";
import { Bid } from "../models/Bid";
import { ChatMessage } from "../models/ChatMessage";
interface AuthedSocket extends WebSocket { userId: string; username: string; auctionId?: string; alive: boolean; }
const rooms = new Map<string, Set<AuthedSocket>>();
function getRoom(id: string) { if (!rooms.has(id)) rooms.set(id, new Set()); return rooms.get(id)!; }
function broadcastAll(aid: string, data: object) { const m = JSON.stringify(data); for (const c of getRoom(aid)) if (c.readyState === WebSocket.OPEN) c.send(m); }
function broadcast(aid: string, data: object, skip?: AuthedSocket) { const m = JSON.stringify(data); for (const c of getRoom(aid)) if (c !== skip && c.readyState === WebSocket.OPEN) c.send(m); }
export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws" });
  const hb = setInterval(() => { wss.clients.forEach((ws) => { const s = ws as AuthedSocket; if (!s.alive) return s.terminate(); s.alive = false; s.ping(); }); }, 30000);
  wss.on("close", () => clearInterval(hb));
  wss.on("connection", (ws, req) => {
    const auth = authenticateWs(req);
    if (!auth) { ws.close(4001, "unauthorized"); return; }
    const socket = ws as AuthedSocket;
    socket.userId = auth.userId; socket.username = auth.username; socket.alive = true;
    socket.on("pong", () => { socket.alive = true; });
    socket.on("message", async (raw) => {
      let msg: any; try { msg = JSON.parse(raw.toString()); } catch { return; }
      if (msg.type === "join") {
        socket.auctionId = msg.auctionId; const room = getRoom(msg.auctionId); room.add(socket);
        const a = await Auction.findById(msg.auctionId).populate("seller", "username").lean();
        if (a) { const bids = await Bid.find({ auction: msg.auctionId }).populate("user", "username").sort({ amount: -1 }).limit(20).lean(); socket.send(JSON.stringify({ type: "auction_state", data: { ...a, recentBids: bids } })); }
        broadcastAll(msg.auctionId, { type: "viewer_count", data: { count: room.size } });
      }
      else if (msg.type === "bid") {
        const r = await placeBid({ auctionId: msg.auctionId, userId: socket.userId, amount: msg.amount });
        if (!r.ok) { socket.send(JSON.stringify({ type: "bid_rejected", data: { reason: r.error } })); return; }
        broadcastAll(msg.auctionId, { type: "new_bid", data: { id: r.bid._id, userId: r.bid.user._id, username: r.bid.user.username, amount: r.bid.amount, timestamp: r.bid.createdAt } });
        const auction = await Auction.findById(msg.auctionId);
        if (auction?.endsAt) { const left = auction.endsAt.getTime() - Date.now(); if (left > 0 && left < 15000) { const ne = new Date(auction.endsAt.getTime() + 15000); await Auction.updateOne({ _id: msg.auctionId }, { endsAt: ne }); broadcastAll(msg.auctionId, { type: "time_extended", data: { endsAt: ne.toISOString() } }); } }
      }
      else if (msg.type === "chat") {
        if (!msg.content?.trim() || msg.content.length > 500) return;
        const cm = await ChatMessage.create({ auction: msg.auctionId, user: socket.userId, content: msg.content.trim() });
        broadcastAll(msg.auctionId, { type: "chat_msg", data: { id: cm._id, userId: socket.userId, username: socket.username, content: cm.content, createdAt: cm.createdAt } });
      }
      else if (msg.type === "start_auction") {
        const a = await Auction.findById(msg.auctionId);
        if (!a || a.seller.toString() !== socket.userId || a.status !== "pending") return;
        const now = new Date(); const end = new Date(now.getTime() + a.duration * 1000);
        await Auction.updateOne({ _id: msg.auctionId }, { status: "live", startedAt: now, endsAt: end });
        broadcastAll(msg.auctionId, { type: "auction_started", data: { endsAt: end.toISOString(), startPrice: a.startPrice } });
        setTimeout(async () => { broadcastAll(msg.auctionId, { type: "auction_ended", data: await endAuction(msg.auctionId) }); }, a.duration * 1000);
      }
      else if (msg.type === "typing" && socket.auctionId) { broadcast(socket.auctionId, { type: "user_typing", data: { userId: socket.userId, username: socket.username } }, socket); }
    });
    socket.on("close", () => { if (socket.auctionId) { const r = rooms.get(socket.auctionId); if (r) { r.delete(socket); broadcastAll(socket.auctionId, { type: "viewer_count", data: { count: r.size } }); if (r.size === 0) rooms.delete(socket.auctionId); } } });
  });
  return wss;
}
