import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import MediaGallery from "@/components/MediaGallery";

export default function ArtistPanel() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  const [myPaintings, setMyPaintings] = useState([]);
  const [sales, setSales] = useState([]);
  const [form, setForm] = useState({ title: "", price: "", style: "", medium: "", description: "", images: [] });
  const [showGallery, setShowGallery] = useState(false);

  const load = async () => {
    try {
      const p = await apiGet("/artists/paintings", token);
      const s = await apiGet("/artists/sales", token);
      setMyPaintings(p);
      setSales(s);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { load(); }, []);

  const addPainting = async () => {
    try {
      await apiPost("/artists/paintings", form, token);
      setForm({ title: "", price: "", style: "", medium: "", description: "" });
      toast.success("Painting added successfully!");
      load();
    } catch (e) {
      toast.error(e.message || "Failed to add painting");
    }
  };

  const updatePrice = async (id, price) => {
    try {
      await apiPut(`/artists/paintings/${id}`, { price }, token);
      toast.success("Price updated");
      load();
    } catch (e) {
      toast.error("Failed to update price");
    }
  };

  return (
    <Layout>
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-serif text-gray-900">Artist Dashboard</h1>
          <div className="text-sm text-gray-500 font-light">Manage your portfolio and sales</div>
        </div>
        
        {/* Sales Stats */}
        <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl shadow-lg text-white">
             <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">Total Revenue</div>
             <div className="text-3xl font-serif">${sales.reduce((acc, curr) => acc + curr.price, 0)}</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
             <div className="text-xs uppercase tracking-widest text-gray-500 mb-2">Paintings Sold</div>
             <div className="text-3xl font-serif text-gray-900">{sales.length}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h2 className="font-serif text-xl mb-6 text-gray-900">Add New Masterpiece</h2>
              
              <div className="space-y-4">
                <input className="w-full border-b border-gray-200 py-3 px-2 focus:outline-none focus:border-gray-900 transition-colors bg-transparent placeholder-gray-400" placeholder="Title of Artwork" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                
                <div className="grid grid-cols-2 gap-4">
                  <input className="w-full border-b border-gray-200 py-3 px-2 focus:outline-none focus:border-gray-900 transition-colors bg-transparent placeholder-gray-400" placeholder="Price (USD)" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                  <input className="w-full border-b border-gray-200 py-3 px-2 focus:outline-none focus:border-gray-900 transition-colors bg-transparent placeholder-gray-400" placeholder="Style / Genre" value={form.style} onChange={e => setForm({ ...form, style: e.target.value })} />
                </div>
                
                <input className="w-full border-b border-gray-200 py-3 px-2 focus:outline-none focus:border-gray-900 transition-colors bg-transparent placeholder-gray-400" placeholder="Medium (e.g., Oil on Canvas)" value={form.medium} onChange={e => setForm({ ...form, medium: e.target.value })} />
                
                <textarea className="w-full border-b border-gray-200 py-3 px-2 focus:outline-none focus:border-gray-900 transition-colors bg-transparent placeholder-gray-400 min-h-[100px]" placeholder="Description & Story" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              
              {/* Image Selection */}
              <div className="mt-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-xs uppercase tracking-widest text-gray-500">Artwork Images</label>
                  <button 
                    onClick={() => setShowGallery(true)}
                    className="text-xs uppercase tracking-widest text-blue-600 hover:text-blue-800 font-bold"
                  >
                    + Select from Gallery
                  </button>
                </div>
                
                {form.images.length > 0 ? (
                  <div className="grid grid-cols-3 gap-4">
                    {form.images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group shadow-sm">
                        <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                            className="text-white hover:text-red-400"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-400 text-sm font-light">
                    No images selected. Click above to browse gallery.
                  </div>
                )}
              </div>

              <button className="w-full py-4 bg-gray-900 text-white uppercase tracking-widest text-sm hover:bg-black transition-all duration-300 shadow-lg" onClick={addPainting}>
                Publish Artwork
              </button>
            </div>

            {showGallery && (
              <MediaGallery
                multiple={true}
                onClose={() => setShowGallery(false)}
                onSelect={(urls) => {
                  const newUrls = Array.isArray(urls) ? urls : [urls];
                  setForm(prev => ({ ...prev, images: [...prev.images, ...newUrls] }));
                }}
              />
            )}

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h2 className="font-serif text-xl mb-4 text-gray-900">Sales History</h2>
              <div className="space-y-4 max-h-[300px] overflow-auto pr-2 custom-scrollbar">
                {sales.length === 0 && <div className="text-gray-400 font-light italic text-center py-4">No sales recorded yet.</div>}
                {sales.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-serif text-gray-900">{s.painting}</div>
                      <div className="text-xs text-gray-500 mt-1">{dayjs(s.date).format("MMM D, YYYY")}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-medium">${s.price}</div>
                      <div className="text-xs uppercase tracking-wide text-green-600 mt-1">{s.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-fit">
            <h2 className="font-serif text-xl mb-6 text-gray-900">Portfolio ({myPaintings.length})</h2>
            <div className="space-y-3 max-h-[800px] overflow-auto pr-2 custom-scrollbar">
              {myPaintings.map(p => (
                <div key={p._id} className="group flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition-all">
                  <div className="flex items-center gap-3">
                    {p.images?.[0] && (
                      <div className="w-12 h-12 rounded overflow-hidden relative flex-shrink-0">
                         <img src={p.images[0]} alt="" className="object-cover w-full h-full" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{p.title}</div>
                      <div className="text-xs text-gray-500">{p.style} • {p.medium}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">$</span>
                    <input 
                      className="border-b border-gray-200 bg-transparent px-1 py-1 w-16 text-right text-sm focus:border-gray-900 focus:outline-none" 
                      defaultValue={p.price?.USD ?? p.price} 
                      onBlur={e => updatePrice(p._id, e.target.value)} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
