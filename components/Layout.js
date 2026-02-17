import Link from "next/link";
import Head from "next/head";
import { useAuth } from "@/context/AuthContext";
import Logo from "./Logo";
import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const [siteConfig, setSiteConfig] = useState(null);

  useEffect(() => {
    apiGet('/config/site_config')
      .then(data => setSiteConfig(data))
      .catch(err => console.error("Failed to load site config", err));
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800 bg-white">
      <Head>
        <title>{siteConfig?.title || "Seasons by Ritu | Curated Art Gallery"}</title>
        <meta name="description" content={siteConfig?.description || "Discover exceptional masterpieces from around the world. Authenticity guaranteed."} />
      </Head>
      <div className="bg-black text-white text-xs py-2 px-4 flex justify-end items-center tracking-widest uppercase font-bold">
        <span>{siteConfig?.shippingText || "Shipping Worldwide 🌍"}</span>
      </div>
      <header className="bg-white sticky top-0 z-50 bg-opacity-95 backdrop-blur-sm border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Logo className="w-auto h-12" title={siteConfig?.brandName} subtitle={siteConfig?.brandSubtitle} />
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-[0.2em] font-medium text-gray-500">
            <Link href="/gallery" className="hover:text-black transition-colors">Collection</Link>
            <Link href="/gallery?category=India%20Day" className="hover:text-black transition-colors text-brand-pink">India Day</Link>
            <Link href="/artists" className="hover:text-black transition-colors">Artists</Link>
            <Link href="/about" className="hover:text-black transition-colors">About</Link>
            <Link href="/contact" className="hover:text-black transition-colors">Contact</Link>
          </nav>
          <div className="flex items-center gap-6">
             <Link href="/cart" className="hover:text-black transition-colors relative text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
             </Link>
             {user ? (
               <div className="flex items-center gap-4">
                 <Link href="/dashboard" className="text-sm font-medium hover:text-black">DASHBOARD</Link>
                 <button onClick={logout} className="text-sm font-medium hover:text-red-600">LOGOUT</button>
               </div>
             ) : (
               <Link href="/login" className="text-sm font-medium hover:text-black uppercase tracking-widest">Login</Link>
             )}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-white text-gray-900 pt-16 pb-8 relative border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="mb-6">
               <Logo className="w-32 h-10" title={siteConfig?.brandName} subtitle={siteConfig?.brandSubtitle} />
            </div>
            <p className="text-gray-500 font-light leading-relaxed text-sm">
              Connecting art lovers with exceptional masterpieces from around the world. Authenticity guaranteed.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-6 text-black">Shop</h4>
            <ul className="space-y-3 text-sm text-gray-500 font-light">
              <li><Link href="/gallery" className="hover:text-black transition-colors">All Paintings</Link></li>
              <li><Link href="/gallery?featured=true" className="hover:text-black transition-colors">Featured</Link></li>
              <li><Link href="/gallery?sort=newest" className="hover:text-black transition-colors">New Arrivals</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-6 text-black">Support</h4>
            <ul className="space-y-3 text-sm text-gray-500 font-light">
              <li><Link href="/contact" className="hover:text-black transition-colors">Contact Us</Link></li>
              <li><Link href="/shipping" className="hover:text-black transition-colors">Shipping Policy</Link></li>
              <li><Link href="/refund" className="hover:text-black transition-colors">Returns & Refunds</Link></li>
              <li><Link href="/faq" className="hover:text-black transition-colors">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-6 text-black">Legal</h4>
            <ul className="space-y-3 text-sm text-gray-500 font-light">
              <li><Link href="/terms" className="hover:text-black transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-black transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-8 text-center text-[10px] text-gray-400 uppercase tracking-widest">
          &copy; {new Date().getFullYear()} {siteConfig?.copyright || "Seasons by Ritu. All rights reserved."}
        </div>
      </footer>
    </div>
  );
}
