'use client';
import {
    CopyOutlined,
    DeleteOutlined,
    MinusOutlined,
    PlusOutlined,
    ShoppingCartOutlined,
    UserAddOutlined,
} from '@ant-design/icons';
import {
    Button,
    Card,
    Checkbox,
    Col,
    Divider,
    Empty,
    Image,
    Input,
    InputNumber,
    Modal,
    Popconfirm,
    Row,
    Space,
    Spin,
    Typography,
    message,
} from 'antd';
import { useRouter } from 'next/navigation';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useCart } from '../../app/contexts/CartContext';
import './Cart.css';

const { Title, Text } = Typography;

/* =========================
 * NÚT NHÓM TÁI DÙNG
 * ========================= */
const GroupCartActions = ({ creatingGroupCart, createGroupCart, router }) => (
    <Space style={{ marginTop: 16 }}>
        <Button
            type="text"
            icon={<UserAddOutlined />}
            loading={creatingGroupCart}
            className="btn-create-group"
            onClick={createGroupCart}
            style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}
        >
            Tạo giỏ hàng nhóm
        </Button>

        <Button
            type="text"
            icon={<UserAddOutlined />}
            className="btn-create-cart-group"
            onClick={() => router.push('/cart_group')}
            style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}
        >
            đi đến giỏ hàng nhóm
        </Button>
    </Space>
);

