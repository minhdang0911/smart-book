'use client'
import React, { useState, useContext, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Radio,
  Divider,
  Typography,
  Space,
  Row,
  Col,
  Image,
  Alert,
  message,
  Spin
} from 'antd';
import {
  ShoppingCartOutlined,
  BellOutlined,
  UserOutlined,
  CreditCardOutlined,
  QrcodeOutlined,
  BankOutlined,
  WalletOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import './CheckoutPage.css';
import './responsive.css';
import { CartContext } from '../../app/contexts/CartContext';
import {
  apiGetProvinces,
  apiGetDistricts,
  apiGetWardsByDistrict,
  apiGetShippingFee
} from '../../../apis/ghtk';
import { toast } from 'react-toastify';
import { useRouter, useSearchParams } from 'next/navigation';

const { Title, Text } = Typography;
const { Option } = Select;

const CheckoutPage = () => {
  const [form] = Form.useForm();
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const { cartData, selectedItems, calculateTotal, clearCart } = useContext(CartContext);
  const [checkoutData, setCheckoutData] = useState(null);

const searchParams = useSearchParams();
  const router = useRouter();

  // States for address data
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [shippingFee, setShippingFee] = useState(0);
  const [shippingService, setShippingService] = useState('Chưa xác định');

  // Loading states
  const [isLoadingShippingFee, setIsLoadingShippingFee] = useState(false);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
   const [loading, setLoading] = useState(true);

  console.log(cartData)

  // Get actual cart data
  const getSelectedCartItems = () => {
    if (!cartData || !selectedItems || selectedItems.length === 0) {
      return [];
    }

    // Giả sử bạn lấy từ "items" (trong response trả về)
    return cartData.items.filter(item => selectedItems.includes(item.id));
  };


  const selectedCartItems = getSelectedCartItems();
  const subtotal = calculateTotal ? calculateTotal() : 0;
  const total = subtotal + shippingFee;

  // API functions for getting district and ward names by ID
  const getDistrictNameById = async (districtId) => {
    try {
      const districts = await apiGetDistricts();
      const district = districts.find(d => d.DistrictID === districtId);
      return district ? district.DistrictName : 'Unknown District';
    } catch (error) {
      console.error('Error getting district name:', error);
      return 'Unknown District';
    }
  };

  useEffect(() => {
    try {
      // Lấy dữ liệu từ URL params
      const dataParam = searchParams.get('data');

      if (dataParam) {
        const data = JSON.parse(decodeURIComponent(dataParam));
        console.log('Received checkout data:', data);
        setCheckoutData(data);
      } else {
        // Không có dữ liệu, redirect về cart
        message.warning('Không có thông tin đơn hàng. Vui lòng thử lại.');
        router.push('/cart');
        return;
      }
    } catch (error) {
      console.error('Error parsing checkout data:', error);
      message.error('Dữ liệu không hợp lệ. Vui lòng thử lại.');
      router.push('/cart');
      return;
    } finally {
      setLoading(false);
    }
  }, [searchParams, router]);

  console.log(checkoutData)

  const getWardNameById = async (wardId) => {
    try {
      if (!selectedDistrict) return 'Unknown Ward';
      const wards = await apiGetWardsByDistrict(selectedDistrict.DistrictID);
      const ward = wards.find(w => w.WardCode === wardId);
      return ward ? ward.WardName : 'Unknown Ward';
    } catch (error) {
      console.error('Error getting ward name:', error);
      return 'Unknown Ward';
    }
  };

  // Load provinces on component mount
  useEffect(() => {
    loadProvinces();
  }, []);

  // Load districts when province changes
  useEffect(() => {
    if (selectedProvince) {
      loadDistricts();
      setSelectedDistrict(null);
      setSelectedWard(null);
      setWards([]);
      setShippingFee(0);
      form.setFieldsValue({ district: undefined, ward: undefined });
    }
  }, [selectedProvince]);

  // Load wards when district changes
  useEffect(() => {
    if (selectedDistrict) {
      loadWards(selectedDistrict.DistrictID);
      setSelectedWard(null);
      setShippingFee(0);
      form.setFieldsValue({ ward: undefined });
    }
  }, [selectedDistrict]);

  // Calculate shipping fee when ward changes
  useEffect(() => {
    if (selectedProvince && selectedDistrict && selectedWard) {
      calculateShippingFee();
    }
  }, [selectedWard]);

  const loadProvinces = async () => {
    setIsLoadingProvinces(true);
    try {
      const provincesData = await apiGetProvinces();
      setProvinces(provincesData || []);
    } catch (error) {
      message.error('Không thể tải danh sách tỉnh/thành phố');
    } finally {
      setIsLoadingProvinces(false);
    }
  };

  const loadDistricts = async () => {
    setIsLoadingDistricts(true);
    try {
      const districtsData = await apiGetDistricts();
      const filteredDistricts = districtsData.filter(
        district => district.ProvinceID === selectedProvince.ProvinceID
      );
      setDistricts(filteredDistricts || []);
    } catch (error) {
      message.error('Không thể tải danh sách quận/huyện');
    } finally {
      setIsLoadingDistricts(false);
    }
  };

  const loadWards = async (districtId) => {
    setIsLoadingWards(true);
    try {
      const wardsData = await apiGetWardsByDistrict(districtId);
      setWards(wardsData || []);
    } catch (error) {
      message.error('Không thể tải danh sách phường/xã');
    } finally {
      setIsLoadingWards(false);
    }
  };

  const calculateShippingFee = async () => {
    setIsLoadingShippingFee(true);
    try {
      const shippingData = await apiGetShippingFee({
        fromDistrictId: 1542,
        toDistrictId: selectedDistrict.DistrictID,
        toWardCode: selectedWard.WardCode,
        serviceTypeId: 2,
        weight: 500,
        length: 20,
        width: 15,
        height: 10,
      });

      if (shippingData && shippingData.data) {
        setShippingFee(shippingData.data.total || 0);
        setShippingService(shippingData.data.service_type_name || 'Giao hàng tiêu chuẩn');
        message.success('Đã tính phí vận chuyển thành công');
      } else {
        setShippingFee(0);
        setShippingService('Không thể tính phí');
        message.warning('Không thể tính phí vận chuyển cho địa chỉ này');
      }
    } catch (error) {
      message.error('Lỗi khi tính phí vận chuyển');
      setShippingFee(0);
      setShippingService('Lỗi tính phí');
    } finally {
      setIsLoadingShippingFee(false);
    }
  };

  const handleProvinceChange = (value) => {
    const province = provinces.find(p => p.ProvinceID === value);
    setSelectedProvince(province);
  };

  const handleDistrictChange = (value) => {
    const district = districts.find(d => d.DistrictID === value);
    setSelectedDistrict(district);
  };

  const handleWardChange = (value) => {
    const ward = wards.find(w => w.WardCode === value);
    setSelectedWard(ward);
  };
  const handleSubmit = async (values) => {
    const token = localStorage.getItem('token');

    if (selectedCartItems.length === 0) {
      message.error('Không có sản phẩm nào được chọn');
      return;
    }

    if (!selectedProvince || !selectedDistrict || !selectedWard) {
      message.error('Vui lòng chọn đầy đủ địa chỉ giao hàng');
      return;
    }

    setIsSubmitting(true);
    const priceOrder = checkoutData?.totalAmount + shippingFee; // cả 2 đều là số



    try {
      // Prepare order data
      const orderData = {
        address: `${values.houseNumber || ''}, ${values.street || ''}, ${selectedWard.WardName}, ${selectedDistrict.DistrictName}, ${selectedProvince.ProvinceName}`.replace(/^,\s*/, ''), 
        sonha: values.houseNumber || '',
        street: values.street || '',
        district_id: selectedDistrict.DistrictID,
        ward_id: selectedWard.WardCode,
        district_name: selectedDistrict.DistrictName,
        ward_name: selectedWard.WardName,
        card_id: 1,
        payment: paymentMethod,
        cart_item_ids: selectedItems || [],
        shipping_fee: shippingFee,
        total_price: priceOrder,
        note: values.note,
        price:checkoutData?.totalAmount

      };

      console.log('Submitting order data:', orderData);

      // Call the API
      const response = await fetch('http://localhost:8000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      // Parse the JSON response
      const result = await response.json();

      // Check if the request was successful
      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      // Check the success flag from the API response
      if (result.success === true) {
        // Success notifications
        message.success('Đặt hàng thành công!');
        toast.success('Đặt hàng thành công!');
        window.updateCartCount?.();
        window.dispatchEvent(new CustomEvent('cartUpdated'));

        console.log('Order created successfully:', result);
        console.log('Order ID:', result.order_id);

        // Clear cart after successful order
        if (clearCart) {
          clearCart();
        }

        // Reset form
        form.resetFields();

        // Optional: Redirect to order confirmation page
        // navigate(`/order-confirmation/${result.order_id}`);

      } else {
        // API returned success: false
        throw new Error(result.message || 'Đặt hàng thất bại');
      }

    } catch (error) {
      console.error('Error creating order:', error);

      // Error notifications
      message.error(error.message || 'Đặt hàng thất bại. Vui lòng thử lại!');
      toast.error(error.message || 'Đặt hàng thất bại. Vui lòng thử lại!');

    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if cart is empty
  if (!selectedCartItems || selectedCartItems.length === 0) {
    return (
      <div className="checkout-container">
        <div style={{ textAlign: 'center', padding: '50px', minHeight: '400px' }}>
          <Title level={3}>Giỏ hàng trống</Title>
          <Text>Vui lòng thêm sản phẩm vào giỏ hàng để thanh toán.</Text>
        </div>
      </div>
    );
  }
 

  return (
    <div className="checkout-container">

      <div className="checkout-content">
        <Row gutter={24}>
          {/* Left Column - Checkout Form */}
          <Col xs={24} lg={16}>
            <div className="checkout-form-section">
              <Title level={3} className="section-title">Xác nhận thanh toán</Title>

              {/* Delivery Address */}
              <Card className="form-card">
                <Title level={4} className="card-title">Địa chỉ nhận hàng</Title>
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                  <Row gutter={16}>
                    <Col xs={24} md={8}>
                      <Form.Item label="Họ và tên" name="fullName" rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}>
                        <Input placeholder="Nhập họ và tên" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
                        <Input placeholder="Nhập số điện thoại" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item label="Email" name="email" rules={[{ type: 'email', message: 'Email không hợp lệ' }]}>
                        <Input placeholder="Nhập email" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} md={8}>
                      <Form.Item label="Số nhà" name="houseNumber">
                        <Input placeholder="Nhập số nhà" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item label="Tên đường" name="street">
                        <Input placeholder="Nhập tên đường" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item label="Tỉnh/Thành Phố" name="province" rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố' }]}>
                        <Select
                          placeholder="Chọn tỉnh/thành phố"
                          loading={isLoadingProvinces}
                          onChange={handleProvinceChange}
                          showSearch
                          filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                        >
                          {provinces.map(province => (
                            <Option key={province.ProvinceID} value={province.ProvinceID}>
                              {province.ProvinceName}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item label="Quận/Huyện" name="district" rules={[{ required: true, message: 'Vui lòng chọn quận/huyện' }]}>
                        <Select
                          placeholder="Chọn quận/huyện"
                          loading={isLoadingDistricts}
                          onChange={handleDistrictChange}
                          disabled={!selectedProvince}
                          showSearch
                          filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                        >
                          {districts.map(district => (
                            <Option key={district.DistrictID} value={district.DistrictID}>
                              {district.DistrictName}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label="Phường/Xã/Thị Trấn" name="ward" rules={[{ required: true, message: 'Vui lòng chọn phường/xã' }]}>
                        <Select
                          placeholder="Chọn phường/xã"
                          loading={isLoadingWards}
                          onChange={handleWardChange}
                          disabled={!selectedDistrict}
                          showSearch
                          filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                        >
                          {wards.map(ward => (
                            <Option key={ward.WardCode} value={ward.WardCode}>
                              {ward.WardName}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item label="Ghi chú" name="note">
                    <Input.TextArea rows={3} placeholder="Nhập ghi chú (không bắt buộc)" />
                  </Form.Item>
                </Form>
              </Card>

              {/* Products */}
              <Card className="form-card">
                <Title level={4} className="card-title">
                  <DownloadOutlined /> Sản phẩm ({selectedCartItems.length} sản phẩm)
                </Title>
                <div className="product-section">
                  {selectedCartItems.map(item => (
                    <div key={item.id} className="product-item">
                      <Image
                        src={item.image || '/api/placeholder/80/100'}
                        alt={item.name || item.title}
                        width={60}
                        height={80}
                        className="product-image"
                        fallback="/api/placeholder/80/100"
                      />
                      <div className="product-details">
                        <Text strong className="product-name">{item.name || item.title}</Text>
                        <Text className="product-author">{item.author || item.description}</Text>
                        <Text className="product-quantity">Số lượng: {item.quantity || 1}</Text>
                      </div>
                      <div className="product-price">
                        <Text strong>{(item.price || 0).toLocaleString()}đ</Text>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="shipping-info">
                  <Row>
                    <Col span={12}>
                      <Text>Đơn vị vận chuyển</Text>
                      <br />
                      <Text>Phí vận chuyển</Text>
                    </Col>
                    <Col span={12} className="text-right">
                      <Text>Giao Hàng Nhanh</Text>
                      <br />
                      <Text>
                        {isLoadingShippingFee ? (
                          <Spin size="small" />
                        ) : (
                          shippingFee > 0 ? `${shippingFee.toLocaleString()}đ` : 'Chưa xác định'
                        )}
                      </Text>
                    </Col>
                  </Row>
                  <div className="voucher-info">
                    <Text>
                      Vận chuyển từ <Text className="highlight">Hà Nội</Text> đến{' '}
                      <Text className="highlight">
                        {selectedProvince && selectedDistrict && selectedWard
                          ? `${selectedWard.WardName}, ${selectedDistrict.DistrictName}, ${selectedProvince.ProvinceName}`
                          : 'Địa điểm chưa xác định'
                        }
                      </Text>
                    </Text>
                    {shippingService !== 'Chưa xác định' && (
                      <div style={{ marginTop: 8 }}>
                        <Text>Dịch vụ: <Text className="highlight">{shippingService}</Text></Text>
                      </div>
                    )}
                  </div>
                </div>

                <div className="total-section">
                  <Row justify="space-between" align="middle">
                    <Col>
                      <Text strong className="total-label">Tổng số tiền</Text>
                    </Col>
                    <Col>
                      <Text strong className="total-amount">
                        {total.toLocaleString()}đ
                      </Text>
                    </Col>
                  </Row>
                </div>
              </Card>

              {/* Payment Methods */}
              <Card className="form-card">
                <Title level={4} className="card-title">Chọn phương thức thanh toán</Title>
                <Radio.Group
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="payment-methods"
                >
                  <div className="payment-option">
                    <Radio value="cod" className="payment-radio">
                      <div className="payment-content">
                        <CreditCardOutlined className="payment-icon" />
                        <div>
                          <Text strong>Thanh toán khi nhận hàng</Text>
                          <br />
                          <Text className="payment-desc">Thanh toán khi nhận hàng</Text>
                        </div>
                      </div>
                    </Radio>
                  </div>

                  <div className="payment-option">
                    <Radio value="qr" className="payment-radio">
                      <div className="payment-content">
                        <QrcodeOutlined className="payment-icon" />
                        <div>
                          <Text strong>Quét QR CODE</Text>
                        </div>
                      </div>
                    </Radio>
                  </div>


                </Radio.Group>
              </Card>
            </div>
          </Col>

          {/* Right Column - Order Summary */}
          <Col xs={24} lg={8}>
            <div className="order-summary-section">
              {/* Order Summary */}
              <Card className="summary-card">
                <Title level={4} className="card-title">Thông tin thanh toán</Title>

                <div className="summary-row">
                  <Text>Số sản phẩm</Text>
                  <Text>{selectedCartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)} sản phẩm</Text>
                </div>

                <div className="summary-row">
                  <Text>Tổng tiền hàng</Text>
                  <Text>{subtotal.toLocaleString()}đ</Text>
                </div>

                <div className="summary-row">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <Text>Tạm tính:</Text>
                    <Text>{checkoutData?.totalAmount?.toLocaleString('vi-VN')}đ</Text>
                  </div>
                  <Text>Voucher </Text>
                  <Text>{checkoutData?.totalDiscount?.toLocaleString('vi-VN')}đ</Text>
                </div>

                <div className="summary-row">
                  <Text>Giảm giá vận chuyển</Text>
                  <Text>0đ</Text>
                </div>

                <div className="summary-row">
                  <Text>Phí vận chuyển</Text>
                  <Text className="highlight">
                    {isLoadingShippingFee ? (
                      <Spin size="small" />
                    ) : (
                      shippingFee > 0 ? `${shippingFee.toLocaleString()}đ` : 'Chưa xác định'
                    )}
                  </Text>
                </div>

                <Divider />

                <div className="summary-row total-row">
                  <Text strong>Tổng cộng</Text>
                  <Text strong className="total-price">
                 {(checkoutData?.totalAmount + shippingFee).toLocaleString()}đ

                  </Text>
                </div>

                <Button
                  type="primary"
                  size="large"
                  className="checkout-btn"
                  block
                  loading={isSubmitting}
                  onClick={() => form.submit()}
                  disabled={selectedCartItems.length === 0}
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}
                </Button>
              </Card>
            </div>
          </Col>
        </Row>
      </div>

    </div>
  );
};

export default CheckoutPage;