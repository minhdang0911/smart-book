import { create } from 'zustand';
import { api } from '../services/api';

export const useAuthStore = create((set, get) => ({
    user: null,
    token: null,
    loading: false,

    hydrate: () => {
        if (typeof window === 'undefined') return;
        const token = localStorage.getItem('token');
        set({ token: token || null });
    },

    fetchMe: async () => {
        const token = get().token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
        if (!token) {
            set({ user: null, token: null });
            return null;
        }

        set({ loading: true });
        try {
            const res = await api.get('/user/me');

            const data = res.data;

            if (data?.status === true && data?.user) {
                set({ user: data.user, token, loading: false });
                return data.user;
            }

            set({ user: null, loading: false });
            return null;
        } catch (e) {
            set({ user: null, loading: false });
            return null;
        }
    },

    logout: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        set({ user: null, token: null });
    },
}));
