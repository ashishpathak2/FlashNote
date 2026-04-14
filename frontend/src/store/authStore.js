import { create } from 'zustand';
import api from '../lib/api.js';

const getStored = (key) => {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
};

export const useAuthStore = create((set) => ({
  user:  getStored('mnemo_user'),
  token: localStorage.getItem('mnemo_token'),
  loading: false,

  login: async (email, password) => {
    set({ loading: true });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('mnemo_token', data.token);
      localStorage.setItem('mnemo_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });
      return { ok: true };
    } catch (e) {
      set({ loading: false });
      return { ok: false, message: e.response?.data?.message || 'Login failed' };
    }
  },

  register: async (name, email, password) => {
    set({ loading: true });
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('mnemo_token', data.token);
      localStorage.setItem('mnemo_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });
      return { ok: true };
    } catch (e) {
      set({ loading: false });
      return { ok: false, message: e.response?.data?.message || 'Registration failed' };
    }
  },

  logout: () => {
    localStorage.removeItem('mnemo_token');
    localStorage.removeItem('mnemo_user');
    set({ user: null, token: null });
  },
}));
