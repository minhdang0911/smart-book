'use client';
import {
    CalendarOutlined,
    ClockCircleOutlined,
    CloseOutlined,
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

    // Fetch coupons from API
    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:8000/api/coupons/get');

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                // Filter coupons based on Vietnamese display logic
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

    // Filter coupons for display (hide expired coupons after 24h)
    const filterCouponsForDisplay = (coupons) => {
        const now = new Date();

        return coupons.filter((coupon) => {
            const endDate = new Date(coupon.end_date);

            // Nếu chưa hết hạn thì hiển thị
            if (now <= endDate) return true;

            // Nếu đã hết hạn, kiểm tra có quá 24h chưa
            const timeDiffInMs = now.getTime() - endDate.getTime();

            // 24 giờ = 86400000 milliseconds
            return timeDiffInMs <= 86400000;
        });
    };

    // Fetch coupon details
    const fetchCouponDetails = async (couponId) => {
        try {
            const response = await fetch(`http://localhost:8000/api/coupons/${couponId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (err) {
            console.error('Error fetching coupon details:', err);
            return null;
        }
    };

    // Format date to Vietnamese format
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    // Format currency to Vietnamese format
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    // Format percentage to Vietnamese format
    const formatPercentage = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'percent',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(value / 100);
    };

    // Format number to Vietnamese format
    const formatNumber = (number) => {
        return new Intl.NumberFormat('vi-VN').format(number);
    };

    // Handle copy coupon code
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

    // Handle show coupon details
    const handleShowDetails = async (coupon) => {
        const detailData = await fetchCouponDetails(coupon.id);
        console.log(detailData);

        if (detailData) {
            setSelectedCoupon(detailData?.coupon);
        } else {
            setSelectedCoupon(coupon);
        }
        setModalVisible(true);
    };

    // Handle close modal
    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedCoupon(null);
    };

    // Handle slider navigation
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

    // Update slider position
    useEffect(() => {
        const slider = sliderRef.current;
        if (slider && coupons.length > 4) {
            slider.style.transform = `translateX(-${currentSlide * 25}%)`;
        }
    }, [currentSlide, coupons.length]);

    // Check if coupon is expired
    const isCouponExpired = (endDate) => {
        const currentDate = new Date();
        const expireDate = new Date(endDate);
        return expireDate < currentDate;
    };

    // Get coupon status info
    const getCouponStatusInfo = (coupon) => {
        const isExpired = isCouponExpired(coupon.end_date);
        const isActive = coupon.is_active;

        if (!isExpired && isActive) {
            return {
                text: 'Còn hạn',
                className: 'active',
                color: '#52c41a', // Green color for active coupons
            };
        } else {
            return {
                text: 'Hết hạn',
                className: 'inactive',
                color: '#ff4d4f', // Red color for expired coupons
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
            {/* Header Services */}
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

            {/* Coupon Slider */}
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
                                        <div className="coupon-card">
                                            <div
                                                className={`coupon-status ${statusInfo.className}`}
                                                style={{ color: statusInfo.color }}
                                            >
                                                {statusInfo.text}
                                            </div>

                                            <div className="coupon-code">{coupon.name.toUpperCase()}</div>

                                            <div className="coupon-description">
                                                {coupon.description ||
                                                    `Giảm ${formatPercentage(
                                                        coupon.discount_value,
                                                    )} cho đơn hàng từ ${formatCurrency(coupon.min_order_value || 0)}`}
                                            </div>

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
                                                    disabled={statusInfo.className === 'inactive'}
                                                >
                                                    {copiedCoupon === coupon.name.toUpperCase()
                                                        ? 'Đã sao chép!'
                                                        : 'Sao chép'}
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

            {/* Modal for coupon details - Updated with Vietnamese formatting */}
            <Modal
                title={null}
                open={modalVisible}
                onCancel={handleCloseModal}
                footer={null}
                className="coupon-modal"
                width={400}
                centered
                closeIcon={<CloseOutlined style={{ color: '#999', fontSize: '16px' }} />}
            >
                {selectedCoupon && (
                    <div className="modal-content">
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <div className="coupon-code" style={{ fontSize: '24px', marginBottom: '8px' }}>
                                {selectedCoupon.name.toUpperCase()}
                            </div>
                            <div className="modal-description">
                                {selectedCoupon.description ||
                                    `Giảm ${formatPercentage(
                                        selectedCoupon.discount_value,
                                    )} cho đơn hàng có giá trị tối thiểu ${formatCurrency(
                                        selectedCoupon.min_order_value || 0,
                                    )}.`}
                            </div>
                        </div>

                        <div className="modal-details">
                            <div className="detail-item">
                                • Giảm {formatPercentage(selectedCoupon.discount_value)} cho nhóm sản phẩm{' '}
                                {selectedCoupon.scope === 'product' ? selectedCoupon.name : 'EGA'}
                            </div>
                            <div className="detail-item">
                                • Tổng giá trị sản phẩm từ {formatCurrency(selectedCoupon.min_order_value || 0)} trở lên
                            </div>
                            <div className="detail-item" style={{ marginTop: '16px', color: '#999', fontSize: '12px' }}>
                                Hết hạn: {formatDate(selectedCoupon.end_date)}
                            </div>
                            <div
                                className="detail-item"
                                style={{
                                    color: isCouponExpired(selectedCoupon.end_date) ? '#ff4d4f' : '#52c41a',
                                    fontSize: '12px',
                                    marginTop: '4px',
                                    fontWeight: 'bold',
                                }}
                            >
                                {isCouponExpired(selectedCoupon.end_date) ? 'Hết hạn' : 'Còn hạn'}
                            </div>
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <Button
                                type="default"
                                onClick={handleCloseModal}
                                style={{ marginRight: '8px', minWidth: '80px' }}
                            >
                                Đóng
                            </Button>
                            <Button
                                type="primary"
                                onClick={() => {
                                    handleCopyCoupon(selectedCoupon?.name?.toUpperCase());
                                    handleCloseModal();
                                }}
                                disabled={isCouponExpired(selectedCoupon.end_date) || !selectedCoupon.is_active}
                                style={{ minWidth: '80px' }}
                            >
                                Sao chép
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default CouponSlider;
