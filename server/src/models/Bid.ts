import mongoose, { Schema, Document, Types } from "mongoose";
export interface IBid extends Document { auction: Types.ObjectId; user: Types.ObjectId; amount: number; isWinning: boolean; }
const s = new Schema<IBid>({
  auction: { type: Schema.Types.ObjectId, ref: "Auction", required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true, min: 0 }, isWinning: { type: Boolean, default: false },
}, { timestamps: true });
s.index({ auction: 1, amount: -1 });
export const Bid = mongoose.model<IBid>("Bid", s);
