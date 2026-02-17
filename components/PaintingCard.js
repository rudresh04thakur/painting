import Image from "next/image";
import Link from "next/link";

import { useAuth } from "@/context/AuthContext";
import { apiPost } from "@/lib/api";
import toast from "react-hot-toast";

export default function PaintingCard({ painting }) {
  const { user, updateUser } = useAuth();
  const stars = Math.round(painting.averageRating || 0);
  
  // Calculate discount
  const discount = painting.price?.original && painting.price?.USD 
    ? Math.round(((painting.price.original - painting.price.USD) / painting.price.original) * 100) 
    : 0;

  const isWishlisted = user?.wishlist?.includes(painting._id);

  const getImageUrl = (img) => {
    if (!img) return '/assets/img/default-product.jpg';
    if (img.startsWith('http')) return img;
    if (img.startsWith('assets')) return `/${img}`;
    return img;
  };

  const toggleWishlist = async (e) => {
    e.preventDefault();
    if (!user) return toast.error("Please login to add to wishlist");
    
    try {
        const token = localStorage.getItem("token");
        const res = await apiPost(`/user/wishlist/${painting._id}`, {}, token);
        if (res.ok) {
            updateUser({ ...user, wishlist: res.wishlist });
            toast.success(res.added ? "Added to Wishlist" : "Removed from Wishlist");
        }
    } catch (e) {
        toast.error("Something went wrong");
    }
  };

  return (
    <div className="group relative bg-white transition-all duration-300 hover:-translate-y-2 hover:shadow-xl rounded-sm overflow-hidden border border-gray-100 hover:border-brand-pink/30 flex flex-col h-full">
      <Link href={`/painting/${painting._id}`} className="block overflow-hidden relative aspect-[4/5] bg-gray-100 flex-shrink-0">
        {/* Badges */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
            {painting.isCustomizable && (
                <span className="bg-brand-teal/90 text-white text-[10px] uppercase font-bold px-2 py-1 tracking-widest shadow-sm backdrop-blur-sm">
                    Customizable
                </span>
            )}
            {discount > 0 && (
                <span className="bg-brand-pink/90 text-white text-[10px] uppercase font-bold px-2 py-1 tracking-widest shadow-sm backdrop-blur-sm">
                    -{discount}% OFF
                </span>
            )}
        </div>

        {/* Wishlist Button */}
        <button 
            onClick={toggleWishlist}
            className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white shadow-sm transition-all duration-200"
        >
            <span className={`text-lg leading-none ${isWishlisted ? 'text-brand-pink' : 'text-gray-400 hover:text-brand-pink'}`}>
                {isWishlisted ? '♥' : '♡'}
            </span>
        </button>


        {painting.images?.[0] ? (
          <Image 
            src={getImageUrl(painting.images[0])} 
            alt={painting.title} 
            fill 
            className="object-cover transition-transform duration-700 group-hover:scale-110" 
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 font-light">No Image</div>
        )}
        
        {/* Quick Add Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
            <button 
              data-id={painting._id} 
              className="add-to-cart bg-white text-brand-dark px-6 py-3 uppercase tracking-widest text-xs font-bold hover:bg-brand-pink hover:text-white transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300 shadow-lg"
            >
              Add to Cart
            </button>
        </div>
      </Link>
      
      <div className="p-4 flex flex-col flex-grow">
        {/* Title & Handmade Label */}
        <div className="mb-2">
            <h3 className="font-serif text-lg leading-tight group-hover:text-brand-pink transition-colors line-clamp-2 min-h-[1.5em]">
            <Link href={`/painting/${painting._id}`}>{painting.title}</Link>
            </h3>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">Handmade Painting</p>
        </div>

        {/* Specs Row */}
        <div className="flex items-center text-xs text-gray-500 font-light mb-3 gap-2">
            {painting.size && (
                <span className="bg-gray-50 px-2 py-1 rounded-sm border border-gray-100">
                    {painting.size.height} x {painting.size.width} {painting.size.unit}
                </span>
            )}
            {painting.medium && (
                <span className="bg-gray-50 px-2 py-1 rounded-sm border border-gray-100 truncate max-w-[120px]">
                    {painting.medium}
                </span>
            )}
        </div>

        <div className="mt-auto border-t border-gray-100 pt-3">
            {/* Artist */}
            <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide flex items-center gap-1">
                By <span className="text-brand-teal font-medium truncate">{painting.artistName || "Unknown Artist"}</span>
            </p>

            {/* Price & Rating */}
            <div className="flex items-end justify-between">
                <div className="flex flex-col">
                    {painting.price?.original && painting.price.original > painting.price.USD && (
                        <span className="text-xs text-gray-400 line-through mb-0.5">
                            ${painting.price.original.toLocaleString()}
                        </span>
                    )}
                    <span className="font-bold text-gray-900 text-lg leading-none">
                        ${(painting.price?.USD ?? painting.price).toLocaleString()}
                    </span>
                </div>
                
                {painting.ratingsCount > 0 && (
                    <div className="text-xs text-brand-yellow flex gap-0.5" title={`${stars} Stars`}>
                    {'★★★★★'.slice(0, stars)}{'☆☆☆☆☆'.slice(0, 5 - stars)}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
