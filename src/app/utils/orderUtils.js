export const orderStatusMap = {
    ready_to_pick: 'Chờ lấy hàng',
    picking: 'Đang lấy hàng',
    money_collect_picking: 'Thu tiền khi lấy hàng',
    picked: 'Đã lấy hàng',
    storing: 'Đã nhập kho',
    delivering: 'Đang giao hàng',
    delivered: 'Đã giao thành công',
    delivery_fail: 'Giao không thành công',
    cancelled: 'Đã hủy đơn',
    cancel: 'Đã hủy đơn',
};

export const getStatusColor = (status) => {
    const colors = {
        pending: {
            bg: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            text: '#92400e',
            border: '#fcd34d',
        },
        processing: {
            bg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
            text: '#1d4ed8',
            border: '#93c5fd',
        },
        shipped: {
            bg: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
            text: '#6366f1',
            border: '#a5b4fc',
        },
        delivered: {
            bg: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
            text: '#15803d',
            border: '#86efac',
        },
        cancelled: {
            bg: 'linear-gradient(135deg, #fee2e2, #fecaca)',
            text: '#dc2626',
            border: '#fca5a5',
        },
        cancel: {
            bg: 'linear-gradient(135deg, #fee2e2, #fecaca)',
            text: '#dc2626',
            border: '#fca5a5',
        },
        ready_to_pick: {
            bg: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            text: '#92400e',
            border: '#fcd34d',
        },
        picking: {
            bg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
            text: '#1d4ed8',
            border: '#93c5fd',
        },
        picked: {
            bg: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
            text: '#6366f1',
            border: '#a5b4fc',
        },
        delivering: {
            bg: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
            text: '#6366f1',
            border: '#a5b4fc',
        },
    };

    return (
        colors[status] || {
            bg: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
            text: '#64748b',
            border: '#cbd5e1',
        }
    );
};
