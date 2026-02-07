'use client';

import { CalendarOutlined, EyeOutlined, FireOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Col, Row, Typography } from 'antd';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './post-swiper.css';

const { Title, Paragraph } = Typography;

const PostSwiper = ({ posts }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [progressPercent, setProgressPercent] = useState(0);

    useEffect(() => {
        const initialProgress = posts.length > 0 ? (1 / posts.length) * 100 : 0;
        setProgressPercent(initialProgress);
    }, [posts]);

    const formatDate = (dateString) => {
        const [day, month, year] = dateString.split('/');
        const date = new Date(year, month - 1, day);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${day} ${months[date.getMonth()]} ${year}`;
    };

    const truncateText = (text, maxLength = 100) => {
        if (!text) return '';
        const cleanText = text.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ');
        return cleanText.length > maxLength ? cleanText.substring(0, maxLength).trim() + '...' : cleanText;
    };

    const handleSlideChange = (swiper) => {
        const current = swiper.realIndex;
        setCurrentSlide(current);
        const progress = ((current + 1) / posts.length) * 100;
        setProgressPercent(progress);
    };

    const latestPosts = useMemo(() => {
        return [...posts]
            .sort((a, b) => {
                const [da, ma, ya] = a.created_at.split('/');
                const [db, mb, yb] = b.created_at.split('/');
                const dateA = new Date(+ya, +ma - 1, +da);
                const dateB = new Date(+yb, +mb - 1, +db);
                return dateB - dateA;
            })
            .slice(0, 4);
    }, [posts]);

    const mostViewedPosts = useMemo(() => {
        return [...posts].sort((a, b) => b.views - a.views).slice(0, 6);
    }, [posts]);

    return (
        <div className="ps-wrap">
            <div className="ps-container">
                <Row gutter={[24, 24]} className="ps-grid">
                    <Col xs={24} lg={16}>
                        <section className="ps-panel">
                            <header className="ps-header">
                                <span className="ps-headerIcon ps-headerIcon--new">
                                    <ThunderboltOutlined />
                                </span>
                                <div className="ps-headerText">
                                    <Title level={3} className="ps-title">
                                        Bài viết mới nhất
                                    </Title>
                                    <div className="ps-subtitle">Cập nhật theo thời gian gần nhất</div>
                                </div>
                            </header>

                            <Row gutter={[16, 16]}>
                                {latestPosts.map((post) => (
                                    <Col xs={24} md={12} key={post.id}>
                                        <Link href={`/blog/${post.slug}`} className="ps-link">
                                            <article className="ps-card">
                                                <div className="ps-meta">
                                                    <span className="ps-date">
                                                        <CalendarOutlined />
                                                        {formatDate(post.created_at)}
                                                    </span>
                                                </div>

                                                <Title level={4} className="ps-cardTitle">
                                                    {post.title}
                                                </Title>

                                                <Paragraph className="ps-cardDesc">
                                                    {truncateText(post.excerpt, 100)}
                                                </Paragraph>
                                            </article>
                                        </Link>
                                    </Col>
                                ))}
                            </Row>
                        </section>
                    </Col>

                    <Col xs={24} lg={8}>
                        <aside className="ps-panel">
                            <header className="ps-header">
                                <span className="ps-headerIcon ps-headerIcon--hot">
                                    <FireOutlined />
                                </span>
                                <div className="ps-headerText">
                                    <Title level={3} className="ps-title">
                                        Được xem nhiều
                                    </Title>
                                    <div className="ps-subtitle">Top bài viết theo lượt xem</div>
                                </div>
                            </header>

                            <div className="ps-list">
                                {mostViewedPosts.map((post) => (
                                    <Link href={`/blog/${post.slug}`} key={post.id} className="ps-link">
                                        <div className="ps-item">
                                            <img
                                                src={post.thumbnail || '/default-thumbnail.jpg'}
                                                alt={post.title}
                                                className="ps-thumb"
                                                loading="lazy"
                                            />
                                            <div className="ps-itemBody">
                                                <div className="ps-itemTitle">{post.title}</div>
                                                <div className="ps-views">
                                                    <EyeOutlined />
                                                    <span>{post.views} lượt xem</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </aside>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default PostSwiper;
