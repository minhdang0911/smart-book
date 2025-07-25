'use client';
import {
    ClockCircleOutlined,
    CustomerServiceOutlined,
    LeftOutlined,
    RightOutlined,
    SwapOutlined,
    ThunderboltOutlined,
} from '@ant-design/icons';
import { Alert, Button, message, Modal, Spin } from 'antd';
import React, { useMemo, useRef, useState } from 'react';
import useSWR from 'swr';

// Fetcher function for SWR
const fetcher = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
};

const CouponSlider = () => {
    // SWR hook for fetching coupons
    const {
        data: couponsData,
        error,
        isLoading,
        mutate,
    } = useSWR('http://localhost:8000/api/coupons/get', fetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: 60000, // Cache for 1 minute
        errorRetryCount: 3,
        errorRetryInterval: 5000,
    });

    // SWR hook for fetching individual coupon details
    const [selectedCouponId, setSelectedCouponId] = useState(null);
    const { data: couponDetailsData, isLoading: loadingDetails } = useSWR(
        selectedCouponId ? `http://localhost:8000/api/coupons/${selectedCouponId}` : null,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 300000, // Cache for 5 minutes
        },
    );

    const [currentSlide, setCurrentSlide] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [copiedCoupon, setCopiedCoupon] = useState(null);
    const trackRef = useRef(null);

    // Add styles for coupon card with larger before/after pseudo elements
    const couponCardStyles = `
        .coupon-card {
            position: relative;
            overflow: hidden;
        }
        
        .coupon-card::before,
        .coupon-card::after {
            content: '';
            position: absolute;
            top: 50%;
            -webkit-transform: translateY(-50%);
            -moz-transform: translateY(-50%);
            -o-transform: translateY(-50%);
            transform: translateY(-50%);
            width: 40px;
            height: 40px;
            border-radius: 100rem;
            background-color: #f5f5f5;
            z-index: 2;
        }
        
        .coupon-card::before {
            left: -20px;
            clip-path: polygon(50% 0, 100% 0, 100% 100%, 50% 100%);
        }
        
        .coupon-card::after {
            right: -20px;
            clip-path: polygon(0 0, 50% 0, 50% 100%, 0 100%);
        }

        .coupon-slider-container {
            overflow: hidden;
        }

        .coupon-track {
            display: flex;
            transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            will-change: transform;
        }

        .coupon-slide {
            flex: 0 0 20%;
            padding: 0 8px;
        }

        .coupon-card {
            transform: scale(1);
            transition: all 0.3s ease;
        }

        .coupon-card:hover {
            transform: scale(1.02);
            box-shadow: 0 8px 24px rgba(0,0,0,0.15) !important;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .coupon-card.animate-in {
            animation: slideIn 0.5s ease forwards;
        }
    `;

    // Inject styles
    React.useEffect(() => {
        const styleElement = document.createElement('style');
        styleElement.textContent = couponCardStyles;
        document.head.appendChild(styleElement);

        return () => {
            if (document.head.contains(styleElement)) {
                document.head.removeChild(styleElement);
            }
        };
    }, []);

    // Bank colors for different coupon types
    const bankColors = [
        { bg: '#FFF4E6', text: '#D46B08', code: '#FF8C00' }, // Orange
        { bg: '#FFF1F0', text: '#CF1322', code: '#FF4D4F' }, // Red
        { bg: '#F6F6F6', text: '#595959', code: '#8C8C8C' }, // Gray
        { bg: '#E6F7FF', text: '#1890FF', code: '#1890FF' }, // Blue
        { bg: '#F6FFED', text: '#52C41A', code: '#52C41A' }, // Green
    ];

    // Memoized filtered coupons to avoid unnecessary recalculations
    const filteredCoupons = useMemo(() => {
        if (!couponsData?.coupons) return [];

        const now = new Date();
        return couponsData.coupons.filter((coupon) => {
            const endDate = new Date(coupon.end_date);
            if (now <= endDate) return true;
            const timeDiffInMs = now.getTime() - endDate.getTime();
            return timeDiffInMs <= 86400000; // 24 hours
        });
    }, [couponsData]);

    // Memoized calculations
    const maxSlides = useMemo(() => Math.max(0, filteredCoupons.length - 5), [filteredCoupons.length]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const formatPercentage = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'percent',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(value / 100);
    };

    const handleCopyCoupon = async (couponCode) => {
        try {
            await navigator.clipboard.writeText(couponCode);
            setCopiedCoupon(couponCode);
            message.success('Đã sao chép mã giảm giá!');
            setTimeout(() => setCopiedCoupon(null), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
            message.error('Không thể sao chép mã giảm giá');
        }
    };

    const handleShowDetails = (coupon) => {
        setSelectedCouponId(coupon.id);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedCouponId(null);
    };

    const nextSlide = () => {
        if (currentSlide < maxSlides) {
            setCurrentSlide((prev) => prev + 1);
            updateSliderPosition(currentSlide + 1);
        }
    };

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide((prev) => prev - 1);
            updateSliderPosition(currentSlide - 1);
        }
    };

    const updateSliderPosition = (slideIndex) => {
        if (trackRef.current) {
            const translateX = -(slideIndex * 20);
            trackRef.current.style.transform = `translateX(${translateX}%)`;
        }
    };

    React.useEffect(() => {
        updateSliderPosition(currentSlide);
    }, [currentSlide]);

    // Add animation after data loads
    React.useEffect(() => {
        if (filteredCoupons.length > 0) {
            setTimeout(() => {
                const cards = document.querySelectorAll('.coupon-card');
                cards.forEach((card, index) => {
                    setTimeout(() => {
                        card.classList.add('animate-in');
                    }, index * 100);
                });
            }, 100);
        }
    }, [filteredCoupons]);

    const isCouponExpired = (endDate) => {
        const currentDate = new Date();
        const expireDate = new Date(endDate);
        return expireDate < currentDate;
    };

    // Handle retry
    const handleRetry = () => {
        mutate();
    };

    // Loading state
    if (isLoading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <Spin size="large" />
                <div style={{ marginTop: '16px', color: '#666' }}>Đang tải mã giảm giá...</div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div style={{ padding: '20px' }}>
                <Alert
                    message="Lỗi tải dữ liệu"
                    description="Không thể tải dữ liệu mã giảm giá. Vui lòng thử lại sau."
                    type="error"
                    showIcon
                    action={
                        <Button size="small" danger onClick={handleRetry}>
                            Thử lại
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <div style={{ padding: '20px 0', backgroundColor: '#f5f5f5' }}>
            {/* Services Grid */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '20px',
                    marginBottom: '40px',
                    padding: '0 20px',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '20px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                >
                    <div
                        style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            backgroundColor: '#1890ff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '16px',
                        }}
                    >
                        <ClockCircleOutlined style={{ fontSize: '24px', color: 'white' }} />
                    </div>
                    <div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>Giao hàng tốc độ</h3>
                        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Nội thành TP. HCM trong 4h</p>
                    </div>
                </div>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '20px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                >
                    <div
                        style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            backgroundColor: '#52c41a',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '16px',
                        }}
                    >
                        <SwapOutlined style={{ fontSize: '24px', color: 'white' }} />
                    </div>
                    <div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>Đổi trả miễn phí</h3>
                        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Trong vòng 30 ngày miễn phí</p>
                    </div>
                </div>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '20px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                >
                    <div
                        style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            backgroundColor: '#fa8c16',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '16px',
                        }}
                    >
                        <CustomerServiceOutlined style={{ fontSize: '24px', color: 'white' }} />
                    </div>
                    <div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>Hỗ trợ 24/7</h3>
                        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Hỗ trợ khách hàng 24/7</p>
                    </div>
                </div>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '20px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                >
                    <div
                        style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            backgroundColor: '#f5222d',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '16px',
                        }}
                    >
                        <ThunderboltOutlined style={{ fontSize: '24px', color: 'white' }} />
                    </div>
                    <div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>Deal hot bùng nổ</h3>
                        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Flash sale giảm giá cực sốc</p>
                    </div>
                </div>
            </div>

            {/* Coupon Slider */}
            <div style={{ padding: '0 20px' }}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px',
                    }}
                >
                    <h2
                        style={{
                            margin: 0,
                            fontSize: '24px',
                            fontWeight: '600',
                            color: '#333',
                        }}
                    >
                        Mã giảm giá
                    </h2>
                    {filteredCoupons.length > 5 && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Button
                                icon={<LeftOutlined />}
                                onClick={prevSlide}
                                disabled={currentSlide === 0}
                                style={{
                                    borderRadius: '50%',
                                    width: '40px',
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: currentSlide === 0 ? '#f5f5f5' : '#1890ff',
                                    borderColor: currentSlide === 0 ? '#d9d9d9' : '#1890ff',
                                    color: currentSlide === 0 ? '#bfbfbf' : 'white',
                                }}
                            />
                            <Button
                                icon={<RightOutlined />}
                                onClick={nextSlide}
                                disabled={currentSlide >= maxSlides}
                                style={{
                                    borderRadius: '50%',
                                    width: '40px',
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: currentSlide >= maxSlides ? '#f5f5f5' : '#1890ff',
                                    borderColor: currentSlide >= maxSlides ? '#d9d9d9' : '#1890ff',
                                    color: currentSlide >= maxSlides ? '#bfbfbf' : 'white',
                                }}
                            />
                        </div>
                    )}
                </div>

                {filteredCoupons.length === 0 ? (
                    <div
                        style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            color: '#999',
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        }}
                    >
                        Không có mã giảm giá nào khả dụng
                    </div>
                ) : (
                    <div className="coupon-slider-container" style={{ borderRadius: '12px' }}>
                        <div
                            ref={trackRef}
                            className="coupon-track"
                            style={{
                                width: `${filteredCoupons.length * 20}%`,
                            }}
                        >
                            {filteredCoupons.map((coupon, index) => {
                                const isExpired = isCouponExpired(coupon.end_date);
                                const colors = bankColors[index % bankColors.length];

                                return (
                                    <div key={coupon.id} className="coupon-slide">
                                        <div
                                            className="coupon-card"
                                            style={{
                                                backgroundColor: isExpired ? '#f5f5f5' : colors.bg,
                                                borderRadius: '16px',
                                                padding: '24px',
                                                position: 'relative',
                                                height: '160px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                border: isExpired ? '2px dashed #d9d9d9' : 'none',
                                                opacity: isExpired ? 0.6 : 1,
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => handleShowDetails(coupon)}
                                        >
                                            {/* Header */}
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'flex-start',
                                                }}
                                            >
                                                <div>
                                                    <div
                                                        style={{
                                                            fontSize: '20px',
                                                            fontWeight: '700',
                                                            color: isExpired ? '#999' : colors.text,
                                                            marginBottom: '6px',
                                                        }}
                                                    >
                                                        #{coupon.name.toUpperCase()}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: '14px',
                                                            color: isExpired ? '#ccc' : '#666',
                                                        }}
                                                    >
                                                        Hóa đơn trên {formatCurrency(coupon.min_order_value || 50000)}
                                                    </div>
                                                </div>
                                                <div
                                                    style={{
                                                        backgroundColor: isExpired ? '#f0f0f0' : 'white',
                                                        color: isExpired ? '#999' : colors.text,
                                                        padding: '6px 12px',
                                                        borderRadius: '12px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                    }}
                                                >
                                                    {isExpired ? 'Hết hạn' : 'Còn hạn'}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div
                                                style={{
                                                    flex: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    margin: '8px 0',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: '16px',
                                                        color: isExpired ? '#999' : '#333',
                                                        lineHeight: '1.4',
                                                    }}
                                                >
                                                    {coupon.description ||
                                                        `Giảm ${formatPercentage(coupon.discount_value)} cho đơn hàng`}
                                                </div>
                                            </div>

                                            {/* Footer */}
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        backgroundColor: isExpired ? '#f0f0f0' : colors.code,
                                                        color: 'white',
                                                        padding: '8px 16px',
                                                        borderRadius: '20px',
                                                        fontSize: '14px',
                                                        fontWeight: '600',
                                                        opacity: isExpired ? 0.5 : 1,
                                                    }}
                                                >
                                                    {coupon.name.toUpperCase()}
                                                </div>

                                                <Button
                                                    type="primary"
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCopyCoupon(coupon.name.toUpperCase());
                                                    }}
                                                    disabled={isExpired}
                                                    style={{
                                                        borderRadius: '20px',
                                                        fontWeight: '600',
                                                        padding: '4px 16px',
                                                        height: '32px',
                                                        backgroundColor: isExpired ? '#f0f0f0' : colors.code,
                                                        borderColor: isExpired ? '#d9d9d9' : colors.code,
                                                    }}
                                                >
                                                    {copiedCoupon === coupon.name.toUpperCase() ? 'Đã lưu!' : 'Lưu lại'}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal chi tiết */}
            <Modal
                title="Chi tiết mã giảm giá"
                open={modalVisible}
                onCancel={handleCloseModal}
                footer={[
                    <Button key="close" onClick={handleCloseModal}>
                        Đóng
                    </Button>,
                ]}
            >
                {loadingDetails ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <Spin />
                        <div style={{ marginTop: '16px', color: '#666' }}>Đang tải chi tiết...</div>
                    </div>
                ) : couponDetailsData?.coupon ? (
                    <div style={{ padding: '16px 0' }}>
                        <div style={{ marginBottom: '12px' }}>
                            <strong>Mã:</strong> {couponDetailsData.coupon.name.toUpperCase()}
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                            <strong>Giảm giá:</strong> {formatPercentage(couponDetailsData.coupon.discount_value)}
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                            <strong>Giá trị tối thiểu:</strong>{' '}
                            {formatCurrency(couponDetailsData.coupon.min_order_value || 0)}
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                            <strong>Ngày hết hạn:</strong> {formatDate(couponDetailsData.coupon.end_date)}
                        </div>
                        <div>
                            <strong>Mô tả:</strong> {couponDetailsData.coupon.description || 'Không có mô tả chi tiết.'}
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                        Không thể tải thông tin chi tiết
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default CouponSlider;
