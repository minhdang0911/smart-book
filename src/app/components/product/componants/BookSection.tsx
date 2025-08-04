// app/bookstore/components/BookSection.tsx
'use client';
import { Typography } from 'antd';
import { BookCard } from './BookCard';

const { Title } = Typography;

interface BookSectionProps {
    title: string;
    books: any[];
    user: any;
    wishlist: number[];
    setWishlist: (wishlist: number[]) => void;
    onQuickView: (book: any) => void;
    isAddingToCart: boolean;
    setIsAddingToCart: (loading: boolean) => void;
}

export function BookSection({
    title,
    books,
    user,
    wishlist,
    setWishlist,
    onQuickView,
    isAddingToCart,
    setIsAddingToCart,
}: BookSectionProps) {
    return (
        <div className="section">
            <Title level={2} className="section-title">
                {title}
            </Title>
            <div className="books-grid">
                {books.map((book) => (
                    <div key={book.id} className="book-grid-item">
                        <BookCard
                            book={book}
                            user={user}
                            wishlist={wishlist}
                            setWishlist={setWishlist}
                            onQuickView={onQuickView}
                            isAddingToCart={isAddingToCart}
                            setIsAddingToCart={setIsAddingToCart}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}