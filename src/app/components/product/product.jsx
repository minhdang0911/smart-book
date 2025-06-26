"use client"
import React, { useState, useEffect } from 'react';
import { apiGetAllBook } from '../../../../apis/allbook';
import './product.css';


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

  // Debug function to safely render object data
  const debugRender = (data, label) => {
    console.log(`${label}:`, data);
    if (typeof data === 'object' && data !== null) {
      return JSON.stringify(data);
    }
    return data;
  };

  // Fetch data from your API
  useEffect(() => {
    const fetchAllBooks = async () => {
      try {
        setLoading(true);
        const response = await apiGetAllBook();

        console.log('API Response:', response); // Debug log

        if (response?.status === 'success') {
          // Debug each array
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
        <div className="book-overlay">
          <button className="quick-view-btn">Quick View</button>
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
        {showPrice && book.is_physical === 1 && book.price && (
          <p className="book-price">{book.price.toLocaleString('vi-VN')} VNĐ</p>
        )}
        {showViews && book.views && (
          <p className="book-views">👁️ {book.views.toLocaleString('vi-VN')} lượt xem</p>
        )}
      </div>
    </div>
  );

  const handleBookClick = (bookId) => {
    // Navigate to book detail page
    window.location.href = `/book/${bookId}`;
    // Or if using React Router: navigate(`/book/${bookId}`);
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

      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h2>Chào mừng bạn đến với trang chủ chúng tôi</h2>
            <p>The largest library of bestselling stories</p>
          </div>
          <div className="hero-books">
            {books.featured.map(book => (
              <BookCard key={book.id} book={book} size="large" />
            ))}
          </div>
        </div>
      </section>

      {/* Shopfront Section */}
      <section className="shopfront-section">
        <h2>Shopfront</h2>
        <div className="book-grid">
          {books.topRated.slice(0, 12).map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <h2>Sách được yêu thích nhất</h2>
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
        <h2>📚 EBooks Mới Nhất</h2>
        <div className="romance-grid">
          {books.ebooks.slice(0, 6).map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      {/* Paper Books Section */}
      <section className="romance-section">
        <h2>📖 Sách Giấy Mới Nhất</h2>
        <div className="romance-grid">
          {books.paperBooks.slice(0, 6).map(book => (
            <BookCard key={book.id} book={book} showPrice={true} />
          ))}
        </div>
      </section>


    </div>
  );
};

export default BookStore;