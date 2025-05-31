import { create } from 'zustand';

interface TokenState {
  token: string | null;
  role: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string, role: string, remember?: boolean) => void;
  clearAuth: () => void;
}

const useTokenStore = create<TokenState>((set) => ({
  token: localStorage.getItem('token') || sessionStorage.getItem('token') || null,
  role: localStorage.getItem('role') || sessionStorage.getItem('role') || null,
  isAuthenticated: !!(localStorage.getItem('token') || sessionStorage.getItem('token')),
  
  setAuth: (token: string, role: string) => {
    // Xóa token cũ từ cả hai storage (để tránh trùng lặp)
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);

    sessionStorage.setItem('token', token);
    sessionStorage.setItem('role', role);
    
    // Cập nhật state
    set({ token, role, isAuthenticated: true });
  },
  
  clearAuth: () => {
    // Xóa khỏi cả localStorage và sessionStorage
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    
    // Reset state
    set({ token: null, role: null, isAuthenticated: false });
  }
}));

export default useTokenStore;