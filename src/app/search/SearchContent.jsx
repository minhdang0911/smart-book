'use client';
import { ClearOutlined, FilterOutlined, ShoppingCartOutlined } from '@ant-design/icons';
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
import styles from './search.module.css';

const { Title, Text } = Typography;
const { Option } = Select;

const SearchContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [books, setBooks] = useState([]);
    const [pagination, setPagination] = useState({});
    const [authors, setAuthors] = useState([]);
    const keyword = searchParams.get('keyword');
    const [pageSize, setPageSize] = useState(12);
    const [priceDebounce, setPriceDebounce] = useState(null);
    const [categories, setCategories] = useState([]);
    const [filters, setFilters] = useState({
        name: searchParams.get('keyword') || '',
        selectedAuthors: [],
        selectedCategories: searchParams.get('category') ? [searchParams.get('category')] : [],
        priceRange: [0, 1000000],
        bookType: '',
        available: false,
        sort: 'popular',
    });
    const [currentPage, setCurrentPage] = useState(1);

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

    useEffect(() => {
        loadAuthors();
        loadCategories();
    }, []);

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

    const searchBooks = async () => {
        setLoading(true);
        try {
            const params = {};
            if (searchParams.get('keyword')) {
                params.name = searchParams.get('keyword');
            }
            if (filters.selectedAuthors.length > 0) {
                params.author = filters.selectedAuthors.join(',');
            }
            if (filters.selectedCategories.length > 0) {
                params.category = filters.selectedCategories.join(',');
            }
            if (filters.priceRange[0] > 0) {
                params.price_min = filters.priceRange[0];
            }
            if (filters.priceRange[1] < 1000000) {
                params.price_max = filters.priceRange[1];
            }
            if (filters.bookType) {
                if (filters.bookType === 'physical') {
                    params.type = 'paper';
                } else if (filters.bookType === 'ebook') {
                    params.type = 'ebook';
                }
            }
            if (filters.available) {
                params.available = 1;
            }
            if (filters.sort) {
                params.sort = filters.sort;
            }

            params.page = currentPage;
            params.limit = pageSize;

            const response = await axios.get('http://localhost:8000/api/books/search', {
                params: params,
            });

            if (response.data.status === 'success') {
                setBooks(response.data.data);
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
        return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
    };

    const handleBookClick = (bookId) => {
        router.push(`/book/${bookId}`);
    };

    return (
        <div className={styles.bookstoreContainer}>
            <div className={styles.section}>
                <Row gutter={24}>
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
                            className={styles.filterCard}
                        >
                            <div className={styles.filterSection}>
                                <Title level={5}>Tác giả</Title>
                                <div className={styles.filterCheckboxContainer}>
                                    <Checkbox.Group
                                        value={filters.selectedAuthors}
                                        onChange={handleAuthorChange}
                                        className={styles.filterCheckboxGroup}
                                    >
                                        {authors.map((author) => (
                                            <Checkbox key={author.id} value={author.name}>
                                                {author.name}
                                            </Checkbox>
                                        ))}
                                    </Checkbox.Group>
                                </div>
                            </div>

                            <Divider />

                            <div className={styles.filterSection}>
                                <Title level={5}>Thể loại</Title>
                                <div className={styles.filterCheckboxContainer}>
                                    <Checkbox.Group
                                        value={filters.selectedCategories}
                                        onChange={handleCategoryChange}
                                        className={styles.filterCheckboxGroup}
                                    >
                                        {categories.map((category) => (
                                            <Checkbox key={category.id} value={category.name}>
                                                {category.name}
                                            </Checkbox>
                                        ))}
                                    </Checkbox.Group>
                                </div>
                            </div>

                            <Divider />

                            <div className={styles.filterSection}>
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
                                <div className={styles.priceRangeDisplay}>
                                    <Text>{formatPrice(filters.priceRange[0])}</Text>
                                    <Text>{formatPrice(filters.priceRange[1])}</Text>
                                </div>
                            </div>

                            <Divider />

                            <div className={styles.filterSection}>
                                <Title level={5}>Loại sách</Title>
                                <Select
                                    value={filters.bookType}
                                    onChange={handleTypeChange}
                                    placeholder="Chọn loại sách"
                                    style={{ width: '100%' }}
                                    allowClear
                                >
                                    <Option value="ebook">Sách điện tử</Option>
                                    <Option value="physical">Sách bán</Option>
                                </Select>
                            </div>

                            <Divider />

                            <div className={styles.filterSection}>
                                <Checkbox checked={filters.available} onChange={handleAvailableChange}>
                                    Chỉ hiển thị sách còn hàng
                                </Checkbox>
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} md={18}>
                        <div className={styles.searchHeader}>
                            <div className={styles.searchInfo}>
                                <div className={styles.sectionTitle}>
                                    <Title level={2}>
                                        {filters.name ? `Kết quả tìm kiếm: "${filters.name}"` : 'Tất cả sách'}
                                    </Title>
                                </div>
                                {pagination.total && <Text type="secondary">Tìm thấy {pagination.total} kết quả</Text>}
                            </div>

                            <div className={styles.searchControls}>
                                <Select value={filters.sort} onChange={handleSortChange} style={{ width: 200 }}>
                                    <Option value="popular">Phổ biến nhất</Option>
                                    <Option value="price_low">Giá thấp đến cao</Option>
                                    <Option value="price_high">Giá cao đến thấp</Option>
                                    <Option value="newest">Mới nhất</Option>
                                </Select>
                            </div>
                        </div>

                        {(filters.selectedAuthors.length > 0 ||
                            filters.selectedCategories.length > 0 ||
                            filters.bookType ||
                            filters.available) && (
                            <div className={styles.activeFilters}>
                                <Text strong>Bộ lọc đang áp dụng: </Text>
                                {filters.selectedAuthors.map((author) => (
                                    <Tag
                                        key={author}
                                        closable
                                        onClose={() =>
                                            handleAuthorChange(filters.selectedAuthors.filter((a) => a !== author))
                                        }
                                    >
                                        Tác giả: {author}
                                    </Tag>
                                ))}
                                {filters.selectedCategories.map((category) => (
                                    <Tag
                                        key={category}
                                        closable
                                        onClose={() =>
                                            handleCategoryChange(
                                                filters.selectedCategories.filter((c) => c !== category),
                                            )
                                        }
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

                        <Spin spinning={loading}>
                            {books.length > 0 ? (
                                <div className={styles.booksGrid}>
                                    {books.map((book) => (
                                        <div key={book.id} className={styles.bookGridItem}>
                                            <Card className={styles.bookCard} onClick={() => handleBookClick(book.id)}>
                                                <div className={styles.bookImageContainer}>
                                                    <img
                                                        src={
                                                            book.cover_image ||
                                                            book.thumb ||
                                                            'https://via.placeholder.com/300x400?text=No+Image'
                                                        }
                                                        alt={book.title}
                                                        className={styles.bookImage}
                                                        onError={(e) => {
                                                            e.target.src =
                                                                'https://via.placeholder.com/300x400?text=No+Image';
                                                        }}
                                                    />

                                                    {book.discount_percent && (
                                                        <div className={styles.discountBadge}>
                                                            -{Math.round(book.discount_percent)}%
                                                        </div>
                                                    )}

                                                    {book.stock === 0 && (
                                                        <div className={styles.outOfStockOverlay}>
                                                            <span>Hết hàng</span>
                                                        </div>
                                                    )}

                                                    <div className={styles.bookActions}>
                                                        <Button
                                                            type="text"
                                                            icon={<ShoppingCartOutlined />}
                                                            className={styles.cartBtn}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                // Handle add to cart
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className={styles.bookInfo}>
                                                    <h3 className={styles.bookTitle}>{book.title}</h3>
                                                    <span className={styles.bookAuthor}>{book.author?.name}</span>

                                                    <div className={styles.priceContainer}>
                                                        <span className={styles.currentPrice}>
                                                            {formatPrice(book.price)}
                                                        </span>
                                                        {book.original_price && book.original_price > book.price && (
                                                            <>
                                                                <span className={styles.originalPrice}>
                                                                    {formatPrice(book.original_price)}
                                                                </span>
                                                                <span className={styles.discountPrice}>
                                                                    -
                                                                    {Math.round(
                                                                        ((book.original_price - book.price) /
                                                                            book.original_price) *
                                                                            100,
                                                                    )}
                                                                    %
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>

                                                    <div className={styles.bookMeta}>
                                                        <Tag color="blue">{book.category?.name}</Tag>
                                                        {book.type && (
                                                            <Tag color="green">
                                                                {book.type === 'ebook' ? 'Ebook' : 'Sách giấy'}
                                                            </Tag>
                                                        )}
                                                    </div>
                                                </div>
                                            </Card>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <Empty description="Không tìm thấy sách nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            )}
                        </Spin>

                        {pagination.total > 0 && (
                            <div className={styles.paginationContainer}>
                                <Pagination
                                    current={currentPage}
                                    total={pagination.total}
                                    pageSize={pageSize}
                                    onChange={handlePageChange}
                                    showSizeChanger={true}
                                    pageSizeOptions={['5', '10', '20']}
                                    onShowSizeChange={(current, size) => {
                                        setPageSize(size);
                                        setCurrentPage(1);
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

export default SearchContent;
