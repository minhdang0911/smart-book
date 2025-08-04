'use client';

import { ArrowRightOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

const PostSwiper = ({ posts }) => {
    const swiperRef = useRef(null);
    const containerRef = useRef(null);
    const progressBarRef = useRef(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [progressWidth, setProgressWidth] = useState(0);
    const [gsap, setGsap] = useState(null);

    useEffect(() => {
        // Load GSAP dynamically
        if (typeof window !== 'undefined') {
            import('gsap').then((gsapModule) => {
                const GSAP = gsapModule.default;
                setGsap(GSAP);

                // Initial animations
                const tl = GSAP.timeline();

                // Container entrance
                tl.from(containerRef.current, {
                    opacity: 0,
                    y: 100,
                    duration: 1.2,
                    ease: 'power3.out',
                });

                // Header animation
                tl.from(
                    '.header-title',
                    {
                        opacity: 0,
                        y: 50,
                        scale: 0.9,
                        duration: 1,
                        ease: 'back.out(1.7)',
                    },
                    '-=0.8',
                );

                // Navigation buttons animation
                tl.from(
                    '.nav-buttons a',
                    {
                        opacity: 0,
                        y: 30,
                        scale: 0.8,
                        duration: 0.8,
                        stagger: 0.1,
                        ease: 'power2.out',
                    },
                    '-=0.6',
                );

                // Cards animation with advanced stagger
                const cards = containerRef.current?.querySelectorAll('.post-card');
                tl.from(
                    cards,
                    {
                        opacity: 0,
                        y: 80,
                        scale: 0.8,
                        rotation: 5,
                        duration: 1,
                        stagger: {
                            amount: 0.8,
                            from: 'start',
                            ease: 'power2.out',
                        },
                        ease: 'back.out(1.4)',
                    },
                    '-=0.4',
                );

                // Progress bar animation
                tl.from(
                    '.progress-container',
                    {
                        opacity: 0,
                        y: 30,
                        scale: 0.9,
                        duration: 0.8,
                        ease: 'power2.out',
                    },
                    '-=0.3',
                );

                // View all button animation
                tl.from(
                    '.view-all-btn',
                    {
                        opacity: 0,
                        y: 40,
                        scale: 0.9,
                        duration: 0.8,
                        ease: 'elastic.out(1, 0.5)',
                    },
                    '-=0.2',
                );

                // Custom navigation buttons
                tl.from(
                    ['.custom-prev', '.custom-next'],
                    {
                        opacity: 0,
                        scale: 0,
                        rotation: 180,
                        duration: 0.8,
                        stagger: 0.1,
                        ease: 'back.out(1.7)',
                    },
                    '-=0.5',
                );
            });
        }

        // Initialize progress
        const initialProgress = posts.length > 0 ? (1 / posts.length) * 100 : 0;
        setProgressWidth(initialProgress);
    }, [posts]);

    const formatDate = (dateString) => {
        const [day, month, year] = dateString.split('/');
        const date = new Date(year, month - 1, day);
        const months = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ];
        return `${day} ${months[date.getMonth()]} ${year}`;
    };

    const truncateText = (text, maxLength = 120) => {
        if (!text) return '';
        const cleanText = text.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ');
        return cleanText.length > maxLength ? cleanText.substring(0, maxLength).trim() + '...' : cleanText;
    };

    const handleSlideChange = (swiper) => {
        const current = swiper.realIndex;
        setCurrentSlide(current);
        const progress = ((current + 1) / posts.length) * 100;

        // Animate progress bar with GSAP
        if (gsap && progressBarRef.current) {
            gsap.to(progressBarRef.current, {
                width: `${progress}%`,
                duration: 0.8,
                ease: 'power2.out',
            });
        } else {
            setProgressWidth(progress);
        }

        // Animate active slide
        if (gsap) {
            const activeSlide = swiper.slides[swiper.activeIndex];
            const card = activeSlide?.querySelector('.post-card');
            if (card) {
                gsap.fromTo(
                    card,
                    { scale: 0.95, opacity: 0.8 },
                    { scale: 1, opacity: 1, duration: 0.6, ease: 'power2.out' },
                );
            }
        }
    };

    const handleSlideTransitionStart = (swiper) => {
        if (gsap) {
            // Animate outgoing slides
            swiper.slides.forEach((slide, index) => {
                const card = slide.querySelector('.post-card');
                if (card && index !== swiper.activeIndex) {
                    gsap.to(card, {
                        scale: 0.95,
                        opacity: 0.7,
                        duration: 0.4,
                        ease: 'power2.out',
                    });
                }
            });
        }
    };

    // Enhanced card hover animations
    const handleCardHover = (e, isEntering) => {
        if (!gsap) return;

        const card = e.currentTarget;
        const image = card.querySelector('.post-image');
        const content = card.querySelector('.card-content');
        const badge = card.querySelector('.category-badge');

        if (isEntering) {
            gsap.to(card, {
                y: -20,
                scale: 1.03,
                rotation: 0.5,
                boxShadow: '0 30px 80px rgba(0, 0, 0, 0.25)',
                duration: 0.6,
                ease: 'power3.out',
            });

            gsap.to(image, {
                scale: 1.1,
                rotation: -0.5,
                duration: 0.8,
                ease: 'power2.out',
            });

            gsap.to(content, {
                y: -5,
                duration: 0.4,
                ease: 'power2.out',
            });

            gsap.to(badge, {
                scale: 1.1,
                y: -3,
                duration: 0.4,
                ease: 'back.out(1.7)',
            });
        } else {
            gsap.to(card, {
                y: 0,
                scale: 1,
                rotation: 0,
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                duration: 0.6,
                ease: 'power3.out',
            });

            gsap.to(image, {
                scale: 1,
                rotation: 0,
                duration: 0.8,
                ease: 'power2.out',
            });

            gsap.to(content, {
                y: 0,
                duration: 0.4,
                ease: 'power2.out',
            });

            gsap.to(badge, {
                scale: 1,
                y: 0,
                duration: 0.4,
                ease: 'power2.out',
            });
        }
    };

    // Enhanced navigation button animations
    const handleNavHover = (e, isEntering, direction) => {
        if (!gsap) return;

        const button = e.currentTarget;

        if (isEntering) {
            gsap.to(button, {
                scale: 1.2,
                rotation: direction === 'prev' ? -10 : 10,
                background: 'rgba(255, 255, 255, 0.4)',
                duration: 0.4,
                ease: 'back.out(1.7)',
            });
        } else {
            gsap.to(button, {
                scale: 1,
                rotation: 0,
                background: 'rgba(255, 255, 255, 0.2)',
                duration: 0.4,
                ease: 'power2.out',
            });
        }
    };

    return (
        <div
            ref={containerRef}
            style={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
                minHeight: '700px',
                padding: '60px 20px',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Enhanced background overlay */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `
                        radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.4) 0%, transparent 60%),
                        radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.3) 0%, transparent 60%),
                        radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.2) 0%, transparent 50%)
                    `,
                    pointerEvents: 'none',
                }}
            />

            <div style={{ position: 'relative', zIndex: 2, maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header Section */}
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h2
                        className="header-title"
                        style={{
                            color: 'white',
                            fontSize: '3rem',
                            fontWeight: '700',
                            marginBottom: '40px',
                            textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                            letterSpacing: '-0.02em',
                            background: 'linear-gradient(135deg, #fff 0%, #e0f2fe 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Vietnam Post Logistics Tin tức
                    </h2>

                    <div
                        className="nav-buttons"
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '12px',
                            marginBottom: '20px',
                            flexWrap: 'wrap',
                        }}
                    >
                        <Link
                            href="/blog"
                            style={{
                                background: 'rgba(255, 255, 255, 0.9)',
                                color: '#1e3a8a',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '30px',
                                textDecoration: 'none',
                                fontWeight: '600',
                                fontSize: '14px',
                                transition: 'all 0.3s ease',
                                backdropFilter: 'blur(10px)',
                                boxShadow: '0 4px 15px rgba(255, 255, 255, 0.2)',
                            }}
                        >
                            Blog
                        </Link>
                        <Link
                            href="/news"
                            style={{
                                background: 'rgba(255, 255, 255, 0.15)',
                                color: 'rgba(255, 255, 255, 0.9)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                padding: '12px 24px',
                                borderRadius: '30px',
                                textDecoration: 'none',
                                fontWeight: '500',
                                fontSize: '14px',
                                transition: 'all 0.3s ease',
                                backdropFilter: 'blur(10px)',
                            }}
                        >
                            News
                        </Link>
                        <Link
                            href="/logistics"
                            style={{
                                background: 'rgba(255, 255, 255, 0.15)',
                                color: 'rgba(255, 255, 255, 0.9)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                padding: '12px 24px',
                                borderRadius: '30px',
                                textDecoration: 'none',
                                fontWeight: '500',
                                fontSize: '14px',
                                transition: 'all 0.3s ease',
                                backdropFilter: 'blur(10px)',
                            }}
                        >
                            Bản tin Viet Nam Logistics
                        </Link>
                    </div>
                </div>

                {/* Enhanced Swiper */}
                <Swiper
                    ref={swiperRef}
                    modules={[Navigation, Pagination, Autoplay]}
                    spaceBetween={24}
                    slidesPerView={1}
                    navigation={{
                        prevEl: '.custom-prev',
                        nextEl: '.custom-next',
                    }}
                    pagination={false}
                    autoplay={{
                        delay: 5000,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                    }}
                    loop={posts.length > 1}
                    effect="slide"
                    speed={800}
                    breakpoints={{
                        640: { slidesPerView: 2, spaceBetween: 20 },
                        768: { slidesPerView: 3, spaceBetween: 20 },
                        1024: { slidesPerView: 4, spaceBetween: 24 },
                        1200: { slidesPerView: 4, spaceBetween: 24 },
                    }}
                    onSlideChange={handleSlideChange}
                    onSlideTransitionStart={handleSlideTransitionStart}
                    style={{
                        padding: '20px 60px 80px 60px',
                        '--swiper-navigation-color': 'white',
                    }}
                >
                    {posts.map((post) => (
                        <SwiperSlide key={post.id}>
                            <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div
                                    className="post-card"
                                    style={{
                                        background: 'white',
                                        borderRadius: '20px',
                                        overflow: 'hidden',
                                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                                        transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                                        height: '100%',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        transformStyle: 'preserve-3d',
                                    }}
                                    onMouseEnter={(e) => handleCardHover(e, true)}
                                    onMouseLeave={(e) => handleCardHover(e, false)}
                                >
                                    {/* Image Container */}
                                    <div
                                        style={{
                                            position: 'relative',
                                            height: '220px',
                                            overflow: 'hidden',
                                            background: 'linear-gradient(45deg, #f0f9ff, #e0f2fe)',
                                        }}
                                    >
                                        <img
                                            src={post.thumbnail || '/default-thumbnail.jpg'}
                                            alt={post.title}
                                            className="post-image"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                transition: 'transform 0.8s cubic-bezier(0.23, 1, 0.32, 1)',
                                            }}
                                            loading="lazy"
                                        />

                                        {/* Category Badge */}
                                        <div
                                            className="category-badge"
                                            style={{
                                                position: 'absolute',
                                                bottom: '16px',
                                                left: '16px',
                                                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                                                color: 'white',
                                                padding: '8px 16px',
                                                borderRadius: '25px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                boxShadow: '0 4px 20px rgba(251, 191, 36, 0.4)',
                                                zIndex: 2,
                                                backdropFilter: 'blur(10px)',
                                            }}
                                        >
                                            {post.topics?.[0]?.name || 'Bản tin Viet Nam Logistics'}
                                        </div>

                                        {/* Date Overlay */}
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: '16px',
                                                right: '16px',
                                                background: 'rgba(0, 0, 0, 0.75)',
                                                color: 'white',
                                                padding: '6px 12px',
                                                borderRadius: '12px',
                                                fontSize: '11px',
                                                fontWeight: '500',
                                                backdropFilter: 'blur(10px)',
                                                zIndex: 2,
                                            }}
                                        >
                                            {formatDate(post.created_at)}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="card-content" style={{ padding: '24px' }}>
                                        <h3
                                            style={{
                                                fontSize: '18px',
                                                fontWeight: '700',
                                                color: '#1f2937',
                                                marginBottom: '12px',
                                                lineHeight: '1.4',
                                                minHeight: '50px',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            {post.title}
                                        </h3>

                                        {post.excerpt && (
                                            <p
                                                style={{
                                                    color: '#6b7280',
                                                    fontSize: '14px',
                                                    lineHeight: '1.6',
                                                    marginBottom: '20px',
                                                    minHeight: '44px',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                {truncateText(post.excerpt, 100)}
                                            </p>
                                        )}

                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                fontSize: '13px',
                                                color: '#9ca3af',
                                                paddingTop: '16px',
                                                borderTop: '1px solid #f3f4f6',
                                            }}
                                        >
                                            <span style={{ fontWeight: '600', color: '#4f46e5' }}>
                                                Vietnam Post Logistics
                                            </span>
                                            {post.views > 0 && <span>{post.views} lượt xem</span>}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* Enhanced Navigation Buttons */}
                <button
                    className="custom-prev"
                    style={{
                        position: 'absolute',
                        left: '20px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: 'none',
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        color: 'white',
                        fontSize: '20px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        backdropFilter: 'blur(10px)',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    onMouseEnter={(e) => handleNavHover(e, true, 'prev')}
                    onMouseLeave={(e) => handleNavHover(e, false, 'prev')}
                >
                    ←
                </button>

                <button
                    className="custom-next"
                    style={{
                        position: 'absolute',
                        right: '20px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: 'none',
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        color: 'white',
                        fontSize: '20px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        backdropFilter: 'blur(10px)',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    onMouseEnter={(e) => handleNavHover(e, true, 'next')}
                    onMouseLeave={(e) => handleNavHover(e, false, 'next')}
                >
                    →
                </button>

                {/* Enhanced Progress Bar */}
                <div
                    className="progress-container"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: '40px',
                        gap: '20px',
                    }}
                >
                    <div
                        style={{
                            width: '300px',
                            height: '6px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '3px',
                            overflow: 'hidden',
                            position: 'relative',
                            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <div
                            ref={progressBarRef}
                            style={{
                                width: `${progressWidth}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24)',
                                borderRadius: '3px',
                                transition: gsap ? 'none' : 'width 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
                                boxShadow: '0 0 15px rgba(251, 191, 36, 0.6)',
                                position: 'relative',
                            }}
                        >
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '0',
                                    left: '0',
                                    right: '0',
                                    bottom: '0',
                                    background:
                                        'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                                    animation: 'shimmer 2s infinite',
                                }}
                            />
                        </div>
                    </div>

                    <span
                        style={{
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontSize: '14px',
                            fontWeight: '500',
                            minWidth: '50px',
                        }}
                    >
                        {currentSlide + 1} / {posts.length}
                    </span>
                </div>

                {/* Enhanced View All Button */}
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <Link
                        href="/blog"
                        className="view-all-btn"
                        style={{
                            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                            color: 'white',
                            border: 'none',
                            padding: '16px 40px',
                            borderRadius: '30px',
                            fontWeight: '600',
                            fontSize: '16px',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '12px',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 8px 30px rgba(59, 130, 246, 0.4)',
                            letterSpacing: '0.5px',
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                        onMouseEnter={(e) => {
                            if (gsap) {
                                gsap.to(e.currentTarget, {
                                    y: -5,
                                    scale: 1.05,
                                    boxShadow: '0 15px 50px rgba(59, 130, 246, 0.6)',
                                    duration: 0.4,
                                    ease: 'power2.out',
                                });
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (gsap) {
                                gsap.to(e.currentTarget, {
                                    y: 0,
                                    scale: 1,
                                    boxShadow: '0 8px 30px rgba(59, 130, 246, 0.4)',
                                    duration: 0.4,
                                    ease: 'power2.out',
                                });
                            }
                        }}
                    >
                        XEM TẤT CẢ TIN
                        <ArrowRightOutlined style={{ fontSize: '16px' }} />
                    </Link>
                </div>
            </div>

            <style jsx>{`
                @keyframes shimmer {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }
            `}</style>
        </div>
    );
};

export default PostSwiper;
