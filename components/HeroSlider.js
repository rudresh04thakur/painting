import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function HeroSlider({ slides }) {
  const [current, setCurrent] = useState(0);

  const getImageUrl = (img) => {
    if (!img) return '/assets/img/default-product.jpg';
    if (img.startsWith('http')) return img;
    if (img.startsWith('assets')) return `/${img}`;
    return img;
  };

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  if (!Array.isArray(slides) || slides.length === 0) return null;

  return (
    <div className="relative w-full h-[700px] overflow-hidden bg-white">
      {slides.map((slide, index) => (
        <div
          key={slide._id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
            {slide.images?.[0] && (
              <Image
                src={getImageUrl(slide.images[0])}
                alt={slide.title}
                fill
                sizes="100vw"
                className="object-cover opacity-90"
                priority={index === 0}
              />
            )}
            <div className="absolute inset-0 bg-black/20" />
          </div>

          {/* Content */}
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <div className="max-w-4xl px-4 animate-fade-in-up">
              <h2 className="text-xs md:text-sm font-bold tracking-[0.3em] uppercase mb-6 text-white/90">
                Featured Collection
              </h2>
              <h1 className="text-5xl md:text-7xl font-serif mb-6 text-white drop-shadow-md tracking-tight">
                {slide.title}
              </h1>
              <p className="text-lg md:text-xl font-light text-white/90 mb-10 tracking-widest uppercase text-xs">
                {slide.artistName}
              </p>
              <Link
                href={`/painting/${slide._id}`}
                className="inline-block px-12 py-4 bg-white text-black hover:bg-black hover:text-white transition-all duration-300 uppercase tracking-[0.2em] text-xs font-bold"
              >
                View Artwork
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex gap-4 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                idx === current ? "w-12 bg-white" : "w-4 bg-white/40 hover:bg-white"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
