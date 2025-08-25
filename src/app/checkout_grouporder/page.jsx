'use client';
import {
    ClockCircleOutlined,
    CreditCardOutlined,
    DownloadOutlined,
    QrcodeOutlined,
    UsergroupAddOutlined,
    UserOutlined,
} from '@ant-design/icons';
import {
    Alert,
    Button,
    Card,
    Col,
    Divider,
    Form,
    Input,
    message,
    Radio,
    Row,
    Select,
    Spin,
    Tag,
    Typography,
} from 'antd';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { apiGetDistricts, apiGetProvinces, apiGetShippingFee, apiGetWardsByDistrict } from '../../../apis/ghtk';
import { apiSendOtp } from '../../../apis/user';
import './CheckoutPage.css';

const { Title, Text } = Typography;
const { Option } = Select;

const GroupCheckoutPageContent = () => {
    const [form] = Form.useForm();
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const router = useRouter();
    const { useSearchParams } = require('next/navigation');
    const searchParams = useSearchParams();

    // Group order states
    const [groupOrderData, setGroupOrderData] = useState(null);
    const [groupToken, setGroupToken] = useState('');

    // Address states
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

    // Get group order token from URL
    useEffect(() => {
        try {
            const token = localStorage.getItem('group_cart_token');
            if (token) {
                setGroupToken(token);
                fetchGroupOrderData(token);
            } else {
                message.error('Không tìm thấy thông tin giỏ hàng nhóm');
                router.push('/');
            }
        } catch (error) {
            console.error('Error getting group token:', error);
            router.push('/');
        } finally {
            setLoading(false);
        }
    }, [searchParams, router]);

    // Fetch group order data
    const fetchGroupOrderData = async (token) => {
        try {
            const response = await axios.get(`http://localhost:8000/api/group-orders/${token}`);
            setGroupOrderData(response.data);
            console.log('Group order data:', response.data);
        } catch (error) {
            console.error('Error fetching group order:', error);
            message.error('Không thể tải thông tin giỏ hàng nhóm');
        }
    };

    // Calculate total from group order data
    const calculateGroupTotal = () => {
        if (!groupOrderData || !groupOrderData.by_member) return 0;
        return Object.values(groupOrderData.by_member).reduce((total, member) => {
            return total + (member.subtotal || 0);
        }, 0);
    };

    const subtotal = calculateGroupTotal();
    const total = subtotal + shippingFee;

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
                (district) => district.ProvinceID === selectedProvince.ProvinceID,
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
        const province = provinces.find((p) => p.ProvinceID === value);
        setSelectedProvince(province);
    };

    const handleDistrictChange = (value) => {
        const district = districts.find((d) => d.DistrictID === value);
        setSelectedDistrict(district);
    };

    const handleWardChange = (value) => {
        const ward = wards.find((w) => w.WardCode === value);
        setSelectedWard(ward);
    };

    const createZaloPayOrder = async (amount) => {
        try {
            const response = await axios.post('http://localhost:8000/api/orders/zalopay/create-order', {
                amount: amount,
                description: 'Thanh toán đơn hàng nhóm',
            });

            if (response.data.success) {
                window.open(response.data.order_url, '_blank');
                localStorage.setItem('zp_trans_token', response.data.zp_trans_token);
                localStorage.setItem('app_trans_id', response.data.app_trans_id);
                message.success('Đã tạo đơn hàng ZaloPay thành công!');
                return response.data;
            } else {
                throw new Error(response.data.return_message || 'Tạo đơn hàng thất bại');
            }
        } catch (error) {
            console.error('ZaloPay Error:', error);
            message.error('Không thể tạo đơn hàng ZaloPay: ' + error.message);
            throw error;
        }
    };

    const sendGroupOrderSuccessEmail = async (orderResult, customerInfo) => {
        try {
            console.log('📧 [EMAIL] Sending group order success email...');

            const orderData = {
                name: customerInfo.fullName,
                phone: customerInfo.phone,
                order_id: orderResult.data?.order_id,
                order_code: orderResult.data?.order_code,
                total_amount: orderResult.data?.total_price,
                group_order_id: orderResult.data?.group_order_id,
                items_count: orderResult.data?.items_count,
                total_quantity: orderResult.data?.total_quantity,
                address: `${selectedWard?.WardName || ''}, ${selectedDistrict?.DistrictName || ''}, ${
                    selectedProvince?.ProvinceName || ''
                }`,
                payment_method:
                    paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Thanh toán online qua ZaloPay',
            };

            await apiSendOtp(customerInfo.email, 'group_order_success', orderData);
            console.log('📧 [EMAIL] Group order success email sent successfully');
        } catch (error) {
            console.error('📧 [EMAIL] Error sending group order success email:', error);
        }
    };

    const handlePaymentMethodChange = (e) => {
        const selectedMethod = e.target.value;
        setPaymentMethod(selectedMethod);
        console.log('Payment method changed to:', selectedMethod);
    };

    const handleSubmit = async (values) => {
        const token = localStorage.getItem('token');

        if (!groupOrderData || !groupToken) {
            message.error('Không có thông tin giỏ hàng nhóm');
            return;
        }

        if (!selectedProvince || !selectedDistrict || !selectedWard) {
            message.error('Vui lòng chọn đầy đủ địa chỉ giao hàng');
            return;
        }

        setIsSubmitting(true);
        const totalOrderPrice = total;

        try {
            const orderData = {
                sonha: values.houseNumber || '',
                street: values.street || '',
                district_id: selectedDistrict.DistrictID,
                ward_id: selectedWard.WardCode,
                ward_name: selectedWard.WardName,
                district_name: selectedDistrict.DistrictName,
                payment: paymentMethod,
                shipping_fee: shippingFee,
                note: values.note,
                customer_name: values.fullName,
                customer_phone: values.phone,
            };

            if (paymentMethod === 'cod') {
                console.log('🛒 [COD] Processing Group Order COD checkout');

                const response = await fetch(`http://localhost:8000/api/group-orders/${groupToken}/checkout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(orderData),
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || `HTTP error! status: ${response.status}`);
                }

                if (result.success === true) {
                    console.log('🛒 [COD] Group order created successfully - Sending email');

                    // Send success email
                    await sendGroupOrderSuccessEmail(result, {
                        fullName: values.fullName,
                        email: values.email,
                        phone: values.phone,
                    });

                    message.success('Checkout giỏ hàng nhóm thành công! Email xác nhận đã được gửi.');

                    // Clear any cart data
                    window.updateCartCount?.();
                    window.dispatchEvent(new CustomEvent('cartUpdated'));
                    form.resetFields();
                    toast.success('Checkout giỏ hàng nhóm thành công!');

                    // Redirect to order success or group order page
                    router.push(`/group-orders/${groupToken}?success=true`);
                } else {
                    throw new Error(result.message || 'Checkout thất bại');
                }
            } else if (paymentMethod === 'credit_card') {
                console.log('🛒 [ZALOPAY] Starting ZaloPay payment flow for group order');

                const paymentStateBeforePayment = {
                    groupToken,
                    orderData: { ...orderData },
                    customerInfo: {
                        fullName: values.fullName,
                        email: values.email,
                        phone: values.phone,
                    },
                };

                try {
                    const zaloPayResult = await createZaloPayOrder(totalOrderPrice);
                    console.log('🛒 [ZALOPAY] ZaloPay order created for group order:', zaloPayResult);

                    if (!zaloPayResult || !zaloPayResult.success) {
                        throw new Error('Không thể tạo thanh toán ZaloPay');
                    }

                    toast.success('Thanh toán ZaloPay đã được tạo! Vui lòng quét mã QR để thanh toán.');

                    const paymentInfo = {
                        paymentState: paymentStateBeforePayment,
                        timestamp: Date.now(),
                        totalOrderPrice: totalOrderPrice,
                        app_trans_id: zaloPayResult?.app_trans_id,
                        type: 'group_order',
                    };
                    localStorage.setItem('pending_group_zaloPay_payment', JSON.stringify(paymentInfo));

                    let checkAttempts = 0;
                    const maxAttempts = 60;
                    const checkInterval = 5000;
                    let statusCheckInterval;

                    const checkPaymentStatus = async () => {
                        try {
                            checkAttempts++;
                            const appTransId = zaloPayResult?.app_trans_id;

                            console.log('🛒 [ZALOPAY] Checking group order payment status, attempt:', checkAttempts);

                            if (!appTransId) {
                                console.error('🛒 [ZALOPAY] No app_trans_id found for group order');
                                toast.error('Không tìm thấy thông tin giao dịch. Vui lòng thử lại.');
                                return;
                            }

                            const statusResponse = await axios.post(
                                'http://localhost:8000/api/orders/zalopay/check-status',
                                {
                                    app_trans_id: appTransId,
                                },
                            );

                            const data = statusResponse.data;
                            console.log(`🛒 [ZALOPAY] Group order status check (attempt ${checkAttempts}):`, data);

                            if (data.return_code === 1) {
                                console.log(
                                    '🛒 [ZALOPAY] Group order payment successful - Creating order and sending email',
                                );

                                if (statusCheckInterval) {
                                    clearInterval(statusCheckInterval);
                                }

                                try {
                                    const storedPaymentInfo = JSON.parse(
                                        localStorage.getItem('pending_group_zaloPay_payment') || '{}',
                                    );
                                    const storedOrderData = storedPaymentInfo.paymentState?.orderData || orderData;
                                    const storedCustomerInfo = storedPaymentInfo.paymentState?.customerInfo;
                                    const storedGroupToken = storedPaymentInfo.paymentState?.groupToken || groupToken;

                                    const orderResponse = await fetch(
                                        `http://localhost:8000/api/group-orders/${storedGroupToken}/checkout`,
                                        {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                Authorization: `Bearer ${token}`,
                                            },
                                            body: JSON.stringify(storedOrderData),
                                        },
                                    );

                                    const orderResult = await orderResponse.json();

                                    if (!orderResponse.ok || !orderResult.success) {
                                        throw new Error(
                                            orderResult.message ||
                                                'Không thể tạo đơn hàng nhóm sau khi thanh toán thành công',
                                        );
                                    }

                                    console.log('🛒 [ZALOPAY] Group order created successfully - Sending email');

                                    // Send success email for ZaloPay group order
                                    if (storedCustomerInfo) {
                                        await sendGroupOrderSuccessEmail(orderResult, storedCustomerInfo);
                                    }

                                    localStorage.removeItem('pending_group_zaloPay_payment');
                                    localStorage.removeItem('app_trans_id');

                                    toast.success(
                                        'ZaloPay: Thanh toán thành công! Đơn hàng nhóm đã được tạo và email đã được gửi.',
                                    );
                                    window.updateCartCount?.();
                                    window.dispatchEvent(new CustomEvent('cartUpdated'));
                                    form.resetFields();

                                    router.push(`/group-orders/${storedGroupToken}?success=true`);
                                } catch (orderError) {
                                    console.error(
                                        '🛒 [ZALOPAY] Error creating group order after successful payment:',
                                        orderError,
                                    );
                                    toast.error(
                                        'Thanh toán thành công nhưng không thể tạo đơn hàng nhóm. Vui lòng liên hệ hỗ trợ.',
                                    );
                                    localStorage.removeItem('pending_group_zaloPay_payment');
                                    localStorage.removeItem('app_trans_id');
                                }
                            } else if (data.return_code === 2) {
                                console.log('🛒 [ZALOPAY] Group order payment failed');

                                if (statusCheckInterval) {
                                    clearInterval(statusCheckInterval);
                                }

                                toast.error('ZaloPay: Thanh toán thất bại. Vui lòng thử lại.');
                                localStorage.removeItem('pending_group_zaloPay_payment');
                                localStorage.removeItem('app_trans_id');
                            } else if (data.return_code === 3) {
                                console.log('🛒 [ZALOPAY] Group order payment pending');

                                if (checkAttempts >= maxAttempts) {
                                    if (statusCheckInterval) {
                                        clearInterval(statusCheckInterval);
                                    }
                                    toast.info('ZaloPay: Giao dịch chưa hoàn thành. Vui lòng kiểm tra lại sau.');
                                }
                            }
                        } catch (checkErr) {
                            console.error('🛒 [ZALOPAY] Error checking group order payment status:', checkErr);

                            if (checkAttempts >= maxAttempts) {
                                if (statusCheckInterval) {
                                    clearInterval(statusCheckInterval);
                                }
                                toast.error('Không thể kiểm tra trạng thái thanh toán. Vui lòng liên hệ hỗ trợ.');
                            }
                        }
                    };

                    await checkPaymentStatus();
                    statusCheckInterval = setInterval(checkPaymentStatus, checkInterval);
                } catch (zaloPayError) {
                    console.error('🛒 [ZALOPAY] Error creating ZaloPay order for group:', zaloPayError);
                    message.error('Lỗi khi tạo thanh toán ZaloPay. Vui lòng thử lại.');
                    localStorage.removeItem('pending_group_zaloPay_payment');
                    return;
                }
            }
        } catch (error) {
            console.error('🛒 [ERROR] Group order error:', error);
            message.error(error.message || 'Checkout thất bại. Vui lòng thử lại!');
            toast.error(error.message || 'Checkout thất bại. Vui lòng thử lại!');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Get all items from group order
    const getAllGroupItems = () => {
        if (!groupOrderData || !groupOrderData.by_member) return [];

        const allItems = [];
        Object.values(groupOrderData.by_member).forEach((member) => {
            if (member.items) {
                member.items.forEach((item) => allItems.push(item));
            }
        });
        return allItems;
    };

    const groupItems = getAllGroupItems();

    if (loading) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '400px',
                }}
            >
                <Spin size="large" />
            </div>
        );
    }

    if (!groupOrderData) {
        return (
            <div className="checkout-container">
                <div style={{ textAlign: 'center', padding: '50px', minHeight: '400px' }}>
                    <Title level={3}>Không tìm thấy giỏ hàng nhóm</Title>
                    <Text>Vui lòng kiểm tra lại đường link hoặc liên hệ với chủ nhóm.</Text>
                </div>
            </div>
        );
    }

    const totalWithShipping = subtotal + shippingFee;

    return (
        <div className="checkout-container">
            <div className="checkout-content">
                <Row gutter={24}>
                    <Col xs={24} lg={16}>
                        <div className="checkout-form-section">
                            <Title level={3} className="section-title">
                                <UsergroupAddOutlined /> Checkout Giỏ Hàng Nhóm
                            </Title>

                            {/* Group Info Card */}
                            <Card className="form-card">
                                <Title level={4} className="card-title">
                                    <UsergroupAddOutlined /> Thông tin nhóm
                                </Title>
                                <Alert
                                    message="Đơn hàng nhóm"
                                    description={`Bạn đang checkout cho nhóm có ${
                                        groupOrderData.members?.length || 0
                                    } thành viên. Tất cả sản phẩm sẽ được giao đến một địa chỉ duy nhất.`}
                                    type="info"
                                    showIcon
                                    style={{ marginBottom: 16 }}
                                />
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Text strong>Thành viên: </Text>
                                        <Tag color="blue">
                                            <UserOutlined /> {groupOrderData.members?.length || 0} người
                                        </Tag>
                                    </Col>
                                    <Col span={12}>
                                        <Text strong>Trạng thái: </Text>
                                        <Tag color={groupOrderData.status === 'open' ? 'green' : 'orange'}>
                                            {groupOrderData.status === 'open' ? 'Đang mở' : groupOrderData.status}
                                        </Tag>
                                    </Col>
                                </Row>
                                {groupOrderData.expires_at && (
                                    <div style={{ marginTop: 8 }}>
                                        <Text type="secondary">
                                            <ClockCircleOutlined /> Hết hạn:{' '}
                                            {new Date(groupOrderData.expires_at).toLocaleString('vi-VN')}
                                        </Text>
                                    </div>
                                )}
                            </Card>

                            <Card className="form-card">
                                <Title level={4} className="card-title">
                                    Địa chỉ nhận hàng
                                </Title>
                                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                                    <Row gutter={16}>
                                        <Col xs={24} md={8}>
                                            <Form.Item
                                                label="Họ và tên"
                                                name="fullName"
                                                rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                                            >
                                                <Input placeholder="Nhập họ và tên" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={8}>
                                            <Form.Item
                                                label="Số điện thoại"
                                                name="phone"
                                                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                                            >
                                                <Input placeholder="Nhập số điện thoại" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={8}>
                                            <Form.Item
                                                label="Email"
                                                name="email"
                                                rules={[
                                                    { required: true, message: 'Vui lòng nhập email' },
                                                    { type: 'email', message: 'Email không hợp lệ' },
                                                ]}
                                            >
                                                <Input placeholder="Nhập email để nhận thông báo đơn hàng" />
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
                                            <Form.Item
                                                label="Tỉnh/Thành Phố"
                                                name="province"
                                                rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố' }]}
                                            >
                                                <Select
                                                    placeholder="Chọn tỉnh/thành phố"
                                                    loading={isLoadingProvinces}
                                                    onChange={handleProvinceChange}
                                                    showSearch
                                                    filterOption={(input, option) =>
                                                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                    }
                                                >
                                                    {provinces.map((province) => (
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
                                            <Form.Item
                                                label="Quận/Huyện"
                                                name="district"
                                                rules={[{ required: true, message: 'Vui lòng chọn quận/huyện' }]}
                                            >
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
                                                    {districts.map((district) => (
                                                        <Option key={district.DistrictID} value={district.DistrictID}>
                                                            {district.DistrictName}
                                                        </Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                label="Phường/Xã/Thị Trấn"
                                                name="ward"
                                                rules={[{ required: true, message: 'Vui lòng chọn phường/xã' }]}
                                            >
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
                                                    {wards.map((ward) => (
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

                            <Card className="form-card">
                                <Title level={4} className="card-title">
                                    <DownloadOutlined /> Sản phẩm nhóm ({groupItems.length} sản phẩm)
                                </Title>

                                {/* Display members and their items */}
                                {groupOrderData.members &&
                                    groupOrderData.members.map((member) => {
                                        const memberItems = groupOrderData.by_member[member.id]?.items || [];
                                        const memberSubtotal = groupOrderData.by_member[member.id]?.subtotal || 0;

                                        return (
                                            <div
                                                key={member.id}
                                                style={{
                                                    marginBottom: 20,
                                                    border: '1px solid #f0f0f0',
                                                    borderRadius: 8,
                                                    padding: 16,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        marginBottom: 12,
                                                    }}
                                                >
                                                    <div>
                                                        <Text strong>{member.name}</Text>
                                                        {member.role === 'owner' && (
                                                            <Tag color="gold" style={{ marginLeft: 8 }}>
                                                                Chủ nhóm
                                                            </Tag>
                                                        )}
                                                    </div>
                                                    <Text strong style={{ color: '#52c41a' }}>
                                                        {memberSubtotal.toLocaleString('vi-VN')}đ
                                                    </Text>
                                                </div>

                                                {memberItems.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="product-item"
                                                        style={{ marginBottom: 8 }}
                                                    >
                                                        <div className="product-details">
                                                            <Text strong className="product-name">
                                                                {item.title}
                                                            </Text>
                                                            <Text className="product-quantity">
                                                                Số lượng: {item.qty}
                                                            </Text>
                                                        </div>
                                                        <div className="product-price">
                                                            <Text strong>
                                                                {parseFloat(item.price).toLocaleString('vi-VN')}đ
                                                            </Text>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })}

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
                                                ) : shippingFee > 0 ? (
                                                    `${shippingFee.toLocaleString()}đ`
                                                ) : (
                                                    'Chưa xác định'
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
                                                    : 'Địa điểm chưa xác định'}
                                            </Text>
                                        </Text>
                                        {shippingService !== 'Chưa xác định' && (
                                            <div style={{ marginTop: 8 }}>
                                                <Text>
                                                    Dịch vụ: <Text className="highlight">{shippingService}</Text>
                                                </Text>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>

                            <Card className="form-card">
                                <Title level={4} className="card-title">
                                    Chọn phương thức thanh toán
                                </Title>
                                <Radio.Group
                                    value={paymentMethod}
                                    onChange={handlePaymentMethodChange}
                                    className="payment-methods"
                                >
                                    <div className="payment-option">
                                        <Radio value="cod" className="payment-radio">
                                            <div className="payment-content">
                                                <CreditCardOutlined className="payment-icon" />
                                                <div>
                                                    <Text strong>Thanh toán khi nhận hàng</Text>
                                                    <br />
                                                    <Text className="payment-desc">Thanh toán khi nhận hàng (COD)</Text>
                                                </div>
                                            </div>
                                        </Radio>
                                    </div>
                                    <div className="payment-option">
                                        <Radio value="credit_card" className="payment-radio">
                                            <div className="payment-content">
                                                <QrcodeOutlined className="payment-icon" />
                                                <div>
                                                    <Text strong>Quét QR CODE</Text>
                                                    <br />
                                                    <Text className="payment-desc">Thanh toán qua ZaloPay</Text>
                                                </div>
                                            </div>
                                        </Radio>
                                    </div>
                                </Radio.Group>
                            </Card>
                        </div>
                    </Col>

                    <Col xs={24} lg={8}>
                        <div className="order-summary-section">
                            <Card className="summary-card">
                                <Title level={4} className="card-title">
                                    <UsergroupAddOutlined /> Thông tin thanh toán nhóm
                                </Title>

                                <div className="summary-row">
                                    <Text>Số thành viên</Text>
                                    <Text>{groupOrderData.members?.length || 0} người</Text>
                                </div>

                                <div className="summary-row">
                                    <Text>Tổng sản phẩm</Text>
                                    <Text>{groupItems.reduce((sum, item) => sum + (item.qty || 1), 0)} sản phẩm</Text>
                                </div>

                                <div className="summary-row">
                                    <Text>Tổng tiền hàng</Text>
                                    <Text>{subtotal.toLocaleString('vi-VN')}đ</Text>
                                </div>

                                <div className="summary-row">
                                    <Text>Phí vận chuyển</Text>
                                    <Text className="highlight">
                                        {isLoadingShippingFee ? (
                                            <Spin size="small" />
                                        ) : shippingFee > 0 ? (
                                            `${shippingFee.toLocaleString()}đ`
                                        ) : (
                                            'Chưa xác định'
                                        )}
                                    </Text>
                                </div>

                                <Divider />

                                <div className="summary-row total-row">
                                    <Text strong>Tổng cộng</Text>
                                    <Text strong className="total-price">
                                        {totalWithShipping.toLocaleString('vi-VN')}đ
                                    </Text>
                                </div>

                                <Alert
                                    message="Lưu ý đơn hàng nhóm"
                                    description="Đây là đơn hàng nhóm. Tất cả sản phẩm sẽ được giao đến một địa chỉ duy nhất. Vui lòng phối hợp với các thành viên khác để nhận hàng."
                                    type="warning"
                                    showIcon
                                    style={{ marginBottom: 16, fontSize: 12 }}
                                />

                                <Button
                                    type="primary"
                                    size="large"
                                    className="checkout-btn"
                                    block
                                    loading={isSubmitting}
                                    onClick={() => form.submit()}
                                    disabled={!groupOrderData || groupItems.length === 0}
                                >
                                    {isSubmitting ? 'Đang xử lý...' : 'Checkout Giỏ Hàng Nhóm'}
                                </Button>
                            </Card>

                            {/* Group members info */}
                            <Card className="summary-card" style={{ marginTop: 16 }}>
                                <Title level={5} className="card-title">
                                    <UserOutlined /> Thành viên nhóm
                                </Title>
                                {groupOrderData.members &&
                                    groupOrderData.members.map((member) => (
                                        <div
                                            key={member.id}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '8px 0',
                                                borderBottom: '1px solid #f0f0f0',
                                            }}
                                        >
                                            <div>
                                                <Text strong>{member.name}</Text>
                                                {member.role === 'owner' && (
                                                    <Tag color="gold" size="small" style={{ marginLeft: 4 }}>
                                                        Chủ nhóm
                                                    </Tag>
                                                )}
                                            </div>
                                            <Text style={{ color: '#52c41a' }}>
                                                {(groupOrderData.by_member[member.id]?.subtotal || 0).toLocaleString(
                                                    'vi-VN',
                                                )}
                                                đ
                                            </Text>
                                        </div>
                                    ))}
                            </Card>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default GroupCheckoutPageContent;
