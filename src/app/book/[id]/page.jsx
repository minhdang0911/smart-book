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
  Tooltip,
  Collapse,
  Rate,
  Progress,
  Input,
  Form,
  message,
  List,
  Modal,
  Empty
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
  DownloadOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  ReadOutlined,
  NumberOutlined,
  CaretRightOutlined,
  StarOutlined,
  StarFilled,
  EditOutlined,
  MessageOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  HeartFilled,
  MinusOutlined
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { marked } from 'marked';
import ReactImageMagnify from 'react-image-magnify'



import BookList from './BookList'
import './BookDetail.css'
import { apiGetMe } from '../../../../apis/user'
import { toast } from 'react-toastify';
import axios from 'axios'

const { Title, Paragraph, Text } = Typography
const { TextArea } = Input

const BookDetailPage = () => {
  const router = useRouter()
  const params = useParams()
  const { id } = params
  const [book, setBook] = useState(null)
  const [sameAuthorBooks, setSameAuthorBooks] = useState([])
  const [sameCategoryBooks, setSameCategoryBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState([])
  const [reviewStats, setReviewStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    starPercentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  })
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [userReview, setUserReview] = useState({ rating: 0, comment: '' })
  const [user, setUser] = useState({})
  const [form] = Form.useForm()
  const [selectedStarFilter, setSelectedStarFilter] = useState('all')
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [wishlist, setWishlist] = useState([]);
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [images, setImages] = useState([])
  const [mainImage, setMainImage] = useState(null)
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/books/${book?.id}/images`)
        const data = res.data.data
        setImages(data)
        const main = data.find((img) => img.is_main === 1)
        setMainImage(main?.image_url || data[0]?.image_url)
      } catch (err) {
        console.error('Lỗi khi lấy ảnh:', err)
      }
    }

    fetchImages()
  }, [book?.id])

  useEffect(() => {
    const fetchBookDetail = async () => {
      try {
        setLoading(true)
        const res = await fetch(`http://localhost:8000/api/books/${id}`)
        const data = await res.json()

        // Fake data cho số chương nếu là ebook
        if (data.format === 'ebook') {
          const getRandomChapterTitle = () => {
            const titles = [
              'Khởi đầu cuộc hành trình',
              'Bí ẩn được hé lộ',
              'Cuộc gặp gỡ định mệnh',
              'Thử thách đầu tiên',
              'Sự thật bị che giấu',
              'Chuyển biến bất ngờ',
              'Cuộc chiến quyết định',
              'Khoảnh khắc quan trọng',
              'Hồi kết đầy cảm xúc',
              'Tương lai tươi sáng'
            ]
            return titles[Math.floor(Math.random() * titles.length)]
          }

          const chaptersData = []
          const totalChapters = 10

          for (let i = 1; i <= totalChapters; i++) {
            const pagesCount = Math.floor(Math.random() * 6) + 3
            const pages = []

            for (let j = 1; j <= pagesCount; j++) {
              pages.push({
                pageNumber: j,
                content: `Nội dung trang ${j} của chương ${i}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.`
              })
            }

            chaptersData.push({
              chapterNumber: i,
              title: `Chương ${i}: ${getRandomChapterTitle()}`,
              pages: pages,
              totalPages: pagesCount
            })
          }

          data.chapters = totalChapters
          data.chaptersData = chaptersData
        }

        setBook(data)

        // Fetch review stats và reviews
        await fetchReviewStats()
        await fetchReviews()

        // Check login status
        checkLoginStatus()

        // Fetch sách cùng tác giả
        const authorRes = await fetch(
          `http://localhost:8000/api/books/search?author=${encodeURIComponent(
            data.author.name
          )}`
        )
        const authorBooks = await authorRes.json()
        setSameAuthorBooks(authorBooks.data.filter(b => b.id !== data.id))

        // Fetch sách cùng thể loại
        const categoryRes = await fetch(
          `http://localhost:8000/api/books/search?category=${encodeURIComponent(
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const getUserInfo = async () => {
        try {
          const response = await apiGetMe(token);
          if (response?.status === true) {
            setUser(response?.user);
            setIsLoggedIn(true);
          }
        } catch (error) {
          console.error('Error getting user info:', error);
          localStorage.removeItem('token');
        }
      };
      getUserInfo();
    }
  }, []);


  const token = localStorage.getItem('token')

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/books/followed', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await res.json();
        if (data.status && data.followed_books) {
          setWishlist(data.followed_books.map(book => book.id));
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách yêu thích:', error);
      }
    };

    fetchWishlist();
  }, []);



  const toggleWishlist = async () => {
    try {
      const isFollowed = wishlist.includes(book.id);
      const url = isFollowed
        ? 'http://localhost:8000/api/books/unfollow'
        : 'http://localhost:8000/api/books/follow';

      const response = await fetch(url, {
        method: isFollowed ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ book_id: book.id })
      });

      const result = await response.json();
      if (result.status) {
        setWishlist(prev =>
          isFollowed ? prev.filter(id => id !== book.id) : [...prev, book.id]
        );
      }
    } catch (error) {
      console.error('Lỗi khi toggle wishlist:', error);
    }
  };



  const checkLoginStatus = () => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  };

  const fetchReviewStats = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/ratings/book/${id}/stats`)
      const data = await response.json()

      if (data.status) {
        const stats = {
          totalReviews: data.data.total_ratings || 0,
          averageRating: data.data.total_ratings > 0 ? parseFloat(data.data.average_display) : 0,
          ratingDistribution: {
            5: data.data.star_distribution?.[5]?.count || 0,
            4: data.data.star_distribution?.[4]?.count || 0,
            3: data.data.star_distribution?.[3]?.count || 0,
            2: data.data.star_distribution?.[2]?.count || 0,
            1: data.data.star_distribution?.[1]?.count || 0,
          },
          starPercentages: {
            5: data.data.star_distribution?.[5]?.percentage || 0,
            4: data.data.star_distribution?.[4]?.percentage || 0,
            3: data.data.star_distribution?.[3]?.percentage || 0,
            2: data.data.star_distribution?.[2]?.percentage || 0,
            1: data.data.star_distribution?.[1]?.percentage || 0,
          }
        }
        setReviewStats(stats)
      } else {
        // Nếu API trả về lỗi hoặc không có data, set default values
        setReviewStats({
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          starPercentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        })
      }
    } catch (error) {
      console.error('Lỗi khi tải thống kê đánh giá:', error)
      // Set default values on error
      setReviewStats({
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        starPercentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      })
    }
  }

  const fetchReviews = async (starLevel = 'all') => {
    try {
      setReviewsLoading(true)
      let url = `http://localhost:8000/api/ratings/book/${id}/filter`

      if (starLevel !== 'all') {
        url += `?star_level=${starLevel}`
      }

      const response = await fetch(url)
      const data = await response.json()

      if (data.status && data.data.ratings) {
        const formattedReviews = data.data.ratings.map(rating => ({
          id: rating.rating_id,
          user: {
            name: rating.user_name,
            avatar: rating.user_avatar
          },
          rating: rating.rating_star,
          comment: rating.comment,
          date: rating.created_at,
          timeAgo: rating.time_ago,
          likes: Math.floor(Math.random() * 20)
        }))

        setReviews(formattedReviews)
      } else {
        setReviews([])
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách đánh giá:', error)
      setReviews([])
    } finally {
      setReviewsLoading(false)
    }
  }

  // Hàm kiểm tra xem user có thể đánh giá sách này không
  const checkCanReview = async (bookId) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        return { canReview: false, message: 'Vui lòng đăng nhập để đánh giá!' }
      }

      // Gọi API lấy danh sách đơn hàng
      const response = await fetch('http://localhost:8000/api/orders', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!data.success) {
        return { canReview: false, message: 'Không thể lấy thông tin đơn hàng!' }
      }

      // Kiểm tra xem có đơn hàng nào chứa sách này và có shipping code không
      const canReview = data.data.orders.some(order => {
        // Chỉ kiểm tra các đơn hàng có shipping code (đã được giao)
        if (!order.shipping_code) return false

        // Kiểm tra xem trong đơn hàng có chứa sách với bookId không
        return order.items.some(item => item.book.id === parseInt(bookId))
      })

      if (!canReview) {
        return {
          canReview: false,
          message: 'Bạn cần mua và nhận được sản phẩm này để có thể đánh giá!'
        }
      }

      return { canReview: true, message: 'Có thể đánh giá sản phẩm' }

    } catch (error) {
      console.error('Error checking review permission:', error)
      return { canReview: false, message: 'Có lỗi xảy ra khi kiểm tra quyền đánh giá!' }
    }
  }

  const handleSubmitReview = async (values) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        message.error('Vui lòng đăng nhập để đánh giá!')
        return
      }

      const response = await fetch('http://localhost:8000/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          book_id: parseInt(id),
          rating_star: values.rating,
          comment: values.comment
        })
      })

      const data = await response.json()

      if (data.status) {
        message.success('Đánh giá của bạn đã được gửi thành công!')
        setShowReviewModal(false)
        form.resetFields()

        // Refresh reviews and stats
        await fetchReviewStats()
        await fetchReviews(selectedStarFilter)
      } else {
        message.error(data.message || 'Có lỗi xảy ra khi gửi đánh giá!')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      message.error('Có lỗi xảy ra khi gửi đánh giá!')
    }
  }

  const handleStarFilterChange = (starLevel) => {
    setSelectedStarFilter(starLevel)
    fetchReviews(starLevel)
  }

  const renderReviewStats = () => {
    return (
      <Card
        title={
          <Space>
            <Text strong style={{ fontSize: '16px' }}>Tóm tắt đánh giá</Text>
            <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
          </Space>
        }
        className="review-stats-card"
        bordered={false}
      >
        <Row gutter={[32, 24]} align="middle">
          <Col xs={24} md={12} lg={8}>
            <div className="overall-rating" style={{ textAlign: 'center' }}>
              <div
                className="rating-number"
                style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: '#262626',
                  lineHeight: 1
                }}
              >
                {reviewStats.totalReviews > 0 ? reviewStats.averageRating : '0'}
              </div>
              <div className="rating-stars" style={{ margin: '8px 0' }}>
                <Rate
                  disabled
                  value={reviewStats.totalReviews > 0 ? reviewStats.averageRating : 0}
                  allowHalf
                  style={{ fontSize: '20px' }}
                />
              </div>
              <div
                className="rating-count"
                style={{
                  color: '#8c8c8c',
                  fontSize: '14px'
                }}
              >
                {reviewStats.totalReviews} đánh giá
              </div>
            </div>
          </Col>

          <Col xs={24} md={12} lg={16}>
            {reviewStats.totalReviews > 0 ? (
              <div className="rating-breakdown">
                {[5, 4, 3, 2, 1].map(rating => (
                  <div
                    key={rating}
                    className="rating-row"
                    onClick={() => handleStarFilterChange(rating.toString())}
                    style={{
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '8px',
                      padding: '4px 0'
                    }}
                  >
                    <span
                      className="rating-label"
                      style={{
                        minWidth: '12px',
                        textAlign: 'center',
                        marginRight: '8px',
                        fontSize: '14px'
                      }}
                    >
                      {rating}
                    </span>
                    <Progress
                      percent={reviewStats.starPercentages[rating] || 0}
                      showInfo={false}
                      strokeColor="#faad14"
                      size="small"
                      style={{
                        flex: 1,
                        margin: '0 12px',
                        height: '8px'
                      }}
                    />
                    <span
                      className="rating-count-small"
                      style={{
                        minWidth: '30px',
                        textAlign: 'right',
                        fontSize: '14px',
                        color: '#595959'
                      }}
                    >
                      {reviewStats.ratingDistribution[rating]}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '120px',
                color: '#8c8c8c',
                fontSize: '14px'
              }}>
                Chưa có đánh giá nào
              </div>
            )}

            <Divider style={{ margin: '16px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                type="link"
                onClick={() => handleStarFilterChange('all')}
                style={{
                  padding: 0,
                  fontSize: '14px',
                  color: '#1890ff'
                }}
              >
                → Xem tất cả đánh giá
              </Button>


              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={async () => {
                  if (!isLoggedIn) {
                    toast.warning('Vui lòng đăng nhập để viết đánh giá!')
                    return
                  }

                  // Kiểm tra điều kiện đánh giá
                  const checkResult = await checkCanReview(id) // id là bookId từ trang detail

                  if (!checkResult.canReview) {
                    toast.warning(checkResult.message)
                    return
                  }

                  // Nếu pass tất cả điều kiện thì mở modal đánh giá
                  setShowReviewModal(true)
                }}
                style={{
                  borderRadius: '20px',
                  height: '36px',
                  paddingLeft: '16px',
                  paddingRight: '16px'
                }}
              >
                Viết bài đánh giá
              </Button>
            </div>
          </Col>
        </Row>
      </Card>
    )
  }

  const renderReviewsList = () => {
    return (
      <Card
        title={
          <Space>
            <MessageOutlined />
            <span>
              Đánh giá từ độc giả ({reviewStats.totalReviews})
              {selectedStarFilter !== 'all' && (
                <Tag color="blue" style={{ marginLeft: 8 }}>
                  {selectedStarFilter} sao
                </Tag>
              )}
            </span>
          </Space>
        }

        className="reviews-list-card"
        bordered={false}
        loading={reviewsLoading}
      >
        {reviews.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              selectedStarFilter !== 'all'
                ? `Chưa có đánh giá ${selectedStarFilter} sao nào.`
                : 'Chưa có đánh giá nào. Hãy là người đầu tiên để lại đánh giá!'
            }
          />
        ) : (
          <List
            dataSource={reviews}
            renderItem={(review) => (
              <List.Item className="review-item">
                <List.Item.Meta
                  avatar={
                    <Avatar
                      src={review.user.avatar}
                      icon={!review.user.avatar && <UserOutlined />}
                      size={40}
                    />
                  }
                  title={
                    <div className="review-header">
                      <span className="reviewer-name" style={{ fontWeight: 500 }}>
                        {review.user.name}
                      </span>
                      <span className="review-date" style={{ color: '#8c8c8c', fontSize: '12px' }}>
                        {review.timeAgo}
                      </span>
                    </div>
                  }
                  description={
                    <div className="review-content">
                      <Rate
                        disabled
                        defaultValue={review.rating}
                        size="small"
                        style={{ marginBottom: '8px' }}
                      />
                      <Paragraph
                        className="review-comment"
                        style={{
                          marginBottom: '8px',
                          color: '#262626'
                        }}
                      >
                        {review.comment}
                      </Paragraph>
                      <div className="review-actions">
                        <Button
                          type="text"
                          size="small"
                          icon={<HeartOutlined />}
                          style={{ color: '#8c8c8c' }}
                        >
                          Hữu ích ({review.likes})
                        </Button>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    );
  };

  const renderLoginPrompt = () => {
    if (isLoggedIn) return null

    return (
      <Card className="login-prompt-card" bordered={false}>
        <div
          className="login-prompt"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            backgroundColor: '#f6f6f6',
            borderRadius: '8px'
          }}
        >

        </div>
      </Card>
    )
  }



  const renderChaptersAccordion = () => {
    if (book.format !== 'ebook' || !book.chaptersData) return null

    const items = book.chaptersData.map(chapter => ({
      key: chapter.chapterNumber.toString(),
      label: (
        <Space>
          <Text strong>{chapter.title}</Text>
          <Tag color="blue">{chapter.totalPages} trang</Tag>
        </Space>
      ),
      children: (
        <div className="chapter-pages">
          {chapter.pages.map(page => (
            <Card
              key={page.pageNumber}
              size="small"
              title={`Trang ${page.pageNumber}`}
              className="page-card"
              style={{ marginBottom: 8 }}
            >
              <Paragraph ellipsis={{ rows: 2, expandable: true }}>
                {page.content}
              </Paragraph>
            </Card>
          ))}
        </div>
      )
    }))

    return (
      <Card
        title={
          <Space>
            <BookOutlined />
            <span>Danh sách chương</span>
          </Space>
        }
        className="chapters-card"
        bordered={false}
      >
        <Collapse
          items={items}
          expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
          ghost
        />
      </Card>
    )
  }

  const renderActionButtons = () => {
    if (book.format === 'paper') {
      return (

        <Space className="action-buttons">
          <Button
            type="primary"
            size="large"
            icon={<ShoppingCartOutlined />}
            onClick={handleAddToCart}
            loading={isAddingToCart}
            style={{
              height: '48px',
              padding: '0 32px',
              fontSize: '16px'
            }}
          >
            Thêm vào giỏ hàng
          </Button>
          <Button
            size="large"
            icon={<DollarOutlined />}
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', color: 'white' }}
            onClick={async () => {
              if (!token) {
                toast.error('🔒 Vui lòng đăng nhập để mua sách!');
                router.push('/login');
                return;
              }

              try {
                const checkoutData = {
                  items: [{
                    id: book.id,
                    name: book.title || book.name,
                    price: book.price,
                    quantity: 1,
                    image: book.cover_image,
                    author: typeof book.author === 'string' ? book.author : book.author?.name || 'Unknown Author'
                  }],
                  totalAmount: book.price,
                  totalDiscount: 0,
                };

                setIsAddingToCart(true);
                toast.info('🔄 Đang thêm vào giỏ hàng...');

                const item = checkoutData.items[0];

                const response = await fetch('http://localhost:8000/api/cart/add', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    book_id: item.id,
                    quantity: item.quantity
                  })
                });

                if (!response.ok) {
                  if (response.status === 401) {
                    toast.error('🔒 Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('token');
                    localStorage.removeItem('access_token');
                    setToken(null);
                    router.push('/login');
                    return;
                  }
                  throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();

                if (result.success || response.ok) {
                  toast.success(`✅ Đã thêm "${item.name}" vào giỏ hàng!`);

                  window.updateCartCount?.();
                  window.dispatchEvent(new CustomEvent('cartUpdated'));

                  localStorage.setItem('buyNowData', JSON.stringify({
                    isBuyNow: true,
                    bookId: book.id,
                    checkoutData,
                    processed: false,
                    timestamp: Date.now()
                  }));

                  console.log('Saved buyNowData:', {
                    isBuyNow: true,
                    bookId: book.id,
                    checkoutData,
                    processed: false,
                    timestamp: Date.now()
                  });

                  setTimeout(() => {
                    toast.info('🛒 Chuyển đến trang đặt đơn...');
                    router.push('/cart');
                  }, 800);
                } else {
                  toast.error(`🚫 ${result.message || 'Không thể thêm vào giỏ hàng'}`);
                }
              } catch (error) {
                console.error('Lỗi khi thêm vào giỏ hàng:', error);
                toast.error(`🚨 Lỗi hệ thống: ${error.message}`);
              } finally {
                setIsAddingToCart(false);
              }
            }}
          >
            Mua ngay
          </Button>




          <Tooltip title="Chia sẻ">
            <Button size="large" icon={<ShareAltOutlined />} />
          </Tooltip>
        </Space>
      )
    } else {
      return (
        <Space className="action-buttons">
          <Button type="primary" size="large" icon={<ReadOutlined />}>
            Đọc ngay
          </Button>
          <Button size="large" icon={<DownloadOutlined />}>
            Tải xuống
          </Button>
          <Tooltip title="Chia sẻ">
            <Button size="large" icon={<ShareAltOutlined />} />
          </Tooltip>
        </Space>
      )
    }
  }

  const formatPrice = (price, is_physical) => {
    if (book.is_physical === 1) {
      return new Intl.NumberFormat('vi-VN').format(price);
    }
    return 'miễn phí';
  };

  const renderStats = () => {
    const baseStats = [
      {
        title: "Lượt xem",
        value: book.views,
        prefix: <EyeOutlined />,
        color: '#3f8600'
      },
      {
        title: "Giá",
        value: (
          <span style={{ color: 'red' }}>
            <DollarOutlined /> {formatPrice(book.price)} {book?.is_physical === 1 ? 'vnd' : ''}
          </span>
        ),
        color: 'red'
      },
      {
        title: "",
        value: (
          <Button
            type="text"
            icon={
              wishlist.includes(book.id) ? (
                <HeartFilled style={{ color: 'red', fontSize: 20 }} />
              ) : (
                <HeartOutlined style={{ fontSize: 20 }} />
              )
            }
            onClick={toggleWishlist}
            style={{ padding: 0 }}
          >
            {wishlist.includes(book.id) ? 'Đã yêu thích' : 'Thêm vào yêu thích'}
          </Button>
        ),
        prefix: null,
        color: '#cf1322'
      }
    ];

    if (book.format === 'ebook') {
      baseStats.push({
        title: "Số chương",
        value: book.chapters,
        prefix: <NumberOutlined />,
        color: '#1890ff'
      });
    }

    return baseStats;
  };

  if (loading) return <Spin size="large" className="loading-spinner" />

  if (!book) return <div className="error-message">Không tìm thấy thông tin sách</div>

  // State cho quantity


  // Hàm xử lý tăng/giảm quantity
  const handleQuantityChange = (action) => {
    if (action === 'increase' && quantity < 99) {
      setQuantity(prev => prev + 1);
    } else if (action === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // Hàm xử lý khi nhập trực tiếp
  const handleQuantityInputChange = (value) => {
    const numValue = parseInt(value) || 1;
    if (numValue >= 1 && numValue <= 99) {
      setQuantity(numValue);
    }
  };

  const addToCart = async (bookId, quantity) => {
    try {
      const response = await fetch('http://localhost:8000/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Thêm authorization header nếu cần
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          book_id: bookId,
          quantity: quantity
        })
      });

      // Kiểm tra response status
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  const handleAddToCart = async () => {
    try {
      if (!token) {
        toast.error('🔒 Vui lòng đăng nhập để thêm sách vào giỏ hàng!');
        router.push('/login');
        return;
      }

      setIsAddingToCart(true);

      const result = await addToCart(book.id, quantity);

      if (result.success) {
        toast.success('🎉 Đã thêm sách vào giỏ hàng!');
        window.updateCartCount?.();
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      } else {
        toast.error(`🚫 ${result.message || result.error || 'Không thể thêm vào giỏ hàng'}`);
      }
    } catch (error) {
      toast.error(`🚨 Lỗi hệ thống: ${error?.response?.data?.message || error.message || 'Không rõ lỗi'}`);
      console.error('Lỗi khi gọi API addToCart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };


  console.log(book.id)

return (
  <div className="book-detail-container">
    {/* Hero Section */}
    <Card className="book-hero-card" bordered={false}>
      <Row gutter={[32, 32]} align="top">
        <Col xs={24} md={8} lg={6}>
          <div className="book-cover-wrapper">
            <Badge.Ribbon
              text={book.format === 'paper' ? 'Sách giấy' : 'Sách điện tử'}
              color={book.format === 'paper' ? 'orange' : 'blue'}
            >
              <div className="book-image-container">
                {/* Ảnh chính */}
                <div className="main-image-wrapper">
                  
                    <ReactImageMagnify
                      {...{
                        smallImage: {
                          alt: 'Ảnh chính',
                          isFluidWidth: true,
                          src: book?.cover_image,
                        },
                        largeImage: {
                          src: mainImage,
                          width: 1200,
                          height: 1600,
                        },
                        enlargedImageContainerDimensions: {
                          width: '150%',
                          height: '150%',
                        },
                        enlargedImagePosition: 'over', // Hiển thị overlay thay vì beside
                        isEnlargedImagePortalEnabledForTouch: true,
                      }}
                    />
                  
                </div>

                {/* Ảnh thumbnail - nằm ngang */}
                <div className="thumbnail-container">
                  {images.map((img) => (
                    <img
                      key={img.id}
                      src={img.image_url}
                      alt={`Ảnh phụ ${img.id}`}
                      onClick={() => {
                        setMainImage(img.image_url)
                        console.log('Click ảnh id:', img.id)
                      }}
                      className={`thumbnail-image ${mainImage === img.image_url ? 'active' : ''}`}
                    />
                  ))}
                </div>
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
                <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                <Text className="meta-text">
                  <Text strong>Tác giả:</Text> {book.author.name}
                </Text>
              </Space>

              <Space align="center">
                <Avatar size="small" icon={<HomeOutlined />} style={{ backgroundColor: '#52c41a' }} />
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

            <div className="book-stats">
              {renderStats().map((stat, index) => (
                <div key={index} className="stat-item">
                  {stat.prefix && <span className="stat-prefix">{stat.prefix}</span>}
                  <strong className="stat-title">
                    {stat.title} {stat?.title ? ':' : ''}
                  </strong>
                  <span className="stat-value" style={{ color: stat.color }}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Section */}
            <div className="price-section">
              <Space size="middle" align="center" wrap>
                <div className="price-wrapper">
                  <Text className="current-price">
                    {book.price?.toLocaleString('vi-VN')}đ
                  </Text>
                  {book.original_price && book.original_price > book.price && (
                    <Text delete className="original-price">
                      {book.original_price?.toLocaleString('vi-VN')}đ
                    </Text>
                  )}
                </div>
                {book.discount_percentage && (
                  <Tag color="red" className="discount-tag">
                    -{book.discount_percentage}%
                  </Tag>
                )}
              </Space>
            </div>

            {/* Quantity Selector Section */}
            <div className="quantity-selector-section">
              <Space size="middle" align="center" wrap>
                <Text strong className="quantity-label">
                  Số lượng:
                </Text>
                <div className="quantity-controls">
                  <Button
                    type="text"
                    icon={<MinusOutlined />}
                    onClick={() => handleQuantityChange('decrease')}
                    disabled={quantity <= 1}
                    className="quantity-btn minus-btn"
                  />
                  <Input
                    value={quantity}
                    onChange={(e) => handleQuantityInputChange(e.target.value)}
                    className="quantity-input"
                    min={1}
                    max={99}
                  />
                  <Button
                    type="text"
                    icon={<PlusOutlined />}
                    onClick={() => handleQuantityChange('increase')}
                    disabled={quantity >= 99}
                    className="quantity-btn plus-btn"
                  />
                </div>
                {book.stock_quantity && (
                  <Text type="secondary" className="stock-info">
                    (Còn lại: {book.stock_quantity} sản phẩm)
                  </Text>
                )}
              </Space>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons-section">
              {renderActionButtons()}
            </div>
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
      {/* <div
        className="book-description"
        dangerouslySetInnerHTML={{ __html: marked(book.description) }}
      /> */}
    </Card>

    {/* Reviews Section */}
    <div className="reviews-section">
      {renderReviewStats()}
      {!isLoggedIn && renderLoginPrompt()}
      {renderReviewsList()}
    </div>

    {/* Chapters Section for Ebook only */}
    {book.format === 'ebook' && renderChaptersAccordion()}

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

    {/* Review Modal */}
    <Modal
      title="Viết đánh giá"
      open={showReviewModal}
      onCancel={() => {
        setShowReviewModal(false)
        form.resetFields()
      }}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        onFinish={handleSubmitReview}
        layout="vertical"
        initialValues={{ rating: 0.5 }}
      >
        <Form.Item
          name="rating"
          label="Đánh giá của bạn"
          rules={[
            { required: true, message: 'Vui lòng chọn số sao!' },
            {
              validator: (_, value) => {
                if (value >= 0.5 && value <= 5) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('Đánh giá phải từ 0.5 đến 5 sao'))
              }
            }
          ]}
        >
          <Rate
            style={{ fontSize: '24px' }}
            allowHalf
            allowClear={false}
          />
        </Form.Item>

        <Form.Item>
          <Text type="secondary">
            Đánh giá từ 0.5 - 5.0 sao
          </Text>
        </Form.Item>

        <Form.Item
          name="comment"
          label="Nhận xét"
          rules={[{ required: true, message: 'Vui lòng nhập nhận xét!' }]}
        >
          <TextArea
            rows={4}
            placeholder="Chia sẻ cảm nhận của bạn về cuốn sách này..."
            showCount
            maxLength={500}
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Gửi đánh giá
            </Button>
            <Button onClick={() => {
              setShowReviewModal(false)
              form.resetFields()
            }}>
              Hủy
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  </div>
)
}

export default BookDetailPage;