import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { apiPost } from "@/lib/api";
import toast from "react-hot-toast";

export default function PaintingDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [p, setP] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const { user, updateUser } = useAuth();
  const [userRating, setUserRating] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [pincode, setPincode] = useState("");
  const [shippingEstimate, setShippingEstimate] = useState(null);

  const getImageUrl = (img) => {
    if (!img) return '/assets/img/default-product.jpg';
    if (img.startsWith('http')) return img;
    if (img.startsWith('assets')) return `/${img}`;
    return img;
  };

  useEffect(() => {
    if (!id) return;
    fetch(`/api/paintings/${id}`).then(r => r.json()).then(setP).catch(() => setP(null));
  }, [id]);

  if (!p) return <Layout><div className="mx-auto max-w-7xl px-4 py-8">Loading...</div></Layout>;

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const exists = cart.find(i => i._id === p._id);
    if (!exists) cart.push({ _id: p._id, title: p.title, price: p.price?.USD ?? p.price, image: p.images?.[0] });
    localStorage.setItem("cart", JSON.stringify(cart));
    router.push("/cart");
  };

  const handleRate = async (rating) => {
    if (!user) return toast.error("Please login to rate");
    try {
      const token = localStorage.getItem("token");
      await apiPost(`/paintings/${p._id}/rate`, { rating }, token);
      setUserRating(rating);
      // Refresh data
      fetch(`/api/paintings/${id}`).then(r => r.json()).then(setP);
      toast.success("Rating submitted!");
    } catch (e) {
      toast.error(e.message);
    }
  };

  const checkShipping = () => {
      if (!pincode || pincode.length < 5) return toast.error("Enter valid pincode");
      // Simulate shipping check
      setShippingEstimate({
          days: p.processingDays + 5,
          cost: p.price?.USD > 500 ? 0 : 50,
          courier: "FedEx / DHL"
      });
  };

  const toggleWishlist = async () => {
    if (!user) return toast.error("Please login to add to wishlist");
    try {
        const token = localStorage.getItem("token");
        const res = await apiPost(`/user/wishlist/${p._id}`, {}, token);
        if (res.ok) {
            updateUser({ ...user, wishlist: res.wishlist });
            toast.success(res.added ? "Added to Wishlist" : "Removed from Wishlist");
        }
    } catch (e) {
        toast.error("Something went wrong");
    }
  };
  
  const isWishlisted = user?.wishlist?.includes(p._id);

  const DetailRow = ({ label, value }) => {
    if (!value) return null;
    return (
      <div className="flex justify-between py-2 border-b border-gray-100 last:border-0 text-sm">
        <span className="text-gray-500 font-light">{label}</span>
        <span className="text-gray-900 font-medium">{value}</span>
      </div>
    );
  };

  const renderStars = (rating) => {
    return "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));
  };

  // Discount calc
  const discount = p.price?.original && p.price?.USD 
    ? Math.round(((p.price.original - p.price.USD) / p.price.original) * 100) 
    : 0;

  return (
    <Layout>
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          
          {/* Images Section */}
          <div className="sticky top-24 self-start">
            <div className="relative w-full aspect-[4/5] bg-gray-50 border border-gray-100 rounded-sm overflow-hidden mb-4 group">
              {p.images?.[selectedImage] ? (
                <Image 
                    src={p.images[selectedImage]} 
                    alt={p.title} 
                    fill 
                    className="object-contain p-4 transition-transform duration-500 group-hover:scale-105" 
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
              )}
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-brand-pink text-white px-3 py-1 text-xs font-bold uppercase tracking-widest shadow-lg">
                    -{discount}% OFF
                </div>
              )}
            </div>
            
            {p.images?.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {p.images.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-20 h-20 border rounded-sm overflow-hidden flex-shrink-0 transition-all ${selectedImage === idx ? 'border-black ring-1 ring-black' : 'border-gray-200 hover:border-gray-400'}`}
                  >
                    <Image src={img} alt="Thumbnail" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Key Info Section */}
          <div>
            <div className="mb-6">
                <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-2">{p.title}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-500 uppercase tracking-wide">
                    <span>By <span className="text-brand-teal font-bold border-b border-brand-teal/30">{p.artistName}</span></span>
                    {p.artistCountry && <span>• {p.artistCountry}</span>}
                </div>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-1 text-brand-yellow">
                  <span className="text-lg">{renderStars(p.averageRating || 0)}</span>
              </div>
              <span className="text-xs text-gray-400 border-l pl-4 border-gray-300">
                  {p.ratingsCount || 0} Reviews
              </span>
              <span className="text-xs text-gray-400 border-l pl-4 border-gray-300">
                  SKU: {p.sku || p._id.slice(-6).toUpperCase()}
              </span>
            </div>

            <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-baseline gap-4 mb-2">
                    {p.price?.original && p.price.original > p.price.USD && (
                        <span className="text-lg text-gray-400 line-through">
                            ${p.price.original.toLocaleString()}
                        </span>
                    )}
                    <span className="text-4xl font-light text-gray-900">
                        ${(p.price?.USD ?? p.price).toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500 font-medium bg-white px-2 py-1 rounded border">
                        Includes Taxes
                    </span>
                </div>
                
                <p className="text-sm text-gray-500 mb-6">
                    Verified Authentic • Signed by Artist • 7-Day Returns
                </p>

                <div className="flex gap-4">
                    <button onClick={addToCart} className="flex-1 bg-black text-white h-12 uppercase tracking-widest text-sm font-bold hover:bg-brand-pink transition-colors shadow-lg hover:shadow-brand-pink/30">
                        Add to Cart
                    </button>
                    <button 
                        onClick={toggleWishlist}
                        className={`w-12 h-12 flex items-center justify-center border transition-colors ${isWishlisted ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-200 hover:border-black text-gray-400 hover:text-black'}`}
                    >
                        <span className="text-xl">{isWishlisted ? '♥' : '♡'}</span>
                    </button>
                </div>
            </div>

            {/* Pincode Check */}
            <div className="mb-8">
                <label className="text-xs uppercase font-bold text-gray-400 mb-2 block">Check Delivery Availability</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Enter Pincode / Zip" 
                        value={pincode}
                        onChange={e => setPincode(e.target.value)}
                        className="border-gray-200 text-sm focus:ring-black focus:border-black w-48"
                    />
                    <button onClick={checkShipping} className="text-xs font-bold uppercase underline hover:text-brand-teal">Check</button>
                </div>
                {shippingEstimate && (
                    <div className="mt-2 text-sm text-green-700 bg-green-50 p-3 rounded border border-green-100 inline-block">
                        Expected Delivery in {shippingEstimate.days} days via {shippingEstimate.courier}. 
                        {shippingEstimate.cost === 0 ? " Free Shipping." : ` Shipping Cost: $${shippingEstimate.cost}`}
                    </div>
                )}
            </div>

            {/* Masterpiece Details */}
            <div className="mt-8">
                <h3 className="font-serif text-xl text-gray-900 mb-6">Masterpiece Details</h3>
                <div className="grid grid-cols-2 gap-4">
                    
                    {/* Dimensions */}
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-300 transition-colors group">
                        <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm text-gray-400 group-hover:text-black transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider block mb-1">Dimensions</span>
                            <p className="text-sm font-medium text-gray-900">{p.size?.height} x {p.size?.width} {p.size?.unit}</p>
                        </div>
                    </div>

                    {/* Medium */}
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-300 transition-colors group">
                        <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm text-gray-400 group-hover:text-brand-teal transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider block mb-1">Medium</span>
                            <p className="text-sm font-medium text-gray-900">{p.medium}</p>
                        </div>
                    </div>

                    {/* Surface */}
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-300 transition-colors group">
                        <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm text-gray-400 group-hover:text-brand-pink transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider block mb-1">Surface</span>
                            <p className="text-sm font-medium text-gray-900">{p.surface}</p>
                        </div>
                    </div>

                    {/* Signature */}
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-300 transition-colors group">
                        <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm text-gray-400 group-hover:text-brand-yellow transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/></svg>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider block mb-1">Signature</span>
                            <p className="text-sm font-medium text-gray-900">{(!p.signedByArtist || p.signedByArtist === 'No') ? 'Unsigned' : `Signed (${p.signedByArtist})`}</p>
                        </div>
                    </div>

                </div>
            </div>

          </div>
        </div>

        {/* Tabs Section */}
        <div className="border-t border-gray-200">
            <div className="flex justify-center gap-8 -mt-px mb-12">
                {['description', 'specifications', 'shipping'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-4 text-sm font-bold uppercase tracking-widest border-t-2 transition-colors ${activeTab === tab ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="max-w-4xl mx-auto">
                {activeTab === 'description' && (
                    <div className="prose prose-lg mx-auto text-gray-600 font-light leading-relaxed">
                        <p>{p.description}</p>
                        {p.mood && <p><strong>Mood:</strong> {p.mood}</p>}
                        {p.subject && <p><strong>Subject:</strong> {p.subject}</p>}
                    </div>
                )}

                {activeTab === 'specifications' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                        <h3 className="col-span-full text-lg font-serif mb-4 border-b pb-2">Artistic Details</h3>
                        <DetailRow label="Artist" value={p.artistName} />
                        <DetailRow label="Year" value={p.year} />
                        <DetailRow label="Medium" value={p.medium} />
                        <DetailRow label="Technique" value={p.technique} />
                        <DetailRow label="Orientation" value={p.orientation} />
                        
                        <h3 className="col-span-full text-lg font-serif mt-8 mb-4 border-b pb-2">Physical Specs</h3>
                        <DetailRow label="Dimensions" value={`${p.size?.height} x ${p.size?.width} ${p.size?.unit}`} />
                        <DetailRow label="Weight" value={p.weightKg ? `${p.weightKg} kg` : null} />
                        <DetailRow label="Framed" value={p.framed ? `Yes (${p.frameMaterial})` : "No"} />
                        <DetailRow label="Protective Coating" value={p.protectiveCoating} />

                        <h3 className="col-span-full text-lg font-serif mt-8 mb-4 border-b pb-2">Authenticity</h3>
                        <DetailRow label="Certificate" value={p.certificateOfAuthenticity ? "Included" : "Not Included"} />
                        <DetailRow label="Signed" value={p.signedByArtist} />
                    </div>
                )}

                {activeTab === 'shipping' && (
                    <div className="space-y-6 text-gray-600">
                         <div className="flex items-start gap-4">
                             <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">📦</div>
                             <div>
                                 <h4 className="font-bold text-black mb-1">Packaging</h4>
                                 <p className="text-sm">This artwork is shipped in a {p.packagingType?.toLowerCase() || 'secure box'} to ensure it arrives in perfect condition.</p>
                             </div>
                         </div>
                         <div className="flex items-start gap-4">
                             <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">✈️</div>
                             <div>
                                 <h4 className="font-bold text-black mb-1">Shipping & Delivery</h4>
                                 <p className="text-sm">Ships from {p.shipsFromCity}, {p.shippingOriginCountry}. Processing time: {p.processingDays || 3} business days.</p>
                             </div>
                         </div>
                         <div className="flex items-start gap-4">
                             <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">↩️</div>
                             <div>
                                 <h4 className="font-bold text-black mb-1">Returns</h4>
                                 <p className="text-sm">{p.returnAllowed ? `${p.returnWindowDays}-day return policy. Buyer pays return shipping.` : "Returns are not accepted for this item."}</p>
                             </div>
                         </div>
                    </div>
                )}
            </div>
        </div>
        
        {/* Rate this painting */}
        <div className="mt-20 border-t pt-12 text-center max-w-2xl mx-auto">
           <h3 className="text-xl font-serif mb-4">Rate this Artwork</h3>
           <p className="text-sm text-gray-500 mb-6">Share your thoughts with other art lovers</p>
           <div className="flex justify-center gap-4">
             {[1, 2, 3, 4, 5].map(star => (
               <button 
                 key={star}
                 onClick={() => handleRate(star)}
                 className={`text-3xl transition-transform hover:scale-125 ${star <= userRating ? 'text-brand-yellow' : 'text-gray-200 hover:text-brand-yellow'}`}
               >
                 ★
               </button>
             ))}
           </div>
        </div>

      </section>
    </Layout>
  );
}
