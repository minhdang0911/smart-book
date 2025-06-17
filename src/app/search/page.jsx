// pages/search/page.js
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Row,
    Col,
    Card,
    Checkbox,
    Slider,
    Button,
    Pagination,
    Select,
    Spin,
    Empty,
    Typography,
    Space,
    Divider,
    Tag
} from 'antd';
import { FilterOutlined, ClearOutlined } from '@ant-design/icons';
import { apiSearchBooks, apiGetAuthors, apiGetCategories } from '../../../apis/user';
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
    const [categories, setCategories] = useState([]);

    // Filters state
    const [filters, setFilters] = useState({
        name: searchParams.get('keyword') || '',
        selectedAuthors: [],
        selectedCategories: [],
        priceRange: [0, 1000000],
        bookType: '',
        available: false,
        sort: 'popular'
    });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(12);

    // Load initial data
    useEffect(() => {
        loadAuthors();
        loadCategories();
    }, []);

    // Search when filters change
    useEffect(() => {
        searchBooks();
    }, [filters, currentPage]);

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

    const searchBooks = async () => {
        setLoading(true);
        try {
            const searchParams = {
                name: filters.name,
                author: filters.selectedAuthors.join(','),
                category: filters.selectedCategories.join(','),
                price_min: filters.priceRange[0],
                price_max: filters.priceRange[1],
                type: filters.bookType,
                available: filters.available ? 1 : 0,
                sort: filters.sort,
                page: currentPage,
                limit: pageSize
            };

            const response = await apiSearchBooks(searchParams);
            if (response.status === 'success') {
                setBooks(response.data);
                setPagination(response.pagination);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAuthorChange = (checkedValues) => {
        setFilters(prev => ({
            ...prev,
            selectedAuthors: checkedValues
        }));
        setCurrentPage(1);
    };

    const handleCategoryChange = (checkedValues) => {
        setFilters(prev => ({
            ...prev,
            selectedCategories: checkedValues
        }));
        setCurrentPage(1);
    };

    const handlePriceChange = (value) => {
        setFilters(prev => ({
            ...prev,
            priceRange: value
        }));
        setCurrentPage(1);
    };

    const handleTypeChange = (value) => {
        setFilters(prev => ({
            ...prev,
            bookType: value
        }));
        setCurrentPage(1);
    };

    const handleAvailableChange = (e) => {
        setFilters(prev => ({
            ...prev,
            available: e.target.checked
        }));
        setCurrentPage(1);
    };

    const handleSortChange = (value) => {
        setFilters(prev => ({
            ...prev,
            sort: value
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
            sort: 'popular'
        });
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const handleBookClick = (bookId) => {
        router.push(`/book/${bookId}`);
    };

    console.log('authors', authors)

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
                                <Button
                                    type="link"
                                    icon={<ClearOutlined />}
                                    onClick={clearFilters}
                                    size="small"
                                >
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
                                    {authors.map(author => (
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
                                    {categories.map(category => (
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
                                        formatter: (value) => formatPrice(value)
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
                                    <Option value="physical">Sách giấy</Option>
                                </Select>
                            </div>

                            <Divider />

                            {/* Còn hàng */}
                            <div className="filter-section">
                                <Checkbox
                                    checked={filters.available}
                                    onChange={handleAvailableChange}
                                >
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
                                {pagination.total && (
                                    <Text type="secondary">
                                        Tìm thấy {pagination.total} kết quả
                                    </Text>
                                )}
                            </div>

                            <div className="search-controls">
                                <Select
                                    value={filters.sort}
                                    onChange={handleSortChange}
                                    style={{ width: 200 }}
                                >
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
                                    {filters.selectedAuthors.map(author => (
                                        <Tag key={author} closable onClose={() => {
                                            handleAuthorChange(filters.selectedAuthors.filter(a => a !== author));
                                        }}>
                                            Tác giả: {author}
                                        </Tag>
                                    ))}
                                    {filters.selectedCategories.map(category => (
                                        <Tag key={category} closable onClose={() => {
                                            handleCategoryChange(filters.selectedCategories.filter(c => c !== category));
                                        }}>
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
                                    {books.map(book => (
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
                                                                {book.stock === 0 && (
                                                                    <Tag color="red">Hết hàng</Tag>
                                                                )}
                                                            </div>
                                                        </div>
                                                    }
                                                />
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            ) : (
                                <Empty
                                    description="Không tìm thấy sách nào"
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                />
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
                                        setPageSize(size);      // cập nhật pageSize
                                        setCurrentPage(1);      // reset về trang đầu nếu cần
                                    }}
                                    showQuickJumper
                                    showTotal={(total, range) =>
                                        `${range[0]}-${range[1]} của ${total} sách`
                                    }
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