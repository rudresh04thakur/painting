import { motion } from 'framer-motion';
import { Palette, Maximize, Award, Feather } from 'lucide-react';

export default function ProductFeatures({ product }) {
  if (!product) return null;

  const features = [
    {
      icon: <Maximize className="w-6 h-6" />,
      title: "Dimensions",
      desc: `${product.size?.height || 0} x ${product.size?.width || 0} ${product.size?.unit || 'cm'}`
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: "Medium",
      desc: product.medium || "Mixed Media"
    },
    {
      icon: <Feather className="w-6 h-6" />,
      title: "Surface",
      desc: product.surface || "Canvas"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Signature",
      desc: product.signedByArtist !== 'No' ? `Signed on ${product.signatureLocation || 'Front'}` : "Unsigned"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-serif font-medium text-gray-900 mb-4">Masterpiece Details</h2>
          <div className="w-24 h-1 bg-black mx-auto opacity-10 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors group"
            >
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-900 mb-6 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-500">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Story Section */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
           <div className="prose prose-lg text-gray-600">
             <h3 className="text-2xl font-serif text-gray-900 mb-6">The Story Behind The Art</h3>
             <p>{product.description || "No description available for this masterpiece."}</p>
             <p>This piece represents a unique exploration of {product.style || "contemporary art"}, blending traditional techniques with modern sensibilities.</p>
           </div>
           <div className="grid grid-cols-2 gap-4">
              {product.images?.slice(1, 3).map((img, i) => (
                <img key={i} src={img} className="rounded-xl shadow-lg w-full h-64 object-cover first:mt-12" alt="Detail shot" />
              ))}
           </div>
        </div>
      </div>
    </section>
  );
}
