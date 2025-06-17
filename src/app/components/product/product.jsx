'use client'
import React, { useEffect, useState } from 'react'
import { apiGetAllBook } from '../../../../apis/allbook'
import { Card, Row, Col } from 'antd'
import './product.css'
import { useRouter } from 'next/navigation';

const Product = () => {
  const [ebooks, setEbooks] = useState([])
  const [paperBooks, setPaperBooks] = useState([])
  const [topLikedBook, setTopLikeBook] = useState([])
  const [topViewBook, setTopViewBook] = useState([])

  const [notify, setNotify] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchAllBook = async () => {
      const response = await apiGetAllBook()
      if (response?.status === 'success') {
        // Lấy đúng mảng từ object trả về
        setEbooks(response.latest_ebooks || [])
        setPaperBooks(response.latest_paper_books || [])
        setTopLikeBook(response.top_liked_books || [])
        setTopViewBook(response.top_viewed_books || [])
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
  <div>
    <h2 style={{ marginTop: '40px' }}>📚 Sách được xem nhiều nhất</h2>
    <Row gutter={[16, 16]}>
      {renderBooks(topViewBook)}
    </Row>
  </div>
  return (
    <div className="product-wrapper">
      <h2 style={{ marginTop: '40px' }}>Sách được yêu thích</h2>
      <Row gutter={[16, 16]}>
        {renderBooks(topLikedBook)}
      </Row>

      <h2 style={{ marginTop: '40px' }}>Sách được xem nhiều nhất</h2>
      <Row gutter={[16, 16]}>
        {renderBooks(topViewBook, true)} {/* Hiển thị views */}
      </Row>


      <h2>Ebooks</h2>
      <Row gutter={[16, 16]}>
        {renderBooks(ebooks)}
      </Row>

      <h2 style={{ marginTop: '40px' }}>Paper Books</h2>
      <Row gutter={[16, 16]}>
        {renderBooks(paperBooks)}
      </Row>
    </div>
  )
}

export default Product
