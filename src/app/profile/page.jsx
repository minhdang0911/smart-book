// pages/ProfilePage.js - File chính được cập nhật
'use client';
import {
    BankFilled,
    CheckCircleOutlined,
    EyeInvisibleOutlined,
    EyeTwoTone,
    FilterFilled,
    KeyOutlined,
} from '@ant-design/icons';
import { Alert, Button, Card, Col, Divider, Form, Input, message, Row, Space, Typography } from 'antd';
import { useState } from 'react';

// Import Hooks
import { useAuth } from '../hooks/useAuth';

// Import Components
import FavoriteBooks from './FavoriteBooks/FavoriteBooks';
import ProfileSidebar from './Layout/ProfileSidebar'; // Chỉ import ProfileSidebar
import OrderHistory from './OrderHistory/OrderHistory';
import PersonalInfo from './PersonalInfo';

// Import Styles
import './style.css';

const { Title, Text, Paragraph } = Typography;

// Change Password Component inline
const ChangePassword = ({ token }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState('');

    // Kiểm tra độ mạnh mật khẩu
    const checkPasswordStrength = (password) => {
        if (!password) return '';

        let score = 0;
        let feedback = [];

        if (password.length >= 8) score++;
        else feedback.push('Ít nhất 8 ký tự');

        if (/[a-z]/.test(password)) score++;
        else feedback.push('Có chữ thường');

        if (/[A-Z]/.test(password)) score++;
        else feedback.push('Có chữ hoa');

        if (/[0-9]/.test(password)) score++;
        else feedback.push('Có số');

        if (/[^A-Za-z0-9]/.test(password)) score++;
        else feedback.push('Có ký tự đặc biệt');

        if (score <= 2) return { level: 'weak', text: 'Yếu', color: '#ff4d4f', feedback };
        if (score <= 3) return { level: 'medium', text: 'Trung bình', color: '#faad14', feedback };
        if (score <= 4) return { level: 'good', text: 'Tốt', color: '#52c41a', feedback };
        return { level: 'strong', text: 'Rất mạnh', color: '#389e0d', feedback: [] };
    };

    const handlePasswordChange = (e) => {
        const password = e.target.value;
        setPasswordStrength(checkPasswordStrength(password));
    };

    const onFinish = async (values) => {
        setLoading(true);
        const token = localStorage?.getItem('token');

        try {
            const response = await fetch('http://localhost:8000/api/user/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    current_password: values.currentPassword,
                    new_password: values.newPassword,
                    new_password_confirmation: values.newPassword,
                }),
            });

            const data = await response.json();
            if (data?.success === true) {
                window.message.success('Đổi mật khẩu thành công!');
                form.resetFields();
                setPasswordStrength('');
            }

            if (!response.ok) {
                if (response.status === 422) {
                    const errors = data.errors || {};
                    const errorMessages = Object.values(errors).flat();
                    throw new Error(errorMessages.join(', ') || 'Dữ liệu không hợp lệ');
                } else if (response.status === 401) {
                    throw new Error('Mật khẩu hiện tại không đúng');
                } else {
                    throw new Error(data.message || 'Không thể đổi mật khẩu');
                }
            }
        } catch (error) {
            message.error(error.message || 'Có lỗi xảy ra khi đổi mật khẩu');
        } finally {
            setLoading(false);
        }
    };

    const validateConfirmPassword = ({ getFieldValue }) => ({
        validator(_, value) {
            if (!value || getFieldValue('newPassword') === value) {
                return Promise.resolve();
            }
            return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
        },
    });

    return (
        <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div
                        style={{
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        <Title level={2} style={{ marginBottom: '8px' }}>
                            🔐 Đổi mật khẩu
                        </Title>
                    </div>
                    <Paragraph style={{ fontSize: '16px', color: '#64748b', margin: 0 }}>
                        Bảo vệ tài khoản của bạn bằng mật khẩu mạnh
                    </Paragraph>
                </div>

                <Row gutter={[24, 24]}>
                    {/* Form đổi mật khẩu */}
                    <Col xs={24} lg={14}>
                        <Card
                            style={{
                                borderRadius: '16px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                border: '1px solid rgba(102, 126, 234, 0.1)',
                            }}
                        >
                            <div style={{ marginBottom: '24px' }}>
                                <Space align="center" style={{ marginBottom: '8px' }}>
                                    <KeyOutlined style={{ color: '#667eea', fontSize: '20px' }} />
                                    <Title level={4} style={{ margin: 0, color: '#1a1a1a' }}>
                                        Thay đổi mật khẩu
                                    </Title>
                                </Space>
                                <Text type="secondary">Nhập mật khẩu hiện tại và mật khẩu mới để thay đổi</Text>
                            </div>

                            <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off" size="large">
                                {/* Mật khẩu hiện tại */}
                                <Form.Item
                                    name="currentPassword"
                                    label="Mật khẩu hiện tại"
                                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
                                >
                                    <Input.Password
                                        prefix={<FilterFilled style={{ color: '#667eea' }} />}
                                        placeholder="Nhập mật khẩu hiện tại"
                                        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                        style={{ borderRadius: '8px' }}
                                    />
                                </Form.Item>

                                <Divider />

                                {/* Mật khẩu mới */}
                                <Form.Item
                                    name="newPassword"
                                    label="Mật khẩu mới"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                                        { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' },
                                    ]}
                                >
                                    <Input.Password
                                        prefix={<BankFilled style={{ color: '#667eea' }} />}
                                        placeholder="Nhập mật khẩu mới"
                                        onChange={handlePasswordChange}
                                        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                        style={{ borderRadius: '8px' }}
                                    />
                                </Form.Item>

                                {/* Độ mạnh mật khẩu */}
                                {passwordStrength && (
                                    <div style={{ marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                            <Text style={{ marginRight: '8px' }}>Độ mạnh:</Text>
                                            <Text strong style={{ color: passwordStrength.color }}>
                                                {passwordStrength.text}
                                            </Text>
                                        </div>
                                        <div
                                            style={{
                                                height: '4px',
                                                background: '#f0f0f0',
                                                borderRadius: '2px',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    height: '100%',
                                                    background: passwordStrength.color,
                                                    width:
                                                        passwordStrength.level === 'weak'
                                                            ? '25%'
                                                            : passwordStrength.level === 'medium'
                                                            ? '50%'
                                                            : passwordStrength.level === 'good'
                                                            ? '75%'
                                                            : '100%',
                                                    transition: 'all 0.3s ease',
                                                }}
                                            />
                                        </div>
                                        {passwordStrength.feedback.length > 0 && (
                                            <Text style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                                Cần: {passwordStrength.feedback.join(', ')}
                                            </Text>
                                        )}
                                    </div>
                                )}

                                {/* Xác nhận mật khẩu */}
                                <Form.Item
                                    name="confirmPassword"
                                    label="Xác nhận mật khẩu mới"
                                    dependencies={['newPassword']}
                                    rules={[
                                        { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                                        validateConfirmPassword,
                                    ]}
                                >
                                    <Input.Password
                                        prefix={<CheckCircleOutlined style={{ color: '#667eea' }} />}
                                        placeholder="Nhập lại mật khẩu mới"
                                        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                        style={{ borderRadius: '8px' }}
                                    />
                                </Form.Item>

                                {/* Submit Button */}
                                <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={loading}
                                        block
                                        size="large"
                                        style={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            height: '48px',
                                            fontSize: '16px',
                                            fontWeight: '500',
                                        }}
                                    >
                                        {loading ? 'Đang xử lý...' : '🔐 Đổi mật khẩu'}
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Card>
                    </Col>

                    {/* Security Tips */}
                    <Col xs={24} lg={10}>
                        <Card
                            style={{
                                borderRadius: '16px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                            }}
                        >
                            <Title level={5} style={{ color: '#1a1a1a', marginBottom: '16px' }}>
                                💡 Lời khuyên bảo mật
                            </Title>

                            <Space direction="vertical" size={16} style={{ width: '100%' }}>
                                <Alert
                                    message="Mật khẩu mạnh nên có:"
                                    description={
                                        <ul style={{ margin: '8px 0 0 0', paddingLeft: '16px' }}>
                                            <li>Ít nhất 8 ký tự</li>
                                            <li>Chữ hoa và chữ thường</li>
                                            <li>Số và ký tự đặc biệt</li>
                                            <li>Không sử dụng thông tin cá nhân</li>
                                        </ul>
                                    }
                                    type="info"
                                    showIcon
                                />

                                <Alert
                                    message="Để bảo mật tối đa:"
                                    description={
                                        <ul style={{ margin: '8px 0 0 0', paddingLeft: '16px' }}>
                                            <li>Thay đổi mật khẩu định kỳ</li>
                                            <li>Không chia sẻ mật khẩu</li>
                                            <li>Sử dụng mật khẩu khác nhau cho các tài khoản</li>
                                            <li>Kích hoạt xác thực 2 bước nếu có</li>
                                        </ul>
                                    }
                                    type="warning"
                                    showIcon
                                />
                            </Space>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

const ProfilePage = () => {
    const [selectedKey, setSelectedKey] = useState('personal');
    const { user, loading: userLoading, token } = useAuth();

    const handleMenuSelect = (key) => {
        setSelectedKey(key);
    };

    const renderContent = () => {
        switch (selectedKey) {
            case 'personal':
                return <PersonalInfo user={user} token={token} />;
            case 'favorites':
                return <FavoriteBooks token={token} enabled={selectedKey === 'favorites'} />;
            case 'history1':
                return <OrderHistory token={token} enabled={selectedKey === 'history1'} />;
            case 'change-password':
                return <ChangePassword token={token} />;
            default:
                return <PersonalInfo user={user} token={token} />;
        }
    };

    if (userLoading) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    flexDirection: 'column',
                    gap: '16px',
                }}
            >
                <div
                    style={{
                        width: '40px',
                        height: '40px',
                        border: '4px solid #f3f3f3',
                        borderTop: '4px solid #667eea',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                    }}
                />
                <div style={{ fontSize: '16px', color: '#666' }}>Đang tải thông tin người dùng...</div>

                <style jsx>{`
                    @keyframes spin {
                        0% {
                            transform: rotate(0deg);
                        }
                        100% {
                            transform: rotate(360deg);
                        }
                    }
                `}</style>
            </div>
        );
    }

    // Tạo userData để truyền vào ProfileSidebar
    const userData = {
        name: user?.name || 'Người dùng',
        avatar: user?.avatar,

    };

    return (
        <ProfileSidebar user={userData} selectedKey={selectedKey} onMenuSelect={handleMenuSelect}>
            {renderContent()}
        </ProfileSidebar>
    );
};

export default ProfilePage;
