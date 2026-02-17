import { useState, useEffect } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import toast from "react-hot-toast";
import { Trash, Edit, Plus, Folder } from "lucide-react";

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    subCategories: "",
    description: "",
    active: true
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await apiGet("/categories");
      setCategories(data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load categories");
    }
  };

  const handleEdit = (cat) => {
    setEditing(cat);
    setFormData({
      name: cat.name,
      subCategories: cat.subCategories.join(", "),
      description: cat.description || "",
      active: cat.active
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      await apiDelete(`/categories/${id}`);
      fetchCategories();
      toast.success("Category deleted");
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        subCategories: formData.subCategories.split(",").map(s => s.trim()).filter(Boolean)
      };

      if (editing) {
        await apiPut(`/categories/${editing._id}`, payload);
        toast.success("Category updated");
      } else {
        await apiPost("/categories", payload);
        toast.success("Category created");
      }
      setIsModalOpen(false);
      setEditing(null);
      setFormData({ name: "", subCategories: "", description: "", active: true });
      fetchCategories();
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Category Management</h2>
        <button 
          onClick={() => { setEditing(null); setIsModalOpen(true); setFormData({ name: "", subCategories: "", description: "", active: true }); }}
          className="bg-black text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-800"
        >
          <Plus size={20} /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(cat => (
          <div key={cat._id} className="bg-white p-4 rounded-lg shadow border hover:shadow-md transition">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <Folder className="text-blue-500" size={24} />
                <h3 className="font-bold text-lg">{cat.name}</h3>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(cat)} className="text-gray-500 hover:text-blue-600"><Edit size={18} /></button>
                <button onClick={() => handleDelete(cat._id)} className="text-gray-500 hover:text-red-600"><Trash size={18} /></button>
              </div>
            </div>
            
            <p className="text-sm text-gray-500 mb-3">{cat.description || "No description"}</p>
            
            <div className="mb-3">
              <span className={`px-2 py-1 rounded text-xs font-bold ${cat.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {cat.active ? "Active" : "Inactive"}
              </span>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-400 mb-1">Subcategories:</p>
              <div className="flex flex-wrap gap-2">
                {cat.subCategories.length > 0 ? (
                  cat.subCategories.map((sub, idx) => (
                    <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">{sub}</span>
                  ))
                ) : (
                  <span className="text-gray-400 text-xs italic">None</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">{editing ? "Edit Category" : "New Category"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full border p-2 rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full border p-2 rounded h-20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Subcategories (comma separated)</label>
                <input 
                  value={formData.subCategories} 
                  onChange={e => setFormData({...formData, subCategories: e.target.value})}
                  className="w-full border p-2 rounded"
                  placeholder="e.g. Abstract, Modern, Landscape"
                />
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="active"
                  checked={formData.active}
                  onChange={e => setFormData({...formData, active: e.target.checked})}
                />
                <label htmlFor="active" className="text-sm font-medium">Active</label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
