'use client';
import { EyeOutlined, HeartFilled, HeartOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Button, Card, message, Skeleton, Typography } from 'antd';
import { gsap } from 'gsap';
import { useEffect, useRef, useState } from 'react';
import { apiGetAllBook } from '../../../../apis/allbook';
import { apiAddToCart } from '../../../../apis/cart';
import { apiGetMe } from '../../../../apis/user';
import { handleAddToCartHelper } from '../../utils/addToCartHandler';
import { toggleWishlist } from '../../utils/wishlist';
import './product.css'; // Import CSS file
import QuickViewModal from './QuickViewModal';

const { Title, Text } = Typography;

const WatchStyleBookStore = () => {
    const [books, setBooks] = useState({
        featured: [],
        topRated: [],
        mostViewed: [],
        ebooks: [],
        paperBooks: [],
    });

    const isFavorite = (bookId) => wishlist.includes(bookId);
    const handleToggle = () => {
        toggleWishlist({
            bookId: book.id,
            token,
            wishlist,
            setWishlist,
        });
    };
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState(new Set());
    const [user, setUser] = useState(null);
    const [showQuickView, setShowQuickView] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [quickViewVisible, setQuickViewVisible] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [wishlist, setWishlist] = useState([]);

    // Fetch user info and books data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Get user info
                const token = localStorage.getItem('token');
                if (token) {
                    try {
                        const userResponse = await apiGetMe(token);
                        if (userResponse?.status === true) {
                            setUser(userResponse.user);
                        }
                    } catch (error) {
                        console.error('Error getting user info:', error);
                    }
                }

                // Get all books
                const response = await apiGetAllBook();

                if (response?.status === 'success') {
                    setBooks({
                        featured: response.latest_ebooks?.slice(0, 5) || [], // Thay đổi từ 4 thành 5
                        topRated: response.top_rated_books || [],
                        mostViewed: response.top_viewed_books || [],
                        ebooks: response.latest_ebooks || [],
                        paperBooks: response.latest_paper_books || [],
                    });
                } else {
                    message.error('Không thể tải dữ liệu sách');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                message.error('Lỗi khi tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Format price to Vietnamese currency
    const formatPrice = (price) => {
        if (!price) return '';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    // Calculate discount percentage
    const calculateDiscount = (originalPrice, discountPrice) => {
        if (!originalPrice || !discountPrice) return 0;
        return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
    };

    // Toggle favorite
    const toggleFavorite = (bookId) => {
        const newFavorites = new Set(favorites);
        if (newFavorites.has(bookId)) {
            newFavorites.delete(bookId);
        } else {
            newFavorites.add(bookId);
        }
        setFavorites(newFavorites);
    };

    // Handle quick view
    const handleQuickView = (book) => {
        setSelectedBook(book);
        setQuickViewVisible(true);
    };

    const closeQuickView = () => {
        setShowQuickView(false);
        setSelectedBook(null);
    };

    const handleToggleWishlist = async (bookId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            message.warning('Vui lòng đăng nhập để thêm vào danh sách yêu thích');
            return;
        }

        await toggleWishlist({
            bookId,
            token,
            wishlist,
            setWishlist,
        });
    };

    // Fixed handleAddToCart function
    const handleAddToCart = async (book, qty = 1) => {
        await handleAddToCartHelper({
            user,
            bookId: book.id,
            quantity: qty,
            addToCart: apiAddToCart,
            setIsAddingToCart,
            router: null,
        });
    };

    // Book Card Component
    const BookCard = ({ book }) => {
        const cardRef = useRef(null);
        const actionsRef = useRef(null);
        const discount = calculateDiscount(book.price, book.discount_price);
        const isFavoriteBook = isFavorite(book.id);

        useEffect(() => {
            const card = cardRef.current;
            const actions = actionsRef.current;

            if (!card || !actions) return;

            const buttons = actions.querySelectorAll('.ant-btn');

            // Set initial state for buttons
            gsap.set(buttons, {
                y: 30,
                opacity: 0,
                scale: 0.8,
            });

            const handleMouseEnter = () => {
                // Animate buttons with stagger effect
                gsap.to(buttons, {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 0.4,
                    ease: 'back.out(1.7)',
                    stagger: 0.1,
                });
            };

            const handleMouseLeave = () => {
                gsap.to(buttons, {
                    y: 30,
                    opacity: 0,
                    scale: 0.8,
                    duration: 0.3,
                    ease: 'power2.in',
                    stagger: 0.05,
                });
            };

            card.addEventListener('mouseenter', handleMouseEnter);
            card.addEventListener('mouseleave', handleMouseLeave);

            return () => {
                card.removeEventListener('mouseenter', handleMouseEnter);
                card.removeEventListener('mouseleave', handleMouseLeave);
            };
        }, []);

        return (
            <div className="book-card-wrapper">
                <Card
                    ref={cardRef}
                    className="book-card"
                    style={{ width: '100%', margin: '0 auto' }}
                    cover={
                        <div className="book-image-container">
                            {book.discount_price > 0 && book.discount_price < book.price && (
                                <div className="discount-badge">-{discount}%</div>
                            )}

                            <img
                                src={book.cover_image || 'https://via.placeholder.com/300x400?text=No+Image'}
                                alt={book.title}
                                className="book-image"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/300x400?text=No+Image';
                                }}
                            />
                            <div ref={actionsRef} className="book-actions">
                                <Button
                                    type="text"
                                    icon={isFavoriteBook ? <HeartFilled /> : <HeartOutlined />}
                                    className={`favorite-btn ${isFavoriteBook ? 'favorited' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleWishlist(book.id);
                                    }}
                                />

                                <Button
                                    type="text"
                                    icon={<ShoppingCartOutlined />}
                                    className="cart-btn"
                                    loading={isAddingToCart}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddToCart(book);
                                    }}
                                />
                                <Button
                                    type="text"
                                    icon={<EyeOutlined />}
                                    className="view-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleQuickView(book);
                                    }}
                                />
                            </div>
                        </div>
                    }
                    onClick={() => (window.location.href = `/book/${book.id}`)}
                >
                    <div className="book-info">
                        <Title level={5} className="book-title" ellipsis={{ rows: 2 }}>
                            {book.title}
                        </Title>

                        {book.author && (
                            <Text className="book-author" type="secondary">
                                {typeof book.author === 'string' ? book.author : book.author?.name || 'Unknown Author'}
                            </Text>
                        )}
                        <div className="price-container">
                            {book.discount_price > 0 && book.discount_price < book.price ? (
                                <>
                                    <Text delete className="original-price">
                                        {formatPrice(book.price)}
                                    </Text>
                                    <Text strong className="discount-price">
                                        {formatPrice(book.discount_price)}
                                    </Text>
                                </>
                            ) : book.price ? (
                                <Text strong className="current-price">
                                    {formatPrice(book.price)}
                                </Text>
                            ) : (
                                <Text className="free-text">Miễn phí</Text>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="bookstore-container">
                <div className="books-grid">
                    {[...Array(10)].map((_, index) => (
                        <div key={index} className="book-grid-item">
                            <Card>
                                <Skeleton.Image style={{ width: '100%', height: 300 }} active />
                                <Skeleton active paragraph={{ rows: 3 }} />
                            </Card>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bookstore-container">
                {/* Featured Books Section */}
                <div className="section">
                    <Title level={2} className="section-title">
                        📚 Sách Nổi Bật
                    </Title>
                    <div className="books-grid">
                        {books.featured.map((book) => (
                            <div key={book.id} className="book-grid-item">
                                <BookCard book={book} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Rated Books Section */}
                <div className="section">
                    <Title level={2} className="section-title">
                        ⭐ Sách Được Yêu Thích Nhất
                    </Title>
                    <div className="books-grid">
                        {books.topRated.slice(0, 10).map((book) => (
                            <div key={book.id} className="book-grid-item">
                                <BookCard book={book} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Most Viewed Books Section */}
                <div className="section">
                    <Title level={2} className="section-title">
                        🔥 Sách Được Xem Nhiều Nhất
                    </Title>
                    <div className="books-grid">
                        {books.mostViewed.slice(0, 10).map((book) => (
                            <div key={book.id} className="book-grid-item">
                                <BookCard book={book} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* EBooks Section */}
                <div className="section">
                    <Title level={2} className="section-title">
                        💻 EBooks Mới Nhất
                    </Title>
                    <div className="books-grid">
                        {books.ebooks.slice(0, 10).map((book) => (
                            <div key={book.id} className="book-grid-item">
                                <BookCard book={book} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Paper Books Section */}
                <div className="section">
                    <Title level={2} className="section-title">
                        📖 Sách Giấy Mới Nhất
                    </Title>
                    <div className="books-grid">
                        {books.paperBooks.slice(0, 10).map((book) => (
                            <div key={book.id} className="book-grid-item">
                                <BookCard book={book} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <QuickViewModal
                visible={quickViewVisible}
                onClose={() => setQuickViewVisible(false)}
                book={selectedBook}
                quantity={quantity}
                setQuantity={setQuantity}
                handleAddToCart={handleAddToCart}
                toggleFavorite={handleToggleWishlist}
                isFavorite={selectedBook && isFavorite(selectedBook.id)}
                isAddingToCart={isAddingToCart}
            />
        </>
    );
};

export default WatchStyleBookStore;
