'use client';
import React, { useState, useCallback, useMemo, memo } from 'react';
import {
  Card,
  Button,
  Input,
  InputNumber,
  Checkbox,
  Image,
  Typography,
  Row,
  Col,
  Divider,
  Empty,
  Space,
  message,
  Popconfirm,
  Spin,
  Modal
} from 'antd';
import {
  DeleteOutlined,
  ShoppingCartOutlined,
  PlusOutlined,
  MinusOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import './Cart.css';
import { useCart } from '../../app/contexts/CartContext';
import { toast } from 'react-toastify';

const { Title, Text } = Typography;

// Tách CartItem thành component riêng để tối ưu re-render
const CartItem = memo(({
  item,
  isSelected,
  onSelect,
  onUpdateQuantity,
  onRemove,
  isUpdating,
  appliedCoupon
}) => {
  const handleQuantityChange = useCallback((newQuantity) => {
    if (newQuantity && newQuantity !== item.quantity) {
      onUpdateQuantity(item.id, newQuantity);
    }
  }, [item.id, item.quantity, onUpdateQuantity]);

  const handleSelect = useCallback((e) => {
    console.log('Item selected:', item.id, e.target.checked);
    onSelect(item.id, e.target.checked);
  }, [item.id, onSelect]);

  const handleRemove = useCallback(() => {
    onRemove([item.id]);
    window.updateCartCount?.();
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  }, [item.id, onRemove]);

  // Tính giá sau khi áp dụng mã giảm giá
  const calculateDiscountedPrice = useCallback((originalPrice) => {
    console.log('=== CALCULATING DISCOUNTED PRICE ===');
    console.log('Original Price:', originalPrice);
    console.log('Applied Coupon:', appliedCoupon);
    console.log('Item Book ID:', item.book.id);

    if (!appliedCoupon) {
      console.log('No coupon applied');
      return originalPrice;
    }

    // Kiểm tra xem sản phẩm có áp dụng được mã giảm giá không
    const isApplicable = appliedCoupon.books.some(book => {
      console.log('Checking book ID:', book.id, 'vs item book ID:', item.book.id);
      // Thử cả 2 cách so sánh để đảm bảo
      return book.id === item.book.id || parseInt(book.id) === parseInt(item.book.id) || String(book.id) === String(item.book.id);
    });

    console.log('Is Applicable:', isApplicable);
    if (!isApplicable) {
      console.log('Coupon not applicable for this item');
      return originalPrice;
    }

    // Tính giá sau giảm
    if (appliedCoupon.discount_type === 'percent') {
      const discountAmount = (originalPrice * parseFloat(appliedCoupon.discount_value)) / 100;
      const finalPrice = originalPrice - discountAmount;
      console.log('Percent discount:', appliedCoupon.discount_value + '%');
      console.log('Discount amount:', discountAmount);
      console.log('Final price:', finalPrice);
      return finalPrice;
    } else if (appliedCoupon.discount_type === 'fixed') {
      const finalPrice = Math.max(0, originalPrice - parseFloat(appliedCoupon.discount_value));
      console.log('Fixed discount:', appliedCoupon.discount_value);
      console.log('Final price:', finalPrice);
      return finalPrice;
    }

    console.log('Unknown discount type, returning original price');
    return originalPrice;
  }, [appliedCoupon, item.book.id]);

  const originalPrice = parseFloat(item.book.price);
  const discountedPrice = calculateDiscountedPrice(originalPrice);
  const hasDiscount = discountedPrice < originalPrice;

  console.log('=== ITEM RENDER INFO ===');
  console.log('Item ID:', item.id, 'Book ID:', item.book.id);
  console.log('Original Price:', originalPrice);
  console.log('Discounted Price:', discountedPrice);
  console.log('Has Discount:', hasDiscount);
  console.log('Applied Coupon in render:', appliedCoupon);

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
          <Checkbox
            checked={isSelected}
            onChange={handleSelect}
          />
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
            <Text strong className="book-title">{item.book.title}</Text>
            <Text type="secondary" className="book-author">Tác giả: {item.book.author.name}</Text>
            <Text type="secondary" className="book-category-mobile">Thể loại: {item.book.category.name}</Text>
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
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
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
    calculateTotal,
    loading,
    updatingItems,
  } = useCart();

  const [voucherModalVisible, setVoucherModalVisible] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  // Ensure selectedItems is always an array
  const safeSelectedItems = useMemo(() => {
    return Array.isArray(selectedItems) ? selectedItems : [];
  }, [selectedItems]);

  // API để kiểm tra mã giảm giá
  const checkCoupon = async (couponCode) => {
    try {
      setCheckingCoupon(true);
      const response = await fetch('http://localhost:8000/api/coupons/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: couponCode
        })
      });

      const data = await response.json();

      if (response.ok && data.coupon) {
        return {
          success: true,
          coupon: data.coupon,
          message: data.message
        };
      } else {
        return {
          success: false,
          message: data.message || 'Mã giảm giá không hợp lệ'
        };
      }
    } catch (error) {
      console.error('Error checking coupon:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi kiểm tra mã giảm giá'
      };
    } finally {
      setCheckingCoupon(false);
    }
  };

  // Xử lý áp dụng mã giảm giá
  const handleApplyCoupon = async () => {
    if (!voucherCode.trim()) {
      toast.error('Vui lòng nhập mã giảm giá');
      return;
    }

    const result = await checkCoupon(voucherCode.trim());
    console.log('=== COUPON CHECK RESULT ===');
    console.log('Result:', result);

    if (result.success) {
      console.log('Coupon details:', result.coupon);
      console.log('Coupon books:', result.coupon.books);
      console.log('Cart items:', cartData?.items);

      // Kiểm tra xem có sản phẩm nào trong giỏ hàng áp dụng được mã giảm giá không
      const applicableItems = cartData?.items?.filter(item => {
        const isApplicable = result.coupon.books.some(book => {
          console.log('Comparing:', book.id, 'with', item.book.id, 'Type:', typeof book.id, typeof item.book.id);
          return parseInt(book.id) === parseInt(item.book.id); // Đảm bảo so sánh đúng kiểu dữ liệu
        });
        console.log('Item', item.book.id, 'is applicable:', isApplicable);
        return isApplicable;
      }) || [];

      console.log('Applicable items:', applicableItems);

      if (applicableItems.length === 0) {
        toast.warning('Mã giảm giá này không áp dụng cho sản phẩm nào trong giỏ hàng');
        return;
      }

      // Kiểm tra giá trị đơn hàng tối thiểu
      const totalValue = calculateSelectedTotalWithCoupon(result.coupon);
      console.log('Total value:', totalValue, 'Min order:', result.coupon.min_order_value);

      if (totalValue < parseFloat(result.coupon.min_order_value)) {
        toast.error(`Đơn hàng phải có giá trị tối thiểu ${parseFloat(result.coupon.min_order_value).toLocaleString('vi-VN')}đ`);
        return;
      }

      console.log('Setting applied coupon:', result.coupon);
      setAppliedCoupon(result.coupon);
      toast.success(`${result.message} Áp dụng thành công cho ${applicableItems.length} sản phẩm`);
      setVoucherModalVisible(false);
    } else {
      toast.error(result.message);
    }
  };

  // Xóa mã giảm giá
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setVoucherCode('');
    toast.success('Đã xóa mã giảm giá');
  };

  const handleItemSelect = useCallback((itemId, checked) => {
    console.log('handleItemSelect called:', itemId, checked);
    console.log('Current selectedItems:', selectedItems);

    const currentSelected = Array.isArray(selectedItems) ? selectedItems : [];

    let newSelected;
    if (checked) {
      if (!currentSelected.includes(itemId)) {
        newSelected = [...currentSelected, itemId];
      } else {
        newSelected = currentSelected;
      }
    } else {
      newSelected = currentSelected.filter(id => id !== itemId);
    }

    console.log('Setting new selectedItems:', newSelected);
    setSelectedItems(newSelected);
  }, [selectedItems, setSelectedItems]);

  const handleSelectAll = useCallback((checked) => {
    console.log('handleSelectAll called:', checked);

    if (checked && cartData?.items) {
      const allItemIds = cartData.items.map(item => item.id);
      console.log('Selecting all items:', allItemIds);
      setSelectedItems(allItemIds);
    } else {
      console.log('Deselecting all items');
      setSelectedItems([]);
    }
  }, [cartData?.items, setSelectedItems]);

  const handleRemoveSelected = useCallback(() => {
    if (safeSelectedItems.length > 0) {
      console.log('Removing selected items:', safeSelectedItems);
      removeItems(safeSelectedItems);
      setSelectedItems([]);
    }
  }, [safeSelectedItems, removeItems, setSelectedItems]);

  const isAllSelected = useMemo(() => {
    const result = cartData?.items?.length > 0 && safeSelectedItems.length === cartData.items.length;
    console.log('isAllSelected:', result, 'selectedItems:', safeSelectedItems.length, 'totalItems:', cartData?.items?.length);
    return result;
  }, [cartData?.items?.length, safeSelectedItems.length]);

  const isIndeterminate = useMemo(() => {
    return safeSelectedItems.length > 0 && safeSelectedItems.length < (cartData?.items?.length || 0);
  }, [safeSelectedItems.length, cartData?.items?.length]);

  // Tính tổng tiền sau khi áp dụng mã giảm giá
  const calculateSelectedTotalWithCoupon = useCallback((coupon = appliedCoupon) => {
    if (!cartData || !safeSelectedItems.length) return 0;

    return cartData.items
      .filter(item => safeSelectedItems.includes(item.id))
      .reduce((total, item) => {
        const originalPrice = parseFloat(item.book.price) || 0;
        let finalPrice = originalPrice;

        // Áp dụng giảm giá nếu có và sản phẩm được áp dụng
        if (coupon && coupon.books.some(book => book.id === item.book.id)) {
          if (coupon.discount_type === 'percent') {
            const discountAmount = (originalPrice * parseFloat(coupon.discount_value)) / 100;
            finalPrice = originalPrice - discountAmount;
          } else if (coupon.discount_type === 'fixed') {
            finalPrice = Math.max(0, originalPrice - parseFloat(coupon.discount_value));
          }
        }

        return total + finalPrice * item.quantity;
      }, 0);
  }, [cartData, safeSelectedItems, appliedCoupon]);

  // Tính tổng tiền gốc (trước khi giảm giá)
  const calculateOriginalTotal = useCallback(() => {
    if (!cartData || !safeSelectedItems.length) return 0;

    return cartData.items
      .filter(item => safeSelectedItems.includes(item.id))
      .reduce((total, item) => {
        const price = parseFloat(item.book.price) || 0;
        return total + price * item.quantity;
      }, 0);
  }, [cartData, safeSelectedItems]);

  const totalAmount = useMemo(() => {
    return calculateSelectedTotalWithCoupon().toLocaleString('vi-VN');
  }, [calculateSelectedTotalWithCoupon]);

  const originalTotalAmount = useMemo(() => {
    return calculateOriginalTotal().toLocaleString('vi-VN');
  }, [calculateOriginalTotal]);

  const totalDiscount = useMemo(() => {
    const original = calculateOriginalTotal();
    const discounted = calculateSelectedTotalWithCoupon();
    return original - discounted;
  }, [calculateOriginalTotal, calculateSelectedTotalWithCoupon]);

  // Debug effect to monitor selectedItems changes
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

  if (!cartData || !cartData.items || cartData.items.length === 0) {
    return (
      <div className="cart-empty">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Giỏ hàng của bạn đang trống"
        >
          <Button type="primary" onClick={() => router.push('/buybooks')}>
            Mua sắm ngay
          </Button>
        </Empty>
      </div>
    );
  }

  const handleCheckout = () => {
    const checkoutData = {
      selectedItems: safeSelectedItems,
      totalAmount: calculateSelectedTotalWithCoupon(),
      originalAmount: calculateOriginalTotal(),
      totalDiscount: totalDiscount,
      appliedCoupon: appliedCoupon ? {
        id: appliedCoupon.id,
        name: appliedCoupon.name,
        discount_type: appliedCoupon.discount_type,
        discount_value: appliedCoupon.discount_value
      } : null
    };

    // Encode dữ liệu thành URL params
    const params = new URLSearchParams({
      data: JSON.stringify(checkoutData)
    });

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
              <div className="cart-select-all">
                <Checkbox
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                >
                  Chọn tất cả ({safeSelectedItems.length}/{cartData.items.length})
                </Checkbox>
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

            <div className="cart-header-row desktop-only">
              <div className="cart-header-labels">
                <span className="col-product">Sản phẩm</span>
                <span className="col-category">Phân loại</span>
                <span className="col-price">Đơn giá</span>
                <span className="col-quantity">Số lượng</span>
                <span className="col-total">Thành tiền</span>
                <span className="col-actions">Thao tác</span>
              </div>
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
                    Giảm {appliedCoupon.discount_type === 'percent'
                      ? `${appliedCoupon.discount_value}%`
                      : `${parseFloat(appliedCoupon.discount_value).toLocaleString('vi-VN')}đ`
                    } cho các sản phẩm áp dụng
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
    </div>
  );
};

export default Cart;