// Tách CartItem thành component riêng để tối ưu re-render
const CartItem = memo(({ item, isSelected, onSelect, onUpdateQuantity, onRemove, isUpdating, appliedCoupon }) => {
    const handleQuantityChange = useCallback(
        (newQuantity) => {
            if (newQuantity && newQuantity !== item.quantity) {
                onUpdateQuantity(item.id, newQuantity);
            }
        },
        [item.id, item.quantity, onUpdateQuantity],
    );

    console.log('itemqưeqwe', item);

    const handleSelect = useCallback(
        (e) => {
            console.log('Item selected:', item.id, e.target.checked);
            onSelect(item.id, e.target.checked);
        },
        [item.id, onSelect],
    );

    const handleRemove = useCallback(() => {
        onRemove([item.id]);
        window.updateCartCount?.();
        window.dispatchEvent(new CustomEvent('cartUpdated'));
    }, [item.id, onRemove]);

    // Tính giá sau khi áp dụng mã giảm giá
    const calculateDiscountedPrice = useCallback(
        (originalPrice) => {
            if (!appliedCoupon) {
                console.log('No coupon applied');
                return originalPrice;
            }

            // ✅ scope: "all"
            if (appliedCoupon.scope === 'all') {
                if (appliedCoupon.discount_type === 'percent') {
                    const discountAmount = (originalPrice * parseFloat(appliedCoupon.discount_value)) / 100;
                    return originalPrice - discountAmount;
                } else if (appliedCoupon.discount_type === 'fixed') {
                    return Math.max(0, originalPrice - parseFloat(appliedCoupon.discount_value));
                }
            }

            // ✅ scope: "specific"
            if (appliedCoupon.scope === 'specific') {
                const isApplicable = appliedCoupon.books.some((book) => {
                    return (
                        book.id === item.book.id ||
                        parseInt(book.id) === parseInt(item.book.id) ||
                        String(book.id) === String(item.book.id)
                    );
                });

                if (!isApplicable) return originalPrice;

                if (appliedCoupon.discount_type === 'percent') {
                    const discountAmount = (originalPrice * parseFloat(appliedCoupon.discount_value)) / 100;
                    return originalPrice - discountAmount;
                } else if (appliedCoupon.discount_type === 'fixed') {
                    return Math.max(0, originalPrice - parseFloat(appliedCoupon.discount_value));
                }
            }

            return originalPrice;
        },
        [appliedCoupon, item.book.id],
    );

    // ✅ nếu discount_price = 0 thì lấy price
    const originalPrice = useMemo(() => {
        const discountPrice = parseFloat(item?.book.discount_price) || 0;
        const regularPrice = parseFloat(item?.book.price) || 0;
        return discountPrice === 0 ? regularPrice : discountPrice;
    }, [item?.book.discount_price, item?.book.price, item.id]);

    const discountedPrice = calculateDiscountedPrice(originalPrice);
    const hasDiscount = discountedPrice < originalPrice;

    const itemTotal = useMemo(() => {
        return (discountedPrice * item.quantity).toLocaleString('vi-VN');
    }, [discountedPrice, item.quantity]);

    const originalTotal = useMemo(() => {
        return (originalPrice * item.quantity).toLocaleString('vi-VN');
    }, [originalPrice, item.quantity]);

    return (
        <div className={`cart-item ${isSelected ? 'selected' : ''}`}>
            <div className="cart-item-content">
                <div className="cart-item-checkbox">
                    <Checkbox checked={isSelected} onChange={handleSelect} />
                </div>

                <div className="cart-item-info">
                    <div className="cart-item-image">
                        <Image
                            src={item.book.cover_image}
                            alt={item.book.title}
                            width={80}
                            height={100}
                            preview={false}
                        />
                    </div>
                    <div className="cart-item-details">
                        <Text strong className="book-title">
                            {item.book.title}
                        </Text>
                        <Text type="secondary" className="book-author">
                            Tác giả: {item.book.author.name}
                        </Text>
                        <Text type="secondary" className="book-category-mobile">
                            Thể loại: {item.book.category.name}
                        </Text>
                    </div>
                </div>

                <div className="cart-item-category desktop-only">
                    <Text>{item.book.category.name}</Text>
                </div>

                <div className="cart-item-price">
                    <span className="mobile-label">Đơn giá:</span>
                    {hasDiscount ? (
                        <div>
                            <Text delete type="secondary" style={{ fontSize: '12px' }}>
                                {originalPrice.toLocaleString('vi-VN')}đ
                            </Text>
                            <br />
                            <Text strong style={{ color: '#ff4d4f' }}>
                                {discountedPrice.toLocaleString('vi-VN')}đ
                            </Text>
                        </div>
                    ) : (
                        <Text strong>{originalPrice.toLocaleString('vi-VN')}đ</Text>
                    )}
                </div>

                <div className="cart-item-quantity">
                    <span className="mobile-label">Số lượng:</span>
                    <Space.Compact className="quantity-controls">
                        <Button
                            size="small"
                            icon={<MinusOutlined />}
                            onClick={() => handleQuantityChange(item.quantity - 1)}
                            disabled={item.quantity <= 1 || isUpdating}
                        />
                        <InputNumber
                            size="small"
                            min={1}
                            max={item.book.stock}
                            value={item.quantity}
                            onChange={handleQuantityChange}
                            disabled={isUpdating}
                            className="quantity-input"
                        />
                        <Button
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => handleQuantityChange(item.quantity + 1)}
                            disabled={item.quantity >= item.book.stock || isUpdating}
                        />
                    </Space.Compact>
                </div>

                <div className="cart-item-total">
                    <span className="mobile-label">Thành tiền:</span>
                    {hasDiscount ? (
                        <div>
                            <Text delete type="secondary" style={{ fontSize: '12px' }}>
                                {originalTotal}đ
                            </Text>
                            <br />
                            <Text strong className="total-price" style={{ color: '#ff4d4f' }}>
                                {itemTotal}đ
                            </Text>
                        </div>
                    ) : (
                        <Text strong className="total-price">
                            {itemTotal}đ
                        </Text>
                    )}
                </div>

                <div className="cart-item-actions">
                    <Popconfirm
                        title="Xóa sản phẩm"
                        description="Bạn có chắc chắn muốn xóa sản phẩm này?"
                        onConfirm={handleRemove}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                    </Popconfirm>
                </div>
            </div>
        </div>
    );
});
CartItem.displayName = 'CartItem';

