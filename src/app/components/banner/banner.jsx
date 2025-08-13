'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const VoyageSlider = () => {
    const [banners, setBanners] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const sliderRef = useRef(null);
    const slidesRef = useRef([]);
    const intervalRef = useRef(null);

    // Fallback content nếu API không có dữ liệu
    const fallbackContent = [
        {
            id: 1,
            title: 'Khám Phá Thế Giới Sách',
            description: 'Hành trình tri thức bắt đầu từ đây. Khám phá hàng nghìn cuốn sách hay.',
            image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
            link: '#',
        },
        {
            id: 2,
            title: 'Ưu Đãi Đặc Biệt',
            description: 'Giảm giá lên đến 50% cho tất cả sách bestseller. Cơ hội không thể bỏ lỡ!',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
            link: '#',
        },
        {
            id: 3,
            title: 'Sách Mới Nhất 2025',
            description: 'Cập nhật những cuốn sách mới nhất và được yêu thích nhất năm 2025.',
            image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
            link: '#',
        },
        {
            id: 4,
            title: 'Đọc Sách Online',
            description: 'Trải nghiệm đọc sách trực tuyến với công nghệ hiện đại và tiện lợi.',
            image: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
            link: '#',
        },
    ];

    // Fetch banners from API
    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const response = await fetch('https://smartbook.io.vn/api/banners/get');
                const data = await response.json();

                if (data.success && data.data.length > 0) {
                    setBanners(data.data);
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

    // Animation Setup
    useEffect(() => {
        if (!banners.length || isLoading) return;

        const initializeSlider = () => {
            slidesRef.current.forEach((slide, index) => {
                if (!slide) return;

                if (index === 0) {
                    slide.style.transform = 'translateX(0%) scale(1)';
                    slide.style.opacity = '1';
                    slide.style.zIndex = '10';
                } else {
                    slide.style.transform = `translateX(${index * 100}%) scale(0.8)`;
                    slide.style.opacity = '0.7';
                    slide.style.zIndex = '1';
                }
            });
        };

        initializeSlider();

        // Auto-slide
        intervalRef.current = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 4000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [banners, isLoading]);

    // Animate slide transitions
    useEffect(() => {
        if (!banners.length || isLoading) return;

        slidesRef.current.forEach((slide, index) => {
            if (!slide) return;

            const isActive = index === currentIndex;
            const isPrev = index === (currentIndex - 1 + banners.length) % banners.length;
            const isNext = index === (currentIndex + 1) % banners.length;

            if (isActive) {
                slide.style.transition = 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)';
                slide.style.transform = 'translateX(0%) scale(1)';
                slide.style.opacity = '1';
                slide.style.zIndex = '10';
            } else if (isPrev) {
                slide.style.transition = 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)';
                slide.style.transform = 'translateX(-100%) scale(0.8)';
                slide.style.opacity = '0.5';
                slide.style.zIndex = '5';
            } else if (isNext) {
                slide.style.transition = 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)';
                slide.style.transform = 'translateX(100%) scale(0.8)';
                slide.style.opacity = '0.5';
                slide.style.zIndex = '5';
            } else {
                slide.style.transition = 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)';
                slide.style.transform = `translateX(${index > currentIndex ? '200%' : '-200%'}) scale(0.6)`;
                slide.style.opacity = '0';
                slide.style.zIndex = '1';
            }
        });
    }, [currentIndex, banners]);

    const goToSlide = (index) => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        setCurrentIndex(index);

        setTimeout(() => {
            intervalRef.current = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % banners.length);
            }, 4000);
        }, 1000);
    };

    const goToPrev = () => {
        goToSlide((currentIndex - 1 + banners.length) % banners.length);
    };

    const goToNext = () => {
        goToSlide((currentIndex + 1) % banners.length);
    };

    if (isLoading) {
        return (
            <div style={styles.loading}>
                <div style={styles.spinner}></div>
            </div>
        );
    }

    return (
        <div style={styles.voyageSlider}>
            {/* Slides Container */}
            <div ref={sliderRef} style={styles.sliderContainer}>
                {banners.map((banner, index) => (
                    <div
                        key={banner.id || index}
                        ref={(el) => (slidesRef.current[index] = el)}
                        style={styles.slide}
                        onClick={() => goToSlide(index)}
                    >
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
                                    <h1 style={styles.title}>{banner.title || `Slide ${index + 1}`}</h1>
                                    <p style={styles.description}>{banner.description || 'Mô tả slide'}</p>
                                    <div style={styles.buttonGroup}>
                                        <Link href={`/book/${banner.book_id}`} legacyBehavior>
                                            <a
                                                style={styles.primaryButton}
                                                onMouseOver={(e) => {
                                                    e.target.style.backgroundColor = '#1d4ed8';
                                                    e.target.style.transform = 'scale(1.05)';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.target.style.backgroundColor = '#2563eb';
                                                    e.target.style.transform = 'scale(1)';
                                                }}
                                            >
                                                {`Xem Chi Tiết ${banner.book_id}`}
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
                                                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                                            }}
                                        >
                                            Tìm Hiểu Thêm
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={goToPrev}
                style={{ ...styles.navButton, left: '16px' }}
                onMouseOver={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                    e.target.style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.transform = 'translateY(-50%) scale(1)';
                }}
            >
                <svg style={styles.navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            <button
                onClick={goToNext}
                style={{ ...styles.navButton, right: '16px' }}
                onMouseOver={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                    e.target.style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.transform = 'translateY(-50%) scale(1)';
                }}
            >
                <svg style={styles.navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Dots Indicator */}
            <div style={styles.dotsContainer}>
                {banners.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        style={{
                            ...styles.dot,
                            backgroundColor: index === currentIndex ? 'white' : 'rgba(255, 255, 255, 0.5)',
                            transform: index === currentIndex ? 'scale(1.25)' : 'scale(1)',
                        }}
                        onMouseOver={(e) => {
                            if (index !== currentIndex) {
                                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.75)';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (index !== currentIndex) {
                                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
                            }
                        }}
                    />
                ))}
            </div>

            {/* Progress Bar */}
            <div style={styles.progressBar}>
                <div
                    style={{
                        ...styles.progressFill,
                        width: `${((currentIndex + 1) / banners.length) * 100}%`,
                    }}
                />
            </div>
        </div>
    );
};

