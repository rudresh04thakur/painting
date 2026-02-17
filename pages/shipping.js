import Layout from "@/components/Layout";
import Link from "next/link";

export default function ShippingPolicy() {
  return (
    <Layout>
      <div className="bg-white">
        {/* Hero Section */}
        <section className="bg-gray-50 py-20 px-4 text-center border-b border-gray-100">
          <div className="max-w-3xl mx-auto">
             <span className="text-xs font-bold uppercase tracking-widest text-brand-teal mb-4 block">Information</span>
             <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6">Shipping & Delivery</h1>
             <p className="text-lg text-gray-500 font-light leading-relaxed">
               We take exceptional care in packaging and shipping your artwork to ensure it arrives safely, wherever you are in the world.
             </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="mx-auto max-w-4xl px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            {/* Sidebar Navigation (Optional or just Sticky Info) */}
            <div className="hidden md:block col-span-1">
              <div className="sticky top-32 p-6 bg-gray-50 rounded-lg border border-gray-100">
                <h3 className="font-serif text-lg mb-4">Quick Summary</h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex justify-between">
                    <span>Processing:</span>
                    <span className="font-medium text-black">2-5 Days</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Domestic:</span>
                    <span className="font-medium text-black">Free</span>
                  </li>
                  <li className="flex justify-between">
                    <span>International:</span>
                    <span className="font-medium text-black">Calculated</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Returns:</span>
                    <span className="font-medium text-black">7 Days</span>
                  </li>
                </ul>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-400 mb-2">Need help?</p>
                  <Link href="/contact" className="text-brand-pink hover:text-black font-medium text-sm transition-colors">
                    Contact Support →
                  </Link>
                </div>
              </div>
            </div>

            {/* Main Policy Content */}
            <div className="col-span-1 md:col-span-2 space-y-12">
              
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-brand-yellow/10 flex items-center justify-center text-brand-yellow text-xl">
                    ⏱
                  </div>
                  <h2 className="text-2xl font-serif text-gray-900">Processing Time</h2>
                </div>
                <div className="prose prose-gray text-gray-600 font-light">
                  <p>
                    Each artwork is carefully inspected and packaged before shipment. Please allow <strong>2 to 5 business days</strong> for us to process your order. Custom framing or stretching may add an additional 3-5 business days to this timeline.
                  </p>
                  <p>
                    Once your order has shipped, you will receive a confirmation email with tracking information.
                  </p>
                </div>
              </div>

              <div>
                 <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal text-xl">
                    📦
                  </div>
                  <h2 className="text-2xl font-serif text-gray-900">Packaging & Care</h2>
                </div>
                <div className="prose prose-gray text-gray-600 font-light">
                  <p>
                    We use professional-grade packing materials to ensure your art arrives in pristine condition.
                  </p>
                  <ul className="list-disc pl-5 space-y-2 mt-4">
                    <li><strong>Rolled Canvas:</strong> Shipped in heavy-duty tubes to prevent crushing or bending.</li>
                    <li><strong>Stretched/Framed Art:</strong> Protected with acid-free tissue, corner guards, bubble wrap, and sturdy cardboard boxing.</li>
                    <li><strong>Glass/Fragile Items:</strong> Crated in wood if necessary for maximum protection.</li>
                  </ul>
                </div>
              </div>

              <div>
                 <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-brand-pink/10 flex items-center justify-center text-brand-pink text-xl">
                    🌍
                  </div>
                  <h2 className="text-2xl font-serif text-gray-900">International Shipping</h2>
                </div>
                <div className="prose prose-gray text-gray-600 font-light">
                  <p>
                    We ship globally via trusted carriers like DHL, FedEx, and UPS. International delivery times vary by destination, typically ranging from 5 to 14 business days.
                  </p>
                  <p className="mt-4 text-sm bg-gray-50 p-4 border-l-4 border-brand-pink rounded-r">
                    <strong>Note on Customs:</strong> Import duties, taxes, and customs charges are not included in the item price or shipping cost. These charges are the buyer's responsibility. Please check with your country's customs office to determine what these additional costs will be prior to buying.
                  </p>
                </div>
              </div>

              <div>
                 <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-black text-xl">
                    🛡
                  </div>
                  <h2 className="text-2xl font-serif text-gray-900">Insurance & Damages</h2>
                </div>
                <div className="prose prose-gray text-gray-600 font-light">
                  <p>
                    All shipments are fully insured. In the rare event that your artwork arrives damaged:
                  </p>
                  <ol className="list-decimal pl-5 space-y-2 mt-4">
                    <li>Take photos of the damaged packaging BEFORE opening it if possible.</li>
                    <li>Take clear photos of the damage to the artwork.</li>
                    <li>Contact us at <a href="mailto:support@galleria.com" className="text-black underline">support@galleria.com</a> within 24 hours of delivery.</li>
                  </ol>
                  <p className="mt-4">
                    We will arrange for a return and offer a full refund or a replacement if applicable.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
