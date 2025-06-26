'use client'
import React, { useEffect, useState } from 'react'
import { apiGetAllBook } from '../../../apis/allbook'
import { Card, Row, Col } from 'antd'
import '../components/product/product.css'
import { useRouter } from 'next/navigation';

const ebooks = () => {
  const [ebooks, setEbooks] = useState([])


  const [notify, setNotify] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchAllBook = async () => {
      const response = await apiGetAllBook()
      if (response?.status === 'success') {
        // Lấy đúng mảng từ object trả về
        setEbooks(response.latest_paper_books || [])

      }
    }
    fetchAllBook()
  }, [])

  const renderBooks = (books, showViews = false) =>
    books.slice(0, 10).map((book) => (
      <Col key={book.id} span={4}>
        <Card
         onClick={() => router.push(`/book/${book.id}`)}
          hoverable
          className="book-card"
          cover={
            <img
              alt={book.title}
              src={book.cover_image || 'https://via.placeholder.com/150'}
              className="book-image"
            />
          }
        >
          <Card.Meta title={book.title} />
          {/* Hiển thị giá nếu là sách vật lý và có giá */}
          {book?.is_physical === 1 && book?.price && (
            <Card.Meta
              description={
                <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                  Giá: {book.price.toLocaleString('vi-VN')} VNĐ
                </span>
              }
            />
          )}
          {/* Hiển thị số lượt xem chỉ khi showViews = true */}
          {showViews && (
            <Card.Meta
              description={
                <span style={{ color: '#666', fontSize: '14px' }}>
                  👁️ Lượt xem: {book.views ? book.views.toLocaleString('vi-VN') : 0}
                </span>
              }
            />
          )}
        </Card>
      </Col>
    ));

  // Sử dụng trong component

  return (
    <div className="product-wrapper">


      <Row gutter={[16, 16]}>
        {renderBooks(ebooks)}
      </Row>


    </div>
  )
}

export default ebooks
