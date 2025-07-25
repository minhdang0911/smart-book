'use client';
import {
    BookOutlined,
    CaretRightOutlined,
    DollarOutlined,
    EditOutlined,
    EyeOutlined,
    HeartFilled,
    HeartOutlined,
    HomeOutlined,
    InfoCircleOutlined,
    MessageOutlined,
    MinusOutlined,
    NumberOutlined,
    PlusOutlined,
    ReadOutlined,
    ShareAltOutlined,
    ShoppingCartOutlined,
    UserOutlined,
} from '@ant-design/icons';
import {
    Avatar,
    Breadcrumb,
    Button,
    Card,
    Col,
    Collapse,
    Descriptions,
    Divider,
    Empty,
    Form,
    Image,
    Input,
    List,
    message,
    Modal,
    Progress,
    Rate,
    Row,
    Space,
    Spin,
    Tabs,
    Tag,
    Typography,
} from 'antd';
import { marked } from 'marked';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ReactImageMagnify from 'react-image-magnify';
import { toast } from 'react-toastify';

// Import custom hooks
import { useBookDetail } from '../../hooks/useBookDetail';
import { useBookImages } from '../../hooks/useBookImages';
import { useCart } from '../../hooks/useCart';
import { useReviewActions } from '../../hooks/useReviewActions';
import { useReviews } from '../../hooks/useReviews';
import { useReviewStats } from '../../hooks/useReviewStats';
import { useSameAuthorBooks } from '../../hooks/useSameAuthorBooks';
import { useSameCategoryBooks } from '../../hooks/useSameCategoryBooks';
import { useUser } from '../../hooks/useUser';
import { useWishlist } from '../../hooks/useWishlist';

import './BookDetail.css';

// Sample BookList component (replace with your actual BookList if different)
const BookList = ({ books }) => {
    // Debug: Log để xem books có data không
    console.log('📚 BookList received books:', books);
    console.log('📊 Books length:', books?.length);
    console.log('📋 Books type:', typeof books);
    console.log('🔍 Is array?', Array.isArray(books));

    const getNames = (field) => {
        if (!field) return 'Không rõ';
        if (Array.isArray(field)) {
            return field.map((item) => (typeof item === 'string' ? item : item.name)).join(', ');
        }
        if (typeof field === 'object' && field.name) return field.name;
        if (typeof field === 'string') return field;
        return 'Không rõ';
    };

    // Debug: Kiểm tra books có empty không
    if (!books) {
        console.log('❌ Books is null/undefined');
        return <div>Books data is null/undefined</div>;
    }

    if (!Array.isArray(books)) {
        console.log('❌ Books is not an array:', typeof books);
        return <div>Books is not an array: {typeof books}</div>;
    }

    if (books.length === 0) {
        console.log('📭 Books array is empty');
        return <div>Books array is empty</div>;
    }

    // Debug: Log từng book
    books.forEach((book, index) => {
        console.log(`📖 Book ${index}:`, {
            id: book.id,
            title: book.title,
            author: book.author,
            category: book.category,
            publisher: book.publisher,
        });
    });

    return (
        <div className="book-list">
            <div style={{ marginBottom: '20px', padding: '10px', background: '#f0f0f0' }}>
                <strong>Debug Info:</strong> {books.length} books found
            </div>

            {books.map((book, index) => (
                <div
                    key={book.id || index}
                    className="book-item"
                    style={{
                        border: '1px solid #ddd',
                        padding: '15px',
                        margin: '10px 0',
                        borderRadius: '8px',
                    }}
                >
                    <h3>{book.title || 'No title'}</h3>

                    <div className="book-details">
                        <p>
                            <strong>ID:</strong> {book.id}
                        </p>
                        <p>
                            <strong>Tác giả:</strong> {getNames(book.author)}
                        </p>
                        <p>
                            <strong>Thể loại:</strong> {getNames(book.category)}
                        </p>
                        <p>
                            <strong>NXB:</strong> {getNames(book.publisher)}
                        </p>
                        <p>
                            <strong>Giá:</strong>{' '}
                            {book.price ? `${Number(book.price).toLocaleString('vi-VN')} đ` : 'Chưa có giá'}
                        </p>
                        <p>
                            <strong>Rating:</strong> {book.rating_avg || 'Chưa có đánh giá'}
                        </p>
                    </div>

                    {book.cover_image && (
                        <img
                            src={book.cover_image}
                            alt={book.title}
                            style={{ width: '100px', height: '150px', objectFit: 'cover' }}
                        />
                    )}

                    {/* Debug: Raw book data */}
                    <details style={{ marginTop: '10px' }}>
                        <summary>🔍 Raw Data</summary>
                        <pre style={{ fontSize: '12px', background: '#f5f5f5', padding: '10px' }}>
                            {JSON.stringify(book, null, 2)}
                        </pre>
                    </details>
                </div>
            ))}
        </div>
    );
};

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

