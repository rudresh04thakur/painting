import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";

export default function Cart() {
  const [cart, setCart] = useState([]);
  const { user } = useAuth();
  const router = useRouter();

  // Helper to ensure image path is correct
  const getImageUrl = (img) => {
    if (!img) return '/assets/img/default-product.jpg';
    if (img.startsWith('http')) return img;
    if (img.startsWith('assets')) return `/${img}`;
    return img;
  }

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem("cart") || "[]"));
  }, []);

  const remove = (id) => {
    const updated = cart.filter(i => i._id !== id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const total = cart.reduce((sum, i) => sum + Number(i.price || 0), 0);

  const handleCheckout = () => {
    if (!user) {
      router.push("/login?redirect=/checkout");
    } else {
      router.push("/checkout");
    }
  };

  return (
    <Layout>
      <div className="bg-white min-h-screen">
        <section className="bg-gray-50 py-12 px-4 text-center border-b border-gray-100">
           <h1 className="text-3xl md:text-4xl font-serif text-gray-900">Your Cart</h1>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12">
          {cart.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 mb-6 text-lg font-light">Your shopping cart is currently empty.</p>
              <Link href="/gallery" className="inline-block bg-brand-teal text-white px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-teal-700 transition-colors">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-12">
              <div className="flex-1 space-y-6">
                {cart.map(i => (
                  <div key={i._id} className="flex gap-6 border-b border-gray-100 pb-6 last:border-0">
                    <div className="relative w-24 h-24 md:w-32 md:h-32 bg-gray-100 flex-shrink-0">
                      {i.image ? (
                        <Image src={getImageUrl(i.image)} alt={i.title} layout="fill" objectFit="cover" className="rounded-sm" />
                      ) : (
                         <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Image</div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-serif text-xl text-gray-900 mb-1">{i.title}</h3>
                        <p className="text-sm text-gray-500 font-light">{i.artist || "Unknown Artist"}</p>
                      </div>
                      <div className="flex justify-between items-end">
                        <button onClick={() => remove(i._id)} className="text-xs text-red-500 hover:text-red-700 uppercase tracking-wide font-bold">Remove</button>
                        <div className="text-lg font-medium text-gray-900">${Number(i.price).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="lg:w-96 flex-shrink-0">
                <div className="bg-gray-50 p-8 rounded-lg sticky top-8">
                  <h3 className="font-serif text-xl text-gray-900 mb-6">Order Summary</h3>
                  <div className="flex justify-between items-center mb-4 text-gray-600">
                    <span>Subtotal</span>
                    <span>${total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center mb-6 text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600 text-sm">Calculated at checkout</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4 mb-8 flex justify-between items-center">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-2xl">${total.toLocaleString()}</span>
                  </div>
                  <button onClick={handleCheckout} className="w-full bg-black text-white py-4 rounded-sm text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors">
                    Proceed to Checkout
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-4">
                    Secure Checkout • Money-back Guarantee
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
