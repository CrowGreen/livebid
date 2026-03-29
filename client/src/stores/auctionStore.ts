import { create } from "zustand";
interface Bid { id: string; userId: string; username: string; amount: number; timestamp: string; }
interface AuctionStore {
  auctionId: string | null; title: string; status: "pending"|"live"|"sold"|"ended";
  startPrice: number; currentBid: number | null; bidIncrement: number; endsAt: string | null;
  viewerCount: number; bids: Bid[]; error: string | null; ws: WebSocket | null;
  connect: (auctionId: string, token: string) => void; disconnect: () => void;
  placeBid: (amount: number) => void; startAuction: () => void;
}
const WS = process.env.REACT_APP_WS_URL || "ws://localhost:3001/ws";
export const useAuctionStore = create<AuctionStore>((set, get) => ({
  auctionId: null, title: "", status: "pending", startPrice: 0, currentBid: null, bidIncrement: 1, endsAt: null, viewerCount: 0, bids: [], error: null, ws: null,
  connect: (aid, token) => {
    get().ws?.close();
    const ws = new WebSocket(WS + "?token=" + token);
    ws.onopen = () => { ws.send(JSON.stringify({ type: "join", auctionId: aid })); set({ auctionId: aid, ws, error: null }); };
    ws.onmessage = (e) => { const m = JSON.parse(e.data);
      if (m.type === "auction_state") set({ title: m.data.title, status: m.data.status, startPrice: m.data.startPrice, currentBid: m.data.currentBid, bidIncrement: m.data.bidIncrement || 1, endsAt: m.data.endsAt, bids: (m.data.recentBids||[]).map((b:any) => ({ id: b._id, userId: b.user?._id||b.user, username: b.user?.username||"?", amount: b.amount, timestamp: b.createdAt })) });
      else if (m.type === "new_bid") set((s) => ({ currentBid: m.data.amount, bids: [m.data, ...s.bids].slice(0,20), error: null }));
      else if (m.type === "viewer_count") set({ viewerCount: m.data.count });
      else if (m.type === "auction_started") set({ status: "live", endsAt: m.data.endsAt });
      else if (m.type === "auction_ended") set({ status: m.data.winnerId ? "sold" : "ended" });
      else if (m.type === "time_extended") set({ endsAt: m.data.endsAt });
      else if (m.type === "bid_rejected") set({ error: m.data.reason });
    };
    ws.onclose = () => set({ ws: null }); ws.onerror = () => set({ error: "connection lost" });
  },
  disconnect: () => { get().ws?.close(); set({ ws: null, auctionId: null }); },
  placeBid: (amt) => { const { ws, auctionId } = get(); if (!ws||!auctionId) return; set({ error: null }); ws.send(JSON.stringify({ type: "bid", auctionId, amount: amt })); },
  startAuction: () => { const { ws, auctionId } = get(); if (!ws||!auctionId) return; ws.send(JSON.stringify({ type: "start_auction", auctionId })); },
}));
