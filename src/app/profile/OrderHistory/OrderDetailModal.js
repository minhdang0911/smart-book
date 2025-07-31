import { Modal } from 'antd';
import { useOrderStatus } from '../../hooks/useOrderStatus';
import { orderStatusMap } from '../../utils/orderUtils';

const OrderDetailModal = ({ visible, onCancel, order, token }) => {
    const { status: syncedStatus } = useOrderStatus(order?.id, token);

    if (!order) return null;

    return (
        <Modal
            title={
                <div
                    style={{
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}
                >
                    📋 Chi tiết đơn hàng #{order.id}
                </div>
            }
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={800}
            style={{ top: '20px' }}
            bodyStyle={{
                padding: '32px',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
            }}
        >
            <div
                style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
                }}
            >
                {/* Status and Payment Info */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '20px',
                        marginBottom: '24px',
                    }}
                >
                    <div
                        style={{
                            padding: '16px',
                            background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
                            borderRadius: '12px',
                            border: '1px solid #bae6fd',
                        }}
                    >
                        <div
                            style={{
                                fontSize: '0.875rem',
                                color: '#0369a1',
                                fontWeight: '500',
                                marginBottom: '4px',
                            }}
                        >
                            📊 Trạng thái
                        </div>
                        <div
                            style={{
                                fontSize: '1.125rem',
                                fontWeight: '600',
                                color: '#0c4a6e',
                            }}
                        >
                            {orderStatusMap[syncedStatus] || 'Đang cập nhật...'}
                        </div>
                    </div>

                    <div
                        style={{
                            padding: '16px',
                            background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                            borderRadius: '12px',
                            border: '1px solid #bbf7d0',
                        }}
                    >
                        <div
                            style={{
                                fontSize: '0.875rem',
                                color: '#15803d',
                                fontWeight: '500',
                                marginBottom: '4px',
                            }}
                        >
                            💳 Thanh toán
                        </div>
                        <div
                            style={{
                                fontSize: '1.125rem',
                                fontWeight: '600',
                                color: '#14532d',
                            }}
                        >
                            {order.payment}
                        </div>
                    </div>
                </div>

                {/* Shipping Fee */}
                <div
                    style={{
                        padding: '16px',
                        background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                        borderRadius: '12px',
                        border: '1px solid #fcd34d',
                        marginBottom: '24px',
                    }}
                >
                    <div
                        style={{
                            fontSize: '0.875rem',
                            color: '#92400e',
                            fontWeight: '500',
                            marginBottom: '4px',
                        }}
                    >
                        🚚 Phí vận chuyển
                    </div>
                    <div
                        style={{
                            fontSize: '1.125rem',
                            fontWeight: '600',
                            color: '#78350f',
                        }}
                    >
                        {Number(order.shipping_fee).toLocaleString('vi-VN')}₫
                    </div>
                </div>

                {/* Products */}
                <div style={{ marginBottom: '24px' }}>
                    <h4
                        style={{
                            fontSize: '1.125rem',
                            fontWeight: '600',
                            color: '#1e293b',
                            marginBottom: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        📚 Sản phẩm đã đặt
                    </h4>
                    <div
                        style={{
                            background: '#f8fafc',
                            borderRadius: '12px',
                            padding: '16px',
                        }}
                    >
                        {(order.items || []).map((item, index) => (
                            <div
                                key={item.id}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px 0',
                                    borderBottom: index < order.items.length - 1 ? '1px solid #e2e8f0' : 'none',
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div
                                        style={{
                                            fontWeight: '500',
                                            color: '#1e293b',
                                            marginBottom: '4px',
                                        }}
                                    >
                                        {item.book.title}
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                        Số lượng: {item.quantity}
                                    </div>
                                </div>
                                <div
                                    style={{
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        color: '#059669',
                                    }}
                                >
                                    {Number(item.price).toLocaleString('vi-VN')}₫
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Total */}
                <div
                    style={{
                        padding: '20px',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        borderRadius: '16px',
                        textAlign: 'center',
                    }}
                >
                    <div
                        style={{
                            fontSize: '0.875rem',
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontWeight: '500',
                            marginBottom: '8px',
                        }}
                    >
                        💰 Tổng cộng
                    </div>
                    <div
                        style={{
                            fontSize: '2rem',
                            fontWeight: '700',
                            color: 'white',
                            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        {Number(order.total_price).toLocaleString('vi-VN')}₫
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default OrderDetailModal;
