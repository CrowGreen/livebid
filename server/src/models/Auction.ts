import mongoose, { Schema, Document, Types } from "mongoose";
export type AuctionStatus = "pending" | "live" | "sold" | "ended" | "cancelled";
export interface IAuction extends Document {
  title: string; description?: string; seller: Types.ObjectId; status: AuctionStatus;
  startPrice: number; currentBid: number | null; bidIncrement: number;
  imageUrl?: string; category: string; startedAt?: Date; endsAt?: Date; duration: number; viewerCount: number;
}
const s = new Schema<IAuction>({
  title: { type: String, required: true }, description: String,
  seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["pending","live","sold","ended","cancelled"], default: "pending" },
  startPrice: { type: Number, required: true, min: 0 }, currentBid: { type: Number, default: null },
  bidIncrement: { type: Number, default: 1 }, imageUrl: String,
  category: { type: String, default: "general" }, startedAt: Date, endsAt: Date,
  duration: { type: Number, default: 60 }, viewerCount: { type: Number, default: 0 },
}, { timestamps: true });
s.index({ status: 1 }); s.index({ seller: 1 });
export const Auction = mongoose.model<IAuction>("Auction", s);
