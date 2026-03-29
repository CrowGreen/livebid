import { create } from "zustand";
interface ChatMsg { id: string; userId: string; username: string; content: string; createdAt: string; }
interface ChatStore { messages: ChatMsg[]; typingUsers: string[];
  addMessage: (m: ChatMsg) => void; setHistory: (m: ChatMsg[]) => void;
  addTyping: (n: string) => void; removeTyping: (n: string) => void;
  sendChat: (ws: WebSocket|null, aid: string|null, c: string) => void; }
export const useChatStore = create<ChatStore>((set) => ({
  messages: [], typingUsers: [],
  addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  setHistory: (m) => set({ messages: m }),
  addTyping: (n) => set((s) => ({ typingUsers: s.typingUsers.includes(n) ? s.typingUsers : [...s.typingUsers, n] })),
  removeTyping: (n) => set((s) => ({ typingUsers: s.typingUsers.filter((u) => u !== n) })),
  sendChat: (ws, aid, c) => { if (!ws||!aid||!c.trim()) return; ws.send(JSON.stringify({ type: "chat", auctionId: aid, content: c.trim() })); },
}));
