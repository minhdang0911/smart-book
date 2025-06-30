"use client"
import React, { useState, useEffect } from 'react';
import { apiGetAllBook } from '../../../../apis/allbook';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import './product.css';
import { marked } from 'marked';

const BookStore = () => {
  const [books, setBooks] = useState({
    featured: [],
    topRated: [],
    mostViewed: [],
    ebooks: [],
    paperBooks: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [token, setToken] = useState(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const router = useRouter();

  // Lấy token khi component mount
  useEffect(() => {
    const getToken = () => {
      const storedToken = localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('access_token');
      return storedToken;
    };

    const authToken = getToken();
    if (authToken) {
      setToken(authToken);
    } else {
      console.warn('Không tìm thấy token. User có thể chưa đăng nhập.');
    }
  }, []);

  // Format price to Vietnamese currency
  const formatPrice = (price) => {
    if (!price) return '';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const addToCart = async (bookId, quantity) => {
    try {
      if (!token) {
        toast.error('🔒 Vui lòng đăng nhập để thêm sách vào giỏ hàng!');
        router.push('/login');
        return {
          success: false,
          error: 'Token không tồn tại'
        };
      }

      const response = await fetch('http://localhost:8000/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          book_id: bookId,
          quantity: quantity
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('🔒 Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
          localStorage.removeItem('authToken');
          localStorage.removeItem('token');
          localStorage.removeItem('access_token');
          setToken(null);
          router.push('/login');
          return {
            success: false,
            error: 'Token expired'
          };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  // Handle Buy Now functionality
  const handleBuyNow = async (book) => {
    if (!token) {
      toast.error('🔒 Vui lòng đăng nhập để mua sách!');
      router.push('/login');
      return;
    }
    try {
      // Tạo dữ liệu checkout như cũ
      const checkoutData = {
        items: [{
          id: book.id,
          name: book.title || book.name,
          price: book.price,
          quantity: 1,
          image: book.cover_image,
          author: typeof book.author === 'string' ? book.author : book.author?.name || 'Unknown Author'
        }],
        totalAmount: book.price,
        totalDiscount: 0,
      };

      // Hiển thị loading
      setIsAddingToCart(true);
      toast.info('🔄 Đang thêm vào giỏ hàng...');

      // Gọi API cart/add
      const item = checkoutData.items[0];

      const response = await fetch('http://localhost:8000/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          book_id: item.id,
          quantity: item.quantity
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('🔒 Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
          localStorage.removeItem('authToken');
          localStorage.removeItem('token');
          localStorage.removeItem('access_token');
          setToken(null);
          router.push('/login');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success || response.ok) {
        toast.success(`✅ Đã thêm "${item.name}" vào giỏ hàng!`);

        // Cập nhật số lượng giỏ hàng
        window.updateCartCount?.();
        window.dispatchEvent(new CustomEvent('cartUpdated'));

        // Lưu thông tin buy now với bookId chính xác
        localStorage.setItem('buyNowData', JSON.stringify({
          isBuyNow: true,
          bookId: book.id, // Đảm bảo là book.id từ parameter
          checkoutData: checkoutData,
          processed: false,
          timestamp: Date.now() // Thêm timestamp để debug
        }));

        console.log('Saved buyNowData:', {
          isBuyNow: true,
          bookId: book.id,
          checkoutData: checkoutData,
          processed: false,
          timestamp: Date.now()
        });

        // Chuyển đến trang payment
        setTimeout(() => {
          toast.info('🛒 Chuyển đến trang đặt đơn...');
          router.push('/cart');
        }, 800);

      } else {
        toast.error(`🚫 ${result.message || 'Không thể thêm vào giỏ hàng'}`);
      }
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error);
      toast.error(`🚨 Lỗi hệ thống: ${error.message}`);
    } finally {
      setIsAddingToCart(false);
    }
  };


  // Handle Add to Cart functionality
  const handleAddToCart = async (book) => {
    try {
      setIsAddingToCart(true);
      const result = await addToCart(book.id, 1);
      if (result.success) {
        toast.success('🎉 Đã thêm sách vào giỏ hàng!');
        window.updateCartCount?.();
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      } else {
        toast.error(`🚫 ${result.message || result.error || 'Không thể thêm vào giỏ hàng'}`);
      }
    } catch (error) {
      toast.error(`🚨 Lỗi hệ thống: ${error?.response?.data?.message || error.message || 'Không rõ lỗi'}`);
      console.error('Lỗi khi gọi API addToCart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Handle Read Now for online books
  const handleReadNow = (book) => {
    if (!token) {
      toast.error('🔒 Vui lòng đăng nhập để đọc sách!');
      router.push('/login');
      return;
    }

    // Navigate to reading page
    router.push(`/read/${book.id}`);
  };

  // Handle Quick View
  const handleQuickView = (e, book) => {
    e.stopPropagation();
    setSelectedBook(book);
    setShowQuickView(true);
  };

  // Close Quick View
  const closeQuickView = () => {
    setShowQuickView(false);
    setSelectedBook(null);
  };

  // Fetch data from your API
  useEffect(() => {
    const fetchAllBooks = async () => {
      try {
        setLoading(true);
        const response = await apiGetAllBook();

        console.log('API Response:', response);

        if (response?.status === 'success') {
          console.log('Latest eBooks:', response.latest_ebooks);
          console.log('Top rated books:', response.top_rated_books);
          console.log('Top viewed books:', response.top_viewed_books);
          console.log('Latest paper books:', response.latest_paper_books);

          setBooks({
            featured: response.latest_ebooks?.slice(0, 2) || [],
            topRated: response.top_rated_books || [],
            mostViewed: response.top_viewed_books || [],
            ebooks: response.latest_ebooks || [],
            paperBooks: response.latest_paper_books || []
          });
        } else {
          setError('Failed to fetch books');
        }
      } catch (err) {
        setError('Error loading books: ' + err.message);
        console.error('Error fetching books:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllBooks();
  }, []);

  // Quick View Popup Component
  const QuickViewPopup = ({ book, onClose }) => {
    if (!book) return null;

    return (
      <div className="quick-view-overlay" onClick={onClose}>
        <div className="quick-view-popup" onClick={(e) => e.stopPropagation()}>
          <button className="close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="popup-content">
            <div className="popup-image">
              <img
                src={book.cover_image || 'https://via.placeholder.com/300x400?text=No+Image'}
                alt={book.title}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x400?text=No+Image';
                }}
              />
            </div>

            <div className="popup-info">
              <h2 className="popup-title">{book.title}</h2>
              <p className="popup-author">
                {typeof book.author === 'string' ? book.author : book.author?.name || 'Unknown Author'}
              </p>

              {book.genre && (
                <div className="popup-genre">
                  {Array.isArray(book.genre)
                    ? book.genre.map(g => typeof g === 'string' ? g : g.name).join(', ')
                    : typeof book.genre === 'string'
                      ? book.genre
                      : book.genre.name || ''
                  }
                </div>
              )}

              {book.average_rating && (
                <div className="popup-rating">
                  <span className="stars">{'★'.repeat(Math.floor(book.average_rating))}</span>
                  <span className="rating-number">{book.average_rating}</span>
                  {book.sold_count && (
                    <span className="sold-count">| Đã bán {book.sold_count}</span>
                  )}
                </div>
              )}

              {book.description && (
                <p
                  className="popup-description"
                  dangerouslySetInnerHTML={{ __html: marked(book.description) }}
                />
              )}


              {book.views && (
                <div className="popup-views">
                  <span className="views-icon">👁️</span>
                  <span className="views-count">{book.views.toLocaleString('vi-VN')} lượt xem</span>
                </div>
              )}

              <div className="popup-actions">
                {book.is_physical === 1 ? (
                  // Physical book - show price and purchase options
                  <>
                    <div className="price-section">
                      {book.price && (
                        <div className="price-container">
                          <span className="current-price">{formatPrice(book.price)}</span>
                          {book.original_price && book.original_price > book.price && (
                            <span className="original-price">{formatPrice(book.original_price)}</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="action-buttons">
                      <button
                        className="buy-now-btn-popup"
                        onClick={() => {
                          handleBuyNow(book);
                          closeQuickView();
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Mua sách
                      </button>

                      <button
                        className="add-to-cart-btn-popup"
                        onClick={() => {
                          handleAddToCart(book);
                        }}
                        disabled={isAddingToCart}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 18.1 16.1 19 15 19H9C7.9 19 7 18.1 7 17V13M17 13H7M9 21C9.6 21 10 21.4 10 22S9.6 23 9 23 8 22.6 8 22 8.4 21 9 21ZM20 21C20.6 21 21 21.4 21 22S20.6 23 20 23 19 22.6 19 22 19.4 21 20 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {isAddingToCart ? 'Đang thêm...' : 'Thêm vào giỏ'}
                      </button>
                    </div>
                  </>
                ) : (
                  // Online book - show read option
                  <div className="action-buttons">
                    <button
                      className="read-now-btn-popup"
                      onClick={() => {
                        handleReadNow(book);
                        closeQuickView();
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Đọc sách
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const BookCard = ({ book, showPrice = false, showViews = false, size = 'normal' }) => (
    <div className={`book-card ${size}`} onClick={() => handleBookClick(book.id)}>
      <div className="book-cover">
        <img
          src={book.cover_image || 'https://via.placeholder.com/150x200?text=No+Image'}
          alt={book.title}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/150x200?text=No+Image';
          }}
        />

        {/* Quick View Button */}
        <div className="quick-view-btn" onClick={(e) => handleQuickView(e, book)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
          </svg>
          <span>Xem nhanh</span>
        </div>
      </div>

      <div className="book-info">
        <h4 className="book-title">{book.title}</h4>
        {book.author && (
          <p className="book-author">
            {typeof book.author === 'string' ? book.author : book.author?.name || 'Unknown Author'}
          </p>
        )}
        {book.genre && (
          <div className="book-genre">
            {Array.isArray(book.genre)
              ? book.genre.map(g => typeof g === 'string' ? g : g.name).join(', ')
              : typeof book.genre === 'string'
                ? book.genre
                : book.genre.name || ''
            }
          </div>
        )}
        {book.categories && (
          <div className="book-categories">
            {Array.isArray(book.categories)
              ? book.categories.map(c => typeof c === 'string' ? c : c.name).join(', ')
              : typeof book.categories === 'string'
                ? book.categories
                : book.categories.name || ''
            }
          </div>
        )}
        {book.average_rating && (
          <div className="book-rating">
            <span className="stars">{'★'.repeat(Math.floor(book.average_rating))}</span>
            <span className="rating-number">{book.average_rating}</span>
          </div>
        )}
        {book.is_physical === 1 && book.price && (
          <div className="book-price-container">
            <span className="book-price">{formatPrice(book.price)}</span>
          </div>
        )}
        {showViews && book.views && (
          <div className="book-views">
            <span className="views-icon">👁️</span>
            <span className="views-count">{book.views.toLocaleString('vi-VN')} lượt xem</span>
          </div>
        )}
      </div>
    </div>
  );

  const handleBookClick = (bookId) => {
    window.location.href = `/book/${bookId}`;
  };

  if (loading) {
    return (
      <div className="bookstore-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải sách...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bookstore-container">
        <div className="error-container">
          <p>❌ {error}</p>
          <button onClick={() => window.location.reload()}>Thử lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bookstore-container">
      {/* Categories Section */}
      <section className="categories-section">
        <h2>❤️ Sách được yêu thích nhất</h2>
        <div className="category-grid">
          {books.topRated.slice(0, 8).map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      {/* Most Viewed Section */}
      <section className="most-viewed-section">
        <h2>🔥 Sách được xem nhiều nhất</h2>
        <div className="book-grid">
          {books.mostViewed.slice(0, 8).map(book => (
            <BookCard key={book.id} book={book} showViews={true} />
          ))}
        </div>
      </section>

      {/* EBooks Section */}
      <section className="romance-section">
        <h2>📖 Sách Giấy Mới Nhất</h2>
        <div className="romance-grid">
          {books.ebooks.slice(0, 6).map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      {/* Paper Books Section */}
      <section className="romance-section">
        <h2>📚 EBooks Mới Nhất</h2>
        <div className="romance-grid">
          {books.paperBooks.slice(0, 6).map(book => (
            <BookCard key={book.id} book={book} showPrice={true} />
          ))}
        </div>
      </section>

      {/* Quick View Popup */}
      {showQuickView && (
        <QuickViewPopup book={selectedBook} onClose={closeQuickView} />
      )}
    </div>
  );
};

export default BookStore;