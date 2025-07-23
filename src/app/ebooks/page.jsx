'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiGetAllBook } from '../../../apis/allbook';
import './ebook.css';

const ebooks = () => {
    const [ebooks, setEbooks] = useState([]);
    const [notify, setNotify] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchAllBook = async () => {
            const response = await apiGetAllBook();
            if (response?.status === 'success') {
                setEbooks(response.latest_paper_books || []);
            }
        };
        fetchAllBook();
    }, []);

    const renderBooks = (books) =>
        books.slice(0, 10).map((book) => (
            <div key={book.id} className="product-card">
                {/* Header với menu icons */}
                <div className="card-header">
                    <div className="menu-icon">
                        <div className="menu-line"></div>
                        <div className="menu-line"></div>
                        <div className="menu-line"></div>
                    </div>
                    <div className="menu-icon" style={{ transform: 'rotate(90deg)' }}>
                        <div className="menu-line"></div>
                        <div className="menu-line"></div>
                        <div className="menu-line"></div>
                    </div>
                </div>

                {/* Book image với discount badge (nếu có) */}
                <div className="relative">
                    <div className="product-image" onClick={() => router.push(`/book/${book.id}`)}>
                        {book.cover_image ? (
                            <img src={book.cover_image} alt={book.title} className="book-cover-image" />
                        ) : (
                            <>
                                Ảnh sản phẩm
                                <br />
                                240 x 200px
                            </>
                        )}
                    </div>

                    {/* Hiển thị discount badge nếu sách có giảm giá */}
                    {book.discount_percentage && <div className="discount-badge">-{book.discount_percentage}%</div>}
                </div>

                {/* Stats - Số lượng và lượt xem */}
                <div className="stats">
                    <div className="stat-item">
                        <span className="stat-label">Số lượng:</span>
                        <span className="stat-value">{book.quantity || 0}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Lượt xem:</span>
                        <span className="stat-value">{book.views || 0}</span>
                    </div>
                </div>

                {/* Book title */}
                <h3 className="product-title">{book.title}</h3>

                {/* Price section - chỉ hiển thị cho sách vật lý */}
                {book?.is_physical === 1 && book?.price && (
                    <div className="price-section">
                        <span className="current-price">{book.price.toLocaleString('vi-VN')}đ</span>
                        {book.original_price && book.original_price > book.price && (
                            <span className="original-price">{book.original_price.toLocaleString('vi-VN')}đ</span>
                        )}
                    </div>
                )}

                {/* Footer với buttons */}
                <div className="card-footer">
                    <button className="btn btn-outline">
                        <span className="clock-icon">🕒</span>
                        {book.status || 'Vừa mở bán'}
                    </button>
                    <button className="btn btn-primary" onClick={() => router.push(`/book/${book.id}`)}>
                        <span className="cart-icon">{book?.is_physical === 1 ? '🛒' : '📖'}</span>
                        {book?.is_physical === 1 ? '' : ''}
                    </button>
                </div>
            </div>
        ));

    return <div className="container">{renderBooks(ebooks)}</div>;
};

export default ebooks;
