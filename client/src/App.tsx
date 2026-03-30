import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
export default function App() {
  return <BrowserRouter><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/auction/:id" element={<div>auction room</div>} />
    <Route path="/dashboard" element={<div>dashboard</div>} />
  </Routes></BrowserRouter>;
}
function Home() {
  return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center"><div className="text-center">
    <h1 className="text-5xl font-bold mb-4">Live<span className="text-blue-500">Bid</span></h1>
    <p className="text-gray-400 mb-8">Real-time auctions</p>
    <div className="flex gap-4 justify-center">
      <Link to="/auction/demo" className="px-6 py-3 bg-blue-600 rounded-lg font-semibold">Join auction</Link>
      <Link to="/dashboard" className="px-6 py-3 bg-gray-800 border border-gray-700 rounded-lg">Dashboard</Link>
    </div></div></div>;
}
