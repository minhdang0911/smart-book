    'use client';

    import { ArrowLeftOutlined, CalendarOutlined, EyeOutlined, HeartOutlined, ShareAltOutlined } from '@ant-design/icons';
    import { Avatar, Breadcrumb, Button, Card, Space, Spin, Tag, Typography, message } from 'antd';
    import { useEffect, useState } from 'react';
    // import './PostDetail.css';

    const { Title, Text, Paragraph } = Typography;

    const PostDetail = ({ slug, onBack }) => {
        const [post, setPost] = useState(null);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            if (slug) {
                fetchPostDetail(slug);
            }
        }, [slug]);

        const fetchPostDetail = async (postSlug) => {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:8000/api/posts/${postSlug}`);
                const result = await response.json();

                if (result.success) {
                    setPost(result.data);
                } else {
                    message.error('Không thể tải chi tiết bài viết');
                }
            } catch (error) {
                console.error('Lỗi khi gọi API:', error);
                message.error('Lỗi kết nối API');
            } finally {
                setLoading(false);
            }
        };

        const handleLike = async () => {
            if (!post) return;

            try {
                const response = await fetch(`http://localhost:8000/api/posts/${post.id}/like`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    setPost((prev) => ({
                        ...prev,
                        has_liked: !prev.has_liked,
                        like_count: prev.has_liked ? prev.like_count - 1 : prev.like_count + 1,
                    }));
                }
            } catch (error) {
                console.error('Error liking post:', error);
                message.error('Không thể thích bài viết');
            }
        };

        const handleShare = () => {
            if (!post) return;

            if (navigator.share) {
                navigator.share({
                    title: post.title,
                    text: post.excerpt || post.title,
                    url: window.location.href,
                });
            } else {
                navigator.clipboard.writeText(window.location.href);
                message.success('Đã copy link bài viết');
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

        if (loading) {
            return (
                <div className="post-detail-loading">
                    <Spin size="large" />
                </div>
            );
        }

        if (!post) {
            return (
                <div className="post-detail-error">
                    <Title level={3}>Không tìm thấy bài viết</Title>
                    <Button type="primary" onClick={onBack} icon={<ArrowLeftOutlined />}>
                        Quay lại
                    </Button>
                </div>
            );
        }

        return (
            <div className="post-detail-container">
                <div className="post-detail-header">
                    <Breadcrumb>
                        <Breadcrumb.Item>
                            <Button type="link" onClick={onBack} icon={<ArrowLeftOutlined />}>
                                Trang chủ
                            </Button>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>Chi tiết bài viết</Breadcrumb.Item>
                    </Breadcrumb>
                </div>

                <Card className="post-detail-card">
                    <div className="post-detail-meta">
                        <Space>
                            <Avatar size={50} src="https://api.dicebear.com/7.x/miniavs/svg?seed=admin" />
                            <div className="post-author-info">
                                <Text strong>Admin</Text>
                                <div className="post-meta-info">
                                    <Space size={16}>
                                        <Space size={4}>
                                            <CalendarOutlined />
                                            <Text type="secondary">{post.created_at}</Text>
                                        </Space>
                                        <Space size={4}>
                                            <EyeOutlined />
                                            <Text type="secondary">{post.views} lượt xem</Text>
                                        </Space>
                                    </Space>
                                </div>
                            </div>
                        </Space>
                    </div>

                    <div className="post-detail-content">
                        <div className="post-title-section">
                            <Title level={1} className="post-title">
                                {post.title}
                                {post.is_pinned && (
                                    <Tag color="red" className="pinned-tag">
                                        Ghim
                                    </Tag>
                                )}
                            </Title>

                            <div className="post-topics">
                                {post.topics.map((topic) => (
                                    <Tag key={topic.id} color={getTopicColor(topic.name)} size="default">
                                        {topic.name}
                                    </Tag>
                                ))}
                            </div>
                        </div>

                        {post.thumbnail && (
                            <div className="post-thumbnail">
                                <img
                                    src={post.thumbnail}
                                    alt={post.title}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </div>
                        )}

                        {post.excerpt && (
                            <div className="post-excerpt">
                                <Paragraph className="excerpt-text">{post.excerpt}</Paragraph>
                            </div>
                        )}

                        <div className="post-content-body">
                            <div
                                className="content-html"
                                dangerouslySetInnerHTML={{
                                    __html: post.content || 'Nội dung đang được cập nhật...',
                                }}
                            />
                        </div>
                    </div>

                    <div className="post-detail-actions">
                        <Space size={16}>
                            <Button
                                type={post.has_liked ? 'primary' : 'default'}
                                icon={<HeartOutlined />}
                                onClick={handleLike}
                                className={post.has_liked ? 'liked' : ''}
                            >
                                {post.like_count} Thích
                            </Button>
                            <Button type="default" icon={<ShareAltOutlined />} onClick={handleShare}>
                                Chia sẻ
                            </Button>
                        </Space>
                    </div>
                </Card>
            </div>
        );
    };

    export default PostDetail;
