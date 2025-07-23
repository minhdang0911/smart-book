// pages/search/page.js
'use client';
import { ClearOutlined, FilterOutlined } from '@ant-design/icons';
import {
    Button,
    Card,
    Checkbox,
    Col,
    Divider,
    Empty,
    Pagination,
    Row,
    Select,
    Slider,
    Space,
    Spin,
    Tag,
    Typography,
} from 'antd';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiGetAuthors, apiGetCategories } from '../../../apis/user';
import './search.css';

const { Title, Text } = Typography;
const { Option } = Select;

const SearchPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [books, setBooks] = useState([]);
    const [pagination, setPagination] = useState({});
    const [authors, setAuthors] = useState([]);
    const keyword = searchParams.get('keyword'); // VD: cô
    const [pageSize, setPageSize] = useState(12);
    const [priceDebounce, setPriceDebounce] = useState(null);

    const [categories, setCategories] = useState([]);

    // Filters state
    const [filters, setFilters] = useState({
        name: searchParams.get('keyword') || '',
        selectedAuthors: [],
        selectedCategories: searchParams.get('category') ? [searchParams.get('category')] : [],
        priceRange: [0, 1000000],
        bookType: '',
        available: false,
        sort: 'popular',
    });

    useEffect(() => {
        const newCategory = searchParams.get('category');
        const newKeyword = searchParams.get('keyword');

        setFilters((prev) => ({
            ...prev,
            name: newKeyword || '',
            selectedCategories: newCategory ? [newCategory] : [],
        }));
        setCurrentPage(1);
    }, [searchParams]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);

    // Load initial data
    useEffect(() => {
        loadAuthors();
        loadCategories();
    }, []);

    // Search when filters change
    useEffect(() => {
        searchBooks();
    }, [searchParams.get('keyword'), filters, currentPage, pageSize]);

    const loadAuthors = async () => {
        const response = await apiGetAuthors();
        if (response.success === true) {
            setAuthors(response.data);
        }
    };

    const loadCategories = async () => {
        const response = await apiGetCategories();
        if (response.success === true) {
            setCategories(response.data);
        }
    };

    // Fixed searchBooks function
    const searchBooks = async () => {
        setLoading(true);
        try {
            // Chuẩn bị params
            const params = {};

            // Tên sách
            if (searchParams.get('keyword')) {
                params.name = searchParams.get('keyword');
            }

            // Tác giả - gửi từng cái một hoặc gộp lại
            if (filters.selectedAuthors.length > 0) {
                // Cách 1: Gửi tất cả tác giả cách nhau bởi dấu phẩy
                params.author = filters.selectedAuthors.join(',');
            }

            // Thể loại - tương tự tác giả
            if (filters.selectedCategories.length > 0) {
                params.category = filters.selectedCategories.join(',');
            }

            // Khoảng giá
            if (filters.priceRange[0] > 0) {
                params.price_min = filters.priceRange[0];
            }
            if (filters.priceRange[1] < 1000000) {
                params.price_max = filters.priceRange[1];
            }

            // Loại sách - fix mapping
            if (filters.bookType) {
                if (filters.bookType === 'physical') {
                    params.type = 'paper'; // Backend expect 'paper'
                } else {
                    params.type = filters.bookType; // 'ebook' giữ nguyên
                }
            }

            // Còn hàng
            if (filters.available) {
                params.available = 1;
            }

            // Sắp xếp
            if (filters.sort) {
                params.sort = filters.sort;
            }

            // Phân trang
            params.page = currentPage;
            params.limit = pageSize;

            console.log('Params gửi lên API:', params); // Debug

            const response = await axios.get('http://localhost:8000/api/books/search', {
                params: params,
            });

            if (response.data.status === 'success') {
                setBooks(response.data.data);
                // Cập nhật pagination nếu có
                if (response.data.pagination) {
                    setPagination(response.data.pagination);
                }
            }
        } catch (err) {
            console.error('Lỗi khi tìm kiếm:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAuthorChange = (checkedValues) => {
        setFilters((prev) => ({
            ...prev,
            selectedAuthors: checkedValues,
        }));
        setCurrentPage(1);
    };

    const handleCategoryChange = (checkedValues) => {
        setFilters((prev) => ({
            ...prev,
            selectedCategories: checkedValues,
        }));
        setCurrentPage(1);
    };

    const handlePriceChange = (value) => {
        if (priceDebounce) {
            clearTimeout(priceDebounce);
        }

        setFilters((prev) => ({
            ...prev,
            priceRange: value,
        }));

        // Debounce 500ms để tránh call API liên tục
        const timeout = setTimeout(() => {
            setCurrentPage(1);
        }, 500);

        setPriceDebounce(timeout);
    };

    const handleTypeChange = (value) => {
        setFilters((prev) => ({
            ...prev,
            bookType: value,
        }));
        setCurrentPage(1);
    };

    const handleAvailableChange = (e) => {
        setFilters((prev) => ({
            ...prev,
            available: e.target.checked,
        }));
        setCurrentPage(1);
    };

    const handleSortChange = (value) => {
        setFilters((prev) => ({
            ...prev,
            sort: value,
        }));
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setFilters({
            name: '',
            selectedAuthors: [],
            selectedCategories: [],
            priceRange: [0, 1000000],
            bookType: '',
            available: false,
            sort: 'popular',
        });
        setCurrentPage(1);
    };

    const handlePageChange = (page, size) => {
        setCurrentPage(page);
        if (size !== pageSize) {
            setPageSize(size);
        }
    };
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    const handleBookClick = (bookId) => {
        router.push(`/book/${bookId}`);
    };

    console.log('authors', authors);

    return (
        <div className="search-page">
            <div className="search-container">
                <Row gutter={24}>
                    {/* Sidebar Filters */}
                    <Col xs={24} md={6}>
                        <Card
                            title={
                                <Space>
                                    <FilterOutlined />
                                    Bộ lọc
                                </Space>
                            }
                            extra={
                                <Button type="link" icon={<ClearOutlined />} onClick={clearFilters} size="small">
                                    Xóa bộ lọc
                                </Button>
                            }
                            className="filter-card"
                        >
                            {/* Tác giả */}
                            <div className="filter-section">
                                <Title level={5}>Tác giả</Title>
                                <Checkbox.Group
                                    value={filters.selectedAuthors}
                                    onChange={handleAuthorChange}
                                    className="filter-checkbox-group"
                                >
                                    {authors.map((author) => (
                                        <Checkbox key={author.id} value={author.name}>
                                            {author.name}
                                        </Checkbox>
                                    ))}
                                </Checkbox.Group>
                            </div>

                            <Divider />

                            {/* Thể loại */}
                            <div className="filter-section">
                                <Title level={5}>Thể loại</Title>
                                <Checkbox.Group
                                    value={filters.selectedCategories}
                                    onChange={handleCategoryChange}
                                    className="filter-checkbox-group"
                                >
                                    {categories.map((category) => (
                                        <Checkbox key={category.id} value={category.name}>
                                            {category.name}
                                        </Checkbox>
                                    ))}
                                </Checkbox.Group>
                            </div>

                            <Divider />

                            {/* Khoảng giá */}
                            <div className="filter-section">
                                <Title level={5}>Khoảng giá</Title>
                                <Slider
                                    range
                                    min={0}
                                    max={1000000}
                                    step={10000}
                                    value={filters.priceRange}
                                    onChange={handlePriceChange}
                                    tooltip={{
                                        formatter: (value) => formatPrice(value),
                                    }}
                                />
                                <div className="price-range-display">
                                    <Text>{formatPrice(filters.priceRange[0])}</Text>
                                    <Text>{formatPrice(filters.priceRange[1])}</Text>
                                </div>
                            </div>

                            <Divider />

                            {/* Loại sách */}
                            <div className="filter-section">
                                <Title level={5}>Loại sách</Title>
                                <Select
                                    value={filters.bookType}
                                    onChange={handleTypeChange}
                                    placeholder="Chọn loại sách"
                                    style={{ width: '100%' }}
                                    allowClear
                                >
                                    <Option value="ebook">Ebook</Option>
                                    <Option value="physical">Sách giấy</Option> {/* Giữ nguyên 'physical' */}
                                </Select>
                            </div>

                            <Divider />

                            {/* Còn hàng */}
                            <div className="filter-section">
                                <Checkbox checked={filters.available} onChange={handleAvailableChange}>
                                    Chỉ hiển thị sách còn hàng
                                </Checkbox>
                            </div>
                        </Card>
                    </Col>

                    {/* Main Content */}
                    <Col xs={24} md={18}>
                        {/* Header */}
                        <div className="search-header">
                            <div className="search-info">
                                <Title level={3}>
                                    {filters.name ? `Kết quả tìm kiếm: "${filters.name}"` : 'Tất cả sách'}
                                </Title>
                                {pagination.total && <Text type="secondary">Tìm thấy {pagination.total} kết quả</Text>}
                            </div>

                            <div className="search-controls">
                                <Select value={filters.sort} onChange={handleSortChange} style={{ width: 200 }}>
                                    <Option value="popular">Phổ biến nhất</Option>
                                    <Option value="price_low">Giá thấp đến cao</Option>
                                    <Option value="price_high">Giá cao đến thấp</Option>
                                    <Option value="newest">Mới nhất</Option>
                                </Select>
                            </div>
                        </div>

                        {/* Active Filters */}
                        {(filters.selectedAuthors.length > 0 ||
                            filters.selectedCategories.length > 0 ||
                            filters.bookType ||
                            filters.available) && (
                            <div className="active-filters">
                                <Text strong>Bộ lọc đang áp dụng: </Text>
                                {filters.selectedAuthors.map((author) => (
                                    <Tag
                                        key={author}
                                        closable
                                        onClose={() => {
                                            handleAuthorChange(filters.selectedAuthors.filter((a) => a !== author));
                                        }}
                                    >
                                        Tác giả: {author}
                                    </Tag>
                                ))}
                                {filters.selectedCategories.map((category) => (
                                    <Tag
                                        key={category}
                                        closable
                                        onClose={() => {
                                            handleCategoryChange(
                                                filters.selectedCategories.filter((c) => c !== category),
                                            );
                                        }}
                                    >
                                        Thể loại: {category}
                                    </Tag>
                                ))}
                                {filters.bookType && (
                                    <Tag closable onClose={() => handleTypeChange('')}>
                                        Loại: {filters.bookType === 'ebook' ? 'Ebook' : 'Sách giấy'}
                                    </Tag>
                                )}
                                {filters.available && (
                                    <Tag closable onClose={() => handleAvailableChange({ target: { checked: false } })}>
                                        Còn hàng
                                    </Tag>
                                )}
                            </div>
                        )}

                        {/* Books Grid */}
                        <Spin spinning={loading}>
                            {books.length > 0 ? (
                                <Row gutter={[16, 16]} className="books-grid">
                                    {books.map((book) => (
                                        <Col xs={24} sm={12} md={8} lg={6} key={book.id}>
                                            <Card
                                                hoverable
                                                cover={
                                                    <div className="book-cover">
                                                        <img
                                                            alt={book.title}
                                                            src={book.cover_image || '/default-book-cover.jpg'}
                                                            onError={(e) => {
                                                                e.target.src = '/default-book-cover.jpg';
                                                            }}
                                                        />
                                                    </div>
                                                }
                                                onClick={() => handleBookClick(book.id)}
                                                className="book-card"
                                            >
                                                <Card.Meta
                                                    title={
                                                        <div className="book-title" title={book.title}>
                                                            {book.title}
                                                        </div>
                                                    }
                                                    description={
                                                        <div className="book-info">
                                                            <Text type="secondary" className="book-author">
                                                                {book.author?.name}
                                                            </Text>
                                                            <Text strong className="book-price">
                                                                {formatPrice(book.price)}
                                                            </Text>
                                                            <div className="book-meta">
                                                                <Tag color="blue">{book.category?.name}</Tag>
                                                                {book.stock === 0 && <Tag color="red">Hết hàng</Tag>}
                                                            </div>
                                                        </div>
                                                    }
                                                />
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            ) : (
                                <Empty description="Không tìm thấy sách nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            )}
                        </Spin>

                        {/* Pagination */}
                        {pagination.total > 0 && (
                            <div className="pagination-container">
                                <Pagination
                                    current={currentPage}
                                    total={pagination.total}
                                    pageSize={pageSize}
                                    onChange={handlePageChange}
                                    showSizeChanger={true} // Bật chọn size
                                    pageSizeOptions={['5', '10', '20']} // Các lựa chọn
                                    onShowSizeChange={(current, size) => {
                                        setPageSize(size); // cập nhật pageSize
                                        setCurrentPage(1); // reset về trang đầu nếu cần
                                    }}
                                    showQuickJumper
                                    showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} sách`}
                                />
                            </div>
                        )}
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default SearchPage;
