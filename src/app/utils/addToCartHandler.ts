'use client';

import { message } from 'antd';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

/* ===== Types ===== */

type User = {
    id: number | string;
    name?: string;
};

type AddToCartResponse = {
    status: boolean;
    message?: string;
    data?: unknown;
};

interface AddToCartHelperParams {
    user?: User | null;
    bookId: number;
    quantity: number;
    addToCart: (token: string, bookId: number, quantity: number) => Promise<AddToCartResponse>;
    setIsAddingToCart: (loading: boolean) => void;
    router?: AppRouterInstance;
}

/* ===== Handler ===== */

export const handleAddToCartHelper = async ({
    bookId,
    quantity,
    addToCart,
    setIsAddingToCart,
    router,
}: AddToCartHelperParams) => {
    // ✅ guard cho SSR / build
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (!token) {
        message.warning('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
        router?.push('/login');
        return;
    }

    try {
        setIsAddingToCart(true);

        const response = await addToCart(token, bookId, quantity);

        if (response?.status) {
            message.success('Đã thêm sản phẩm vào giỏ hàng');
        } else {
            message.error(response?.message || 'Không thể thêm sản phẩm vào giỏ hàng');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        message.error('Lỗi khi thêm sản phẩm vào giỏ hàng');
    } finally {
        setIsAddingToCart(false);
    }
};
