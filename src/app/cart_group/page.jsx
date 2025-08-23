'use client';
import {
    ClockCircleOutlined,
    CopyOutlined,
    LoadingOutlined,
    ShareAltOutlined,
    ShoppingCartOutlined,
    UserAddOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Alert, Button, Card, Col, Divider, Empty, Input, message, Row, Space, Spin, Tag, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import '../cart/Cart.css'; // Reuse the same CSS file

const { Title, Text, Paragraph } = Typography;

const CartGroup = () => {
    const router = useRouter();
    const [groupData, setGroupData] = useState(null);
    const [joinUrl, setJoinUrl] = useState('');
    const [timeRemaining, setTimeRemaining] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ Fetch group data from API using token from localStorage
    const fetchGroupData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get token from localStorage
            const groupToken = localStorage.getItem('group_cart_token');

            if (!groupToken) {
                throw new Error('Không tìm thấy token giỏ hàng nhóm. Vui lòng tạo giỏ hàng nhóm mới.');
            }

            console.log('Fetching group data with token:', groupToken);

            // Get authentication token
            const authToken =
                localStorage.getItem('auth_token') ||
                localStorage.getItem('access_token') ||
                localStorage.getItem('token');

            const headers = {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            };

            // Add authorization header if available
            if (authToken) {
                headers.Authorization = `Bearer ${authToken}`;
            }

            const response = await fetch(`http://localhost:8000/api/group-orders/${groupToken}`, {
                method: 'GET',
                headers: headers,
                credentials: 'include',
            });

            console.log('API Response status:', response.status);

            if (!response.ok) {
                let errorMessage = 'Không thể tải thông tin giỏ hàng nhóm';

                if (response.status === 404) {
                    errorMessage = 'Giỏ hàng nhóm không tồn tại hoặc đã hết hạn';
                } else if (response.status === 401) {
                    errorMessage = 'Bạn không có quyền truy cập giỏ hàng nhóm này';
                } else {
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.message || errorMessage;
                    } catch {
                        const errorText = await response.text();
                        errorMessage = errorText || errorMessage;
                    }
                }
                throw new Error(`${errorMessage} (${response.status})`);
            }

            const data = await response.json();
            console.log('Group data received:', data);

            // Transform API response to match component structure
            const transformedData = {
                id: groupToken, // Use token as ID for display
                join_token: groupToken,
                owner_user_id: data.members?.find((m) => m.role === 'owner')?.user_id || null,
                allow_guest: true, // Assuming default, adjust based on API
                shipping_rule: 'equal', // Assuming default, adjust based on API
                expires_at: data.expires_at,
                created_at: new Date().toISOString(), // API doesn't provide this
                status: data.status,
                members:
                    data.members?.map((member) => ({
                        id: member.id,
                        name: member.name,
                        email: member.email || '', // API doesn't provide email
                        is_owner: member.role === 'owner',
                        role: member.role,
                        user_id: member.user_id,
                        joined_at: new Date().toISOString(), // API doesn't provide this
                    })) || [],
                by_member: data.by_member || [],
                total_items: 0, // Calculate from by_member if needed
                total_amount: data.total || 0,
            };

            setGroupData(transformedData);
            setJoinUrl(data.join_url);
        } catch (error) {
            console.error('Error fetching group data:', error);
            setError(error.message);

            // Handle specific error cases
            if (error.message.includes('token')) {
                toast.error(error.message);
                // Optionally redirect back to cart
                setTimeout(() => {
                    router.push('/cart');
                }, 3000);
            } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                toast.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
            } else {
                toast.error(error.message || 'Có lỗi xảy ra khi tải giỏ hàng nhóm');
            }
        } finally {
            setLoading(false);
        }
    };

    // Calculate time remaining
    const updateTimeRemaining = () => {
        if (!groupData?.expires_at) return;

        const now = new Date();
        const expiry = new Date(groupData.expires_at);
        const diff = expiry.getTime() - now.getTime();

        if (diff > 0) {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            setTimeRemaining(`${hours}h ${minutes}m`);
        } else {
            setTimeRemaining('Đã hết hạn');
        }
    };

    // ✅ Load group data on component mount
    useEffect(() => {
        fetchGroupData();
    }, []);

    // ✅ Update time remaining periodically
    useEffect(() => {
        if (groupData?.expires_at) {
            updateTimeRemaining();
            const interval = setInterval(updateTimeRemaining, 60000); // Update every minute
            return () => clearInterval(interval);
        }
    }, [groupData?.expires_at]);

    const handleCopyJoinUrl = () => {
        if (joinUrl) {
            navigator.clipboard
                .writeText(joinUrl)
                .then(() => {
                    message.success('Đã copy đường link!');
                })
                .catch(() => {
                    message.error('Không thể copy đường link');
                });
        }
    };

    const handleShareGroup = () => {
        if (navigator.share && joinUrl) {
            navigator
                .share({
                    title: 'Tham gia giỏ hàng nhóm',
                    text: 'Tham gia cùng tôi mua hàng với giá tốt hơn!',
                    url: joinUrl,
                })
                .catch(() => {
                    // Fallback to copy
                    handleCopyJoinUrl();
                });
        } else {
            handleCopyJoinUrl();
        }
    };

    const handleBackToCart = () => {
        router.push('/cart');
    };

    const handleAddProducts = () => {
        router.push('/buybooks');
    };

    const handleRefresh = () => {
        fetchGroupData();
    };

    // ✅ Loading state
    if (loading) {
        return (
            <div className="cart-loading" style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
                <div style={{ marginTop: '16px' }}>
                    <Text>Đang tải thông tin giỏ hàng nhóm...</Text>
                </div>
            </div>
        );
    }

    // ✅ Error state
    if (error) {
        return (
            <div className="cart-container">
                <div className="cart-header">
                    <Title level={2}>
                        <UserAddOutlined /> Giỏ hàng nhóm
                    </Title>
                </div>
                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                    <Alert
                        message="Lỗi tải dữ liệu"
                        description={error}
                        type="error"
                        showIcon
                        style={{ marginBottom: '20px' }}
                        action={
                            <Space>
                                <Button size="small" onClick={handleRefresh}>
                                    Thử lại
                                </Button>
                                <Button size="small" onClick={handleBackToCart}>
                                    Quay lại giỏ hàng
                                </Button>
                            </Space>
                        }
                    />
                </div>
            </div>
        );
    }

    // ✅ No data state
    if (!groupData) {
        return (
            <div className="cart-container">
                <div className="cart-header">
                    <Title level={2}>
                        <UserAddOutlined /> Giỏ hàng nhóm
                    </Title>
                </div>
                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                    <Empty description="Không tìm thấy thông tin giỏ hàng nhóm" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                        <Space>
                            <Button onClick={handleRefresh}>Thử lại</Button>
                            <Button type="primary" onClick={handleBackToCart}>
                                Quay lại giỏ hàng
                            </Button>
                        </Space>
                    </Empty>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-container">
            <div className="cart-header">
                <Title level={2}>
                    <UserAddOutlined /> Giỏ hàng nhóm #{groupData.id}
                </Title>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <Text type="secondary">Mời bạn bè cùng mua hàng để được giá tốt hơn!</Text>
                    <Button size="small" onClick={handleRefresh} loading={loading}>
                        Làm mới
                    </Button>
                </div>
            </div>

            <Row gutter={24}>
                <Col xs={24} lg={16}>
                    {/* Group Info Card */}
                    <Card
                        className="cart-items-card"
                        title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <UserAddOutlined />
                                <span>Thông tin nhóm</span>
                                <Tag color={groupData.status === 'open' ? 'green' : 'red'}>
                                    {groupData.status === 'open' ? 'Đang mở' : 'Đã đóng'}
                                </Tag>
                            </div>
                        }
                        style={{ marginBottom: '16px' }}
                    >
                        <Row gutter={16}>
                            <Col xs={24} sm={12}>
                                <div style={{ marginBottom: '12px' }}>
                                    <Text strong>Thành viên:</Text>
                                    <Tag color="blue" style={{ marginLeft: '8px' }}>
                                        <UserOutlined /> {groupData.members.length} người
                                    </Tag>
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                    <Text strong>Thời gian còn lại:</Text>
                                    <Tag
                                        color={timeRemaining.includes('hết hạn') ? 'red' : 'green'}
                                        style={{ marginLeft: '8px' }}
                                    >
                                        <ClockCircleOutlined /> {timeRemaining}
                                    </Tag>
                                </div>
                            </Col>
                            <Col xs={24} sm={12}>
                                <div style={{ marginBottom: '12px' }}>
                                    <Text strong>Cho phép khách:</Text>
                                    <Tag
                                        color={groupData.allow_guest ? 'green' : 'orange'}
                                        style={{ marginLeft: '8px' }}
                                    >
                                        {groupData.allow_guest ? 'Có' : 'Không'}
                                    </Tag>
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                    <Text strong>Vận chuyển:</Text>
                                    <Tag color="purple" style={{ marginLeft: '8px' }}>
                                        {groupData.shipping_rule === 'equal' ? 'Chia đều' : 'Tùy chọn'}
                                    </Tag>
                                </div>
                            </Col>
                        </Row>

                        <Divider />

                        <div>
                            <Text strong>Chia sẻ nhóm:</Text>
                            <div style={{ marginTop: '8px' }}>
                                <Input.Group compact>
                                    <Input
                                        value={joinUrl}
                                        readOnly
                                        style={{
                                            width: 'calc(100% - 160px)',
                                            backgroundColor: '#f6ffed',
                                        }}
                                    />
                                    <Button
                                        type="primary"
                                        icon={<CopyOutlined />}
                                        onClick={handleCopyJoinUrl}
                                        style={{ width: '80px' }}
                                    >
                                        Copy
                                    </Button>
                                    <Button
                                        icon={<ShareAltOutlined />}
                                        onClick={handleShareGroup}
                                        style={{ width: '80px' }}
                                    >
                                        Chia sẻ
                                    </Button>
                                </Input.Group>
                            </div>
                        </div>
                    </Card>

                    {/* Members List Card */}
                    <Card className="cart-items-card" title="Danh sách thành viên" style={{ marginBottom: '16px' }}>
                        <div className="cart-items-list">
                            {groupData.members.map((member, index) => (
                                <div key={member.id} className="cart-item" style={{ padding: '12px 16px' }}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <UserOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                                            <div>
                                                <Text strong>{member.name}</Text>
                                                {member.is_owner && (
                                                    <Tag color="gold" style={{ marginLeft: '8px' }}>
                                                        Chủ nhóm
                                                    </Tag>
                                                )}
                                                {member.role && (
                                                    <Tag color="blue" style={{ marginLeft: '4px' }}>
                                                        {member.role}
                                                    </Tag>
                                                )}
                                                <br />
                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                    ID: {member.user_id}
                                                </Text>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <Text strong>0 sản phẩm</Text>
                                            <br />
                                            <Text style={{ color: '#52c41a' }}>0đ</Text>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Products/Items Card */}
                    <Card className="cart-items-card" title="Sản phẩm trong nhóm">
                        {groupData.by_member && groupData.by_member.length > 0 ? (
                            <div className="cart-items-list">
                                {groupData.by_member.map((memberData, index) => (
                                    <div key={index} className="cart-item" style={{ padding: '16px' }}>
                                        <Text strong>{memberData.member_name}</Text>
                                        <Text type="secondary"> - {memberData.items?.length || 0} sản phẩm</Text>
                                        {/* Add item details here if available in API response */}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="cart-empty" style={{ minHeight: '300px' }}>
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description="Chưa có sản phẩm nào trong giỏ hàng nhóm"
                                >
                                    <Space>
                                        <Button type="primary" onClick={handleAddProducts}>
                                            Thêm sản phẩm
                                        </Button>
                                        <Button onClick={handleBackToCart}>Quay lại giỏ hàng cá nhân</Button>
                                    </Space>
                                </Empty>
                            </div>
                        )}
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    {/* Summary Card */}
                    <Card className="cart-summary-card" title="Tổng kết nhóm">
                        <div className="cart-summary">
                            {groupData.status === 'open' ? (
                                <Alert
                                    message="Thông báo"
                                    description={
                                        groupData.total_amount > 0
                                            ? `Tổng giá trị đơn hàng nhóm: ${groupData.total_amount.toLocaleString(
                                                  'vi-VN',
                                              )}đ`
                                            : 'Giỏ hàng nhóm hiện chưa có sản phẩm nào. Thêm sản phẩm hoặc mời thêm bạn bè để bắt đầu mua hàng cùng nhau!'
                                    }
                                    type={groupData.total_amount > 0 ? 'success' : 'info'}
                                    showIcon
                                    style={{ marginBottom: '16px' }}
                                />
                            ) : (
                                <Alert
                                    message="Giỏ hàng nhóm đã đóng"
                                    description="Giỏ hàng nhóm này đã đóng hoặc hết hạn. Không thể thêm sản phẩm mới."
                                    type="warning"
                                    showIcon
                                    style={{ marginBottom: '16px' }}
                                />
                            )}

                            <div className="cart-summary-section">
                                <Title level={4}>Thông tin thanh toán</Title>

                                <div className="cart-summary-row">
                                    <Text>Tổng thành viên:</Text>
                                    <Text>{groupData.members.length} người</Text>
                                </div>

                                <div className="cart-summary-row">
                                    <Text>Tổng sản phẩm:</Text>
                                    <Text>{groupData.total_items} sản phẩm</Text>
                                </div>

                                <div className="cart-summary-row">
                                    <Text>Trạng thái:</Text>
                                    <Tag color={groupData.status === 'open' ? 'green' : 'red'}>
                                        {groupData.status === 'open' ? 'Đang mở' : 'Đã đóng'}
                                    </Tag>
                                </div>

                                <Divider />

                                <div className="cart-summary-row cart-total">
                                    <Text strong>Tổng số tiền:</Text>
                                    <Text strong className="cart-total-price">
                                        {groupData.total_amount.toLocaleString('vi-VN')}đ
                                    </Text>
                                </div>

                                <Button
                                    type="primary"
                                    size="large"
                                    block
                                    className="cart-checkout-btn"
                                    disabled={groupData.total_amount === 0 || groupData.status !== 'open'}
                                    style={{ marginTop: '16px' }}
                                >
                                    Thanh toán ({groupData.total_items} sản phẩm)
                                </Button>

                                {groupData.status === 'open' && (
                                    <div style={{ marginTop: '16px', textAlign: 'center' }}>
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            <Button block onClick={handleAddProducts} icon={<ShoppingCartOutlined />}>
                                                Thêm sản phẩm
                                            </Button>
                                            <Button block onClick={handleShareGroup} icon={<UserAddOutlined />}>
                                                Mời thêm bạn bè
                                            </Button>
                                        </Space>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Group Statistics Card */}
                    <Card title="Thống kê nhóm" style={{ marginTop: '16px' }}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text>Thời gian tạo:</Text>
                                <Text>{new Date(groupData.created_at).toLocaleString('vi-VN')}</Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text>Hết hạn:</Text>
                                <Text>{new Date(groupData.expires_at).toLocaleString('vi-VN')}</Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text>Mã tham gia:</Text>
                                <Text code>{groupData.join_token}</Text>
                            </div>
                        </Space>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default CartGroup;
