import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import PaintingCard from "@/components/PaintingCard";
import Select from "react-select";
import Slider from "rc-slider";
import { useRouter } from "next/router";
import Image from "next/image";
import { apiGet } from "@/lib/api";

export default function Gallery() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
  const [config, setConfig] = useState(null);
  
  // Filter Options & State
  const [options, setOptions] = useState({ artists: [], styles: [], categories: [], subcategories: [], minPrice: 0, maxPrice: 10000 });
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 10000]); // Used for fetching
  const [tempPriceRange, setTempPriceRange] = useState([0, 10000]); // Used for UI slider
  const [rating, setRating] = useState("");
  const [sort, setSort] = useState("newest");
  const [customizable, setCustomizable] = useState(false);
  const [onSale, setOnSale] = useState(false);
  const [page, setPage] = useState(1);

  // Load filter options on mount
  useEffect(() => {
    fetch("/api/paintings/filters")
      .then(r => r.json())
      .then(data => {
        setOptions(data);
        const range = [data.minPrice, data.maxPrice];
        setPriceRange(range);
        setTempPriceRange(range);

        // Pre-select filters from URL if present
        if (router.query.artist) {
            const artistName = decodeURIComponent(router.query.artist);
            if (data.artists.includes(artistName)) {
                setSelectedArtists([{ value: artistName, label: artistName }]);
            }
        }
        
        if (router.query.category) {
            const catName = decodeURIComponent(router.query.category);
            if (data.categories.includes(catName)) {
                setSelectedCategories([{ value: catName, label: catName }]);
            }
        }
      })
      .catch(console.error);
  }, [router.query.artist, router.query.category]); // Add router.query.artist/category as dependency to re-run if URL changes

  // Load page config
  useEffect(() => {
    apiGet('/config/page_gallery').then(setConfig).catch(console.error);
  }, []);


  // Load paintings when filters change
  const load = () => {
    const params = new URLSearchParams();
    
    if (selectedArtists.length > 0) {
      params.set("artist", selectedArtists.map(a => a.value).join(","));
    }
    
    if (selectedStyles.length > 0) {
      params.set("style", selectedStyles.map(s => s.value).join(","));
    }

    if (selectedCategories.length > 0) {
      params.set("category", selectedCategories.map(c => c.value).join(","));
    }

    if (selectedSubcategories.length > 0) {
      params.set("subcategory", selectedSubcategories.map(s => s.value).join(","));
    }
    
    params.set("min", priceRange[0]);
    params.set("max", priceRange[1]);
    
    if (rating) params.set("minRating", rating);
    if (sort) params.set("sort", sort);
    if (customizable) params.set("customizable", "true");
    if (onSale) params.set("onSale", "true");
    params.set("page", page);
    
    fetch(`/api/paintings?${params.toString()}`)
      .then(r => r.json())
      .then(data => {
         if (data.items) {
             setItems(data.items);
             setPagination(data.pagination);
         } else {
             // Fallback for old API structure if any
             setItems(Array.isArray(data) ? data : []);
         }
      })
      .catch(() => setItems([]));
  };

  useEffect(load, [selectedArtists, selectedStyles, selectedCategories, selectedSubcategories, priceRange, rating, sort, customizable, onSale, page]);

  const handleRating = (r) => {
    setRating(rating === r ? "" : r);
    setPage(1);
  };

  const handleFilterChange = (setter) => (val) => {
      setter(val);
      setPage(1); // Reset to page 1 on filter change
  };

  const clearAll = () => {
    setSelectedArtists([]);
    setSelectedStyles([]);
    setSelectedCategories([]);
    setSelectedSubcategories([]);
    const range = [options.minPrice, options.maxPrice];
    setPriceRange(range);
    setTempPriceRange(range);
    setRating("");
    setSort("newest");
    setCustomizable(false);
    setOnSale(false);
    setPage(1);
  };

  const artistOptions = options.artists.map(a => ({ value: a, label: a }));
  const styleOptions = options.styles.map(s => ({ value: s, label: s }));
  const categoryOptions = options.categories ? options.categories.map(c => ({ value: c, label: c })) : [];
  const subcategoryOptions = options.subcategories ? options.subcategories.map(s => ({ value: s, label: s })) : [];

  return (
    <Layout>
      <section className="bg-gray-50 py-12 md:py-20 relative overflow-hidden">
        {config?.backgroundImage && (
            <div className="absolute inset-0 z-0">
                <Image 
                    src={config.backgroundImage} 
                    alt="Gallery Background" 
                    fill
                    className="object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-gray-50/90"></div>
            </div>
        )}
        <div className="mx-auto max-w-7xl px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-serif mb-6 text-gray-900">{config?.title || "Art Gallery"}</h1>
          <div className="w-24 h-1 bg-gray-900 mx-auto mb-6"></div>
          <p className="text-xl font-light text-gray-600 max-w-2xl mx-auto italic">
            {config?.description || "Explore our curated collection of masterpieces, from classical to contemporary."}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 flex flex-col md:flex-row gap-12">
        
        {/* Left Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-24">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
               <h2 className="font-serif text-xl text-gray-900">Filters</h2>
               <button onClick={clearAll} className="text-xs uppercase tracking-widest text-gray-500 hover:text-black transition-colors">Clear</button>
            </div>
            
            <div className="space-y-8">

              {/* Special Filters */}
              <div className="space-y-3 pb-6 border-b border-gray-100">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 border flex items-center justify-center transition-colors ${onSale ? 'bg-brand-pink border-brand-pink' : 'border-gray-300 group-hover:border-brand-pink'}`}>
                    {onSale && <span className="text-white text-xs">✓</span>}
                  </div>
                  <input type="checkbox" checked={onSale} onChange={e => setOnSale(e.target.checked)} className="hidden" />
                  <span className={`text-sm ${onSale ? 'text-brand-pink font-medium' : 'text-gray-600'}`}>On Sale / Discount</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 border flex items-center justify-center transition-colors ${customizable ? 'bg-brand-teal border-brand-teal' : 'border-gray-300 group-hover:border-brand-teal'}`}>
                    {customizable && <span className="text-white text-xs">✓</span>}
                  </div>
                  <input type="checkbox" checked={customizable} onChange={e => setCustomizable(e.target.checked)} className="hidden" />
                  <span className={`text-sm ${customizable ? 'text-brand-teal font-medium' : 'text-gray-600'}`}>Customizable</span>
                </label>
              </div>
              
              {/* Category Multiselect */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-3">Category</label>
                <Select
                  isMulti
                  options={categoryOptions}
                  value={selectedCategories}
                  onChange={setSelectedCategories}
                  placeholder="Select Categories..."
                  className="text-sm font-light"
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: '#e5e7eb',
                      boxShadow: 'none',
                      '&:hover': { borderColor: '#d1d5db' }
                    })
                  }}
                  instanceId="category-select"
                />
              </div>

              {/* Subcategory Multiselect */}
              {subcategoryOptions.length > 0 && (
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 mb-3">Subcategory</label>
                  <Select
                    isMulti
                    options={subcategoryOptions}
                    value={selectedSubcategories}
                    onChange={setSelectedSubcategories}
                    placeholder="Select Subcategories..."
                    className="text-sm font-light"
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderColor: '#e5e7eb',
                        boxShadow: 'none',
                        '&:hover': { borderColor: '#d1d5db' }
                      })
                    }}
                    instanceId="subcategory-select"
                  />
                </div>
              )}

              {/* Artist Multiselect */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-3">Artist</label>
                <Select
                  isMulti
                  options={artistOptions}
                  value={selectedArtists}
                  onChange={setSelectedArtists}
                  placeholder="Select Artists..."
                  className="text-sm font-light"
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: '#e5e7eb',
                      boxShadow: 'none',
                      '&:hover': { borderColor: '#d1d5db' }
                    })
                  }}
                  instanceId="artist-select"
                />
              </div>

              {/* Style Multiselect */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-3">Style</label>
                <Select
                  isMulti
                  options={styleOptions}
                  value={selectedStyles}
                  onChange={setSelectedStyles}
                  placeholder="Select Styles..."
                  className="text-sm font-light"
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: '#e5e7eb',
                      boxShadow: 'none',
                      '&:hover': { borderColor: '#d1d5db' }
                    })
                  }}
                  instanceId="style-select"
                />
              </div>

              {/* Price Range Slider */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-3">
                  Price: <span className="text-black font-mono">${tempPriceRange[0]} - ${tempPriceRange[1]}</span>
                </label>
                <div className="px-2 pt-2">
                  <Slider
                    range
                    min={options.minPrice}
                    max={options.maxPrice}
                    value={tempPriceRange}
                    onChange={setTempPriceRange}
                    onAfterChange={setPriceRange}
                    trackStyle={[{ backgroundColor: 'black' }]}
                    handleStyle={[
                      { borderColor: 'black', backgroundColor: 'white', opacity: 1, boxShadow: 'none' }, 
                      { borderColor: 'black', backgroundColor: 'white', opacity: 1, boxShadow: 'none' }
                    ]}
                    railStyle={{ backgroundColor: '#e5e7eb' }}
                  />
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-3">Rating</label>
                <div className="space-y-1">
                  {[4, 3, 2, 1].map(star => (
                    <button 
                      key={star}
                      onClick={() => handleRating(String(star))}
                      className={`flex items-center gap-2 w-full px-3 py-2 text-sm transition-all duration-300 ${rating === String(star) ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <span className={rating === String(star) ? "text-white" : "text-yellow-500"}>
                        {"★".repeat(star)}{"☆".repeat(5-star)}
                      </span>
                      <span className="font-light">& Up</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-8 pb-4 border-b border-gray-100 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif text-gray-900">Gallery Collection</h1>
              <p className="text-gray-500 font-light mt-2">Explore our curated selection of original artworks.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-widest text-gray-500">Sort By:</span>
              <select 
                value={sort} 
                onChange={(e) => setSort(e.target.value)}
                className="border-gray-200 text-sm font-light py-2 pl-3 pr-8 rounded-sm focus:ring-black focus:border-black cursor-pointer bg-white"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="oldest">Oldest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
          
          {items.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-lg">
              <p className="text-gray-400 font-serif text-xl italic mb-4">No masterpieces found.</p>
              <button onClick={clearAll} className="text-sm text-gray-900 underline hover:no-underline">Reset Filters</button>
            </div>
          ) : (
            <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {items.map(p => <PaintingCard key={p._id} painting={p} />)}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="flex justify-center gap-2">
                        <button 
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-4 py-2 border border-gray-200 text-sm disabled:opacity-50 hover:border-black transition-colors"
                        >
                            Previous
                        </button>
                        {[...Array(pagination.pages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setPage(i + 1)}
                                className={`w-10 h-10 flex items-center justify-center text-sm border transition-colors ${page === i + 1 ? 'bg-black text-white border-black' : 'border-gray-200 hover:border-black'}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button 
                            disabled={page === pagination.pages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-4 py-2 border border-gray-200 text-sm disabled:opacity-50 hover:border-black transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}
            </>
          )}
        </div>

      </section>
    </Layout>
  );
}
