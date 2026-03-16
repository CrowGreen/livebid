import mongoose, { Schema, Document } from "mongoose";
export interface IUser extends Document { username: string; email: string; password: string; isSeller: boolean; }
const s = new Schema<IUser>({
  username: { type: String, required: true, unique: true, minlength: 3 },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  isSeller: { type: Boolean, default: false },
}, { timestamps: true });
s.index({ email: 1 });
export const User = mongoose.model<IUser>("User", s);
