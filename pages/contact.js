import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { apiGet } from "@/lib/api";

export default function Contact() {
  const [data, setData] = useState({
    hero: {
      title: 'Get in Touch',
      description: 'We\'d love to hear from you. Whether you have a question about art, shipping, or just want to say hello.'
    },
    info: {
      visit: {
        title: 'Visit Us',
        address1: '123 Art District Blvd',
        address2: 'Creative City, NY 10012'
      },
      call: {
        title: 'Call Us',
        phone: '+1 (555) 123-4567',
        hours: 'Mon-Fri, 9am - 6pm'
      },
      email: {
        title: 'Email Us',
        email: 'hello@galleria.com',
        response: 'We reply within 24 hours'
      }
    }
  });
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle, sending, success, error

  useEffect(() => {
    apiGet('/config/page_contact')
      .then(res => {
        if (res) setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching contact page content:", err);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch('/api/pages/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch (e) {
      setStatus("error");
    }
  };

  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    if (img.startsWith('assets')) return `/${img}`;
    return img;
  }

  if (loading) return <Layout><div className="p-20 text-center">Loading...</div></Layout>;
  if (!data) return <Layout><div className="p-20 text-center">Content unavailable</div></Layout>;

  return (
    <Layout>
      <div className="bg-white">
        
        {/* Hero */}
        <section className="relative py-24 px-4 text-center overflow-hidden">
          <div className="absolute inset-0 z-0">
             {data.hero?.backgroundImage ? (
                <>
                  <div 
                    className="w-full h-full bg-cover bg-center" 
                    style={{ backgroundImage: `url(${getImageUrl(data.hero.backgroundImage)})` }}
                  ></div>
                  <div className="absolute inset-0 bg-black/50"></div>
                </>
             ) : (
                <div className="w-full h-full bg-gray-50"></div>
             )}
          </div>
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <h1 className={`text-4xl md:text-5xl font-serif mb-6 ${data.hero?.backgroundImage ? 'text-white' : 'text-gray-900'}`}>{data.hero?.title}</h1>
            <p className={`text-lg font-light max-w-2xl mx-auto ${data.hero?.backgroundImage ? 'text-gray-100' : 'text-gray-600'}`}>
                {data.hero?.description}
            </p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            
            {/* Contact Information */}
            <div className="space-y-12">
                <div>
                    <h3 className="font-serif text-2xl mb-6">Contact Information</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="p-6 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="text-2xl mb-4 block">📍</span>
                        <h4 className="font-bold uppercase tracking-widest text-xs text-gray-500 mb-2">{data.info?.visit?.title}</h4>
                        <p className="text-gray-900 font-medium">{data.info?.visit?.address1}</p>
                        <p className="text-gray-600 text-sm">{data.info?.visit?.address2}</p>
                    </div>

                    <div className="p-6 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="text-2xl mb-4 block">📞</span>
                        <h4 className="font-bold uppercase tracking-widest text-xs text-gray-500 mb-2">{data.info?.call?.title}</h4>
                        <p className="text-gray-900 font-medium">{data.info?.call?.phone}</p>
                        <p className="text-gray-600 text-sm">{data.info?.call?.hours}</p>
                    </div>
                    
                    <div className="p-6 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="text-2xl mb-4 block">✉️</span>
                        <h4 className="font-bold uppercase tracking-widest text-xs text-gray-500 mb-2">{data.info?.email?.title}</h4>
                        <p className="text-gray-900 font-medium">{data.info?.email?.email}</p>
                        <p className="text-gray-600 text-sm">{data.info?.email?.response}</p>
                    </div>
                </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white p-8 md:p-10 rounded-xl shadow-xl border border-gray-100">
              <h2 className="text-2xl font-serif mb-8">Send us a message</h2>
              
              {status === 'success' ? (
                 <div className="text-center py-12 bg-green-50 rounded-lg border border-green-100">
                    <div className="text-4xl mb-4">✨</div>
                    <h3 className="text-xl font-bold text-green-800 mb-2">Message Sent!</h3>
                    <p className="text-green-700">Thank you for contacting us. We will get back to you shortly.</p>
                    <button onClick={() => setStatus('idle')} className="mt-6 text-sm font-bold underline text-green-800">Send another</button>
                 </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Your Name</label>
                        <input 
                        required
                        className="w-full border-gray-200 rounded-sm px-4 py-3 focus:ring-black focus:border-black bg-gray-50 transition-colors"
                        placeholder="John Doe"
                        value={form.name}
                        onChange={e => setForm({...form, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Email Address</label>
                        <input 
                        required
                        type="email"
                        className="w-full border-gray-200 rounded-sm px-4 py-3 focus:ring-black focus:border-black bg-gray-50 transition-colors"
                        placeholder="john@example.com"
                        value={form.email}
                        onChange={e => setForm({...form, email: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Message</label>
                        <textarea 
                        required
                        rows={4}
                        className="w-full border-gray-200 rounded-sm px-4 py-3 focus:ring-black focus:border-black bg-gray-50 transition-colors"
                        placeholder="How can we help you?"
                        value={form.message}
                        onChange={e => setForm({...form, message: e.target.value})}
                        />
                    </div>
                    <button 
                        disabled={status === 'sending'}
                        className="w-full bg-black text-white font-bold uppercase tracking-widest py-4 hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                        {status === 'sending' ? 'Sending...' : 'Send Message'}
                    </button>
                    {status === 'error' && <p className="text-red-600 text-center">Something went wrong. Please try again.</p>}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
