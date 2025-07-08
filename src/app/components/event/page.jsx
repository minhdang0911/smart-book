'use client';

import { FireOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Badge, Button, Card, Typography } from 'antd';
import { useEffect, useState } from 'react';
import './OnlinePromotion.css';

const { Title, Text } = Typography;

const OnlinePromotion = () => {
    const [events, setEvents] = useState([]);
    const [currentEvents, setCurrentEvents] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [selectedTab, setSelectedTab] = useState('current');
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [displayedBooks, setDisplayedBooks] = useState([]);

    // Fetch events from API
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/events');
                const data = await response.json();
                setEvents(data);
                categorizeEvents(data);
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };

        fetchEvents();
    }, []);

    // Categorize events into current and upcoming
    const categorizeEvents = (eventsData) => {
        const now = new Date();
        const current = [];
        const upcoming = [];

        eventsData.forEach((event) => {
            const startDate = new Date(event.start_date);
            const endDate = new Date(event.end_date);

            if (startDate <= now && endDate >= now) {
                current.push(event);
            } else if (startDate > now) {
                upcoming.push(event);
            }
        });

        setCurrentEvents(current);
        setUpcomingEvents(upcoming);

        // Set displayed books based on current events
        if (current.length > 0) {
            const allCurrentBooks = current.flatMap((event) => event.books);
            setDisplayedBooks(allCurrentBooks);
        }
    };

    // Countdown timer for current and upcoming events
    useEffect(() => {
        let timer;
        if (selectedTab === 'current' && currentEvents.length > 0) {
            timer = setInterval(() => {
                const now = new Date().getTime();
                const eventEnd = new Date(currentEvents[0].end_date).getTime();
                const distance = eventEnd - now;

                if (distance > 0) {
                    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                    setCountdown({ days, hours, minutes, seconds });
                } else {
                    setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                }
            }, 1000);
        } else if (selectedTab === 'upcoming' && upcomingEvents.length > 0) {
            timer = setInterval(() => {
                const now = new Date().getTime();
                const eventStart = new Date(upcomingEvents[0].start_date).getTime();
                const distance = eventStart - now;

                if (distance > 0) {
                    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                    setCountdown({ days, hours, minutes, seconds });
                } else {
                    setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                }
            }, 1000);
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [selectedTab, currentEvents, upcomingEvents]);

    // Handle tab change
    const handleTabChange = (tab) => {
        setSelectedTab(tab);
        if (tab === 'current' && currentEvents.length > 0) {
            const allCurrentBooks = currentEvents.flatMap((event) => event.books);
            setDisplayedBooks(allCurrentBooks);
        } else if (tab === 'upcoming' && upcomingEvents.length > 0) {
            const allUpcomingBooks = upcomingEvents.flatMap((event) => event.books);
            setDisplayedBooks(allUpcomingBooks);
        }
    };

    // Calculate discounted price
    const calculateDiscountedPrice = (price, discount) => {
        const originalPrice = parseFloat(price);
        const discountAmount = originalPrice * (parseFloat(discount) / 100);
        return originalPrice - discountAmount;
    };

    // Format price to Vietnamese currency
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
    };

    // Format date range
    const formatDateRange = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);

        const startFormatted = `${start.getDate().toString().padStart(2, '0')}/${(start.getMonth() + 1)
            .toString()
            .padStart(2, '0')}`;
        const endFormatted = `${end.getDate().toString().padStart(2, '0')}/${(end.getMonth() + 1)
            .toString()
            .padStart(2, '0')}`;

        return `${startFormatted} - ${endFormatted}`;
    };

    return (
        <div className="online-promotion-container">
            <div className="promotion-wrapper">
                {/* Header */}
                <div className="header2">
                    <Title level={1} className="main-title">
                        Khuyến mãi Online
                    </Title>
                    <div className="banner2">
                        <div className="banner2-content">
                            <span className="banner2-text">DẪN ĐẦU GIÁ RẺ</span>
                            <span className="discount-text">GIẢM ĐẾN 50%</span>
                            <div className="banner2-arrow">
                                <span>TỪ TIN HOÀN TIỀN</span>
                                <span>NẾU SIÊU THỊ KHÁC RẺ HỌN</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="tab-navigation">
                    <div className="tabs">
                        <div
                            className={`tab ${selectedTab === 'current' ? 'active' : ''}`}
                            onClick={() => handleTabChange('current')}
                        >
                            <div className="tab-header2">
                                {currentEvents.length > 0
                                    ? formatDateRange(currentEvents[0].start_date, currentEvents[0].end_date)
                                    : ''}
                            </div>
                            <div className="tab-title">Đang diễn ra</div>
                        </div>

                        <div
                            className={`tab ${selectedTab === 'upcoming' ? 'active' : ''}`}
                            onClick={() => handleTabChange('upcoming')}
                        >
                            <div className="tab-header2">
                                {upcomingEvents.length > 0
                                    ? formatDateRange(upcomingEvents[0].start_date, upcomingEvents[0].end_date)
                                    : ''}
                            </div>
                            <div className="tab-title">Sắp diễn ra</div>
                        </div>
                    </div>
                    {/* Countdown Timer */}
                    {(selectedTab === 'current' || selectedTab === 'upcoming') && (
                        <div className="countdown-container">
                            <span className="countdown-label">
                                {selectedTab === 'current' ? 'Kết thúc sau' : 'Kết thúc sau'}
                            </span>
                            <div className="countdown-timer">
                                <span className="countdown-item">{countdown.days.toString().padStart(2, '0')}</span>
                                <span className="countdown-item">{countdown.hours.toString().padStart(2, '0')}</span>
                                <span className="countdown-item">{countdown.minutes.toString().padStart(2, '0')}</span>
                                <span className="countdown-item">{countdown.seconds.toString().padStart(2, '0')}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Products Grid */}
                <div className="products-grid">
                    <div className="products-slider">
                        <div
                            className="products-track"
                            style={{
                                transform: `translateX(${displayedBooks.length > 6 ? '-0px' : '0px'})`,
                                width: `${Math.ceil(displayedBooks.length / 6) * 100}%`,
                            }}
                        >
                            {displayedBooks.map((book, index) => (
                                <div key={book.id} className="product-slide">
                                    <Card className="product-card">
                                        <div className="product-image-container">
                                            <img
                                                src={book?.thumb || 'https://via.placeholder.com/300x400?text=No+Image'}
                                                alt={book.title}
                                                className="w-[300px] h-[400px] object-cover rounded shadow-md"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/300x400?text=No+Image';
                                                }}
                                            />

                                            <div className="product-badges">
                                                <Badge className="flash-sale-badge" text="FLASH SALE" />
                                                <Badge className="discount-badge" text="ƯU ĐÃI ĐẾN 50%" />
                                            </div>
                                        </div>

                                        <div className="product-info">
                                            <div className="product-specs">
                                                <div className="spec-item">
                                                    <span className="spec-label">Số lượng:</span>
                                                    <span className="spec-value">{book.quantity_limit}</span>
                                                </div>
                                                <div className="spec-item">
                                                    <span className="spec-label">Đã bán:</span>
                                                    <span className="spec-value">{book.sold_quantity}</span>
                                                </div>
                                            </div>

                                            <h3 className="product-title">{book.title}</h3>

                                            <div className="product-pricing">
                                                <div className="price-container">
                                                    <span className="current-price">
                                                        {formatPrice(
                                                            calculateDiscountedPrice(book.price, book.discount_percent),
                                                        )}
                                                    </span>
                                                    <span className="original-price">{formatPrice(book.price)}</span>
                                                    <span className="discount-percent">-{book.discount_percent}%</span>
                                                </div>
                                            </div>

                                            <div className="product-actions">
                                                <div className="fire-icon">
                                                    <FireOutlined />
                                                </div>
                                                <span className="stock-status">Vừa mở bán</span>
                                                <Button
                                                    type="primary"
                                                    icon={<ShoppingCartOutlined />}
                                                    className="add-to-cart-btn"
                                                    size="small"
                                                />
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnlinePromotion;
