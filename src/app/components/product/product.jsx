'use client'
import React, { useEffect, useState } from 'react'
import { apiGetAllBook } from '../../../../apis/allbook'
import { Card, Row, Col } from 'antd'
import './product.css'
import { useRouter } from 'next/navigation';

const Product = () => {
  const [ebooks, setEbooks] = useState([])
  const [paperBooks, setPaperBooks] = useState([])
    const [notify, setNotify] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchAllBook = async () => {
      const response = await apiGetAllBook()
      if (response?.status === 'success') {
        // Lấy đúng mảng từ object trả về
        setEbooks(response.latest_ebooks || [])
        setPaperBooks(response.latest_paper_books || [])
      }
    }
    fetchAllBook()
  }, [])

  const renderBooks = (books) =>
    books.slice(0, 10).map((book) => (
      <Col key={book.id} span={4}>
        <Card
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
        </Card>
      </Col>
    ))

  return (
    <div className="product-wrapper">
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
