'use client';

import { BookOutlined, FireOutlined, LaptopOutlined, ReadOutlined, StarOutlined } from '@ant-design/icons';
import { message, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { apiGetMe } from '../../../../../apis/user';
import '../product.css';
import { BookSection } from './BookSection';
import { LoadingSkeleton } from './LoadingSkeleton';
import { QuickViewModal } from './QuickViewModal';

const { Title } = Typography;

export function BookStoreClient({ initialBooks }) {
    const [books, setBooks] = useState(initialBooks);
    const [user, setUser] = useState(null);
    const [showQuickView, setShowQuickView] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [quickViewVisible, setQuickViewVisible] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');

                if (token) {
                    const userResponse = await apiGetMe(token);
                    if (userResponse?.status === true) {
                        setUser(userResponse.user);
                    }

                    const followedRes = await fetch('https://smartbook-backend.tranminhdang.cloud/api/books/followed', {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const followedData = await followedRes.json();

                    if (followedData?.status === true) {
                        const followedIds = followedData.followed_books.map((book) => book.id);
                        setWishlist(followedIds);
                    }
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                message.error('Lỗi khi tải thông tin người dùng');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleQuickView = (book) => {
        setSelectedBook(book);
        setQuickViewVisible(true);
    };

    if (loading) {
        return <LoadingSkeleton />;
    }

    const sections = [
        { title: 'Sách Nổi Bật', key: 'featured', icon: <BookOutlined /> },
        { title: 'Sách Được Yêu Thích Nhất', key: 'topRated', icon: <StarOutlined /> },
        { title: 'Sách Được Xem Nhiều Nhất', key: 'mostViewed', icon: <FireOutlined /> },
        { title: 'Sách Giấy Mới Nhất', key: 'ebooks', icon: <LaptopOutlined /> },
        { title: 'Sách Đọc Miễn Phí Mới Nhất', key: 'paperBooks', icon: <ReadOutlined /> },
    ];

    return (
        <>
            <div className="bookstore-container">
                {sections.map(({ title, key, icon }) => (
                    <BookSection
                        key={key}
                        title={
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                {icon}
                                <span>{title}</span>
                            </span>
                        }
                        books={books[key]?.slice(0, 10) || []}
                        user={user}
                        wishlist={wishlist}
                        setWishlist={setWishlist}
                        onQuickView={handleQuickView}
                        isAddingToCart={isAddingToCart}
                        setIsAddingToCart={setIsAddingToCart}
                    />
                ))}
            </div>

            <QuickViewModal
                visible={quickViewVisible}
                onClose={() => setQuickViewVisible(false)}
                book={selectedBook}
                quantity={quantity}
                setQuantity={setQuantity}
                user={user}
                wishlist={wishlist}
                setWishlist={setWishlist}
                isAddingToCart={isAddingToCart}
                setIsAddingToCart={setIsAddingToCart}
            />
        </>
    );
}
