'use client';
import { useEffect, useRef, useState } from 'react';

const CouponSliderClient = ({ coupons, error }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [copiedCoupon, setCopiedCoupon] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [currentX, setCurrentX] = useState(0);
    const [translateX, setTranslateX] = useState(0);

    const trackRef = useRef(null);
    const containerRef = useRef(null);

    const slidesToShow = 4;
    const slideWidth = 288; // 280px + 8px padding
    const maxSlides = Math.max(0, coupons.length - slidesToShow);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    // Kiểm tra coupon có hết hạn không
    const isCouponExpired = (endDate) => {
        const currentDate = new Date();
        const expireDate = new Date(endDate);
        return expireDate < currentDate;
    };

    const handleCopyCoupon = async (couponCode, e) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(couponCode);
            setCopiedCoupon(couponCode);
            setTimeout(() => setCopiedCoupon(null), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    const updateSliderPosition = (slideIndex, animate = true) => {
        if (trackRef.current) {
            const newTranslateX = -(slideIndex * slideWidth);
            setTranslateX(newTranslateX);

            if (animate) {
                trackRef.current.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            } else {
                trackRef.current.style.transition = 'none';
            }

            trackRef.current.style.transform = `translateX(${newTranslateX}px)`;
        }
    };

    // Touch/Mouse event handlers
    const handleStart = (clientX) => {
        if (trackRef.current) {
            setIsDragging(true);
            setStartX(clientX);
            setCurrentX(clientX);
            trackRef.current.style.transition = 'none';
        }
    };

    const handleMove = (clientX) => {
        if (!isDragging || !trackRef.current) return;

        setCurrentX(clientX);
        const diff = clientX - startX;
        const newTranslateX = translateX + diff;

        // Add resistance at boundaries
        const maxTranslate = 0;
        const minTranslate = -(maxSlides * slideWidth);

        let boundedTranslateX = newTranslateX;
        if (newTranslateX > maxTranslate) {
            boundedTranslateX = maxTranslate + (newTranslateX - maxTranslate) * 0.3;
        } else if (newTranslateX < minTranslate) {
            boundedTranslateX = minTranslate + (newTranslateX - minTranslate) * 0.3;
        }

        trackRef.current.style.transform = `translateX(${boundedTranslateX}px)`;
    };

    const handleEnd = () => {
        if (!isDragging) return;

        setIsDragging(false);

        const diff = currentX - startX;
        const threshold = slideWidth * 0.3; // 30% of slide width

        let newSlide = currentSlide;

        if (Math.abs(diff) > threshold) {
            if (diff > 0 && currentSlide > 0) {
                newSlide = currentSlide - 1;
            } else if (diff < 0 && currentSlide < maxSlides) {
                newSlide = currentSlide + 1;
            }
        }

        setCurrentSlide(newSlide);
        updateSliderPosition(newSlide, true);
    };

    // Mouse events
    const handleMouseDown = (e) => {
        e.preventDefault();
        handleStart(e.clientX);
    };

    const handleMouseMove = (e) => {
        e.preventDefault();
        handleMove(e.clientX);
    };

    const handleMouseUp = () => {
        handleEnd();
    };

    // Touch events
    const handleTouchStart = (e) => {
        handleStart(e.touches[0].clientX);
    };

    const handleTouchMove = (e) => {
        handleMove(e.touches[0].clientX);
    };

    const handleTouchEnd = () => {
        handleEnd();
    };

    // Event listeners
    useEffect(() => {
        const handleGlobalMouseMove = (e) => {
            if (isDragging) {
                handleMouseMove(e);
            }
        };

        const handleGlobalMouseUp = () => {
            if (isDragging) {
                handleMouseUp();
            }
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleGlobalMouseMove);
            document.addEventListener('mouseup', handleGlobalMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleGlobalMouseMove);
            document.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [isDragging, currentX, startX, translateX, currentSlide]);

    // Initialize position
    useEffect(() => {
        if (coupons.length > 0) {
            updateSliderPosition(0, false);
        }
    }, [coupons]);

    // Inject CSS
    useEffect(() => {
        if (typeof document !== 'undefined') {
            const styleId = 'coupon-slider-styles';
            if (!document.getElementById(styleId)) {
                const style = document.createElement('style');
                style.id = styleId;
                style.textContent = `
          .coupon-slider {
            padding: 0 20px;
          }
          
          .slider-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }
          
          .slider-title {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
          }
          
          .slider-hint {
            font-size: 14px;
            color: #6b7280;
          }
          
          .error-container {
            padding: 40px;
            text-align: center;
            color: #ef4444;
            background-color: #fef2f2;
            border-radius: 12px;
            margin: 0 20px;
          }
          
          .error-container button {
            margin-top: 16px;
            padding: 8px 16px;
            background-color: #ef4444;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
          }
          
          .error-container button:hover {
            background-color: #dc2626;
          }
          
          .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: #6b7280;
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            margin: 0 20px;
          }
          
          .slider-container {
            position: relative;
            overflow: hidden;
            border-radius: 12px;
            padding: 12px 0;
            user-select: none;
          }
          
          .slider-track {
            display: flex;
            cursor: grab;
          }
          
          .slider-track:active,
          .slider-track.dragging {
            cursor: grabbing;
          }
          
          .coupon-slide {
            flex-shrink: 0;
            width: 280px;
            padding: 0 4px;
          }
          
          .coupon-card {
            position: relative;
            border-radius: 16px;
            padding: 24px;
            height: 160px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            cursor: pointer;
            transition: all 0.3s ease;
          }
          
          .coupon-card:hover {
            transform: scale(1.05);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          }
          
          .coupon-card::before,
          .coupon-card::after {
            content: '';
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: white;
            z-index: 2;
          }
          
          .coupon-card::before {
            left: -10px;
          }
          
          .coupon-card::after {
            right: -10px;
          }
          
          .coupon-card.expired {
            opacity: 0.6;
          }
          
          .coupon-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 8px;
          }
          
          .coupon-code {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 4px;
          }
          
          .coupon-min-order {
            font-size: 12px;
            color: #6b7280;
          }
          
          .coupon-status {
            background-color: rgba(255, 255, 255, 0.9);
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            backdrop-filter: blur(4px);
          }
          
          .coupon-status.expired {
            background-color: #f3f4f6;
            color: #6b7280 !important;
          }
          
          .coupon-content {
            flex: 1;
            display: flex;
            align-items: center;
            margin: 4px 0;
          }
          
          .coupon-description {
            font-size: 14px;
            line-height: 1.3;
            color: #1f2937;
          }
          
          .coupon-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .coupon-code-display {
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          }
          
          .coupon-copy-button {
            border-radius: 20px;
            font-weight: 600;
            padding: 4px 16px;
            height: 32px;
            color: white;
            font-size: 14px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            border: none;
            cursor: pointer;
            transition: opacity 0.2s ease;
          }
          
          .coupon-copy-button:hover {
            opacity: 0.8;
          }
          
          .coupon-copy-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          
          .slide-indicators {
            display: flex;
            justify-content: center;
            margin-top: 16px;
            gap: 8px;
          }
          
          .indicator {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: #d1d5db;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          
          .indicator:hover {
            background-color: #9ca3af;
          }
          
          .indicator.active {
            background-color: #3b82f6;
            width: 24px;
          }
          
          @media (max-width: 768px) {
            .coupon-slider {
              padding: 0 10px;
            }
            
            .coupon-slide {
              width: 260px;
            }
            
            .coupon-card {
              padding: 20px;
              height: 140px;
            }
          }
        `;
                document.head.appendChild(style);
            }
        }
    }, []);

    if (error) {
        return (
            <div className="coupon-slider">
                <div className="slider-header">
                    <h2 className="slider-title">Mã giảm giá</h2>
                </div>
                <div className="error-container">
                    <div>{error}</div>
                    <button onClick={() => window.location.reload()}>Thử lại</button>
                </div>
            </div>
        );
    }

    if (coupons.length === 0) {
        return (
            <div className="coupon-slider">
                <div className="slider-header">
                    <h2 className="slider-title">Mã giảm giá</h2>
                </div>
                <div className="empty-state">Không có mã giảm giá nào khả dụng</div>
            </div>
        );
    }

    return (
        <div className="coupon-slider">
            <div className="slider-header">
                <h2 className="slider-title">Mã giảm giá</h2>
                <div className="slider-hint">Kéo để xem thêm →</div>
            </div>

            <div ref={containerRef} className="slider-container">
                <div
                    ref={trackRef}
                    className={`slider-track ${isDragging ? 'dragging' : ''}`}
                    style={{
                        width: `${coupons.length * slideWidth}px`,
                    }}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {coupons.map((coupon) => {
                        const isExpired = isCouponExpired(coupon.end_date);
                        return (
                            <div key={coupon.id} className="coupon-slide">
                                <div
                                    className={`coupon-card ${isExpired ? 'expired' : ''}`}
                                    style={{ backgroundColor: coupon.colorTheme.bg }}
                                >
                                    {/* Header */}
                                    <div className="coupon-header">
                                        <div>
                                            <div
                                                className="coupon-code"
                                                style={{ color: isExpired ? '#6b7280' : coupon.colorTheme.text }}
                                            >
                                                #{coupon.name.toUpperCase()}
                                            </div>
                                            <div className="coupon-min-order">
                                                Hóa đơn trên {formatCurrency(coupon.min_order_value)}
                                            </div>
                                        </div>
                                        <div
                                            className={`coupon-status ${isExpired ? 'expired' : ''}`}
                                            style={{
                                                color: isExpired ? '#6b7280' : coupon.colorTheme.text,
                                            }}
                                        >
                                            {isExpired ? 'Hết hạn' : 'Còn hạn'}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="coupon-content">
                                        <div className="coupon-description">{coupon.description}</div>
                                    </div>

                                    {/* Footer */}
                                    <div className="coupon-footer">
                                        <div
                                            className="coupon-code-display"
                                            style={{
                                                backgroundColor: isExpired ? '#9ca3af' : coupon.colorTheme.code,
                                            }}
                                        >
                                            {coupon.name.toUpperCase()}
                                        </div>

                                        <button
                                            onClick={(e) => handleCopyCoupon(coupon.name.toUpperCase(), e)}
                                            className="coupon-copy-button"
                                            disabled={isExpired}
                                            style={{
                                                backgroundColor: isExpired ? '#9ca3af' : coupon.colorTheme.code,
                                                border: `1px solid ${isExpired ? '#9ca3af' : coupon.colorTheme.code}`,
                                            }}
                                        >
                                            {copiedCoupon === coupon.name.toUpperCase() ? 'Đã lưu!' : 'Lưu lại'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Slide Indicators - chỉ hiển thị khi có nhiều hơn 1 trang */}
            {maxSlides > 0 && (
                <div className="slide-indicators">
                    {Array.from({ length: maxSlides + 1 }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setCurrentSlide(index);
                                updateSliderPosition(index, true);
                            }}
                            className={`indicator ${currentSlide === index ? 'active' : ''}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CouponSliderClient;
