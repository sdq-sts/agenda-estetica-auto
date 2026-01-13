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
