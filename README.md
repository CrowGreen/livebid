# LiveBid

Real-time auction platform. Sellers create auctions, buyers bid live via WebSocket. Anti-snipe protection extends auctions when late bids come in.

## Stack
- **Backend:** Node.js, Express, ws (raw WebSockets), MongoDB + Mongoose, Redis, JWT + bcrypt
- **Frontend:** React 18, Zustand, React Router, Tailwind CSS

## Run locally
```
docker compose up -d
cd server && npm i && npm run dev
cd client && npm i && npm start
```

## How it works
- WebSocket server at /ws handles bidding, chat, and presence tracking
- Each auction is a "room" tracked in a server-side Map
- Bid validation: checks status, minimum amount, prevents self-bidding and double-bids
- Anti-snipe: extends by 15s if a bid comes in during final 15s
- Chat persisted to MongoDB, last 50 loaded on join
