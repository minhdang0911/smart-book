"use client";
import React, { useState, useEffect } from "react";
import {
    Layout,
    Menu,
    Card,
    Avatar,
    Typography,
    Rate,
    Button,
    Spin,
    message,
    Empty,
    Tag,
    Drawer,
    Row,
    Col,
    Space,
    Divider,
} from "antd";
import {
    UserOutlined,
    HeartOutlined,
    HistoryOutlined,
    ShoppingCartOutlined,
    EyeOutlined,
    MenuOutlined,
    EditOutlined,
    PhoneOutlined,
    MailOutlined,
    EnvironmentOutlined,
    CalendarOutlined,
} from "@ant-design/icons";
import { apiGetMe } from "../../../apis/user";

const { Sider, Content, Header } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Meta } = Card;

const ProfilePage = () => {
    const [selectedKey, setSelectedKey] = useState("personal");
    const [favoriteBooks, setFavoriteBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [user, setUser] = useState([[]])
const token = localStorage.getItem("token");
console.log("Token:", token);


    const fetchFavoriteBooks = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            console.log("Token:", token);

            const response = await fetch("http://localhost:8000/api/books/followed", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json(); // ✅ Chỉ gọi 1 lần
            console.log("API response:", data); // ✅ In ra sau khi parse xong

            if (data.status) {
                setFavoriteBooks(data.followed_books);
            } else {
                message.error("Không thể tải danh sách yêu thích");
            }
        } catch (error) {
            console.error("Error fetching favorite books:", error);
            message.error("Lỗi kết nối API");

            // Mock data nếu lỗi
            setFavoriteBooks([
                {
                    id: 1,
                    title: "One Piece",
                    description: "Hành trình của Luffy để trở thành Vua Hải Tặc với những cuộc phiêu lưu đầy kịch tính.",
                    cover_image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=400&fit=crop",
                    rating_avg: "4.2",
                    is_physical: 1,
                    views: 5345,
                    price: "0.00",
                },
                {
                    id: 2,
                    title: "Attack on Titan",
                    description: "Cuộc chiến sinh tồn của nhân loại chống lại những titan khổng lồ đầy bí ẩn.",
                    cover_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop",
                    rating_avg: "4.5",
                    is_physical: 0,
                    views: 8234,
                    price: "89000",
                },
                {
                    id: 3,
                    title: "Death Note",
                    description: "Câu chuyện về Light Yagami và quyển sổ tử thần với những trò chơi tâm lý căng thẳng.",
                    cover_image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop",
                    rating_avg: "4.8",
                    is_physical: 1,
                    views: 12456,
                    price: "120000",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (selectedKey === "favorites") {
            fetchFavoriteBooks();
        }
    }, [selectedKey]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const getUserInfo = async () => {
                try {
                    const response = await apiGetMe(token);
                    
                    if (response?.status === true) {
                        setUser(response?.user);
                    }
                } catch (error) {
                    console.error('Error getting user info:', error);
                 
                }
            };
            getUserInfo();
        }
    }, []);

    

    const menuItems = [
        { key: "personal", icon: <UserOutlined />, label: "Thông tin cá nhân" },
        { key: "favorites", icon: <HeartOutlined />, label: "Danh sách yêu thích" },
        { key: "history", icon: <HistoryOutlined />, label: "Lịch sử mua hàng" },
        { key: "cart", icon: <ShoppingCartOutlined />, label: "Giỏ hàng" },
    ];

 


    const renderPersonalInfo = () => (
        <div style={{ padding: "24px" }}>
            <Card className="profile-card" style={{ borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                <div className="profile-header">
                    <div className="avatar-section">
                        <div className="avatar-wrapper">
                            <Avatar
                                size={100}
                                src={user.avatar}
                                icon={<UserOutlined />}
                                className="profile-avatar"
                            />
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
                        <Title level={2} style={{ margin: "0 0 8px 0", color: "#1a1a1a" }}>
                            {user.name}
                        </Title>
                        <Space>
                            <CalendarOutlined style={{ color: "#666" }} />
                            <Text type="secondary">
                                Thành viên từ {new Date(user.created_at).toLocaleDateString('vi-VN')}
                            </Text>
                        </Space>
                    </div>
                </div>

                <Divider />

                <Row gutter={[24, 24]}>
                    <Col xs={24} md={12}>
                        <div className="info-item">
                            <div className="info-icon">
                                <MailOutlined />
                            </div>
                            <div className="info-content">
                                <Text type="secondary" style={{ fontSize: "14px" }}>Email</Text>
                                <div style={{ fontWeight: 600, fontSize: "16px", color: "#1a1a1a" }}>
                                    {user.email}
                                </div>
                            </div>
                        </div>
                    </Col>
                    <Col xs={24} md={12}>
                        <div className="info-item">
                            <div className="info-icon">
                                <PhoneOutlined />
                            </div>
                            <div className="info-content">
                                <Text type="secondary" style={{ fontSize: "14px" }}>Số điện thoại</Text>
                                <div style={{ fontWeight: 600, fontSize: "16px", color: "#1a1a1a" }}>
                                    {user.phone}
                                </div>
                            </div>
                        </div>
                    </Col>
                    <Col xs={24}>
                        <div className="info-item">
                            <div className="info-icon">
                                <EnvironmentOutlined />
                            </div>
                            <div className="info-content">
                                <Text type="secondary" style={{ fontSize: "14px" }}>Địa chỉ</Text>
                                <div style={{ fontWeight: 600, fontSize: "16px", color: "#1a1a1a" }}>
                                    {user.address}
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>

                <div style={{ marginTop: "32px" }}>
                    <Button
                        type="primary"
                        size="large"
                        icon={<EditOutlined />}
                        className="edit-profile-btn"
                    >
                        Chỉnh sửa thông tin
                    </Button>
                </div>
            </Card>
        </div>
    );

    const renderFavoriteBooks = () => (
        <div style={{ padding: "24px" }}>
            <div className="section-header">
                <Title level={3} style={{ margin: 0 }}>
                    Danh sách yêu thích ({favoriteBooks.length})
                </Title>
            </div>

            {loading ? (
                <div className="loading-container">
                    <Spin size="large" />
                    <div style={{ marginTop: "16px", color: "#666" }}>Đang tải...</div>
                </div>
            ) : favoriteBooks.length === 0 ? (
                <div className="empty-container">
                    <Empty
                        description="Chưa có sách yêu thích nào"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                </div>
            ) : (
                <Row gutter={[24, 24]} style={{ marginTop: "24px" }}>
                    {favoriteBooks.map((book) => (
                        <Col xs={24} sm={12} lg={8} key={book.id}>
                            <Card
                                hoverable
                                className="book-card"
                                cover={
                                    <div className="book-cover">
                                        <img
                                            alt={book.title}
                                            src={book.cover_image}
                                            className="cover-image"
                                        />
                                        <div className="book-tag">
                                            {book.is_physical ? (
                                                <Tag color="blue">Sách vật lý</Tag>
                                            ) : (
                                                <Tag color="green">Sách điện tử</Tag>
                                            )}
                                        </div>
                                    </div>
                                }
                            >
                                <Meta
                                    title={
                                        <div className="book-title">
                                            {book.title}
                                        </div>
                                    }
                                    description={
                                        <div className="book-content">
                                            <Paragraph
                                                ellipsis={{ rows: 2 }}
                                                style={{ color: "#666", marginBottom: "16px" }}
                                            >
                                                {book.description}
                                            </Paragraph>

                                            <div className="book-stats">
                                                <div className="rating-section">
                                                    <Rate
                                                        disabled
                                                        defaultValue={parseFloat(book.rating_avg)}
                                                        allowHalf
                                                        style={{ fontSize: "14px" }}
                                                    />
                                                    <Text style={{ marginLeft: "8px", color: "#666" }}>
                                                        {book.rating_avg}
                                                    </Text>
                                                </div>
                                                <div className="views-section">
                                                    <EyeOutlined style={{ color: "#666" }} />
                                                    <Text style={{ marginLeft: "4px", color: "#666" }}>
                                                        {book.views.toLocaleString()}
                                                    </Text>
                                                </div>
                                            </div>

                                            <div className="book-footer">
                                                <div className="price-section">
                                                    {parseFloat(book.price) > 0 ? (
                                                        <Text strong style={{ color: "#ff4d4f", fontSize: "18px" }}>
                                                            {parseFloat(book.price).toLocaleString("vi-VN")} VNĐ
                                                        </Text>
                                                    ) : (
                                                        <Text strong style={{ color: "#52c41a", fontSize: "18px" }}>
                                                            Miễn phí
                                                        </Text>
                                                    )}
                                                </div>
                                                <Button type="primary" size="small">
                                                    Xem chi tiết
                                                </Button>
                                            </div>
                                        </div>
                                    }
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );

    const renderEmptyState = (title, description) => (
        <div style={{ padding: "24px" }}>
            <div className="empty-container">
                <Empty description={description} image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </div>
        </div>
    );

    const renderContent = () => {
        switch (selectedKey) {
            case "personal":
                return renderPersonalInfo();
            case "favorites":
                return renderFavoriteBooks();
            case "history":
                return renderEmptyState("Lịch sử mua hàng", "Chưa có lịch sử mua hàng");
            case "cart":
                return renderEmptyState("Giỏ hàng", "Giỏ hàng trống");
            default:
                return renderPersonalInfo();
        }
    };

    return (
        <>
            <style jsx global>{`
        .profile-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }

        .profile-card {
          border: none !important;
          overflow: hidden;
        }

        .profile-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 24px;
        }

        .avatar-section {
          margin-bottom: 20px;
        }

        .avatar-wrapper {
          position: relative;
          display: inline-block;
        }

        .profile-avatar {
          border: 4px solid #e6f4ff;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .edit-avatar-btn {
          position: absolute;
          bottom: -2px;
          right: -2px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        .info-item {
          display: flex;
          align-items: center;
          padding: 16px;
          background: #fafafa;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .info-item:hover {
          background: #f0f2ff;
          transform: translateY(-1px);
        }

        .info-icon {
          margin-right: 12px;
          font-size: 20px;
          color: #1890ff;
        }

        .info-content {
          flex: 1;
        }

        .edit-profile-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          height: 44px;
          border-radius: 8px;
          font-weight: 600;
        }

        .edit-profile-btn:hover {
          background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .section-header {
          margin-bottom: 24px;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }

        .empty-container {
          background: white;
          border-radius: 16px;
          padding: 60px 20px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }

        .book-card {
          border-radius: 16px !important;
          overflow: hidden;
          transition: all 0.3s ease;
          border: none !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }

        .book-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.12);
        }

        .book-cover {
          position: relative;
          overflow: hidden;
        }

        .cover-image {
          width: 100%;
          height: 240px;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .book-card:hover .cover-image {
          transform: scale(1.05);
        }

        .book-tag {
          position: absolute;
          top: 12px;
          right: 12px;
        }

        .book-title {
          font-size: 16px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 8px;
        }

        .book-content {
          padding: 0;
        }

        .book-stats {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .rating-section,
        .views-section {
          display: flex;
          align-items: center;
        }

        .book-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16px;
        }

        .custom-sider {
          background: white !important;
          box-shadow: 2px 0 12px rgba(0,0,0,0.08);
          border-right: 1px solid #f0f0f0;
        }

        .sider-header {
          padding: 24px 20px;
          text-align: center;
          border-bottom: 1px solid #f0f0f0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .sider-avatar {
          border: 3px solid rgba(255,255,255,0.3) !important;
          margin-bottom: 12px;
        }

        .sider-menu {
          border: none !important;
          padding: 20px 0;
        }

        .sider-menu .ant-menu-item {
          margin: 8px 12px !important;
          border-radius: 12px !important;
          height: 48px !important;
          line-height: 48px !important;
          transition: all 0.3s ease;
        }

        .sider-menu .ant-menu-item-selected {
          background: linear-gradient(135deg, #e6f4ff 0%, #f0f5ff 100%) !important;
          color: #1890ff !important;
          font-weight: 600;
        }

        .sider-menu .ant-menu-item:hover {
          background: #f5f5f5 !important;
          transform: translateX(4px);
        }

        .mobile-header {
          background: white !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          border-bottom: 1px solid #f0f0f0;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .mobile-menu-btn {
          border: none;
          background: transparent;
          font-size: 18px;
          color: #1a1a1a;
        }

        .mobile-drawer .ant-drawer-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-bottom: none;
        }

        .mobile-drawer .ant-drawer-title {
          color: white !important;
        }

        .mobile-drawer .ant-drawer-close {
          color: white !important;
        }

        .mobile-drawer .ant-menu {
          border: none;
          padding: 0;
        }

        .mobile-drawer .ant-menu-item {
          margin: 4px 0 !important;
          border-radius: 8px !important;
          height: 44px !important;
          line-height: 44px !important;
        }

        @media (max-width: 768px) {
          .profile-header {
            text-align: center;
          }

          .book-stats {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .book-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
        }

        @media (max-width: 576px) {
          .profile-page .ant-layout-content {
            padding: 12px !important;
          }

          .section-header {
            margin-bottom: 16px;
          }
        }
      `}</style>

            <div className="profile-page">
                <Layout>
                    {/* Mobile Header */}
                    <Header className="mobile-header" style={{ display: 'block' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0 16px'
                        }}>
                            <Title level={4} style={{ margin: 0, color: '#1a1a1a' }}>
                                Trang cá nhân
                            </Title>
                            <Button
                                className="mobile-menu-btn"
                                icon={<MenuOutlined />}
                                onClick={() => setMobileMenuOpen(true)}
                                style={{ display: 'block' }}
                            />
                        </div>
                    </Header>

                    {/* Mobile Drawer */}
                    <Drawer
                        title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Avatar
                                    size={40}
                                    src={user.avatar}
                                    icon={<UserOutlined />}
                                />
                                <span>{user.name}</span>
                            </div>
                        }
                        placement="left"
                        onClose={() => setMobileMenuOpen(false)}
                        open={mobileMenuOpen}
                        bodyStyle={{ padding: 0 }}
                        className="mobile-drawer"
                    >
                        <Menu
                            mode="inline"
                            selectedKeys={[selectedKey]}
                            onClick={({ key }) => {
                                setSelectedKey(key);
                                setMobileMenuOpen(false);
                            }}
                            items={menuItems}
                        />
                    </Drawer>

                    <Layout hasSider>
                        {/* Desktop Sidebar */}
                        <Sider
                            width={300}
                            className="custom-sider"
                            style={{
                                height: "100vh",
                                position: "fixed",
                                left: 0,
                                top: 0,
                                zIndex: 100,
                                display: 'none'
                            }}
                        >
                            <div className="sider-header">
                                <Avatar
                                    size={80}
                                    src={user.avatar}
                                    icon={<UserOutlined />}
                                    className="sider-avatar"
                                />
                                <Title level={4} style={{ margin: '0 0 4px 0', color: 'white' }}>
                                    {user.name}
                                </Title>
                                <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                                    Trang cá nhân
                                </Text>
                            </div>
                            <Menu
                                mode="inline"
                                selectedKeys={[selectedKey]}
                                onClick={({ key }) => setSelectedKey(key)}
                                className="sider-menu"
                                items={menuItems}
                            />
                        </Sider>

                        <Layout style={{ marginLeft: 0 }}>
                            <Content style={{ background: 'transparent', minHeight: '100vh' }}>
                                {renderContent()}
                            </Content>
                        </Layout>
                    </Layout>
                </Layout>
            </div>

            <style jsx>{`
        @media (min-width: 992px) {
          .mobile-header {
            display: none !important;
          }
          .custom-sider {
            display: block !important;
          }
          .ant-layout {
            margin-left: 300px !important;
          }
        }
      `}</style>
        </>
    );
};

export default ProfilePage;