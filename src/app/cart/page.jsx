'use client';
import React, { useState, useEffect } from 'react';
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

const { Title, Text } = Typography;

const Cart = () => {
  const router = useRouter();
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [voucherModalVisible, setVoucherModalVisible] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');

  // Load selected items from localStorage
  useEffect(() => {
    const savedSelectedItems = localStorage.getItem('selectedCartItems');
    if (savedSelectedItems) {
      try {
        setSelectedItems(JSON.parse(savedSelectedItems));
      } catch (error) {
        console.error('Error loading selected items:', error);
      }
    }
  }, []);

  // Save selected items to localStorage whenever it changes
  useEffect(() => {
    if (selectedItems.length > 0) {
      localStorage.setItem('selectedCartItems', JSON.stringify(selectedItems));
    } else {
      localStorage.removeItem('selectedCartItems');
    }
  }, [selectedItems]);

  const fetchCartData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setCartData(data.data);
      } else {
        message.error('Không thể tải giỏ hàng');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      message.error('Lỗi khi tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const updateItemQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    const token = localStorage.getItem('token');
    setUpdatingItems(prev => new Set([...prev, itemId]));

    try {
      const response = await fetch(`http://localhost:8000/api/cart/item/${itemId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      const data = await response.json();
      
      if (data.success) {
        setCartData(prev => ({
          ...prev,
          items: prev.items.map(item => 
            item.id === itemId 
              ? { ...item, quantity: newQuantity }
              : item
          ),
          cart: {
            ...prev.cart,
            cart_items: prev.cart.cart_items.map(item => 
              item.id === itemId 
                ? { ...item, quantity: newQuantity }
                : item
            )
          }
        }));
        message.success('Cập nhật số lượng thành công');
      } else {
        message.error('Không thể cập nhật số lượng');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      message.error('Lỗi khi cập nhật số lượng');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const removeItems = async (itemIds) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:8000/api/cart/remove', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cart_item_ids: itemIds })
      });

      const data = await response.json();
      if (data.success) {
        setCartData(prev => ({
          ...prev,
          items: prev.items.filter(item => !itemIds.includes(item.id)),
          cart: {
            ...prev.cart,
            cart_items: prev.cart.cart_items.filter(item => !itemIds.includes(item.id))
          }
        }));
        setSelectedItems(prev => prev.filter(id => !itemIds.includes(id)));
        message.success('Xóa sản phẩm thành công');
      } else {
        message.error('Không thể xóa sản phẩm');
      }
    } catch (error) {
      console.error('Error removing items:', error);
      message.error('Lỗi khi xóa sản phẩm');
    }
  };

  const handleItemSelect = (itemId, checked) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(cartData.items.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleRemoveSelected = () => {
    if (selectedItems.length > 0) {
      removeItems(selectedItems);
    }
  };

  const calculateTotal = () => {
    if (!cartData || !selectedItems.length) return 0;
    return cartData.items
      .filter(item => selectedItems.includes(item.id))
      .reduce((total, item) => {
        const price = parseFloat(item.book.price) || 0;
        return total + (price * item.quantity);
      }, 0);
  };

  useEffect(() => {
    fetchCartData();
  }, []);

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
                  checked={selectedItems.length === cartData.items.length && cartData.items.length > 0}
                  indeterminate={selectedItems.length > 0 && selectedItems.length < cartData.items.length}
                >
                  Chọn tất cả ({selectedItems.length}/{cartData.items.length})
                </Checkbox>
              </div>
              
              {selectedItems.length > 0 && (
                <div className="cart-bulk-actions">
                  <Text type="secondary">Đã chọn {selectedItems.length} sản phẩm</Text>
                  <Popconfirm
                    title="Xóa các sản phẩm đã chọn"
                    description={`Bạn có chắc chắn muốn xóa ${selectedItems.length} sản phẩm đã chọn?`}
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
                <div key={item.id} className={`cart-item ${selectedItems.includes(item.id) ? 'selected' : ''}`}>
                  <div className="cart-item-content">
                    <div className="cart-item-checkbox">
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onChange={(e) => handleItemSelect(item.id, e.target.checked)}
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
                      <Text strong>
                        {parseFloat(item.book.price).toLocaleString('vi-VN')}đ
                      </Text>
                    </div>

                    <div className="cart-item-quantity">
                      <span className="mobile-label">Số lượng:</span>
                      <Space.Compact className="quantity-controls">
                        <Button
                          size="small"
                          icon={<MinusOutlined />}
                          onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || updatingItems.has(item.id)}
                        />
                        <InputNumber
                          size="small"
                          min={1}
                          max={item.book.stock}
                          value={item.quantity}
                          onChange={(value) => value && updateItemQuantity(item.id, value)}
                          disabled={updatingItems.has(item.id)}
                          className="quantity-input"
                        />
                        <Button
                          size="small"
                          icon={<PlusOutlined />}
                          onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.book.stock || updatingItems.has(item.id)}
                        />
                      </Space.Compact>
                    </div>

                    <div className="cart-item-total">
                      <span className="mobile-label">Thành tiền:</span>
                      <Text strong className="total-price">
                        {(parseFloat(item.book.price) * item.quantity).toLocaleString('vi-VN')}đ
                      </Text>
                    </div>

                    <div className="cart-item-actions">
                      <Popconfirm
                        title="Xóa sản phẩm"
                        description="Bạn có chắc chắn muốn xóa sản phẩm này?"
                        onConfirm={() => removeItems([item.id])}
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
                  <Text>{selectedItems.length}</Text>
                </div>

                <div className="cart-summary-row">
                  <Text>Voucher đã dùng:</Text>
                  <Text>{voucherCode ? voucherCode : 'Không có'}</Text>
                </div>

                <Divider />

                <div className="cart-summary-row cart-total">
                  <Text strong>Tổng số tiền:</Text>
                  <Text strong className="cart-total-price">
                    {calculateTotal().toLocaleString('vi-VN')}đ
                  </Text>
                </div>

                <Button
                  type="primary"
                  size="large"
                  block
                  className="cart-checkout-btn"
                  disabled={selectedItems.length === 0}
                  onClick={() => {
                    message.info('Chức năng thanh toán đang được phát triển');
                  }}
                >
                  Mua hàng ({selectedItems.length} sản phẩm)
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