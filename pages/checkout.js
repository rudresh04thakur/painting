import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { apiPost, apiGet } from "@/lib/api";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function Checkout() {
  const [cart, setCart] = useState([]);
  const [address, setAddress] = useState({ line1: "", city: "", country: "", postalCode: "" });
  const [method, setMethod] = useState("");
  const [upiId, setUpiId] = useState("");
  const [settings, setSettings] = useState(null);
  const router = useRouter();
  const { user, loading } = useAuth();

  // Helper to ensure image path is correct
  const getImageUrl = (img) => {
    if (!img) return '/assets/img/default-product.jpg';
    if (img.startsWith('http')) return img;
    if (img.startsWith('assets')) return `/${img}`;
    return img;
  }

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem("cart") || "[]"));
    // Fetch payment settings
    apiGet('/payments/settings').then(data => {
      setSettings(data);
      // Set default method
      if (data?.online?.upi?.enabled) setMethod('upi');
      else if (data?.online?.stripe?.enabled) setMethod('card');
      else if (data?.offline?.enabled) setMethod('offline');
    });
  }, []);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  if (loading || !user) return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500 font-light text-xl">Loading checkout...</div>
      </div>
    </Layout>
  );

  const total = cart.reduce((sum, i) => sum + Number(i.price || 0), 0);

  const placeOrder = async () => {
    if (!address.line1 || !address.city || !address.postalCode) {
      toast.error("Please fill in all address fields");
      return;
    }
    if (method === 'upi' && !upiId) {
      toast.error("Please enter your UPI ID for verification");
      return;
    }

    const token = localStorage.getItem("token") || "";
    const payload = {
      items: cart.map(i => ({ paintingId: i._id, price: i.price })),
      address,
      paymentMethod: method,
      upiId: method === 'upi' ? upiId : undefined
    };
    try {
      const res = await apiPost("/orders", payload, token);
      localStorage.removeItem("cart");
      router.push(`/orders/${res.orderId}`);
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen pb-20">
        <section className="bg-white py-10 px-4 text-center border-b border-gray-200 mb-8">
           <h1 className="text-3xl md:text-4xl font-serif text-gray-900">Checkout</h1>
           <p className="text-gray-500 mt-2 font-light">Complete your purchase securely</p>
        </section>

        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Address Section */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-serif text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-sans">1</span>
                Shipping Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Address</label>
                  <input className="w-full border-gray-300 rounded p-3 focus:ring-black focus:border-black" placeholder="Street address, apartment, etc." value={address.line1} onChange={e => setAddress({ ...address, line1: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">City</label>
                  <input className="w-full border-gray-300 rounded p-3 focus:ring-black focus:border-black" placeholder="New York" value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Postal Code</label>
                  <input className="w-full border-gray-300 rounded p-3 focus:ring-black focus:border-black" placeholder="10001" value={address.postalCode} onChange={e => setAddress({ ...address, postalCode: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Country</label>
                  <input className="w-full border-gray-300 rounded p-3 focus:ring-black focus:border-black" placeholder="United States" value={address.country} onChange={e => setAddress({ ...address, country: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-serif text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-sans">2</span>
                Payment Method
              </h2>
              
              {settings ? (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Select Method</label>
                    <select className="w-full border-gray-300 rounded p-3 focus:ring-black focus:border-black bg-white" value={method} onChange={e => setMethod(e.target.value)}>
                      {settings.online?.upi?.enabled && <option value="upi">UPI / QR Code (Instant)</option>}
                      {settings.online?.stripe?.enabled && <option value="card">Credit / Debit Card</option>}
                      {settings.offline?.enabled && <option value="offline">Bank Transfer (NEFT/IMPS)</option>}
                    </select>
                  </div>

                  {method === "upi" && (
                    <div className="p-6 bg-gray-50 rounded border border-gray-200 text-center">
                      <p className="font-bold text-gray-800 mb-4">Scan to Pay</p>
                      {settings.online?.upi?.qrCodeUrl && (
                        <div className="bg-white p-2 inline-block rounded shadow-sm mb-4">
                          <img src={getImageUrl(settings.online.upi.qrCodeUrl)} alt="UPI QR" className="w-48 h-48 object-contain" />
                        </div>
                      )}
                      <p className="text-gray-600 text-sm mb-4">
                        Or pay to VPA: <span className="font-mono font-bold text-black bg-gray-200 px-2 py-1 rounded select-all">{settings.online?.upi?.upiId}</span>
                      </p>
                      
                      <div className="text-left max-w-sm mx-auto bg-white p-4 rounded border border-gray-100">
                        <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Verify Payment</label>
                        <input 
                          className="w-full border-gray-300 rounded p-3 focus:ring-black focus:border-black mb-1 text-sm" 
                          placeholder="Enter your UPI ID (e.g. user@okhdfcbank)" 
                          value={upiId} 
                          onChange={e => setUpiId(e.target.value)} 
                        />
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Required to verify your transaction.</p>
                      </div>
                    </div>
                  )}

                  {method === "card" && (
                    <div className="p-6 bg-blue-50 rounded border border-blue-100 flex items-center gap-4">
                      <div className="text-2xl">💳</div>
                      <p className="text-blue-800 text-sm">You will be redirected to our secure payment gateway to complete your purchase.</p>
                    </div>
                  )}
                  
                  {method === "offline" && (
                    <div className="p-6 bg-yellow-50 rounded border border-yellow-100">
                      <p className="text-yellow-800 text-sm mb-2"><strong>Note:</strong> Your order will be confirmed after we verify the bank transfer.</p>
                      <p className="text-yellow-800 text-sm">Bank details will be shown on the next screen.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">Loading payment options...</div>
              )}
            </div>
          </div>

          {/* Right Column: Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 sticky top-8">
              <h3 className="font-serif text-xl text-gray-900 mb-6">Order Summary</h3>
              
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                {cart.map(i => (
                  <div key={i._id} className="flex justify-between items-start text-sm">
                     <span className="text-gray-600 flex-1 pr-4">{i.title}</span>
                     <span className="font-medium text-gray-900">${Number(i.price).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-8 pt-4 border-t border-gray-200">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-2xl">${total.toLocaleString()}</span>
              </div>

              <button 
                onClick={placeOrder} 
                className="w-full bg-brand-teal text-white py-4 rounded text-sm font-bold uppercase tracking-widest hover:bg-teal-700 transition-colors shadow-lg shadow-teal-100"
              >
                Place Order
              </button>
              
              <div className="mt-6 flex justify-center gap-4 opacity-50 grayscale">
                 {/* Icons could go here */}
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
