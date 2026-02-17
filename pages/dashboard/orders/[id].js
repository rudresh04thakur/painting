import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import dayjs from 'dayjs';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { ArrowLeft, Package, Truck, Calendar, DollarSign, Mail, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import AdminSidebar from '@/components/admin/Sidebar';

export default function OrderDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refunds, setRefunds] = useState([]);
  
  // Edit States
  const [isEditingTracking, setIsEditingTracking] = useState(false);
  const [trackingForm, setTrackingForm] = useState({ courier: '', awb: '', url: '', estimatedDeliveryDate: '' });

  // Helper to ensure image path is correct
  const getImageUrl = (img) => {
    if (!img) return '/assets/img/default-product.jpg';
    if (img.startsWith('http')) return img;
    if (img.startsWith('assets')) return `/${img}`;
    return img;
  }

  useEffect(() => {
    if (id) loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return router.push('/login');

      // Fetch Order
      const resOrder = await fetch(`/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!resOrder.ok) throw new Error('Failed to load order');
      const orderData = await resOrder.json();
      setOrder(orderData);
      setTrackingForm({
        courier: orderData.tracking?.courier || '',
        awb: orderData.tracking?.awb || '',
        url: orderData.tracking?.url || '',
        estimatedDeliveryDate: orderData.estimatedDeliveryDate ? dayjs(orderData.estimatedDeliveryDate).format('YYYY-MM-DD') : ''
      });

      // Fetch Refunds (to check for any requests)
      // Note: In a larger app, we'd filter on backend. Here we filter client-side for simplicity as per existing pattern.
      const resRefunds = await fetch(`/api/admin/refunds`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resRefunds.ok) {
        const allRefunds = await resRefunds.json();
        const relatedRefunds = allRefunds.filter(r => r.orderId?._id === id || r.orderId === id);
        setRefunds(relatedRefunds);
      }

    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/orders/${id}/tracking`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      toast.success(`Status updated to ${status}`);
      loadOrder();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const saveTracking = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/orders/${id}/tracking`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(trackingForm)
      });
      toast.success('Tracking & Delivery info updated');
      setIsEditingTracking(false);
      loadOrder();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleRefundAction = async (refundId, action, note = '') => {
    try {
      const token = localStorage.getItem('token');
      const status = action === 'approve' ? 'Approved' : 'Rejected';
      
      if (!note) {
        const { value: userNote } = await Swal.fire({
          title: `${status} Refund?`,
          input: 'text',
          inputLabel: 'Add a note',
          showCancelButton: true
        });
        if (!userNote && userNote !== '') return;
        note = userNote;
      }

      const res = await fetch(`/api/admin/refunds/${refundId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, note })
      });
      
      if (!res.ok) throw new Error('Failed to update refund status');
      
      toast.success(`Refund ${status}`);
      loadOrder(); // Reload to refresh refund list
    } catch (e) {
      toast.error(e.message);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!order) return <div className="min-h-screen flex items-center justify-center">Order not found</div>;

  return (
    <div className="flex bg-gray-50 min-h-screen font-sans">
      <Head>
        <title>Order #{id.slice(-6)} - Admin</title>
      </Head>
      <Toaster position="top-right" />
      
      <AdminSidebar activeTab="orders" setActiveTab={(tab) => router.push(`/dashboard/admin?tab=${tab}`)} />

      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin?tab=orders" className="p-2 bg-white border rounded-lg hover:bg-gray-50 text-gray-600">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                Order #{order._id}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                  order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                  order.status.includes('Pending') ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {order.status}
                </span>
              </h1>
              <div className="text-sm text-gray-500 mt-1 flex items-center gap-4">
                <span className="flex items-center gap-1"><Calendar size={14} /> {dayjs(order.createdAt).format("MMM D, YYYY HH:mm")}</span>
                <span className="flex items-center gap-1"><DollarSign size={14} /> Total: ${order.totalUSD}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
             {order.status === 'Pending Payment' && (
               <button 
                 onClick={() => updateStatus('Processing')}
                 className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm font-medium"
               >
                 Confirm Payment
               </button>
             )}
             {['Payment Verified', 'Processing'].includes(order.status) && (
               <button 
                 onClick={() => { updateStatus('Shipped'); setIsEditingTracking(true); }}
                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm font-medium"
               >
                 Mark Shipped
               </button>
             )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Items */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Package size={20} /> Order Items
              </h3>
              <div className="divide-y">
                {order.items.map((item, i) => (
                  <div key={i} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={getImageUrl(item.paintingId?.images?.[0])} 
                        alt="" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.paintingId?.title || 'Unknown Painting'}</h4>
                      <div className="text-sm text-gray-500">{item.paintingId?.artistName}</div>
                      <div className="text-sm font-mono mt-1">${item.priceUSD}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t mt-4 pt-4 flex justify-between items-center font-medium text-lg">
                <span>Total Amount</span>
                <span>${order.totalUSD}</span>
              </div>
            </div>

            {/* Customer & Address */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold text-lg mb-4">Customer Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Contact Info</div>
                  <div className="font-medium">{order.address?.fullName}</div>
                  <div className="text-sm text-blue-600 flex items-center gap-1 mt-1">
                    <Mail size={14} /> 
                    <a href={`mailto:${order.address?.email}`}>{order.address?.email}</a>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Shipping Address</div>
                  <div className="text-sm text-gray-800">
                    {order.address?.line1}<br/>
                    {order.address?.city}, {order.address?.country}<br/>
                    {order.address?.postalCode}
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Clock size={20} /> Timeline
              </h3>
              <div className="space-y-4">
                {order.timeline?.slice().reverse().map((t, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-24 text-xs text-gray-500 pt-1 text-right flex-shrink-0">
                      {dayjs(t.time).format("MMM D, HH:mm")}
                    </div>
                    <div className="relative pl-4 border-l-2 border-gray-100 pb-2 last:pb-0">
                      <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-blue-400"></div>
                      <p className="text-sm text-gray-800">{t.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Actions & Management */}
          <div className="space-y-6">
            
            {/* Status & Tracking Management */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Truck size={20} /> Tracking & Delivery
                </h3>
                <button 
                  onClick={() => setIsEditingTracking(!isEditingTracking)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {isEditingTracking ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {isEditingTracking ? (
                <form onSubmit={saveTracking} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                    <select 
                      value={order.status}
                      onChange={e => updateStatus(e.target.value)} // Direct update for status
                      className="w-full border rounded px-3 py-2 text-sm"
                    >
                      {["Pending Payment","Payment Verified","Processing","Shipped","In Transit","Delivered","On Hold","Cancelled","Refunded"].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Courier Name</label>
                    <input 
                      value={trackingForm.courier}
                      onChange={e => setTrackingForm({...trackingForm, courier: e.target.value})}
                      className="w-full border rounded px-3 py-2 text-sm"
                      placeholder="e.g. FedEx, DHL"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Tracking / AWB Number</label>
                    <input 
                      value={trackingForm.awb}
                      onChange={e => setTrackingForm({...trackingForm, awb: e.target.value})}
                      className="w-full border rounded px-3 py-2 text-sm"
                      placeholder="Tracking ID"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Tracking URL</label>
                    <input 
                      value={trackingForm.url}
                      onChange={e => setTrackingForm({...trackingForm, url: e.target.value})}
                      className="w-full border rounded px-3 py-2 text-sm"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Estimated Delivery Date</label>
                    <input 
                      type="date"
                      value={trackingForm.estimatedDeliveryDate}
                      onChange={e => setTrackingForm({...trackingForm, estimatedDeliveryDate: e.target.value})}
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                  </div>
                  <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                    Save Tracking Details
                  </button>
                </form>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-1 border-b border-dashed">
                    <span className="text-gray-500">Courier</span>
                    <span className="font-medium">{order.tracking?.courier || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-dashed">
                    <span className="text-gray-500">Tracking #</span>
                    <span className="font-medium font-mono">{order.tracking?.awb || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-dashed">
                    <span className="text-gray-500">Est. Delivery</span>
                    <span className="font-medium">
                      {order.estimatedDeliveryDate ? dayjs(order.estimatedDeliveryDate).format('MMM D, YYYY') : 'Not Set'}
                    </span>
                  </div>
                  {order.tracking?.url && (
                    <a 
                      href={order.tracking.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="block text-center text-blue-600 hover:underline mt-2"
                    >
                      Track Shipment &rarr;
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Refund Management */}
            {refunds.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-red-600">
                  <AlertTriangle size={20} /> Refund Requests
                </h3>
                <div className="space-y-4">
                  {refunds.map(r => (
                    <div key={r._id} className="bg-red-50 p-4 rounded-lg border border-red-100">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-red-800">{r.reason}</span>
                        <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${
                          r.status === 'Approved' ? 'bg-green-200 text-green-800' :
                          r.status === 'Rejected' ? 'bg-gray-200 text-gray-800' :
                          'bg-yellow-200 text-yellow-800'
                        }`}>{r.status}</span>
                      </div>
                      <p className="text-sm text-red-700 mb-3">{r.notes}</p>
                      
                      {r.status === 'Requested' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleRefundAction(r._id, 'approve')}
                            className="flex-1 bg-green-600 text-white py-1.5 rounded text-xs font-semibold hover:bg-green-700 flex items-center justify-center gap-1"
                          >
                            <CheckCircle size={12} /> Approve
                          </button>
                          <button 
                            onClick={() => handleRefundAction(r._id, 'reject')}
                            className="flex-1 bg-red-600 text-white py-1.5 rounded text-xs font-semibold hover:bg-red-700 flex items-center justify-center gap-1"
                          >
                            <XCircle size={12} /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact / Support */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Mail size={20} /> Contact & Issues
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Need to contact the customer regarding delivery or tracking issues?
              </p>
              <a 
                href={`mailto:${order.address?.email}?subject=Order #${order._id} - Status Update&body=Dear ${order.address?.fullName},%0D%0A%0D%0AWe are writing to inform you regarding your order...`}
                className="block w-full text-center bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 font-medium text-sm mb-3"
              >
                Draft Email to Customer
              </a>
              <div className="text-xs text-gray-400 text-center">
                Use the email button above to open your default mail client with order details.
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
