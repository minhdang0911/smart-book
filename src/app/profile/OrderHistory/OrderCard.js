import { Button, Popconfirm } from 'antd';
import { toast } from 'react-toastify';

const currency = (n) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n || 0);

const statusLabel = (s) => {
    if (!s) return '—';
    const norm = String(s).toLowerCase();
    if (['cancel', 'cancelled', 'canceled'].includes(norm)) return 'Đã hủy';
    if (['paid', 'completed', 'success', 'delivered'].includes(norm)) return 'Hoàn tất';
    if (['pending', 'unpaid', 'ready_to_pick', 'picking', 'picked', 'delivering'].includes(norm))
        return 'Chờ thanh toán';
    return s;
};

const statusTagStyle = (s) => {
    const norm = String(s || '').toLowerCase();
    if (['cancel', 'cancelled', 'canceled'].includes(norm)) {
        return { color: '#ef4444', bg: 'rgba(239,68,68,.12)', border: 'rgba(239,68,68,.28)' };
    }
    if (['paid', 'completed', 'success', 'delivered'].includes(norm)) {
        return { color: '#16a34a', bg: 'rgba(22,163,74,.12)', border: 'rgba(22,163,74,.28)' };
    }
    return { color: '#d97706', bg: 'rgba(217,119,6,.12)', border: 'rgba(217,119,6,.28)' };
};

// ====== PILL SIZE (đồng bộ) ======
const PILL = {
    height: 36,
    padding: '0 14px',
    borderRadius: 12,
    fontWeight: 700,
    fontSize: 13,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 112, // tất cả pill cùng bề ngang
};

const OrderCard = ({ order, onViewDetail, onCancelOrder }) => {
    const handleCancelOrder = async () => {
        try {
            await onCancelOrder(order.id);
            toast.success(`✅ Đã hủy đơn hàng #${order.id}`);
        } catch {
            toast.error('❌ Không thể hủy đơn hàng');
        }
    };

    const tag = statusTagStyle(order?.status);

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: '64px 28px 56px 1fr 160px 260px 160px',
                alignItems: 'center',
                gap: 12,
                padding: '14px 16px',
                borderBottom: '1px solid rgba(15,23,42,0.06)',
                background: '#fff',
            }}
        >
            {/* ID mờ như ảnh */}
            <div style={{ color: '#94a3b8', fontWeight: 700 }}>{order.id}</div>

            {/* Dấu gạch nhạt */}
            <div style={{ color: '#cbd5e1' }}>—</div>

            {/* Ảnh vuông nhỏ */}
            <div
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: '#0b1220',
                    overflow: 'hidden',
                    border: '1px solid rgba(2,6,23,0.2)',
                }}
            >
                {order?.thumbnail ? (
                    <img
                        src={order.thumbnail}
                        alt={order?.title || order?.course_title || ''}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                ) : null}
            </div>

            {/* Tên (không gắn cứng) */}
            <div
                title={order?.title || order?.course_title || ''}
                style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontWeight: 600,
                    color: '#0f172a',
                }}
            >
                {order?.title || order?.course_title || ''}
            </div>

            {/* Giá xám nhạt bên phải */}
            <div style={{ textAlign: 'right', color: '#cbd5e1', fontWeight: 800 }}>{currency(order?.price)}</div>

            {/* Trạng thái + Chi tiết */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span
                    style={{
                        ...PILL,
                        color: tag.color,
                        background: tag.bg,
                        border: `1px solid ${tag.border}`,
                    }}
                >
                    {statusLabel(order?.status)}
                </span>

                <Button
                    onClick={() => onViewDetail(order.id)}
                    style={{
                        ...PILL,
                        background: '#0b1220',
                        border: '1px solid rgba(2,6,23,0.5)',
                        color: '#fff',
                    }}
                >
                    Chi tiết
                </Button>
            </div>

            {/* Nút Hủy (nếu chưa hủy) */}
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                {!String(order?.status || '')
                    .toLowerCase()
                    .includes('cancel') && (
                    <Popconfirm
                        title={
                            <div style={{ padding: '6px 0' }}>
                                <div style={{ fontWeight: 700, color: '#ef4444', marginBottom: 4 }}>
                                    ⚠️ Xác nhận hủy đơn hàng
                                </div>
                                <div style={{ color: '#475569' }}>Bạn có chắc muốn hủy đơn hàng #{order.id}?</div>
                            </div>
                        }
                        okText="Hủy"
                        cancelText="Không"
                        okButtonProps={{ style: { background: '#ef4444', borderColor: '#ef4444', borderRadius: 10 } }}
                        cancelButtonProps={{ style: { borderRadius: 10 } }}
                        onConfirm={handleCancelOrder}
                    >
                        <Button
                            danger
                            style={{
                                ...PILL,
                                background: '#fff',
                                color: '#ef4444',
                                border: '1px solid rgba(239,68,68,.35)',
                            }}
                        >
                            Hủy
                        </Button>
                    </Popconfirm>
                )}
            </div>
        </div>
    );
};

export default OrderCard;
