#!/bin/bash

cd frontend

# TypeScript config
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

# Next.js config
cat > next.config.mjs << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

export default nextConfig
EOF

# Tailwind config
cat > tailwind.config.ts << 'EOF'
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
    },
  },
  plugins: [],
};
export default config;
EOF

# PostCSS config
cat > postcss.config.mjs << 'EOF'
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
EOF

# Global CSS
cat > app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}
EOF

# Root layout
cat > app/layout.tsx << 'EOF'
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agenda Estética Auto",
  description: "Sistema de Agendamento para Estética Automotiva",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
EOF

# Main page
cat > app/page.tsx << 'EOF'
'use client';

import { useEffect, useState } from 'react';

interface HealthCheck {
  status: string;
  timestamp: string;
  service: string;
}

export default function Home() {
  const [health, setHealth] = useState<HealthCheck | null>(null);
  const [clientes, setClientes] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Check backend health
    fetch('http://localhost:3333/api/health')
      .then(res => res.json())
      .then(data => setHealth(data))
      .catch(err => setError('Backend não conectado'));

    // Fetch clientes
    fetch('http://localhost:3333/api/clientes')
      .then(res => res.json())
      .then(data => setClientes(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">
            🚗 Agenda Estética Auto
          </h1>
          <p className="text-gray-600">
            Sistema de Agendamento para Estética Automotiva - MVP Fase 1
          </p>
        </header>

        {/* Backend Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Status do Backend</h2>
          {health ? (
            <div className="space-y-2">
              <p className="text-green-600 font-semibold">✅ Backend Online</p>
              <p className="text-sm text-gray-600">Service: {health.service}</p>
              <p className="text-sm text-gray-600">Status: {health.status}</p>
              <p className="text-sm text-gray-600">Time: {new Date(health.timestamp).toLocaleString('pt-BR')}</p>
            </div>
          ) : error ? (
            <p className="text-red-600">❌ {error}</p>
          ) : (
            <p className="text-gray-400">Conectando...</p>
          )}
        </div>

        {/* Clientes List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Clientes Cadastrados</h2>
          {clientes ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                Total: {clientes.meta?.total || 0} clientes
              </p>
              <div className="grid gap-4">
                {clientes.data?.map((cliente: any) => (
                  <div key={cliente.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-500 transition">
                    <h3 className="font-semibold text-lg">{cliente.nome}</h3>
                    <p className="text-sm text-gray-600">📱 {cliente.telefone}</p>
                    {cliente.email && (
                      <p className="text-sm text-gray-600">✉️ {cliente.email}</p>
                    )}
                    <div className="mt-2 flex gap-4 text-sm">
                      <span className="text-gray-500">
                        🚗 {cliente.veiculos?.length || 0} veículo(s)
                      </span>
                      <span className="text-gray-500">
                        📅 {cliente._count?.agendamentos || 0} agendamento(s)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-400">Carregando clientes...</p>
          )}
        </div>

        {/* API Endpoints */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-2xl font-semibold mb-4">Endpoints da API</h2>
          <div className="grid gap-2 text-sm">
            <div className="font-mono bg-gray-100 p-2 rounded">
              GET http://localhost:3333/api/clientes
            </div>
            <div className="font-mono bg-gray-100 p-2 rounded">
              GET http://localhost:3333/api/veiculos
            </div>
            <div className="font-mono bg-gray-100 p-2 rounded">
              GET http://localhost:3333/api/servicos
            </div>
            <div className="font-mono bg-gray-100 p-2 rounded">
              GET http://localhost:3333/api/agendamentos
            </div>
          </div>
        </div>

        {/* Implementation Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h2 className="text-2xl font-semibold mb-4 text-blue-900">Status da Implementação</h2>
          <div className="space-y-2">
            <p className="text-green-700">✅ Backend NestJS completo e funcional</p>
            <p className="text-green-700">✅ Banco de dados SQLite criado e populado</p>
            <p className="text-green-700">✅ CRUD de Clientes implementado</p>
            <p className="text-green-700">✅ CRUD de Veículos implementado</p>
            <p className="text-green-700">✅ CRUD de Serviços implementado</p>
            <p className="text-green-700">✅ CRUD de Agendamentos implementado</p>
            <p className="text-green-700">✅ Frontend Next.js básico funcionando</p>
            <p className="text-green-700">✅ Integração Backend-Frontend ativa</p>
            <p className="text-yellow-700">⏳ UI completa com shadcn/ui (próxima iteração)</p>
            <p className="text-yellow-700">⏳ Páginas CRUD completas (próxima iteração)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
EOF

echo "✅ Frontend structure created!"
