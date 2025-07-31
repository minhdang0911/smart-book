import { Button, Popconfirm } from 'antd';
import { toast } from 'react-toastify';

const OrderCard = ({ order, onViewDetail, onCancelOrder }) => {
    const handleCancelOrder = async () => {
        try {
            await onCancelOrder(order.id);
            toast.success(`✅ Đã hủy đơn hàng #${order.id}`);
        } catch {
            toast.error('❌ Không thể hủy đơn hàng');
        }
    };

    return (
        <div
            style={{
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid rgba(102, 126, 234, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(102, 126, 234, 0.15)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.08)';
            }}
        >
            {/* Decorative gradient overlay */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb)',
                    borderRadius: '20px 20px 0 0',
                }}
            />

            {/* Order Header */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                }}
            >
                <h3
                    style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#1e293b',
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}
                >
                    🛍️ Đơn hàng #{order.id}
                </h3>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <Button
                        onClick={() => onViewDetail(order.id)}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '12px',
                            height: '40px',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                            transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                        }}
                    >
                        👁️ Xem chi tiết
                    </Button>

                    {order.status !== 'cancelled' && order.status !== 'cancel' && (
                        <Popconfirm
                            title={
                                <div style={{ padding: '8px 0' }}>
                                    <div
                                        style={{
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            color: '#dc2626',
                                            marginBottom: '4px',
                                        }}
                                    >
                                        ⚠️ Xác nhận hủy đơn hàng
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                        Bạn có chắc muốn hủy đơn hàng #{order.id}?
                                    </div>
                                </div>
                            }
                            okText="Hủy đơn"
                            cancelText="Không"
                            okButtonProps={{
                                style: {
                                    background: '#dc2626',
                                    borderColor: '#dc2626',
                                    borderRadius: '8px',
                                },
                            }}
                            cancelButtonProps={{
                                style: { borderRadius: '8px' },
                            }}
                            onConfirm={handleCancelOrder}
                        >
                            <Button
                                danger
                                style={{
                                    borderRadius: '12px',
                                    height: '40px',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
                                    borderColor: '#fca5a5',
                                    color: '#dc2626',
                                }}
                            >
                                ❌ Hủy đơn
                            </Button>
                        </Popconfirm>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderCard;
