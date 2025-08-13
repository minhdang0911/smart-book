'use client';

import { gsap } from 'gsap';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Autoplay, EffectFade, Navigation, Pagination, Parallax } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/parallax';

const VoyageSlider = () => {
    const [banners, setBanners] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const swiperRef = useRef(null);
    const contentRefs = useRef([]);
    const imageRefs = useRef([]);

    // Fallback content nếu API không có dữ liệu
    const fallbackContent = [
        {
            id: 1,
            title: 'Khám Phá Thế Giới Sách',
            description: 'Hành trình tri thức bắt đầu từ đây. Khám phá hàng nghìn cuốn sách hay.',
            image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
            book_id: 1,
            status: 1,
            priority: 1,
        },
        {
            id: 2,
            title: 'Ưu Đãi Đặc Biệt',
            description: 'Giảm giá lên đến 50% cho tất cả sách bestseller. Cơ hội không thể bỏ lỡ!',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
            book_id: 2,
            status: 1,
            priority: 2,
        },
        {
            id: 3,
            title: 'Sách Mới Nhất 2025',
            description: 'Cập nhật những cuốn sách mới nhất và được yêu thích nhất năm 2025.',
            image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
            book_id: 3,
            status: 1,
            priority: 3,
        },
        {
            id: 4,
            title: 'Đọc Sách Online',
            description: 'Trải nghiệm đọc sách trực tuyến với công nghệ hiện đại và tiện lợi.',
            image: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
            book_id: 4,
            status: 1,
            priority: 4,
        },
    ];

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

    // GSAP Animation cho slide transition
    const animateSlideIn = (slideIndex) => {
        const content = contentRefs.current[slideIndex];
        const image = imageRefs.current[slideIndex];

        if (content && image) {
            // Reset animation
            gsap.set(content.children, { opacity: 0, y: 50, scale: 0.9 });
            gsap.set(image, { scale: 1.1, opacity: 0.8 });

            // Animate image
            gsap.to(image, {
                scale: 1,
                opacity: 1,
                duration: 1.2,
                ease: 'power3.out',
            });

            // Animate content elements
            gsap.to(content.children, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.8,
                stagger: 0.15,
                ease: 'power3.out',
                delay: 0.2,
            });
        }
    };

    const animateSlideOut = (slideIndex) => {
        const content = contentRefs.current[slideIndex];
        const image = imageRefs.current[slideIndex];

        if (content && image) {
            gsap.to(content.children, {
                opacity: 0,
                y: -30,
                duration: 0.5,
                ease: 'power2.in',
            });

            gsap.to(image, {
                scale: 1.05,
                opacity: 0.7,
                duration: 0.5,
                ease: 'power2.in',
            });
        }
    };

    // Swiper configuration
    const swiperConfig = {
        modules: [Navigation, Pagination, Autoplay, EffectFade, Parallax],
        effect: 'fade',
        fadeEffect: {
            crossFade: true,
        },
        parallax: true,
        speed: 1000,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
        },
        loop: true,
        navigation: {
            nextEl: '.swiper-button-next-custom',
            prevEl: '.swiper-button-prev-custom',
        },
        pagination: {
            el: '.swiper-pagination-custom',
            clickable: true,
            dynamicBullets: true,
            renderBullet: function (index, className) {
                return `<span class="${className} custom-bullet"></span>`;
            },
        },
        on: {
            slideChangeTransitionStart: function () {
                // Animate out previous slide
                const prevIndex = this.previousIndex;
                if (prevIndex !== undefined) {
                    animateSlideOut(prevIndex);
                }
            },
            slideChangeTransitionEnd: function () {
                // Animate in current slide
                const currentIndex = this.realIndex;
                animateSlideIn(currentIndex);
            },
            init: function () {
                // Animate first slide
                setTimeout(() => animateSlideIn(0), 100);
            },
        },
    };

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
            <Swiper ref={swiperRef} {...swiperConfig} className="voyage-swiper">
                {banners.map((banner, index) => (
                    <SwiperSlide key={banner.id || index} className="voyage-slide">
                        {/* Background Image với Parallax */}
                        <div
                            ref={(el) => (imageRefs.current[index] = el)}
                            style={{
                                ...styles.backgroundImage,
                                backgroundImage: `url(${
                                    banner.image ||
                                    banner.link ||
                                    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
                                })`,
                            }}
                            data-swiper-parallax="-100"
                        >
                            <div style={styles.overlay}></div>
                        </div>

                        {/* Content với Parallax */}
                        <div style={styles.contentWrapper} data-swiper-parallax="-200">
                            <div style={styles.contentContainer}>
                                <div ref={(el) => (contentRefs.current[index] = el)} style={styles.textContent}>
                                    <div style={styles.priorityBadge}>#{banner.priority || index + 1}</div>
                                    <h1 style={styles.title}>{banner.title || `Slide ${index + 1}`}</h1>
                                    <p style={styles.description}>{banner.description || ''}</p>
                                    <div style={styles.buttonGroup}>
                                        <Link href={`/book/${banner.book_id}`} legacyBehavior>
                                            <a
                                                style={styles.primaryButton}
                                                onMouseOver={(e) => {
                                                    gsap.to(e.target, {
                                                        scale: 1.05,
                                                        backgroundColor: '#1d4ed8',
                                                        duration: 0.3,
                                                        ease: 'power2.out',
                                                    });
                                                }}
                                                onMouseOut={(e) => {
                                                    gsap.to(e.target, {
                                                        scale: 1,
                                                        backgroundColor: '#2563eb',
                                                        duration: 0.3,
                                                        ease: 'power2.out',
                                                    });
                                                }}
                                            >
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
                                            </a>
                                        </Link>
                                        <button
                                            style={styles.secondaryButton}
                                            onMouseOver={(e) => {
                                                gsap.to(e.target, {
                                                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                                    scale: 1.02,
                                                    duration: 0.3,
                                                });
                                            }}
                                            onMouseOut={(e) => {
                                                gsap.to(e.target, {
                                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                    scale: 1,
                                                    duration: 0.3,
                                                });
                                            }}
                                        >
                                            Tìm Hiểu Thêm
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Custom Navigation */}
            <div className="swiper-button-prev-custom" style={styles.navButton}>
                <svg style={styles.navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </div>
            <div className="swiper-button-next-custom" style={{ ...styles.navButton, right: '20px' }}>
                <svg style={styles.navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>

            {/* Custom Pagination */}
            <div className="swiper-pagination-custom" style={styles.pagination}></div>

            {/* Progress Indicator */}
            <div style={styles.progressContainer}>
                <div style={styles.progressLabel}>
                    {banners.length} Banner{banners.length > 1 ? 's' : ''} Active
                </div>
            </div>
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
        height: '600px',
        borderRadius: '24px',
        overflow: 'hidden',
        backgroundColor: '#1e293b',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
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
        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 50%, transparent 100%)',
        backdropFilter: 'blur(1px)',
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
        padding: '0 60px',
        width: '100%',
    },
    textContent: {
        color: 'white',
        maxWidth: '700px',
    },
    priorityBadge: {
        display: 'inline-block',
        padding: '8px 16px',
        backgroundColor: 'rgba(59, 130, 246, 0.9)',
        borderRadius: '50px',
        fontSize: '14px',
        fontWeight: '600',
        marginBottom: '20px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    title: {
        fontSize: '56px',
        fontWeight: '800',
        marginBottom: '24px',
        lineHeight: '1.1',
        margin: '0 0 24px 0',
        background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
    },
    description: {
        fontSize: '24px',
        marginBottom: '40px',
        opacity: 0.95,
        lineHeight: '1.6',
        margin: '0 0 40px 0',
        fontWeight: '400',
    },
    buttonGroup: {
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    primaryButton: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '18px 36px',
        backgroundColor: '#2563eb',
        color: 'white',
        fontWeight: '600',
        fontSize: '16px',
        borderRadius: '50px',
        textDecoration: 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 10px 25px rgba(37, 99, 235, 0.4)',
        backdropFilter: 'blur(10px)',
    },
    secondaryButton: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '18px 36px',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(20px)',
        color: 'white',
        fontWeight: '600',
        fontSize: '16px',
        borderRadius: '50px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        cursor: 'pointer',
    },
    icon: {
        marginLeft: '12px',
        width: '20px',
        height: '20px',
    },
    navButton: {
        position: 'absolute',
        top: '50%',
        left: '20px',
        transform: 'translateY(-50%)',
        zIndex: 20,
        width: '56px',
        height: '56px',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(20px)',
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
        bottom: '30px',
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(20px)',
        borderRadius: '50px',
        color: 'white',
        fontSize: '14px',
        fontWeight: '500',
        border: '1px solid rgba(255, 255, 255, 0.2)',
    },
};

export default VoyageSlider;
