import mongoose, { Schema, Document, Types } from "mongoose";
export interface IChatMessage extends Document { auction: Types.ObjectId; user: Types.ObjectId; content: string; type: string; }
const s = new Schema<IChatMessage>({
  auction: { type: Schema.Types.ObjectId, ref: "Auction", required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true, maxlength: 500 },
  type: { type: String, enum: ["chat","bid","system"], default: "chat" },
}, { timestamps: true });
s.index({ auction: 1, createdAt: 1 });
export const ChatMessage = mongoose.model<IChatMessage>("ChatMessage", s);
