import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import { apiPost } from "@/lib/api";

export default function RefundRequest() {
  const router = useRouter();
  const [orderId, setOrderId] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("idle"); // idle, submitting, success, error
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  useEffect(() => {
    if (router.isReady && router.query.orderId) {
      setOrderId(router.query.orderId);
    }
  }, [router.isReady, router.query.orderId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!token) return alert("Please login first");
    if (!orderId) return alert("Please enter Order ID");
    
    setStatus("submitting");
    try {
      await apiPost("/refunds", { orderId, reason, notes }, token);
      setOrderId(""); setReason(""); setNotes("");
      setStatus("success");
    } catch (e) {
      alert(e.message);
      setStatus("error");
    }
  };

  return (
    <Layout>
      <div className="bg-white">
        {/* Hero Section */}
        <section className="bg-gray-50 py-16 px-4 text-center border-b border-gray-100">
          <div className="max-w-2xl mx-auto">
             <span className="text-xs font-bold uppercase tracking-widest text-brand-pink mb-4 block">Satisfaction Guaranteed</span>
             <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6">Returns & Refunds</h1>
             <p className="text-lg text-gray-500 font-light">
               We want you to love your art. If something isn't right, we're here to help.
             </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            
            {/* Policy Details */}
            <div className="space-y-8">
              <h2 className="text-2xl font-serif text-gray-900 mb-6">Our Policy</h2>
              
              <div className="flex gap-4">
                 <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl">📅</div>
                 <div>
                   <h3 className="font-bold text-gray-900 mb-1">7-Day Return Window</h3>
                   <p className="text-gray-600 font-light text-sm leading-relaxed">
                     You have 7 days from the date of delivery to initiate a return. The artwork must be in its original condition and packaging.
                   </p>
                 </div>
              </div>

              <div className="flex gap-4">
                 <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl">🛡</div>
                 <div>
                   <h3 className="font-bold text-gray-900 mb-1">Damaged in Transit?</h3>
                   <p className="text-gray-600 font-light text-sm leading-relaxed">
                     If your artwork arrives damaged, please document the packaging and item immediately. We offer a full refund or replacement for damaged goods.
                   </p>
                 </div>
              </div>

              <div className="flex gap-4">
                 <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl">💸</div>
                 <div>
                   <h3 className="font-bold text-gray-900 mb-1">Refund Process</h3>
                   <p className="text-gray-600 font-light text-sm leading-relaxed">
                     Once we receive the returned item, we will inspect it and process your refund within 5-7 business days. Funds will be returned to your original payment method.
                   </p>
                 </div>
              </div>

              <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-100 mt-8">
                <h4 className="font-bold text-yellow-800 mb-2 text-sm uppercase">Important Note</h4>
                <p className="text-yellow-800/80 text-sm">
                  Custom commissions and final sale items are not eligible for return unless damaged.
                </p>
              </div>
            </div>

            {/* Request Form */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
              <h2 className="text-2xl font-serif text-gray-900 mb-6">Start a Return</h2>
              
              {status === 'success' ? (
                <div className="text-center py-12">
                   <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">✓</div>
                   <h3 className="text-xl font-bold text-gray-900 mb-2">Request Submitted</h3>
                   <p className="text-gray-500 font-light">We've received your request and will be in touch shortly with next steps.</p>
                   <button onClick={() => setStatus('idle')} className="mt-6 text-sm text-black underline">Submit another request</button>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-6">
                  <div>
                    <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Order ID</label>
                    <input 
                      required
                      className="w-full border-gray-200 rounded-sm px-4 py-3 focus:ring-black focus:border-black bg-gray-50" 
                      placeholder="e.g. ORD-123456" 
                      value={orderId} 
                      onChange={e => setOrderId(e.target.value)} 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Reason for Return</label>
                    <select 
                      required
                      className="w-full border-gray-200 rounded-sm px-4 py-3 focus:ring-black focus:border-black bg-gray-50" 
                      value={reason} 
                      onChange={e => setReason(e.target.value)}
                    >
                      <option value="">Select a reason...</option>
                      <option value="damaged">Arrived Damaged</option>
                      <option value="not_as_described">Not as Described</option>
                      <option value="changed_mind">Changed Mind</option>
                      <option value="wrong_item">Received Wrong Item</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Additional Details</label>
                    <textarea 
                      required
                      className="w-full border-gray-200 rounded-sm px-4 py-3 focus:ring-black focus:border-black bg-gray-50 min-h-[120px]" 
                      placeholder="Please provide more details about your request..." 
                      value={notes} 
                      onChange={e => setNotes(e.target.value)} 
                    />
                  </div>

                  <button 
                    disabled={status === 'submitting'}
                    className="w-full py-4 bg-black text-white font-bold uppercase tracking-widest text-sm hover:bg-brand-pink transition-colors disabled:opacity-50"
                  >
                    {status === 'submitting' ? 'Submitting...' : 'Submit Request'}
                  </button>
                </form>
              )}
            </div>

          </div>
        </section>
      </div>
    </Layout>
  );
}
