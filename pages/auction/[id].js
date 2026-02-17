import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import Link from "next/link";
import Image from "next/image";
import { useCountdownTimer } from "@/customHooks/useCountdownTimer";
import { apiGet } from "@/lib/api";

const AuctionTimer = ({ startTime, endTime, status }) => {
    // If upcoming, count to start. If live, count to end.
    const targetDate = status === 'upcoming' ? startTime : endTime;
    const { days, hours, minutes, seconds } = useCountdownTimer(targetDate);
    
    if (status === 'ended' || status === 'closed') {
        return <div className="text-red-500 font-bold">Auction Ended</div>;
    }

    return (
        <div className="flex gap-4 text-center">
            <div className="bg-gray-100 p-2 rounded min-w-[60px]">
                <div className="font-bold text-xl">{days}</div>
                <div className="text-xs uppercase text-gray-500">Days</div>
            </div>
            <div className="bg-gray-100 p-2 rounded min-w-[60px]">
                <div className="font-bold text-xl">{hours}</div>
                <div className="text-xs uppercase text-gray-500">Hours</div>
            </div>
            <div className="bg-gray-100 p-2 rounded min-w-[60px]">
                <div className="font-bold text-xl">{minutes}</div>
                <div className="text-xs uppercase text-gray-500">Mins</div>
            </div>
            <div className="bg-gray-100 p-2 rounded min-w-[60px]">
                <div className="font-bold text-xl">{seconds}</div>
                <div className="text-xs uppercase text-gray-500">Secs</div>
            </div>
        </div>
    );
};

export default function AuctionDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bidAmount, setBidAmount] = useState("");

  useEffect(() => {
    if (!id) return;
    apiGet(`/auctions/${id}`)
      .then(data => {
        setAuction(data);
        setLoading(false);
        if (data.status === 'live') {
            setBidAmount(data.currentBid + (data.minIncrement || 50));
        } else {
            setBidAmount(data.startingBid);
        }
      })
      .catch(err => {
        console.error("Failed to fetch auction", err);
        setError("Auction not found");
        setLoading(false);
      });
  }, [id]);

  const getImageUrl = (img) => {
    if (!img) return '/assets/img/home1/upcoming-auction-img1.jpg';
    if (img.startsWith('http')) return img;
    if (img.startsWith('assets')) return `/${img}`;
    return img;
  }

  const handleBid = (e) => {
      e.preventDefault();
      alert("Bidding functionality coming soon! (Requires Authentication)");
  };

  if (loading) return <Layout><div className="text-center py-20">Loading...</div></Layout>;
  if (error || !auction) return <Layout><div className="text-center py-20 text-red-500">{error || "Auction not found"}</div></Layout>;

  const painting = auction.paintingId;

  return (
    <Layout>
      <div className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* Left: Image */}
                    <div className="bg-gray-100 relative aspect-square lg:aspect-auto min-h-[500px]">
                         <Image 
                            src={getImageUrl(painting?.images?.[0] || painting?.image || auction.image)} 
                            alt={auction.title}
                            fill
                            className="object-contain p-8"
                        />
                    </div>

                    {/* Right: Info */}
                    <div className="p-8 lg:p-12 flex flex-col justify-center">
                        <div className="mb-6">
                            <span className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-sm mb-4 ${auction.status === 'live' ? 'bg-red-600 text-white' : 'bg-gray-900 text-white'}`}>
                                {auction.status}
                            </span>
                            <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-2">{auction.title}</h1>
                            {painting?.artistName && (
                                <p className="text-xl text-gray-500 font-light italic">by {painting.artistName}</p>
                            )}
                        </div>

                        <div className="mb-8 border-t border-b border-gray-100 py-6">
                            <div className="mb-4">
                                <span className="text-xs uppercase tracking-widest text-gray-500 block mb-2">
                                    {auction.status === 'upcoming' ? "Starts In" : "Ends In"}
                                </span>
                                <AuctionTimer startTime={auction.startTime} endTime={auction.endTime} status={auction.status} />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <span className="text-xs uppercase tracking-widest text-gray-500 block mb-1">Current Bid</span>
                                    <span className="text-2xl font-mono font-bold">${auction.currentBid}</span>
                                </div>
                                <div>
                                    <span className="text-xs uppercase tracking-widest text-gray-500 block mb-1">Starting Bid</span>
                                    <span className="text-2xl font-mono text-gray-400">${auction.startingBid}</span>
                                </div>
                            </div>
                        </div>

                        {auction.status === 'live' && (
                            <form onSubmit={handleBid} className="mb-8">
                                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Place Your Bid</label>
                                <div className="flex gap-4">
                                    <input 
                                        type="number" 
                                        value={bidAmount}
                                        onChange={e => setBidAmount(e.target.value)}
                                        className="flex-1 border border-gray-300 rounded px-4 py-3 font-mono focus:outline-none focus:border-black transition-colors"
                                        min={auction.currentBid + (auction.minIncrement || 1)}
                                    />
                                    <button 
                                        type="submit"
                                        className="bg-black text-white px-8 py-3 font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
                                    >
                                        Bid
                                    </button>
                                </div>
                                <p className="text-xs text-gray-400 mt-2">
                                    Minimum bid increment: ${auction.minIncrement || 50}
                                </p>
                            </form>
                        )}

                        <div className="prose prose-sm text-gray-600 max-w-none">
                            <h3 className="text-black font-serif text-lg mb-2">Description</h3>
                            <p>{painting?.description || "No description available."}</p>
                            
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div>
                                    <strong className="block text-black text-xs uppercase">Medium</strong>
                                    <span>{painting?.medium}</span>
                                </div>
                                <div>
                                    <strong className="block text-black text-xs uppercase">Dimensions</strong>
                                    <span>{painting?.dimensions || "N/A"}</span>
                                </div>
                                <div>
                                    <strong className="block text-black text-xs uppercase">Year</strong>
                                    <span>{painting?.year}</span>
                                </div>
                                <div>
                                    <strong className="block text-black text-xs uppercase">Style</strong>
                                    <span>{painting?.style}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </Layout>
  );
}
