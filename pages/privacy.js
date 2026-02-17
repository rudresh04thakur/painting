import { useEffect, useState } from "react";
import Layout from "@/components/Layout";

export default function Privacy() {
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch('/api/pages/privacy').then(r => r.json()).then(d => setContent(d.content));
  }, []);

  return (
    <Layout>
      <div className="bg-white">
        <section className="bg-gray-50 py-16 px-4 text-center border-b border-gray-100">
           <div className="max-w-3xl mx-auto">
             <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 block">Data Protection</span>
             <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6">Privacy Policy</h1>
             <p className="text-lg text-gray-500 font-light">
               How we collect, use, and protect your personal information.
             </p>
           </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-16">
          <div className="prose prose-lg max-w-none text-gray-600 font-light leading-relaxed prose-headings:font-serif prose-headings:text-gray-900 prose-a:text-black" dangerouslySetInnerHTML={{ __html: content || '<div class="text-center py-20 text-gray-400">Loading policy...</div>' }} />
        </section>
      </div>
    </Layout>
  );
}
