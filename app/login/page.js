"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data.message || "Login failed");
      } else {
        setMsg("Logged in — redirecting...");
        setTimeout(()=>router.push("/items"), 600);
      }
    } catch (err) {
      setMsg("Server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-container">
      <h1 className="text-2xl font-semibold mb-6 text-center">Welcome back</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input 
            className="form-input" 
            placeholder="Email" 
            type="email" 
            value={form.email}
            onChange={(e)=>setForm({...form, email:e.target.value})} 
            required 
          />
          <span className="absolute right-3 top-2.5 text-blue-400">✱</span>
        </div>
        <div className="relative">
          <input 
            className="form-input" 
            placeholder="Password" 
            type="password" 
            value={form.password}
            onChange={(e)=>setForm({...form, password:e.target.value})} 
            required 
          />
          <span className="absolute right-3 top-2.5 text-blue-400">✱</span>
        </div>
        <div className="flex items-center justify-between pt-2">
          <button className="btn-primary" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
          <a className="text-sm text-blue-600 hover:text-blue-800" href="/register">Create account</a>
        </div>
      </form>
      {msg && <div className="mt-4 text-sm text-center font-medium text-gray-700">{msg}</div>}
    </div>
  );
}
