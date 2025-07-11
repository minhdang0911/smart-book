'use client';
import { EyeOutlined, HeartOutlined, MoreOutlined, ShareAltOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Col, Pagination, Row, Space, Spin, Tag, Typography, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import './BlogInterface.css';

const { Title, Text, Paragraph } = Typography;

const BlogInterface = () => {
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
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
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
                const pinnedIds = new Set(pinnedPosts.map((p) => p.id));
                const popularIds = new Set(popularPosts.map((p) => p.id));
                const filtered = result.data.filter((p) => !pinnedIds.has(p.id) && !popularIds.has(p.id));
                setPosts(filtered);
                setTotal(result.meta.total);
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
        const token = localStorage.getItem('token');
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
        const map = {
            'Công nghệ': 'blue',
            'Thông báo': 'orange',
            'Hướng dẫn': 'green',
            'Sự kiện': 'purple',
        };
        return map[name] || 'default';
    };

    const handleClick = (slug, id) => {
        const viewedKey = `viewed_${slug}`;
        if (!sessionStorage.getItem(viewedKey)) {
            fetch(`http://localhost:8000/api/posts/${slug}/view`, { method: 'POST' });
            sessionStorage.setItem(viewedKey, 'true');
        }
        router.push(`/blog/${slug}`);
        localStorage.setItem('postid', id);
    };

    const handleTopicClick = (id) => {
        setSelectedTopic(id);
        setCurrentPage(1);
    };

    const handleResetFilter = () => {
        setSelectedTopic(null);
    };

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN');

    const renderPostCard = (post, isPinned = false) => (
        <Card key={post.id} className={`post-card ${isPinned ? 'pinned' : ''}`} hoverable>
            <div className="post-header">
                <Space>
                    <Avatar size={40} src="https://api.dicebear.com/7.x/miniavs/svg?seed=admin" />
                    <div className="post-author-info">
                        <Text strong>Admin</Text>
                        <div className="post-meta">
                            <Text type="secondary">{formatDate(post.created_at)}</Text>
                            <Space size={4}>
                                {post.topics.map((topic) => (
                                    <Tag
                                        key={topic.id}
                                        color={getTopicColor(topic.name)}
                                        onClick={() => handleTopicClick(topic.id)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {topic.name}
                                    </Tag>
                                ))}
                            </Space>
                        </div>
                    </div>
                </Space>
                <Button type="text" icon={<MoreOutlined />} />
            </div>

            <div className="post-content">
                <div className="post-text">
                    <Title
                        level={4}
                        className="post-title"
                        onClick={() => handleClick(post.slug, post.id)}
                        style={{ cursor: 'pointer' }}
                    >
                        {post.title} {isPinned && <Tag color="red">Ghim</Tag>}
                    </Title>
                    <Paragraph>{post.excerpt || 'Không có mô tả'}</Paragraph>
                </div>
                {post.thumbnail && (
                    <div
                        className="post-thumbnail"
                        onClick={() => handleClick(post.slug, post.id)}
                        style={{ cursor: 'pointer' }}
                    >
                        <img src={post.thumbnail} alt={post.title} onError={(e) => (e.target.style.display = 'none')} />
                    </div>
                )}
            </div>

            <div className="post-actions">
                <Space>
                    <Button
                        type="text"
                        icon={<HeartOutlined />}
                        onClick={() => handleLike(post.id)}
                        className={post.has_liked ? 'liked' : ''}
                    >
                        {post.like_count}
                    </Button>
                    <Button type="text" icon={<EyeOutlined />}>
                        {post.views}
                    </Button>
                    <Button type="text" icon={<ShareAltOutlined />}>
                        Chia sẻ
                    </Button>
                </Space>
            </div>
        </Card>
    );

    if (loading) {
        return (
            <div className="blog-loading">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="blog-container">
            <div className="blog-header">
                <Title level={2}>Bài viết nổi bật</Title>
                <Text type="secondary">Tổng hợp các bài viết hữu ích đang phổ biến với các tín đồ công nghệ</Text>
            </div>

            {selectedTopic && (
                <div style={{ marginBottom: 16 }}>
                    <Text strong>Bộ lọc chủ đề đang áp dụng</Text>{' '}
                    <Button size="small" type="link" onClick={handleResetFilter}>
                        (Hiển thị tất cả)
                    </Button>
                </div>
            )}

            <div className="blog-content">
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={16}>
                        <div className="posts-list">
                            {pinnedPosts.map((post) => renderPostCard(post, true))}
                            {popularPosts
                                .filter((post) => !pinnedPosts.find((p) => p.id === post.id))
                                .map((post) => renderPostCard(post))}
                            {posts.length > 0 ? (
                                posts.map((post) => renderPostCard(post))
                            ) : (
                                <Text type="secondary">Không có bài viết nào thuộc chủ đề này.</Text>
                            )}
                        </div>

                        {!selectedTopic && (
                            <div className="pagination-container">
                                <Pagination
                                    current={currentPage}
                                    total={total}
                                    pageSize={pageSize}
                                    showSizeChanger
                                    showQuickJumper
                                    onChange={(page, size) => {
                                        setCurrentPage(page);
                                        setPageSize(size);
                                    }}
                                    showTotal={(total, range) => `${range[0]}-${range[1]} trong tổng ${total} bài viết`}
                                    pageSizeOptions={['5', '10', '20', '50']}
                                />
                            </div>
                        )}
                    </Col>

                    <Col xs={24} md={8}>
                        <div className="sidebar">
                            <Card className="sidebar-card">
                                <Title level={4}>XEM CÁC BÀI VIẾT THEO CHỦ ĐỀ</Title>
                                <div className="topic-filter">
                                    {topics.map((topic) => (
                                        <Button
                                            key={topic.id}
                                            type="default"
                                            onClick={() => handleTopicClick(topic.id)}
                                        >
                                            {topic.name}
                                        </Button>
                                    ))}
                                </div>
                            </Card>

                            <Card className="sidebar-card ad-card">
                                <img
                                    src="https://via.placeholder.com/300x200/4CAF50/white?text=HTML+CSS+Pro"
                                    alt="HTML CSS Pro"
                                    className="ad-image"
                                />
                            </Card>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default BlogInterface;