const Cart = () => {
    const router = useRouter();
    const {
        cartData,
        selectedItems,
        setSelectedItems,
        updateItemQuantity,
        removeItems,
        calculateTotal, // (đang không dùng nhưng cứ giữ)
        loading,
        updatingItems,
    } = useCart();

    const [voucherModalVisible, setVoucherModalVisible] = useState(false);
    const [voucherCode, setVoucherCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [checkingCoupon, setCheckingCoupon] = useState(false);

    // ✅ Group cart state
    const [groupCartModalVisible, setGroupCartModalVisible] = useState(false);
    const [creatingGroupCart, setCreatingGroupCart] = useState(false);
    const [groupCartData, setGroupCartData] = useState(null);

    // Ensure selectedItems is always an array
    const safeSelectedItems = useMemo(() => {
        return Array.isArray(selectedItems) ? selectedItems : [];
    }, [selectedItems]);

    // ✅ API tạo giỏ nhóm
    const createGroupCart = async () => {
        try {
            setCreatingGroupCart(true);

            const authToken =
                localStorage.getItem('auth_token') ||
                localStorage.getItem('access_token') ||
                localStorage.getItem('token');

            if (!authToken) throw new Error('Vui lòng đăng nhập để tạo giỏ hàng nhóm');

            const headers = {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${authToken}`,
            };

            const response = await fetch('http://localhost:8000/api/group-orders', {
                method: 'POST',
                headers,
                credentials: 'include',
                body: JSON.stringify({}),
            });

            if (response.status === 401) {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('access_token');
                localStorage.removeItem('token');
                throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            }

            if (!response.ok) {
                let errorMessage = 'Không thể tạo giỏ hàng nhóm';
                try {
                    const err = await response.json();
                    errorMessage = err.message || errorMessage;
                } catch {
                    const t = await response.text();
                    errorMessage = t || errorMessage;
                }
                throw new Error(`${errorMessage} (${response.status})`);
            }

            const data = await response.json();

            if (data.join_url && data.group) {
                setGroupCartData(data);
                setGroupCartModalVisible(true);
                toast.success('Tạo giỏ hàng nhóm thành công!');
                return data;
            } else {
                throw new Error('Dữ liệu trả về không hợp lệ');
            }
        } catch (error) {
            console.error('Error creating group cart:', error);
            if (error.message.includes('đăng nhập')) {
                toast.error(error.message);
            } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                toast.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
            } else {
                toast.error(error.message || 'Có lỗi xảy ra khi tạo giỏ hàng nhóm');
            }
            return null;
        } finally {
            setCreatingGroupCart(false);
        }
    };

    // ✅ copy link
    const handleCopyJoinUrl = () => {
        if (groupCartData?.join_url) {
            navigator.clipboard
                .writeText(groupCartData.join_url)
                .then(() => message.success('Đã copy đường link!'))
                .catch(() => message.error('Không thể copy đường link'));
        }
    };

    // ✅ đi đến trang group cart
    const handleGoToGroupCart = () => {
        setGroupCartModalVisible(false);
        if (groupCartData?.group?.join_token) {
            localStorage.setItem('group_cart_token', groupCartData.group.join_token);
        }
        router.push('/cart_group');
    };

    // API check coupon
    const checkCoupon = async (couponCode) => {
        try {
            setCheckingCoupon(true);
            const response = await fetch('http://localhost:8000/api/coupons/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: couponCode }),
            });

            const data = await response.json();

            if (response.ok && data.coupon) {
                const coupon = data.coupon;
                coupon.appliesToAll = coupon.scope === 'all';
                return { success: true, coupon, message: data.message };
            } else {
                return { success: false, message: data.message || 'Mã giảm giá không hợp lệ' };
            }
        } catch (error) {
            console.error('Error checking coupon:', error);
            return { success: false, message: 'Có lỗi xảy ra khi kiểm tra mã giảm giá' };
        } finally {
            setCheckingCoupon(false);
        }
    };

    useEffect(() => {
        // auto-select từ buy now
        const buyNowData = localStorage.getItem('buyNowData');
        if (buyNowData && cartData?.items && cartData.items.length > 0) {
            try {
                const parsed = JSON.parse(buyNowData);
                if (parsed.isBuyNow && parsed.bookId && !parsed.processed) {
                    const targetItem = cartData.items.find(
                        (it) => it.id == parsed.bookId || it.book?.id == parsed.bookId,
                    );
                    if (targetItem) {
                        setSelectedItems([targetItem.id]);
                        localStorage.setItem('selectedCartItems', JSON.stringify([targetItem.id]));
                        localStorage.setItem(
                            'buyNowData',
                            JSON.stringify({ ...parsed, processed: true, selectedItemId: targetItem.id }),
                        );
                        toast.info(
                            `🎯 Đã tự động chọn "${targetItem.book?.title || targetItem.book?.name}" để đặt hàng!`,
                        );
                    } else {
                        setTimeout(() => window.dispatchEvent(new CustomEvent('retryAutoSelect')), 1000);
                    }
                }
            } catch {
                localStorage.removeItem('buyNowData');
            }
        }
    }, [cartData?.items, setSelectedItems]);

    // áp dụng mã
    const handleApplyCoupon = async () => {
        if (!voucherCode.trim()) {
            toast.error('Vui lòng nhập mã giảm giá');
            return;
        }

        const result = await checkCoupon(voucherCode.trim());
        if (result.success) {
            const coupon = result.coupon;

            // scope all
            if (coupon.scope === 'all') {
                const totalValue = calculateSelectedTotalWithCoupon(coupon);
                if (totalValue < parseFloat(coupon.min_order_value)) {
                    toast.error(
                        `Đơn hàng phải có giá trị tối thiểu ${parseFloat(coupon.min_order_value).toLocaleString(
                            'vi-VN',
                        )}đ`,
                    );
                    return;
                }
                setAppliedCoupon(coupon);
                toast.success(`${result.message} Áp dụng thành công cho toàn bộ sản phẩm`);
                setVoucherModalVisible(false);
                return;
            }

            // scope specific
            if (coupon.scope === 'specific') {
                const applicableItems =
                    cartData?.items?.filter((item) =>
                        coupon.books.some((book) => parseInt(book.id) === parseInt(item.book.id)),
                    ) || [];

                if (applicableItems.length === 0) {
                    toast.warning('Mã giảm giá này không áp dụng cho sản phẩm nào trong giỏ hàng');
                    return;
                }

                const totalValue = calculateSelectedTotalWithCoupon(coupon);
                if (totalValue < parseFloat(coupon.min_order_value)) {
                    toast.error(
                        `Đơn hàng phải có giá trị tối thiểu ${parseFloat(coupon.min_order_value).toLocaleString(
                            'vi-VN',
                        )}đ`,
                    );
                    return;
                }

                setAppliedCoupon(coupon);
                toast.success(`${result.message} Áp dụng thành công cho ${applicableItems.length} sản phẩm`);
                setVoucherModalVisible(false);
                return;
            }

            toast.error('Mã giảm giá không hợp lệ - scope không xác định');
        } else {
            toast.error(result.message);
        }
    };

    // bỏ mã
    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setVoucherCode('');
        toast.success('Đã xóa mã giảm giá');
    };

    const handleItemSelect = useCallback(
        (itemId, checked) => {
            const currentSelected = Array.isArray(selectedItems) ? selectedItems : [];
            let newSelected;
            if (checked) {
                newSelected = currentSelected.includes(itemId) ? currentSelected : [...currentSelected, itemId];
            } else {
                newSelected = currentSelected.filter((id) => id !== itemId);
            }
            setSelectedItems(newSelected);
        },
        [selectedItems, setSelectedItems],
    );

    const handleSelectAll = useCallback(
        (checked) => {
            if (checked && cartData?.items) {
                const allItemIds = cartData.items.map((item) => item.id);
                setSelectedItems(allItemIds);
            } else {
                setSelectedItems([]);
            }
        },
        [cartData?.items, setSelectedItems],
    );

    const handleRemoveSelected = useCallback(() => {
        if (safeSelectedItems.length > 0) {
            removeItems(safeSelectedItems);
            setSelectedItems([]);
        }
    }, [safeSelectedItems, removeItems, setSelectedItems]);

    const isAllSelected = useMemo(() => {
        return cartData?.items?.length > 0 && safeSelectedItems.length === cartData.items.length;
    }, [cartData?.items?.length, safeSelectedItems.length]);

    const isIndeterminate = useMemo(() => {
        return safeSelectedItems.length > 0 && safeSelectedItems.length < (cartData?.items?.length || 0);
    }, [safeSelectedItems.length, cartData?.items?.length]);

    // helper giá
    const getItemPrice = useCallback((item) => {
        const discountPrice = parseFloat(item?.book.discount_price) || 0;
        const regularPrice = parseFloat(item?.book.price) || 0;
        return discountPrice === 0 ? regularPrice : discountPrice;
    }, []);

    // tổng sau giảm
    const calculateSelectedTotalWithCoupon = useCallback(
        (coupon = appliedCoupon) => {
            if (!cartData || !safeSelectedItems.length) return 0;

            return cartData.items
                .filter((item) => safeSelectedItems.includes(item.id))
                .reduce((total, item) => {
                    const originalPrice = getItemPrice(item);
                    let finalPrice = originalPrice;

                    if (coupon) {
                        if (coupon.scope === 'all') {
                            if (coupon.discount_type === 'percent') {
                                finalPrice = originalPrice - (originalPrice * parseFloat(coupon.discount_value)) / 100;
                            } else if (coupon.discount_type === 'fixed') {
                                finalPrice = Math.max(0, originalPrice - parseFloat(coupon.discount_value));
                            }
                        } else if (
                            coupon.scope === 'specific' &&
                            coupon.books.some((book) => book.id === item.book.id)
                        ) {
                            if (coupon.discount_type === 'percent') {
                                finalPrice = originalPrice - (originalPrice * parseFloat(coupon.discount_value)) / 100;
                            } else if (coupon.discount_type === 'fixed') {
                                finalPrice = Math.max(0, originalPrice - parseFloat(coupon.discount_value));
                            }
                        }
                    }

                    return total + finalPrice * item.quantity;
                }, 0);
        },
        [cartData, safeSelectedItems, appliedCoupon, getItemPrice],
    );

    // tổng gốc
    const calculateOriginalTotal = useCallback(() => {
        if (!cartData || !safeSelectedItems.length) return 0;
        return cartData.items
            .filter((item) => safeSelectedItems.includes(item.id))
            .reduce((total, item) => total + getItemPrice(item) * item.quantity, 0);
    }, [cartData, safeSelectedItems, getItemPrice]);

    const totalAmount = useMemo(
        () => calculateSelectedTotalWithCoupon().toLocaleString('vi-VN'),
        [calculateSelectedTotalWithCoupon],
    );
    const originalTotalAmount = useMemo(
        () => calculateOriginalTotal().toLocaleString('vi-VN'),
        [calculateOriginalTotal],
    );
    const totalDiscount = useMemo(
        () => calculateOriginalTotal() - calculateSelectedTotalWithCoupon(),
        [calculateOriginalTotal, calculateSelectedTotalWithCoupon],
    );

    React.useEffect(() => {
        console.log('selectedItems changed:', safeSelectedItems);
    }, [safeSelectedItems]);

    if (loading) {
        return (
            <div className="cart-loading">
                <Spin size="large" />
            </div>
        );
    }

    /* =========================
     * TRẠNG THÁI GIỎ TRỐNG – VẪN HIỆN 2 NÚT NHÓM
     * ========================= */
    if (!cartData || !cartData.items || cartData.items.length === 0) {
        return (
            <div className="cart-empty">
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                        <div>
                            <div>Giỏ hàng của bạn đang trống</div>
                            <GroupCartActions
                                creatingGroupCart={creatingGroupCart}
                                createGroupCart={createGroupCart}
                                router={router}
                            />
                        </div>
                    }
                >
                    <Button
                        type="primary"
                        onClick={() => router.push('/search?type=paper&sort=popular&page=1&limit=12')}
                    >
                        Mua sắm ngay
                    </Button>
                </Empty>

                {/* Modal nhóm vẫn hoạt động khi trống */}
                <Modal
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <UserAddOutlined style={{ color: '#1890ff' }} />
                            <span>Tạo giỏ hàng nhóm thành công!</span>
                        </div>
                    }
                    open={groupCartModalVisible}
                    onCancel={() => setGroupCartModalVisible(false)}
                    footer={[
                        <Button key="copy" icon={<CopyOutlined />} onClick={handleCopyJoinUrl}>
                            Copy Link
                        </Button>,
                        <Button key="close" onClick={() => setGroupCartModalVisible(false)}>
                            Đóng
                        </Button>,
                        <Button key="goto" type="primary" onClick={handleGoToGroupCart}>
                            Đi đến giỏ hàng nhóm
                        </Button>,
                    ]}
                    width={600}
                >
                    {groupCartData && (
                        <div style={{ padding: '16px 0' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <Text strong style={{ fontSize: '16px', color: '#52c41a' }}>
                                    Giỏ hàng nhóm đã được tạo thành công!
                                </Text>
                                <p style={{ marginTop: '8px', color: '#666' }}>
                                    Chia sẻ đường link dưới đây để mời bạn bè cùng mua hàng:
                                </p>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <Text strong>Đường link tham gia:</Text>
                                <Input.TextArea
                                    value={groupCartData.join_url}
                                    readOnly
                                    rows={2}
                                    style={{
                                        marginTop: '8px',
                                        backgroundColor: '#f6ffed',
                                        border: '1px solid #b7eb8f',
                                    }}
                                />
                            </div>

                            <div style={{ backgroundColor: '#f0f8ff', padding: '12px', borderRadius: '6px' }}>
                                <Text strong>Thông tin giỏ hàng nhóm:</Text>
                                <div style={{ marginTop: '8px', lineHeight: '1.6' }}>
                                    <p>
                                        <Text type="secondary">ID nhóm:</Text>{' '}
                                        <Text code>#{groupCartData.group.id}</Text>
                                    </p>
                                    <p>
                                        <Text type="secondary">Mã tham gia:</Text>{' '}
                                        <Text code>{groupCartData.group.join_token}</Text>
                                    </p>
                                    <p>
                                        <Text type="secondary">Cho phép khách:</Text>{' '}
                                        <Text>{groupCartData.group.allow_guest ? 'Có' : 'Không'}</Text>
                                    </p>
                                    <p>
                                        <Text type="secondary">Quy tắc vận chuyển:</Text>{' '}
                                        <Text>
                                            {groupCartData.group.shipping_rule === 'equal' ? 'Chia đều' : 'Khác'}
                                        </Text>
                                    </p>
                                    <p>
                                        <Text type="secondary">Hết hạn:</Text>{' '}
                                        <Text>{new Date(groupCartData.group.expires_at).toLocaleString('vi-VN')}</Text>
                                    </p>
                                </div>
                            </div>

                            <div
                                style={{
                                    marginTop: '16px',
                                    padding: '12px',
                                    backgroundColor: '#fff7e6',
                                    borderRadius: '6px',
                                    border: '1px solid #ffd666',
                                }}
                            >
                                <Text style={{ fontSize: '14px', color: '#d46b08' }}>
                                    💡 <strong>Lưu ý:</strong> Đường link này sẽ hết hạn sau{' '}
                                    {Math.ceil(
                                        (new Date(groupCartData.group.expires_at) - new Date()) / (1000 * 60 * 60),
                                    )}{' '}
                                    giờ. Hãy chia sẻ với bạn bè để cùng nhau mua hàng!
                                </Text>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        );
    }

    const handleCheckout = () => {
        const checkoutData = {
            selectedItems: safeSelectedItems,
            totalAmount: calculateSelectedTotalWithCoupon(),
            originalAmount: calculateOriginalTotal(),
            totalDiscount: totalDiscount,
            appliedCoupon: appliedCoupon
                ? {
                      id: appliedCoupon.id,
                      name: appliedCoupon.name,
                      discount_type: appliedCoupon.discount_type,
                      discount_value: appliedCoupon.discount_value,
                      scope: appliedCoupon.scope,
                  }
                : null,
        };

        const params = new URLSearchParams({ data: JSON.stringify(checkoutData) });
        router.push(`/payment?${params.toString()}`);
    };

    return (
        <div className="cart-container">
            <div className="cart-header">
                <Title level={2}>
                    <ShoppingCartOutlined /> Giỏ hàng của bạn ({cartData.total_items})
                </Title>
            </div>

            <Row gutter={24}>
                <Col xs={24} lg={16}>
                    <Card className="cart-items-card">
                        <div className="cart-controls">
                            <div
                                className="cart-select-all"
                                style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}
                            >
                                <Checkbox
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    checked={isAllSelected}
                                    indeterminate={isIndeterminate}
                                >
                                    Chọn tất cả ({safeSelectedItems.length}/{cartData.items.length})
                                </Checkbox>

                                {/* hai nút nhóm khi giỏ có item */}
                                <GroupCartActions
                                    creatingGroupCart={creatingGroupCart}
                                    createGroupCart={createGroupCart}
                                    router={router}
                                />
                            </div>

                            {safeSelectedItems.length > 0 && (
                                <div className="cart-bulk-actions">
                                    <Text type="secondary">Đã chọn {safeSelectedItems.length} sản phẩm</Text>
                                    <Popconfirm
                                        title="Xóa các sản phẩm đã chọn"
                                        description={`Bạn có chắc chắn muốn xóa ${safeSelectedItems.length} sản phẩm đã chọn?`}
                                        onConfirm={handleRemoveSelected}
                                        okText="Xóa"
                                        cancelText="Hủy"
                                    >
                                        <Button danger type="text" icon={<DeleteOutlined />}>
                                            Xóa đã chọn
                                        </Button>
                                    </Popconfirm>
                                </div>
                            )}
                        </div>

                        <Divider />

                        <div className="cart-items-list">
                            {cartData.items.map((item) => (
                                <CartItem
                                    key={item.id}
                                    item={item}
                                    isSelected={safeSelectedItems.includes(item.id)}
                                    onSelect={handleItemSelect}
                                    onUpdateQuantity={updateItemQuantity}
                                    onRemove={removeItems}
                                    isUpdating={updatingItems.has(item.id)}
                                    appliedCoupon={appliedCoupon}
                                />
                            ))}
                        </div>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card className="cart-summary-card" title="Thông tin khuyến mãi">
                        <div className="cart-summary">
                            <div className="cart-voucher-row">
                                <Text>Mã giảm giá:</Text>
                                {appliedCoupon ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Text strong style={{ color: '#52c41a' }}>
                                            {appliedCoupon.name}
                                        </Text>
                                        <Button type="link" size="small" onClick={handleRemoveCoupon}>
                                            Xóa
                                        </Button>
                                    </div>
                                ) : (
                                    <Button type="link" onClick={() => setVoucherModalVisible(true)}>
                                        Nhập mã
                                    </Button>
                                )}
                            </div>

                            {appliedCoupon && (
                                <div style={{ marginTop: '8px' }}>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                        Giảm{' '}
                                        {appliedCoupon.discount_type === 'percent'
                                            ? `${appliedCoupon.discount_value}%`
                                            : `${parseFloat(appliedCoupon.discount_value).toLocaleString(
                                                  'vi-VN',
                                              )}đ`}{' '}
                                        cho các sản phẩm áp dụng
                                    </Text>
                                </div>
                            )}

                            <Divider />

                            <div className="cart-summary-section">
                                <Title level={4}>Thông tin thanh toán</Title>

                                <div className="cart-summary-row">
                                    <Text>Số sản phẩm:</Text>
                                    <Text>{safeSelectedItems.length}</Text>
                                </div>

                                {appliedCoupon && totalDiscount > 0 && (
                                    <>
                                        <div className="cart-summary-row">
                                            <Text>Tạm tính:</Text>
                                            <Text>{originalTotalAmount}đ</Text>
                                        </div>
                                        <div className="cart-summary-row">
                                            <Text>Giảm giá:</Text>
                                            <Text style={{ color: '#52c41a' }}>
                                                -{totalDiscount.toLocaleString('vi-VN')}đ
                                            </Text>
                                        </div>
                                    </>
                                )}

                                <Divider />

                                <div className="cart-summary-row cart-total">
                                    <Text strong>Tổng số tiền:</Text>
                                    <Text strong className="cart-total-price">
                                        {totalAmount}đ
                                    </Text>
                                </div>

                                <Button
                                    type="primary"
                                    size="large"
                                    block
                                    className="cart-checkout-btn"
                                    disabled={safeSelectedItems.length === 0}
                                    onClick={handleCheckout}
                                >
                                    Mua hàng ({safeSelectedItems.length} sản phẩm)
                                </Button>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Voucher Modal */}
            <Modal
                title="Nhập mã giảm giá"
                open={voucherModalVisible}
                onOk={handleApplyCoupon}
                onCancel={() => setVoucherModalVisible(false)}
                okText="Áp dụng"
                cancelText="Hủy"
                confirmLoading={checkingCoupon}
            >
                <Input
                    placeholder="Nhập mã giảm giá..."
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    onPressEnter={handleApplyCoupon}
                />
            </Modal>

            {/* ✅ Group Cart Modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <UserAddOutlined style={{ color: '#1890ff' }} />
                        <span>Tạo giỏ hàng nhóm thành công!</span>
                    </div>
                }
                open={groupCartModalVisible}
                onCancel={() => setGroupCartModalVisible(false)}
                footer={[
                    <Button key="copy" icon={<CopyOutlined />} onClick={handleCopyJoinUrl}>
                        Copy Link
                    </Button>,
                    <Button key="close" onClick={() => setGroupCartModalVisible(false)}>
                        Đóng
                    </Button>,
                    <Button key="goto" type="primary" onClick={handleGoToGroupCart}>
                        Đi đến giỏ hàng nhóm
                    </Button>,
                ]}
                width={600}
            >
                {groupCartData && (
                    <div style={{ padding: '16px 0' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <Text strong style={{ fontSize: '16px', color: '#52c41a' }}>
                                Giỏ hàng nhóm đã được tạo thành công!
                            </Text>
                            <p style={{ marginTop: '8px', color: '#666' }}>
                                Chia sẻ đường link dưới đây để mời bạn bè cùng mua hàng:
                            </p>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <Text strong>Đường link tham gia:</Text>
                            <Input.TextArea
                                value={groupCartData.join_url}
                                readOnly
                                rows={2}
                                style={{ marginTop: '8px', backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}
                            />
                        </div>

                        <div style={{ backgroundColor: '#f0f8ff', padding: '12px', borderRadius: '6px' }}>
                            <Text strong>Thông tin giỏ hàng nhóm:</Text>
                            <div style={{ marginTop: '8px', lineHeight: '1.6' }}>
                                <p>
                                    <Text type="secondary">ID nhóm:</Text> <Text code>#{groupCartData.group.id}</Text>
                                </p>
                                <p>
                                    <Text type="secondary">Mã tham gia:</Text>{' '}
                                    <Text code>{groupCartData.group.join_token}</Text>
                                </p>
                                <p>
                                    <Text type="secondary">Cho phép khách:</Text>{' '}
                                    <Text>{groupCartData.group.allow_guest ? 'Có' : 'Không'}</Text>
                                </p>
                                <p>
                                    <Text type="secondary">Quy tắc vận chuyển:</Text>{' '}
                                    <Text>{groupCartData.group.shipping_rule === 'equal' ? 'Chia đều' : 'Khác'}</Text>
                                </p>
                                <p>
                                    <Text type="secondary">Hết hạn:</Text>{' '}
                                    <Text>{new Date(groupCartData.group.expires_at).toLocaleString('vi-VN')}</Text>
                                </p>
                            </div>
                        </div>

                        <div
                            style={{
                                marginTop: '16px',
                                padding: '12px',
                                backgroundColor: '#fff7e6',
                                borderRadius: '6px',
                                border: '1px solid #ffd666',
                            }}
                        >
                            <Text style={{ fontSize: '14px', color: '#d46b08' }}>
                                💡 <strong>Lưu ý:</strong> Đường link này sẽ hết hạn sau{' '}
                                {Math.ceil((new Date(groupCartData.group.expires_at) - new Date()) / (1000 * 60 * 60))}{' '}
                                giờ. Hãy chia sẻ với bạn bè để cùng nhau mua hàng!
                            </Text>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Cart;
