#!/bin/bash

cd frontend

# Create lib directory
mkdir -p lib components/ui app/clientes app/veiculos app/servicos app/agendamentos

# lib/utils.ts
cat > lib/utils.ts << 'EOF'
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
EOF

# lib/api.ts - API Client
cat > lib/api.ts << 'EOF'
const API_URL = 'http://localhost:3333/api';

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Erro na requisição' }));
    throw new Error(error.message || 'Erro na requisição');
  }

  return res.json();
}

// Clientes
export const clientesAPI = {
  getAll: (page = 1, limit = 10) => fetchAPI(`/clientes?page=${page}&limit=${limit}`),
  getOne: (id: string) => fetchAPI(`/clientes/${id}`),
  create: (data: any) => fetchAPI('/clientes', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchAPI(`/clientes/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => fetchAPI(`/clientes/${id}`, { method: 'DELETE' }),
  search: (q: string) => fetchAPI(`/clientes/search?q=${q}`),
};

// Veiculos
export const veiculosAPI = {
  getAll: (page = 1, limit = 10, clienteId?: string) =>
    fetchAPI(`/veiculos?page=${page}&limit=${limit}${clienteId ? `&clienteId=${clienteId}` : ''}`),
  getOne: (id: string) => fetchAPI(`/veiculos/${id}`),
  create: (data: any) => fetchAPI('/veiculos', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchAPI(`/veiculos/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => fetchAPI(`/veiculos/${id}`, { method: 'DELETE' }),
};

// Servicos
export const servicosAPI = {
  getAll: (page = 1, limit = 10) => fetchAPI(`/servicos?page=${page}&limit=${limit}&ativo=true`),
  getOne: (id: string) => fetchAPI(`/servicos/${id}`),
  create: (data: any) => fetchAPI('/servicos', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchAPI(`/servicos/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => fetchAPI(`/servicos/${id}`, { method: 'DELETE' }),
};

// Agendamentos
export const agendamentosAPI = {
  getAll: (page = 1, limit = 10) => fetchAPI(`/agendamentos?page=${page}&limit=${limit}`),
  getOne: (id: string) => fetchAPI(`/agendamentos/${id}`),
  create: (data: any) => fetchAPI('/agendamentos', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchAPI(`/agendamentos/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => fetchAPI(`/agendamentos/${id}`, { method: 'DELETE' }),
};
EOF

# Update tailwind.config.ts with design system colors
cat > tailwind.config.ts << 'EOF'
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        warning: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f97316',
          600: '#ea580c',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
EOF

# Install tailwindcss-animate
npm install tailwindcss-animate 2>&1 | tail -3

echo "✅ Shadcn/ui setup complete!"
