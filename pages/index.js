import Layout from "@/components/Layout";
import SingleProductHero from "@/components/landing/ProductHero";
import ProductFeatures from "@/components/landing/ProductFeatures";
import Link from "next/link";

export default function Home({ mainProduct, relatedProducts }) {
  return (
    <Layout>
      {mainProduct ? (
        <>
          <SingleProductHero product={mainProduct} />
          <ProductFeatures product={mainProduct} />
        </>
      ) : (
        <div className="py-32 text-center">
          <h1 className="text-4xl font-serif mb-4">Welcome to the Gallery</h1>
          <p className="text-gray-500">No main product selected yet.</p>
        </div>
      )}

      {/* Related / Other Works */}
      {relatedProducts?.length > 0 && (
        <section className="bg-stone-50 py-24">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-serif text-center mb-12">More from the Collection</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map(p => (
                 <Link href={`/paintings/${p._id}`} key={p._id} className="group block">
                   <div className="aspect-[4/5] bg-gray-200 rounded-lg overflow-hidden mb-4">
                     <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                   </div>
                   <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{p.title}</h3>
                   <p className="text-gray-500 text-sm">${p.price?.USD}</p>
                 </Link>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/gallery" className="text-sm font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-gray-600 transition-colors">
                View All Works
              </Link>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}

export async function getServerSideProps({ req }) {
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  try {
    // Ideally, fetch a specific "Main Product" from config. 
    // For now, we take the first "Featured" item as the Single Product.
    const featuredRes = await fetch(`${baseUrl}/api/paintings?featured=true`);
    const featuredData = await featuredRes.json();
    
    const allRes = await fetch(`${baseUrl}/api/paintings`);
    const allData = await allRes.json();

    const mainProduct = featuredData.items?.[0] || allData.items?.[0] || null;
    
    // Filter out the main product from related
    const relatedProducts = (allData.items || [])
      .filter(p => p._id !== mainProduct?._id)
      .slice(0, 4);

    return {
      props: {
        mainProduct,
        relatedProducts
      }
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      props: {
        mainProduct: null,
        relatedProducts: []
      }
    };
  }
}
