'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Calendar } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await auth.login(email, senha);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo/Header - Clean and simple */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-blue-600 rounded-xl shadow-soft">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-outfit font-bold text-gray-900 tracking-tight">
                Agenda Estética Auto
              </h1>
              <p className="text-sm text-gray-600">
                Sistema de agendamentos
              </p>
            </div>
          </div>
        </div>

        {/* Login Card - Following design system */}
        <div className="bg-white rounded-xl shadow-soft border border-gray-200/60 p-8">
          <div className="mb-6">
            <h2 className="text-lg font-outfit font-semibold text-gray-900 mb-1">
              Login
            </h2>
            <p className="text-sm text-gray-600">
              Entre com suas credenciais
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                placeholder="seu@email.com"
              />
            </div>

            {/* Senha */}
            <div>
              <label
                htmlFor="senha"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Senha
              </label>
              <input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Submit Button - Simple, no gradient */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-soft hover:shadow-medium active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Entrando...
                </span>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Demo Credentials - More subtle */}
          <div className="mt-6 pt-5 border-t border-gray-200/60">
            <p className="text-xs text-gray-500">
              <span className="font-semibold text-gray-600">Credenciais de teste:</span>{' '}
              admin@demo.com / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
