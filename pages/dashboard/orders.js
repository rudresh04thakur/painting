import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem("token");
      fetch("/api/orders", { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(setOrders)
        .catch(() => setOrders([]));
    }
  }, [user]);

  if (loading || !user) return <Layout><div className="p-8">Loading...</div></Layout>;

  return (
    <Layout>
      <section className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-semibold mb-4">My Orders</h1>
        <div className="space-y-3">
          {orders.map(o => (
            <div key={o._id} className="border rounded p-3 bg-white flex items-center justify-between">
              <div>
                <div className="font-medium">Order {o._id}</div>
                <div className="text-sm text-gray-600">Status: {o.status}</div>
              </div>
              <a href={`/orders/${o._id}`} className="px-3 py-1 bg-gray-900 text-white rounded">Track</a>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
