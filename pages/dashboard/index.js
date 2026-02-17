import Layout from "@/components/Layout";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  if (loading || !user) return <Layout><div className="p-8">Loading...</div></Layout>;

  return (
    <Layout>
      <section className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
        <div className="mb-4">Welcome, {user.name}</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/orders" className="border rounded p-4 bg-white hover:bg-gray-50">My Orders</Link>
          <Link href="/refund" className="border rounded p-4 bg-white hover:bg-gray-50">Request Refund/Return</Link>
          {user.role === "artist" && <Link href="/dashboard/artist" className="border rounded p-4 bg-white hover:bg-gray-50">Artist Panel</Link>}
          {user.role === "admin" && <Link href="/dashboard/admin" className="border rounded p-4 bg-white hover:bg-gray-50">Admin Panel</Link>}
        </div>
      </section>
    </Layout>
  );
}
