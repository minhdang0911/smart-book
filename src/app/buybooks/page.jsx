'use client'
import React, { useEffect, useState } from 'react'
import { apiGetAllBook } from '../../../apis/allbook'
import { Card, Row, Col, Spin } from 'antd'
import LazyLoad from 'react-lazyload'
import { useRouter } from 'next/navigation'
import './buybook.css'

const BuyBooks = () => {
  const [ebooks, setEbooks] = useState([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchAllBook = async () => {
      setLoading(true)
      const response = await apiGetAllBook()
      if (response?.status === 'success') {
        setEbooks(response.latest_ebooks || [])
      }
      setLoading(false)
    }
    fetchAllBook()
  }, [])

  const renderBooks = () =>
    ebooks?.map((book) => (
      <Col key={book.id} span={4}>
        <LazyLoad 
          height={300} 
          offset={100} 
          once 
          placeholder={<div style={{ height: 300, background: '#f0f0f0' }} />}
        >
          <Card
            onClick={() => router.push(`/book/${book.id}`)}
            hoverable
            className="book-card"
            cover={
              <img
                alt={book.title}
                src={book.cover_image || 'https://via.placeholder.com/150'}
                className="book-image"
                loading="lazy"
              />
            }
          >
            <Card.Meta title={book.title} />
            {book?.is_physical === 1 && book?.price && (
              <Card.Meta
                description={
                  <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                    Giá: {book.price.toLocaleString('vi-VN')} VNĐ
                  </span>
                }
              />
            )}
          </Card>
        </LazyLoad>
      </Col>
    ))

  return (
    <div className="product-wrapper">
      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Spin size="large" />
          <p>Đang tải sách...</p>
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {renderBooks()}
        </Row>
      )}
    </div>
  )
}

export default BuyBooks
