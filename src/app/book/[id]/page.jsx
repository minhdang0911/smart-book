'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { 
  Row, 
  Col, 
  Card, 
  Spin, 
  Typography, 
  Divider, 
  Tag, 
  Button, 
  Space,
  Statistic,
  Avatar,
  Badge,
  Tooltip
} from 'antd'
import { 
  EyeOutlined, 
  HeartOutlined, 
  UserOutlined, 
  BookOutlined,
  HomeOutlined,
  TagOutlined,
  FileTextOutlined,
  ShareAltOutlined,
  DownloadOutlined
} from '@ant-design/icons'
import BookList from './BookList'
import './BookDetail.css'

const { Title, Paragraph, Text } = Typography

const BookDetailPage = () => {
  const params = useParams()
  const { id } = params
  const [book, setBook] = useState(null)
  const [sameAuthorBooks, setSameAuthorBooks] = useState([])
  const [sameCategoryBooks, setSameCategoryBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookDetail = async () => {
      try {
        setLoading(true)
        const res = await fetch(`http://localhost:8000/api/books/${id}`)
        const data = await res.json()
        setBook(data)

        // Fetch sách cùng tác giả
        const authorRes = await fetch(
          `http://127.0.0.1:8000/api/books/search?author=${encodeURIComponent(
            data.author.name
          )}`
        )
        const authorBooks = await authorRes.json()
        setSameAuthorBooks(authorBooks.data.filter(b => b.id !== data.id))

        // Fetch sách cùng thể loại
        const categoryRes = await fetch(
          `http://127.0.0.1:8000/api/books/search?category=${encodeURIComponent(
            data.category.name
          )}`
        )
        const categoryBooks = await categoryRes.json()
        setSameCategoryBooks(categoryBooks.data.filter(b => b.id !== data.id))
      } catch (err) {
        console.error('Lỗi khi tải chi tiết sách:', err)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchBookDetail()
  }, [id])

  if (loading) return <Spin size="large" className="loading-spinner" />

  if (!book) return <div className="error-message">Không tìm thấy thông tin sách</div>

  return (
    <div className="book-detail-container">
      {/* Hero Section */}
      <Card className="book-hero-card" bordered={false}>
        <Row gutter={[32, 32]} align="middle">
          <Col xs={24} md={8} lg={6}>
            <div className="book-cover-wrapper">
              <Badge.Ribbon text={book.format} color="blue">
                <div className="book-cover-container">
                  <img 
                    src={book.cover_image} 
                    alt={book.title} 
                    className="book-cover-image" 
                  />
                </div>
              </Badge.Ribbon>
            </div>
          </Col>
          
          <Col xs={24} md={16} lg={18}>
            <div className="book-info-section">
              <Title level={1} className="book-title">
                {book.title}
              </Title>
              
              <Space size="large" wrap className="book-meta">
                <Space align="center">
                  <Avatar size="small" icon={<UserOutlined />} />
                  <Text className="meta-text">
                    <Text strong>Tác giả:</Text> {book.author.name}
                  </Text>
                </Space>
                
                <Space align="center">
                  <Avatar size="small" icon={<HomeOutlined />} />
                  <Text className="meta-text">
                    <Text strong>NXB:</Text> {book.publisher.name}
                  </Text>
                </Space>
              </Space>

              <div className="book-category-section">
                <Tag 
                  icon={<TagOutlined />} 
                  color="geekblue" 
                  className="category-tag"
                >
                  {book.category.name}
                </Tag>
              </div>

              <Row gutter={16} className="book-stats">
                <Col>
                  <Statistic
                    title="Lượt xem"
                    value={book.views}
                    prefix={<EyeOutlined />}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Col>
                <Col>
                  <Statistic
                    title="Lượt thích"
                    value={book.likes}
                    prefix={<HeartOutlined />}
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Col>
              </Row>

              <Space className="action-buttons">
                <Button type="primary" size="large" icon={<BookOutlined />}>
                  Đọc ngay
                </Button>
                <Button size="large" icon={<DownloadOutlined />}>
                  Tải xuống
                </Button>
                <Tooltip title="Chia sẻ">
                  <Button size="large" icon={<ShareAltOutlined />} />
                </Tooltip>
              </Space>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Description Section */}
      <Card 
        title={
          <Space>
            <FileTextOutlined />
            <span>Mô tả sách</span>
          </Space>
        }
        className="description-card"
        bordered={false}
      >
        <Paragraph className="book-description">
          {book.description}
        </Paragraph>
      </Card>

      {/* Related Books Section */}
      <div className="related-books-section">
        <Card 
          title={
            <Space>
              <UserOutlined />
              <span>Sách cùng tác giả</span>
            </Space>
          }
          className="related-card"
          bordered={false}
        >
          <BookList books={sameAuthorBooks} />
        </Card>

        <Card 
          title={
            <Space>
              <TagOutlined />
              <span>Sách cùng thể loại</span>
            </Space>
          }
          className="related-card"
          bordered={false}
        >
          <BookList books={sameCategoryBooks} />
        </Card>
      </div>
    </div>
  )
}

export default BookDetailPage