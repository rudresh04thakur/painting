import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Star, Shield, Truck, Lock } from 'lucide-react';

export default function SingleProductHero({ product }) {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  
  if (!product) return null;

  return (
    <div className="relative bg-stone-50 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-orange-100 blur-[120px] opacity-60" />
        <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-50 blur-[100px] opacity-60" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 border border-black/10">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs font-semibold tracking-wide uppercase text-gray-600">
                {product.editionType || "Limited Edition"}
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-serif font-medium text-gray-900 leading-[1.1]">
              {product.title}
            </h1>
            
            <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
              {product.description?.substring(0, 150)}...
            </p>

            <div className="flex items-end gap-6">
              <div className="space-y-1">
                <span className="text-sm text-gray-500 uppercase tracking-wider">Price</span>
                <div className="text-4xl font-light text-gray-900">
                  ${product.price?.USD?.toLocaleString()}
                </div>
              </div>
              {product.stock > 0 ? (
                <div className="flex items-center gap-2 text-green-600 text-sm font-medium mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  In Stock & Ready to Ship
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600 text-sm font-medium mb-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  Sold Out
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link href={`/orders/checkout?productId=${product._id}`} className="group relative px-8 py-4 bg-black text-white overflow-hidden rounded-full transition-all hover:scale-105 hover:shadow-2xl">
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-gray-800 to-black opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center gap-3 font-medium tracking-wide">
                  Buy Now <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
              <Link href={`/paintings/${product._id}`} className="px-8 py-4 bg-white border border-gray-200 text-gray-900 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all font-medium">
                View Details
              </Link>
            </div>

            <div className="pt-8 flex items-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" /> Authenticity Guaranteed
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4" /> Free Shipping
              </div>
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div 
            style={{ y: y1 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-[4/5] relative rounded-2xl overflow-hidden shadow-2xl bg-gray-100">
               {/* Image Placeholder - Replace with Next/Image in real usage if domain configured */}
               <img 
                 src={product.images?.[0] || "/assets/img/default-product.jpg"} 
                 alt={product.title}
                 className="w-full h-full object-cover"
               />
               
               {/* Floating Badge */}
               <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/50 max-w-xs">
                 <div className="flex items-center gap-3 mb-2">
                   <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                     {/* Artist Avatar Placeholder */}
                     <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">ART</div>
                   </div>
                   <div>
                     <div className="text-xs text-gray-500 uppercase tracking-wide">Artist</div>
                     <div className="font-medium text-gray-900">{product.artistName || "Unknown Artist"}</div>
                   </div>
                 </div>
               </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
