
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
import './CouponSlider.css';

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
            <div className="loading-container">
                <Spin size="large" />
                <div className="loading-text">Đang tải mã giảm giá...</div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="error-container">
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
        <div className="coupon-slider-wrapper">
            {/* Services Grid */}
            <div className="services-grid">
                <div className="service-item">
                    <div className="service-icon blue">
                        <ClockCircleOutlined />
                    </div>
                    <div>
                        <h3>Giao hàng tốc độ</h3>
                        <p>Nội thành TP. HCM trong 4h</p>
                    </div>
                </div>

                <div className="service-item">
                    <div className="service-icon green">
                        <SwapOutlined />
                    </div>
                    <div>
                        <h3>Đổi trả miễn phí</h3>
                        <p>Trong vòng 30 ngày miễn phí</p>
                    </div>
                </div>

                <div className="service-item">
                    <div className="service-icon orange">
                        <CustomerServiceOutlined />
                    </div>
                    <div>
                        <h3>Hỗ trợ 24/7</h3>
                        <p>Hỗ trợ khách hàng 24/7</p>
                    </div>
                </div>

                <div className="service-item">
                    <div className="service-icon red">
                        <ThunderboltOutlined />
                    </div>
                    <div>
                        <h3>Deal hot bùng nổ</h3>
                        <p>Flash sale giảm giá cực sốc</p>
                    </div>
                </div>
            </div>

            {/* Coupon Slider */}
            <div className="coupon-slider">
                <div className="slider-header">
                    <h2>Mã giảm giá</h2>
                    {filteredCoupons.length > 5 && (
                        <div className="slider-controls">
                            <Button
                                icon={<LeftOutlined />}
                                onClick={prevSlide}
                                disabled={currentSlide === 0}
                                className={currentSlide === 0 ? 'disabled' : ''}
                            />
                            <Button
                                icon={<RightOutlined />}
                                onClick={nextSlide}
                                disabled={currentSlide >= maxSlides}
                                className={currentSlide >= maxSlides ? 'disabled' : ''}
                            />
                        </div>
                    )}
                </div>

                {filteredCoupons.length === 0 ? (
                    <div className="empty-state">
                        Không có mã giảm giá nào khả dụng
                    </div>
                ) : (
                    <div className="coupon-slider-container">
                        <div
                            ref={trackRef}
                            className="coupon-track"
                            style={{ width: `${filteredCoupons.length * 20}%` }}
                        >
                            {filteredCoupons.map((coupon, index) => {
                                const isExpired = isCouponExpired(coupon.end_date);
                                const colors = bankColors[index % bankColors.length];

                                return (
                                    <div key={coupon.id} className="coupon-slide">
                                        <div
                                            className={`coupon-card ${isExpired ? 'expired' : ''}`}
                                            style={{
                                                backgroundColor: isExpired ? '#f5f5f5' : colors.bg,
                                                border: isExpired ? '2px dashed #d9d9d9' : 'none',
                                                opacity: isExpired ? 0.6 : 1,
                                            }}
                                            onClick={() => handleShowDetails(coupon)}
                                        >
                                            {/* Header */}
                                            <div className="coupon-header">
                                                <div>
                                                    <div className="coupon-code" style={{ color: isExpired ? '#999' : colors.text }}>
                                                        #{coupon.name.toUpperCase()}
                                                    </div>
                                                    <div className="coupon-min-order" style={{ color: isExpired ? '#ccc' : '#666' }}>
                                                        Hóa đơn trên {formatCurrency(coupon.min_order_value || 50000)}
                                                    </div>
                                                </div>
                                                <div
                                                    className="coupon-status"
                                                    style={{
                                                        backgroundColor: isExpired ? '#f0f0f0' : 'white',
                                                        color: isExpired ? '#999' : colors.text,
                                                    }}
                                                >
                                                    {isExpired ? 'Hết hạn' : 'Còn hạn'}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="coupon-content">
                                                <div style={{ color: isExpired ? '#999' : '#333' }}>
                                                    {coupon.description ||
                                                        `Giảm ${formatPercentage(coupon.discount_value)} cho đơn hàng`}
                                                </div>
                                            </div>

                                            {/* Footer */}
                                            <div className="coupon-footer">
                                                <div
                                                    className="coupon-code-display"
                                                    style={{
                                                        backgroundColor: isExpired ? '#f0f0f0' : colors.code,
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
                                                    className="coupon-copy-button"
                                                    style={{
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
                    <div className="modal-loading">
                        <Spin />
                        <div className="modal-loading-text">Đang tải chi tiết...</div>
                    </div>
                ) : couponDetailsData?.coupon ? (
                    <div className="modal-content">
                        <div className="modal-item">
                            <strong>Mã:</strong> {couponDetailsData.coupon.name.toUpperCase()}
                        </div>
                        <div className="modal-item">
                            <strong>Giảm giá:</strong> {formatPercentage(couponDetailsData.coupon.discount_value)}
                        </div>
                        <div className="modal-item">
                            <strong>Giá trị tối thiểu:</strong>{' '}
                            {formatCurrency(couponDetailsData.coupon.min_order_value || 0)}
                        </div>
                        <div className="modal-item">
                            <strong>Ngày hết hạn:</strong> {formatDate(couponDetailsData.coupon.end_date)}
                        </div>
                        <div className="modal-item">
                            <strong>Mô tả:</strong> {couponDetailsData.coupon.description || 'Không có mô tả chi tiết.'}
                        </div>
                    </div>
                ) : (
                    <div className="modal-empty">
                        Không thể tải thông tin chi tiết
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default CouponSlider;
