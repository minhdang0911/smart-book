'use client';

import { ShoppingCartOutlined } from '@ant-design/icons';
import { Button, Card, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import './OnlinePromotion.css';

const { Title } = Typography;

const OnlinePromotion = () => {
    const [events, setEvents] = useState([]);
    const [currentEvents, setCurrentEvents] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [selectedTab, setSelectedTab] = useState('current');
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [displayedBooks, setDisplayedBooks] = useState([]);
    const router = useRouter();

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch('https://smartbook.io.vn/api/events');
                const data = await response.json();
                setEvents(data);
                categorizeEvents(data);
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };

        fetchEvents();
    }, []);

    const categorizeEvents = (eventsData) => {
        const now = new Date();
        const current = [];
        let upcoming = [];

        // Tìm các sự kiện đang diễn ra
        eventsData.forEach((event) => {
            const startDate = new Date(event.start_date);
            const endDate = new Date(event.end_date);

            if (startDate <= now && endDate >= now) {
                current.push(event);
            }
        });

        // Sắp xếp sự kiện đang diễn ra theo thời gian kết thúc (sớm kết thúc nhất trước)
        const sortedCurrent = current.sort((a, b) => new Date(a.end_date) - new Date(b.end_date));

        // Nếu có sự kiện đang diễn ra, tìm sự kiện sắp diễn ra gần nhất với ngày kết thúc
        if (sortedCurrent.length > 0) {
            const currentEndDate = new Date(sortedCurrent[0].end_date);

            // Tìm sự kiện có ngày bắt đầu gần nhất với ngày kết thúc của sự kiện đang diễn ra
            let nearestUpcoming = null;
            let minDistance = Infinity;

            eventsData.forEach((event) => {
                const startDate = new Date(event.start_date);
                const endDate = new Date(event.end_date);

                // Chỉ xét các sự kiện chưa bắt đầu hoặc bắt đầu sau khi sự kiện hiện tại kết thúc
                if (startDate >= currentEndDate) {
                    const distance = Math.abs(startDate - currentEndDate);
                    if (distance < minDistance) {
                        minDistance = distance;
                        nearestUpcoming = event;
                    }
                }
            });

            if (nearestUpcoming) {
                upcoming = [nearestUpcoming];
            }
        } else {
            // Nếu không có sự kiện đang diễn ra, tìm sự kiện sắp diễn ra gần nhất
            const futureEvents = eventsData.filter((event) => new Date(event.start_date) > now);
            if (futureEvents.length > 0) {
                const sortedFuture = futureEvents.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
                upcoming = [sortedFuture[0]];
            }
        }

        setCurrentEvents(sortedCurrent);
        setUpcomingEvents(upcoming);

        // Xác định tab mặc định và sách hiển thị
        if (sortedCurrent.length > 0) {
            setSelectedTab('current');
            setDisplayedBooks(sortedCurrent[0].books || []);
        } else if (upcoming.length > 0) {
            setSelectedTab('upcoming');
            setDisplayedBooks(upcoming[0].books || []);
        } else {
            setDisplayedBooks([]);
        }
    };

    useEffect(() => {
        let timer;
        const updateCountdown = (targetTime) => {
            const now = new Date().getTime();
            const distance = targetTime - now;

            if (distance > 0) {
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                setCountdown({ days, hours, minutes, seconds });
            } else {
                setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                // Khi countdown kết thúc, tự động làm mới dữ liệu
                setTimeout(() => {
                    categorizeEvents(events);
                }, 1000);
            }
        };

        if (selectedTab === 'current' && currentEvents.length > 0) {
            // Đếm ngược đến khi kết thúc sự kiện hiện tại
            timer = setInterval(() => updateCountdown(new Date(currentEvents[0].end_date).getTime()), 1000);
        } else if (selectedTab === 'upcoming' && upcomingEvents.length > 0) {
            // Đếm ngược đến khi bắt đầu sự kiện sắp diễn ra
            timer = setInterval(() => updateCountdown(new Date(upcomingEvents[0].start_date).getTime()), 1000);
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [selectedTab, currentEvents, upcomingEvents, events]);

    const handleTabChange = (tab) => {
        setSelectedTab(tab);
        if (tab === 'current' && currentEvents.length > 0) {
            setDisplayedBooks(currentEvents[0].books || []);
        } else if (tab === 'upcoming' && upcomingEvents.length > 0) {
            setDisplayedBooks(upcomingEvents[0].books || []);
        } else {
            setDisplayedBooks([]);
        }
    };

    const calculateDiscountedPrice = (price, discount) => {
        const originalPrice = parseFloat(price);
        const discountAmount = originalPrice * (parseFloat(discount) / 100);
        return originalPrice - discountAmount;
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
    };

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

    const getCountdownLabel = () => {
        if (selectedTab === 'current') {
            return 'Kết thúc sau';
        } else if (selectedTab === 'upcoming') {
            return 'Bắt đầu sau';
        }
        return '';
    };

    return (
        <div className="bookstore-container">
            <div className="section">
                <div className="section-title">
                    <Title level={2}>Khuyến mãi Online</Title>
                </div>

                <div className="tab-navigation">
                    <div className="tabs">
                        <div
                            className={`tab ${selectedTab === 'current' ? 'active' : ''} ${
                                currentEvents.length === 0 ? 'disabled' : ''
                            }`}
                            onClick={() => currentEvents.length > 0 && handleTabChange('current')}
                        >
                            <div className="tab-header2">
                                {currentEvents.length > 0
                                    ? formatDateRange(currentEvents[0].start_date, currentEvents[0].end_date)
                                    : 'Không có sự kiện'}
                            </div>
                            <div className="tab-title">Đang diễn ra ({currentEvents.length})</div>
                        </div>

                        <div
                            className={`tab ${selectedTab === 'upcoming' ? 'active' : ''} ${
                                upcomingEvents.length === 0 ? 'disabled' : ''
                            }`}
                            onClick={() => upcomingEvents.length > 0 && handleTabChange('upcoming')}
                        >
                            <div className="tab-header2">
                                {upcomingEvents.length > 0
                                    ? formatDateRange(upcomingEvents[0].start_date, upcomingEvents[0].end_date)
                                    : 'Không có sự kiện'}
                            </div>
                            <div className="tab-title">Sắp diễn ra ({upcomingEvents.length})</div>
                        </div>
                    </div>

                    {((selectedTab === 'current' && currentEvents.length > 0) ||
                        (selectedTab === 'upcoming' && upcomingEvents.length > 0)) && (
                        <div className="countdown-container">
                            <span className="countdown-label">{getCountdownLabel()}</span>
                            <div className="countdown-timer">
                                <span className="countdown-item">{countdown.days.toString().padStart(2, '0')}</span>
                                <span className="countdown-item">{countdown.hours.toString().padStart(2, '0')}</span>
                                <span className="countdown-item">{countdown.minutes.toString().padStart(2, '0')}</span>
                                <span className="countdown-item">{countdown.seconds.toString().padStart(2, '0')}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="books-grid">
                    {displayedBooks.length > 0 ? (
                        displayedBooks.map((book) => (
                            <div
                                key={book.id}
                                className="book-grid-item"
                                onClick={() => router.push(`/book/${book.id}`)}
                            >
                                <Card className="book-card">
                                    <div className="book-image-container">
                                        <img
                                            src={book?.thumb || 'https://via.placeholder.com/300x400?text=No+Image'}
                                            alt={book.title}
                                            className="book-image"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/300x400?text=No+Image';
                                            }}
                                        />
                                        <div className="discount-badge">
                                            ƯU ĐÃI ĐẾN {Math.round(book.discount_percent)}%
                                        </div>

                                        <div className="book-actions">
                                            <Button type="text" icon={<ShoppingCartOutlined />} className="cart-btn" />
                                        </div>
                                    </div>

                                    <div className="book-info">
                                        <h3 className="book-title">{book.title}</h3>
                                        <span className="book-author">Số lượng: {book.quantity_limit}</span>
                                        <span className="book-author">Đã bán: {book.sold_quantity}</span>

                                        <div className="price-container">
                                            <span className="current-price">
                                                {formatPrice(
                                                    calculateDiscountedPrice(book.price, book.discount_percent),
                                                )}
                                            </span>
                                            <span className="original-price">{formatPrice(book.price)}</span>
                                            <span className="discount-price">-{book.discount_percent}%</span>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        ))
                    ) : (
                        <div className="no-books-message">
                            <p>Không có sách nào trong sự kiện này.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OnlinePromotion;
