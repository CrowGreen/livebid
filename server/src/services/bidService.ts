import { Auction } from "../models/Auction";
import { Bid } from "../models/Bid";
interface PlaceBidInput { auctionId: string; userId: string; amount: number; }
interface BidResult { ok: boolean; error?: string; bid?: any; }
export async function placeBid({ auctionId, userId, amount }: PlaceBidInput): Promise<BidResult> {
  const auction = await Auction.findById(auctionId);
  if (!auction) return { ok: false, error: "auction not found" };
  if (auction.status !== "live") return { ok: false, error: "not live" };
  if (auction.seller.toString() === userId) return { ok: false, error: "cant bid on own auction" };
  if (auction.endsAt && auction.endsAt < new Date()) return { ok: false, error: "ended" };
  const highBid = await Bid.findOne({ auction: auctionId }).sort({ amount: -1 });
  const minBid = highBid ? highBid.amount + auction.bidIncrement : auction.startPrice;
  if (amount < minBid) return { ok: false, error: "min bid $" + minBid.toFixed(2) };
  if (highBid && highBid.user.toString() === userId) return { ok: false, error: "already winning" };
  if (highBid) await Bid.updateOne({ _id: highBid._id }, { isWinning: false });
  const bid = await Bid.create({ auction: auctionId, user: userId, amount, isWinning: true });
  await Auction.updateOne({ _id: auctionId }, { currentBid: amount });
  return { ok: true, bid: await bid.populate("user", "username") };
}
export async function endAuction(auctionId: string) {
  const w = await Bid.findOne({ auction: auctionId, isWinning: true }).populate("user", "username");
  const total = await Bid.countDocuments({ auction: auctionId });
  await Auction.updateOne({ _id: auctionId }, { status: w ? "sold" : "ended" });
  return { winnerId: w?.user?._id?.toString() || null, winnerName: (w?.user as any)?.username || null, finalPrice: w?.amount || null, totalBids: total };
}
// fixed: was using < instead of <=
