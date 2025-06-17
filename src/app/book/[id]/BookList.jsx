'use client'
import React from 'react'
import Link from 'next/link'
import { Card, Row, Col } from 'antd'

const { Meta } = Card

const BookList = ({ books }) => {
  return (
    <Row gutter={[16, 16]}>
      {books.map(book => (
        <Col xs={12} sm={8} md={6} lg={4} key={book.id}>
          <Link href={`/book/${book.id}`} passHref>
            <Card
              hoverable
              cover={
                <img
                  alt={book.title}
                  src={
                    book.cover_image ||
                    'https://via.placeholder.com/200x300?text=No+Image'
                  }
                  style={{ height: 200, objectFit: 'cover' }}
                />
              }
            >
              <Meta title={book.title} description={book.author.name} />
            </Card>
          </Link>
        </Col>
      ))}
    </Row>
  )
}

export default BookList
