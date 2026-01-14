import { auth } from './auth';

const API_URL = typeof window !== 'undefined'
  ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}/api`
  : 'http://localhost:3333/api';

async function fetchAPI(endpoint: string, options?: RequestInit) {
  // Get auth header
  const authHeader = auth.getAuthHeader();

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
      ...options?.headers,
    },
  });

  // Handle 401 - redirect to login
  if (res.status === 401 && typeof window !== 'undefined') {
    auth.logout();
    window.location.href = '/login';
    throw new Error('Sessão expirada. Faça login novamente.');
  }

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
  getAll: (page = 1, limit = 10) => fetchAPI(`/servicos?page=${page}&limit=${limit}`),
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

// Configurações
export const configuracoesAPI = {
  getHorarios: () => fetchAPI('/configuracoes'),
  saveHorariosPadrao: (horarios: Record<string, string | null>) =>
    fetchAPI('/configuracoes/horarios/padrao', { method: 'POST', body: JSON.stringify(horarios) }),
  getOne: (chave: string) => fetchAPI(`/configuracoes/${chave}`),
  save: (chave: string, valor: string, descricao?: string) =>
    fetchAPI(`/configuracoes/${chave}`, { method: 'POST', body: JSON.stringify({ valor, descricao }) }),
};

// Bloqueios de Horário
export const bloqueiosAPI = {
  getAll: (tipo?: string, ativo?: boolean) => {
    const params = new URLSearchParams();
    if (tipo) params.append('tipo', tipo);
    if (ativo !== undefined) params.append('ativo', String(ativo));
    return fetchAPI(`/bloqueios${params.toString() ? `?${params}` : ''}`);
  },
  getByDate: (date: Date) => fetchAPI(`/bloqueios/data/${date.toISOString()}`),
  getOne: (id: string) => fetchAPI(`/bloqueios/${id}`),
  create: (data: any) => fetchAPI('/bloqueios', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchAPI(`/bloqueios/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => fetchAPI(`/bloqueios/${id}`, { method: 'DELETE' }),
};
