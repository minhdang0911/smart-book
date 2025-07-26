'use client';
import { useRouter } from 'next/navigation';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useAllPosts } from '../../hooks/usePosts';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const PostList = () => {
    const { posts, isLoading, error } = useAllPosts(1, 10);
    const router = useRouter();

    if (isLoading)
        return (
            <div className="loading-container">
                <p>Đang tải bài viết...</p>
            </div>
        );

    if (error)
        return (
            <div className="error-container">
                <p>Lỗi khi tải bài viết: {error.message}</p>
            </div>
        );

    const handlePostClick = (slug) => {
        router.push(`/posts/${slug}`);
    };

    return (
        <div className="post-list-container">
         

            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={20}
                slidesPerView={1}
                navigation={{
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                }}
                pagination={{
                    clickable: true,
                    bulletClass: 'swiper-pagination-bullet',
                    bulletActiveClass: 'swiper-pagination-bullet-active',
                }}
                autoplay={{
                    delay: 4000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                }}
                loop={true}
                breakpoints={{
                    640: {
                        slidesPerView: 2,
                    },
                    768: {
                        slidesPerView: 3,
                    },
                    1024: {
                        slidesPerView: 4,
                    },
                    1200: {
                        slidesPerView: 5,
                    },
                }}
                className="posts-swiper"
            >
                {posts.map((post) => (
                    <SwiperSlide key={post.id}>
                        <div className="post-card" onClick={() => handlePostClick(post.slug)}>
                            <div className="post-image-container">
                                <img src={post.thumbnail} alt={post.title} className="post-image" />
                                <div className="category-badge">{post.category || 'LIFESTYLE'}</div>
                            </div>

                            <div className="post-content">
                                <h3 className="post-title">{post.title}</h3>

                                <div className="post-meta">
                                    <span className="post-date">
                                        📅 {new Date(post.created_at).toLocaleDateString('vi-VN')}
                                    </span>
                                    <span className="post-author">👤 {post.author || 'monamedia'}</span>
                                </div>

                                <div className="read-more">
                                    <span>Read more</span>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Custom Navigation Buttons */}
            <div className="swiper-button-prev custom-nav-btn"></div>
            <div className="swiper-button-next custom-nav-btn"></div>

            <style jsx>{`
                .post-list-container {
                    max-width: 80%;
                    margin: 0 auto;
                    padding: 20px;
                    background: #f8f9fa;
                    position: relative;
                }

                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }

                .section-title {
                    font-size: 2rem;
                    font-weight: 600;
                    color: #333;
                    margin: 0;
                    position: relative;
                }

                .section-title::after {
                    content: '';
                    display: block;
                    width: 60px;
                    height: 3px;
                    background: linear-gradient(45deg, #4caf50, #8bc34a);
                    margin: 10px auto;
                    border-radius: 2px;
                }

                .posts-swiper {
                    padding: 20px 0;
                    position: relative;
                }

                .post-card {
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                    cursor: pointer;
                    transition: all 0.3s ease;
                    height: 420px;
                    display: flex;
                    flex-direction: column;
                }

                .post-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                }

                .post-image-container {
                    position: relative;
                    height: 240px;
                    overflow: hidden;
                }

                .post-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.3s ease;
                }

                .post-card:hover .post-image {
                    transform: scale(1.05);
                }

                .category-badge {
                    position: absolute;
                    top: 12px;
                    left: 12px;
                    background: rgba(76, 175, 80, 0.9);
                    color: white;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .post-content {
                    padding: 20px;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }

                .post-title {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #333;
                    margin: 0 0 15px 0;
                    line-height: 1.4;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .post-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                    font-size: 0.8rem;
                    color: #666;
                }

                .post-date,
                .post-author {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .read-more {
                    text-align: center;
                    margin-top: auto;
                }

                .read-more span {
                    color: #4caf50;
                    font-weight: 600;
                    text-decoration: underline;
                    font-size: 0.9rem;
                    transition: color 0.3s ease;
                }

                .post-card:hover .read-more span {
                    color: #388e3c;
                }

                /* Custom Navigation Styles */
                .custom-nav-btn {
                    background: rgba(255, 255, 255, 0.95);
                    color: #4caf50 !important;
                    border-radius: 50%;
                    width: 45px !important;
                    height: 45px !important;
                    margin-top: -22px !important;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
                    transition: all 0.3s ease;
                    opacity: 0;
                    visibility: hidden;
                    z-index: 10;
                }

                .post-list-container:hover .custom-nav-btn {
                    opacity: 1;
                    visibility: visible;
                }

                .custom-nav-btn:hover {
                    background: #4caf50;
                    color: white !important;
                    transform: scale(1.15);
                    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.3);
                }

                .custom-nav-btn::after {
                    font-size: 18px !important;
                    font-weight: bold;
                }

                .swiper-button-prev {
                    left: -25px !important;
                }

                .swiper-button-next {
                    right: -25px !important;
                }

                /* Pagination Styles */
                :global(.swiper-pagination-bullet) {
                    background: #ddd;
                    opacity: 1;
                    transition: all 0.3s ease;
                }

                :global(.swiper-pagination-bullet-active) {
                    background: #4caf50;
                    transform: scale(1.2);
                }

                /* Loading and Error Styles */
                .loading-container,
                .error-container {
                    text-align: center;
                    padding: 40px;
                    font-size: 1.1rem;
                    color: #666;
                }

                .error-container {
                    color: #d32f2f;
                }

                /* Responsive Design */
                @media (max-width: 768px) {
                    .post-list-container {
                        padding: 15px;
                    }

                    .section-title {
                        font-size: 1.5rem;
                    }

                    .post-card {
                        height: 380px;
                    }

                    .post-image-container {
                        height: 220px;
                    }

                    .post-content {
                        padding: 15px;
                    }

                    .custom-nav-btn {
                        width: 40px !important;
                        height: 40px !important;
                        opacity: 1 !important;
                        visibility: visible !important;
                    }

                    .swiper-button-prev {
                        left: -20px !important;
                    }

                    .swiper-button-next {
                        right: -20px !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default PostList;
