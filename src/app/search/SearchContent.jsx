'use client';
import { ClearOutlined, FilterOutlined, RobotOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import {
    Alert,
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

    // AI Search states - Enhanced for OCR.space compatibility
    const [isAISearch, setIsAISearch] = useState(false);
    const [aiSearchInfo, setAiSearchInfo] = useState(null);
    const [aiSearchResults, setAiSearchResults] = useState({
        bookTitleResults: [],
        authorResults: [],
        categoryResults: [],
        currentSearchType: null,
    });

    useEffect(() => {
        const newCategory = searchParams.get('category');
        const newKeyword = searchParams.get('keyword');
        const aiSearch = searchParams.get('ai_search');
        const aiBookTitle = searchParams.get('ai_book_title');
        const aiAuthor = searchParams.get('ai_author');
        const aiCategory = searchParams.get('ai_category');

        setIsAISearch(!!aiSearch);

        if (aiSearch) {
            setAiSearchInfo({
                bookTitle: aiBookTitle,
                author: aiAuthor,
                category: aiCategory,
                isAI: true,
                ocrEngine: 'OCR.space', // Track OCR engine used
            });
        }

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
        if (isAISearch && aiSearchInfo) {
            performAISearch();
        } else {
            searchBooks();
        }
    }, [searchParams.get('keyword'), filters, currentPage, pageSize, isAISearch, aiSearchInfo]);

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

    // ===== ENHANCED AI SEARCH LOGIC WITH OCR.SPACE OPTIMIZATION =====
    const performAISearch = async () => {
        setLoading(true);
        try {
            const { bookTitle, author, category } = aiSearchInfo;
            let foundBooks = [];
            let searchType = null;

            console.log('🤖 AI Search Info (OCR.space):', aiSearchInfo);

            // 1. Tìm theo tên sách trước (ưu tiên cao nhất)
            if (bookTitle && bookTitle.trim().length > 2) {
                console.log('📖 Searching by book title:', bookTitle);
                foundBooks = await searchBooksByTitle(bookTitle);
                if (foundBooks && foundBooks.length > 0) {
                    searchType = 'title';
                    setAiSearchResults((prev) => ({
                        ...prev,
                        bookTitleResults: foundBooks,
                        currentSearchType: 'title',
                    }));
                    setBooks(foundBooks);
                    setPagination({ total: foundBooks.length });
                    console.log('✅ Found books by title:', foundBooks.length);
                    setLoading(false);
                    return;
                }
            }

            // 2. Nếu không tìm thấy theo tên sách, tìm theo tác giả
            if (author && author.trim().length > 2) {
                console.log('👤 Searching by author:', author);
                foundBooks = await searchBooksByAuthor(author);
                if (foundBooks && foundBooks.length > 0) {
                    searchType = 'author';
                    setAiSearchResults((prev) => ({
                        ...prev,
                        authorResults: foundBooks,
                        currentSearchType: 'author',
                    }));
                    setBooks(foundBooks);
                    setPagination({ total: foundBooks.length });
                    console.log('✅ Found books by author:', foundBooks.length);
                    setLoading(false);
                    return;
                }
            }

            // 3. Cuối cùng tìm theo category
            if (category && category.trim().length > 2) {
                console.log('📚 Searching by category:', category);
                foundBooks = await searchBooksByCategory(category);
                if (foundBooks && foundBooks.length > 0) {
                    searchType = 'category';
                    setAiSearchResults((prev) => ({
                        ...prev,
                        categoryResults: foundBooks,
                        currentSearchType: 'category',
                    }));
                    setBooks(foundBooks);
                    setPagination({ total: foundBooks.length });
                    console.log('✅ Found books by category:', foundBooks.length);
                    setLoading(false);
                    return;
                }
            }

            // Không tìm thấy gì
            console.log('❌ No books found with OCR.space AI search');
            setBooks([]);
            setPagination({ total: 0 });
            setAiSearchResults((prev) => ({
                ...prev,
                currentSearchType: 'none',
            }));
        } catch (error) {
            console.error('OCR.space AI Search error:', error);
            setBooks([]);
            setPagination({ total: 0 });
        } finally {
            setLoading(false);
        }
    };

    // ===== ENHANCED SEARCH FUNCTIONS WITH OCR.SPACE TEXT PROCESSING =====
    const searchBooksByTitle = async (title) => {
        try {
            console.log('🔍 Searching books by title (OCR.space):', title);

            
            const normalizedTitle = normalizeOCRSpaceText(title);
            const searchQueries = generateEnhancedSearchQueries(normalizedTitle);

            console.log('📝 Generated search queries:', searchQueries);

            
            for (const query of searchQueries) {
                console.log('🔎 Trying query:', query);

                const response = await axios.get('http://localhost:8000/api/books/search', {
                    params: {
                        name: query,
                        limit: 20,
                    },
                });

                if (response.data.status === 'success' && response.data.data.length > 0) {
                    console.log('✅ Found books with query:', query, response.data.data.length);
                    return response.data.data;
                }
            }

            return [];
        } catch (error) {
            console.error('Search by title failed:', error);
            return [];
        }
    };

    const searchBooksByAuthor = async (authorName) => {
        try {
            console.log('👤 Searching books by author (OCR.space):', authorName);

           
            const matchedAuthor = await findMatchingAuthorEnhanced(authorName);

            if (matchedAuthor) {
                console.log('✅ Found matching author:', matchedAuthor);

               
                const response = await axios.get('http://localhost:8000/api/books/search', {
                    params: {
                        author: matchedAuthor.id,
                        limit: 20,
                    },
                });

                if (response.data.status === 'success' && response.data.data.length > 0) {
                    return response.data.data;
                }
            }

            // 2. Nếu không tìm thấy author trong DB, thử tìm trực tiếp với OCR text processing
            const normalizedAuthor = normalizeOCRSpaceText(authorName);
            const searchQueries = generateEnhancedSearchQueries(normalizedAuthor);

            for (const query of searchQueries) {
                const response = await axios.get('http://localhost:8000/api/books/search', {
                    params: {
                        author: query,
                        limit: 20,
                    },
                });

                if (response.data.status === 'success' && response.data.data.length > 0) {
                    return response.data.data;
                }
            }

            return [];
        } catch (error) {
            console.error('Search by author failed:', error);
            return [];
        }
    };

    const searchBooksByCategory = async (categoryName) => {
        try {
            console.log('📚 Searching books by category (OCR.space):', categoryName);

            // 1. Tìm category ID từ danh sách categories với enhanced matching
            const matchedCategory = await findMatchingCategoryEnhanced(categoryName);

            if (matchedCategory) {
                console.log('✅ Found matching category:', matchedCategory);

                // Tìm theo category ID
                const response = await axios.get('http://localhost:8000/api/books/search', {
                    params: {
                        category: matchedCategory.id,
                        limit: 20,
                    },
                });

                if (response.data.status === 'success' && response.data.data.length > 0) {
                    return response.data.data;
                }
            }

            // 2. Nếu không tìm thấy category trong DB, thử tìm trực tiếp
            const normalizedCategory = normalizeOCRSpaceText(categoryName);
            const searchQueries = generateEnhancedSearchQueries(normalizedCategory);

            for (const query of searchQueries) {
                const response = await axios.get('http://localhost:8000/api/books/search', {
                    params: {
                        category: query,
                        limit: 20,
                    },
                });

                if (response.data.status === 'success' && response.data.data.length > 0) {
                    return response.data.data;
                }
            }

            return [];
        } catch (error) {
            console.error('Search by category failed:', error);
            return [];
        }
    };

    // ===== ENHANCED HELPER FUNCTIONS FOR OCR.SPACE TEXT PROCESSING =====
    const normalizeOCRSpaceText = (text) => {
        if (!text) return '';

        return (
            text
                .toLowerCase()
                // Handle common OCR.space misreads
                .replace(/[|]/g, 'i')
                .replace(/[0]/g, 'o')
                .replace(/[5]/g, 's')
                .replace(/[1]/g, 'i')
                .replace(/[8]/g, 'b')
                // Remove special characters but keep Vietnamese
                .replace(/[^\w\s\u00C0-\u024F\u1E00-\u1EFF]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()
        );
    };

    const generateEnhancedSearchQueries = (text) => {
        const queries = [];

        // Query gốc
        queries.push(text);

        // Các từ khóa chính
        const words = text.split(' ').filter((word) => word.length > 2);

        // Từng từ riêng lẻ (chỉ từ dài)
        words.forEach((word) => {
            if (word.length > 3) {
                queries.push(word);
            }
        });

        // Kết hợp 2 từ liền kề
        for (let i = 0; i < words.length - 1; i++) {
            queries.push(`${words[i]} ${words[i + 1]}`);
        }

        // Kết hợp 3 từ đầu (nếu có)
        if (words.length >= 3) {
            queries.push(`${words[0]} ${words[1]} ${words[2]}`);
        }

        // Fuzzy matching variants for OCR errors
        const fuzzyQueries = [];
        words.forEach((word) => {
            if (word.length > 4) {
                // Remove last character (OCR might miss it)
                fuzzyQueries.push(word.slice(0, -1));
                // Remove first character (OCR might add extra)
                fuzzyQueries.push(word.slice(1));
            }
        });
        queries.push(...fuzzyQueries);

        // Loại bỏ duplicate và sort theo độ dài
        const uniqueQueries = [...new Set(queries)].filter((q) => q.length > 2).sort((a, b) => b.length - a.length);

        console.log('🔍 Enhanced queries for OCR.space:', uniqueQueries);
        return uniqueQueries;
    };

    const findMatchingAuthorEnhanced = async (authorName) => {
        const normalizedAuthor = normalizeOCRSpaceText(authorName);

        // Tìm exact match
        let match = authors.find((author) => normalizeOCRSpaceText(author.name) === normalizedAuthor);
        if (match) return match;

        // Tìm partial match với threshold cao hơn
        match = authors.find((author) => {
            const normalizedDbAuthor = normalizeOCRSpaceText(author.name);
            const similarity = calculateStringSimilarity(normalizedAuthor, normalizedDbAuthor);
            return similarity > 0.7; // 70% similarity threshold
        });
        if (match) return match;

        // Tìm theo từ khóa với weighted scoring
        const authorWords = normalizedAuthor.split(' ');
        match = authors.find((author) => {
            const authorDbWords = normalizeOCRSpaceText(author.name).split(' ');
            let matchScore = 0;
            let totalWords = authorWords.length;

            authorWords.forEach((word) => {
                if (
                    authorDbWords.some(
                        (dbWord) =>
                            dbWord.includes(word) ||
                            word.includes(dbWord) ||
                            calculateStringSimilarity(word, dbWord) > 0.8,
                    )
                ) {
                    matchScore++;
                }
            });

            return matchScore / totalWords > 0.5; // 50% word match threshold
        });

        return match;
    };

    const findMatchingCategoryEnhanced = async (categoryName) => {
        const normalizedCategory = normalizeOCRSpaceText(categoryName);

        // Enhanced mapping thể loại với OCR error handling
        const categoryMapping = {
            'tiểu thuyết': ['tiểu thuyết', 'tieu thuyet', 'novel', 'fiction', 'tiu thuyt'],
            'truyện tranh': ['truyện tranh', 'truyen tranh', 'manga', 'comic', 'truyn tranh'],
            'văn học': ['văn học', 'van hoc', 'literature', 'vn hc'],
            'khoa học': ['khoa học', 'khoa hoc', 'science', 'khoa học tự nhiên', 'kh hc'],
            'kinh doanh': ['kinh doanh', 'kinh doanh', 'business', 'knh doanh'],
            'thiếu nhi': ['thiếu nhi', 'thieu nhi', 'trẻ em', 'children', 'thu nhi'],
            'giáo khoa': ['giáo khoa', 'giao khoa', 'textbook', 'sách giáo khoa', 'gio khoa'],
            'lịch sử': ['lịch sử', 'lich su', 'history', 'lch s'],
        };

        // Tìm exact match
        let match = categories.find((category) => normalizeOCRSpaceText(category.name) === normalizedCategory);
        if (match) return match;

        // Tìm theo enhanced mapping với fuzzy matching
        for (const [key, aliases] of Object.entries(categoryMapping)) {
            const isMatch = aliases.some((alias) => {
                const similarity = calculateStringSimilarity(normalizedCategory, alias);
                return similarity > 0.6 || normalizedCategory.includes(alias) || alias.includes(normalizedCategory);
            });

            if (isMatch) {
                match = categories.find((category) => {
                    const catName = normalizeOCRSpaceText(category.name);
                    return catName.includes(key) || key.includes(catName);
                });
                if (match) return match;
            }
        }

        // Tìm partial match với similarity threshold
        match = categories.find((category) => {
            const normalizedDbCategory = normalizeOCRSpaceText(category.name);
            const similarity = calculateStringSimilarity(normalizedCategory, normalizedDbCategory);
            return similarity > 0.6;
        });

        return match;
    };

    // Helper function to calculate string similarity (Levenshtein distance based)
    const calculateStringSimilarity = (str1, str2) => {
        const len1 = str1.length;
        const len2 = str2.length;
        const matrix = Array(len2 + 1)
            .fill(null)
            .map(() => Array(len1 + 1).fill(null));

        for (let i = 0; i <= len1; i++) matrix[0][i] = i;
        for (let j = 0; j <= len2; j++) matrix[j][0] = j;

        for (let j = 1; j <= len2; j++) {
            for (let i = 1; i <= len1; i++) {
                const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(matrix[j][i - 1] + 1, matrix[j - 1][i] + 1, matrix[j - 1][i - 1] + cost);
            }
        }

        const maxLen = Math.max(len1, len2);
        return maxLen === 0 ? 1 : (maxLen - matrix[len2][len1]) / maxLen;
    };

    // Legacy function compatibility
    const normalizeSearchText = (text) => {
        return normalizeOCRSpaceText(text);
    };

    const generateSearchQueries = (text) => {
        return generateEnhancedSearchQueries(text);
    };

    const findMatchingAuthor = async (authorName) => {
        return await findMatchingAuthorEnhanced(authorName);
    };

    const findMatchingCategory = async (categoryName) => {
        return await findMatchingCategoryEnhanced(categoryName);
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
        setIsAISearch(false);
        setAiSearchInfo(null);
        setAiSearchResults({
            bookTitleResults: [],
            authorResults: [],
            categoryResults: [],
            currentSearchType: null,
        });

        // Clear URL params
        router.push('/search');
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

    // Updated function to handle book pricing based on is_physical
    const renderBookPrice = (book) => {
        // If is_physical === 0, show "Miễn phí" in green
        if (book.is_physical === 0) {
            return (
                <div className={styles.priceContainer}>
                    <span className={styles.freePrice} style={{ color: '#52c41a', fontWeight: 'bold' }}>
                        Miễn phí
                    </span>
                </div>
            );
        }

        // If is_physical === 1, show normal pricing
        return (
            <div className={styles.priceContainer}>
                <span className={styles.currentPrice}>{formatPrice(book.price)}</span>
                {book.original_price && book.original_price > book.price && (
                    <>
                        <span className={styles.originalPrice}>{formatPrice(book.original_price)}</span>
                        <span className={styles.discountPrice}>
                            -{Math.round(((book.original_price - book.price) / book.original_price) * 100)}%
                        </span>
                    </>
                )}
            </div>
        );
    };

    const handleBookClick = (bookId) => {
        router.push(`/book/${bookId}`);
    };

    const renderAISearchAlert = () => {
        if (!isAISearch || !aiSearchInfo) return null;

        let searchTypeText = '';
        let searchValue = '';

        if (aiSearchResults.currentSearchType === 'title') {
            searchTypeText = '📖 Tìm theo tên sách';
            searchValue = aiSearchInfo.bookTitle;
        } else if (aiSearchResults.currentSearchType === 'author') {
            searchTypeText = '👤 Tìm theo tác giả';
            searchValue = aiSearchInfo.author;
        } else if (aiSearchResults.currentSearchType === 'category') {
            searchTypeText = '📚 Tìm theo thể loại';
            searchValue = aiSearchInfo.category;
        } else {
            searchTypeText = '🤖 AI phân tích';
            searchValue = aiSearchInfo.bookTitle || aiSearchInfo.author || aiSearchInfo.category;
        }

        return (
            <Alert
                message={
                    <Space>
                        <RobotOutlined style={{ color: '#1890ff' }} />
                        <span>
                            Kết quả tìm kiếm bằng AI OCR.space ({searchTypeText}):
                            <strong style={{ marginLeft: 4 }}>{searchValue}</strong>
                        </span>
                    </Space>
                }
                type="info"
                showIcon={false}
                style={{ marginBottom: 16 }}
                closable
                onClose={() => {
                    setIsAISearch(false);
                    setAiSearchInfo(null);
                    setAiSearchResults({
                        bookTitleResults: [],
                        authorResults: [],
                        categoryResults: [],
                        currentSearchType: null,
                    });
                    router.push('/search');
                }}
            />
        );
    };

    const getSearchTitle = () => {
        if (isAISearch && aiSearchInfo) {
            if (aiSearchResults.currentSearchType === 'title') {
                return `AI OCR.space tìm thấy sách: "${aiSearchInfo.bookTitle}"`;
            } else if (aiSearchResults.currentSearchType === 'author') {
                return `Sách của tác giả: "${aiSearchInfo.author}"`;
            } else if (aiSearchResults.currentSearchType === 'category') {
                return `Thể loại: "${aiSearchInfo.category}"`;
            } else {
                return 'AI OCR.space đang phân tích...';
            }
        }

        if (filters.name) {
            return `Kết quả tìm kiếm: "${filters.name}"`;
        }

        return 'Tất cả sách';
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
                                    <Option value="ebook">Ebook</Option>
                                    <Option value="physical">Sách giấy</Option>
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
                        {/* AI Search Alert */}
                        {renderAISearchAlert()}

                        <div className={styles.searchHeader}>
                            <div className={styles.searchInfo}>
                                <div className={styles.sectionTitle}>
                                    <Title level={2}>{getSearchTitle()}</Title>
                                </div>
                                {pagination.total && (
                                    <Text type="secondary">
                                        Tìm thấy {pagination.total} kết quả
                                        {isAISearch && (
                                            <Tag color="blue" style={{ marginLeft: 8 }}>
                                                OCR.space{' '}
                                                {aiSearchResults.currentSearchType === 'title'
                                                    ? 'Tên sách'
                                                    : aiSearchResults.currentSearchType === 'author'
                                                    ? 'Tác giả'
                                                    : aiSearchResults.currentSearchType === 'category'
                                                    ? 'Thể loại'
                                                    : 'Phân tích'}
                                            </Tag>
                                        )}
                                    </Text>
                                )}
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
                            filters.available ||
                            isAISearch) && (
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
                                {isAISearch && (
                                    <Tag color="blue" closable onClose={() => router.push('/search')}>
                                        OCR.space AI:{' '}
                                        {aiSearchInfo?.bookTitle || aiSearchInfo?.author || aiSearchInfo?.category}
                                    </Tag>
                                )}
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
                                            <Card
                                                className={styles.bookCard}
                                                onClick={() => handleBookClick(book.id)}
                                                style={{
                                                    height: '100%',
                                                    borderRadius: '12px',
                                                    overflow: 'hidden',
                                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                                    transition: 'all 0.3s ease',
                                                    cursor: 'pointer',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
                                                    const actions =
                                                        e.currentTarget.querySelector('[data-book-actions]');
                                                    if (actions) actions.style.opacity = '1';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                                                    const actions =
                                                        e.currentTarget.querySelector('[data-book-actions]');
                                                    if (actions) actions.style.opacity = '0';
                                                }}
                                            >
                                                {/* Enhanced Image Container với khung hình ảnh bên trong */}
                                                <div
                                                    className={styles.bookImageContainer}
                                                    style={{
                                                        position: 'relative',
                                                        width: '100%',
                                                        height: '280px',
                                                   
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        padding: '12px',
                                                    }}
                                                >
                                                    {/* Khung hình ảnh bên trong - THÊM MỚI */}
                                                    <div
                                                        style={{
                                                            width: '200px',
                                                            height: '260px',
                                                            border: '3px solid #ffffff',
                                                            borderRadius: '6px',
                                                            overflow: 'hidden',
                                                            background: '#ffffff',
                                                            boxShadow:
                                                                '0 4px 12px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
                                                            position: 'relative',
                                                        }}
                                                    >
                                                        <img
                                                            src={
                                                                book.cover_image ||
                                                                book.thumb ||
                                                                'https://via.placeholder.com/300x400?text=No+Image'
                                                            }
                                                            alt={book.title}
                                                            className={styles.bookImage}
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover',
                                                                objectPosition: 'center',
                                                                transition: 'transform 0.3s ease',
                                                            }}
                                                            onError={(e) => {
                                                                e.target.src =
                                                                    'https://via.placeholder.com/300x400?text=No+Image';
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.target.style.transform = 'scale(1.05)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.target.style.transform = 'scale(1)';
                                                            }}
                                                        />

                                                        {/* Overlay effects */}
                                                        <div
                                                            style={{
                                                                position: 'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                right: 0,
                                                                bottom: 0,
                                                                background:
                                                                    'linear-gradient(135deg, rgba(0,0,0,0.05) 0%, transparent 50%)',
                                                                pointerEvents: 'none',
                                                            }}
                                                        ></div>
                                                    </div>

                                                    {/* Badges và overlays - position absolute so với bookImageContainer */}
                                                    {book.discount_percent && book.is_physical === 1 && (
                                                        <div
                                                            className={styles.discountBadge}
                                                            style={{
                                                                position: 'absolute',
                                                                top: '10px',
                                                                left: '10px',
                                                                background: '#ff4d4f',
                                                                color: 'white',
                                                                padding: '4px 8px',
                                                                borderRadius: '4px',
                                                                fontSize: '12px',
                                                                fontWeight: 'bold',
                                                                zIndex: 10,
                                                            }}
                                                        >
                                                            -{Math.round(book.discount_percent)}%
                                                        </div>
                                                    )}

                                                    {book.is_physical === 0 && (
                                                        <div
                                                            className={styles.freeBadge}
                                                            style={{
                                                                position: 'absolute',
                                                                top: '10px',
                                                                right: '10px',
                                                                backgroundColor: '#52c41a',
                                                                color: 'white',
                                                                padding: '4px 8px',
                                                                borderRadius: '4px',
                                                                fontSize: '12px',
                                                                fontWeight: 'bold',
                                                                zIndex: 10,
                                                            }}
                                                        >
                                                            MIỄN PHÍ
                                                        </div>
                                                    )}

                                                    {book.stock === 0 && book.is_physical === 1 && (
                                                        <div
                                                            className={styles.outOfStockOverlay}
                                                            style={{
                                                                position: 'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                right: 0,
                                                                bottom: 0,
                                                                background: 'rgba(0, 0, 0, 0.7)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: 'white',
                                                                fontSize: '16px',
                                                                fontWeight: 'bold',
                                                                zIndex: 10,
                                                            }}
                                                        >
                                                            <span>Hết hàng</span>
                                                        </div>
                                                    )}

                                                    {/* Book Actions */}
                                                    <div
                                                        data-book-actions
                                                        className={styles.bookActions}
                                                        style={{
                                                            position: 'absolute',
                                                            bottom: '10px',
                                                            right: '10px',
                                                            opacity: 0,
                                                            transition: 'opacity 0.3s ease',
                                                            zIndex: 10,
                                                        }}
                                                    >
                                                        <Button
                                                            type="text"
                                                            icon={<ShoppingCartOutlined />}
                                                            className={styles.cartBtn}
                                                            style={{
                                                                background: 'rgba(255, 255, 255, 0.9)',
                                                                border: '1px solid #d9d9d9',
                                                                borderRadius: '50%',
                                                                width: '40px',
                                                                height: '40px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                            }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                // Handle add to cart
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div
                                                    className={styles.bookInfo}
                                                    style={{
                                                        padding: '16px',
                                                    }}
                                                >
                                                    <h3
                                                        className={styles.bookTitle}
                                                        style={{
                                                            fontSize: '16px',
                                                            fontWeight: 600,
                                                            margin: '0 0 8px 0',
                                                            lineHeight: '1.4',
                                                            color: '#262626',
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                        }}
                                                    >
                                                        {book.title}
                                                    </h3>
                                                    <span
                                                        className={styles.bookAuthor}
                                                        style={{
                                                            color: '#8c8c8c',
                                                            fontSize: '14px',
                                                            marginBottom: '12px',
                                                            display: 'block',
                                                        }}
                                                    >
                                                        {book.author?.name}
                                                    </span>

                                                    {/* Price rendering */}
                                                    <div style={{ margin: '12px 0' }}>{renderBookPrice(book)}</div>

                                                    <div className={styles.bookMeta} style={{ marginTop: '12px' }}>
                                                        <Tag color="blue">{book.category?.name}</Tag>
                                                        {book.type && (
                                                            <Tag color="green">
                                                                {book.type === 'ebook' ? 'Ebook' : 'Sách giấy'}
                                                            </Tag>
                                                        )}
                                                        {book.is_physical === 0 && <Tag color="lime">Miễn phí</Tag>}
                                                        {isAISearch && (
                                                            <Tag color="purple" size="small">
                                                                OCR.space AI
                                                            </Tag>
                                                        )}
                                                    </div>
                                                </div>
                                            </Card>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <Empty
                                    description={
                                        isAISearch
                                            ? `OCR.space AI không tìm thấy sách phù hợp với "${
                                                  aiSearchInfo?.bookTitle ||
                                                  aiSearchInfo?.author ||
                                                  aiSearchInfo?.category
                                              }". Thử điều chỉnh bộ lọc hoặc tìm kiếm bằng từ khóa khác.`
                                            : 'Không tìm thấy sách nào'
                                    }
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                />
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
