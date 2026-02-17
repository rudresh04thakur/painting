import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import AdminSidebar from "@/components/admin/Sidebar";
import { apiGet, apiPut, apiDelete, apiPost } from "@/lib/api";
import AdminPaintingForm from "@/components/AdminPaintingForm";
import CategoryManager from "@/components/admin/CategoryManager";
import MediaGallery from "@/components/MediaGallery";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminPanel() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [settingsTab, setSettingsTab] = useState('invoice');

  useEffect(() => {
    if (router.query.tab) {
      setActiveTab(router.query.tab);
    }
  }, [router.query.tab]);
  const [paintings, setPaintings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState(null);
  
  // SEO State
  const [seo, setSeo] = useState({ title: "", description: "", keywords: "" });
  
  // Reports State
  const [reportData, setReportData] = useState([]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [chartData, setChartData] = useState({ dailySales: [], statusDistribution: [] });

  // Painting form state
  const [editingPainting, setEditingPainting] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // User form state
  const [editingUser, setEditingUser] = useState(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [userFormData, setUserFormData] = useState({ name: "", email: "", password: "", role: "customer", image: "" });
  const [userOrders, setUserOrders] = useState([]); // Purchase history
  const [showUserImageGallery, setShowUserImageGallery] = useState(false);
  
  // Pages Management State
  const [pageSlug, setPageSlug] = useState('contact');
  const [pageContent, setPageContent] = useState('');

  // Payment Settings State
  const [showQrGallery, setShowQrGallery] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState({
    online: {
      upi: { enabled: true, upiId: '', qrCodeUrl: '' },
      stripe: { enabled: false, publishableKey: '', secretKey: '' }
    },
    offline: {
      enabled: true,
      bankDetails: { accountName: '', accountNumber: '', ifsc: '', bankName: '' }
    }
  });

  // Invoice Settings State
  const [invoiceSettings, setInvoiceSettings] = useState({
    companyName: '',
    addressLine1: '',
    cityStateZip: '',
    gstin: '',
    email: '',
    website: ''
  });

  // Refund State
  const [refunds, setRefunds] = useState([]);

  // Testimonial State
  const [testimonials, setTestimonials] = useState([]);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [testimonialForm, setTestimonialForm] = useState({ name: '', role: '', content: '', rating: 5, active: true });

  // Pagination & Search State
  const [paintingPage, setPaintingPage] = useState(1);
  const [paintingTotalPages, setPaintingTotalPages] = useState(1);
  const [paintingSearch, setPaintingSearch] = useState("");

  const [orderPage, setOrderPage] = useState(1);
  const [orderTotalPages, setOrderTotalPages] = useState(1);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("All");

  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userSearch, setUserSearch] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const fetchPaintings = async () => {
    const params = new URLSearchParams();
    params.append('page', paintingPage);
    params.append('limit', 20);
    if (paintingSearch) params.append('search', paintingSearch);
    
    try {
      const data = await apiGet(`/paintings?${params.toString()}`, token);
      if (data.items) {
        setPaintings(data.items);
        setPaintingTotalPages(data.pagination.pages);
      } else {
        setPaintings(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchOrders = async () => {
    const params = new URLSearchParams();
    params.append('page', orderPage);
    params.append('limit', 20);
    if (orderSearch) params.append('search', orderSearch);
    if (orderStatusFilter && orderStatusFilter !== 'All') params.append('status', orderStatusFilter);

    try {
      const data = await apiGet(`/admin/orders?${params.toString()}`, token);
      if (data.items) {
        setOrders(data.items);
        setOrderTotalPages(data.pagination.pages);
      } else {
        setOrders(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeTab === 'paintings') fetchPaintings();
  }, [paintingPage, paintingSearch, activeTab]);

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
  }, [orderPage, orderSearch, orderStatusFilter, activeTab]);

  const fetchUsers = async () => {
    const params = new URLSearchParams();
    params.append('page', userPage);
    params.append('limit', 20);
    if (userSearch) params.append('search', userSearch);

    try {
      const data = await apiGet(`/admin/users?${params.toString()}`, token);
      if (data.items) {
        setUsers(data.items);
        setUserTotalPages(data.pagination.pages);
      } else {
        setUsers(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
  }, [userPage, userSearch, activeTab]);

  const load = async () => {
    try {
      // Load initial data
      if (activeTab === 'paintings') fetchPaintings();
      if (activeTab === 'orders') fetchOrders();
      if (activeTab === 'users') fetchUsers();

      const s = await apiGet("/admin/analytics/summary", token);
      const seoConfig = await apiGet("/admin/seo", token);
      const payConfig = await apiGet("/payments/settings", token);
      const invConfig = await apiGet("/admin/invoice-settings", token);
      const charts = await apiGet("/admin/analytics/charts", token);
      const r = await apiGet("/admin/refunds", token);
      const t = await apiGet("/testimonials?all=true", token);
      
      setSummary(s);
      if (seoConfig) setSeo(seoConfig);
      if (payConfig) setPaymentSettings(payConfig);
      if (invConfig) setInvoiceSettings(invConfig);
      if (charts) setChartData(charts);
      if (r) setRefunds(r);
      if (t) setTestimonials(t);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { load(); }, []);
  
  useEffect(() => {
    if (activeTab === 'pages') {
      apiGet(`/admin/pages/${pageSlug}`, token).then(d => setPageContent(d.content || ''));
    }
  }, [activeTab, pageSlug]);

  const saveSeo = async (e) => {
    e.preventDefault();
    await apiPost("/admin/seo", seo, token);
    toast.success("SEO settings saved!");
  };

  const savePageContent = async () => {
    await apiPut(`/admin/pages/${pageSlug}`, { content: pageContent }, token);
    toast.success('Page content updated!');
  };

  const savePaymentSettings = async () => {
    await apiPost("/payments/settings", paymentSettings, token);
    toast.success("Payment settings saved!");
  };

  const saveInvoiceSettings = async (e) => {
    e.preventDefault();
    await apiPut("/admin/invoice-settings", invoiceSettings, token);
    toast.success("Invoice settings saved!");
  };

  const loadUserOrders = async (userId) => {
    const ords = await apiGet(`/admin/users/${userId}/orders`, token);
    setUserOrders(ords);
  };
  
  const loadReport = async () => {
    const q = new URLSearchParams(dateRange).toString();
    const data = await apiGet(`/admin/reports/sales?${q}`, token);
    setReportData(data);
  };


  const handleDeletePainting = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Painting?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      await apiDelete(`/admin/paintings/${id}`, token);
      toast.success("Painting deleted");
      load();
    }
  };

  const markFeatured = async (id, featured) => {
    await apiPut(`/admin/paintings/${id}/featured`, { featured }, token);
    load();
  };

  const updateOrderStatus = async (id, status) => {
    let tracking = null;

    if (status === 'Shipped') {
      const { value: formValues } = await Swal.fire({
        title: 'Shipping Details',
        html:
          '<input id="swal-courier" class="swal2-input" placeholder="Courier Name (e.g. FedEx)">' +
          '<input id="swal-awb" class="swal2-input" placeholder="Tracking Number / AWB">' +
          '<input id="swal-url" class="swal2-input" placeholder="Tracking URL (Optional)">',
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Save & Mark Shipped',
        preConfirm: () => {
          const courier = document.getElementById('swal-courier').value;
          const awb = document.getElementById('swal-awb').value;
          const url = document.getElementById('swal-url').value;
          if (!courier || !awb) {
            Swal.showValidationMessage('Please enter Courier and Tracking Number');
          }
          return { courier, awb, url };
        }
      });

      if (!formValues) return; // User cancelled
      tracking = formValues;
    }

    await apiPut(`/admin/orders/${id}/status`, { status, tracking }, token);
    toast.success(`Order marked as ${status}`);
    load();
  };

  // User Management Handlers
  const handleDeleteUser = async (id) => {
    const result = await Swal.fire({
      title: 'Delete User?',
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: 'Yes, delete user'
    });

    if (result.isConfirmed) {
      await apiDelete(`/admin/users/${id}`, token);
      toast.success("User deleted");
      load();
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await apiPut(`/admin/users/${editingUser._id}`, userFormData, token);
        toast.success("User updated successfully");
      } else {
        await apiPost("/admin/users", userFormData, token);
        toast.success("User created successfully");
      }
      setShowUserForm(false);
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const openUserForm = (user = null) => {
    setEditingUser(user);
    setUserFormData(user ? { 
      name: user.name, 
      email: user.email, 
      role: user.role, 
      password: "",
      image: user.image || "",
      country: user.country || "",
      bio: user.bio || ""
    } : { 
      name: "", 
      email: "", 
      password: "", 
      role: "customer",
      image: "",
      country: "",
      bio: ""
    });
    if (user) {
      loadUserOrders(user._id);
    } else {
      setUserOrders([]);
    }
    setShowUserForm(true);
  };

  const exportCSV = async () => {
    const res = await fetch("/api/admin/export/orders", { headers: { Authorization: `Bearer ${token}` } });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    a.click();
  };

  const handleRefundStatus = async (id, status) => {
    const { value: note } = await Swal.fire({
      title: `${status} Refund?`,
      input: 'text',
      inputLabel: 'Add a note (optional)',
      showCancelButton: true
    });

    if (note !== undefined) {
      await apiPut(`/admin/refunds/${id}`, { status, note }, token);
      toast.success(`Refund ${status}`);
      load();
    }
  };

  const renderRefunds = () => (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Refund Requests</h3>
      {refunds.length === 0 ? (
        <p className="text-gray-500">No refund requests found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Order / Customer</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Reason</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {refunds.map(r => (
                <tr key={r._id}>
                  <td className="p-3">{dayjs(r.createdAt).format("MMM D, YYYY")}</td>
                  <td className="p-3">
                    <div className="font-mono text-xs mb-1">#{r.orderId?._id?.slice(-6)}</div>
                    <div className="text-gray-600">{r.customerId?.email}</div>
                  </td>
                  <td className="p-3 font-medium">${r.orderId?.totalUSD}</td>
                  <td className="p-3">
                    <div className="font-medium">{r.reason}</div>
                    <div className="text-xs text-gray-500">{r.notes}</div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      r.status === 'Approved' || r.status === 'Processed' ? 'bg-green-100 text-green-800' :
                      r.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {r.status === 'Requested' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleRefundStatus(r._id, 'Approved')} className="text-green-600 hover:text-green-800 text-xs font-semibold">Approve</button>
                        <button onClick={() => handleRefundStatus(r._id, 'Rejected')} className="text-red-600 hover:text-red-800 text-xs font-semibold">Reject</button>
                      </div>
                    )}
                    {r.status === 'Approved' && (
                      <button onClick={() => handleRefundStatus(r._id, 'Processed')} className="text-blue-600 hover:text-blue-800 text-xs font-semibold">Mark Processed</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderSEO = () => (
    <div className="bg-white rounded-xl border shadow-sm p-6 max-w-2xl">
      <h3 className="text-lg font-semibold mb-4">Global SEO Settings</h3>
      <form onSubmit={saveSeo} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Meta Title</label>
          <input 
            className="w-full border rounded px-3 py-2"
            value={seo.title}
            onChange={e => setSeo({...seo, title: e.target.value})}
            placeholder="Default site title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Meta Description</label>
          <textarea 
            className="w-full border rounded px-3 py-2 h-24"
            value={seo.description}
            onChange={e => setSeo({...seo, description: e.target.value})}
            placeholder="Default site description"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Keywords</label>
          <input 
            className="w-full border rounded px-3 py-2"
            value={seo.keywords}
            onChange={e => setSeo({...seo, keywords: e.target.value})}
            placeholder="art, painting, gallery..."
          />
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Changes</button>
      </form>
    </div>
  );

  const renderPages = () => (
    <div className="bg-white rounded-xl border shadow-sm p-6 max-w-4xl">
      <h3 className="text-lg font-semibold mb-4">Manage Page Content</h3>
      <div className="flex gap-4 mb-4">
        {['contact', 'support', 'privacy', 'terms'].map(slug => (
          <button 
            key={slug}
            onClick={() => setPageSlug(slug)}
            className={`px-4 py-2 rounded capitalize ${pageSlug === slug ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {slug.replace('-', ' ')}
          </button>
        ))}
      </div>
      <textarea 
        className="w-full h-96 border rounded p-4 font-mono text-sm"
        value={pageContent}
        onChange={e => setPageContent(e.target.value)}
        placeholder="Enter HTML or plain text content here..."
      />
      <div className="mt-4 flex justify-end">
        <button onClick={savePageContent} className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">Save Content</button>
      </div>
    </div>
  );

  const renderReports = () => {
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
      <div className="space-y-6">
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Sales Trend (Last 30 Days)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.dailySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{fontSize: 12}} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={2} name="Sales ($)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Order Status Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Ledger Section */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Sales Ledger & Reports</h3>
          <div className="flex flex-wrap gap-4 items-end mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input type="date" className="border rounded px-3 py-2" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input type="date" className="border rounded px-3 py-2" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} />
            </div>
            <button onClick={loadReport} className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700">Generate Report</button>
            <button onClick={exportCSV} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 ml-auto">Export All Orders (CSV)</button>
          </div>
          
          {reportData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 border-b">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Payment</th>
                    <th className="p-3">Total (USD)</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {reportData.map(r => (
                    <tr key={r._id}>
                      <td className="p-3">{dayjs(r.createdAt).format("YYYY-MM-DD")}</td>
                      <td className="p-3 font-mono text-xs">{r._id}</td>
                      <td className="p-3">{r.address?.fullName}</td>
                      <td className="p-3 capitalize">{r.paymentMethod}</td>
                      <td className="p-3 font-bold">${r.totalUSD}</td>
                      <td className="p-3">{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8 border rounded-lg bg-gray-50">
              Select a date range and click "Generate Report" to view ledger data.
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderInvoiceSettings = () => (
    <div className="bg-white rounded-xl border shadow-sm p-6 max-w-2xl">
      <h3 className="text-lg font-semibold mb-4">Invoice & Company Details</h3>
      <form onSubmit={saveInvoiceSettings} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Company Name</label>
          <input 
            className="w-full border rounded px-3 py-2"
            value={invoiceSettings.companyName}
            onChange={e => setInvoiceSettings({...invoiceSettings, companyName: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Address Line 1</label>
          <input 
            className="w-full border rounded px-3 py-2"
            value={invoiceSettings.addressLine1}
            onChange={e => setInvoiceSettings({...invoiceSettings, addressLine1: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">City, State, Zip</label>
          <input 
            className="w-full border rounded px-3 py-2"
            value={invoiceSettings.cityStateZip}
            onChange={e => setInvoiceSettings({...invoiceSettings, cityStateZip: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">GSTIN</label>
          <input 
            className="w-full border rounded px-3 py-2"
            value={invoiceSettings.gstin}
            onChange={e => setInvoiceSettings({...invoiceSettings, gstin: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input 
            className="w-full border rounded px-3 py-2"
            value={invoiceSettings.email}
            onChange={e => setInvoiceSettings({...invoiceSettings, email: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Website</label>
          <input 
            className="w-full border rounded px-3 py-2"
            value={invoiceSettings.website}
            onChange={e => setInvoiceSettings({...invoiceSettings, website: e.target.value})}
          />
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Changes</button>
      </form>
    </div>
  );

  const renderOverview = () => (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Orders</div>
          <div className="text-3xl font-bold text-gray-900">{summary?.totalOrders || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Sales (USD)</div>
          <div className="text-3xl font-bold text-gray-900">${summary?.totalSalesUSD?.toLocaleString() || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="text-sm font-medium text-gray-500 mb-1">Pending Orders</div>
          <div className="text-3xl font-bold text-orange-600">{summary?.pending || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="text-sm font-medium text-gray-500 mb-1">Cancelled</div>
          <div className="text-3xl font-bold text-red-600">{summary?.cancelled || 0}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden mb-8">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-700">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Order ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {summary?.recentOrders?.map(r => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="p-3 text-gray-600">{dayjs(r.createdAt).format("MMM D, HH:mm")}</td>
                  <td className="p-3 font-mono text-xs text-gray-500">{r._id}</td>
                  <td className="p-3 text-gray-900">{r.address?.fullName || "N/A"}</td>
                  <td className="p-3 font-medium">${r.totalUSD}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      r.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      r.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      r.status.includes('Pending') ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => router.push(`/dashboard/orders/${r._id}`)} className="text-blue-600 hover:underline">View</button>
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-500">No recent orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPaintings = () => (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="p-4 border-b flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50">
        <h3 className="font-semibold text-gray-700">Paintings Library</h3>
        
        <div className="flex flex-1 max-w-md gap-2">
          <input 
            type="text" 
            placeholder="Search paintings..." 
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={paintingSearch}
            onChange={(e) => { setPaintingSearch(e.target.value); setPaintingPage(1); }}
          />
        </div>

        <button 
          onClick={() => { setEditingPainting(null); setShowForm(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
        >
          + Add New Painting
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b">
            <tr>
              <th className="p-4 font-medium">Image</th>
              <th className="p-4 font-medium">Title</th>
              <th className="p-4 font-medium">Artist</th>
              <th className="p-4 font-medium">Price</th>
              <th className="p-4 font-medium">Stock</th>
              <th className="p-4 font-medium">Slider / Featured</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {Array.isArray(paintings) && paintings.length > 0 ? (
              paintings.map(p => (
                <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden shadow-sm">
                      {p.images?.[0] ? (
                        <img 
                          src={p.images[0]} 
                          alt="" 
                          className="w-full h-full object-cover" 
                          onError={(e) => { e.target.onerror = null; e.target.src = '/assets/img/default-product.jpg'; }}
                        />
                      ) : (
                        <img 
                          src="/assets/img/default-product.jpg" 
                          alt="" 
                          className="w-full h-full object-cover" 
                        />
                      )}
                    </div>
                  </td>
                  <td className="p-4 font-medium text-gray-900">{p.title}</td>
                  <td className="p-4 text-gray-600">{p.artistName}</td>
                  <td className="p-4 text-gray-600 font-mono">${p.price?.USD ?? p.price}</td>
                  <td className="p-4 text-gray-600">{p.stock}</td>
                  <td className="p-4">
                    <button 
                      onClick={() => markFeatured(p._id, !p.featured)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all shadow-sm ${
                        p.featured 
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-purple-200' 
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {p.featured ? "On Slider" : "Add to Slider"}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => { setEditingPainting(p); setShowForm(true); }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeletePainting(p._id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-500">
                  {Array.isArray(paintings) ? "No paintings found." : "Loading paintings..."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      {paintingTotalPages > 1 && (
        <div className="p-4 border-t bg-gray-50 flex justify-center items-center gap-4">
          <button 
            disabled={paintingPage === 1}
            onClick={() => setPaintingPage(p => Math.max(1, p - 1))}
            className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {paintingPage} of {paintingTotalPages}
          </span>
          <button 
            disabled={paintingPage === paintingTotalPages}
            onClick={() => setPaintingPage(p => Math.min(paintingTotalPages, p + 1))}
            className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );

  const renderOrders = () => (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="p-4 border-b flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50">
        <h3 className="font-semibold text-gray-700">Recent Orders</h3>
        
        <div className="flex flex-1 max-w-2xl gap-2">
           <input 
             type="text" 
             placeholder="Search orders (ID, Customer, Status)..." 
             className="w-full border rounded-lg px-3 py-2 text-sm"
             value={orderSearch}
             onChange={(e) => { setOrderSearch(e.target.value); setOrderPage(1); }}
           />
           <select 
             className="border rounded-lg px-3 py-2 text-sm bg-white"
             value={orderStatusFilter}
             onChange={(e) => { setOrderStatusFilter(e.target.value); setOrderPage(1); }}
           >
             <option value="All">All Status</option>
             {["Pending Payment","Payment Verified","Processing","Shipped","In Transit","Delivered","On Hold","Cancelled","Refunded"].map(s => (
                <option key={s} value={s}>{s}</option>
             ))}
           </select>
        </div>

        <button onClick={exportCSV} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 whitespace-nowrap">
          Export CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b">
            <tr>
              <th className="p-4 font-medium">Order ID</th>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Customer</th>
              <th className="p-4 font-medium">Total</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Items</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map(o => (
              <tr key={o._id} className="hover:bg-gray-50">
                <td className="p-4 font-mono text-xs text-gray-500">{o._id}</td>
                <td className="p-4 text-gray-600">{dayjs(o.createdAt).format("MMM D, YYYY")}</td>
                <td className="p-4 text-gray-900">{o.address?.fullName || "N/A"}</td>
                <td className="p-4 font-medium">${o.totalUSD}</td>
                <td className="p-4">
                  <div className="flex flex-col gap-1">
                    <select 
                      value={o.status} 
                      onChange={e => updateOrderStatus(o._id, e.target.value)}
                      className={`border-0 bg-transparent font-medium cursor-pointer focus:ring-0 p-0 ${
                        o.status === 'Delivered' ? 'text-green-600' : 
                        o.status === 'Cancelled' ? 'text-red-600' : 'text-blue-600'
                      }`}
                    >
                       {["Pending Payment","Payment Verified","Processing","Shipped","In Transit","Delivered","On Hold","Cancelled","Refunded"].map(s => (
                         <option key={s} value={s}>{s}</option>
                       ))}
                    </select>

                    {o.status === 'Pending Payment' && (
                      <button 
                        onClick={() => updateOrderStatus(o._id, 'Processing')}
                        className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 border border-green-200 font-medium text-center mt-1"
                      >
                        Confirm Payment
                      </button>
                    )}

                    {['Payment Verified', 'Processing'].includes(o.status) && (
                      <button 
                        onClick={() => updateOrderStatus(o._id, 'Shipped')}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 border border-blue-200 font-medium text-center mt-1"
                      >
                        Mark Shipped
                      </button>
                    )}

                    {['Shipped', 'In Transit', 'Delivered'].includes(o.status) && (
                      <button 
                        onClick={() => router.push(`/dashboard/orders/${o._id}`)} 
                        className="text-xs text-gray-500 hover:text-blue-600 text-left underline mt-1"
                      >
                        {o.tracking?.awb ? `Track: ${o.tracking.awb}` : 'Add Tracking Info'}
                      </button>
                    )}
                  </div>
                </td>
                <td className="p-4 text-gray-500">{o.items?.length} items</td>
                <td className="p-4 text-right">
                  <button onClick={() => router.push(`/dashboard/orders/${o._id}`)} className="text-blue-600 hover:underline">View History</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      {orderTotalPages > 1 && (
        <div className="p-4 border-t bg-gray-50 flex justify-center items-center gap-4">
          <button 
            disabled={orderPage === 1}
            onClick={() => setOrderPage(p => Math.max(1, p - 1))}
            className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {orderPage} of {orderTotalPages}
          </span>
          <button 
            disabled={orderPage === orderTotalPages}
            onClick={() => setOrderPage(p => Math.min(orderTotalPages, p + 1))}
            className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );

  const renderUsers = () => (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="p-4 border-b flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50">
        <h3 className="font-semibold text-gray-700">User Management</h3>
        
        <div className="flex flex-1 max-w-md gap-2">
          <input 
            type="text" 
            placeholder="Search users..." 
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={userSearch}
            onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
          />
        </div>

        <button 
          onClick={() => openUserForm()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
        >
          + Add New User
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b">
            <tr>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium">Joined</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map(u => (
              <tr key={u._id} className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900">{u.name}</td>
                <td className="p-4 text-gray-600">{u.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${
                    u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    u.role === 'artist' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-4 text-gray-500">{dayjs(u.createdAt).format("MMM D, YYYY")}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => openUserForm(u)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(u._id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      {userTotalPages > 1 && (
        <div className="p-4 border-t bg-gray-50 flex justify-center items-center gap-4">
          <button 
            disabled={userPage === 1}
            onClick={() => setUserPage(p => Math.max(1, p - 1))}
            className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {userPage} of {userTotalPages}
          </span>
          <button 
            disabled={userPage === userTotalPages}
            onClick={() => setUserPage(p => Math.min(userTotalPages, p + 1))}
            className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Online Payments</h3>
        <div className="space-y-6">
          {/* UPI Settings */}
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">UPI / QR Code</h4>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={paymentSettings.online?.upi?.enabled} 
                  onChange={e => setPaymentSettings({
                    ...paymentSettings, 
                    online: { ...paymentSettings.online, upi: { ...paymentSettings.online.upi, enabled: e.target.checked } }
                  })}
                  className="w-4 h-4 text-blue-600 rounded" 
                />
                <span className="text-sm font-medium">Enable</span>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">UPI ID</label>
                <input 
                  className="w-full border rounded px-3 py-2" 
                  value={paymentSettings.online?.upi?.upiId} 
                  onChange={e => setPaymentSettings({
                    ...paymentSettings,
                    online: { ...paymentSettings.online, upi: { ...paymentSettings.online.upi, upiId: e.target.value } }
                  })}
                  placeholder="gallery@upi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">QR Code Image URL</label>
                <div className="flex gap-2">
                  <input 
                    className="w-full border rounded px-3 py-2" 
                    value={paymentSettings.online?.upi?.qrCodeUrl} 
                    onChange={e => setPaymentSettings({
                      ...paymentSettings,
                      online: { ...paymentSettings.online, upi: { ...paymentSettings.online.upi, qrCodeUrl: e.target.value } }
                    })}
                    placeholder="/uploads/qr.png"
                  />
                  <button 
                    onClick={() => setShowQrGallery(true)}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm whitespace-nowrap"
                  >
                    Select Image
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-1">Upload or select QR code image from Media Library.</div>
              </div>
            </div>
          </div>

          {/* Stripe Settings */}
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">Cards (Stripe/Gateway)</h4>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={paymentSettings.online?.stripe?.enabled} 
                  onChange={e => setPaymentSettings({
                    ...paymentSettings, 
                    online: { ...paymentSettings.online, stripe: { ...paymentSettings.online.stripe, enabled: e.target.checked } }
                  })}
                  className="w-4 h-4 text-blue-600 rounded" 
                />
                <span className="text-sm font-medium">Enable</span>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Publishable Key</label>
                <input 
                  className="w-full border rounded px-3 py-2" 
                  value={paymentSettings.online?.stripe?.publishableKey} 
                  onChange={e => setPaymentSettings({
                    ...paymentSettings,
                    online: { ...paymentSettings.online, stripe: { ...paymentSettings.online.stripe, publishableKey: e.target.value } }
                  })}
                  placeholder="pk_test_..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Secret Key</label>
                <input 
                  type="password"
                  className="w-full border rounded px-3 py-2" 
                  value={paymentSettings.online?.stripe?.secretKey} 
                  onChange={e => setPaymentSettings({
                    ...paymentSettings,
                    online: { ...paymentSettings.online, stripe: { ...paymentSettings.online.stripe, secretKey: e.target.value } }
                  })}
                  placeholder="sk_test_..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Offline Payments (Bank Transfer)</h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={paymentSettings.offline?.enabled} 
              onChange={e => setPaymentSettings({
                ...paymentSettings, 
                offline: { ...paymentSettings.offline, enabled: e.target.checked }
              })}
              className="w-4 h-4 text-blue-600 rounded" 
            />
            <span className="text-sm font-medium">Enable</span>
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Bank Name</label>
            <input 
              className="w-full border rounded px-3 py-2" 
              value={paymentSettings.offline?.bankDetails?.bankName} 
              onChange={e => setPaymentSettings({
                ...paymentSettings,
                offline: { ...paymentSettings.offline, bankDetails: { ...paymentSettings.offline.bankDetails, bankName: e.target.value } }
              })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Account Name</label>
            <input 
              className="w-full border rounded px-3 py-2" 
              value={paymentSettings.offline?.bankDetails?.accountName} 
              onChange={e => setPaymentSettings({
                ...paymentSettings,
                offline: { ...paymentSettings.offline, bankDetails: { ...paymentSettings.offline.bankDetails, accountName: e.target.value } }
              })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Account Number</label>
            <input 
              className="w-full border rounded px-3 py-2" 
              value={paymentSettings.offline?.bankDetails?.accountNumber} 
              onChange={e => setPaymentSettings({
                ...paymentSettings,
                offline: { ...paymentSettings.offline, bankDetails: { ...paymentSettings.offline.bankDetails, accountNumber: e.target.value } }
              })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">IFSC / Routing Code</label>
            <input 
              className="w-full border rounded px-3 py-2" 
              value={paymentSettings.offline?.bankDetails?.ifsc} 
              onChange={e => setPaymentSettings({
                ...paymentSettings,
                offline: { ...paymentSettings.offline, bankDetails: { ...paymentSettings.offline.bankDetails, ifsc: e.target.value } }
              })}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={savePaymentSettings} className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium">
          Save Payment Settings
        </button>
      </div>
    </div>
  );

  const handleTestimonialSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTestimonial) {
        await apiPut(`/testimonials/${editingTestimonial._id}`, testimonialForm, token);
        toast.success("Testimonial updated");
      } else {
        await apiPost("/testimonials", testimonialForm, token);
        toast.success("Testimonial created");
      }
      setShowTestimonialModal(false);
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleDeleteTestimonial = async (id) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      await apiDelete(`/testimonials/${id}`, token);
      toast.success("Testimonial deleted");
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const openTestimonialModal = (t = null) => {
    setEditingTestimonial(t);
    setTestimonialForm(t ? { 
      name: t.name, 
      role: t.role, 
      content: t.content, 
      rating: t.rating, 
      active: t.active,
      image: t.image 
    } : { 
      name: '', 
      role: 'Customer', 
      content: '', 
      rating: 5, 
      active: true,
      image: '' 
    });
    setShowTestimonialModal(true);
  };

  const renderTestimonials = () => (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Client Testimonials</h3>
        <button 
          onClick={() => openTestimonialModal()}
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
        >
          Add Testimonial
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3">Client</th>
              <th className="p-3">Content</th>
              <th className="p-3">Rating</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {testimonials.map(t => (
              <tr key={t._id} className="hover:bg-gray-50">
                <td className="p-3">
                  <div className="font-medium">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.role}</div>
                </td>
                <td className="p-3 max-w-md truncate" title={t.content}>
                  {t.content}
                </td>
                <td className="p-3">
                  <div className="flex text-yellow-400 text-xs">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>{i < t.rating ? '★' : '☆'}</span>
                    ))}
                  </div>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {t.active ? 'Active' : 'Draft'}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => openTestimonialModal(t)} className="text-blue-600 hover:underline mr-3">Edit</button>
                  <button onClick={() => handleDeleteTestimonial(t._id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {testimonials.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">
                  No testimonials found. Add one to build social proof!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="flex border-b border-gray-200">
        {[
          { id: 'invoice', label: 'Invoice' },
          { id: 'payments', label: 'Payments' },
          { id: 'seo', label: 'SEO' },
          { id: 'pages', label: 'Content Pages' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSettingsTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              settingsTab === tab.id ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {settingsTab === 'invoice' && renderInvoiceSettings()}
      {settingsTab === 'payments' && renderPaymentSettings()}
      {settingsTab === 'seo' && renderSEO()}
      {settingsTab === 'pages' && renderPages()}
    </div>
  );

  // ... existing render functions (Overview, Orders, etc.)

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 capitalize tracking-tight">
                {activeTab === 'settings' ? `Settings / ${settingsTab}` : activeTab.replace('-', ' ')}
              </h1>
              <p className="text-gray-500 text-sm mt-1">Manage your enterprise platform</p>
            </div>
            <div className="flex items-center gap-4">
               <div className="text-right">
                 <div className="text-sm font-medium text-gray-900">Admin User</div>
                 <div className="text-xs text-gray-500">Super Admin</div>
               </div>
               <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">AD</div>
            </div>
          </header>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[600px] p-6">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'paintings' && renderPaintings()}
            {activeTab === 'categories' && <CategoryManager />}
            {activeTab === 'media' && <MediaGallery className="h-full min-h-[600px] border-none shadow-none" />}
            {activeTab === 'orders' && renderOrders()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'testimonials' && renderTestimonials()}
            {activeTab === 'reports' && renderReports()}
            {activeTab === 'payments' && renderPaymentSettings()}
            {activeTab === 'settings' && renderSettings()}
          </div>
        </div>
      </main>

      {/* Modals */}
      {showForm && (
        <AdminPaintingForm 
          painting={editingPainting} 
          onSuccess={() => { setShowForm(false); load(); }} 
          onCancel={() => setShowForm(false)} 
        />
      )}
      
      {/* ... other modals (User Form, Order Details, QR Gallery) ... */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">{editingUser ? 'Edit User' : 'Add New User'}</h3>
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input 
                  required 
                  value={userFormData.name} 
                  onChange={e => setUserFormData({...userFormData, name: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input 
                  type="email" 
                  required 
                  value={userFormData.email} 
                  onChange={e => setUserFormData({...userFormData, email: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  disabled={!!editingUser}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password {editingUser && '(Leave blank to keep current)'}</label>
                <input 
                  type="password" 
                  value={userFormData.password} 
                  onChange={e => setUserFormData({...userFormData, password: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  minLength={6}
                  required={!editingUser}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select 
                  value={userFormData.role} 
                  onChange={e => setUserFormData({...userFormData, role: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="customer">Customer</option>
                  <option value="artist">Artist</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowUserForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save User</button>
              </div>
            </form>

            {editingUser && userOrders.length > 0 && (
              <div className="mt-8 border-t pt-4">
                <h4 className="font-semibold mb-2">Purchase History</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {userOrders.map(o => (
                    <div key={o._id} className="text-sm bg-gray-50 p-2 rounded flex justify-between">
                      <div>
                        <div className="font-medium">#{o._id.slice(-6)}</div>
                        <div className="text-xs text-gray-500">{dayjs(o.createdAt).format("MMM D, YYYY")}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${o.totalUSD}</div>
                        <div className="text-xs text-blue-600">{o.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Details Modal (Reuse existing) */}

      {/* QR Gallery Modal */}
      {showQrGallery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <MediaGallery
            onClose={() => setShowQrGallery(false)}
            onSelect={(url) => {
              setPaymentSettings({
                ...paymentSettings,
                online: { ...paymentSettings.online, upi: { ...paymentSettings.online.upi, qrCodeUrl: url } }
              });
            }}
          />
        </div>
      )}

      {/* User Image Gallery Modal */}
      {showUserImageGallery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <MediaGallery
            onClose={() => setShowUserImageGallery(false)}
            onSelect={(url) => {
              setUserFormData({ ...userFormData, image: url });
              setShowUserImageGallery(false);
            }}
          />
        </div>
      )}

      {/* Testimonial Modal */}
      {showTestimonialModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">{editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}</h3>
            <form onSubmit={handleTestimonialSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Client Name</label>
                <input 
                  required 
                  value={testimonialForm.name} 
                  onChange={e => setTestimonialForm({...testimonialForm, name: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role / Location</label>
                <input 
                  value={testimonialForm.role} 
                  onChange={e => setTestimonialForm({...testimonialForm, role: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g. Collector from NYC"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Testimonial Content</label>
                <textarea 
                  required 
                  value={testimonialForm.content} 
                  onChange={e => setTestimonialForm({...testimonialForm, content: e.target.value})}
                  className="w-full border rounded px-3 py-2 h-24"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rating (1-5)</label>
                <select 
                  value={testimonialForm.rating} 
                  onChange={e => setTestimonialForm({...testimonialForm, rating: Number(e.target.value)})}
                  className="w-full border rounded px-3 py-2"
                >
                  {[5, 4, 3, 2, 1].map(r => (
                    <option key={r} value={r}>{r} Stars</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  id="t_active"
                  checked={testimonialForm.active}
                  onChange={e => setTestimonialForm({...testimonialForm, active: e.target.checked})}
                />
                <label htmlFor="t_active" className="text-sm font-medium">Active (Visible on site)</label>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowTestimonialModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}


