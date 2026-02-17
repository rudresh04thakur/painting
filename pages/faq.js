import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";

export default function FAQ() {
  const [pageData, setPageData] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiGet('/config/page_faq').catch(() => null),
      apiGet('/faqs').catch(() => [])
    ]).then(([configRes, faqsRes]) => {
      setPageData(configRes);
      setFaqs(faqsRes);
      setLoading(false);
    });
  }, []);

  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    if (img.startsWith('assets')) return `/${img}`;
    return img;
  }

  if (loading) return <Layout><div className="p-20 text-center">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="bg-white">
        {/* Hero */}
        <section className="relative py-24 px-4 text-center overflow-hidden">
           <div className="absolute inset-0 z-0">
             {pageData?.hero?.backgroundImage ? (
                <>
                  <div 
                    className="w-full h-full bg-cover bg-center" 
                    style={{ backgroundImage: `url(${getImageUrl(pageData.hero.backgroundImage)})` }}
                  ></div>
                  <div className="absolute inset-0 bg-black/60"></div>
                </>
             ) : (
                <div className="w-full h-full bg-brand-yellow/10"></div>
             )}
           </div>

          <div className="relative z-10 max-w-3xl mx-auto">
             <span className={`text-xs font-bold uppercase tracking-widest mb-4 block ${pageData?.hero?.backgroundImage ? 'text-brand-yellow' : 'text-brand-yellow'}`}>{pageData?.hero?.subtitle || 'Help Center'}</span>
             <h1 className={`text-4xl md:text-5xl font-serif mb-6 ${pageData?.hero?.backgroundImage ? 'text-white' : 'text-gray-900'}`}>{pageData?.hero?.title || 'Frequently Asked Questions'}</h1>
             <p className={`text-lg font-light ${pageData?.hero?.backgroundImage ? 'text-gray-200' : 'text-gray-600'}`}>
               {pageData?.hero?.description || 'Everything you need to know about buying art, shipping, and our policies.'}
             </p>
          </div>
        </section>

        {/* FAQ Sections */}
        <section className="mx-auto max-w-4xl px-4 py-16">
          <div className="space-y-16">
            
            {/* Dynamic FAQs */}
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {faqs.map(faq => (
                    <Question key={faq._id} q={faq.question} a={faq.answer} />
                ))}
              </div>
              {faqs.length === 0 && <p className="text-center text-gray-500">No FAQs found.</p>}
            </div>

             {/* Contact CTA */}
             <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-100 mt-12">
               <h3 className="font-serif text-xl mb-2">Still have questions?</h3>
               <p className="text-gray-500 font-light mb-6">Our support team is available Mon-Fri, 9am - 6pm EST.</p>
               <Link href="/contact" className="inline-block px-8 py-3 bg-black text-white uppercase tracking-widest text-sm hover:bg-brand-pink hover:scale-105 transition-all shadow-lg">
                 Contact Support
               </Link>
             </div>

          </div>
        </section>
      </div>
    </Layout>
  );
}

function Question({ q, a }) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
      <h3 className="font-bold text-gray-900 mb-3 text-lg">{q}</h3>
      <p className="text-gray-600 font-light leading-relaxed text-sm">{a}</p>
    </div>
  );
}
