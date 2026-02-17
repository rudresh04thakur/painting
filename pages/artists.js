import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Link from "next/link";
import Image from "next/image";

export default function Artists() {
  const [artists, setArtists] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to ensure image path is correct
  const getImageUrl = (img) => {
    if (!img) return '/assets/img/default-product.jpg';
    if (img.startsWith('http')) return img;
    if (img.startsWith('assets')) return `/${img}`;
    return img;
  }

  useEffect(() => {
    Promise.all([
      fetch("/api/paintings/stats/artists").then(r => r.json()),
      fetch("/api/artists-public?limit=100").then(r => r.json()),
      fetch("/api/config/page_artists").then(r => r.json())
    ])
      .then(([artistsData, publicArtists, configData]) => {
        
        const publicMap = {};
        if (Array.isArray(publicArtists)) {
            publicArtists.forEach(a => {
                publicMap[a.name] = a;
            });
        }

        const statsMap = {};
        if (Array.isArray(artistsData)) {
            artistsData.forEach(a => {
                statsMap[a._id] = {
                    name: a._id,
                    image: a.image,
                    count: a.count,
                    styles: a.styles.filter(Boolean).join(", ")
                };
            });
        }

        const allNames = new Set([...Object.keys(publicMap), ...Object.keys(statsMap)]);

        const artistList = Array.from(allNames).map(name => {
          const pub = publicMap[name];
          const stat = statsMap[name];
          
          return {
            name: name,
            image: pub?.image || stat?.image,
            count: stat?.count || 0,
            styles: stat?.styles || (pub?.country ? `From ${pub.country}` : ""),
            country: pub?.country
          };
        });

        setArtists(artistList);
        setConfig(configData);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  return (
    <Layout>
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          {config?.hero?.backgroundImage ? (
             <>
              <div 
                className="w-full h-full bg-cover bg-center" 
                style={{ backgroundImage: `url(${getImageUrl(config.hero.backgroundImage)})` }}
              ></div>
              <div className="absolute inset-0 bg-black/60"></div>
             </>
          ) : (
             <div className="w-full h-full bg-gray-50"></div>
          )}
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center">
          <h1 className={`text-4xl md:text-5xl font-serif mb-6 ${config?.hero?.backgroundImage ? 'text-white' : 'text-gray-900'}`}>
            {config?.hero?.title || config?.title || "Our Artists"}
          </h1>
          <div className={`w-24 h-1 mx-auto mb-6 ${config?.hero?.backgroundImage ? 'bg-white' : 'bg-gray-900'}`}></div>
          <p className={`text-xl font-light max-w-2xl mx-auto italic ${config?.hero?.backgroundImage ? 'text-gray-200' : 'text-gray-600'}`}>
            {config?.hero?.description || config?.description || '"Every artist dips his brush in his own soul, and paints his own nature into his pictures."'}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        {loading ? (
          <div className="text-center py-20 text-gray-400 font-light">Loading artists...</div>
        ) : artists.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-light">No artists found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {artists.map((artist, idx) => (
              <Link 
                key={idx} 
                href={`/gallery?artist=${encodeURIComponent(artist.name)}`}
                className="group block"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 mb-6">
                  {artist.image ? (
                    <Image 
                      src={getImageUrl(artist.image)} 
                      alt={artist.name} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-300 font-serif text-4xl bg-gray-50">
                      {artist.name.charAt(0)}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="bg-white text-black px-6 py-2 uppercase tracking-widest text-xs font-bold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      View Collection
                    </span>
                  </div>
                </div>
                
                <div className="text-center">
                  <h3 className="text-2xl font-serif text-gray-900 mb-2 group-hover:text-gray-600 transition-colors">
                    {artist.name}
                  </h3>
                  <div className="text-sm uppercase tracking-widest text-gray-500 mb-1">
                    {artist.count} {artist.count === 1 ? "Artwork" : "Artworks"}
                  </div>
                  {artist.styles && (
                    <p className="text-sm font-light text-gray-400 truncate px-4">
                      {artist.styles}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
