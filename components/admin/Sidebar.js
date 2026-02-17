import Link from 'next/link';
import { useRouter } from 'next/router';
import { LayoutDashboard, Package, Users, FileText, Settings, CreditCard, Receipt, LogOut, ArrowLeft, MessageSquareQuote, Image as ImageIcon } from 'lucide-react';

export default function AdminSidebar({ activeTab, setActiveTab }) {
  const router = useRouter();

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'orders', label: 'Orders', icon: <Package size={20} /> },
    { id: 'paintings', label: 'Inventory', icon: <FileText size={20} /> },
    { id: 'categories', label: 'Categories', icon: <Package size={20} /> },
    { id: 'media', label: 'Media Gallery', icon: <ImageIcon size={20} /> },
    { id: 'users', label: 'Customers', icon: <Users size={20} /> },
    { id: 'testimonials', label: 'Testimonials', icon: <MessageSquareQuote size={20} /> },
    { id: 'reports', label: 'Reports', icon: <Receipt size={20} /> },
    { id: 'payments', label: 'Payments', icon: <CreditCard size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    router.push('/login');
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-100 h-screen fixed left-0 top-0 flex flex-col z-50 shadow-sm">
      <div className="p-6 border-b border-gray-50 flex items-center gap-3">
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold">A</div>
        <span className="font-semibold text-lg tracking-tight">Admin Panel</span>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">Main Menu</div>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === item.id 
                ? 'bg-black text-white shadow-md' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-50">
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-900 rounded-lg w-full transition-colors"
        >
          <ArrowLeft size={18} /> Back to Site
        </button>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg w-full mt-1 transition-colors"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
}
