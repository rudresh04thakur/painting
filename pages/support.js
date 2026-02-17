import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Link from "next/link";

export default function Support() {
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch('/api/pages/support').then(r => r.json()).then(d => setContent(d.content));
  }, []);

  return (
    <Layout>
      <div className="bg-white">
        <section className="bg-brand-teal/10 py-16 px-4 text-center border-b border-brand-teal/20">
           <div className="max-w-3xl mx-auto">
             <span className="text-xs font-bold uppercase tracking-widest text-brand-teal mb-4 block">Customer Care</span>
             <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6">Support Center</h1>
             <p className="text-lg text-gray-600 font-light">
               We're dedicated to providing you with the best art buying experience.
             </p>
           </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-16">
          <div className="prose prose-lg max-w-none text-gray-600 font-light leading-relaxed prose-headings:font-serif prose-headings:text-gray-900 prose-a:text-brand-teal" dangerouslySetInnerHTML={{ __html: content || '<div class="text-center py-20 text-gray-400">Loading support info...</div>' }} />
          
          {/* Quick Links */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 pt-12 border-t border-gray-100">
             <div className="bg-gray-50 p-8 rounded-lg">
               <h3 className="font-serif text-xl mb-4">Common Questions</h3>
               <p className="text-sm text-gray-500 mb-6">Find quick answers to common questions about shipping, returns, and more.</p>
               <Link href="/faq" className="text-sm font-bold uppercase tracking-wide border-b border-black pb-1 hover:text-brand-teal hover:border-brand-teal transition-colors">
                 Read FAQ
               </Link>
             </div>
             <div className="bg-gray-50 p-8 rounded-lg">
               <h3 className="font-serif text-xl mb-4">Contact Us</h3>
               <p className="text-sm text-gray-500 mb-6">Need personalized help? Our team is just a message away.</p>
               <Link href="/contact" className="text-sm font-bold uppercase tracking-wide border-b border-black pb-1 hover:text-brand-teal hover:border-brand-teal transition-colors">
                 Get in Touch
               </Link>
             </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
