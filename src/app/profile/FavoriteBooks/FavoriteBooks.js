'use client';
import { HeartFilled } from '@ant-design/icons';
import { Card, Col, Empty, Row, Spin, Tabs, Typography } from 'antd';
import gsap from 'gsap';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useFavoriteBooks } from '../../hooks/useFavoriteBooks';

const { Title, Text } = Typography;
const { Meta } = Card;

const BookGrid = ({ books, emptyMessage, cardRefs, router }) => {
    if (books.length === 0) {
        return (
            <div
                style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    backgroundColor: '#fafafa',
                    borderRadius: '8px',
                    border: '1px dashed #d9d9d9',
                }}
            >
                <Empty description={emptyMessage} image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </div>
        );
    }

    return (
        <Row gutter={[16, 24]} style={{ marginTop: '16px' }}>
            {books.map((book, index) => (
                <Col key={book.id} xs={24} sm={12} md={8} lg={6} xl={4} xxl={4} style={{ minHeight: '320px' }}>
                    <Card
                        ref={(el) => (cardRefs.current[index] = el)}
                        hoverable
                        onClick={() => {
                            console.log(`Navigating to /book/${book.id}`); // Debug
                            router.push(`/book/${book.id}`);
                        }}
                        style={{
                            height: '100%',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            cursor: 'pointer',
                        }}
                        bodyStyle={{
                            padding: '12px',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                        cover={
                            <div
                                style={{
                                    height: '200px',
                                    padding: '8px',
                                    backgroundColor: '#fafafa',
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <div
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: '6px',
                                        overflow: 'hidden',
                                        backgroundColor: '#ffffff',
                                        position: 'relative',
                                    }}
                                >
                                    <img
                                        alt={book.title || book.name}
                                        src={book.image_url || book.cover_image || '/placeholder-book.jpg'}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'contain',
                                            transition: 'transform 0.3s ease',
                                            padding: '2px',
                                            pointerEvents: 'none', // Ngăn sự kiện trên hình ảnh
                                        }}
                                        onError={(e) => {
                                            e.target.src = '/placeholder-book.jpg';
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'scale(1.02)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'scale(1)';
                                        }}
                                    />
                                </div>
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '8px',
                                        right: '8px',
                                        backgroundColor: 'rgba(255, 82, 82, 0.9)',
                                        borderRadius: '50%',
                                        padding: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        zIndex: 10,
                                        pointerEvents: 'none', // Ngăn sự kiện trên HeartFilled
                                    }}
                                >
                                    <HeartFilled style={{ color: 'white', fontSize: '12px' }} />
                                </div>
                            </div>
                        }
                    >
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <Title
                                level={5}
                                style={{
                                    margin: '0 0 8px 0',
                                    fontSize: '14px',
                                    lineHeight: '1.4',
                                    height: '40px',
                                    overflow: 'hidden',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    fontWeight: 600,
                                }}
                                title={book.title || book.name}
                            >
                                {book.title || book.name}
                            </Title>

                            <Text
                                type="secondary"
                                style={{
                                    fontSize: '12px',
                                    marginBottom: '8px',
                                    height: '16px',
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                {book.author || book.publisher || 'Đang cập nhật'}
                            </Text>

                            <div style={{ marginTop: 'auto' }}>
                                <Text
                                    strong
                                    style={{
                                        color: '#ff4d4f',
                                        fontSize: '16px',
                                        fontWeight: 700,
                                    }}
                                >
                                    {book.price ? `${Number(book.price).toLocaleString('vi-VN')} đ` : 'Miễn phí'}
                                </Text>

                                {book.original_price && book.original_price > book.price && (
                                    <Text
                                        delete
                                        type="secondary"
                                        style={{
                                            marginLeft: '8px',
                                            fontSize: '12px',
                                        }}
                                    >
                                        {Number(book.original_price).toLocaleString('vi-VN')} đ
                                    </Text>
                                )}
                            </div>

                            {book.is_physical !== undefined && (
                                <div
                                    style={{
                                        marginTop: '8px',
                                        padding: '2px 6px',
                                        backgroundColor: book.is_physical ? '#e6f7ff' : '#f6ffed',
                                        color: book.is_physical ? '#1890ff' : '#52c41a',
                                        borderRadius: '4px',
                                        fontSize: '10px',
                                        fontWeight: 500,
                                        textAlign: 'center',
                                        border: `1px solid ${book.is_physical ? '#91d5ff' : '#b7eb8f'}`,
                                    }}
                                >
                                    {book.is_physical ? 'Sách bán' : 'Sách đọc'}
                                </div>
                            )}
                        </div>
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

const FavoriteBooks = ({ token, enabled }) => {
    const router = useRouter(); // Khởi tạo router
    const { favoriteBooks, loading } = useFavoriteBooks(token, enabled);
    const cardRefs = useRef([]);

    useEffect(() => {
        if (favoriteBooks.length > 0 && cardRefs.current.length > 0) {
            gsap.fromTo(
                cardRefs.current.filter(Boolean),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    stagger: 0.1,
                    duration: 0.6,
                    ease: 'power3.out',
                },
            );
        }
    }, [favoriteBooks]);

    const physicalBooks = favoriteBooks.filter((book) => book.is_physical === 1);
    const digitalBooks = favoriteBooks.filter((book) => book.is_physical === 0);

    const tabItems = [
        {
            key: 'all',
            label: <span style={{ fontSize: '14px', fontWeight: 500 }}>💝 Tất cả ({favoriteBooks.length})</span>,
            children: (
                <BookGrid
                    books={favoriteBooks}
                    emptyMessage="Chưa có sách yêu thích nào"
                    cardRefs={cardRefs}
                    router={router}
                />
            ),
        },
        {
            key: 'physical',
            label: <span style={{ fontSize: '14px', fontWeight: 500 }}>📚 Sách bán ({physicalBooks.length})</span>,
            children: (
                <BookGrid
                    books={physicalBooks}
                    emptyMessage="Chưa có sách bán yêu thích nào"
                    cardRefs={cardRefs}
                    router={router}
                />
            ),
        },
        {
            key: 'digital',
            label: <span style={{ fontSize: '14px', fontWeight: 500 }}>📖 Sách đọc ({digitalBooks.length})</span>,
            children: (
                <BookGrid
                    books={digitalBooks}
                    emptyMessage="Chưa có sách đọc yêu thích nào"
                    cardRefs={cardRefs}
                    router={router}
                />
            ),
        },
    ];

    return (
        <div
            style={{
                padding: '20px',
                backgroundColor: '#ffffff',
                minHeight: '100vh',
                maxWidth: '80%',
                margin: '0 auto',
            }}
        >
            <div
                style={{
                    marginBottom: '20px',
                    padding: '16px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '12px',
                    color: 'white',
                }}
            >
                <Title
                    level={2}
                    style={{
                        margin: 0,
                        color: 'white',
                        fontSize: '20px',
                        fontWeight: 700,
                    }}
                >
                    ❤️ Danh sách yêu thích
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>
                    {favoriteBooks.length} cuốn sách được yêu thích
                </Text>
            </div>

            {loading ? (
                <div
                    style={{
                        textAlign: 'center',
                        padding: '80px 0',
                        backgroundColor: '#fafafa',
                        borderRadius: '12px',
                    }}
                >
                    <Spin size="large" />
                    <div
                        style={{
                            marginTop: 16,
                            color: '#666',
                            fontSize: '16px',
                        }}
                    >
                        Đang tải danh sách yêu thích...
                    </div>
                </div>
            ) : (
                <Tabs
                    defaultActiveKey="all"
                    items={tabItems}
                    size="large"
                    style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '16px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }}
                    tabBarStyle={{
                        marginBottom: '16px',
                        borderBottom: '2px solid #f0f0f0',
                    }}
                />
            )}
        </div>
    );
};

export default FavoriteBooks;
