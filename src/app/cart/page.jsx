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

const { Title, Text } = Typography;

// Tách CartItem thành component riêng để tối ưu re-render
const CartItem = memo(({ 
  item, 
  isSelected, 
  onSelect, 
  onUpdateQuantity, 
  onRemove, 
  isUpdating 
}) => {
  const handleQuantityChange = useCallback((newQuantity) => {
    if (newQuantity && newQuantity !== item.quantity) {
      onUpdateQuantity(item.id, newQuantity);
    }
  }, [item.id, item.quantity, onUpdateQuantity]);

  const handleSelect = useCallback((e) => {
    console.log('Item selected:', item.id, e.target.checked); // Debug log
    onSelect(item.id, e.target.checked);
  }, [item.id, onSelect]);

  const handleRemove = useCallback(() => {
    onRemove([item.id]);
    window.updateCartCount?.();
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  }, [item.id, onRemove]);

  const itemTotal = useMemo(() => {
    return (parseFloat(item.book.price) * item.quantity).toLocaleString('vi-VN');
  }, [item.book.price, item.quantity]);

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
          <Text strong>{parseFloat(item.book.price).toLocaleString('vi-VN')}đ</Text>
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
          <Text strong className="total-price">
            {itemTotal}đ
          </Text>
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

 

  // Ensure selectedItems is always an array
  const safeSelectedItems = useMemo(() => {
    return Array.isArray(selectedItems) ? selectedItems : [];
  }, [selectedItems]);

const handleItemSelect = useCallback((itemId, checked) => {
  console.log('handleItemSelect called:', itemId, checked);
  console.log('Current selectedItems:', selectedItems);
  
  // Ensure selectedItems is always an array
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
    console.log('handleSelectAll called:', checked); // Debug log
    
    if (checked && cartData?.items) {
      const allItemIds = cartData.items.map(item => item.id);
      console.log('Selecting all items:', allItemIds); // Debug log
      setSelectedItems(allItemIds);
    } else {
      console.log('Deselecting all items'); // Debug log
      setSelectedItems([]);
    }
  }, [cartData?.items, setSelectedItems]);

  const handleRemoveSelected = useCallback(() => {
    if (safeSelectedItems.length > 0) {
      console.log('Removing selected items:', safeSelectedItems); // Debug log
      removeItems(safeSelectedItems);
      // Reset selected items after removal
      setSelectedItems([]);
    }
  }, [safeSelectedItems, removeItems, setSelectedItems]);

  const isAllSelected = useMemo(() => {
    const result = cartData?.items?.length > 0 && safeSelectedItems.length === cartData.items.length;
    console.log('isAllSelected:', result, 'selectedItems:', safeSelectedItems.length, 'totalItems:', cartData?.items?.length); // Debug log
    return result;
  }, [cartData?.items?.length, safeSelectedItems.length]);

  const isIndeterminate = useMemo(() => {
    return safeSelectedItems.length > 0 && safeSelectedItems.length < (cartData?.items?.length || 0);
  }, [safeSelectedItems.length, cartData?.items?.length]);

  // Fixed calculation function
  const calculateSelectedTotal = useCallback(() => {
    if (!cartData || !safeSelectedItems.length) return 0;

    return cartData.items
      .filter(item => safeSelectedItems.includes(item.id))
      .reduce((total, item) => {
        const price = parseFloat(item.book.price) || 0;
        return total + price * item.quantity;
      }, 0);
  }, [cartData, safeSelectedItems]);

  const totalAmount = useMemo(() => {
    return calculateSelectedTotal().toLocaleString('vi-VN');
  }, [calculateSelectedTotal]);

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
                <Button type="link" onClick={() => setVoucherModalVisible(true)}>
                  Nhập mã
                </Button>
              </div>

              <Divider />

              <div className="cart-summary-section">
                <Title level={4}>Thông tin thanh toán</Title>

                <div className="cart-summary-row">
                  <Text>Số sản phẩm:</Text>
                  <Text>{safeSelectedItems.length}</Text>
                </div>

                <div className="cart-summary-row">
                  <Text>Voucher đã dùng:</Text>
                  <Text>{voucherCode || 'Không có'}</Text>
                </div>

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
                  onClick={() => window.location.href = '/payment'}
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
        onOk={() => {
          message.success(`Đã áp dụng mã: ${voucherCode}`);
          setVoucherModalVisible(false);
        }}
        onCancel={() => setVoucherModalVisible(false)}
        okText="Áp dụng"
        cancelText="Hủy"
      >
        <Input
          placeholder="Nhập mã giảm giá..."
          value={voucherCode}
          onChange={(e) => setVoucherCode(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default Cart;