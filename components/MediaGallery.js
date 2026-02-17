import { useState, useEffect } from "react";
import Image from "next/image";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import toast from "react-hot-toast";

export default function MediaGallery({ onSelect, multiple = false, onClose, className }) {
  const [activeTab, setActiveTab] = useState("library"); // library | upload
  const [images, setImages] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState("");
  const [selected, setSelected] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const getImageUrl = (img) => {
    if (!img) return '/assets/img/default-product.jpg';
    if (img.startsWith('http')) return img;
    if (img.startsWith('assets')) return `/${img}`;
    return img;
  };

  useEffect(() => {
    fetchFolders();
    fetchImages();
  }, [currentFolder, page, search]);

  const fetchFolders = async () => {
    try {
      const data = await apiGet("/media/folders", token);
      setFolders(data || []);
    } catch (e) {
      console.error("Failed to load folders");
    }
  };

  const fetchImages = async () => {
    try {
      const params = new URLSearchParams();
      if (currentFolder) params.append('folder', currentFolder);
      if (search) params.append('search', search);
      params.append('page', page);

      const data = await apiGet(`/media?${params.toString()}`, token);
      if (data.items) {
        setImages(data.items);
        setTotalPages(data.pagination.pages);
      } else {
        setImages(data); // Legacy fallback
      }
    } catch (e) {
      toast.error("Failed to load images");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const files = e.target.files;
    if (!files || !files.length) return;

    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }
    
    // Use current folder or new folder name if provided
    const targetFolder = newFolderName || currentFolder || "General";
    formData.append("folder", targetFolder);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/media", { 
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      
      if (!res.ok) throw new Error("Upload failed");
      const newImages = await res.json();
      setImages([...newImages, ...images]);
      setActiveTab("library");
      if (newFolderName) {
          fetchFolders(); // Refresh folders if new one created
          setCurrentFolder(newFolderName);
          setNewFolderName("");
      }
      toast.success("Uploaded successfully");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Delete this image?")) return;
    try {
      await apiDelete(`/media/${id}`, token);
      setImages(images.filter(i => i._id !== id));
      toast.success("Deleted");
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleSelect = (img) => {
    if (multiple) {
      if (selected.find(s => s._id === img._id)) {
        setSelected(selected.filter(s => s._id !== img._id));
      } else {
        setSelected([...selected, img]);
      }
    } else {
      if (onSelect) {
        onSelect(img.url);
        if (onClose) onClose();
      }
    }
  };

  const confirmSelection = () => {
    if (onSelect) {
      onSelect(selected.map(s => s.url));
      if (onClose) onClose();
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-xl overflow-hidden flex flex-col border ${className || 'h-[600px] w-full max-w-4xl mx-auto'}`}>
      <div className="flex border-b">
        <button 
          className={`px-6 py-3 font-medium ${activeTab === 'library' ? 'bg-gray-100 text-black border-b-2 border-black' : 'text-gray-500'}`}
          onClick={() => setActiveTab('library')}
        >
          Media Library
        </button>
        <button 
          className={`px-6 py-3 font-medium ${activeTab === 'upload' ? 'bg-gray-100 text-black border-b-2 border-black' : 'text-gray-500'}`}
          onClick={() => setActiveTab('upload')}
        >
          Upload New
        </button>
        {onClose && <button onClick={onClose} className="ml-auto px-6 text-gray-400 hover:text-black">✕</button>}
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {activeTab === 'library' ? (
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-700">Folder:</span>
                <select 
                  value={currentFolder} 
                  onChange={(e) => { setCurrentFolder(e.target.value); setPage(1); }}
                  className="border p-2 rounded min-w-[150px]"
                >
                  <option value="">All Images</option>
                  {folders.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <input 
                  type="text" 
                  placeholder="Search media..." 
                  className="w-full border p-2 rounded"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map(img => (
                <div 
                  key={img._id} 
                  className={`group relative aspect-square bg-gray-200 rounded overflow-hidden cursor-pointer border-2 ${selected.find(s => s._id === img._id) ? 'border-blue-500' : 'border-transparent hover:border-gray-300'}`}
                  onClick={() => handleSelect(img)}
                >
                  <Image src={getImageUrl(img.url)} alt="media" layout="fill" objectFit="cover" />
                  <button 
                    onClick={(e) => handleDelete(img._id, e)}
                    className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                  >
                    ✕
                  </button>
                  {/* Selection Checkmark */}
                  {(multiple && selected.find(s => s._id === img._id)) && (
                    <div className="absolute top-1 left-1 bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">✓</div>
                  )}
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-4 flex justify-center space-x-2">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="px-3 py-1 text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-white p-8">
            <div className="mb-8 w-full max-w-md space-y-4 border p-4 rounded bg-gray-50">
                <h3 className="font-medium text-gray-900">Upload Settings</h3>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Target Folder</label>
                    <select 
                        value={currentFolder} 
                        onChange={(e) => { setCurrentFolder(e.target.value); setNewFolderName(""); }}
                        className="w-full border p-2 rounded bg-white"
                    >
                        <option value="">Select a folder...</option>
                        {folders.map(f => (
                            <option key={f} value={f}>{f}</option>
                        ))}
                    </select>
                </div>
                <div className="text-center text-xs text-gray-400 font-bold">OR</div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Create New Folder</label>
                    <input 
                        type="text" 
                        placeholder="Enter new folder name" 
                        value={newFolderName}
                        onChange={(e) => { setNewFolderName(e.target.value); setCurrentFolder(""); }}
                        className="w-full border p-2 rounded"
                    />
                </div>
            </div>

            <div className="w-full max-w-md border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center hover:bg-gray-50 transition-colors">
                <input 
                  type="file" 
                  multiple 
                  onChange={handleUpload} 
                  className="hidden" 
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center w-full">
                  <span className="text-4xl mb-4">☁️</span>
                  <span className="text-lg font-medium text-gray-700">Click to Upload Images</span>
                  <span className="text-sm text-gray-500 mt-2">Support JPG, PNG, WEBP</span>
                </label>
                {uploading && <div className="mt-4 text-blue-600 font-medium">Uploading...</div>}
            </div>
          </div>
        )}
      </div>

      {multiple && activeTab === 'library' && (
        <div className="p-4 border-t bg-white flex justify-end">
          <button 
            onClick={confirmSelection}
            className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
          >
            Use Selected ({selected.length})
          </button>
        </div>
      )}
    </div>
  );
}
