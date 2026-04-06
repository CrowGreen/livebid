export function formatUSD(n: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n); }
export function timeAgo(d: string) { const s = Math.floor((Date.now()-new Date(d).getTime())/1000); if (s<5) return "just now"; if (s<60) return s+"s ago"; if (s<3600) return Math.floor(s/60)+"m ago"; return Math.floor(s/3600)+"h ago"; }
