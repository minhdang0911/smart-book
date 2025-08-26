import {
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Clock,
    CreditCard,
    Edit3,
    MapPin,
    MoreHorizontal,
    Package,
    Phone,
    Search,
    ShoppingBag,
    Truck,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const OrderHistory = ({ token, enabled }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [orderDetail, setOrderDetail] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [pagination, setPagination] = useState({
        current_page: 1,
        per_page: 10,
        total: 0,
        last_page: 1,
        from: 1,
        to: 10,
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusCounts, setStatusCounts] = useState({});

    // CSS Styles
    const styles = {
        container: {
            display: 'flex',
            minHeight: '100vh',
            backgroundColor: '#ffffff',
        },
        mainContent: {
            flex: '1',
            padding: '24px',
        },
        header: {
            marginBottom: '32px',
        },
        title: {
            fontSize: '30px',
            fontWeight: 'bold',
            color: '#000000',
            marginBottom: '8px',
            margin: '0',
        },
        subtitle: {
            color: '#6b7280',
            margin: '0',
        },
        searchContainer: {
            marginBottom: '24px',
        },
        searchWrapper: {
            position: 'relative',
            maxWidth: '384px',
        },
        searchIcon: {
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9ca3af',
            width: '16px',
            height: '16px',
        },
        searchInput: {
            width: '100%',
            paddingLeft: '40px',
            paddingRight: '16px',
            paddingTop: '8px',
            paddingBottom: '8px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            transition: 'all 0.2s ease',
        },
        searchInputFocus: {
            borderColor: '#000000',
            boxShadow: '0 0 0 2px rgba(0, 0, 0, 0.1)',
        },
        tabsContainer: {
            marginBottom: '24px',
        },
        tabsBorder: {
            borderBottom: '1px solid #e5e7eb',
        },
        tabsNav: {
            display: 'flex',
            gap: '32px',
        },
        tab: {
            padding: '16px 8px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            borderBottom: '2px solid transparent',
            color: '#6b7280',
        },
        tabActive: {
            borderBottomColor: '#000000',
            color: '#000000',
        },
        tabHover: {
            color: '#374151',
            borderBottomColor: '#d1d5db',
        },
        tabBadge: {
            marginLeft: '8px',
            backgroundColor: '#f3f4f6',
            color: '#374151',
            fontSize: '12px',
            padding: '2px 8px',
            borderRadius: '9999px',
        },
        ordersList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
        },
        orderCard: {
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            overflow: 'hidden',
        },
        orderHeader: {
            padding: '16px',
            backgroundColor: '#f9fafb',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
        },
        orderHeaderHover: {
            backgroundColor: '#f3f4f6',
        },
        orderHeaderContent: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        orderHeaderLeft: {
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
        },
        orderHeaderIcon: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
        },
        orderId: {
            fontWeight: 'bold',
            color: '#000000',
        },
        statusBadge: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            borderRadius: '9999px',
            fontSize: '14px',
            fontWeight: '500',
            position: 'relative',
        },
        updateStatusButton: {
            marginLeft: '8px',
            padding: '2px 6px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
        },
        updateStatusButtonHover: {
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
        },
        shippingCode: {
            fontSize: '14px',
            color: '#6b7280',
        },
        shippingCodeValue: {
            fontFamily: 'monospace',
        },
        orderHeaderRight: {
            textAlign: 'right',
        },
        orderPrice: {
            fontWeight: 'bold',
            color: '#000000',
        },
        orderDate: {
            fontSize: '14px',
            color: '#6b7280',
        },
        orderPreview: {
            padding: '16px',
            borderTop: '1px solid #f3f4f6',
        },
        orderPreviewContent: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        orderPreviewLeft: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
        },
        orderItemsText: {
            color: '#6b7280',
        },
        orderItemsDetail: {
            color: '#6b7280',
        },
        cancelButton: {
            padding: '4px 12px',
            fontSize: '14px',
            color: '#dc2626',
            border: '1px solid #fecaca',
            borderRadius: '4px',
            background: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
        },
        cancelButtonHover: {
            backgroundColor: '#fef2f2',
        },
        orderDetail: {
            borderTop: '1px solid #e5e7eb',
            backgroundColor: '#ffffff',
        },
        orderDetailContent: {
            padding: '24px',
        },
        orderDetailGrid: {
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '24px',
        },
        orderDetailGridLg: {
            gridTemplateColumns: '1fr 1fr',
        },
        sectionTitle: {
            fontWeight: '600',
            color: '#000000',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
        },
        sectionIcon: {
            width: '20px',
            height: '20px',
            marginRight: '8px',
        },
        infoList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '14px',
        },
        infoRow: {
            display: 'flex',
            justifyContent: 'space-between',
        },
        infoLabel: {
            fontWeight: '500',
        },
        infoValue: {
            color: '#374151',
        },
        phoneRow: {
            display: 'flex',
            alignItems: 'center',
        },
        phoneIcon: {
            width: '16px',
            height: '16px',
            marginRight: '8px',
        },
        totalRow: {
            fontWeight: 'bold',
            fontSize: '16px',
            paddingTop: '8px',
            borderTop: '1px solid #e5e7eb',
        },
        itemsSection: {
            marginTop: '24px',
        },
        itemsList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
        },
        itemCard: {
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '12px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
        },
        itemImage: {
            width: '64px',
            height: '64px',
            backgroundColor: '#e5e7eb',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        itemImageImg: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '8px',
        },
        itemInfo: {
            flex: '1',
        },
        itemTitle: {
            fontWeight: '500',
            color: '#000000',
            marginBottom: '4px',
        },
        itemMeta: {
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '2px',
        },
        itemPricing: {
            textAlign: 'right',
        },
        itemQuantity: {
            fontWeight: '500',
            marginBottom: '2px',
        },
        itemPrice: {
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '2px',
        },
        itemTotal: {
            fontWeight: 'bold',
        },
        emptyState: {
            textAlign: 'center',
            padding: '64px 0',
        },
        emptyIcon: {
            width: '64px',
            height: '64px',
            color: '#d1d5db',
            margin: '0 auto 16px',
        },
        emptyTitle: {
            fontSize: '18px',
            fontWeight: '500',
            color: '#111827',
            marginBottom: '8px',
        },
        emptyDescription: {
            color: '#6b7280',
        },
        loadingContainer: {
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        loadingContent: {
            textAlign: 'center',
        },
        spinner: {
            width: '32px',
            height: '32px',
            border: '2px solid #d1d5db',
            borderTop: '2px solid #000000',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
        },
        loadingText: {
            color: '#6b7280',
        },
        paginationContainer: {
            marginTop: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        paginationInfo: {
            fontSize: '14px',
            color: '#6b7280',
        },
        paginationNav: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
        },
        paginationButton: {
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            backgroundColor: '#ffffff',
            color: '#374151',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
        },
        paginationButtonHover: {
            backgroundColor: '#f9fafb',
            borderColor: '#9ca3af',
        },
        paginationButtonActive: {
            backgroundColor: '#000000',
            borderColor: '#000000',
            color: '#ffffff',
        },
        paginationButtonDisabled: {
            opacity: '0.5',
            cursor: 'not-allowed',
        },
        paginationDots: {
            padding: '8px',
            color: '#9ca3af',
            fontSize: '14px',
        },
        // Modal styles
        modalOverlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
        },
        modal: {
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            minWidth: '400px',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'auto',
        },
        modalHeader: {
            marginBottom: '20px',
        },
        modalTitle: {
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#000000',
            marginBottom: '8px',
        },
        modalSubtitle: {
            color: '#6b7280',
            fontSize: '14px',
        },
        statusGrid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '24px',
        },
        statusOption: {
            padding: '12px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
        },
        statusOptionActive: {
            borderColor: '#000000',
            backgroundColor: '#f9fafb',
        },
        statusOptionHover: {
            borderColor: '#d1d5db',
            backgroundColor: '#f9fafb',
        },
        modalActions: {
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
        },
        modalButton: {
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: 'none',
        },
        modalButtonCancel: {
            backgroundColor: '#f3f4f6',
            color: '#374151',
        },
        modalButtonCancelHover: {
            backgroundColor: '#e5e7eb',
        },
        modalButtonSave: {
            backgroundColor: '#000000',
            color: '#ffffff',
        },
        modalButtonSaveHover: {
            backgroundColor: '#374151',
        },
        modalButtonDisabled: {
            opacity: 0.5,
            cursor: 'not-allowed',
        },
    };

    // Function để cập nhật trạng thái đơn hàng
    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const response = await fetch(`http://localhost:8000/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    status: newStatus,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            return {
                success: true,
                message: data.message || 'Cập nhật trạng thái thành công',
                data: data.data,
                newStatus: newStatus,
            };
        } catch (error) {
            console.error('Error updating order status:', error);
            return {
                success: false,
                error: error.message,
                newStatus: null,
            };
        }
    };

    // Fetch tổng số đơn hàng theo status
    useEffect(() => {
        if (!enabled || !token) return;

        const fetchStatusCounts = async () => {
            try {
                // Gọi API để lấy tổng số đơn hàng cho mỗi status
                const allStatusPromises = statusTabs.map(async (tab) => {
                    if (tab.key === 'all') {
                        const response = await fetch(`http://localhost:8000/api/orders?page=1`, {
                            method: 'GET',
                            headers: {
                                Authorization: `Bearer ${token}`,
                                'Content-Type': 'application/json',
                                Accept: 'application/json',
                            },
                        });
                        if (response.ok) {
                            const data = await response.json();
                            return { status: 'all', count: data.data?.pagination?.total || 0 };
                        }
                    } else {
                        const response = await fetch(`http://localhost:8000/api/orders?status=${tab.key}`, {
                            method: 'GET',
                            headers: {
                                Authorization: `Bearer ${token}`,
                                'Content-Type': 'application/json',
                                Accept: 'application/json',
                            },
                        });
                        if (response.ok) {
                            const data = await response.json();
                            return { status: tab.key, count: data.data?.pagination?.total || 0 };
                        }
                    }
                    return { status: tab.key, count: 0 };
                });

                const results = await Promise.all(allStatusPromises);
                const counts = {};
                results.forEach((result) => {
                    counts[result.status] = result.count;
                });
                setStatusCounts(counts);
            } catch (error) {
                console.error('Error fetching status counts:', error);
                // Fallback: đếm từ orders hiện tại
                const c = { all: orders.length || 0 };
                (orders || []).forEach((order) => {
                    c[order.status] = (c[order.status] || 0) + 1;
                });
                setStatusCounts(c);
            }
        };

        fetchStatusCounts();
    }, [token, enabled]); // Chỉ gọi khi component mount hoặc token thay đổi

    // Fetch orders từ API
    useEffect(() => {
        if (!enabled || !token) return;

        const fetchOrders = async () => {
            setLoading(true);
            try {
                let url = `http://localhost:8000/api/orders?page=${currentPage}`;

                // Thêm filter theo status nếu không phải 'all'
                if (activeTab !== 'all') {
                    url += `&status=${activeTab}`;
                }

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setOrders(data.data?.orders || []);
                    setPagination(data.data?.pagination || {});
                }
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [token, enabled, currentPage, activeTab]);

    // Fetch order detail khi chọn đơn hàng
    useEffect(() => {
        if (!selectedOrderId || !token) return;

        const fetchOrderDetail = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/orders/${selectedOrderId}`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setOrderDetail(data.data);
                }
            } catch (error) {
                console.error('Error fetching order detail:', error);
            }
        };

        fetchOrderDetail();
    }, [selectedOrderId, token]);

    // Status mapping
    const statusConfig = {
        pending: { label: 'Chờ xử lý', color: '#f59e0b', bgColor: '#fef3c7', icon: Clock },
        ready_to_pick: { label: 'Chờ lấy hàng', color: '#3b82f6', bgColor: '#dbeafe', icon: Package },
        picking: { label: 'Đang lấy hàng', color: '#8b5cf6', bgColor: '#ede9fe', icon: Package },
        picked: { label: 'Đã lấy hàng', color: '#06b6d4', bgColor: '#cffafe', icon: Check },
        delivering: { label: 'Đang giao', color: '#f97316', bgColor: '#fed7aa', icon: Truck },
        delivered: { label: 'Đã giao', color: '#10b981', bgColor: '#d1fae5', icon: Check },
        cancelled: { label: 'Đã hủy', color: '#ef4444', bgColor: '#fee2e2', icon: X },
    };

    // Tabs configuration
    const statusTabs = [
        { key: 'all', label: 'Tất cả' },
        { key: 'pending', label: 'Chờ xử lý' },
        { key: 'ready_to_pick', label: 'Chờ lấy hàng' },
        { key: 'picking', label: 'Đang lấy hàng' },
        { key: 'picked', label: 'Đã lấy hàng' },
        { key: 'delivering', label: 'Đang giao' },
        { key: 'delivered', label: 'Đã giao' },
        { key: 'cancelled', label: 'Đã hủy' },
    ];

    const [selectedOrderForUpdate, setSelectedOrderForUpdate] = useState(null);

    // Filter orders cho search (không cần filter theo tab vì đã filter từ API)
    const filteredOrders = useMemo(() => {
        let filtered = orders;

        // Chỉ filter theo search text vì activeTab đã được filter từ API
        if (searchText) {
            filtered = filtered.filter(
                (order) =>
                    order.id.toString().includes(searchText) ||
                    order.shipping_code?.toLowerCase().includes(searchText.toLowerCase()) ||
                    order.items?.some((item) => item.book?.title?.toLowerCase().includes(searchText.toLowerCase())),
            );
        }

        return filtered;
    }, [orders, searchText]);

    // Format currency
    const formatCurrency = (amount) => {
        let numericAmount = 0;

        if (typeof amount === 'string') {
            numericAmount = parseFloat(amount) || 0;
        } else if (typeof amount === 'number') {
            numericAmount = amount;
        }

        return numericAmount.toLocaleString('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Handle order selection
    const handleOrderSelect = (orderId) => {
        if (selectedOrderId === orderId) {
            setSelectedOrderId(null);
            setOrderDetail(null);
        } else {
            setSelectedOrderId(orderId);
        }
    };

    // Handle status update
    const handleStatusUpdate = (order) => {
        setSelectedOrderForUpdate(order);
        setShowStatusModal(true);
    };

    const [selectedNewStatus, setSelectedNewStatus] = useState('');
    const [hoveredStatus, setHoveredStatus] = useState(null);

    const confirmStatusUpdate = async () => {
        if (!selectedOrderForUpdate || !selectedNewStatus) return;

        setStatusUpdateLoading(true);
        const result = await updateOrderStatus(selectedOrderForUpdate.id, selectedNewStatus);

        if (result.success) {
            // Cập nhật orders list
            setOrders((prev) =>
                prev.map((order) =>
                    order.id === selectedOrderForUpdate.id ? { ...order, status: selectedNewStatus } : order,
                ),
            );

            // Cập nhật orderDetail nếu đang xem order này
            if (orderDetail && orderDetail.id === selectedOrderForUpdate.id) {
                setOrderDetail({ ...orderDetail, status: selectedNewStatus });
            }

            alert('Cập nhật trạng thái thành công!');
        } else {
            alert(`Lỗi: ${result.error}`);
        }

        setStatusUpdateLoading(false);
        setShowStatusModal(false);
        setSelectedOrderForUpdate(null);
        setSelectedNewStatus('');
    };

    // Cancel order function
    const cancelOrder = async (orderId) => {
        try {
            const response = await fetch(`http://localhost:8000/api/orders/${orderId}/cancel`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            });

            if (response.ok) {
                setOrders((prev) =>
                    prev.map((order) => (order.id === orderId ? { ...order, status: 'cancelled' } : order)),
                );
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
        }
    };

    // Pagination functions
    const handlePageChange = (page) => {
        if (page >= 1 && page <= pagination.last_page) {
            setCurrentPage(page);
            setSelectedOrderId(null);
            setOrderDetail(null);
        }
    };

    const renderPaginationNumbers = () => {
        const pages = [];
        const { current_page, last_page } = pagination;

        // Hiển thị trang đầu
        if (current_page > 3) {
            pages.push(1);
            if (current_page > 4) {
                pages.push('...');
            }
        }

        // Hiển thị các trang xung quanh trang hiện tại
        for (let i = Math.max(1, current_page - 2); i <= Math.min(last_page, current_page + 2); i++) {
            pages.push(i);
        }

        // Hiển thị trang cuối
        if (current_page < last_page - 2) {
            if (current_page < last_page - 3) {
                pages.push('...');
            }
            pages.push(last_page);
        }

        return pages;
    };

    // Event handlers
    const [hoveredTab, setHoveredTab] = useState(null);
    const [hoveredOrder, setHoveredOrder] = useState(null);
    const [hoveredCancel, setHoveredCancel] = useState(null);
    const [hoveredPagination, setHoveredPagination] = useState(null);
    const [hoveredUpdateButton, setHoveredUpdateButton] = useState(null);
    const [searchFocused, setSearchFocused] = useState(false);

    // Reset to first page when changing tabs or search
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchText]);

    if (loading && !orders?.length) {
        return (
            <>
                <style>
                    {`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                        
                        @media (min-width: 1024px) {
                            .lg-grid-cols-2 {
                                grid-template-columns: 1fr 1fr;
                            }
                        }
                    `}
                </style>
                <div style={styles.loadingContainer}>
                    <div style={styles.loadingContent}>
                        <div style={styles.spinner}></div>
                        <p style={styles.loadingText}>Đang tải lịch sử đơn hàng...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    
                    @media (min-width: 1024px) {
                        .lg-grid-cols-2 {
                            grid-template-columns: 1fr 1fr;
                        }
                    }
                `}
            </style>
            <div style={styles.container}>
                <div style={styles.mainContent}>
                    {/* Header */}
                    <div style={styles.header}>
                        <h1 style={styles.title}>Lịch sử đơn hàng</h1>
                        <p style={styles.subtitle}>Quản lý và theo dõi tất cả đơn hàng của bạn</p>
                    </div>

                    {/* Search */}
                    <div style={styles.searchContainer}>
                        <div style={styles.searchWrapper}>
                            <Search style={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Tìm theo mã đơn, mã vận chuyển hoặc tên sách..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                onFocus={() => setSearchFocused(true)}
                                onBlur={() => setSearchFocused(false)}
                                style={{
                                    ...styles.searchInput,
                                    ...(searchFocused ? styles.searchInputFocus : {}),
                                }}
                            />
                        </div>
                    </div>

                    {/* Tabs */}
                    <div style={styles.tabsContainer}>
                        <div style={styles.tabsBorder}>
                            <nav style={styles.tabsNav}>
                                {statusTabs.map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        onMouseEnter={() => setHoveredTab(tab.key)}
                                        onMouseLeave={() => setHoveredTab(null)}
                                        style={{
                                            ...styles.tab,
                                            ...(activeTab === tab.key ? styles.tabActive : {}),
                                            ...(hoveredTab === tab.key && activeTab !== tab.key ? styles.tabHover : {}),
                                        }}
                                    >
                                        {tab.label}
                                        <span style={styles.tabBadge}>{statusCounts[tab.key] || 0}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Orders List */}
                    <div style={styles.ordersList}>
                        {filteredOrders?.length > 0 ? (
                            filteredOrders.map((order) => {
                                const status = statusConfig[order.status] || statusConfig.pending;
                                const StatusIcon = status.icon;
                                const isSelected = selectedOrderId === order.id;

                                return (
                                    <div key={order.id} style={styles.orderCard}>
                                        {/* Order Header */}
                                        <div
                                            style={{
                                                ...styles.orderHeader,
                                                ...(hoveredOrder === order.id ? styles.orderHeaderHover : {}),
                                            }}
                                            onClick={() => handleOrderSelect(order.id)}
                                            onMouseEnter={() => setHoveredOrder(order.id)}
                                            onMouseLeave={() => setHoveredOrder(null)}
                                        >
                                            <div style={styles.orderHeaderContent}>
                                                <div style={styles.orderHeaderLeft}>
                                                    <div style={styles.orderHeaderIcon}>
                                                        {isSelected ? (
                                                            <ChevronDown style={{ width: '16px', height: '16px' }} />
                                                        ) : (
                                                            <ChevronRight style={{ width: '16px', height: '16px' }} />
                                                        )}
                                                        <span style={styles.orderId}>#{order.id}</span>
                                                    </div>
                                                    <div
                                                        style={{
                                                            ...styles.statusBadge,
                                                            backgroundColor: status.bgColor,
                                                            color: status.color,
                                                        }}
                                                    >
                                                        <StatusIcon style={{ width: '16px', height: '16px' }} />
                                                        <span>{status.label}</span>
                                                        {/* Button cập nhật trạng thái */}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleStatusUpdate(order);
                                                            }}
                                                            onMouseEnter={() => setHoveredUpdateButton(order.id)}
                                                            onMouseLeave={() => setHoveredUpdateButton(null)}
                                                            style={{
                                                                ...styles.updateStatusButton,
                                                                ...(hoveredUpdateButton === order.id
                                                                    ? styles.updateStatusButtonHover
                                                                    : {}),
                                                            }}
                                                            title="Cập nhật trạng thái"
                                                        >
                                                            <Edit3 style={{ width: '12px', height: '12px' }} />
                                                        </button>
                                                    </div>
                                                    {order.shipping_code && (
                                                        <span style={styles.shippingCode}>
                                                            Mã vận chuyển:{' '}
                                                            <span style={styles.shippingCodeValue}>
                                                                {order.shipping_code}
                                                            </span>
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={styles.orderHeaderRight}>
                                                    <div style={styles.orderPrice}>
                                                        {formatCurrency(order.total_price)}
                                                    </div>
                                                    <div style={styles.orderDate}>{formatDate(order.created_at)}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Items Preview */}
                                        <div style={styles.orderPreview}>
                                            <div style={styles.orderPreviewContent}>
                                                <div style={styles.orderPreviewLeft}>
                                                    <ShoppingBag
                                                        style={{ width: '20px', height: '20px', color: '#9ca3af' }}
                                                    />
                                                    <span style={styles.orderItemsText}>
                                                        {order.total_items} sản phẩm
                                                    </span>
                                                    {order.items && order.items.length > 0 && (
                                                        <span style={styles.orderItemsDetail}>
                                                            • {order.items[0].book?.title}
                                                            {order.items.length > 1 &&
                                                                ` và ${order.items.length - 1} sản phẩm khác`}
                                                        </span>
                                                    )}
                                                </div>
                                                {order.status === 'pending' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            cancelOrder(order.id);
                                                        }}
                                                        onMouseEnter={() => setHoveredCancel(order.id)}
                                                        onMouseLeave={() => setHoveredCancel(null)}
                                                        style={{
                                                            ...styles.cancelButton,
                                                            ...(hoveredCancel === order.id
                                                                ? styles.cancelButtonHover
                                                                : {}),
                                                        }}
                                                    >
                                                        Hủy đơn
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Expanded Order Detail */}
                                        {isSelected && orderDetail && (
                                            <div style={styles.orderDetail}>
                                                <div style={styles.orderDetailContent}>
                                                    <div
                                                        style={{
                                                            ...styles.orderDetailGrid,
                                                            ...(window.innerWidth >= 1024
                                                                ? styles.orderDetailGridLg
                                                                : {}),
                                                        }}
                                                        className="lg-grid-cols-2"
                                                    >
                                                        {/* Shipping Info */}
                                                        <div>
                                                            <h3 style={styles.sectionTitle}>
                                                                <MapPin style={styles.sectionIcon} />
                                                                Thông tin giao hàng
                                                            </h3>
                                                            <div style={styles.infoList}>
                                                                <div style={styles.infoRow}>
                                                                    <span style={styles.infoLabel}>Địa chỉ:</span>
                                                                    <span style={styles.infoValue}>
                                                                        {orderDetail.address}
                                                                    </span>
                                                                </div>
                                                                <div style={styles.infoRow}>
                                                                    <span style={styles.infoLabel}>Số nhà:</span>
                                                                    <span style={styles.infoValue}>
                                                                        {orderDetail.sonha}
                                                                    </span>
                                                                </div>
                                                                <div style={styles.infoRow}>
                                                                    <span style={styles.infoLabel}>Đường:</span>
                                                                    <span style={styles.infoValue}>
                                                                        {orderDetail.street}
                                                                    </span>
                                                                </div>
                                                                <div style={styles.infoRow}>
                                                                    <span style={styles.infoLabel}>Phường/Xã:</span>
                                                                    <span style={styles.infoValue}>
                                                                        {orderDetail.ward_name}
                                                                    </span>
                                                                </div>
                                                                <div style={styles.infoRow}>
                                                                    <span style={styles.infoLabel}>Quận/Huyện:</span>
                                                                    <span style={styles.infoValue}>
                                                                        {orderDetail.district_name}
                                                                    </span>
                                                                </div>
                                                                {orderDetail.phone && (
                                                                    <div style={styles.infoRow}>
                                                                        <span style={styles.infoLabel}>
                                                                            Số điện thoại:
                                                                        </span>
                                                                        <span style={styles.infoValue}>
                                                                            <span style={styles.phoneRow}>
                                                                                <Phone style={styles.phoneIcon} />
                                                                                {orderDetail.phone}
                                                                            </span>
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                <div style={styles.infoRow}>
                                                                    <span style={styles.infoLabel}>
                                                                        Phương thức thanh toán:
                                                                    </span>
                                                                    <span style={styles.infoValue}>
                                                                        {orderDetail.payment === 'cod'
                                                                            ? 'Thanh toán khi nhận hàng'
                                                                            : orderDetail.payment === 'credit_card'
                                                                            ? 'Thẻ tín dụng'
                                                                            : orderDetail.payment}
                                                                    </span>
                                                                </div>
                                                                {orderDetail.shipping_code && (
                                                                    <div style={styles.infoRow}>
                                                                        <span style={styles.infoLabel}>
                                                                            Mã vận chuyển:
                                                                        </span>
                                                                        <span
                                                                            style={{
                                                                                ...styles.infoValue,
                                                                                fontFamily: 'monospace',
                                                                                cursor: 'pointer',
                                                                                color: 'blue',
                                                                                textDecoration: 'underline',
                                                                            }}
                                                                            onClick={() =>
                                                                                window.open(
                                                                                    `https://donhang.ghn.vn/?order_code=${orderDetail.shipping_code}`,
                                                                                    '_blank',
                                                                                )
                                                                            }
                                                                        >
                                                                            {orderDetail.shipping_code}
                                                                        </span>
                                                                    </div>
                                                                )}

                                                                <div style={styles.infoRow}>
                                                                    <span style={styles.infoLabel}>Ngày tạo:</span>
                                                                    <span style={styles.infoValue}>
                                                                        {formatDate(orderDetail.created_at)}
                                                                    </span>
                                                                </div>
                                                                <div style={styles.infoRow}>
                                                                    <span style={styles.infoLabel}>
                                                                        Cập nhật lần cuối:
                                                                    </span>
                                                                    <span style={styles.infoValue}>
                                                                        {formatDate(orderDetail.updated_at)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Order Summary */}
                                                        <div>
                                                            <h3 style={styles.sectionTitle}>
                                                                <CreditCard style={styles.sectionIcon} />
                                                                Tổng tiền
                                                            </h3>
                                                            <div style={styles.infoList}>
                                                                <div style={styles.infoRow}>
                                                                    <span>Tiền hàng:</span>
                                                                    <span>{formatCurrency(orderDetail.price)}</span>
                                                                </div>
                                                                <div style={styles.infoRow}>
                                                                    <span>Phí vận chuyển:</span>
                                                                    <span>
                                                                        {formatCurrency(orderDetail.shipping_fee)}
                                                                    </span>
                                                                </div>
                                                                <div style={{ ...styles.infoRow, ...styles.totalRow }}>
                                                                    <span>Tổng cộng:</span>
                                                                    <span>
                                                                        {formatCurrency(orderDetail.total_price)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Order Items */}
                                                    <div style={styles.itemsSection}>
                                                        <h3 style={styles.sectionTitle}>
                                                            <Package style={styles.sectionIcon} />
                                                            Sản phẩm ({orderDetail.items?.length || 0})
                                                        </h3>
                                                        <div style={styles.itemsList}>
                                                            {orderDetail.items?.map((item, index) => (
                                                                <div key={index} style={styles.itemCard}>
                                                                    <div style={styles.itemImage}>
                                                                        {item.book?.image ? (
                                                                            <img
                                                                                src={item.book.image}
                                                                                alt={item.book.title}
                                                                                style={styles.itemImageImg}
                                                                            />
                                                                        ) : (
                                                                            <Package
                                                                                style={{
                                                                                    width: '24px',
                                                                                    height: '24px',
                                                                                    color: '#9ca3af',
                                                                                }}
                                                                            />
                                                                        )}
                                                                    </div>
                                                                    <div style={styles.itemInfo}>
                                                                        <h4 style={styles.itemTitle}>
                                                                            {item.book?.title}
                                                                        </h4>
                                                                        <p style={styles.itemMeta}>
                                                                            Tác giả:{' '}
                                                                            {item.book?.author?.name ||
                                                                                item.book?.author ||
                                                                                'Không rõ'}
                                                                        </p>
                                                                        <p style={styles.itemMeta}>
                                                                            Thể loại:{' '}
                                                                            {item.book?.category?.name ||
                                                                                item.book?.category ||
                                                                                'Không rõ'}
                                                                        </p>
                                                                        <p style={styles.itemMeta}>
                                                                            ID sách: {item.book?.id}
                                                                        </p>
                                                                    </div>
                                                                    <div style={styles.itemPricing}>
                                                                        <p style={styles.itemQuantity}>
                                                                            Số lượng: {item.quantity}
                                                                        </p>
                                                                        <p style={styles.itemPrice}>
                                                                            Đơn giá: {formatCurrency(item.price)}
                                                                        </p>
                                                                        <p style={styles.itemTotal}>
                                                                            Thành tiền:{' '}
                                                                            {formatCurrency(
                                                                                (parseFloat(item.price) || 0) *
                                                                                    (item.quantity || 0),
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div style={styles.emptyState}>
                                <Package style={styles.emptyIcon} />
                                <h3 style={styles.emptyTitle}>Không có đơn hàng</h3>
                                <p style={styles.emptyDescription}>
                                    {activeTab === 'all'
                                        ? 'Bạn chưa có đơn hàng nào.'
                                        : 'Chưa có đơn nào trong trạng thái này.'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {pagination.last_page > 1 && (
                        <div style={styles.paginationContainer}>
                            <div style={styles.paginationInfo}>
                                Hiển thị {pagination.from} - {pagination.to} của {pagination.total} kết quả
                            </div>
                            <div style={styles.paginationNav}>
                                {/* Previous button */}
                                <button
                                    onClick={() => handlePageChange(pagination.current_page - 1)}
                                    disabled={pagination.current_page <= 1}
                                    onMouseEnter={() => setHoveredPagination('prev')}
                                    onMouseLeave={() => setHoveredPagination(null)}
                                    style={{
                                        ...styles.paginationButton,
                                        ...(pagination.current_page <= 1 ? styles.paginationButtonDisabled : {}),
                                        ...(hoveredPagination === 'prev' && pagination.current_page > 1
                                            ? styles.paginationButtonHover
                                            : {}),
                                    }}
                                >
                                    <ChevronLeft style={{ width: '16px', height: '16px' }} />
                                    Trước
                                </button>

                                {/* Page numbers */}
                                {renderPaginationNumbers().map((page, index) => (
                                    <span key={index}>
                                        {page === '...' ? (
                                            <span style={styles.paginationDots}>
                                                <MoreHorizontal style={{ width: '16px', height: '16px' }} />
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handlePageChange(page)}
                                                onMouseEnter={() => setHoveredPagination(`page-${page}`)}
                                                onMouseLeave={() => setHoveredPagination(null)}
                                                style={{
                                                    ...styles.paginationButton,
                                                    ...(pagination.current_page === page
                                                        ? styles.paginationButtonActive
                                                        : {}),
                                                    ...(hoveredPagination === `page-${page}` &&
                                                    pagination.current_page !== page
                                                        ? styles.paginationButtonHover
                                                        : {}),
                                                }}
                                            >
                                                {page}
                                            </button>
                                        )}
                                    </span>
                                ))}

                                {/* Next button */}
                                <button
                                    onClick={() => handlePageChange(pagination.current_page + 1)}
                                    disabled={pagination.current_page >= pagination.last_page}
                                    onMouseEnter={() => setHoveredPagination('next')}
                                    onMouseLeave={() => setHoveredPagination(null)}
                                    style={{
                                        ...styles.paginationButton,
                                        ...(pagination.current_page >= pagination.last_page
                                            ? styles.paginationButtonDisabled
                                            : {}),
                                        ...(hoveredPagination === 'next' &&
                                        pagination.current_page < pagination.last_page
                                            ? styles.paginationButtonHover
                                            : {}),
                                    }}
                                >
                                    Sau
                                    <ChevronRight style={{ width: '16px', height: '16px' }} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Status Update Modal */}
                {showStatusModal && selectedOrderForUpdate && (
                    <div style={styles.modalOverlay}>
                        <div style={styles.modal}>
                            <div style={styles.modalHeader}>
                                <h3 style={styles.modalTitle}>
                                    Cập nhật trạng thái đơn hàng #{selectedOrderForUpdate.id}
                                </h3>
                                <p style={styles.modalSubtitle}>
                                    Trạng thái hiện tại: {statusConfig[selectedOrderForUpdate.status]?.label}
                                </p>
                            </div>

                            <div style={styles.statusGrid}>
                                {Object.entries(statusConfig).map(([key, config]) => {
                                    const StatusIcon = config.icon;
                                    return (
                                        <div
                                            key={key}
                                            onClick={() => setSelectedNewStatus(key)}
                                            onMouseEnter={() => setHoveredStatus(key)}
                                            onMouseLeave={() => setHoveredStatus(null)}
                                            style={{
                                                ...styles.statusOption,
                                                ...(selectedNewStatus === key ? styles.statusOptionActive : {}),
                                                ...(hoveredStatus === key && selectedNewStatus !== key
                                                    ? styles.statusOptionHover
                                                    : {}),
                                                borderColor: selectedNewStatus === key ? config.color : '#e5e7eb',
                                                backgroundColor: selectedNewStatus === key ? config.bgColor : 'white',
                                            }}
                                        >
                                            <StatusIcon
                                                style={{
                                                    width: '16px',
                                                    height: '16px',
                                                    color: selectedNewStatus === key ? config.color : '#6b7280',
                                                }}
                                            />
                                            <span
                                                style={{
                                                    color: selectedNewStatus === key ? config.color : '#374151',
                                                    fontWeight: selectedNewStatus === key ? '500' : '400',
                                                }}
                                            >
                                                {config.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={styles.modalActions}>
                                <button
                                    onClick={() => {
                                        setShowStatusModal(false);
                                        setSelectedOrderForUpdate(null);
                                        setSelectedNewStatus('');
                                    }}
                                    style={styles.modalButton}
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={confirmStatusUpdate}
                                    disabled={!selectedNewStatus || statusUpdateLoading}
                                    style={{
                                        ...styles.modalButton,
                                        ...styles.modalButtonSave,
                                        ...(!selectedNewStatus || statusUpdateLoading
                                            ? styles.modalButtonDisabled
                                            : {}),
                                    }}
                                >
                                    {statusUpdateLoading ? 'Đang cập nhật...' : 'Cập nhật'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default OrderHistory;
