'use client';

import { Divider, Spin, Tabs, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { useOrderDetail, useOrders } from '../../hooks/useOrders';
import OrderCard from './OrderCard';
import OrderDetailModal from './OrderDetailModal';

const { Title, Text } = Typography;

const OrderHistory = ({ token, enabled }) => {
    // Data
    const { orders, loading, cancelOrder } = useOrders(token, enabled);
    const [activeTab, setActiveTab] = useState('all');
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const { orderDetail } = useOrderDetail(selectedOrderId, token);

    // UI tokens
    const ui = {
        page: '#f6f7fb',
        card: '#ffffff',
        ink: '#0f172a',
        muted: '#667085',
        line: '#e5e7eb',
    };

    // Tabs + count
    const statusTabs = [
        { key: 'all', label: 'Tất cả' },
        { key: 'ready_to_pick', label: 'Chờ lấy hàng' },
        { key: 'picking', label: 'Đang lấy hàng' },
        { key: 'picked', label: 'Đã lấy hàng' },
        { key: 'delivering', label: 'Đang giao' },
        { key: 'delivered', label: 'Đã giao' },
        { key: 'cancelled', label: 'Đã hủy' },
    ];

    const counts = useMemo(() => {
        const c = { all: 0 };
        (orders || []).forEach((o) => {
            c.all += 1;
            c[o.status] = (c[o.status] || 0) + 1;
        });
        return c;
    }, [orders]);

    const makeLabel = (text, count) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span>{text}</span>
            <span
                style={{
                    minWidth: 24,
                    padding: '0 6px',
                    height: 22,
                    lineHeight: '22px',
                    textAlign: 'center',
                    borderRadius: 999,
                    background: '#0b1220',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 700,
                }}
            >
                {count ?? 0}
            </span>
        </span>
    );

    const filteredOrders = activeTab === 'all' ? orders : (orders || []).filter((o) => o.status === activeTab);

    const handleViewDetail = (orderId) => {
        setSelectedOrderId({ ...orderId } && orderId); // giữ nguyên logic, tránh re-render dư
        setIsModalVisible(true);
    };
    const handleCloseModal = () => {
        setIsModalVisible(false);
        setSelectedOrderId(null);
    };

    // Loading
    if (loading && !orders?.length) {
        return (
            <div
                style={{
                    background: ui.page,
                    minHeight: '60vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    color: ui.muted,
                }}
            >
                <Spin size="large" />
                <span>Đang tải lịch sử đơn hàng…</span>
            </div>
        );
    }

    return (
        <div style={{ background: ui.page, padding: 16 }}>
            <div
                style={{
                    maxWidth: 1200,
                    margin: '0 auto',
                    background: ui.card,
                    borderRadius: 14,
                    border: `1px solid ${ui.line}`,
                    boxShadow: '0 8px 24px rgba(15,23,42,0.04)',
                }}
            >
                {/* Header */}
                <div style={{ padding: '16px 20px 0 20px' }}>
                    <Title level={3} style={{ margin: 0, color: ui.ink }}>
                        Lịch sử đơn hàng
                    </Title>
                    <Text style={{ color: ui.muted }}>Quản lý và theo dõi đơn của bạn</Text>
                </div>

                <Divider style={{ margin: '12px 20px 0', borderColor: ui.line }} />

                {/* Tabs */}
                <div style={{ padding: '8px 20px 0 20px' }}>
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        items={statusTabs.map((t) => ({ key: t.key, label: makeLabel(t.label, counts[t.key]) }))}
                        tabBarStyle={{
                            background: '#fff',
                            borderBottom: `1px solid ${ui.line}`,
                            marginBottom: 0,
                        }}
                    />
                </div>

                {/* Header row để căn cột */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '64px 28px 56px 1fr 160px 260px 160px',
                        gap: 12,
                        padding: '12px 16px 8px',
                        color: '#94a3b8',
                        fontWeight: 700,
                        opacity: 0.001, // ẩn gần như hoàn toàn nhưng vẫn giữ spacing
                        userSelect: 'none',
                    }}
                >
                    <div>ID</div>
                    <div>—</div>
                    <div>Ảnh</div>
                    <div>Tiêu đề</div>
                    <div style={{ textAlign: 'right' }}>Giá</div>
                    <div>Trạng thái / Chi tiết</div>
                    <div>Hủy</div>
                </div>

                {/* List rows */}
                <div>
                    {filteredOrders?.length > 0 ? (
                        filteredOrders.map((order) => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onViewDetail={handleViewDetail}
                                onCancelOrder={cancelOrder}
                            />
                        ))
                    ) : (
                        <div
                            style={{
                                textAlign: 'center',
                                padding: '48px 20px',
                                margin: 16,
                                borderRadius: 12,
                                border: `1px dashed ${ui.line}`,
                                background: '#fafafa',
                            }}
                        >
                            <div style={{ fontSize: 56, lineHeight: 1, marginBottom: 8 }}>📦</div>
                            <div style={{ fontWeight: 700, color: ui.ink, marginBottom: 4 }}>Không có đơn hàng</div>
                            <div style={{ color: ui.muted }}>
                                {activeTab === 'all'
                                    ? 'Bạn chưa có đơn hàng nào.'
                                    : 'Chưa có đơn nào trong trạng thái này.'}
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ height: 12 }} />

                {/* Modal chi tiết */}
                <OrderDetailModal
                    visible={isModalVisible}
                    onCancel={handleCloseModal}
                    order={orderDetail}
                    token={token}
                />
            </div>
        </div>
    );
};

export default OrderHistory;