const styles = {
    loading: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '400px',
        backgroundColor: '#f3f4f6',
        borderRadius: '16px',
    },
    spinner: {
        width: '64px',
        height: '64px',
        border: '4px solid #e5e7eb',
        borderTop: '4px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    voyageSlider: {
        position: 'relative',
        width: '100%',
        height: '500px',
        overflow: 'hidden',
        borderRadius: '20px',
        backgroundColor: '#1f2937',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
        margin: '0 auto',
    },
    sliderContainer: {
        position: 'relative',
        width: '100%',
        height: '100%',
    },
    slide: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        cursor: 'pointer',
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
        background: 'linear-gradient(to right, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.4), transparent)',
    },
    contentWrapper: {
        position: 'relative',
        zIndex: 10,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
    },
    contentContainer: {
        maxWidth: '1024px',
        margin: '0 auto',
        padding: '0 48px',
        width: '100%',
    },
    textContent: {
        color: 'white',
        maxWidth: '672px',
    },
    title: {
        fontSize: '48px',
        fontWeight: 'bold',
        marginBottom: '24px',
        lineHeight: '1.2',
        margin: '0 0 24px 0',
    },
    description: {
        fontSize: '24px',
        marginBottom: '32px',
        opacity: 0.9,
        lineHeight: '1.5',
        margin: '0 0 32px 0',
    },
    buttonGroup: {
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
    },
    primaryButton: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '16px 32px',
        backgroundColor: '#2563eb',
        color: 'white',
        fontWeight: '600',
        borderRadius: '9999px',
        textDecoration: 'none',
        transition: 'all 0.3s ease',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    secondaryButton: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '16px 32px',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(4px)',
        color: 'white',
        fontWeight: '600',
        borderRadius: '9999px',
        transition: 'all 0.3s ease',
        border: 'none',
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
        backdropFilter: 'blur(4px)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        transition: 'all 0.3s ease',
        border: 'none',
        cursor: 'pointer',
    },
    navIcon: {
        width: '24px',
        height: '24px',
    },
    dotsContainer: {
        position: 'absolute',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20,
        display: 'flex',
        gap: '12px',
    },
    dot: {
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        transition: 'all 0.3s ease',
        border: 'none',
        cursor: 'pointer',
    },
    progressBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '4px',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    progressFill: {
        height: '100%',
        background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
        transition: 'all 0.3s ease-linear',
    },
};

// CSS Animation keyframes (cần thêm vào file CSS global)
const globalStyles = `
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .voyage-slider-title {
    font-size: 32px !important;
  }
  
  .voyage-slider-description {
    font-size: 18px !important;
  }
  
  .voyage-slider-content {
    padding: 0 24px !important;
  }
  
  .voyage-slider-button-group {
    flex-direction: column !important;
  }
}
`;

export default VoyageSlider;
