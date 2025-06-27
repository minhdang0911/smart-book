"use client";
import React, { useState, useEffect, useRef } from "react";
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
    Tabs,
    Modal,
    Popconfirm,
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
import './HistoryOrder.css';
import axios from "axios";
import { toast } from "react-toastify";
import { Heart, Star, Eye, DollarSign, Book, Sparkles, Filter, Search, Grid, List } from 'lucide-react';
import gsap from "gsap";

const { Sider, Content, Header } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Meta } = Card;

const ProfilePage = () => {
    const [selectedKey, setSelectedKey] = useState("personal");
    const [favoriteBooks, setFavoriteBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [user, setUser] = useState([[]])
    const [orders, setOrders] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    const [activeTab, setActiveTab] = useState("all");
    const cardRefs = useRef([]);
    const [syncedStatus, setSyncedStatus] = useState(null);


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




    const fetchOrders = async () => {
        const token = localStorage.getItem("token"); // Lấy token
        try {
            const response = await axios.get("http://localhost:8000/api/orders", {
                headers: {
                    Authorization: `Bearer ${token}`, // Truyền token vào header
                },
            });


            console.log(response)
            setOrders(response.data.data.orders);
        } catch (error) {
            message.error("Lỗi khi lấy đơn hàng");
            console.error("Lỗi gọi API:", error.response?.data || error.message || error);
            message.error("Lỗi khi lấy đơn hàng");
        } finally {
            setLoading(false);
        }
    };





    const fetchOrderDetail = async (id) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`http://localhost:8000/api/orders/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setSelectedOrder(response.data.data.order);
            setIsModalVisible(true);
        } catch (error) {
            message.error("Không thể lấy chi tiết đơn hàng");
        }
    };
    console.log(selectedOrder)

    const cancelOrder = async (id) => {
        const token = localStorage.getItem("token");
        try {
            await axios.post(
                `http://localhost:8000/api/orders/${id}/cancel`,
                {}, // POST body rỗng
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            message.success("Đã hủy đơn hàng");
            fetchOrders(); // Làm mới lại danh sách
        } catch (error) {
            message.error("Không thể hủy đơn hàng");
        }
    };




    useEffect(() => {
        if (selectedKey === "favorites") {
            fetchFavoriteBooks();
        }
    }, [selectedKey]);


    useEffect(() => {
        if (selectedKey === "history") {
            console.log("GỌI API LỊCH SỬ");
            fetchOrders();
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

    useEffect(() => {
        gsap.fromTo(
            cardRefs.current,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: "power3.out" }
        );
    }, [favoriteBooks]);

    useEffect(() => {
        if (selectedOrder?.id) {
            const fetchStatus = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(`http://localhost:8000/api/orders/${selectedOrder.id}/sync-status`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });

                    const result = await response.json();

                    if (result.success && result.status) {
                        setSyncedStatus(result.status); // có thể là chuỗi "pending", "shipping", ...
                    } else {
                        console.warn("Không lấy được trạng thái đơn hàng");
                    }
                } catch (err) {
                    console.error("Lỗi khi gọi API trạng thái:", err);
                }
            };

            fetchStatus();
        }
    }, [selectedOrder]);



    const renderFavoriteBooks = () => {
        const physicalBooks = favoriteBooks.filter((book) => book.is_physical === 1);
        const digitalBooks = favoriteBooks.filter((book) => book.is_physical === 0);



        const renderBookGrid = (books, emptyMessage) => {
            if (books.length === 0) {
                return (
                    <div style={{ padding: "40px 0", textAlign: "center" }}>
                        <Empty description={emptyMessage} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    </div>
                );
            }

            return (
                <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                    {books.map((book, index) => (
                        <Col xs={24} sm={12} lg={8} key={book.id}>
                            <Card
                                hoverable
                                style={{
                                    borderRadius: 12,
                                    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                                    transition: "all 0.3s",
                                }}
                                cover={
                                    <div style={{ position: "relative", overflow: "hidden", height: 300 }}>
                                        <img
                                            ref={(el) => (cardRefs.current[index] = el)}
                                            alt={book.title}
                                            src={book.cover_image}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                                borderTopLeftRadius: 12,
                                                borderTopRightRadius: 12,
                                            }}
                                        />
                                        <div style={{ position: "absolute", top: 10, left: 10 }}>
                                            <Tag color={book.is_physical ? "blue" : "green"}>
                                                {book.is_physical ? "Sách vật lý" : "Sách điện tử"}
                                            </Tag>
                                        </div>
                                    </div>
                                }
                            >
                                <Meta
                                    title={
                                        <div
                                            style={{
                                                fontSize: 16,
                                                fontWeight: 600,
                                                marginBottom: 8,
                                                minHeight: 40,
                                            }}
                                        >
                                            {book.title}
                                        </div>
                                    }
                                    description={
                                        <>
                                            <Paragraph
                                                ellipsis={{ rows: 2 }}
                                                style={{ color: "#666", marginBottom: 12 }}
                                            >
                                                {book.description}
                                            </Paragraph>

                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    marginBottom: 12,
                                                }}
                                            >
                                                <div style={{ display: "flex", alignItems: "center" }}>
                                                    <Rate
                                                        disabled
                                                        defaultValue={parseFloat(book.rating_avg)}
                                                        allowHalf
                                                        style={{ fontSize: 14 }}
                                                    />
                                                    <Text style={{ marginLeft: 6, color: "#666" }}>
                                                        {book.rating_avg}
                                                    </Text>
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center" }}>
                                                    <Eye size={16} color="#666" />
                                                    <Text style={{ marginLeft: 6, color: "#666" }}>
                                                        {book.views.toLocaleString()}
                                                    </Text>
                                                </div>
                                            </div>

                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <Text
                                                    strong
                                                    style={{
                                                        color: book.price > 0 ? "#ff4d4f" : "#52c41a",
                                                        fontSize: 18,
                                                    }}
                                                >
                                                    {book.price > 0
                                                        ? `${parseFloat(book.price).toLocaleString("vi-VN")} VNĐ`
                                                        : "Miễn phí"}
                                                </Text>
                                                <Button type="primary" size="small">
                                                    Xem chi tiết
                                                </Button>
                                            </div>
                                        </>
                                    }
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            );
        };

        const tabItems = [
            {
                key: "physical",
                label: `Sách mua (${physicalBooks.length})`,
                children: renderBookGrid(physicalBooks, "Chưa có sách mua yêu thích nào"),
            },
            {
                key: "digital",
                label: `Sách bán (${digitalBooks.length})`,
                children: renderBookGrid(digitalBooks, "Chưa có sách bán yêu thích nào"),
            },
        ];

        return (
            <div style={{ padding: 24 }}>
                <Title level={3} style={{ marginBottom: 0 }}>
                    Danh sách yêu thích ({favoriteBooks.length})
                </Title>

                {loading ? (
                    <div style={{ textAlign: "center", padding: "60px 0" }}>
                        <Spin size="large" />
                        <div style={{ marginTop: 16, color: "#666" }}>Đang tải...</div>
                    </div>
                ) : (
                    <Tabs
                        defaultActiveKey="physical"
                        items={tabItems}
                        style={{ marginTop: 24 }}
                    />
                )}
            </div>
        );
    };



    const filteredOrders = activeTab === "all"
        ? orders
        : orders.filter(order => order.status === activeTab);

    const statusTabs = [
        { key: "all", label: "Tất cả" },
        { key: "ready_to_pick", label: "Chờ lấy hàng" },
        { key: "picking", label: "Đang lấy hàng" },
        { key: "picked", label: "Đã lấy hàng" },
        { key: "delivering", label: "Đang giao" },
        { key: "delivered", label: "Đã giao" },
        { key: "cancelled", label: "Đã hủy" },
    ];
    const renderHistoryOrder = () => (
        <div style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            minHeight: "100vh",
            padding: "40px 20px"
        }}>
            <div style={{
                maxWidth: "1200px",
                margin: "0 auto",
                background: "rgba(255, 255, 255, 0.98)",
                borderRadius: "24px",
                padding: "40px",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
                backdropFilter: "blur(10px)"
            }}>
                {/* Header */}
                <div style={{
                    textAlign: "center",
                    marginBottom: "40px",
                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text"
                }}>
                    <h1 style={{
                        fontSize: "2.5rem",
                        fontWeight: "700",
                        marginBottom: "8px",
                        letterSpacing: "-0.5px"
                    }}>
                        📦 Lịch sử đơn hàng
                    </h1>
                    <p style={{
                        fontSize: "1.1rem",
                        color: "#64748b",
                        fontWeight: "400",
                        margin: 0
                    }}>
                        Quản lý và theo dõi đơn hàng của bạn
                    </p>
                </div>

                {/* Modern Tabs */}
                <div style={{ marginBottom: "32px" }}>
                    <Tabs
                        activeKey={activeTab}
                        onChange={(key) => setActiveTab(key)}
                        items={statusTabs}
                        centered
                        style={{
                            "--ant-tabs-card-head-background": "transparent",
                            "--ant-tabs-card-active-color": "#667eea"
                        }}
                        tabBarStyle={{
                            background: "rgba(102, 126, 234, 0.08)",
                            padding: "8px",
                            borderRadius: "16px",
                            border: "none",
                            marginBottom: "0"
                        }}
                    />
                </div>

                {/* Orders Grid */}
                <div style={{
                    display: "grid",
                    gap: "24px",
                    gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))"
                }}>
                    {filteredOrders.map((order) => (
                        <div
                            key={order.id}
                            style={{
                                background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                                borderRadius: "20px",
                                padding: "24px",
                                border: "1px solid rgba(102, 126, 234, 0.1)",
                                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                cursor: "pointer",
                                position: "relative",
                                overflow: "hidden"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-4px)";
                                e.currentTarget.style.boxShadow = "0 16px 48px rgba(102, 126, 234, 0.15)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.08)";
                            }}
                        >
                            {/* Decorative gradient overlay */}
                            <div style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                height: "4px",
                                background: "linear-gradient(90deg, #667eea, #764ba2, #f093fb)",
                                borderRadius: "20px 20px 0 0"
                            }}></div>

                            {/* Order Header */}
                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "20px"
                            }}>
                                <h3 style={{
                                    fontSize: "1.25rem",
                                    fontWeight: "600",
                                    color: "#1e293b",
                                    margin: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px"
                                }}>
                                    🛍️ Đơn hàng #{order.id}
                                </h3>
                                <div style={{
                                    padding: "6px 12px",
                                    borderRadius: "20px",
                                    fontSize: "0.875rem",
                                    fontWeight: "500",
                                    background: getStatusColor(order.status).bg,
                                    color: getStatusColor(order.status).text,
                                    border: `1px solid ${getStatusColor(order.status).border}`
                                }}>
                                    {orderStatusMap[order.status] || order.status}
                                </div>
                            </div>

                            {/* Order Info */}
                            <div style={{ marginBottom: "24px" }}>
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginBottom: "12px",
                                    gap: "8px"
                                }}>
                                    <div style={{
                                        width: "8px",
                                        height: "8px",
                                        borderRadius: "50%",
                                        background: "linear-gradient(45deg, #667eea, #764ba2)"
                                    }}></div>
                                    <span style={{
                                        fontSize: "0.875rem",
                                        color: "#64748b",
                                        fontWeight: "500"
                                    }}>
                                        Tổng tiền:
                                    </span>
                                    <span style={{
                                        fontSize: "1.125rem",
                                        fontWeight: "700",
                                        color: "#059669",
                                        marginLeft: "auto"
                                    }}>
                                        {Number(order.total_price).toLocaleString("vi-VN")}₫
                                    </span>

                                    <span style={{
                                        fontSize: "1.125rem",
                                        fontWeight: "700",
                                        color: "#059669",
                                        marginLeft: "auto"
                                    }}>
                                        {order.shipping_code}
                                    </span>
                                </div>

                                <div style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "8px"
                                }}>
                                    <div style={{
                                        width: "8px",
                                        height: "8px",
                                        borderRadius: "50%",
                                        background: "linear-gradient(45deg, #667eea, #764ba2)",
                                        marginTop: "6px",
                                        flexShrink: 0
                                    }}></div>
                                    <div>
                                        <span style={{
                                            fontSize: "0.875rem",
                                            color: "#64748b",
                                            fontWeight: "500",
                                            display: "block",
                                            marginBottom: "4px"
                                        }}>
                                            Địa chỉ giao hàng:
                                        </span>
                                        <span style={{
                                            fontSize: "0.875rem",
                                            color: "#374151",
                                            lineHeight: "1.5"
                                        }}>
                                            {order.address}
                                        </span>
                                    </div>
                                </div>


                                <div style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "8px"
                                }}>
                                    <div style={{
                                        width: "8px",
                                        height: "8px",
                                        borderRadius: "50%",
                                        background: "linear-gradient(45deg, #667eea, #764ba2)",
                                        marginTop: "6px",
                                        flexShrink: 0
                                    }}></div>
                                    <div>
                                        <span


                                            style={{
                                                fontSize: "0.875rem",
                                                color: "#64748b",
                                                fontWeight: "500",
                                                display: "block",
                                                marginBottom: "4px"
                                            }}>
                                            Mã đơn hàng
                                        </span>
                                        <span
                                            onClick={() => {
                                                window.location.href = `https://donhang.ghn.vn/?order_code=${order?.shipping_code}`;
                                            }}
                                            style={{
                                                fontSize: "1.125rem",
                                                fontWeight: "700",
                                                color: "#059669",
                                                marginLeft: "auto"
                                            }}>
                                            {order.shipping_code}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div style={{
                                display: "flex",
                                gap: "12px",
                                flexWrap: "wrap"
                            }}>
                                <Button
                                    type="primary"
                                    onClick={() => fetchOrderDetail(order.id)}
                                    style={{
                                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                        border: "none",
                                        borderRadius: "12px",
                                        height: "40px",
                                        fontSize: "0.875rem",
                                        fontWeight: "500",
                                        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                                        transition: "all 0.3s ease"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-1px)";
                                        e.currentTarget.style.boxShadow = "0 6px 16px rgba(102, 126, 234, 0.4)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.3)";
                                    }}
                                >
                                    👁️ Xem chi tiết
                                </Button>

                                {order.status !== "cancelled" && order.status !== "cancel" && (
                                    <Popconfirm
                                        title={
                                            <div style={{ padding: "8px 0" }}>
                                                <div style={{
                                                    fontSize: "1rem",
                                                    fontWeight: "600",
                                                    color: "#dc2626",
                                                    marginBottom: "4px"
                                                }}>
                                                    ⚠️ Xác nhận hủy đơn hàng
                                                </div>
                                                <div style={{
                                                    fontSize: "0.875rem",
                                                    color: "#64748b"
                                                }}>
                                                    Bạn có chắc muốn hủy đơn hàng #{order.id}?
                                                </div>
                                            </div>
                                        }
                                        okText="Hủy đơn"
                                        cancelText="Không"
                                        okButtonProps={{
                                            style: {
                                                background: "#dc2626",
                                                borderColor: "#dc2626",
                                                borderRadius: "8px"
                                            }
                                        }}
                                        cancelButtonProps={{
                                            style: {
                                                borderRadius: "8px"
                                            }
                                        }}
                                        onConfirm={async () => {
                                            try {
                                                await cancelOrder(order.id);
                                                toast.success(`✅ Đã hủy đơn hàng #${order.id}`);
                                            } catch {
                                                toast.error("❌ Không thể hủy đơn hàng");
                                            }
                                        }}
                                    >
                                        <Button
                                            danger
                                            style={{
                                                borderRadius: "12px",
                                                height: "40px",
                                                fontSize: "0.875rem",
                                                fontWeight: "500",
                                                background: "linear-gradient(135deg, #fee2e2, #fecaca)",
                                                borderColor: "#fca5a5",
                                                color: "#dc2626"
                                            }}
                                        >
                                            ❌ Hủy đơn
                                        </Button>
                                    </Popconfirm>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredOrders.length === 0 && (
                    <div style={{
                        textAlign: "center",
                        padding: "60px 20px",
                        background: "linear-gradient(135deg, #f8fafc, #e2e8f0)",
                        borderRadius: "20px",
                        border: "2px dashed #cbd5e1"
                    }}>
                        <div style={{ fontSize: "4rem", marginBottom: "16px" }}>📦</div>
                        <h3 style={{
                            fontSize: "1.5rem",
                            color: "#64748b",
                            fontWeight: "600",
                            marginBottom: "8px"
                        }}>
                            Không có đơn hàng nào
                        </h3>
                        <p style={{ color: "#94a3b8", fontSize: "1rem" }}>
                            Chưa có đơn hàng nào trong danh mục này
                        </p>
                    </div>
                )}

                {/* Enhanced Modal */}
                {selectedOrder && (
                    <Modal
                        title={
                            <div style={{
                                background: "linear-gradient(135deg, #667eea, #764ba2)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                                fontSize: "1.5rem",
                                fontWeight: "700",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px"
                            }}>
                                📋 Chi tiết đơn hàng #{selectedOrder?.id}
                            </div>
                        }
                        open={isModalVisible}
                        onCancel={() => setIsModalVisible(false)}
                        footer={null}
                        width={800}
                        style={{
                            top: "20px"
                        }}
                        bodyStyle={{
                            padding: "32px",
                            background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)"
                        }}
                    >
                        <div style={{
                            background: "white",
                            borderRadius: "16px",
                            padding: "24px",
                            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)"
                        }}>
                            {/* Status and Payment Info */}
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "20px",
                                marginBottom: "24px"
                            }}>
                                <div style={{
                                    padding: "16px",
                                    background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)",
                                    borderRadius: "12px",
                                    border: "1px solid #bae6fd"
                                }}>
                                    <div style={{
                                        fontSize: "0.875rem",
                                        color: "#0369a1",
                                        fontWeight: "500",
                                        marginBottom: "4px"
                                    }}>
                                        📊 Trạng thái
                                    </div>
                                    <div style={{
                                        fontSize: "1.125rem",
                                        fontWeight: "600",
                                        color: "#0c4a6e"
                                    }}>
                                      {orderStatusMap[syncedStatus] || 'Đang cập nhật...'}
                                    </div>
                                </div>

                                <div style={{
                                    padding: "16px",
                                    background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
                                    borderRadius: "12px",
                                    border: "1px solid #bbf7d0"
                                }}>
                                    <div style={{
                                        fontSize: "0.875rem",
                                        color: "#15803d",
                                        fontWeight: "500",
                                        marginBottom: "4px"
                                    }}>
                                        💳 Thanh toán
                                    </div>
                                    <div style={{
                                        fontSize: "1.125rem",
                                        fontWeight: "600",
                                        color: "#14532d"
                                    }}>
                                        {selectedOrder.payment}
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Fee */}
                            <div style={{
                                padding: "16px",
                                background: "linear-gradient(135deg, #fef3c7, #fde68a)",
                                borderRadius: "12px",
                                border: "1px solid #fcd34d",
                                marginBottom: "24px"
                            }}>
                                <div style={{
                                    fontSize: "0.875rem",
                                    color: "#92400e",
                                    fontWeight: "500",
                                    marginBottom: "4px"
                                }}>
                                    🚚 Phí vận chuyển
                                </div>
                                <div style={{
                                    fontSize: "1.125rem",
                                    fontWeight: "600",
                                    color: "#78350f"
                                }}>
                                    {Number(selectedOrder.shipping_fee).toLocaleString("vi-VN")}₫
                                </div>
                            </div>

                            {/* Products */}
                            <div style={{ marginBottom: "24px" }}>
                                <h4 style={{
                                    fontSize: "1.125rem",
                                    fontWeight: "600",
                                    color: "#1e293b",
                                    marginBottom: "16px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px"
                                }}>
                                    📚 Sản phẩm đã đặt
                                </h4>
                                <div style={{
                                    background: "#f8fafc",
                                    borderRadius: "12px",
                                    padding: "16px"
                                }}>
                                    {(selectedOrder.items || []).map((item, index) => (
                                        <div
                                            key={item.id}
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                padding: "12px 0",
                                                borderBottom: index < selectedOrder.items.length - 1 ? "1px solid #e2e8f0" : "none"
                                            }}
                                        >
                                            <div style={{ flex: 1 }}>
                                                <div style={{
                                                    fontWeight: "500",
                                                    color: "#1e293b",
                                                    marginBottom: "4px"
                                                }}>
                                                    {item.book.title}
                                                </div>
                                                <div style={{
                                                    fontSize: "0.875rem",
                                                    color: "#64748b"
                                                }}>
                                                    Số lượng: {item.quantity}
                                                </div>
                                            </div>
                                            <div style={{
                                                fontSize: "1rem",
                                                fontWeight: "600",
                                                color: "#059669"
                                            }}>
                                                {Number(item.price).toLocaleString("vi-VN")}₫
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total */}
                            <div style={{
                                padding: "20px",
                                background: "linear-gradient(135deg, #667eea, #764ba2)",
                                borderRadius: "16px",
                                textAlign: "center"
                            }}>
                                <div style={{
                                    fontSize: "0.875rem",
                                    color: "rgba(255, 255, 255, 0.8)",
                                    fontWeight: "500",
                                    marginBottom: "8px"
                                }}>
                                    💰 Tổng cộng
                                </div>
                                <div style={{
                                    fontSize: "2rem",
                                    fontWeight: "700",
                                    color: "white",
                                    textShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
                                }}>
                                    {Number(selectedOrder.total_price).toLocaleString("vi-VN")}₫
                                </div>
                            </div>
                        </div>
                    </Modal>
                )}
            </div>
        </div>
    );

    // Helper function for status colors
    const getStatusColor = (status) => {
        const colors = {
            pending: {
                bg: "linear-gradient(135deg, #fef3c7, #fde68a)",
                text: "#92400e",
                border: "#fcd34d"
            },
            processing: {
                bg: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
                text: "#1d4ed8",
                border: "#93c5fd"
            },
            shipped: {
                bg: "linear-gradient(135deg, #e0e7ff, #c7d2fe)",
                text: "#6366f1",
                border: "#a5b4fc"
            },
            delivered: {
                bg: "linear-gradient(135deg, #dcfce7, #bbf7d0)",
                text: "#15803d",
                border: "#86efac"
            },
            cancelled: {
                bg: "linear-gradient(135deg, #fee2e2, #fecaca)",
                text: "#dc2626",
                border: "#fca5a5"
            },
            cancel: {
                bg: "linear-gradient(135deg, #fee2e2, #fecaca)",
                text: "#dc2626",
                border: "#fca5a5"
            }
        };

        return colors[status] || {
            bg: "linear-gradient(135deg, #f1f5f9, #e2e8f0)",
            text: "#64748b",
            border: "#cbd5e1"
        };
    };


    const renderContent = () => {
        switch (selectedKey) {
            case "personal":
                return renderPersonalInfo();
            case "favorites":
                return renderFavoriteBooks();
            case "history":
                return renderHistoryOrder()


            default:
                return renderPersonalInfo();
        }
    };
    const orderStatusMap = {
        ready_to_pick: "Chờ lấy hàng",
        picking: "Đang lấy hàng",
        money_collect_picking: "Thu tiền khi lấy hàng",
        picked: "Đã lấy hàng",
        storing: "Đã nhập kho",
        delivering: "Đang giao hàng",
        delivered: "Đã giao thành công",
        delivery_fail: "Giao không thành công",
        cancelled: "Đã hủy đơn", // nếu status là cancelled
        cancel: "Đã hủy đơn",
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