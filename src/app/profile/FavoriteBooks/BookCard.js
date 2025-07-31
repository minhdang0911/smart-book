'use client';
import { Button, Card, Rate, Tag, Typography } from 'antd';

const { Paragraph } = Typography;

import { Eye } from 'lucide-react';

const { Meta } = Card;
const { Text } = Typography;

const BookCard = ({ book, index, cardRefs }) => {
    return (
        <Card
            hoverable
            style={{
                borderRadius: 12,
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                transition: 'all 0.3s',
            }}
            cover={
                <div style={{ position: 'relative', overflow: 'hidden', height: 300 }}>
                    <img
                        ref={(el) => (cardRefs.current[index] = el)}
                        alt={book.title}
                        src={book.cover_image}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderTopLeftRadius: 12,
                            borderTopRightRadius: 12,
                        }}
                    />
                    <div style={{ position: 'absolute', top: 10, left: 10 }}>
                        <Tag color={book.is_physical ? 'blue' : 'green'}>
                            {book.is_physical ? 'Sách vật lý' : 'Sách điện tử'}
                        </Tag>
                    </div>
                </div>
            }
        >
            <Meta
                title={
                    <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, minHeight: 40 }}>{book.title}</div>
                }
                description={
                    <>
                        <Paragraph ellipsis={{ rows: 2 }} style={{ color: '#666', marginBottom: 12 }}>
                            {book.description}
                        </Paragraph>

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 12,
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Rate
                                    disabled
                                    defaultValue={parseFloat(book.rating_avg)}
                                    allowHalf
                                    style={{ fontSize: 14 }}
                                />
                                <Text style={{ marginLeft: 6, color: '#666' }}>{book.rating_avg}</Text>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Eye size={16} color="#666" />
                                <Text style={{ marginLeft: 6, color: '#666' }}>{book.views.toLocaleString()}</Text>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text strong style={{ color: book.price > 0 ? '#ff4d4f' : '#52c41a', fontSize: 18 }}>
                                {book.price > 0 ? `${parseFloat(book.price).toLocaleString('vi-VN')} VNĐ` : 'Miễn phí'}
                            </Text>
                            <Button type="primary" size="small">
                                Xem chi tiết
                            </Button>
                        </div>
                    </>
                }
            />
        </Card>
    );
};

export default BookCard;
