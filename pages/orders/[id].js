import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Image from "next/image";
import dynamic from "next/dynamic";
import InvoicePDF from "@/components/InvoicePDF";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

export default function OrderTracking() {
  const router = useRouter();
  const { id } = router.query;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  const [order, setOrder] = useState(null);
  const [invoiceSettings, setInvoiceSettings] = useState(null);

  // Helper to ensure image path is correct
  const getImageUrl = (img) => {
    if (!img) return '/assets/img/default-product.jpg';
    if (img.startsWith('http')) return img;
    if (img.startsWith('assets')) return `/${img}`;
    return img;
  }

  useEffect(() => {
    if (!id) return;
    
    // Fetch Order
    fetch(`/api/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setOrder)
      .catch(() => setOrder(null));

    // Fetch Invoice Settings
    fetch(`/api/orders/invoice-settings`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setInvoiceSettings)
      .catch(err => console.error("Failed to load invoice settings", err));
  }, [id]);

  if (!order) return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-gray-400 font-serif tracking-widest uppercase">Loading Order...</div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-black pb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif text-black mb-2">Order Details</h1>
            <p className="text-gray-500 font-light text-sm uppercase tracking-widest">
              ID: <span className="text-black font-medium">{order._id}</span>
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col items-end gap-2">
            <span className={`inline-block px-4 py-2 text-xs font-bold uppercase tracking-widest border ${
              order.status === 'Delivered' ? 'border-green-600 text-green-700 bg-green-50' : 
              order.status === 'Cancelled' ? 'border-red-600 text-red-700 bg-red-50' : 
              'border-black text-black bg-white'
            }`}>
              {order.status}
            </span>
            <p className="text-xs text-gray-500 font-light">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content: Items & Timeline */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Order Items */}
            <div>
              <h2 className="text-lg font-serif mb-6 border-b border-gray-200 pb-2">Ordered Items</h2>
              <div className="space-y-6">
                {order.items?.map((item, idx) => {
                  const painting = item.paintingId || {};
                  return (
                    <div key={idx} className="flex gap-6 items-start">
                      <div className="relative w-24 h-24 md:w-32 md:h-32 bg-gray-100 flex-shrink-0">
                        {painting.images?.[0] ? (
                          <Image 
                            src={getImageUrl(painting.images[0])} 
                            alt={painting.title || 'Artwork'} 
                            fill 
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Image</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-serif text-black mb-1">{painting.title || 'Unknown Title'}</h3>
                        <p className="text-sm text-gray-500 uppercase tracking-widest mb-2">{painting.artist?.name || 'Artist'}</p>
                        <p className="text-lg font-light">${item.priceUSD?.toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-8 pt-6 border-t border-black flex justify-between items-center">
                <span className="text-sm font-bold uppercase tracking-widest">Total Amount</span>
                <span className="text-2xl font-serif">${order.totalUSD?.toLocaleString()}</span>
              </div>
            </div>

            {/* Timeline & Tracking */}
            <div>
              <h2 className="text-lg font-serif mb-6 border-b border-gray-200 pb-2">Tracking & Timeline</h2>
              {order.tracking?.courier && (
                <div className="bg-gray-50 p-6 mb-8 border border-gray-100">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="block text-gray-400 text-xs uppercase tracking-wider mb-1">Courier</span>
                      <span className="font-medium">{order.tracking.courier}</span>
                    </div>
                    <div>
                      <span className="block text-gray-400 text-xs uppercase tracking-wider mb-1">AWB / Tracking #</span>
                      <span className="font-medium">{order.tracking.awb}</span>
                    </div>
                  </div>
                  {order.tracking.url && (
                    <a href={order.tracking.url} target="_blank" className="inline-block mt-4 text-xs font-bold underline uppercase tracking-widest hover:text-gray-600">
                      Track Shipment &rarr;
                    </a>
                  )}
                </div>
              )}
              
              <div className="relative border-l border-gray-200 ml-3 pl-8 py-2 space-y-8">
                {order.timeline?.map((t, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[37px] top-1.5 w-4 h-4 rounded-full border-2 border-white bg-black ring-1 ring-gray-200"></span>
                    <p className="text-sm font-medium">{t.note}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(t.time).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar: Invoice, Address, Payment */}
          <div className="space-y-10">
            
            {/* Actions */}
            <div className="bg-black text-white p-8 text-center">
              <h3 className="font-serif text-xl mb-6">Actions</h3>
              <PDFDownloadLink
                document={<InvoicePDF order={order} settings={invoiceSettings} />}
                fileName={`Invoice-${order._id}.pdf`}
                className="block w-full py-4 border border-white text-white hover:bg-white hover:text-black transition-all duration-300 uppercase tracking-[0.2em] text-xs font-bold mb-4"
              >
                {({ loading }) => (loading ? "Generating PDF..." : "Download Invoice PDF")}
              </PDFDownloadLink>
              
              {order.status === "Delivered" && (
                <a 
                  href={`/refund?orderId=${order._id}`} 
                  className="block w-full py-4 border border-gray-600 text-gray-300 hover:border-white hover:text-white transition-all duration-300 uppercase tracking-[0.2em] text-xs font-bold"
                >
                  Request Return
                </a>
              )}
            </div>

            {/* Address */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-4 border-b border-gray-200 pb-2">Shipping Address</h3>
              <div className="text-sm text-gray-600 leading-relaxed">
                <p>{order.address?.line1}</p>
                <p>{order.address?.city}, {order.address?.postalCode}</p>
                <p>{order.address?.country}</p>
              </div>
            </div>

            {/* Payment Info */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-4 border-b border-gray-200 pb-2">Payment Details</h3>
              <p className="text-sm text-gray-600 mb-2">Method: <span className="font-medium capitalize">{order.paymentMethod}</span></p>
              
              {order.paymentMethod === "upi" && (
                 <div className="mt-4 p-4 bg-gray-50 border border-gray-100 text-center">
                   <p className="text-xs text-gray-500 mb-2">UPI ID: {order.upiId}</p>
                   <img src="/upi-qr.svg" alt="UPI QR" className="mx-auto w-32 h-32 object-contain mix-blend-multiply" />
                 </div>
              )}

              {order.paymentMethod === "offline" && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">Please upload your payment receipt below:</p>
                  <form action={`/api/payments/upload/${order._id}`} method="post" encType="multipart/form-data">
                    <input type="file" name="receipt" className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 mb-2" />
                    <button className="w-full py-2 bg-gray-900 text-white text-xs uppercase tracking-wider rounded-none hover:bg-black" type="submit">Upload Receipt</button>
                  </form>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>
    </Layout>
  );
}
