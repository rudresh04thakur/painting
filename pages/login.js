import { useState } from "react";
import Layout from "@/components/Layout";
import { apiPost } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const router = useRouter();
  const { redirect } = router.query;

  const submit = async () => {
    try {
      const res = await apiPost("/auth/login", { email: email.trim(), password });
      login(res.token, res.user);
      if (redirect) router.push(redirect);
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <Layout>
      <section className="mx-auto max-w-md px-4 py-8">
        <h1 className="text-2xl font-semibold mb-4">Login</h1>
        <input className="border rounded px-3 py-2 w-full mb-3" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="border rounded px-3 py-2 w-full mb-3" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="px-4 py-2 bg-blue-600 text-white rounded w-full" onClick={submit}>Login</button>
      </section>
    </Layout>
  );
}
