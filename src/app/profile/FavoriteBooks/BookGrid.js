'use client';
import { Col, Empty, Row } from 'antd';
import BookCard from './BookCard';

const BookGrid = ({ books, emptyMessage, cardRefs }) => {
    if (books.length === 0) {
        return (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <Empty description={emptyMessage} image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </div>
        );
    }

    return (
        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
            {books.map((book, index) => (
                <Col xs={24} sm={12} lg={8} key={book.id}>
                    <BookCard book={book} index={index} cardRefs={cardRefs} />
                </Col>
            ))}
        </Row>
    );
};

export default BookGrid;
