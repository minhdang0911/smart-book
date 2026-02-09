import { create } from 'zustand';
import { api } from '../services/api';

export const useCartStore = create((set, get) => ({
    count: 0,
    loading: false,
    lastSyncedAt: 0,

    _inflight: false,
    _syncTimer: null,

    reset: () => set({ count: 0, loading: false, lastSyncedAt: 0 }),

    optimisticIncrement: (n = 1) => set((s) => ({ count: Math.max(0, s.count + n) })),

    optimisticDecrement: (n = 1) => set((s) => ({ count: Math.max(0, s.count - n) })),

    setCount: (count) => set({ count: Math.max(0, Number(count || 0)) }),

    fetchCount: async () => {
        if (get()._inflight) return;
        set({ loading: true });
        set({ _inflight: true });

        try {
            const res = await api.get('/cart/count');

            const serverCount = res.data?.data?.count;
            if (serverCount !== undefined) {
                set({ count: serverCount, lastSyncedAt: Date.now() });
            }
        } catch (e) {
        } finally {
            set({ loading: false, _inflight: false });
        }
    },

    requestSync: (delayMs = 600) => {
        const timer = get()._syncTimer;
        if (timer) clearTimeout(timer);

        const t = setTimeout(() => {
            get().fetchCount();
            set({ _syncTimer: null });
        }, delayMs);

        set({ _syncTimer: t });
    },
}));
