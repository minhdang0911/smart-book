'use client';
import { Spin, Tabs, Typography } from 'antd';
import gsap from 'gsap';
import { useEffect, useRef } from 'react';
import { useFavoriteBooks } from '../../hooks/useFavoriteBooks';
import BookGrid from './BookGrid';

const { Title } = Typography;

const FavoriteBooks = ({ token, enabled }) => {
    const { favoriteBooks, loading } = useFavoriteBooks(token, enabled);
    const cardRefs = useRef([]);

    useEffect(() => {
        if (favoriteBooks.length > 0) {
            gsap.fromTo(
                cardRefs.current,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: 'power3.out' },
            );
        }
    }, [favoriteBooks]);

    const physicalBooks = favoriteBooks.filter((book) => book.is_physical === 1);
    const digitalBooks = favoriteBooks.filter((book) => book.is_physical === 0);

    const tabItems = [
        {
            key: 'physical',
            label: `Sách bán (${physicalBooks.length})`,
            children: (
                <BookGrid books={physicalBooks} emptyMessage="Chưa có sách mua yêu thích nào" cardRefs={cardRefs} />
            ),
        },
        {
            key: 'digital',
            label: `Sách đọc (${digitalBooks.length})`,
            children: (
                <BookGrid books={digitalBooks} emptyMessage="Chưa có sách bán yêu thích nào" cardRefs={cardRefs} />
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Title level={3} style={{ marginBottom: 0 }}>
                Danh sách yêu thích ({favoriteBooks.length})
            </Title>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: 16, color: '#666' }}>Đang tải...</div>
                </div>
            ) : (
                <Tabs defaultActiveKey="physical" items={tabItems} style={{ marginTop: 24 }} />
            )}
        </div>
    );
};

export default FavoriteBooks;
