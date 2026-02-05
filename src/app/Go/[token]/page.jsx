'use client';

import { Button, Result, Spin } from 'antd';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function Page({ params }) {
    const { token } = params;
    const router = useRouter();
    const [state, setState] = React.useState({
        loading: true,
        error: null,
        data: null,
    });

    localStorage.setItem('group_cart_token', token);

    React.useEffect(() => {
        let cancelled = false;

        const joinGroup = async () => {
            const joinUrl = `https://smartbook-backend.tranminhdang.cloud/0/api/group-orders/${token}/join`;

            try {
                const authToken =
                    localStorage.getItem('auth_token') ||
                    localStorage.getItem('access_token') ||
                    localStorage.getItem('token');

                const commonHeaders = {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
                };

                // Thử POST trước (thường endpoint /join là POST)
                let res = await fetch(joinUrl, {
                    method: 'POST',
                    headers: commonHeaders,
                    credentials: 'include',
                });

                // Nếu BE dùng GET cho /join, fallback
                if (res.status === 405) {
                    res = await fetch(joinUrl, {
                        method: 'GET',
                        headers: commonHeaders,
                        credentials: 'include',
                    });
                }

                if (res.status === 401) {
                    throw new Error('Bạn cần đăng nhập để tham gia giỏ hàng nhóm.');
                }

                if (!res.ok) {
                    let msg = 'Không thể tham gia giỏ hàng nhóm.';
                    try {
                        const err = await res.json();
                        msg = err.message || msg;
                    } catch {
                        // ignore
                    }
                    throw new Error(msg + ` (HTTP ${res.status})`);
                }

                const json = await res.json(); // { group_id, member_id, status }

                if (cancelled) return;

                // Nếu có status mà khác 'open' thì báo lỗi
                if (json.status && json.status !== 'open') {
                    throw new Error('Phòng đã đóng hoặc không khả dụng.');
                }

                // Lưu lại để trang /cart_group biết tham chiếu nhóm nào
                localStorage.setItem(
                    'group_order',
                    JSON.stringify({
                        token,
                        group_id: json.group_id,
                        member_id: json.member_id,
                        status: json.status,
                        joined_at: new Date().toISOString(),
                    }),
                );

                setState({ loading: false, error: null, data: json });

                // Điều hướng sang giỏ hàng nhóm
                router.replace('/cart_group');
            } catch (e) {
                if (cancelled) return;
                setState({ loading: false, error: e.message || 'Đã xảy ra lỗi', data: null });
            }
        };

        joinGroup();

        return () => {
            cancelled = true;
        };
    }, [token, router]);

    if (state.loading) {
        return (
            <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Spin size="large" tip="Đang tham gia giỏ hàng nhóm..." />
            </div>
        );
    }

    if (state.error) {
        return (
            <Result
                status="error"
                title="Không thể tham gia giỏ hàng nhóm"
                subTitle={state.error}
                extra={[
                    <Button key="cart" type="primary" onClick={() => router.push('/cart_group')}>
                        Tới giỏ hàng nhóm
                    </Button>,
                    <Button key="home" onClick={() => router.push('/')}>
                        Về trang chủ
                    </Button>,
                ]}
            />
        );
    }

    // Nếu vì lý do gì đó chưa redirect, hiển thị thành công.
    return (
        <Result
            status="success"
            title="Tham gia giỏ hàng nhóm thành công"
            subTitle={`Mã tham gia: ${token} • Nhóm #${state.data?.group_id}`}
            extra={[
                <Button key="goto" type="primary" onClick={() => router.replace('/cart_group')}>
                    Đi tới giỏ hàng nhóm
                </Button>,
            ]}
        />
    );
}
