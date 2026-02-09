// ============================================
// 1. UPDATED HEADER COMPONENT (Header.js)
// ============================================

'use client';
import {
    BellOutlined,
    BookOutlined,
    CameraOutlined,
    HomeOutlined,
    LogoutOutlined,
    MenuOutlined,
    SearchOutlined,
    ShopOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    VideoCameraOutlined,
} from '@ant-design/icons';
import { Avatar, Badge, Button, Divider, Drawer, Dropdown, Input, Space, Tooltip, Upload, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { apiGetMe } from '../../../../apis/user';
import useCategories from '../../hooks/useCategories';
import './Header.css';

const Header = () => {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [user, setUser] = useState(null);
    const [scrolled, setScrolled] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const { categories, isLoading: loadingCategories } = useCategories();

    // AI Search states
    const canvasRef = useRef();

    const navItems = [
        {
            label: 'Trang chủ',
            path: '/',
            icon: <HomeOutlined />,
            color: '#1890ff',
        },
        {
            label: 'Giới thiệu',
            path: '/About',
            icon: <VideoCameraOutlined />,
            color: '#13c2c2',
        },
        {
            label: 'Sách đọc',
            path: '/search?type=ebook&sort=popular&page=1&limit=12',
            icon: <BookOutlined />,
            color: '#52c41a',
        },
        {
            label: 'Sách bán',
            path: '/search?type=paper&sort=popular&page=1&limit=12',
            icon: <ShoppingCartOutlined />,
            color: '#fa8c16',
        },
        {
            label: 'Bộ lọc',
            path: '/search',
            icon: <SearchOutlined />,
            color: '#722ed1',
        },
        {
            label: 'Bài viết',
            path: '/blog',
            icon: <ShopOutlined />,
            color: '#eb2f96',
        },
    ];

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // 🔥 UPDATED: Fetch cart count từ API count với debug
    const fetchCartCount = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                console.log('🔄 Header: Fetching cart count...');

                const response = await fetch('https://smartbook-backend.tranminhdang.cloud/api/cart/count', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();
                console.log('📊 Header: Cart count response:', data);

                if (data && data.data && data.data.count !== undefined) {
                    const newCount = data.data.count;
                    setCartCount(newCount);
                    console.log('✅ Header: Cart count updated to:', newCount);
                } else {
                    console.log('⚠️ Header: Invalid cart count response format');
                }
            } catch (error) {
                console.error('❌ Header: Error fetching cart count:', error);
            }
        } else {
            console.log('⚠️ Header: No token found, setting cart count to 0');
            setCartCount(0);
        }
    };

    // ✅ Fetch user info function
    const fetchUserInfo = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await apiGetMe(token);
                if (response?.status === true) {
                    setUser(response?.user);
                    console.log('✅ Header: User info updated:', response?.user);
                }
            } catch (error) {
                console.error('Error getting user info:', error);
            }
        }
    };

    // 🔥 UPDATED: Tạo function để update cart count từ component khác với debug
    const updateCartCount = async () => {
        console.log('🔄 Header: updateCartCount called');
        await fetchCartCount();
    };

    // 🔥 UPDATED: Expose updateCartCount function globally với debug
    useEffect(() => {
        console.log('🔧 Header: Setting up global updateCartCount function');
        window.updateCartCount = updateCartCount;

        return () => {
            console.log('🔧 Header: Cleaning up global updateCartCount function');
            delete window.updateCartCount;
        };
    }, []);

    useEffect(() => {
        // Initial load
        fetchUserInfo();

        const token = localStorage.getItem('token');
        if (token) {
            fetchCartCount();
        }
    }, []);

    // 🔥 UPDATED: Enhanced event listeners với debug
    useEffect(() => {
        const handleUserDataUpdate = (event) => {
            console.log('🔄 Header received user data update event:', event.detail);
            if (event.detail?.user) {
                setUser(event.detail.user);
            } else {
                fetchUserInfo();
            }
        };

        const handleCartUpdate = () => {
            console.log('🔄 Header received cart update event');
            fetchCartCount();
        };

        // 🔥 NEW: Optimistic cart update
        const handleOptimisticCartUpdate = (event) => {
            console.log('🚀 Header: Optimistic cart update:', event.detail);
            if (event.detail?.increment) {
                setCartCount((prev) => {
                    const newCount = prev + event.detail.increment;
                    console.log(`🚀 Optimistic: ${prev} + ${event.detail.increment} = ${newCount}`);
                    return newCount;
                });
            }
        };

        // 🔥 NEW: Rollback optimistic update
        const handleRollbackCartUpdate = (event) => {
            console.log('↩️ Header: Rollback cart update:', event.detail);
            if (event.detail?.decrement) {
                setCartCount((prev) => {
                    const newCount = Math.max(0, prev - event.detail.decrement);
                    console.log(`↩️ Rollback: ${prev} - ${event.detail.decrement} = ${newCount}`);
                    return newCount;
                });
            }
        };

        // 🔥 NEW: Direct cart count update
        const handleDirectCartUpdate = (event) => {
            console.log('🎯 Header: Direct cart update:', event.detail);
            if (event.detail?.count !== undefined) {
                setCartCount(event.detail.count);
                console.log('🎯 Direct update to:', event.detail.count);
            }
        };

        // 🔥 NEW: Realtime cart update (WebSocket/SSE)
        const handleRealtimeCartUpdate = (event) => {
            console.log('📡 Header: Realtime cart update:', event.detail);
            if (event.detail?.count !== undefined) {
                setCartCount(event.detail.count);
                console.log('📡 Realtime update to:', event.detail.count);
            }
        };

        // 🔥 NEW: Verify cart count với server
        const handleVerifyCartCount = async () => {
            console.log('✅ Header: Verifying cart count with server...');
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const response = await fetch('https://smartbook-backend.tranminhdang.cloud/api/cart/count', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();

                if (data?.data?.count !== undefined) {
                    const serverCount = data.data.count;
                    setCartCount((prev) => {
                        if (prev !== serverCount) {
                            console.log(`✅ Sync: Local ${prev} → Server ${serverCount}`);
                            return serverCount;
                        }
                        console.log(`✅ Sync: Already correct (${prev})`);
                        return prev;
                    });
                }
            } catch (error) {
                console.error('❌ Error verifying cart count:', error);
            }
        };

        // Legacy events
        const handleCartCountUpdated = (event) => {
            console.log('🔄 Header received cart count updated:', event.detail);
            if (event.detail?.count !== undefined) {
                setCartCount(event.detail.count);
            }
        };

        const handleForceCartUpdate = (event) => {
            console.log('🔄 Header received force cart update:', event.detail);
            if (event.detail?.count !== undefined) {
                setCartCount(event.detail.count);
            } else {
                fetchCartCount();
            }
        };

        // 🔥 ADD ALL EVENT LISTENERS
        window.addEventListener('userDataUpdated', handleUserDataUpdate);
        window.addEventListener('cartUpdated', handleCartUpdate);

        // New optimistic events
        window.addEventListener('optimisticCartUpdate', handleOptimisticCartUpdate);
        window.addEventListener('rollbackCartUpdate', handleRollbackCartUpdate);
        window.addEventListener('directCartUpdate', handleDirectCartUpdate);
        window.addEventListener('realtimeCartUpdate', handleRealtimeCartUpdate);
        window.addEventListener('verifyCartCount', handleVerifyCartCount);

        // Legacy events (keep for compatibility)
        window.addEventListener('cartCountUpdated', handleCartCountUpdated);
        window.addEventListener('forceCartUpdate', handleForceCartUpdate);

        console.log('🔧 Header: All event listeners setup complete');

        return () => {
            // Remove all event listeners
            window.removeEventListener('userDataUpdated', handleUserDataUpdate);
            window.removeEventListener('cartUpdated', handleCartUpdate);
            window.removeEventListener('optimisticCartUpdate', handleOptimisticCartUpdate);
            window.removeEventListener('rollbackCartUpdate', handleRollbackCartUpdate);
            window.removeEventListener('directCartUpdate', handleDirectCartUpdate);
            window.removeEventListener('realtimeCartUpdate', handleRealtimeCartUpdate);
            window.removeEventListener('verifyCartCount', handleVerifyCartCount);
            window.removeEventListener('cartCountUpdated', handleCartCountUpdated);
            window.removeEventListener('forceCartUpdate', handleForceCartUpdate);

            console.log('🔧 Header: All event listeners cleaned up');
        };
    }, []);

    const handleNav = (path) => {
        setOpen(false);
        router.push(path);
    };

    const handleSearch = () => {
        if (search.trim() !== '') {
            router.push(`/search?keyword=${encodeURIComponent(search.trim())}`);
            setSearch('');
        }
    };

    const handleSearchInputChange = (e) => {
        setSearch(e.target.value);
    };

    const handleSearchKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setCartCount(0);
        router.push('/login');
    };

    // ===== AI IMAGE ANALYSIS WITH OCR.SPACE API =====
    const handleImageAnalysis = async (file) => {
        try {
            message.loading('AI đang phân tích ảnh với OCR.space...', 0);

            // Phân tích ảnh để extract thông tin
            const analysisResult = await analyzeBookImage(file);

            if (analysisResult && (analysisResult.bookTitle || analysisResult.author || analysisResult.category)) {
                message.destroy();

                // Tạo params để truyền sang search page
                const searchParams = new URLSearchParams();
                searchParams.set('ai_search', 'true');

                if (analysisResult.bookTitle) {
                    searchParams.set('ai_book_title', analysisResult.bookTitle);
                }
                if (analysisResult.author) {
                    searchParams.set('ai_author', analysisResult.author);
                }
                if (analysisResult.category) {
                    searchParams.set('ai_category', analysisResult.category);
                }

                const displayText = analysisResult.bookTitle || analysisResult.author || analysisResult.category;
                message.success(`AI phân tích: "${displayText}"`);
                router.push(`/search?${searchParams.toString()}`);
            } else {
                message.destroy();
                message.warning('Không thể phân tích được ảnh này. Vui lòng thử ảnh khác.');
            }
        } catch (error) {
            message.destroy();
            message.error('Phân tích thất bại: ' + error.message);
        }

        return false; // Prevent upload
    };

    // Phân tích ảnh để extract book info
    const analyzeBookImage = async (imageFile) => {
        try {
            // 1. Thử OCR để đọc text từ ảnh với OCR.space
            let extractedText = '';
            try {
                extractedText = await performOCR(imageFile);
            } catch (ocrError) {
                console.log('OCR failed, using visual analysis only:', ocrError.message);
            }

            // 2. Phân tích visual features
            const visualFeatures = await analyzeVisualFeatures(imageFile);

            // 3. Combine OCR và visual analysis để extract thông tin
            const bookInfo = extractBookInfo(extractedText, visualFeatures);

            return bookInfo;
        } catch (error) {
            console.error('Book image analysis failed:', error);
            return null;
        }
    };

    // ===== OCR.SPACE API IMPLEMENTATION - THAY THẾ GOOGLE VISION =====
    const performOCR = async (imageFile) => {
        try {
            console.log('🔍 Starting OCR.space analysis...');

            // Validate và compress file nếu cần
            let processedFile = imageFile;
            if (imageFile.size > 1024 * 1024) {
                // 1MB limit for better performance
                console.log('📦 Compressing image...');
                processedFile = await compressImage(imageFile, 0.8);
            }

            // Prepare form data for OCR.space API
            const formData = new FormData();
            formData.append('file', processedFile);
            formData.append('language', 'vie'); // Vietnamese language
            formData.append('isOverlayRequired', 'false');
            formData.append('detectOrientation', 'true');
            formData.append('isCreateSearchablePdf', 'false');
            formData.append('isSearchablePdfHideTextLayer', 'false');
            formData.append('scale', 'true'); // Auto-scale for better OCR
            formData.append('isTable', 'false');
            formData.append('OCREngine', '2'); // Engine 2 supports more languages
            formData.append('apikey', 'helloworld'); // Free API key

            // Call OCR.space API
            const response = await fetch('https://api.ocr.space/parse/image', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`OCR.space API error: ${response.status} - ${response.statusText}`);
            }

            const result = await response.json();
            console.log('📋 OCR.space response:', result);

            // Parse OCR result
            if (result && result.ParsedResults && result.ParsedResults.length > 0) {
                const parsedResult = result.ParsedResults[0];

                if (parsedResult.ParsedText && parsedResult.ParsedText.trim()) {
                    const extractedText = parsedResult.ParsedText.trim();
                    console.log('✅ OCR.space extracted text:', extractedText);
                    return extractedText;
                } else if (parsedResult.ErrorMessage) {
                    console.error('❌ OCR.space error:', parsedResult.ErrorMessage);
                    throw new Error(`OCR processing failed: ${parsedResult.ErrorMessage}`);
                }
            }

            // Fallback: Try with different engine if first attempt fails
            if (!result.ParsedResults || result.ParsedResults.length === 0) {
                console.log('🔄 Retrying with OCR Engine 1...');
                return await performOCRFallback(processedFile);
            }

            console.log('⚠️ No text detected in image');
            return '';
        } catch (error) {
            console.error('❌ OCR.space OCR failed:', error);

            // Fallback to engine 1
            try {
                console.log('🔄 Attempting fallback OCR...');
                return await performOCRFallback(imageFile);
            } catch (fallbackError) {
                console.error('❌ Fallback OCR also failed:', fallbackError);
                throw new Error(`OCR processing failed: ${error.message}`);
            }
        }
    };

    // Fallback OCR với engine khác
    const performOCRFallback = async (imageFile) => {
        try {
            const formData = new FormData();
            formData.append('file', imageFile);
            formData.append('language', 'eng'); // Try English as fallback
            formData.append('isOverlayRequired', 'false');
            formData.append('detectOrientation', 'true');
            formData.append('OCREngine', '1'); // Try engine 1
            formData.append('apikey', 'helloworld');

            const response = await fetch('https://api.ocr.space/parse/image', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result && result.ParsedResults && result.ParsedResults.length > 0) {
                const parsedText = result.ParsedResults[0].ParsedText;
                if (parsedText && parsedText.trim()) {
                    console.log('✅ Fallback OCR successful:', parsedText.trim());
                    return parsedText.trim();
                }
            }

            return '';
        } catch (error) {
            console.error('Fallback OCR failed:', error);
            throw error;
        }
    };

    // Helper function để compress image
    const compressImage = (file, quality = 0.8) => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                // Calculate new dimensions (max 1200px width/height)
                const maxSize = 1200;
                let { width, height } = img;

                if (width > height) {
                    if (width > maxSize) {
                        height = (height * maxSize) / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width = (width * maxSize) / height;
                        height = maxSize;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        console.log(`📦 Compressed: ${file.size} → ${compressedFile.size} bytes`);
                        resolve(compressedFile);
                    },
                    'image/jpeg',
                    quality,
                );
            };

            img.src = URL.createObjectURL(file);
        });
    };

    // Helper function to convert file to base64 (kept for compatibility)
    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                // Remove data:image/xxx;base64, prefix
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    // Extract book information từ OCR text và visual features - FIXED VERSION
    const extractBookInfo = (ocrText, visualFeatures) => {
        const result = {};

        if (ocrText && ocrText.length > 3) {
            console.log('📝 Raw OCR text:', ocrText);

            // CLEAN OCR ERRORS FIRST
            const cleanedText = cleanOCRErrors(ocrText);
            console.log('🧹 Cleaned OCR text:', cleanedText);

            const lines = cleanedText
                .split('\n')
                .map((line) => line.trim())
                .filter((line) => line.length > 1);

            console.log('📝 Cleaned OCR lines:', lines);

            // STEP 1: DETECT AUTHOR FIRST (dễ nhận diện hơn)
            let foundAuthor = false;

            // Pattern: Vietnamese author names (2-3 words, proper case)
            for (const line of lines) {
                const words = line.split(' ').filter((w) => w.length > 1);

                // Check if looks like Vietnamese author name
                if (words.length >= 2 && words.length <= 3 && line.length > 4 && line.length < 30) {
                    // Common Vietnamese author name patterns
                    const vietnameseNamePattern =
                        /^[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂ][a-zàáâãèéêìíòóôõùúăđĩũơưăạảấầẩẫậắằẳẵặẹẻẽềềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵýỷỹ]+(\s[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂ][a-zàáâãèéêìíòóôõùúăđĩũơưăạảấầẩẫậắằẳẵặẹẻẽềềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵýỷỹ]*){1,2}$/;

                    // Check against known Vietnamese authors or pattern
                    const knownAuthors = ['NGUYỄN DU', 'HỒ CHÍ MINH', 'NAM CAO', 'XUÂN DIỆU', 'THẾ LỮ'];
                    const normalizedLine = normalizeVietnameseName(line);

                    if (
                        vietnameseNamePattern.test(line) ||
                        knownAuthors.some((author) => calculateNameSimilarity(normalizedLine, author) > 0.7)
                    ) {
                        result.author = normalizedLine;
                        foundAuthor = true;
                        console.log('🎯 Found author:', result.author);
                        break;
                    }
                }
            }

            // STEP 2: DETECT TITLE (loại bỏ line đã là author)
            const potentialTitles = [];

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];

                // Skip if this line is the author
                if (foundAuthor && result.author && calculateNameSimilarity(line, result.author) > 0.6) {
                    continue;
                }

                // Skip obvious non-title patterns
                if (line.match(/^\d+\s*(năm|nam|year)/i) || line.match(/^(trang|page|xuất bản)/i) || line.length < 3) {
                    continue;
                }

                // Pattern 1: Single line title
                if (line.length > 3 && line.length < 80) {
                    const hasUppercase = /[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂ]/.test(line);
                    if (hasUppercase) {
                        potentialTitles.push({
                            text: line,
                            score: line.length * 2 + (i < 3 ? 20 : 0) + (hasUppercase ? 30 : 0),
                            type: 'single',
                        });
                    }
                }

                // Pattern 2: Multi-line title (combine consecutive lines)
                if (i < lines.length - 1) {
                    const nextLine = lines[i + 1];

                    // Skip if next line is author
                    if (foundAuthor && result.author && calculateNameSimilarity(nextLine, result.author) > 0.6) {
                        continue;
                    }

                    if (line.length > 2 && nextLine.length > 2 && line.length < 50 && nextLine.length < 50) {
                        const combined = `${line} ${nextLine}`.trim();
                        const hasUppercase = /[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂ]/.test(combined);

                        if (hasUppercase && combined.length < 80) {
                            potentialTitles.push({
                                text: combined,
                                score: combined.length * 1.5 + (i < 2 ? 40 : 0) + (hasUppercase ? 20 : 0),
                                type: 'combined',
                            });
                        }
                    }
                }
            }

            // Select best title
            if (potentialTitles.length > 0) {
                potentialTitles.sort((a, b) => b.score - a.score);
                const bestTitle = potentialTitles[0];

                result.bookTitle = bestTitle.text
                    .replace(/[^\w\s\u00C0-\u024F\u1E00-\u1EFF]/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();

                console.log('🎯 Selected title:', result.bookTitle, 'Score:', bestTitle.score, 'Type:', bestTitle.type);
            }

            // STEP 3: If no author found yet, try pattern matching
            if (!foundAuthor) {
                const authorPatterns = [/(?:tác giả|author)[\s:]*(.+?)(?:\n|$)/gi];

                for (const pattern of authorPatterns) {
                    const matches = [...cleanedText.matchAll(pattern)];
                    if (matches.length > 0) {
                        const authorName = matches[0][1]?.trim();
                        if (authorName && authorName.length > 2 && authorName.length < 50) {
                            result.author = normalizeVietnameseName(authorName);
                            console.log('🎯 Found author (pattern):', result.author);
                            break;
                        }
                    }
                }
            }
        }

        // Phân tích category từ visual features
        if (visualFeatures && visualFeatures.category) {
            result.category = visualFeatures.category;
        }

        console.log('📚 Final extracted info:', result);
        return result;
    };

    // Clean common OCR errors
    const cleanOCRErrors = (text) => {
        return (
            text
                // Fix common OCR character errors
                .replace(/K!EU/gi, 'KIỀU')
                .replace(/K!eu/gi, 'Kiều')
                .replace(/NGUYÉN/gi, 'NGUYỄN')
                .replace(/Nguyén/gi, 'Nguyễn')
                .replace(/TRUYÉN/gi, 'TRUYỆN')
                .replace(/Truyén/gi, 'Truyện')
                .replace(/xuÅr/gi, 'xuất')
                .replace(/[!]/g, 'I')
                .replace(/[|]/g, 'I')
                .replace(/[0]/g, 'O')
                .replace(/[5]/g, 'S')
                .replace(/[1]/g, 'I')
                // Remove carriage returns
                .replace(/\r\n/g, '\n')
                .replace(/\r/g, '\n')
        );
    };

    // Normalize Vietnamese names
    const normalizeVietnameseName = (name) => {
        return name
            .trim()
            .replace(/\s+/g, ' ')
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    // Calculate name similarity
    const calculateNameSimilarity = (str1, str2) => {
        const s1 = str1.toLowerCase().replace(/\s+/g, '');
        const s2 = str2.toLowerCase().replace(/\s+/g, '');

        const longer = s1.length > s2.length ? s1 : s2;
        const shorter = s1.length > s2.length ? s2 : s1;

        if (longer.length === 0) return 1.0;

        const editDistance = levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    };

    // Levenshtein distance function
    const levenshteinDistance = (str1, str2) => {
        const matrix = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
                }
            }
        }

        return matrix[str2.length][str1.length];
    };

    const analyzeVisualFeatures = async (imageFile) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const features = extractImageFeatures(img);
                const categoryPrediction = classifyByFeatures(features);
                resolve(categoryPrediction);
            };
            img.src = URL.createObjectURL(imageFile);
        });
    };

    const extractImageFeatures = (img) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        canvas.width = 300;
        canvas.height = 400;
        ctx.drawImage(img, 0, 0, 300, 400);

        const imageData = ctx.getImageData(0, 0, 300, 400);
        const data = imageData.data;

        const features = {
            colorDistribution: analyzeColors(data),
            textDensity: calculateTextDensity(data, 300, 400),
            layoutComplexity: calculateLayoutComplexity(data, 300, 400),
            aspectRatio: img.width / img.height,
        };

        return features;
    };

    const analyzeColors = (data) => {
        const colors = { bright: 0, dark: 0, colorful: 0, monochrome: 0 };
        const totalPixels = data.length / 4;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i],
                g = data[i + 1],
                b = data[i + 2];
            const brightness = (r + g + b) / 3;
            const colorVariance = Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);

            if (brightness > 200) colors.bright++;
            else if (brightness < 60) colors.dark++;

            if (colorVariance > 100) colors.colorful++;
            else colors.monochrome++;
        }

        return {
            brightRatio: colors.bright / totalPixels,
            darkRatio: colors.dark / totalPixels,
            colorfulRatio: colors.colorful / totalPixels,
            monochromeRatio: colors.monochrome / totalPixels,
        };
    };

    const calculateTextDensity = (data, width, height) => {
        let edgeCount = 0;
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;
                const current = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                const right = (data[idx + 4] + data[idx + 5] + data[idx + 6]) / 3;
                if (Math.abs(current - right) > 30) edgeCount++;
            }
        }
        return edgeCount / (width * height);
    };

    const calculateLayoutComplexity = (data, width, height) => {
        let complexRegions = 0;
        for (let y = 0; y < height; y += 20) {
            for (let x = 0; x < width; x += 20) {
                const idx = (y * width + x) * 4;
                const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                if (brightness > 100 && brightness < 200) complexRegions++;
            }
        }
        return complexRegions / ((width * height) / 400);
    };

    const classifyByFeatures = (features) => {
        const scores = {
            'Tiểu thuyết': 0,
            'Truyện tranh': 0,
            'Giáo khoa': 0,
            'Kinh doanh': 0,
            'Thiếu nhi': 0,
            'Khoa học': 0,
            'Văn học': 0,
            'Lịch sử': 0,
        };

        // Truyện tranh/Manga detection
        if (features.colorDistribution.darkRatio > 0.3 && features.colorDistribution.monochromeRatio > 0.6) {
            scores['Truyện tranh'] += 0.4;
        }

        // Văn học/Tiểu thuyết detection
        if (features.colorDistribution.colorfulRatio > 0.4 && features.colorDistribution.brightRatio > 0.3) {
            scores['Tiểu thuyết'] += 0.4;
            scores['Văn học'] += 0.3;
        }

        // Textbook detection
        if (features.textDensity > 0.15 && features.colorDistribution.brightRatio > 0.6) {
            scores['Giáo khoa'] += 0.4;
            scores['Khoa học'] += 0.2;
        }

        // Business book detection
        if (features.layoutComplexity < 2 && features.colorDistribution.darkRatio > 0.4) {
            scores['Kinh doanh'] += 0.3;
        }

        // Children's book detection
        if (features.colorDistribution.colorfulRatio > 0.6 && features.colorDistribution.brightRatio > 0.5) {
            scores['Thiếu nhi'] += 0.4;
        }

        // Find best match
        const maxScore = Math.max(...Object.values(scores));
        const category = Object.keys(scores).find((key) => scores[key] === maxScore);

        return {
            category: category || 'Sách tổng hợp',
            confidence: maxScore || 0.3,
        };
    };

    const userMenu = {
        items: [
            {
                key: 'profile',
                icon: <UserOutlined />,
                label: <span onClick={() => router.push('/profile')}>Thông tin cá nhân</span>,
            },
            // {
            //     key: 'notifications',
            //     icon: <BellOutlined />,
            //     label: <span onClick={() => router.push('/notifications')}>Thông báo</span>,
            // },
            {
                type: 'divider',
            },
            {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: <span onClick={handleLogout}>Đăng xuất</span>,
                danger: true,
            },
        ],
    };

    return (
        <>
            <header className={`header ${scrolled ? 'header-scrolled' : ''}`}>
                <div className="header-container">
                    <div className="header-content">
                        {/* Logo Section */}
                        <div className="logo-section" onClick={() => router.push('/')}>
                            <div className="logo">
                                <BookOutlined className="logo-icon" />
                                <span className="logo-text">
                                    SmartBook<span className="logo-accent">★</span>
                                </span>
                            </div>
                        </div>

                        {/* Navigation Desktop */}
                        <nav className="navigation-desktop">
                            {navItems.map((item) => (
                                <Tooltip key={item.path} title={item.label} placement="bottom">
                                    <div
                                        className="nav-item"
                                        onClick={() => handleNav(item.path)}
                                        style={{ '--item-color': item.color }}
                                    >
                                        <span className="nav-icon">{item.icon}</span>
                                        <span className="nav-label">{item.label}</span>
                                    </div>
                                </Tooltip>
                            ))}

                            <Dropdown
                                trigger={['hover']}
                                placement="bottom"
                                dropdownRender={() => (
                                    <div className="dropdown-categories">
                                        {categories?.length > 0 ? (
                                            categories.map((cate) => (
                                                <div
                                                    key={cate.id}
                                                    className="dropdown-item"
                                                    onClick={() => handleNav(`/search?category=${cate.id}`)}
                                                >
                                                    {cate.name}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="dropdown-empty">Không có dữ liệu</div>
                                        )}
                                    </div>
                                )}
                            >
                                <div className="nav-item" style={{ '--item-color': '#13c2c2' }}>
                                    <span className="nav-icon">
                                        <ShopOutlined />
                                    </span>
                                    <span className="nav-label">Thể loại</span>
                                </div>
                            </Dropdown>
                        </nav>

                        {/* Search Bar */}
                        <div className="search-section">
                            <div className="search-wrapper">
                                <Input
                                    placeholder="Tìm sách theo tên, tác giả..."
                                    value={search}
                                    onChange={handleSearchInputChange}
                                    onPressEnter={handleSearchKeyPress}
                                    className="search-input"
                                    prefix={<SearchOutlined className="search-icon" />}
                                    suffix={
                                        <Space size="small">
                                            <Upload
                                                accept="image/*"
                                                showUploadList={false}
                                                beforeUpload={handleImageAnalysis}
                                            >
                                                <Tooltip title="Tìm bằng ảnh AI với OCR.space - Upload để tự động tìm sách">
                                                    <Button
                                                        type="text"
                                                        size="small"
                                                        icon={<CameraOutlined />}
                                                        className="ai-search-button"
                                                        style={{ color: '#1890ff' }}
                                                    />
                                                </Tooltip>
                                            </Upload>
                                            <Button
                                                type="text"
                                                size="small"
                                                onClick={handleSearch}
                                                className="search-button"
                                            >
                                                Tìm
                                            </Button>
                                        </Space>
                                    }
                                    allowClear
                                />
                            </div>
                        </div>

                        {/* Auth Section */}
                        <div className="auth-section">
                            {user ? (
                                <div className="user-section">
                                    <Badge count={cartCount} size="small" className="cart-badge">
                                        <Tooltip title="Giỏ hàng">
                                            <Button
                                                type="text"
                                                icon={<ShoppingCartOutlined />}
                                                className="cart-btn"
                                                onClick={() => router.push('/cart')}
                                            />
                                        </Tooltip>
                                    </Badge>

                                    {/* <Badge count={3} size="small" className="notification-badge">
                                        <Button
                                            type="text"
                                            icon={<BellOutlined />}
                                            className="notification-btn"
                                            onClick={() => router.push('/notifications')}
                                        />
                                    </Badge> */}

                                    <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
                                        <div className="user-profile">
                                            <Avatar
                                                icon={user?.avatar_url ? null : <UserOutlined />}
                                                src={user?.avatar_url || null}
                                                size="default"
                                                className="user-avatar"
                                            />
                                            <div className="user-info">
                                                <span className="user-name">{user?.name}</span>
                                                <span className="user-role">Thành viên</span>
                                            </div>
                                        </div>
                                    </Dropdown>
                                </div>
                            ) : (
                                <Space size="middle" className="auth-buttons">
                                    <Button
                                        type="text"
                                        onClick={() => router.push('/login?mode=register')}
                                        className="register-btn"
                                    >
                                        Đăng ký
                                    </Button>

                                    <Button type="primary" onClick={() => router.push('/login')} className="login-btn">
                                        Đăng nhập
                                    </Button>
                                </Space>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="mobile-menu">
                            <Button
                                type="text"
                                icon={<MenuOutlined />}
                                onClick={() => setOpen(true)}
                                className="hamburger-btn"
                            />
                        </div>
                    </div>
                </div>

                {/* Mobile Drawer */}
                <Drawer
                    title={
                        <div className="drawer-header">
                            <BookOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                            <span>SmartBook</span>
                        </div>
                    }
                    placement="left"
                    onClose={() => setOpen(false)}
                    open={open}
                    width={320}
                    className="mobile-drawer"
                >
                    <div className="drawer-content">
                        {/* Mobile Search */}
                        <div className="drawer-search">
                            <Input
                                placeholder="Tìm sách..."
                                value={search}
                                onChange={handleSearchInputChange}
                                onPressEnter={handleSearch}
                                prefix={<SearchOutlined />}
                                suffix={
                                    <Space size="small">
                                        <Upload
                                            accept="image/*"
                                            showUploadList={false}
                                            beforeUpload={handleImageAnalysis}
                                        >
                                            <Button type="link" size="small" icon={<CameraOutlined />} />
                                        </Upload>
                                        <Button type="link" size="small" onClick={handleSearch}>
                                            Tìm
                                        </Button>
                                    </Space>
                                }
                                allowClear
                            />
                        </div>

                        <Divider />

                        {/* Mobile Navigation */}
                        <div className="drawer-navigation">
                            {navItems.map((item) => (
                                <div
                                    key={item.path}
                                    onClick={() => handleNav(item.path)}
                                    className="drawer-nav-item"
                                    style={{ '--item-color': item.color }}
                                >
                                    <span className="drawer-nav-icon">{item.icon}</span>
                                    <span className="drawer-nav-label">{item.label}</span>
                                </div>
                            ))}

                            {user && (
                                <div
                                    onClick={() => handleNav('/cart')}
                                    className="drawer-nav-item"
                                    style={{ '--item-color': '#fa541c' }}
                                >
                                    <span className="drawer-nav-icon">
                                        <Badge count={cartCount} size="small">
                                            <ShoppingCartOutlined />
                                        </Badge>
                                    </span>
                                    <span className="drawer-nav-label">Giỏ hàng</span>
                                </div>
                            )}
                        </div>

                        <Divider />

                        {/* Mobile User Section */}
                        <div className="drawer-user-section">
                            {user ? (
                                <div className="drawer-user-logged">
                                    <div className="drawer-user-profile">
                                        <Avatar
                                            icon={user?.avatar_url ? null : <UserOutlined />}
                                            src={user?.avatar_url || null}
                                            size="large"
                                        />
                                        <div className="drawer-user-info">
                                            <div className="drawer-user-name">{user.name}</div>
                                            <div className="drawer-user-role">Thành viên</div>
                                        </div>
                                    </div>

                                    <div className="drawer-user-actions">
                                        <Button
                                            type="text"
                                            icon={<UserOutlined />}
                                            onClick={() => {
                                                setOpen(false);
                                                router.push('/profile');
                                            }}
                                            block
                                            className="drawer-action-btn"
                                        >
                                            Thông tin cá nhân
                                        </Button>
                                        <Button
                                            type="text"
                                            icon={<BellOutlined />}
                                            onClick={() => {
                                                setOpen(false);
                                                router.push('/notifications');
                                            }}
                                            block
                                            className="drawer-action-btn"
                                        >
                                            Thông báo
                                        </Button>
                                        <Button
                                            type="text"
                                            icon={<LogoutOutlined />}
                                            onClick={handleLogout}
                                            block
                                            danger
                                            className="drawer-action-btn logout-btn"
                                        >
                                            Đăng xuất
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="drawer-auth-section">
                                    <Button
                                        type="default"
                                        onClick={() => {
                                            setOpen(false);
                                            router.push('/register');
                                        }}
                                        block
                                        size="large"
                                        className="drawer-register-btn"
                                    >
                                        Đăng ký
                                    </Button>
                                    <Button
                                        type="primary"
                                        onClick={() => {
                                            setOpen(false);
                                            router.push('/login');
                                        }}
                                        block
                                        size="large"
                                        className="drawer-login-btn"
                                    >
                                        Đăng nhập
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </Drawer>
            </header>

            {/* Hidden canvas for image processing */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </>
    );
};

export default Header;
