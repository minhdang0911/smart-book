'use client';
import { EyeOutlined, HeartOutlined, MoreOutlined, ShareAltOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Col, Pagination, Row, Space, Spin, Tag, Typography, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import './BlogInterface.css';
// import PostDetail from './';

const { Title, Text, Paragraph } = Typography;

const BlogInterface = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [selectedPost, setSelectedPost] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchPosts(currentPage);
    }, [currentPage]);

    const fetchPosts = async (page) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/api/posts?page=${page}&per_page=${pageSize}`);
            const result = await response.json();

            if (result.success) {
                setPosts(result.data);
                setTotal(result.meta.total);
                setCurrentPage(result.meta.current_page);
                setPageSize(result.meta.per_page);
            } else {
                message.error('Không thể tải danh sách bài viết');
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
            message.error('Lỗi kết nối API');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page, size) => {
        setCurrentPage(page);
        setPageSize(size);
    };

    const handleLike = async (postId) => {
        try {
            // Call like API
            const response = await fetch(`http://localhost:8000/api/posts/${postId}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                // Refresh posts after like
                fetchPosts(currentPage);
            }
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    const getTopicColor = (topicName) => {
        const colors = {
            'Công nghệ': 'blue',
            'Thông báo': 'orange',
            'Hướng dẫn': 'green',
            'Sự kiện': 'purple',
        };
        return colors[topicName] || 'default';
    };

    const handlePostClick = (post) => {
        setSelectedPost(post);
        setShowDetail(true);
    };

    const handleBackToList = () => {
        setShowDetail(false);
        setSelectedPost(null);
    };

    const formatDate = (dateString) => {
        return dateString; // Already formatted from API
    };

    // Show post detail if selected
    // if (showDetail && selectedPost) {
    //     return <PostDetail slug={selectedPost.slug} onBack={handleBackToList} />;
    // }

    if (loading) {
        return (
            <div className="blog-loading">
                <Spin size="large" />
            </div>
        );
    }

    const handleClick = (slug) => {
        router.push(`/blog/${slug}`);
    };

    return (
        <div className="blog-container">
            <div className="blog-header">
                <Title level={2}>Bài viết nổi bật</Title>
                <Text type="secondary">
                    Tổng hợp các bài viết có ích và thông tin hữu ích đang phổ biến với các tín đồ công nghệ
                </Text>
            </div>

            <div className="blog-content">
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={16}>
                        <div className="posts-list">
                            {posts.map((post) => (
                                <Card key={post.id} className={`post-card ${post.is_pinned ? 'pinned' : ''}`} hoverable>
                                    <div className="post-header">
                                        <Space>
                                            <Avatar
                                                size={40}
                                                src="https://api.dicebear.com/7.x/miniavs/svg?seed=admin"
                                            />
                                            <div className="post-author-info">
                                                <Text strong>Admin</Text>
                                                <div className="post-meta">
                                                    <Text type="secondary" className="post-date">
                                                        {formatDate(post.created_at)}
                                                    </Text>
                                                    <Space size={4}>
                                                        {post.topics.map((topic) => (
                                                            <Tag
                                                                key={topic.id}
                                                                color={getTopicColor(topic.name)}
                                                                size="small"
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
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handlePostClick(post)}
                                            >
                                                {post.title}
                                                {post.is_pinned && (
                                                    <Tag color="red" className="pinned-tag">
                                                        Ghim
                                                    </Tag>
                                                )}
                                            </Title>
                                            <Paragraph className="post-excerpt">
                                                {post.excerpt || 'Không có mô tả'}
                                            </Paragraph>
                                        </div>
                                        {post.thumbnail && (
                                            <div
                                                className="post-thumbnail"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleClick(post.slug)}
                                            >
                                                <img
                                                    src={post.thumbnail}
                                                    alt={post.title}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
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
                            ))}
                        </div>

                        <div className="pagination-container">
                            <Pagination
                                current={currentPage}
                                total={total}
                                pageSize={pageSize}
                                showSizeChanger
                                showQuickJumper
                                showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} bài viết`}
                                onChange={handlePageChange}
                                pageSizeOptions={['5', '10', '20', '50']}
                            />
                        </div>
                    </Col>

                    <Col xs={24} md={8}>
                        <div className="sidebar">
                            <Card className="sidebar-card">
                                <Title level={4}>XEM CÁC BÀI VIẾT THEO CHỦ ĐỀ</Title>
                                <div className="topic-filter">
                                    <Button type="default" className="active">
                                        Front-end / Mobile apps
                                    </Button>
                                    <Button type="default">Back-end / DevOps</Button>
                                    <Button type="default">UI / UX / Design</Button>
                                    <Button type="default">Others</Button>
                                </div>
                            </Card>

                            <Card className="sidebar-card ad-card">
                                <img
                                    src="https://via.placeholder.com/300x200/4CAF50/white?text=HTML+CSS+Pro"
                                    alt="HTML CSS Pro"
                                    className="ad-image"
                                />
                            </Card>

                            <Card className="sidebar-card ad-card">
                                <img
                                    src="https://via.placeholder.com/300x200/2196F3/white?text=F8+Official"
                                    alt="F8 Official"
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
