import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import Link from "next/link";
import Image from "next/image";
import { useCountdownTimer } from "@/customHooks/useCountdownTimer";
import { apiGet } from "@/lib/api";

const AuctionCard = ({ auction }) => {
  const { days, hours, minutes, seconds } = useCountdownTimer(auction.startTime);
  const isLive = auction.status === 'live';
  
  // Helper to ensure image path is correct
  const getImageUrl = (img) => {
    if (!img) return '/assets/img/home1/upcoming-auction-img1.jpg';
    if (img.startsWith('http')) return img;
    if (img.startsWith('assets')) return `/${img}`;
    return img;
  }

  return (
    <div className="group bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Image 
          src={getImageUrl(auction.paintingId?.images?.[0] || auction.paintingId?.image || auction.image)} 
          alt={auction.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className={`absolute top-4 left-4 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-sm ${isLive ? 'bg-red-600 text-white' : 'bg-white text-black'}`}>
          {auction.status}
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-serif text-gray-900 mb-2 group-hover:text-gray-600 transition-colors">
          <Link href={`/auction/${auction._id}`}>
            {auction.title}
          </Link>
        </h3>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div>
            <span className="text-xs uppercase tracking-widest text-gray-500 block mb-1">
              {isLive ? "Current Bid" : "Starting Bid"}
            </span>
            <span className="font-mono font-bold text-lg">
              ${isLive ? auction.currentBid : auction.startingBid}
            </span>
          </div>
          
          <div className="text-right">
             <span className="text-xs uppercase tracking-widest text-gray-500 block mb-1">
              {isLive ? "Ends In" : "Starts In"}
            </span>
            <div className="font-mono text-sm">
                {days}d {hours}h {minutes}m
            </div>
          </div>
        </div>
        
        <Link 
            href={`/auction/${auction._id}`}
            className="block w-full text-center mt-6 bg-black text-white py-3 px-4 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
        >
            {isLive ? "Bid Now" : "View Details"}
        </Link>
      </div>
    </div>
  );
};

export default function Auctions() {
  const [auctions, setAuctions] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, live, upcoming, ended

  useEffect(() => {
    Promise.all([
      apiGet('/auctions'),
      apiGet('/config/page_auctions')
    ])
      .then(([auctionsData, configData]) => {
        setAuctions(auctionsData);
        setConfig(configData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch auctions", err);
        setLoading(false);
      });
  }, []);

  const filteredAuctions = auctions.filter(a => {
      if (filter === 'all') return a.status !== 'closed';
      return a.status === filter;
  });

  return (
    <Layout>
      <section className="bg-gray-50 py-16 md:py-24 relative overflow-hidden">
        {config?.backgroundImage && (
            <div className="absolute inset-0 z-0">
                <Image 
                    src={config.backgroundImage} 
                    alt="Auctions Background" 
                    fill
                    className="object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-gray-50/90"></div>
            </div>
        )}
        <div className="mx-auto max-w-7xl px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-serif mb-6 text-gray-900">{config?.title || "Live & Upcoming Auctions"}</h1>
          <div className="w-24 h-1 bg-gray-900 mx-auto mb-6"></div>
          <p className="text-xl font-light text-gray-600 max-w-2xl mx-auto italic">
            {config?.description || "Participate in our exclusive auctions and bid on rare and unique artworks."}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        {/* Filter Tabs */}
        <div className="flex justify-center mb-12 border-b border-gray-200">
            {['all', 'live', 'upcoming', 'ended'].map(f => (
                <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-8 py-4 text-sm font-bold uppercase tracking-widest transition-colors border-b-2 ${filter === f ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                    {f}
                </button>
            ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 font-light">Loading auctions...</div>
        ) : filteredAuctions.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-light">No auctions found for this category.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAuctions.map(auction => (
              <AuctionCard key={auction._id} auction={auction} />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
