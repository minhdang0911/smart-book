'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles - Đảm bảo import đúng thứ tự
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const VoyageSlider = () => {
    const [banners, setBanners] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const swiperRef = useRef(null);

    // Fallback content nếu API không có dữ liệu
    // const fallbackContent = [
    //     {
    //         id: 1,
    //         title: 'Khám Phá Thế Giới Sách',
    //         description: 'Hành trình tri thức bắt đầu từ đây. Khám phá hàng nghìn cuốn sách hay.',
    //         image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    //         book_id: 1,
    //         status: 1,
    //         priority: 1,
    //     },
    //     {
    //         id: 2,
    //         title: 'Ưu Đãi Đặc Biệt',
    //         description: 'Giảm giá lên đến 50% cho tất cả sách bestseller. Cơ hội không thể bỏ lỡ!',
    //         image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    //         book_id: 2,
    //         status: 1,
    //         priority: 2,
    //     },
    //     {
    //         id: 3,
    //         title: 'Sách Mới Nhất 2025',
    //         description: 'Cập nhật những cuốn sách mới nhất và được yêu thích nhất năm 2025.',
    //         image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    //         book_id: 3,
    //         status: 1,
    //         priority: 3,
    //     },
    // ];

    // Fetch banners from API với filtering và sorting
    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const response = await fetch('https://smartbook.io.vn/api/banners/get');
                const data = await response.json();

                if (data.success && data.data.length > 0) {
                    // Filter chỉ lấy banner có status = 1 và sort theo priority
                    const filteredBanners = data.data
                        .filter((banner) => banner.status === 1)
                        .sort((a, b) => (a.priority || 999) - (b.priority || 999));

                    setBanners(filteredBanners.length > 0 ? filteredBanners : fallbackContent);
                } else {
                    setBanners(fallbackContent);
                }
            } catch (error) {
                console.error('Error fetching banners:', error);
                setBanners(fallbackContent);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBanners();
    }, []);

    if (isLoading) {
        return (
            <div style={styles.loading}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText}>Đang tải banner...</p>
            </div>
        );
    }

    if (banners.length === 0) {
        return (
            <div style={styles.emptyState}>
                <p>Không có banner nào được hiển thị</p>
            </div>
        );
    }

    return (
        <div style={styles.voyageSlider}>
            <Swiper
                ref={swiperRef}
                modules={[Navigation, Pagination, Autoplay, EffectFade]}
                effect="fade"
                fadeEffect={{
                    crossFade: true,
                }}
                speed={800}
                autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                }}
                loop={true}
                navigation={{
                    nextEl: '.swiper-button-next-custom',
                    prevEl: '.swiper-button-prev-custom',
                }}
                pagination={{
                    el: '.swiper-pagination-custom',
                    clickable: true,
                    renderBullet: function (index, className) {
                        return `<span class="${className} custom-bullet"></span>`;
                    },
                }}
                className="voyage-swiper"
                style={{ width: '100%', height: '100%' }}
            >
                {banners.map((banner, index) => (
                    <SwiperSlide key={banner.id || index} style={styles.slide}>
                        {/* Background Image */}
                        <div
                            style={{
                                ...styles.backgroundImage,
                                backgroundImage: `url(${
                                    banner.image ||
                                    banner.link ||
                                    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
                                })`,
                            }}
                        >
                            <div style={styles.overlay}></div>
                        </div>

                        {/* Content Overlay */}
                        <div style={styles.contentWrapper}>
                            <div style={styles.contentContainer}>
                                <div style={styles.textContent}>
                                    {banner.title && <h1 style={styles.title}>{banner.title}</h1>}
                                    {banner.description && <p style={styles.description}>{banner.description}</p>}
                                    <div style={styles.buttonGroup}>
                                        <Link href={`/book/${banner.book_id}`} style={styles.primaryButton}>
                                            Xem Chi Tiết
                                            <svg
                                                style={styles.icon}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                                                />
                                            </svg>
                                        </Link>
                                        <button style={styles.secondaryButton}>Tìm Hiểu Thêm</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Custom Navigation */}
            <button className="swiper-button-prev-custom" style={{ ...styles.navButton, left: '20px' }}>
                <svg style={styles.navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            <button className="swiper-button-next-custom" style={{ ...styles.navButton, right: '20px' }}>
                <svg style={styles.navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Custom Pagination */}
            <div className="swiper-pagination-custom" style={styles.pagination}></div>
        </div>
    );
};

const styles = {
    loading: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '500px',
        backgroundColor: '#f8fafc',
        borderRadius: '20px',
        gap: '16px',
    },
    spinner: {
        width: '48px',
        height: '48px',
        border: '4px solid #e2e8f0',
        borderTop: '4px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    loadingText: {
        color: '#64748b',
        fontSize: '16px',
        margin: 0,
    },
    emptyState: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '500px',
        backgroundColor: '#f8fafc',
        borderRadius: '20px',
        color: '#64748b',
        fontSize: '18px',
    },
    voyageSlider: {
        position: 'relative',
        width: '100%',
        height: '500px',
        borderRadius: '20px',
        overflow: 'hidden',
        backgroundColor: '#1e293b',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
    },
    slide: {
        position: 'relative',
        width: '100%',
        height: '100%',
    },
    backgroundImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.4) 50%, transparent 100%)',
    },
    contentWrapper: {
        position: 'relative',
        zIndex: 10,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
    },
    contentContainer: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 48px',
        width: '100%',
    },
    textContent: {
        color: 'white',
        maxWidth: '600px',
    },
    priorityBadge: {
        display: 'inline-block',
        padding: '8px 16px',
        backgroundColor: 'rgba(59, 130, 246, 0.9)',
        borderRadius: '50px',
        fontSize: '14px',
        fontWeight: 'normal',
        marginBottom: '20px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    title: {
        fontSize: '48px',
        fontWeight: 'normal',
        marginBottom: '24px',
        lineHeight: '1.1',
        margin: '0 0 24px 0',
    },
    description: {
        fontSize: '20px',
        marginBottom: '32px',
        opacity: 0.95,
        lineHeight: '1.5',
        margin: '0 0 32px 0',
        fontWeight: 'normal',
    },
    buttonGroup: {
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    primaryButton: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '16px 32px',
        backgroundColor: '#2563eb',
        color: 'white',
        fontWeight: 'normal',
        fontSize: '16px',
        borderRadius: '50px',
        textDecoration: 'none',
        transition: 'all 0.3s ease',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
    },
    secondaryButton: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '16px 32px',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        color: 'white',
        fontWeight: '600',
        fontSize: '16px',
        borderRadius: '50px',
        transition: 'all 0.3s ease',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        cursor: 'pointer',
    },
    icon: {
        marginLeft: '8px',
        width: '20px',
        height: '20px',
    },
    navButton: {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 20,
        width: '48px',
        height: '48px',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        cursor: 'pointer',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        transition: 'all 0.3s ease',
    },
    navIcon: {
        width: '24px',
        height: '24px',
    },
    pagination: {
        position: 'absolute',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20,
    },
    progressContainer: {
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 20,
    },
    progressLabel: {
        padding: '8px 16px',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(10px)',
        borderRadius: '50px',
        color: 'white',
        fontSize: '14px',
        fontWeight: '500',
        border: '1px solid rgba(255, 255, 255, 0.2)',
    },
};

export default VoyageSlider;
