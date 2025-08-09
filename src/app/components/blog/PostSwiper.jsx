'use client';

import { CalendarOutlined, EyeOutlined, FireOutlined } from '@ant-design/icons';
import { Card, Col, Row, Typography } from 'antd';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const { Title, Text, Paragraph } = Typography;
const { Meta } = Card;

const PostSwiper = ({ posts }) => {
    const swiperRef = useRef(null);
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
        <div className="post-swiper-container">
            <style jsx>{`
                .post-swiper-container {
                    padding: 60px 0;
                    position: relative;
                    overflow: hidden;
                }

                .main-container {
                    max-width: 80%;
                    margin: 0 auto;
                    padding: 0 24px;
                    position: relative;
                    z-index: 1;
                }

                .section-title .ant-typography h2 {
                    color: #1f2937 !important;
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin-bottom: 16px;
                }

                .news-section {
                    margin-top: 80px;
                }

                .latest-posts {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(15px);
                    border-radius: 20px;
                    padding: 32px;
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                }

                .section-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 32px;
                }

                .section-header .ant-typography h3 {
                    color: #1f2937 !important;
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin: 0;
                }

                .latest-post-card {
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(0, 0, 0, 0.08);
                    border-radius: 16px;
                    padding: 24px;
                    height: 100%;
                    transition: all 0.3s ease;
                    cursor: pointer;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
                }

                .latest-post-card:hover {
                    background: rgba(255, 255, 255, 0.95);
                    transform: translateY(-4px);
                    border-color: rgba(0, 0, 0, 0.15);
                    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
                }

                .latest-post-card .post-date-text {
                    color: #f59e0b;
                    font-size: 14px;
                    font-weight: 500;
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .latest-post-card .ant-typography h4 {
                    color: #1f2937 !important;
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 12px;
                    line-height: 1.4;
                }

                .latest-post-card .ant-typography p {
                    color: #4b5563 !important;
                    line-height: 1.5;
                    margin: 0;
                }

                .popular-posts {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(15px);
                    border-radius: 20px;
                    padding: 32px;
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                }

                .popular-post-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    padding: 16px;
                    border-radius: 12px;
                    transition: all 0.3s ease;
                    background: rgba(255, 255, 255, 0.6);
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    margin-bottom: 12px;
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
                }

                .popular-post-item:hover {
                    background: rgba(255, 255, 255, 0.9);
                    transform: translateX(8px);
                    border-color: rgba(0, 0, 0, 0.1);
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
                }

                .popular-post-thumbnail {
                    width: 64px;
                    height: 64px;
                    border-radius: 12px;
                    object-fit: cover;
                    flex-shrink: 0;
                    border: 2px solid rgba(0, 0, 0, 0.08);
                    filter: brightness(0.9) contrast(1.1);
                    transition: all 0.3s ease;
                }

                .popular-post-item:hover .popular-post-thumbnail {
                    filter: brightness(1) contrast(1.2);
                    border-color: rgba(0, 0, 0, 0.15);
                }

                .popular-post-content h4 {
                    color: #1f2937 !important;
                    font-size: 15px;
                    font-weight: 500;
                    margin-bottom: 8px;
                    line-height: 1.3;
                }

                .popular-post-views {
                    color: #6b7280;
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                @media (max-width: 768px) {
                    .news-section .ant-row {
                        flex-direction: column;
                    }

                    .section-title .ant-typography h2 {
                        font-size: 2rem;
                    }
                }
            `}</style>

            <div className="main-container">
                <Row gutter={[40, 32]} className="news-section">
                    <Col xs={24} lg={16}>
                        <div className="latest-posts">
                            <div className="section-header">
                                <span style={{ fontSize: '24px' }}>🆕</span>
                                <Title level={3}>Bài viết mới nhất</Title>
                            </div>
                            <Row gutter={[24, 24]}>
                                {latestPosts.map((post) => (
                                    <Col xs={24} md={12} key={post.id}>
                                        <Link href={`/blog/${post.slug}`}>
                                            <div className="latest-post-card">
                                                <div className="post-date-text">
                                                    <CalendarOutlined />
                                                    {formatDate(post.created_at)}
                                                </div>
                                                <Title level={4}>{post.title}</Title>
                                                <Paragraph>{truncateText(post.excerpt, 100)}</Paragraph>
                                            </div>
                                        </Link>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    </Col>

                    <Col xs={24} lg={8}>
                        <div className="popular-posts">
                            <div className="section-header">
                                <FireOutlined style={{ fontSize: '24px', color: '#ef4444' }} />
                                <Title level={3}>Được xem nhiều</Title>
                            </div>
                            {mostViewedPosts.map((post) => (
                                <Link href={`/blog/${post.slug}`} key={post.id}>
                                    <div className="popular-post-item">
                                        <img
                                            src={post.thumbnail || '/default-thumbnail.jpg'}
                                            alt={post.title}
                                            className="popular-post-thumbnail"
                                        />
                                        <div className="popular-post-content">
                                            <Title level={4}>{post.title}</Title>
                                            <div className="popular-post-views">
                                                <EyeOutlined />
                                                <span>{post.views} lượt xem</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default PostSwiper;
