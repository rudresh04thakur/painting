import React, { useState, useEffect } from 'react';
import Layout from "@/components/Layout";
import Link from "next/link";
import Image from "next/image";
import { apiGet } from "@/lib/api";

export default function About() {
  const [data, setData] = useState({
    hero: {
      title: 'Our Story',
      subtitle: '"Art enables us to find ourselves and lose ourselves at the same time."',
      backgroundImage: '/assets/img/inner-page/breadcrumb-image.jpg'
    },
    vision: {
      title: 'The Vision',
      heading: 'Curating the Exceptional',
      content: [
        'Founded in 2024, Galleria was born from a simple yet profound belief: that art is not merely decoration, but a vital dialogue between the creator and the beholder.',
        'Our collection is meticulously curated, focusing on works that demonstrate not only technical mastery but also emotional resonance.',
        'We are committed to authenticity and transparency, ensuring that every acquisition is a seamless journey from discovery to ownership.'
      ],
      image: '/assets/img/about/vision.jpg'
    },
    values: [
      { title: 'Authenticity', description: 'Every piece is verified and comes with a signed Certificate of Authenticity.' },
      { title: 'Global Reach', description: 'Connecting local talent with a worldwide audience of collectors.' },
      { title: 'Curatorial Excellence', description: 'Selected by experts with decades of experience in the art world.' }
    ],
    location: {
      title: 'Visit Our Gallery',
      description: 'While we operate globally online, our physical space offers an immersive experience for local art enthusiasts.',
      address: '123 Art District Blvd, Creative City, NY 10012',
      hours: ['Mon - Fri: 10am - 7pm', 'Sat - Sun: 11am - 5pm'],
      contact: {
        email: 'hello@galleria.com',
        phone: '+1 (555) 123-4567'
      }
    }
  });
  const [loading, setLoading] = useState(true);

  // Helper to ensure image path is correct
  const getImageUrl = (img) => {
    if (!img) return '/assets/img/default-product.jpg';
    if (img.startsWith('http')) return img;
    if (img.startsWith('assets')) return `/${img}`;
    return img;
  }

  useEffect(() => {
    // Fetch page_about config
    apiGet('/config/page_about')
      .then(res => {
        if (res) setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching about page content:", err);
        // Keep default data on error
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl">Loading...</div>
        </div>
      </Layout>
    );
  }

  // Fallback if data is missing
  if (!data) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl">Content unavailable</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-white">
        {/* Hero Section */}
        <section className="relative w-full h-[50vh] min-h-[400px] bg-gray-900 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-40">
            {/* Background Image */}
            <div 
              className="w-full h-full bg-cover bg-center" 
              style={{ backgroundImage: `url(${getImageUrl(data.hero?.backgroundImage || '/assets/img/inner-page/breadcrumb-image.jpg')})` }} 
            />
          </div>
          <div className="relative z-10 text-center text-white px-4 max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-serif mb-6 leading-tight">{data.hero?.title}</h1>
            <p className="text-xl md:text-2xl font-light text-gray-200 italic">
              {data.hero?.subtitle}
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="mx-auto max-w-5xl px-4 py-20 md:py-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <div className="relative aspect-[3/4] bg-gray-100 rounded-sm overflow-hidden">
                 <Image 
                   src={getImageUrl(data.vision?.image || "/assets/img/about/vision.jpg")} 
                   alt="Gallery Interior" 
                   fill 
                   className="object-cover"
                 />
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">{data.vision?.title}</h2>
              <h3 className="text-4xl font-serif text-gray-900 mb-8 leading-tight">{data.vision?.heading}</h3>
              <div className="space-y-6 text-lg font-light text-gray-600 leading-relaxed">
                {data.vision?.content?.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values/Divider */}
        <section className="bg-gray-50 py-24">
          <div className="mx-auto max-w-7xl px-4 text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {data.values?.map((value, index) => (
                <div key={index}>
                  <h4 className="font-serif text-2xl mb-4">{value.title}</h4>
                  <p className="text-gray-500 font-light">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Visit Us */}
        <section className="mx-auto max-w-4xl px-4 py-20 md:py-32 text-center">
          <h2 className="text-4xl font-serif text-gray-900 mb-8">{data.location?.title}</h2>
          <p className="text-xl font-light text-gray-600 mb-12 max-w-2xl mx-auto">
            {data.location?.description}
          </p>
          <div className="bg-white border border-gray-100 p-8 shadow-sm inline-block text-left">
             <div className="mb-6">
               <h5 className="font-bold uppercase tracking-widest text-xs text-gray-400 mb-2">Location</h5>
               <p className="font-serif text-lg">{data.location?.address}</p>
             </div>
             <div className="mb-6">
               <h5 className="font-bold uppercase tracking-widest text-xs text-gray-400 mb-2">Hours</h5>
               {data.location?.hours?.map((hour, idx) => (
                 <p key={idx} className="text-gray-600">{hour}</p>
               ))}
             </div>
             <div>
               <h5 className="font-bold uppercase tracking-widest text-xs text-gray-400 mb-2">Contact</h5>
               <p className="text-gray-600">{data.location?.contact?.email}</p>
               <p className="text-gray-600">{data.location?.contact?.phone}</p>
             </div>
          </div>
          <div className="mt-12">
            <Link href="/contact" className="inline-block px-8 py-3 bg-brand-dark text-white uppercase tracking-widest text-sm hover:bg-black transition-all">
              Get in Touch
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}
