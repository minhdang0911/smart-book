'use client';
import { CalendarOutlined, EditOutlined, MailOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Col, Divider, Input, Row, Space, Typography } from 'antd';
import { useProfile } from '../hooks/useProfile';

const { Title, Text } = Typography;

const PersonalInfo = ({ user, token }) => {
    const { editing, setEditing, formData, handleChange, handleSubmit } = useProfile(user, token);

    return (
        <div style={{ padding: '24px' }}>
            <Card className="profile-card" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <div className="profile-header">
                    <div className="avatar-section">
                        <div className="avatar-wrapper">
                            <Avatar size={100} src={user?.avatar} icon={<UserOutlined />} className="profile-avatar" />
                            <Button
                                type="primary"
                                shape="circle"
                                icon={<EditOutlined />}
                                size="small"
                                className="edit-avatar-btn"
                            />
                        </div>
                    </div>
                    <div className="user-info">
                        <Title level={2} style={{ margin: '0 0 8px 0', color: '#1a1a1a' }}>
                            {user?.name}
                        </Title>
                        <Space>
                            <CalendarOutlined style={{ color: '#666' }} />
                            <Text type="secondary">
                                Thành viên từ {new Date(user?.created_at).toLocaleDateString('vi-VN')}
                            </Text>
                        </Space>
                    </div>
                </div>

                <Divider />

                <div>
                    <Row gutter={[24, 24]}>
                        <Col xs={24} md={12}>
                            <div className="info-item" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div className="info-icon">
                                    <MailOutlined />
                                </div>
                                <div className="info-content" style={{ flex: 1 }}>
                                    <Text type="secondary" style={{ fontSize: 14 }}>
                                        {editing ? 'Họ và tên' : 'Email'}
                                    </Text>
                                    {editing ? (
                                        <Input
                                            name="name"
                                            value={formData.name || user?.name || ''}
                                            onChange={handleChange}
                                            style={{ fontWeight: 600, fontSize: 16 }}
                                            placeholder="Nhập họ và tên"
                                        />
                                    ) : (
                                        <div style={{ fontWeight: 600, fontSize: 16, color: '#1a1a1a' }}>
                                            {user?.email || 'Chưa có email'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Col>

                        <Col xs={24} md={12}>
                            <div className="info-item" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div className="info-icon">
                                    <PhoneOutlined />
                                </div>
                                <div className="info-content" style={{ flex: 1 }}>
                                    <Text type="secondary" style={{ fontSize: 14 }}>
                                        Số điện thoại
                                    </Text>
                                    {editing ? (
                                        <Input
                                            name="phone"
                                            value={formData.phone || user?.phone || ''}
                                            onChange={handleChange}
                                            style={{ fontWeight: 600, fontSize: 16 }}
                                            placeholder="Nhập số điện thoại"
                                        />
                                    ) : (
                                        <div style={{ fontWeight: 600, fontSize: 16, color: '#1a1a1a' }}>
                                            {user?.phone || 'Chưa có số điện thoại'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Col>
                    </Row>

                    <div style={{ marginTop: '32px' }}>
                        {editing ? (
                            <Button
                                type="primary"
                                size="large"
                                onClick={handleSubmit}
                                icon={<EditOutlined />}
                                className="edit-profile-btn"
                            >
                                Lưu thay đổi
                            </Button>
                        ) : (
                            <Button
                                type="primary"
                                size="large"
                                onClick={() => setEditing(true)}
                                icon={<EditOutlined />}
                                className="edit-profile-btn"
                            >
                                Chỉnh sửa thông tin
                            </Button>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default PersonalInfo;
