'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

const PostSwiper = ({ posts }) => {
    const swiperRef = useRef(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [progressWidth, setProgressWidth] = useState(0);

    useEffect(() => {
        const initialProgress = posts.length > 0 ? (1 / posts.length) * 100 : 0;
        setProgressWidth(initialProgress);
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
        setProgressWidth(progress);
    };

    return (
        <div className="vietnam-post-swiper">
            {/* Background overlay */}
            <div className="bg-overlay" />

            <div className="container">
                {/* Header */}
                <div className="section-header">
                    <h2 className="section-title">Vietnam Post Logistics Tin tức</h2>
                </div>

                {/* Swiper Container với Navigation */}
                <div className="swiper-container">
                    {/* Navigation Buttons */}
                    <button className="custom-prev nav-btn">←</button>
                    <button className="custom-next nav-btn">→</button>

                    <Swiper
                        ref={swiperRef}
                        modules={[Navigation, Pagination, Autoplay]}
                        spaceBetween={20}
                        slidesPerView={1}
                        navigation={{
                            prevEl: '.custom-prev',
                            nextEl: '.custom-next',
                        }}
                        autoplay={{
                            delay: 4000,
                            disableOnInteraction: false,
                        }}
                        loop={posts.length > 1}
                        speed={600}
                        breakpoints={{
                            640: { slidesPerView: 2 },
                            768: { slidesPerView: 3 },
                            1024: { slidesPerView: 4 },
                        }}
                        onSlideChange={handleSlideChange}
                        className="posts-swiper"
                    >
                        {posts.map((post) => (
                            <SwiperSlide key={post.id}>
                                <Link href={`/blog/${post.slug}`}>
                                    <div className="post-card">
                                        {/* Image */}
                                        <div className="post-image-container">
                                            <img
                                                src={post.thumbnail || '/default-thumbnail.jpg'}
                                                alt={post.title}
                                                className="post-image"
                                                loading="lazy"
                                            />

                                            {/* Category Badge */}
                                            <div className="category-badge">
                                                {post.topics?.[0]?.name || 'Logistics'}
                                            </div>

                                            {/* Date */}
                                            <div className="date-overlay">{formatDate(post.created_at)}</div>
                                        </div>

                                        {/* Content */}
                                        <div className="post-content">
                                            <div className="post-text-content">
                                                <h3 className="post-title">{post.title}</h3>

                                                {post.excerpt && (
                                                    <p className="post-excerpt">{truncateText(post.excerpt, 80)}</p>
                                                )}
                                            </div>

                                            <div className="post-meta">
                                                <span className="author">Vietnam Post</span>
                                                {post.views > 0 && <span>{post.views} views</span>}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                {/* Progress Bar */}
                <div className="progress-container">
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progressWidth}%` }} />
                    </div>
                    <span className="progress-text">
                        {currentSlide + 1} / {posts.length}
                    </span>
                </div>

                {/* View All Button - Styled like in the image */}
                <div className="view-all-section">
                    <Link href="/blog" className="view-all-btn">
                        <span>XEM TẤT CẢ TIN</span>
                    </Link>
                </div>
            </div>

            <style jsx>{`
                .vietnam-post-swiper {
                    background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
                    min-height: 600px;
                    padding: 40px 20px;
                    position: relative;
                    overflow: hidden;
                }

                .bg-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.2) 0%, transparent 50%);
                    pointer-events: none;
                }

                .container {
                    position: relative;
                    z-index: 2;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .section-header {
                    text-align: center;
                    margin-bottom: 40px;
                }

                .section-title {
                    color: white;
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin-bottom: 30px;
                    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
                }

                /* Swiper Container với Navigation rộng hơn */
                .swiper-container {
                    position: relative;
                    padding: 20px 80px 60px; /* Tăng padding left/right để tạo khoảng cách cho navigation */
                }

                .posts-swiper {
                    position: relative;
                }

                .post-card {
                    background: white;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
                    transition: all 0.3s ease;
                    height: 420px; /* Fixed height cho tất cả cards */
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                }

                .post-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
                }

                .post-image-container {
                    position: relative;
                    height: 200px;
                    overflow: hidden;
                }

                .post-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.5s ease;
                }

                .post-card:hover .post-image {
                    transform: scale(1.1);
                }

                .category-badge {
                    position: absolute;
                    bottom: 12px;
                    left: 12px;
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                    color: white;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    box-shadow: 0 2px 10px rgba(245, 158, 11, 0.4);
                    z-index: 2;
                }

                .date-overlay {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    background: rgba(0, 0, 0, 0.7);
                    color: white;
                    padding: 4px 8px;
                    border-radius: 8px;
                    font-size: 11px;
                    backdrop-filter: blur(10px);
                    z-index: 2;
                }

                .post-content {
                    padding: 20px;
                    flex: 1; /* Chiếm hết không gian còn lại */
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }

                .post-title {
                    font-size: 16px;
                    font-weight: 700;
                    color: #1f2937;
                    margin-bottom: 12px;
                    line-height: 1.4;
                    height: 44px; /* Fixed height thay vì min-height */
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .post-excerpt {
                    color: #6b7280;
                    font-size: 14px;
                    line-height: 1.5;
                    margin-bottom: 15px;
                    height: 42px; /* Fixed height thay vì min-height */
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                /* Container cho title và excerpt */
                .post-text-content {
                    flex: 1;
                }

                .post-meta {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-size: 12px;
                    color: #9ca3af;
                    padding-top: 12px;
                    border-top: 1px solid #f3f4f6;
                }

                .author {
                    font-weight: 600;
                    color: #4f46e5;
                }

                /* Navigation Buttons - Positioned outside swiper area */
                .nav-btn {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    color: white;
                    font-size: 20px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(10px);
                    z-index: 10;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                }

                .custom-prev {
                    left: 10px; /* Xa hơn từ content */
                }

                .custom-next {
                    right: 10px; /* Xa hơn từ content */
                }

                .nav-btn:hover {
                    background: rgba(255, 255, 255, 0.3);
                    transform: translateY(-50%) scale(1.1);
                    border-color: rgba(255, 255, 255, 0.5);
                }

                .progress-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 20px;
                    margin-top: 30px;
                }

                .progress-bar {
                    width: 500px;
                    height: 4px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 2px;
                    overflow: hidden;
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #fbbf24, #f59e0b);
                    border-radius: 2px;
                    transition: width 0.5s ease;
                    box-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
                }

                .progress-text {
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 14px;
                    font-weight: 500;
                    min-width: 50px;
                }

                .view-all-section {
                    text-align: center;
                    margin-top: 40px;
                }

                /* View All Button - Styled like in the image */
                .view-all-btn {
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                    color: white;
                    border: none;
                    padding: 16px 40px;
                    border-radius: 50px;
                    font-weight: 700;
                    font-size: 16px;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 15px;
                    transition: all 0.3s ease;
                    box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
                    position: relative;
                    overflow: hidden;
                }

                .view-all-btn::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                    transition: left 0.5s ease;
                }

                .view-all-btn:hover::before {
                    left: 100%;
                }

                .view-all-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 15px 35px rgba(245, 158, 11, 0.6);
                    color: white;
                    text-decoration: none;
                }

                .arrow-icon {
                    background: rgba(255, 255, 255, 0.2);
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                }

                .view-all-btn:hover .arrow-icon {
                    background: rgba(255, 255, 255, 0.3);
                    transform: translateX(4px);
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .section-title {
                        font-size: 2rem;
                    }

                    .vietnam-post-swiper {
                        padding: 30px 15px;
                    }

                    .swiper-container {
                        padding: 20px 60px 60px; /* Giảm padding trên mobile */
                    }

                    .nav-btn {
                        width: 45px;
                        height: 45px;
                        font-size: 18px;
                    }

                    .custom-prev {
                        left: 5px;
                    }

                    .custom-next {
                        right: 5px;
                    }

                    .view-all-btn {
                        padding: 14px 32px;
                        font-size: 15px;
                    }

                    .post-card {
                        height: 380px; /* Giảm chiều cao trên mobile */
                    }
                }
            `}</style>
        </div>
    );
};

export default PostSwiper;
