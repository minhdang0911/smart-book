'use client';
import { EyeOutlined, HeartOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Col, Pagination, Row, Space, Spin, Tag, Typography, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import './BlogInterface.css'; // Import CSS file for styling

const { Title, Text, Paragraph } = Typography;

const CoffeeBlogInterface = () => {
    const [posts, setPosts] = useState([]);
    const [pinnedPosts, setPinnedPosts] = useState([]);
    const [popularPosts, setPopularPosts] = useState([]);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const router = useRouter();

    useEffect(() => {
        fetchTopics();
    }, []);

    useEffect(() => {
        if (selectedTopic) {
            fetchPostsByTopic(selectedTopic);
        } else {
            fetchPinnedPosts();
            fetchPopularPosts();
            fetchPosts(currentPage, pageSize);
        }
    }, [currentPage, pageSize, selectedTopic]);

    const getAuthHeaders = () => {
        if (typeof window !== 'undefined') {
            const token = localStorage?.getItem('token');
            return token ? { Authorization: `Bearer ${token}` } : {};
        }
        return {};
    };

    const fetchWithAuth = async (url) => {
        return fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders(),
            },
        });
    };

    const fetchTopics = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/topics');
            const result = await res.json();
            if (result.success) setTopics(result.data);
        } catch (err) {
            console.error('Lỗi tải danh sách chủ đề:', err);
        }
    };

    const fetchPinnedPosts = async () => {
        try {
            const res = await fetchWithAuth('http://localhost:8000/api/posts/pinned');
            const result = await res.json();
            if (result.success) setPinnedPosts(result.data);
        } catch (err) {
            console.error('Lỗi tải bài ghim:', err);
        }
    };

    const fetchPopularPosts = async () => {
        try {
            const res = await fetchWithAuth('http://localhost:8000/api/posts/popular');
            const result = await res.json();
            if (result.success) setPopularPosts(result.data);
        } catch (err) {
            console.error('Lỗi tải bài phổ biến:', err);
        }
    };

    const fetchPosts = async (page, size) => {
        setLoading(true);
        try {
            const res = await fetchWithAuth(`http://localhost:8000/api/posts?page=${page}&per_page=${size}`);
            const result = await res.json();
            if (result.success) {
                setPosts(result.data);
                setTotal(result.meta?.total || result.data.length);
            }
        } catch (err) {
            console.error('Lỗi tải bài viết:', err);
            message.error('Lỗi khi tải danh sách bài viết');
        } finally {
            setLoading(false);
        }
    };

    const fetchPostsByTopic = async (id) => {
        setLoading(true);
        try {
            const res = await fetchWithAuth(`http://localhost:8000/api/posts/related/${id}`);
            const result = await res.json();
            if (result.success) {
                setPosts(result.data);
                setPinnedPosts([]);
                setPopularPosts([]);
                setTotal(result.data.length);
            } else {
                setPosts([]);
                setTotal(0);
            }
        } catch (err) {
            console.error('Lỗi lọc bài viết theo chủ đề:', err);
            message.error('Không thể lọc bài viết theo chủ đề');
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (postId) => {
        if (typeof window === 'undefined') return;

        const token = localStorage?.getItem('token');
        if (!token) return message.warning('Vui lòng đăng nhập để thả tim');

        try {
            const res = await fetch(`http://localhost:8000/api/posts/${postId}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                if (selectedTopic) {
                    fetchPostsByTopic(selectedTopic);
                } else {
                    fetchPinnedPosts();
                    fetchPopularPosts();
                    fetchPosts(currentPage, pageSize);
                }
            }
        } catch (err) {
            console.error('Lỗi khi like:', err);
        }
    };

    const getTopicColor = (name) => {
        const colorMap = {
            'Công nghệ': 'blue',
            'Thông báo': 'orange',
            'Hướng dẫn': 'green',
            'Sự kiện': 'purple',
            'Cà phê': 'orange',
            'Pha chế': 'green',
            'Rang xay': 'blue',
            'Tin tức': 'red',
        };
        return colorMap[name] || 'default';
    };

    const handleClick = (slug, id) => {
        const viewedKey = `viewed_${slug}`;
        if (typeof window !== 'undefined') {
            if (!sessionStorage.getItem(viewedKey)) {
                fetch(`http://localhost:8000/api/posts/${slug}/view`, { method: 'POST' });
                sessionStorage.setItem(viewedKey, 'true');
            }
            localStorage.setItem('postid', id);
        }
        router.push(`/blog/${slug}`);
    };

    const handleTopicClick = (id) => {
        setSelectedTopic(id);
        setCurrentPage(1);
    };

    const handleResetFilter = () => {
        setSelectedTopic(null);
        setCurrentPage(1);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    // Hàm để clean HTML tags và cắt ngắn text
    const cleanAndTruncateText = (htmlText, maxLength = 100) => {
        if (!htmlText) return '';

        // Remove HTML tags
        const textOnly = htmlText
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .trim();

        if (textOnly.length <= maxLength) return textOnly;

        return textOnly.substring(0, maxLength) + '...';
    };

    const renderPostCard = (post, isPinned = false) => (
        <Col xs={24} sm={12} lg={8} key={post.id}>
            <Card
                className="post-card"
                cover={
                    post.thumbnail && (
                        <div
                            style={{
                                height: '200px',
                                overflow: 'hidden',
                                position: 'relative',
                                cursor: 'pointer',
                            }}
                            onClick={() => handleClick(post.slug, post.id)}
                        >
                            <img
                                src={post.thumbnail}
                                alt={post.title}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                }}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                            {isPinned && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '8px',
                                        left: '8px',
                                        background: '#ff4d4f',
                                        color: 'white',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                    }}
                                >
                                    Ghim
                                </div>
                            )}
                        </div>
                    )
                }
                hoverable
                style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
            >
                <div style={{ flex: 1 }}>
                    <Space size={4} wrap style={{ marginBottom: '8px' }}>
                        {post.topics?.map((topic) => (
                            <Tag
                                key={topic.id}
                                color={getTopicColor(topic.name)}
                                onClick={() => handleTopicClick(topic.id)}
                                style={{ cursor: 'pointer', fontSize: '11px' }}
                            >
                                {topic.name}
                            </Tag>
                        ))}
                    </Space>

                    <Title
                        level={5}
                        style={{
                            cursor: 'pointer',
                            marginBottom: '8px',
                            fontSize: '14px',
                            lineHeight: '1.4',
                            height: '40px',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                        }}
                        onClick={() => handleClick(post.slug, post.id)}
                    >
                        {post.title}
                    </Title>

                    {/* Hiển thị excerpt */}
                    {post.excerpt && (
                        <div style={{ marginBottom: '12px' }}>
                            <Paragraph
                                style={{
                                    fontSize: '13px',
                                    lineHeight: '1.5',
                                    color: '#666',
                                    marginBottom: '8px',
                                }}
                            >
                                {cleanAndTruncateText(post.excerpt, 120)}
                            </Paragraph>
                            <Button
                                type="link"
                                size="small"
                                onClick={() => handleClick(post.slug, post.id)}
                                style={{
                                    padding: '0',
                                    height: 'auto',
                                    fontSize: '12px',
                                    color: '#1890ff',
                                }}
                            >
                                Xem thêm →
                            </Button>
                        </div>
                    )}
                </div>

                <div style={{ marginTop: 'auto' }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingTop: '8px',
                            borderTop: '1px solid #f0f0f0',
                        }}
                    >
                        <Space size={4}>
                            <Avatar
                                size={24}
                                src="https://api.dicebear.com/7.x/miniavs/svg?seed=admin"
                                style={{ background: '#0096dbff' }}
                            />
                            <Text style={{ fontSize: '12px' }}>Admin</Text>
                            <Text type="secondary" style={{ fontSize: '11px' }}>
                                • {formatDate(post.created_at)}
                            </Text>
                        </Space>

                        <Space size={12}>
                            <Button
                                type="text"
                                icon={<HeartOutlined />}
                                size="small"
                                onClick={() => handleLike(post.id)}
                                className={post.has_liked ? 'liked' : ''}
                                style={{ fontSize: '12px' }}
                            >
                                {post.like_count || 0}
                            </Button>
                            <Button type="text" icon={<EyeOutlined />} size="small" style={{ fontSize: '12px' }}>
                                {post.views || 0}
                            </Button>
                        </Space>
                    </div>
                </div>
            </Card>
        </Col>
    );

    // Sửa lại logic hiển thị bài viết
    const getDisplayPosts = () => {
        if (selectedTopic) {
            return posts;
        }

        // Chỉ hiển thị bài ghim ở trang đầu tiên
        const shouldShowPinned = currentPage === 1;
        const shouldShowPopular = currentPage === 1;

        // Lọc bài thường: loại bỏ bài ghim khỏi danh sách posts
        const regularPosts = posts.filter((post) => !post.is_pinned);

        let displayList = [];

        if (shouldShowPinned && pinnedPosts.length > 0) {
            displayList = [...pinnedPosts];
        }

        if (shouldShowPopular && popularPosts.length > 0) {
            // Tạo Set ID của bài ghim để tránh trùng lặp
            const pinnedIds = new Set(pinnedPosts.map((p) => p.id));
            const uniquePopularPosts = popularPosts.filter((p) => !pinnedIds.has(p.id));
            displayList = [...displayList, ...uniquePopularPosts];
        }

        // Thêm bài thường (đã loại bỏ bài ghim)
        if (regularPosts.length > 0) {
            // Tạo Set ID của bài đã có để tránh trùng lặp
            const existingIds = new Set(displayList.map((p) => p.id));
            const uniqueRegularPosts = regularPosts.filter((p) => !existingIds.has(p.id));
            displayList = [...displayList, ...uniqueRegularPosts];
        }

        return displayList;
    };

    // Tính toán total chính xác cho phân trang
    const getTotalForPagination = () => {
        if (selectedTopic) {
            return posts.length;
        }

        // Tổng số bài viết thường (không bao gồm bài ghim)
        const regularPostsCount = posts.filter((post) => !post.is_pinned).length;

        // Nếu có bài ghim hoặc phổ biến, chỉ tính vào trang đầu
        const pinnedCount = pinnedPosts.length;
        const popularCount = popularPosts.filter((p) => !pinnedPosts.some((pin) => pin.id === p.id)).length;

        return regularPostsCount;
    };

    const displayPosts = getDisplayPosts();
    const totalForPagination = getTotalForPagination();

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

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f5f3f0 0%, #e8e2d8 100%)',
            }}
        >
            {/* Header Banner */}
            <div
                style={{
                    background: 'linear-gradient(135deg, rgba(161, 221, 255, 0.9) 0%, rgba(76, 83, 187, 0.9) 100%)',
                    backgroundImage:
                        'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                    color: 'white',
                    textAlign: 'center',
                    padding: '80px 20px 60px',
                    position: 'relative',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: 'url("https://i.imgur.com/4A46ADc.jpg")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: 0.3,
                        zIndex: 0,
                    }}
                />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <Title level={1} style={{ color: 'white', fontSize: '48px', marginBottom: '16px' }}>
                        Tin tức
                    </Title>
                    <Text
                        style={{
                            color: 'white',
                            fontSize: '18px',
                            display: 'block',
                            maxWidth: '600px',
                            margin: '0 auto',
                        }}
                    >
                        Khám phá thế giới cà phê qua các bài viết hấp dẫn và hữu ích
                    </Text>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
                {/* Filter notification */}
                {selectedTopic && (
                    <div
                        style={{
                            background: '#fff3cd',
                            border: '1px solid #afd5ffff',
                            borderRadius: '8px',
                            padding: '12px 16px',
                            marginBottom: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Text strong>
                            Đang hiển thị bài viết theo chủ đề: {topics.find((t) => t.id === selectedTopic)?.name}
                        </Text>
                        <Button size="small" type="link" onClick={handleResetFilter}>
                            Hiển thị tất cả
                        </Button>
                    </div>
                )}

                <Row gutter={[24, 32]}>
                    {/* Main content */}
                    <Col xs={24} lg={18}>
                        <Row gutter={[20, 24]}>
                            {displayPosts.length > 0 ? (
                                displayPosts.map((post) =>
                                    renderPostCard(post, !selectedTopic && currentPage === 1 && post.is_pinned),
                                )
                            ) : (
                                <Col span={24}>
                                    <div
                                        style={{
                                            textAlign: 'center',
                                            padding: '60px 20px',
                                            background: 'white',
                                            borderRadius: '12px',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                        }}
                                    >
                                        <Text type="secondary" style={{ fontSize: '16px' }}>
                                            {selectedTopic
                                                ? 'Không có bài viết nào thuộc chủ đề này.'
                                                : 'Không có bài viết nào.'}
                                        </Text>
                                    </div>
                                </Col>
                            )}
                        </Row>

                        {/* Pagination - chỉ hiển thị khi không lọc theo topic và có đủ bài viết */}
                        {!selectedTopic && totalForPagination > pageSize && (
                            <div
                                style={{
                                    textAlign: 'center',
                                    marginTop: '40px',
                                    padding: '20px',
                                    background: 'white',
                                    borderRadius: '12px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                }}
                            >
                                <Pagination
                                    current={currentPage}
                                    total={totalForPagination}
                                    pageSize={pageSize}
                                    showSizeChanger
                                    showQuickJumper
                                    onChange={(page, size) => {
                                        setCurrentPage(page);
                                        setPageSize(size);
                                    }}
                                    showTotal={(total, range) => `${range[0]}-${range[1]} trong tổng ${total} bài viết`}
                                    pageSizeOptions={['6', '12', '24', '48']}
                                />
                            </div>
                        )}
                    </Col>

                    {/* Sidebar */}
                    <Col xs={24} lg={6}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {/* Topics filter */}
                            <Card
                                title="TỪ KHOÁ"
                                style={{
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                }}
                                headStyle={{
                                    background: '#0096dbff',
                                    color: 'white',
                                    borderRadius: '12px 12px 0 0',
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '8px',
                                    }}
                                >
                                    {topics.map((topic) => (
                                        <Tag
                                            key={topic.id}
                                            style={{
                                                cursor: 'pointer',
                                                borderRadius: '12px',
                                                border:
                                                    selectedTopic === topic.id
                                                        ? '2px solid #0096dbff'
                                                        : '1px solid #d9d9d9',
                                            }}
                                            onClick={() => handleTopicClick(topic.id)}
                                        >
                                            {topic.name}
                                        </Tag>
                                    ))}
                                </div>
                            </Card>

                            {/* Recent posts */}
                            <Card
                                title="TIN TỨC MỚI NHẤT"
                                style={{
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                }}
                                headStyle={{
                                    background: '#d4a574',
                                    color: 'white',
                                    borderRadius: '12px 12px 0 0',
                                }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {displayPosts.slice(0, 3).map((post) => (
                                        <div
                                            key={post.id}
                                            style={{
                                                display: 'flex',
                                                gap: '12px',
                                                cursor: 'pointer',
                                                padding: '8px',
                                                borderRadius: '8px',
                                                transition: 'background 0.2s',
                                            }}
                                            onClick={() => handleClick(post.slug, post.id)}
                                            onMouseEnter={(e) => (e.target.style.background = '#f5f5f5')}
                                            onMouseLeave={(e) => (e.target.style.background = 'transparent')}
                                        >
                                            {post.thumbnail && (
                                                <img
                                                    src={post.thumbnail}
                                                    alt={post.title}
                                                    style={{
                                                        width: '60px',
                                                        height: '60px',
                                                        objectFit: 'cover',
                                                        borderRadius: '6px',
                                                    }}
                                                />
                                            )}
                                            <div style={{ flex: 1 }}>
                                                <Text
                                                    strong
                                                    style={{
                                                        fontSize: '13px',
                                                        lineHeight: '1.4',
                                                        display: 'block',
                                                        marginBottom: '4px',
                                                    }}
                                                >
                                                    {post.title}
                                                </Text>
                                                <Text type="secondary" style={{ fontSize: '11px' }}>
                                                    {formatDate(post.created_at)}
                                                </Text>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default CoffeeBlogInterface;