const BookDetailPage = () => {
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    // Helper functions to safely extract string values from objects
    const getAuthorName = (author) => {
        if (!author) return 'Không rõ';
        if (typeof author === 'string') return author;
        if (typeof author === 'object' && author.name) return author.name;
        return 'Không rõ';
    };

    const getCategoryName = (category) => {
        if (!category) return 'Không rõ';
        if (typeof category === 'string') return category;
        if (typeof category === 'object' && category.name) return category.name;
        return 'Không rõ';
    };

    const getAuthorId = (author) => {
        if (!author) return null;
        if (typeof author === 'object' && author.id) return author.id;
        return null;
    };

    const getCategoryId = (category) => {
        if (!category) return null;
        if (typeof category === 'object' && category._id) return category._id;
        if (typeof category === 'object' && category.id) return category.id;
        return null;
    };

    // Local state
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedStarFilter, setSelectedStarFilter] = useState('all');
    const [quantity, setQuantity] = useState(1);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [mainImage, setMainImage] = useState(null);
    const [activeTab, setActiveTab] = useState('1');
    const [form] = Form.useForm();

    // Custom hooks
    const { book, isLoading: bookLoading, error: bookError, mutate: mutateBook } = useBookDetail(id);
    const { images, isLoading: imagesLoading } = useBookImages(book?.id);
    const { reviewStats, isLoading: statsLoading, mutate: mutateStats } = useReviewStats(book?.id);
    const { reviews, isLoading: reviewsLoading, mutate: mutateReviews } = useReviews(book?.id, selectedStarFilter);

    // Use helper functions for the hooks that need string values
    const { books: sameAuthorBooks, isLoading: authorBooksLoading } = useSameAuthorBooks(
        book?.author, // Truyền cả object author
        book?.id,
    );

    const { books: sameCategoryBooks, isLoading: categoryBooksLoading } = useSameCategoryBooks(
        book?.category, // Truyền cả object category
        book?.id,
    );

    const { wishlist, toggleWishlist, isLoading: wishlistLoading } = useWishlist();
    const { user, isLoggedIn, isLoading: userLoading } = useUser();
    const { addToCart } = useCart();
    const { checkCanReview, submitReview } = useReviewActions();

    // Debugging data structure
    useEffect(() => {
        console.log('book:', book);
        console.log('sameAuthorBooks:', sameAuthorBooks);
        console.log('sameCategoryBooks:', sameCategoryBooks);
    }, [book, sameAuthorBooks, sameCategoryBooks]);

    // Set main image when images load
    useEffect(() => {
        if (images.length > 0 && !mainImage) {
            const main = images.find((img) => img.is_main === 1);
            setMainImage(main?.image_url || images[0]?.image_url);
        }
    }, [images, mainImage]);

    // Add chapters data if ebook
    useEffect(() => {
        if (book && book.format === 'ebook' && !book.chaptersData) {
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
                    'Tương lai tươi sáng',
                ];
                return titles[Math.floor(Math.random() * titles.length)];
            };

            const chaptersData = [];
            const totalChapters = 10;

            for (let i = 1; i <= totalChapters; i++) {
                const pagesCount = Math.floor(Math.random() * 6) + 3;
                const pages = [];

                for (let j = 1; j <= pagesCount; j++) {
                    pages.push({
                        pageNumber: j,
                        content: `Nội dung trang ${j} của chương ${i}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
                    });
                }

                chaptersData.push({
                    chapterNumber: i,
                    title: `Chương ${i}: ${getRandomChapterTitle()}`,
                    pages: pages,
                    totalPages: pagesCount,
                });
            }

            // Update book data with chapters
            mutateBook(
                {
                    ...book,
                    chapters: totalChapters,
                    chaptersData: chaptersData,
                },
                false,
            );
        }
    }, [book, mutateBook]);

    // Event handlers
    const handleStarFilterChange = (starLevel) => {
        setSelectedStarFilter(starLevel);
    };

    const handleQuantityChange = (action) => {
        if (action === 'increase' && quantity < 99) {
            setQuantity((prev) => prev + 1);
        } else if (action === 'decrease' && quantity > 1) {
            setQuantity((prev) => prev - 1);
        }
    };

    const handleQuantityInputChange = (value) => {
        const numValue = parseInt(value) || 1;
        if (numValue >= 1 && numValue <= 99) {
            setQuantity(numValue);
        }
    };

    console.log(isLoggedIn);
    const handleSubmitReview = async (values) => {
        // Sử dụng isLoggedIn từ hook thay vì gọi checkUser
        if (!isLoggedIn) {
            toast.error('🔒 Vui lòng đăng nhập để đánh giá!');
            // Có thể redirect đến trang login
            router.push('/login');
            return;
        }

        try {
            const data = await submitReview(id, values.rating, values.comment);

            if (data.status) {
                message.success('Đánh giá của bạn đã được gửi thành công!');
                setShowReviewModal(false);
                form.resetFields();

                // Cập nhật lại data
                mutateStats();
                mutateReviews();
            } else {
                message.error(data.message || 'Có lỗi xảy ra khi gửi đánh giá!');
            }
        } catch (error) {
            console.error('Error submitting review:', error);

            // Handle specific error cases
            if (error.response?.status === 401) {
                toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
                // Clear token và redirect
                localStorage.removeItem('token');
                router.push('/login');
            } else {
                message.error('Có lỗi xảy ra khi gửi đánh giá!');
            }
        }
    };

    const handleAddToCart = async () => {
        try {
            if (!isLoggedIn) {
                toast.error('🔒 Vui lòng đăng nhập để đánh giá!');
                // Có thể redirect đến trang login
                router.push('/login');
                return;
            }

            setIsAddingToCart(true);
            const result = await addToCart(book.id, quantity);

            if (result.success) {
                toast.success('🎉 Đã thêm sách vào giỏ hàng!');
            } else {
                toast.error(`🚫 ${result.message || result.error || 'Không thể thêm vào giỏ hàng'}`);
            }
        } catch (error) {
            toast.error(`🚨 Lỗi hệ thống: ${error?.response?.data?.message || error.message || 'Không rõ lỗi'}`);
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleBuyNow = async () => {
        if (!isLoggedIn) {
            toast.error('🔒 Vui lòng đăng nhập để đánh giá!');
            // Có thể redirect đến trang login
            router.push('/login');
            return;
        }
        try {
            const checkoutData = {
                items: [
                    {
                        id: book.id,
                        name: book.title || book.name,
                        price: book.price,
                        quantity: 1,
                        image: book.cover_image,
                        author: getAuthorName(book.author),
                    },
                ],
                totalAmount: book.price,
                totalDiscount: 0,
            };

            setIsAddingToCart(true);
            toast.info('🔄 Đang thêm vào giỏ hàng...');

            const result = await addToCart(book.id, 1);

            if (result.success) {
                toast.success(`✅ Đã thêm "${book.title}" vào giỏ hàng!`);

                localStorage.setItem(
                    'buyNowData',
                    JSON.stringify({
                        isBuyNow: true,
                        bookId: book.id,
                        checkoutData,
                        processed: false,
                        timestamp: Date.now(),
                    }),
                );

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
    };

    const handleToggleWishlist = async () => {
        if (!isLoggedIn) {
            toast.error('🔒 Vui lòng đăng nhập để đánh giá!');
            // Có thể redirect đến trang login
            router.push('/login');
            return;
        }

        const success = await toggleWishlist(book.id);
        if (success) {
            const isInWishlist = wishlist.includes(book.id);
            toast.success(isInWishlist ? 'Đã thêm vào yêu thích!' : 'Đã xóa khỏi yêu thích!');
        } else {
            toast.error('Có lỗi xảy ra!');
        }
    };

    const handleOpenReviewModal = async () => {
        if (!isLoggedIn) {
            toast.error('🔒 Vui lòng đăng nhập để đánh giá!');
            // Có thể redirect đến trang login
            router.push('/login');
            return;
        }

        const { canReview, message: msg } = await checkCanReview(book.id);
        if (!canReview) {
            toast.error(msg);
            return;
        }

        setShowReviewModal(true);
    };

    // Utility functions
    const formatPrice = (price) => {
        if (book?.is_physical === 1) {
            return new Intl.NumberFormat('vi-VN').format(price);
        }
        return 'miễn phí';
    };

    // Render functions
    const renderStats = () => {
        const baseStats = [
            {
                title: 'Lượt xem',
                value: book?.views || 0,
                prefix: <EyeOutlined />,
                color: '#3f8600',
            },
            {
                title: 'Giá',
                value: (
                    <span style={{ color: 'red' }}>
                        <DollarOutlined /> {formatPrice(book?.price)} {book?.is_physical === 1 ? 'VND' : ''}
                    </span>
                ),
                color: 'red',
            },
        ];

        if (book?.format === 'ebook') {
            baseStats.push({
                title: 'Số chương',
                value: book.chapters || 0,
                prefix: <NumberOutlined />,
                color: '#1890ff',
            });
        }

        return baseStats;
    };

    const renderReviewStats = () => {
        if (statsLoading) {
            return (
                <Card className="review-stats-card" bordered={false}>
                    <Spin />
                </Card>
            );
        }

        return (
            <Card
                title={
                    <Space>
                        <Text strong style={{ fontSize: '16px' }}>
                            Tóm tắt đánh giá
                        </Text>
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
                                    lineHeight: 1,
                                }}
                            >
                                {reviewStats?.totalReviews > 0 ? reviewStats.averageRating.toFixed(1) : '0'}
                            </div>
                            <div className="rating-stars" style={{ margin: '8px 0' }}>
                                <Rate
                                    disabled
                                    value={reviewStats?.totalReviews > 0 ? reviewStats.averageRating : 0}
                                    allowHalf
                                    style={{ fontSize: '20px' }}
                                />
                            </div>
                            <div
                                className="rating-count"
                                style={{
                                    color: '#8c8c8c',
                                    fontSize: '14px',
                                }}
                            >
                                {reviewStats?.totalReviews || 0} đánh giá
                            </div>
                        </div>
                    </Col>

                    <Col xs={24} md={12} lg={16}>
                        {reviewStats?.totalReviews > 0 ? (
                            <div className="rating-breakdown">
                                {[5, 4, 3, 2, 1].map((rating) => (
                                    <div
                                        key={rating}
                                        className="rating-row"
                                        onClick={() => handleStarFilterChange(rating.toString())}
                                        style={{
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginBottom: '8px',
                                            padding: '4px 0',
                                        }}
                                    >
                                        <span
                                            className="rating-label"
                                            style={{
                                                minWidth: '12px',
                                                textAlign: 'center',
                                                marginRight: '8px',
                                                fontSize: '14px',
                                            }}
                                        >
                                            {rating}
                                        </span>
                                        <Progress
                                            percent={reviewStats.starPercentages?.[rating] || 0}
                                            showInfo={false}
                                            strokeColor="#faad14"
                                            size="small"
                                            style={{
                                                flex: 1,
                                                margin: '0 12px',
                                                height: '8px',
                                            }}
                                        />
                                        <span
                                            className="rating-count-small"
                                            style={{
                                                minWidth: '30px',
                                                textAlign: 'right',
                                                fontSize: '14px',
                                                color: '#595959',
                                            }}
                                        >
                                            {reviewStats.ratingDistribution?.[rating] || 0}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '120px',
                                    color: '#8c8c8c',
                                    fontSize: '14px',
                                }}
                            >
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
                                    color: '#1890ff',
                                }}
                            >
                                → Xem tất cả đánh giá
                            </Button>

                            <Button type="primary" icon={<EditOutlined />} onClick={handleOpenReviewModal} size="small">
                                Viết đánh giá
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Card>
        );
    };

    const renderReviews = () => {
        if (reviewsLoading) {
            return <Spin />;
        }

        if (!reviews || reviews.length === 0) {
            return <Empty description="Chưa có đánh giá nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
        }

        return (
            <List
                dataSource={reviews}
                renderItem={(review) => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={<Avatar src={review.user?.avatar} icon={<UserOutlined />} />}
                            title={
                                <Space>
                                    <Text strong>{review.user?.name || 'Người dùng ẩn danh'}</Text>
                                    <Rate disabled defaultValue={review.rating} style={{ fontSize: '12px' }} />
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                        {review.timeAgo}
                                    </Text>
                                </Space>
                            }
                            description={
                                <div>
                                    <Paragraph style={{ marginBottom: 8 }}>{review.comment}</Paragraph>
                                    <Space>
                                        <Button type="text" size="small" icon={<MessageOutlined />}>
                                            Phản hồi
                                        </Button>
                                        <Text type="secondary">{review.likes} lượt thích</Text>
                                    </Space>
                                </div>
                            }
                        />
                    </List.Item>
                )}
            />
        );
    };

    const renderBookImages = () => {
        if (imagesLoading) {
            return <Spin />;
        }

        if (!images || images.length === 0) {
            return (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Image
                        src={book?.cover_image || '/placeholder-book.jpg'}
                        alt={book?.title}
                        width={300}
                        height={400}
                        style={{ objectFit: 'cover' }}
                    />
                </div>
            );
        }

        return (
            <div>
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <ReactImageMagnify
                        {...{
                            smallImage: {
                                alt: book?.title,
                                isFluidWidth: true,
                                src: mainImage || book?.cover_image,
                            },
                            largeImage: {
                                src: mainImage || book?.cover_image,
                                width: 1200,
                                height: 1800,
                            },
                            enlargedImageContainerStyle: { zIndex: 1500 },
                        }}
                        style={{ maxWidth: '300px', maxHeight: '400px' }}
                    />
                </div>

                {images.length > 1 && (
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {images.map((img, index) => (
                            <div
                                key={index}
                                style={{
                                    width: '60px',
                                    height: '80px',
                                    cursor: 'pointer',
                                    border: mainImage === img.image_url ? '2px solid #1890ff' : '1px solid #d9d9d9',
                                    borderRadius: '4px',
                                    overflow: 'hidden',
                                }}
                                onClick={() => setMainImage(img.image_url)}
                            >
                                <Image
                                    src={img.image_url}
                                    alt={`${book?.title} - ${index + 1}`}
                                    width={60}
                                    height={80}
                                    style={{ objectFit: 'cover' }}
                                    preview={false}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // Loading state
    if (bookLoading || userLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" />
            </div>
        );
    }

    // Error state
    if (bookError || !book) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Empty description="Không tìm thấy sách" />
            </div>
        );
    }

    return (
        <div className="book-detail-page" style={{ padding: '24px' }}>
            {/* Breadcrumb */}
            <Breadcrumb style={{ marginBottom: '24px' }}>
                <Breadcrumb.Item>
                    <HomeOutlined />
                    <span>Trang chủ</span>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                    <BookOutlined />
                    <span>Sách</span>
                </Breadcrumb.Item>
                <Breadcrumb.Item>{book.title}</Breadcrumb.Item>
            </Breadcrumb>

            <Row gutter={[24, 24]}>
                {/* Left Column - Book Images */}
                <Col xs={24} md={8} lg={6}>
                    <Card bordered={false}>{renderBookImages()}</Card>
                </Col>

                {/* Middle Column - Book Info */}
                <Col xs={24} md={12} lg={12}>
                    <Card bordered={false}>
                        <Title level={2} style={{ marginBottom: '16px' }}>
                            {book.title}
                        </Title>

                        <Descriptions column={1} size="small" style={{ marginBottom: '24px' }}>
                            <Descriptions.Item label="Tác giả">
                                <Text strong>{getAuthorName(book?.author)}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Thể loại">
                                <Tag color="blue">{getCategoryName(book?.category)}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Nhà xuất bản">
                                {/* <Text>{safeRender(book?.publisher)}</Text> */}
                            </Descriptions.Item>
                            <Descriptions.Item label="Năm xuất bản">
                                {/* <Text>{safeRender(book?.publication_year)}</Text> */}
                            </Descriptions.Item>
                            <Descriptions.Item label="Định dạng">
                                <Tag color={book?.format === 'ebook' ? 'green' : 'orange'}>
                                    {book?.format === 'ebook' ? 'Sách điện tử' : 'Sách giấy'}
                                </Tag>
                            </Descriptions.Item>
                        </Descriptions>

                        {/* Stats */}
                        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                            {renderStats().map((stat, index) => (
                                <Col span={8} key={index}>
                                    <Card size="small" style={{ textAlign: 'center' }}>
                                        <Space>
                                            {stat.prefix}
                                            <Text style={{ color: stat.color }}>
                                                {stat.title && `${stat.title}: `}
                                                {stat.value}
                                            </Text>
                                        </Space>
                                    </Card>
                                </Col>
                            ))}
                        </Row>

                        {/* Description */}
                        <Collapse ghost>
                            <Collapse.Panel
                                header={<Text strong>Mô tả sách</Text>}
                                key="1"
                                extra={<CaretRightOutlined />}
                            >
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: marked(book.description || 'Chưa có mô tả'),
                                    }}
                                />
                            </Collapse.Panel>
                        </Collapse>
                    </Card>
                </Col>

                {/* Right Column - Actions */}
                <Col xs={24} md={4} lg={6}>
                    <Card title="Thao tác" bordered={false}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            {/* Price */}
                            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                                <Text style={{ fontSize: '24px', fontWeight: 'bold', color: 'red' }}>
                                    {formatPrice(book.price)} {book.is_physical === 1 ? 'VND' : ''}
                                </Text>
                            </div>

                            {/* Quantity */}
                            {book.is_physical === 1 && (
                                <div>
                                    <Text strong>Số lượng:</Text>
                                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                                        <Button
                                            icon={<MinusOutlined />}
                                            size="small"
                                            onClick={() => handleQuantityChange('decrease')}
                                            disabled={quantity <= 1}
                                        />
                                        <Input
                                            value={quantity}
                                            onChange={(e) => handleQuantityInputChange(e.target.value)}
                                            style={{ width: '60px', textAlign: 'center', margin: '0 8px' }}
                                            size="small"
                                        />
                                        <Button
                                            icon={<PlusOutlined />}
                                            size="small"
                                            onClick={() => handleQuantityChange('increase')}
                                            disabled={quantity >= 99}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <Button
                                type="primary"
                                size="large"
                                block
                                icon={<ShoppingCartOutlined />}
                                onClick={handleBuyNow}
                                loading={isAddingToCart}
                            >
                                Mua ngay
                            </Button>

                            {book.is_physical === 1 && (
                                <Button
                                    size="large"
                                    block
                                    icon={<ShoppingCartOutlined />}
                                    onClick={handleAddToCart}
                                    loading={isAddingToCart}
                                >
                                    Thêm vào giỏ hàng
                                </Button>
                            )}

                            <Button
                                size="large"
                                block
                                icon={
                                    wishlist?.includes(book.id) ? (
                                        <HeartFilled style={{ color: 'red' }} />
                                    ) : (
                                        <HeartOutlined />
                                    )
                                }
                                onClick={handleToggleWishlist}
                                loading={wishlistLoading}
                            >
                                {wishlist?.includes(book.id) ? 'Đã yêu thích' : 'Thêm vào yêu thích'}
                            </Button>

                            {book.format === 'ebook' && (
                                <Button
                                    size="large"
                                    block
                                    icon={<ReadOutlined />}
                                    onClick={() => router.push(`/reader/${book.id}`)}
                                >
                                    Đọc sách
                                </Button>
                            )}

                            <Button size="large" block icon={<ShareAltOutlined />}>
                                Chia sẻ
                            </Button>
                        </Space>
                    </Card>
                </Col>
            </Row>

            {/* Tabs Section */}
            <Row style={{ marginTop: '32px' }}>
                <Col span={24}>
                    <Tabs activeKey={activeTab} onChange={setActiveTab}>
                        <TabPane tab="Đánh giá" key="1">
                            <div style={{ marginBottom: '24px' }}>{renderReviewStats()}</div>

                            {/* Star Filter */}
                            <div style={{ marginBottom: '16px' }}>
                                <Space>
                                    <Text>Lọc theo sao:</Text>
                                    <Button
                                        size="small"
                                        type={selectedStarFilter === 'all' ? 'primary' : 'default'}
                                        onClick={() => handleStarFilterChange('all')}
                                    >
                                        Tất cả
                                    </Button>
                                    {[5, 4, 3, 2, 1].map((star) => (
                                        <Button
                                            key={star}
                                            size="small"
                                            type={selectedStarFilter === star.toString() ? 'primary' : 'default'}
                                            onClick={() => handleStarFilterChange(star.toString())}
                                        >
                                            {star} sao
                                        </Button>
                                    ))}
                                </Space>
                            </div>

                            {renderReviews()}
                        </TabPane>

                        <TabPane tab="Sách cùng tác giả" key="2">
                            {authorBooksLoading ? (
                                <div style={{ textAlign: 'center', padding: '40px' }}>
                                    <Spin size="large" />
                                </div>
                            ) : sameAuthorBooks.length > 0 ? (
                                <BookList books={sameAuthorBooks} />
                            ) : (
                                <Empty description="Không có sách cùng tác giả" />
                            )}
                        </TabPane>

                        <TabPane tab="Sách cùng thể loại" key="3">
                            {categoryBooksLoading ? (
                                <div style={{ textAlign: 'center', padding: '40px' }}>
                                    <Spin size="large" />
                                </div>
                            ) : sameCategoryBooks.length > 0 ? (
                                <BookList books={sameCategoryBooks} />
                            ) : null}
                        </TabPane>

                        {book.format === 'ebook' && book.chaptersData && (
                            <TabPane tab="Mục lục" key="4">
                                <List
                                    dataSource={book.chaptersData}
                                    renderItem={(chapter) => (
                                        <List.Item
                                            actions={[
                                                <Button
                                                    type="link"
                                                    icon={<ReadOutlined />}
                                                    onClick={() =>
                                                        router.push(
                                                            `/reader/${book.id}?chapter=${chapter.chapterNumber}`,
                                                        )
                                                    }
                                                >
                                                    Đọc
                                                </Button>,
                                            ]}
                                        >
                                            <List.Item.Meta
                                                title={<Text strong>{chapter.title}</Text>}
                                                description={<Text type="secondary">{chapter.totalPages} trang</Text>}
                                            />
                                        </List.Item>
                                    )}
                                />
                            </TabPane>
                        )}
                    </Tabs>
                </Col>
            </Row>

            {/* Review Modal */}
            <Modal
                title="Viết đánh giá"
                open={showReviewModal}
                onCancel={() => {
                    setShowReviewModal(false);
                    form.resetFields();
                }}
                footer={null}
                width={600}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmitReview}>
                    <Form.Item
                        name="rating"
                        label="Đánh giá"
                        rules={[{ required: true, message: 'Vui lòng chọn số sao!' }]}
                    >
                        <Rate allowHalf />
                    </Form.Item>

                    <Form.Item
                        name="comment"
                        label="Nhận xét"
                        rules={[
                            { required: true, message: 'Vui lòng nhập nhận xét!' },
                            { min: 10, message: 'Nhận xét phải có ít nhất 10 ký tự!' },
                        ]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Chia sẻ cảm nhận của bạn về cuốn sách này..."
                            maxLength={500}
                            showCount
                        />
                    </Form.Item>

                    <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                        <Space>
                            <Button
                                onClick={() => {
                                    setShowReviewModal(false);
                                    form.resetFields();
                                }}
                            >
                                Hủy
                            </Button>
                            <Button type="primary" htmlType="submit">
                                Gửi đánh giá
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default BookDetailPage;
