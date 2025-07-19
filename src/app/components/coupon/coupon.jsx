'use client';
import {
    CalendarOutlined,
    ClockCircleOutlined,
    CopyOutlined,
    CustomerServiceOutlined,
    InfoCircleOutlined,
    LeftOutlined,
    RightOutlined,
    SwapOutlined,
    ThunderboltOutlined,
} from '@ant-design/icons';
import { Alert, Button, message, Modal, Spin } from 'antd';
import { useEffect, useRef, useState } from 'react';
import './CouponSlider.css';

const CouponSlider = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [copiedCoupon, setCopiedCoupon] = useState(null);
    const sliderRef = useRef(null);

    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:8000/api/coupons/get');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                const filteredCoupons = filterCouponsForDisplay(data?.coupons);
                setCoupons(filteredCoupons);
                setError(null);
            } catch (err) {
                console.error('Error fetching coupons:', err);
                setError('Không thể tải dữ liệu mã giảm giá. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };
        fetchCoupons();
    }, []);

    const filterCouponsForDisplay = (coupons) => {
        const now = new Date();
        return coupons.filter((coupon) => {
            const endDate = new Date(coupon.end_date);
            if (now <= endDate) return true;
            const timeDiffInMs = now.getTime() - endDate.getTime();
            return timeDiffInMs <= 86400000; // 24 giờ
        });
    };

    const fetchCouponDetails = async (couponId) => {
        try {
            const response = await fetch(`http://localhost:8000/api/coupons/${couponId}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            return data;
        } catch (err) {
            console.error('Error fetching coupon details:', err);
            return null;
        }
    };

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

    const handleShowDetails = async (coupon) => {
        const detailData = await fetchCouponDetails(coupon.id);
        if (detailData) {
            setSelectedCoupon(detailData?.coupon);
        } else {
            setSelectedCoupon(coupon);
        }
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedCoupon(null);
    };

    const nextSlide = () => {
        if (coupons.length > 4) {
            setCurrentSlide((prev) => (prev + 1) % Math.max(1, coupons.length - 3));
        }
    };

    const prevSlide = () => {
        if (coupons.length > 4) {
            setCurrentSlide((prev) => (prev - 1 + Math.max(1, coupons.length - 3)) % Math.max(1, coupons.length - 3));
        }
    };

    useEffect(() => {
        const slider = sliderRef.current;
        if (slider && coupons.length > 4) {
            slider.style.transform = `translateX(-${currentSlide * 25}%)`;
        }
    }, [currentSlide, coupons.length]);

    const isCouponExpired = (endDate) => {
        const currentDate = new Date();
        const expireDate = new Date(endDate);
        return expireDate < currentDate;
    };

    const getCouponStatusInfo = (coupon) => {
        const isExpired = isCouponExpired(coupon.end_date);
        const isActive = coupon.is_active;
        if (!isExpired && isActive) {
            return {
                text: 'Còn hạn',
                className: 'active',
                color: '#52c41a',
            };
        } else {
            return {
                text: 'Hết hạn',
                className: 'inactive',
                color: '#ff4d4f',
            };
        }
    };

    if (loading) {
        return (
            <div className="coupon-container">
                <div className="loading-container">
                    <Spin size="large" />
                    <span className="loading-text">Đang tải mã giảm giá...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="coupon-container">
                <Alert
                    message="Lỗi tải dữ liệu"
                    description={error}
                    type="error"
                    showIcon
                    action={
                        <Button size="small" danger onClick={() => window.location.reload()}>
                            Thử lại
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <div className="coupon-container">
            <div className="services-grid">
                <div className="service-item">
                    <div className="service-icon clock-icon">
                        <ClockCircleOutlined />
                    </div>
                    <div className="service-content">
                        <h3>Giao hàng tốc độ</h3>
                        <p>Nội thành TP. HCM trong 4h</p>
                    </div>
                </div>

                <div className="service-item">
                    <div className="service-icon swap-icon">
                        <SwapOutlined />
                    </div>
                    <div className="service-content">
                        <h3>Đổi trả miễn phí</h3>
                        <p>Trong vòng 30 ngày miễn phí</p>
                    </div>
                </div>

                <div className="service-item">
                    <div className="service-icon support-icon">
                        <CustomerServiceOutlined />
                    </div>
                    <div className="service-content">
                        <h3>Hỗ trợ 24/7</h3>
                        <p>Hỗ trợ khách hàng 24/7</p>
                    </div>
                </div>

                <div className="service-item">
                    <div className="service-icon deal-icon">
                        <ThunderboltOutlined />
                    </div>
                    <div className="service-content">
                        <h3>Deal hot bùng nổ</h3>
                        <p>Flash sale giảm giá cực sốc</p>
                    </div>
                </div>
            </div>

            <div className="slider-container">
                <div className="slider-header">
                    <h2>Mã giảm giá</h2>
                    {coupons.length > 4 && (
                        <div className="slider-controls">
                            <Button
                                icon={<LeftOutlined />}
                                onClick={prevSlide}
                                disabled={currentSlide === 0}
                                className="slider-btn"
                            />
                            <Button
                                icon={<RightOutlined />}
                                onClick={nextSlide}
                                disabled={currentSlide >= Math.max(0, coupons.length - 4)}
                                className="slider-btn"
                            />
                        </div>
                    )}
                </div>

                {coupons.length === 0 ? (
                    <div className="no-coupons">Không có mã giảm giá nào khả dụng</div>
                ) : (
                    <div className="slider-wrapper">
                        <div
                            ref={sliderRef}
                            className="slider-track"
                            style={{
                                width: coupons.length <= 4 ? '100%' : `${coupons.length * 25}%`,
                            }}
                        >
                            {coupons.map((coupon) => {
                                const statusInfo = getCouponStatusInfo(coupon);
                                const isExpired = statusInfo.className === 'inactive';

                                return (
                                    <div
                                        key={coupon.id}
                                        className="coupon-slide"
                                        style={{
                                            width:
                                                coupons.length <= 4
                                                    ? `${100 / Math.min(coupons.length, 4)}%`
                                                    : `${100 / coupons.length}%`,
                                        }}
                                    >
                                        <div className={`coupon-card ${isExpired ? 'expired' : ''}`}>
                                            <div className="coupon-left">
                                                <div className="coupon-code">{coupon.name.toUpperCase()}</div>
                                                <div className="coupon-discount">
                                                    Giảm {formatPercentage(coupon.discount_value)}
                                                </div>
                                            </div>

                                            <div className="coupon-right">
                                                <div className={`coupon-status ${statusInfo.className}`}>
                                                    {statusInfo.text}
                                                </div>

                                                <div className="coupon-description">
                                                    {coupon.description ||
                                                        `Giảm ${formatPercentage(
                                                            coupon.discount_value,
                                                        )} cho đơn hàng từ ${formatCurrency(
                                                            coupon.min_order_value || 0,
                                                        )}`}
                                                </div>

                                                <div className="coupon-bottom">
                                                    <div className="coupon-expiry">
                                                        <CalendarOutlined className="expiry-icon" />
                                                        <span>{formatDate(coupon.end_date)}</span>
                                                    </div>

                                                    <div className="coupon-actions">
                                                        <Button
                                                            type="default"
                                                            size="small"
                                                            icon={<InfoCircleOutlined />}
                                                            onClick={() => handleShowDetails(coupon)}
                                                            className="conditions-btn"
                                                        >
                                                            Điều kiện
                                                        </Button>
                                                        <Button
                                                            type="primary"
                                                            size="small"
                                                            icon={<CopyOutlined />}
                                                            onClick={() => handleCopyCoupon(coupon.name.toUpperCase())}
                                                            className="copy-btn"
                                                            disabled={isExpired}
                                                        >
                                                            {copiedCoupon === coupon.name.toUpperCase()
                                                                ? 'Đã sao chép!'
                                                                : 'Sao chép'}
                                                        </Button>
                                                    </div>
                                                </div>
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
                {selectedCoupon ? (
                    <div className="coupon-detail">
                        <p>
                            <strong>Mã:</strong> {selectedCoupon.name.toUpperCase()}
                        </p>
                        <p>
                            <strong>Giảm giá:</strong> {formatPercentage(selectedCoupon.discount_value)}
                        </p>
                        <p>
                            <strong>Giá trị tối thiểu:</strong> {formatCurrency(selectedCoupon.min_order_value || 0)}
                        </p>
                        <p>
                            <strong>Ngày hết hạn:</strong> {formatDate(selectedCoupon.end_date)}
                        </p>
                        <p>
                            <strong>Mô tả:</strong> {selectedCoupon.description || 'Không có mô tả chi tiết.'}
                        </p>
                    </div>
                ) : (
                    <Spin />
                )}
            </Modal>
        </div>
    );
};

export default CouponSlider;
