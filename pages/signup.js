import { useState } from "react";
import Layout from "@/components/Layout";
import { apiPost } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiPost("/auth/signup", { name, email, password, role: "customer" });
      toast.success("Account created! Please login.");
      router.push("/login");
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <Layout>
      <section className="mx-auto max-w-md px-4 py-24 min-h-[60vh] flex flex-col justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <h1 className="text-3xl font-serif text-gray-900 mb-8 text-center">Create Account</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                placeholder="John Doe"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                required
                type="email"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                required
                type="password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-lg active:scale-[0.98] transform"
            >
              Start Your Journey
            </button>
          </form>
          <div className="mt-8 text-center text-sm text-gray-500">
            Already have an account? <Link href="/login" className="text-gray-900 font-semibold hover:underline">Sign in here</Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
