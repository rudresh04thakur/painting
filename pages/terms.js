import { useEffect, useState } from "react";
import Layout from "@/components/Layout";

export default function Terms() {
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch('/api/pages/terms').then(r => r.json()).then(d => setContent(d.content));
  }, []);

  return (
    <Layout>
      <div className="bg-white">
        <section className="bg-gray-50 py-16 px-4 text-center border-b border-gray-100">
           <div className="max-w-3xl mx-auto">
             <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 block">Legal</span>
             <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6">Terms of Service</h1>
             <p className="text-lg text-gray-500 font-light">
               Please read these terms carefully before using our service.
             </p>
           </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-16">
          <div className="prose prose-lg max-w-none text-gray-600 font-light leading-relaxed prose-headings:font-serif prose-headings:text-gray-900 prose-a:text-black" dangerouslySetInnerHTML={{ __html: content || '<div class="text-center py-20 text-gray-400">Loading terms...</div>' }} />
        </section>
      </div>
    </Layout>
  );
}
