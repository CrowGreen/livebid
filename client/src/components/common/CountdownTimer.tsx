import { useState, useEffect } from "react";
export default function CountdownTimer({ endsAt }: { endsAt: string }) {
  const [left, setLeft] = useState(calc(endsAt));
  useEffect(() => { const id = setInterval(() => setLeft(calc(endsAt)), 100); return () => clearInterval(id); }, [endsAt]);
  if (left <= 0) return <p className="text-gray-600 text-2xl font-bold">Ended</p>;
  const m = String(Math.floor(left/60000)%60).padStart(2,"0"); const s = String(Math.floor(left/1000)%60).padStart(2,"0");
  return <p className={"text-3xl font-bold tabular-nums " + (left < 15000 ? "text-red-400 animate-pulse" : "text-white")}>{m}:{s}</p>;
}
function calc(e: string) { return Math.max(0, new Date(e).getTime() - Date.now()); }
