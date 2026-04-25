"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.log("Supabase error:", error.message, error.status);
      setError("Email ou password incorrectos.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-sm p-8">
        {/* Logo / título */}
        <div className="mb-8 text-center">
          <div className="w-10 h-10 bg-gray-900 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-lg font-semibold">MC</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Backoffice</h1>
          <p className="text-sm text-gray-500 mt-1">
            Entra para gerir as explicações
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="input"
              placeholder="o-teu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn-primary w-full justify-center"
            disabled={loading}
          >
            {loading ? "A entrar…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
