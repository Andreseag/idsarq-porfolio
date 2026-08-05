import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.href = "/admin";
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("Credenciales incorrectas o usuario no autorizado.");
      return;
    }
    window.location.href = "/admin";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-2xl">
        <h1 className="text-2xl font-semibold text-brand-dark mb-1">Panel Estudio K</h1>
        <p className="text-brand-muted text-sm mb-8">Acceso exclusivo para el equipo</p>

        {error && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>}

        <label className="block text-sm font-medium text-brand-dark mb-2">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-3 rounded-xl border border-brand-dark/15 focus:border-brand-dark outline-none"
          placeholder="tu@estudiok.arq"
        />

        <label className="block text-sm font-medium text-brand-dark mb-2">Contraseña</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 px-4 py-3 rounded-xl border border-brand-dark/15 focus:border-brand-dark outline-none"
          placeholder="••••••••"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-brand-dark text-brand-cream font-medium rounded-xl hover:bg-brand-primary transition-colors disabled:opacity-60"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
