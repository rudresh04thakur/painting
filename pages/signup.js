import { useState } from "react";
import Layout from "@/components/Layout";
import { apiPost } from "@/lib/api";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const submit = async () => {
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
      <section className="mx-auto max-w-md px-4 py-8">
        <h1 className="text-2xl font-semibold mb-4">Signup</h1>
        <input className="border rounded px-3 py-2 w-full mb-3" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
        <input className="border rounded px-3 py-2 w-full mb-3" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="border rounded px-3 py-2 w-full mb-3" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="px-4 py-2 bg-blue-600 text-white rounded w-full" onClick={submit}>Create Account</button>
      </section>
    </Layout>
  );
}
