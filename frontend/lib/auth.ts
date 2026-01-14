interface User {
  id: string;
  email: string;
  nome: string;
  role: string;
  tenant: {
    id: string;
    nome: string;
    slug: string;
    plano: string;
  };
}

interface AuthResponse {
  access_token: string;
  user: User;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const auth = {
  // Login
  async login(email: string, senha: string): Promise<AuthResponse> {
    const response = await fetch('http://localhost:3333/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, senha }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao fazer login');
    }

    const data: AuthResponse = await response.json();

    // Store token and user
    this.setToken(data.access_token);
    this.setUser(data.user);

    return data;
  },

  // Logout
  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },

  // Get token
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  // Set token
  setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  // Get user
  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  // Set user
  setUser(user: User) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  // Check if authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  // Get authorization header
  getAuthHeader(): Record<string, string> {
    const token = this.getToken();
    if (!token) return {};
    return {
      Authorization: `Bearer ${token}`,
    };
  },
};
