import { useState, useEffect } from "react";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import MediaGallery from "./MediaGallery";
import toast from "react-hot-toast";

export default function AdminPaintingForm({ painting, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    title: "",
    artistId: "",
    artistName: "",
    style: "",
    medium: "",
    description: "",
    price: "",
    stock: 1,
    size: { height: "", width: "", unit: "cm" },
    year: new Date().getFullYear(),
    subject: "",
    orientation: "Portrait",
    images: [], // Store URLs here
    featured: false,
    category: "",
    subcategory: ""
  });
  const [showGallery, setShowGallery] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [artists, setArtists] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subOptions, setSubOptions] = useState([]);

  useEffect(() => {
    // Fetch artists and categories
    const init = async () => {
      try {
        const [artistsRes, categoriesRes] = await Promise.all([
            apiGet("/admin/users/artists", localStorage.getItem("token")),
            apiGet("/categories?active=true")
        ]);
        
        setArtists(artistsRes);
        setCategories(categoriesRes || []);

        // Set default artist if creating new
        if (!painting && artistsRes.length > 0 && !formData.artistId) {
          setFormData(prev => ({ 
            ...prev, 
            artistId: artistsRes[0]._id, 
            artistName: artistsRes[0].name 
          }));
        }
      } catch (e) {
        console.error(e);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (painting) {
      setFormData({
        title: painting.title || "",
        artistId: painting.artistId || "",
        artistName: painting.artistName || "",
        style: painting.style || "",
        medium: painting.medium || "",
        description: painting.description || "",
        price: painting.price?.USD ?? painting.price ?? "",
        stock: painting.stock ?? 1,
        size: painting.size || { height: "", width: "", unit: "cm" },
        year: painting.year || new Date().getFullYear(),
        subject: painting.subject || "",
        orientation: painting.orientation || "Portrait",
        images: painting.images || [],
        featured: painting.featured || false,
        category: painting.category || "",
        subcategory: painting.subcategory || ""
      });
    }
  }, [painting]);

  useEffect(() => {
    const cat = categories.find(c => c.name === formData.category);
    setSubOptions(cat?.subCategories || []);
  }, [formData.category, categories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({ ...formData, [parent]: { ...formData[parent], [child]: value } });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleArtistChange = (e) => {
    const artist = artists.find(a => a._id === e.target.value);
    setFormData({ ...formData, artistId: artist._id, artistName: artist.name });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    
    try {
      const payload = {
        ...formData,
        price: { USD: Number(formData.price) }
      };

      if (painting) {
        await apiPut(`/admin/paintings/${painting._id}`, payload, token);
      } else {
        await apiPost("/admin/paintings", payload, token);
      }

      toast.success("Painting saved successfully!");
      onSuccess();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60] overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">{painting ? "Edit Painting" : "Add New Painting"}</h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Images Section */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Painting Images</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
              {formData.images.map((img, idx) => (
                <div key={idx} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
              <button 
                type="button"
                onClick={() => setShowGallery(true)}
                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition aspect-square text-gray-500 hover:text-blue-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-sm font-medium">Add Images</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input name="title" required value={formData.title} onChange={handleChange} className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Starry Night" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Artist</label>
              <select 
                value={formData.artistId} 
                onChange={handleArtistChange}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select Artist</option>
                {artists.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select 
                name="category"
                value={formData.category} 
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select Category</option>
                {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Subcategory</label>
              <select 
                name="subcategory"
                value={formData.subcategory} 
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={!subOptions.length}
              >
                <option value="">Select Subcategory</option>
                {subOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Price (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input type="number" name="price" required value={formData.price} onChange={handleChange} className="w-full border rounded pl-7 pr-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stock</label>
              <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="flex items-center pt-6">
               <input 
                 type="checkbox" 
                 id="featured"
                 checked={formData.featured} 
                 onChange={e => setFormData({...formData, featured: e.target.checked})} 
                 className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
               />
               <label htmlFor="featured" className="ml-2 block text-sm font-medium text-gray-900">
                 Show in Homepage Slider (Featured)
               </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Style</label>
              <input name="style" value={formData.style} onChange={handleChange} className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Abstract" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Medium</label>
              <input name="medium" value={formData.medium} onChange={handleChange} className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Oil on Canvas" />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Height</label>
              <input name="size.height" value={formData.size.height} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Height" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Width</label>
              <input name="size.width" value={formData.size.width} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Width" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unit</label>
              <select name="size.unit" value={formData.size.unit} onChange={handleChange} className="w-full border rounded px-3 py-2">
                <option value="cm">cm</option>
                <option value="in">in</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border rounded px-3 py-2 h-24 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onCancel} className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition">Cancel</button>
            <button type="submit" disabled={uploading} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 shadow-md shadow-blue-200">
              {uploading ? "Saving..." : "Save Painting"}
            </button>
          </div>
        </form>

        {showGallery && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4">
            <MediaGallery 
              multiple={true}
              onClose={() => setShowGallery(false)}
              onSelect={(urls) => {
                const newUrls = Array.isArray(urls) ? urls : [urls];
                setFormData(prev => ({ ...prev, images: [...prev.images, ...newUrls] }));
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}