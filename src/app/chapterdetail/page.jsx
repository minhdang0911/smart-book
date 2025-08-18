'use client';
import {
    Book,
    ChevronLeft,
    ChevronRight,
    Clock,
    FileText,
    FileType,
    Home,
    List,
    Loader,
    Menu,
    Pause,
    Play,
    RotateCcw,
    Settings,
    SkipBack,
    SkipForward,
    Square,
    Volume2,
    VolumeX,
    X,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import HTMLFlipBook from 'react-pageflip';

const PDFFlipbook = () => {
    const [chapterData, setChapterData] = useState(null);
    const [numPages, setNumPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [zoom, setZoom] = useState(1);
    const [pdfPages, setPdfPages] = useState([]);
    const [htmlContent, setHtmlContent] = useState('');
    const [contentType, setContentType] = useState('text');
    const [pdfDoc, setPdfDoc] = useState(null);
    const [bookId, setBookId] = useState(null);
    const [chapterId, setChapterId] = useState(null);
    const [pdfCache, setPdfCache] = useState({});
    const [showChapterModal, setShowChapterModal] = useState(false);
    const [allChapters, setAllChapters] = useState([]);
    const [loadingChapters, setLoadingChapters] = useState(false);
    const flipBookRef = useRef();

    // Text-to-Speech states
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [rate, setRate] = useState(1);
    const [pitch, setPitch] = useState(1);
    const [volume, setVolume] = useState(0.8);
    const [showTTSSettings, setShowTTSSettings] = useState(false);
    const [currentPosition, setCurrentPosition] = useState(0);
    const [totalChunks, setTotalChunks] = useState(0);

    const utteranceRef = useRef(null);
    const textChunks = useRef([]);
    const currentChunkIndex = useRef(0);

    // Enhanced responsive detection
    const [deviceType, setDeviceType] = useState('desktop');
    const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const checkDeviceType = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            setScreenSize({ width, height });

            if (width <= 480) {
                setDeviceType('mobile-small');
            } else if (width <= 768) {
                setDeviceType('mobile');
            } else if (width <= 1024) {
                setDeviceType('tablet');
            } else if (width <= 1200) {
                setDeviceType('desktop-small');
            } else {
                setDeviceType('desktop');
            }
        };

        checkDeviceType();
        window.addEventListener('resize', checkDeviceType);
        return () => window.removeEventListener('resize', checkDeviceType);
    }, []);

    // Load voices for Text-to-Speech
    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = speechSynthesis.getVoices();
            setVoices(availableVoices);

            // Tìm giọng tiếng Việt mặc định
            const vietnameseVoice = availableVoices.find(
                (voice) => voice.lang.includes('vi') || voice.name.includes('Vietnamese'),
            );
            setSelectedVoice(vietnameseVoice || availableVoices[0]);
        };

        loadVoices();
        speechSynthesis.addEventListener('voiceschanged', loadVoices);

        return () => {
            speechSynthesis.removeEventListener('voiceschanged', loadVoices);
            if (utteranceRef.current) {
                speechSynthesis.cancel();
            }
        };
    }, []);

    // Load PDF.js and get data from localStorage
    useEffect(() => {
        const loadPDFJS = async () => {
            // Get bookId and chapterId from localStorage
            const storedBookId = localStorage.getItem('currentBookId');
            const storedChapterId = localStorage.getItem('currentChapterId');

            if (!storedBookId || !storedChapterId) {
                console.error('BookId or ChapterId not found in localStorage');
                setLoading(false);
                return;
            }

            setBookId(storedBookId);
            setChapterId(storedChapterId);

            // Load PDF.js only if we need it
            if (typeof window !== 'undefined' && !window.pdfjsLib) {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
                script.onload = () => {
                    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
                        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                    fetchChapterData(storedBookId, storedChapterId);
                };
                document.head.appendChild(script);
            } else {
                fetchChapterData(storedBookId, storedChapterId);
            }
        };
        loadPDFJS();
    }, []);

    // Text-to-Speech functions
    const cleanContent = (htmlContent) => {
        const div = document.createElement('div');
        div.innerHTML = htmlContent;
        return div.textContent || div.innerText || '';
    };

    const splitTextIntoChunks = (text, maxLength = 200) => {
        const sentences = text.match(/[^\.!?]+[\.!?]+/g) || [text];
        const chunks = [];
        let currentChunk = '';

        sentences.forEach((sentence) => {
            if ((currentChunk + sentence).length <= maxLength) {
                currentChunk += sentence;
            } else {
                if (currentChunk) chunks.push(currentChunk.trim());
                currentChunk = sentence;
            }
        });

        if (currentChunk) chunks.push(currentChunk.trim());
        return chunks;
    };

    const speakChunk = () => {
        if (currentChunkIndex.current >= textChunks.current.length) {
            setIsPlaying(false);
            setIsPaused(false);
            setCurrentPosition(0);
            currentChunkIndex.current = 0;
            return;
        }

        const chunk = textChunks.current[currentChunkIndex.current];
        utteranceRef.current = new SpeechSynthesisUtterance(chunk);

        if (selectedVoice) {
            utteranceRef.current.voice = selectedVoice;
        }

        utteranceRef.current.rate = rate;
        utteranceRef.current.pitch = pitch;
        utteranceRef.current.volume = volume;
        utteranceRef.current.lang = 'vi-VN';

        utteranceRef.current.onend = () => {
            currentChunkIndex.current++;
            setCurrentPosition(currentChunkIndex.current);
            speakChunk();
        };

        utteranceRef.current.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            setIsPlaying(false);
            setIsPaused(false);
        };

        speechSynthesis.speak(utteranceRef.current);
    };

    const startSpeaking = () => {
        if (!htmlContent) return;

        const cleanText = cleanContent(htmlContent);
        textChunks.current = splitTextIntoChunks(cleanText);
        setTotalChunks(textChunks.current.length);
        currentChunkIndex.current = 0;
        setCurrentPosition(0);
        setIsPlaying(true);
        setIsPaused(false);

        speakChunk();
    };

    const pauseSpeaking = () => {
        speechSynthesis.pause();
        setIsPaused(true);
        setIsPlaying(false);
    };

    const resumeSpeaking = () => {
        speechSynthesis.resume();
        setIsPaused(false);
        setIsPlaying(true);
    };

    const stopSpeaking = () => {
        speechSynthesis.cancel();
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentPosition(0);
        currentChunkIndex.current = 0;
    };

    const skipForward = () => {
        if (currentChunkIndex.current < textChunks.current.length - 1) {
            speechSynthesis.cancel();
            currentChunkIndex.current++;
            setCurrentPosition(currentChunkIndex.current);
            if (isPlaying) {
                speakChunk();
            }
        }
    };

    const skipBackward = () => {
        if (currentChunkIndex.current > 0) {
            speechSynthesis.cancel();
            currentChunkIndex.current--;
            setCurrentPosition(currentChunkIndex.current);
            if (isPlaying) {
                speakChunk();
            }
        }
    };

    // Fetch chapter data
    const fetchChapterData = async (currentBookId, currentChapterId) => {
        try {
            setLoading(true);
            const response = await fetch(
                `https://smartbook.io.vn/api/admin/books/${currentBookId}/chapters/${currentChapterId}/detail`,
            );
            const data = await response.json();
            setChapterData(data);

            // Update localStorage with current chapter info
            localStorage.setItem('currentBookId', data.chapter.book_id.toString());
            localStorage.setItem('currentChapterId', data.chapter.id.toString());

            setBookId(data.chapter.book_id);
            setChapterId(data.chapter.id);

            // Determine content type and load accordingly
            if (data.chapter.content_type === 'pdf' && data.chapter.pdf_url) {
                setContentType('pdf');
                await loadPDF(data.chapter.pdf_url, data.chapter.id);
            } else if (data.chapter.content_type === 'text' && data.chapter.content) {
                setContentType('text');
                loadHTMLContent(data.chapter.content);
            } else {
                console.error('No valid content found');
                setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching chapter data:', error);
            setLoading(false);
        }
    };

    // Load HTML content for text-based chapters
    const loadHTMLContent = (content) => {
        setHtmlContent(content);
        setNumPages(1);
        setLoading(false);
        // Reset TTS state when content changes
        stopSpeaking();
    };

    // Load PDF with PDF.js and caching - Ensure odd first/last pages
    const loadPDF = async (pdfUrl, chapterIdForCache) => {
        try {
            // Check cache first
            const cacheKey = `${chapterIdForCache}_${pdfUrl}`;
            if (pdfCache[cacheKey]) {
                console.log('Using cached PDF pages for chapter:', chapterIdForCache);
                setPdfPages(pdfCache[cacheKey].pages);
                setNumPages(pdfCache[cacheKey].numPages);
                setLoading(false);
                return;
            }

            console.log('Loading PDF from URL:', pdfUrl);
            const loadingTask = window.pdfjsLib.getDocument(pdfUrl);
            const pdf = await loadingTask.promise;
            setPdfDoc(pdf);

            const originalNumPages = pdf.numPages;

            // Render all pages as images
            const pages = [];

            for (let i = 1; i <= originalNumPages; i++) {
                const pageImage = await renderPageToImage(pdf, i);
                pages.push({
                    pageNumber: i,
                    imageUrl: pageImage,
                    width: 600,
                    height: 800,
                    isBlank: false,
                });
            }

            // Ensure odd number of pages for proper book layout
            // If even number of pages, add a blank page at the end
            if (originalNumPages % 2 === 0) {
                pages.push({
                    pageNumber: originalNumPages + 1,
                    imageUrl: null,
                    width: 600,
                    height: 800,
                    isBlank: true,
                });
                setNumPages(originalNumPages + 1);
            } else {
                setNumPages(originalNumPages);
            }

            setPdfPages(pages);
            console.log('PDF Pages loaded:', pages.length, '(Original:', originalNumPages, ')');

            // Cache the pages
            setPdfCache((prev) => ({
                ...prev,
                [cacheKey]: {
                    pages,
                    numPages: pages.length,
                    originalNumPages,
                    timestamp: Date.now(),
                },
            }));

            setLoading(false);
        } catch (error) {
            console.error('Error loading PDF:', error);
            setLoading(false);
        }
    };

    // Render PDF page to image
    const renderPageToImage = async (pdf, pageNumber) => {
        try {
            const page = await pdf.getPage(pageNumber);
            const scale = deviceType.includes('mobile') ? 1.5 : 2; // Lower scale for mobile
            const viewport = page.getViewport({ scale });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
                canvasContext: context,
                viewport: viewport,
            };

            await page.render(renderContext).promise;
            return canvas.toDataURL('image/jpeg', deviceType.includes('mobile') ? 0.7 : 0.8);
        } catch (error) {
            console.error(`Error rendering page ${pageNumber}:`, error);
            return null;
        }
    };

    // Fetch all chapters for the book
    const fetchAllChapters = async (currentBookId) => {
        if (allChapters.length > 0) return; // Already loaded

        try {
            setLoadingChapters(true);
            const response = await fetch(`https://smartbook.io.vn/api/admin/books/${currentBookId}/chapters`);
            const data = await response.json();

            if (data.success) {
                // Calculate word count for each chapter
                const chaptersWithStats = data.chapters.map((chapter) => ({
                    ...chapter,
                    wordCount: chapter.display_content
                        ? chapter.display_content.replace(/<[^>]*>/g, '').trim().length
                        : 0,
                }));
                setAllChapters(chaptersWithStats);
            }
        } catch (error) {
            console.error('Error fetching chapters:', error);
        } finally {
            setLoadingChapters(false);
        }
    };

    // Navigate to specific chapter
    const navigateToChapter = async (chapterId) => {
        setShowChapterModal(false);
        setLoading(true);
        stopSpeaking(); // Stop TTS when navigating

        try {
            const response = await fetch(
                `https://smartbook.io.vn/api/admin/books/${bookId}/chapters/${chapterId}/detail`,
            );
            const data = await response.json();
            setChapterData(data);
            setCurrentPage(0);

            // Update localStorage
            localStorage.setItem('currentBookId', data.chapter.book_id.toString());
            localStorage.setItem('currentChapterId', data.chapter.id.toString());

            // Load content based on type
            if (data.chapter.content_type === 'pdf' && data.chapter.pdf_url) {
                setContentType('pdf');
                await loadPDF(data.chapter.pdf_url, data.chapter.id);
            } else if (data.chapter.content_type === 'text' && data.chapter.content) {
                setContentType('text');
                loadHTMLContent(data.chapter.content);
            }

            // Reset flipbook
            if (flipBookRef.current) {
                flipBookRef.current.flip(0);
            }
        } catch (error) {
            console.error('Error navigating to chapter:', error);
            setLoading(false);
        }
    };

    const nextPage = () => {
        if (flipBookRef.current && flipBookRef.current.pageFlip) {
            flipBookRef.current.pageFlip().flipNext();
        }
    };

    const prevPage = () => {
        if (flipBookRef.current && flipBookRef.current.pageFlip) {
            flipBookRef.current.pageFlip().flipPrev();
        }
    };

    const goToPage = (pageNum) => {
        if (contentType === 'text') return; // No pagination for text content

        const targetPDFPage = Math.max(1, Math.min(pageNum, numPages));

        // For flipbook navigation:
        // Page 1 -> flipbook index 0 (single page)
        // Page 2 -> flipbook index 1 (left side of spread)
        // Page 3 -> flipbook index 1 (right side of spread)
        // Page 4 -> flipbook index 2 (left side of spread)
        // etc.
        let flipBookPageIndex;
        if (targetPDFPage === 1) {
            flipBookPageIndex = 0; // First page is always single
        } else {
            flipBookPageIndex = Math.floor((targetPDFPage - 1) / 2) + (targetPDFPage % 2 === 0 ? 0 : 1);
        }

        if (flipBookRef.current && flipBookRef.current.pageFlip) {
            flipBookRef.current.pageFlip().flip(flipBookPageIndex);
        }
    };

    // Handle page flip events with proper book layout
    const onFlip = (e) => {
        if (contentType === 'text') return;

        const flipBookPageIndex = e.data;

        // Convert flipbook index back to actual page number
        let actualPDFPage;
        if (flipBookPageIndex === 0) {
            actualPDFPage = 1; // First page
        } else {
            // For spreads: each flipbook page after 0 represents 2 PDF pages
            actualPDFPage = (flipBookPageIndex - 1) * 2 + 2;
        }

        setCurrentPage(Math.min(actualPDFPage - 1, numPages - 1)); // Convert to 0-based for state
    };

    // Navigation functions for chapters
    const goToPreviousChapter = async () => {
        if (chapterData?.previous) {
            setLoading(true);
            stopSpeaking(); // Stop TTS when navigating
            try {
                const response = await fetch(
                    `https://smartbook.io.vn/api/admin/books/${chapterData.chapter.book_id}/chapters/${chapterData.previous.id}/detail`,
                );
                const data = await response.json();
                setChapterData(data);
                setCurrentPage(0);

                // Update localStorage
                localStorage.setItem('currentBookId', data.chapter.book_id.toString());
                localStorage.setItem('currentChapterId', data.chapter.id.toString());

                // Load content based on type
                if (data.chapter.content_type === 'pdf' && data.chapter.pdf_url) {
                    setContentType('pdf');
                    await loadPDF(data.chapter.pdf_url, data.chapter.id);
                } else if (data.chapter.content_type === 'text' && data.chapter.content) {
                    setContentType('text');
                    loadHTMLContent(data.chapter.content);
                }

                // Reset flipbook
                if (flipBookRef.current) {
                    flipBookRef.current.flip(0);
                }
            } catch (error) {
                console.error('Error loading previous chapter:', error);
                setLoading(false);
            }
        }
    };

    const goToNextChapter = async () => {
        if (chapterData?.next) {
            setLoading(true);
            stopSpeaking(); // Stop TTS when navigating
            try {
                const response = await fetch(
                    `https://smartbook.io.vn/api/admin/books/${chapterData.chapter.book_id}/chapters/${chapterData.next.id}/detail`,
                );
                const data = await response.json();
                setChapterData(data);
                setCurrentPage(0);

                // Update localStorage
                localStorage.setItem('currentBookId', data.chapter.book_id.toString());
                localStorage.setItem('currentChapterId', data.chapter.id.toString());

                // Load content based on type
                if (data.chapter.content_type === 'pdf' && data.chapter.pdf_url) {
                    setContentType('pdf');
                    await loadPDF(data.chapter.pdf_url, data.chapter.id);
                } else if (data.chapter.content_type === 'text' && data.chapter.content) {
                    setContentType('text');
                    loadHTMLContent(data.chapter.content);
                }

                // Reset flipbook
                if (flipBookRef.current) {
                    flipBookRef.current.flip(0);
                }
            } catch (error) {
                console.error('Error loading next chapter:', error);
                setLoading(false);
            }
        }
    };

    const zoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 3));
    const zoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.5));
    const resetZoom = () => setZoom(1);

    // Enhanced responsive dimensions
    const getFlipbookDimensions = () => {
        const { width: screenWidth, height: screenHeight } = screenSize;

        // Tính toán kích thước dựa trên screen và device type
        let width, height;

        switch (deviceType) {
            case 'mobile-small':
                width = Math.min(screenWidth - 20, 320);
                height = Math.min(screenHeight - 160, 420);
                break;
            case 'mobile':
                width = Math.min(screenWidth - 30, 380);
                height = Math.min(screenHeight - 180, 480);
                break;
            case 'tablet':
                width = Math.min(screenWidth - 60, 500);
                height = Math.min(screenHeight - 200, 650);
                break;
            case 'desktop-small':
                width = Math.min(screenWidth - 100, 600);
                height = Math.min(screenHeight - 220, 750);
                break;
            default: // desktop
                width = Math.min(screenWidth - 200, 800);
                height = Math.min(screenHeight - 250, 900);
        }

        // Đảm bảo tỷ lệ khung hình phù hợp
        const aspectRatio = 3 / 4; // 3:4 ratio for book pages
        if (width / height > aspectRatio) {
            width = height * aspectRatio;
        } else {
            height = width / aspectRatio;
        }

        return { width, height };
    };

    const dimensions = getFlipbookDimensions();
    const isMobile = deviceType.includes('mobile');
    const isTablet = deviceType === 'tablet';

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.loadingContent}>
                    <Loader style={styles.loadingIcon} />
                    <p style={styles.loadingText}>
                        {contentType === 'pdf' ? 'Đang tải PDF...' : 'Đang tải nội dung...'}
                    </p>
                    <div style={styles.progressContainer}>
                        <div style={styles.progressBar}></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={{ ...styles.header, ...(isMobile ? styles.headerMobile : {}) }}>
                <div style={styles.headerLeft}>
                    <div style={styles.bookInfo}>
                        <Book style={{ ...styles.bookIcon, ...(isMobile ? styles.iconMobile : {}) }} />
                        <div>
                            <h1 style={{ ...styles.bookTitle, ...(isMobile ? styles.titleMobile : {}) }}>
                                {chapterData?.chapter?.book?.title}
                            </h1>
                            <p style={{ ...styles.chapterTitle, ...(isMobile ? styles.subtitleMobile : {}) }}>
                                Chương {chapterData?.chapter?.title}
                                <span style={styles.contentType}>({contentType === 'pdf' ? 'PDF' : 'Văn bản'})</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div style={styles.headerRight}>
                    {!isMobile && (
                        <div style={styles.zoomControls}>
                            <button onClick={zoomOut} style={styles.controlButton} title="Thu nhỏ">
                                <ZoomOut style={styles.controlIcon} />
                            </button>
                            <span style={styles.zoomDisplay}>{Math.round(zoom * 100)}%</span>
                            <button onClick={zoomIn} style={styles.controlButton} title="Phóng to">
                                <ZoomIn style={styles.controlIcon} />
                            </button>
                            <button onClick={resetZoom} style={styles.controlButton} title="Reset">
                                <RotateCcw style={styles.controlIcon} />
                            </button>
                        </div>
                    )}

                    <button style={styles.headerButton} title="Trang chủ">
                        <Home style={styles.controlIcon} />
                    </button>
                    <button
                        style={{ ...styles.chapterListButton, ...(isMobile ? styles.buttonMobile : {}) }}
                        title="Danh sách chương"
                        onClick={() => {
                            setShowChapterModal(true);
                            fetchAllChapters(bookId);
                        }}
                    >
                        <List style={styles.controlIcon} />
                        {!isMobile && <span style={styles.buttonText}>Danh sách chương</span>}
                    </button>
                    <button style={styles.headerButton} title="Menu">
                        <Menu style={styles.controlIcon} />
                    </button>
                </div>
            </div>

            {/* Text-to-Speech Controls - chỉ hiện với content type text */}
            {contentType === 'text' && htmlContent && (
                <div style={{ ...styles.ttsContainer, ...(isMobile ? styles.ttsContainerMobile : {}) }}>
                    <div style={styles.ttsControls}>
                        <div style={styles.ttsMainControls}>
                            <button
                                onClick={skipBackward}
                                disabled={currentPosition <= 0}
                                style={{
                                    ...styles.ttsButton,
                                    ...(currentPosition <= 0 ? styles.ttsButtonDisabled : {}),
                                }}
                                title="Lùi lại"
                            >
                                <SkipBack style={styles.ttsIcon} />
                            </button>

                            {!isPlaying && !isPaused && (
                                <button
                                    onClick={startSpeaking}
                                    style={{ ...styles.ttsButton, ...styles.ttsPlayButton }}
                                    title="Phát"
                                >
                                    <Play style={styles.ttsIcon} />
                                </button>
                            )}

                            {isPlaying && (
                                <button
                                    onClick={pauseSpeaking}
                                    style={{ ...styles.ttsButton, ...styles.ttsPauseButton }}
                                    title="Tạm dừng"
                                >
                                    <Pause style={styles.ttsIcon} />
                                </button>
                            )}

                            {isPaused && (
                                <button
                                    onClick={resumeSpeaking}
                                    style={{ ...styles.ttsButton, ...styles.ttsPlayButton }}
                                    title="Tiếp tục"
                                >
                                    <Play style={styles.ttsIcon} />
                                </button>
                            )}

                            <button
                                onClick={stopSpeaking}
                                disabled={!isPlaying && !isPaused}
                                style={{
                                    ...styles.ttsButton,
                                    ...styles.ttsStopButton,
                                    ...(!isPlaying && !isPaused ? styles.ttsButtonDisabled : {}),
                                }}
                                title="Dừng"
                            >
                                <Square style={styles.ttsIcon} />
                            </button>

                            <button
                                onClick={skipForward}
                                disabled={currentPosition >= totalChunks - 1}
                                style={{
                                    ...styles.ttsButton,
                                    ...(currentPosition >= totalChunks - 1 ? styles.ttsButtonDisabled : {}),
                                }}
                                title="Tiến lên"
                            >
                                <SkipForward style={styles.ttsIcon} />
                            </button>
                        </div>

                        {!isMobile && (
                            <div style={styles.ttsProgress}>
                                <span style={styles.ttsProgressText}>
                                    {totalChunks > 0 ? `${currentPosition + 1}/${totalChunks}` : '0/0'}
                                </span>
                                <div style={styles.ttsProgressBar}>
                                    <div
                                        style={{
                                            ...styles.ttsProgressFill,
                                            width:
                                                totalChunks > 0
                                                    ? `${((currentPosition + 1) / totalChunks) * 100}%`
                                                    : '0%',
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        <div style={styles.ttsSettings}>
                            <button
                                onClick={() => setShowTTSSettings(!showTTSSettings)}
                                style={styles.ttsButton}
                                title="Cài đặt"
                            >
                                <Settings style={styles.ttsIcon} />
                            </button>

                            {volume > 0 ? (
                                <Volume2 style={styles.ttsVolumeIcon} />
                            ) : (
                                <VolumeX style={styles.ttsVolumeIcon} />
                            )}
                        </div>
                    </div>

                    {/* TTS Settings Panel */}
                    {showTTSSettings && (
                        <div style={styles.ttsSettingsPanel}>
                            <div style={styles.ttsSettingRow}>
                                <label style={styles.ttsLabel}>Giọng nói:</label>
                                <select
                                    value={selectedVoice?.name || ''}
                                    onChange={(e) => {
                                        const voice = voices.find((v) => v.name === e.target.value);
                                        setSelectedVoice(voice);
                                    }}
                                    style={styles.ttsSelect}
                                >
                                    {voices.map((voice) => (
                                        <option key={voice.name} value={voice.name}>
                                            {voice.name} ({voice.lang})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={styles.ttsSettingRow}>
                                <label style={styles.ttsLabel}>Tốc độ: {rate.toFixed(1)}x</label>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="2"
                                    step="0.1"
                                    value={rate}
                                    onChange={(e) => setRate(parseFloat(e.target.value))}
                                    style={styles.ttsSlider}
                                />
                            </div>

                            <div style={styles.ttsSettingRow}>
                                <label style={styles.ttsLabel}>Âm lượng: {Math.round(volume * 100)}%</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={volume}
                                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                                    style={styles.ttsSlider}
                                />
                            </div>

                            <div style={styles.ttsSettingRow}>
                                <label style={styles.ttsLabel}>Cao độ: {pitch.toFixed(1)}</label>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="2"
                                    step="0.1"
                                    value={pitch}
                                    onChange={(e) => setPitch(parseFloat(e.target.value))}
                                    style={styles.ttsSlider}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Main Content */}
            <div style={styles.mainContent}>
                {/* Background Pattern */}
                <div style={styles.backgroundPattern}>
                    <div style={styles.backgroundGradient}></div>
                </div>

                <div style={styles.contentWrapper}>
                    {/* Navigation Buttons - only show for PDF and desktop */}
                    {contentType === 'pdf' && !isMobile && (
                        <>
                            <button
                                onClick={prevPage}
                                disabled={currentPage <= 0}
                                style={{
                                    ...styles.navButton,
                                    ...styles.prevButton,
                                    ...(currentPage <= 0 ? styles.disabledButton : {}),
                                }}
                            >
                                <ChevronLeft style={styles.navIcon} />
                            </button>

                            <button
                                onClick={nextPage}
                                disabled={currentPage >= numPages - 1}
                                style={{
                                    ...styles.navButton,
                                    ...styles.nextButton,
                                    ...(currentPage >= numPages - 1 ? styles.disabledButton : {}),
                                }}
                            >
                                <ChevronRight style={styles.navIcon} />
                            </button>
                        </>
                    )}

                    {/* Content Container */}
                    <div
                        style={{
                            ...styles.flipbookWrapper,
                            transform: `scale(${isMobile ? 1 : zoom})`,
                        }}
                    >
                        {contentType === 'pdf' && pdfPages.length > 0 && (
                            <HTMLFlipBook
                                ref={flipBookRef}
                                width={dimensions.width}
                                height={dimensions.height}
                                size="fixed"
                                minWidth={isMobile ? 250 : 400}
                                maxWidth={isMobile ? 400 : 1200}
                                minHeight={isMobile ? 350 : 500}
                                maxHeight={isMobile ? 600 : 1400}
                                maxShadowOpacity={0.5}
                                showCover={false}
                                mobileScrollSupport={false}
                                onFlip={onFlip}
                                className="flipbook"
                                startPage={0}
                                drawShadow={!isMobile}
                                flippingTime={isMobile ? 600 : 800}
                                usePortrait={isMobile}
                                startZIndex={0}
                                autoSize={false}
                                clickEventForward={true}
                                useMouseEvents={!isMobile}
                                swipeDistance={isMobile ? 20 : 30}
                                showPageCorners={!isMobile}
                                disableFlipByClick={false}
                            >
                                {/* First page - always single (odd) */}
                                <div key="page-1" style={styles.page}>
                                    <div style={styles.pdfPageContent}>
                                        {pdfPages[0] && !pdfPages[0].isBlank ? (
                                            <>
                                                <img
                                                    src={pdfPages[0].imageUrl}
                                                    alt={`Trang ${pdfPages[0].pageNumber}`}
                                                    style={styles.pageImage}
                                                    loading="lazy"
                                                />
                                                <div style={styles.pageNumber}>{pdfPages[0].pageNumber}</div>
                                            </>
                                        ) : (
                                            <div style={styles.blankPageContent}>
                                                <p style={styles.blankText}>Trang trắng</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Generate paired pages (spreads) */}
                                {(() => {
                                    const spreads = [];
                                    for (let i = 1; i < pdfPages.length; i += 2) {
                                        const leftPage = pdfPages[i];
                                        const rightPage = pdfPages[i + 1];

                                        spreads.push(
                                            // Left page of spread
                                            <div key={`page-${leftPage?.pageNumber || i + 1}`} style={styles.page}>
                                                <div style={styles.pdfPageContent}>
                                                    {leftPage && !leftPage.isBlank ? (
                                                        <>
                                                            <img
                                                                src={leftPage.imageUrl}
                                                                alt={`Trang ${leftPage.pageNumber}`}
                                                                style={styles.pageImage}
                                                                loading="lazy"
                                                            />
                                                            <div style={styles.pageNumber}>{leftPage.pageNumber}</div>
                                                        </>
                                                    ) : (
                                                        <div style={styles.blankPageContent}>
                                                            <p style={styles.blankText}>Trang trắng</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>,
                                        );

                                        // Right page of spread (if exists)
                                        if (rightPage) {
                                            spreads.push(
                                                <div key={`page-${rightPage?.pageNumber || i + 2}`} style={styles.page}>
                                                    <div style={styles.pdfPageContent}>
                                                        {!rightPage.isBlank ? (
                                                            <>
                                                                <img
                                                                    src={rightPage.imageUrl}
                                                                    alt={`Trang ${rightPage.pageNumber}`}
                                                                    style={styles.pageImage}
                                                                    loading="lazy"
                                                                />
                                                                <div style={styles.pageNumber}>
                                                                    {rightPage.pageNumber}
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div style={styles.blankPageContent}>
                                                                <p style={styles.blankText}>Trang trắng</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>,
                                            );
                                        }
                                    }
                                    return spreads;
                                })()}
                            </HTMLFlipBook>
                        )}

                        {contentType === 'text' && htmlContent && (
                            <div
                                style={{
                                    ...styles.textContentContainer,
                                    ...(isMobile ? styles.textContentMobile : {}),
                                    width: dimensions.width,
                                    height: dimensions.height,
                                }}
                            >
                                <div style={styles.textPage}>
                                    <div style={styles.textHeader}>
                                        <FileText style={styles.textIcon} />
                                        <h2 style={styles.textTitle}>Chương {chapterData?.chapter?.title}</h2>
                                    </div>
                                    <div style={styles.textContent} dangerouslySetInnerHTML={{ __html: htmlContent }} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{ ...styles.footer, ...(isMobile ? styles.footerMobile : {}) }}>
                <div style={styles.footerContent}>
                    <div style={styles.footerInfo}>
                        <span style={styles.authorName}>{chapterData?.chapter?.book?.author?.name}</span>
                        {!isMobile && <span style={styles.separator}>•</span>}
                        {!isMobile && <span>{chapterData?.chapter?.book?.title}</span>}
                    </div>

                    {/* Page Navigation - only for PDF */}
                    {contentType === 'pdf' && (
                        <div style={{ ...styles.pageNavigation, ...(isMobile ? styles.pageNavigationMobile : {}) }}>
                            <div style={styles.pageInputGroup}>
                                <span style={styles.pageLabel}>Trang:</span>
                                <div style={styles.pageInputContainer}>
                                    <input
                                        type="number"
                                        min="1"
                                        max={numPages}
                                        value={currentPage + 1}
                                        onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
                                        style={styles.pageInput}
                                    />
                                    <span style={styles.pageLabel}>/ {numPages}</span>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            {!isMobile && (
                                <div style={styles.progressGroup}>
                                    <span style={styles.pageLabel}>Tiến độ:</span>
                                    <div style={styles.progressBarContainer}>
                                        <div
                                            style={{
                                                ...styles.progressBarFill,
                                                width: `${((currentPage + 1) / numPages) * 100}%`,
                                            }}
                                        />
                                    </div>
                                    <span style={styles.pageLabel}>
                                        {Math.round(((currentPage + 1) / numPages) * 100)}%
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Chapter Navigation */}
                    <div style={{ ...styles.chapterNavigation, ...(isMobile ? styles.chapterNavigationMobile : {}) }}>
                        {chapterData?.previous && (
                            <button
                                style={{ ...styles.chapterButton, ...(isMobile ? styles.chapterButtonMobile : {}) }}
                                onClick={goToPreviousChapter}
                                disabled={loading}
                            >
                                ← {isMobile ? 'Trước' : 'Chương trước'}
                            </button>
                        )}
                        {chapterData?.next && (
                            <button
                                style={{
                                    ...styles.chapterButton,
                                    ...styles.nextChapterButton,
                                    ...(isMobile ? styles.chapterButtonMobile : {}),
                                }}
                                onClick={goToNextChapter}
                                disabled={loading}
                            >
                                {isMobile ? 'Tiếp' : 'Chương tiếp'} →
                            </button>
                        )}
                    </div>

                    {/* Mobile navigation buttons for PDF */}
                    {isMobile && contentType === 'pdf' && (
                        <div style={styles.mobileNavButtons}>
                            <button
                                onClick={prevPage}
                                disabled={currentPage <= 0}
                                style={{
                                    ...styles.mobileNavButton,
                                    ...(currentPage <= 0 ? styles.disabledButton : {}),
                                }}
                            >
                                <ChevronLeft style={styles.controlIcon} />
                                Trang trước
                            </button>
                            <button
                                onClick={nextPage}
                                disabled={currentPage >= numPages - 1}
                                style={{
                                    ...styles.mobileNavButton,
                                    ...(currentPage >= numPages - 1 ? styles.disabledButton : {}),
                                }}
                            >
                                Trang tiếp
                                <ChevronRight style={styles.controlIcon} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Chapter Modal */}
            {showChapterModal && (
                <div style={styles.modalOverlay} onClick={() => setShowChapterModal(false)}>
                    <div
                        style={{ ...styles.modalContent, ...(isMobile ? styles.modalContentMobile : {}) }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={styles.modalHeader}>
                            <div style={styles.modalTitle}>
                                <List style={styles.modalIcon} />
                                <span>Danh sách chương ({allChapters.length})</span>
                            </div>
                            <button style={styles.closeButton} onClick={() => setShowChapterModal(false)}>
                                <X style={styles.controlIcon} />
                            </button>
                        </div>

                        <div style={styles.modalBody}>
                            {loadingChapters ? (
                                <div style={styles.modalLoading}>
                                    <Loader style={styles.loadingSpinner} />
                                    <span>Đang tải danh sách chương...</span>
                                </div>
                            ) : (
                                <div style={styles.chaptersList}>
                                    {allChapters.map((chapter) => (
                                        <div
                                            key={chapter.id}
                                            style={{
                                                ...styles.chapterItem,
                                                ...(chapter.id === chapterData?.chapter?.id
                                                    ? styles.currentChapterItem
                                                    : {}),
                                                ...(isMobile ? styles.chapterItemMobile : {}),
                                            }}
                                            onClick={() => navigateToChapter(chapter.id)}
                                        >
                                            <div style={styles.chapterInfo}>
                                                <div style={styles.chapterHeader}>
                                                    <div style={styles.chapterIcon}>
                                                        {chapter.content_type === 'pdf' ? (
                                                            <FileType style={styles.chapterTypeIcon} />
                                                        ) : (
                                                            <FileText style={styles.chapterTypeIcon} />
                                                        )}
                                                    </div>
                                                    <div style={styles.chapterTitle}>
                                                        <h4 style={styles.chapterName}>{chapter.title}</h4>
                                                        <div style={styles.chapterMeta}>
                                                            <span style={styles.chapterOrder}>
                                                                #{chapter.chapter_order}
                                                            </span>
                                                            <span style={styles.chapterType}>
                                                                {chapter.content_type === 'pdf' ? 'PDF' : 'Văn bản'}
                                                            </span>
                                                            {chapter.wordCount > 0 && (
                                                                <span style={styles.wordCount}>
                                                                    <Clock style={styles.clockIcon} />
                                                                    {chapter.wordCount.toLocaleString()} ký tự
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {chapter.display_content && (
                                                    <div style={styles.chapterPreview}>
                                                        <div
                                                            style={styles.previewText}
                                                            dangerouslySetInnerHTML={{
                                                                __html:
                                                                    chapter.display_content.length > 200
                                                                        ? chapter.display_content.substring(0, 200) +
                                                                          '...'
                                                                        : chapter.display_content,
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {chapter.id === chapterData?.chapter?.id && (
                                                <div style={styles.currentBadge}>Đang đọc</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    // Loading styles
    loadingContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #1f2937, #374151)',
    },
    loadingContent: {
        textAlign: 'center',
        color: 'white',
    },
    loadingIcon: {
        width: '48px',
        height: '48px',
        margin: '0 auto 16px',
        color: '#60a5fa',
        animation: 'spin 1s linear infinite',
    },
    loadingText: {
        fontSize: '18px',
        marginBottom: '16px',
    },
    progressContainer: {
        width: '256px',
        height: '8px',
        backgroundColor: '#374151',
        borderRadius: '4px',
        overflow: 'hidden',
    },
    progressBar: {
        width: '60%',
        height: '100%',
        backgroundColor: '#2563eb',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    },

    // Main container styles
    container: {
        height: '100vh',
        background: 'linear-gradient(135deg, #1f2937, #374151)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        overflow: 'hidden',
    },

    // Text-to-Speech Container
    ttsContainer: {
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        padding: '12px 16px',
        borderBottom: '1px solid #374151',
        flexShrink: 0,
    },
    ttsContainerMobile: {
        padding: '8px 12px',
    },
    ttsControls: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        maxWidth: '1280px',
        margin: '0 auto',
    },
    ttsMainControls: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    ttsButton: {
        padding: '8px',
        backgroundColor: '#374151',
        border: 'none',
        borderRadius: '6px',
        color: 'white',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ttsPlayButton: {
        backgroundColor: '#059669',
    },
    ttsPauseButton: {
        backgroundColor: '#d97706',
    },
    ttsStopButton: {
        backgroundColor: '#dc2626',
    },
    ttsButtonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
    ttsIcon: {
        width: '16px',
        height: '16px',
    },
    ttsProgress: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flex: 1,
        maxWidth: '200px',
    },
    ttsProgressText: {
        fontSize: '12px',
        color: '#d1d5db',
        minWidth: '40px',
    },
    ttsProgressBar: {
        flex: 1,
        height: '4px',
        backgroundColor: '#374151',
        borderRadius: '2px',
        overflow: 'hidden',
    },
    ttsProgressFill: {
        height: '100%',
        background: 'linear-gradient(to right, #059669, #10b981)',
        borderRadius: '2px',
        transition: 'width 0.3s ease',
    },
    ttsSettings: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    ttsVolumeIcon: {
        width: '16px',
        height: '16px',
        color: '#9ca3af',
    },
    ttsSettingsPanel: {
        marginTop: '12px',
        padding: '16px',
        backgroundColor: '#374151',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    ttsSettingRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    ttsLabel: {
        fontSize: '12px',
        color: '#d1d5db',
        minWidth: '80px',
    },
    ttsSelect: {
        flex: 1,
        padding: '4px 8px',
        backgroundColor: '#1f2937',
        color: 'white',
        border: '1px solid #4b5563',
        borderRadius: '4px',
        fontSize: '12px',
    },
    ttsSlider: {
        flex: 1,
        appearance: 'none',
        height: '4px',
        backgroundColor: '#1f2937',
        borderRadius: '2px',
        outline: 'none',
    },

    // Enhanced Header styles với responsive
    header: {
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px)',
        color: 'white',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #374151',
        flexShrink: 0,
        minHeight: '64px',
    },
    headerMobile: {
        padding: '8px 12px',
        minHeight: '56px',
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flex: 1,
        minWidth: 0,
    },
    bookInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        minWidth: 0,
        overflow: 'hidden',
    },
    bookIcon: {
        width: '24px',
        height: '24px',
        color: '#60a5fa',
        flexShrink: 0,
    },
    iconMobile: {
        width: '18px',
        height: '18px',
    },
    bookTitle: {
        fontSize: '18px',
        fontWeight: 'bold',
        margin: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        lineHeight: '1.2',
    },
    titleMobile: {
        fontSize: '14px',
    },
    chapterTitle: {
        fontSize: '14px',
        color: '#d1d5db',
        margin: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        lineHeight: '1.2',
    },
    subtitleMobile: {
        fontSize: '11px',
    },
    contentType: {
        fontSize: '12px',
        color: '#9ca3af',
        fontStyle: 'italic',
    },
    headerRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexShrink: 0,
    },
    zoomControls: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        backgroundColor: '#374151',
        borderRadius: '8px',
        padding: '4px',
    },
    controlButton: {
        padding: '6px',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: '4px',
        color: 'white',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    controlIcon: {
        width: '16px',
        height: '16px',
    },
    zoomDisplay: {
        fontSize: '12px',
        padding: '4px 8px',
        minWidth: '50px',
        textAlign: 'center',
        color: 'white',
    },
    headerButton: {
        padding: '8px',
        backgroundColor: '#374151',
        border: 'none',
        borderRadius: '6px',
        color: 'white',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    chapterListButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 12px',
        backgroundColor: '#2563eb',
        border: 'none',
        borderRadius: '6px',
        color: 'white',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 4px rgba(37, 99, 235, 0.3)',
    },
    buttonMobile: {
        padding: '6px 8px',
        fontSize: '12px',
        gap: '4px',
    },
    buttonText: {
        fontSize: '13px',
        fontWeight: '500',
    },

    // Enhanced Main content styles
    mainContent: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px',
        position: 'relative',
        overflow: 'hidden',
        minHeight: 0,
    },
    backgroundPattern: {
        position: 'absolute',
        inset: 0,
        opacity: 0.05,
    },
    backgroundGradient: {
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to right, transparent, white, transparent)',
        transform: 'rotate(45deg)',
    },
    contentWrapper: {
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
    },
    navButton: {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 20,
        padding: '12px',
        background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        cursor: 'pointer',
        boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    prevButton: {
        left: '-60px',
    },
    nextButton: {
        right: '-60px',
    },
    disabledButton: {
        opacity: 0.3,
        cursor: 'not-allowed',
        transform: 'translateY(-50%) scale(0.9)',
    },
    navIcon: {
        width: '20px',
        height: '20px',
    },
    flipbookWrapper: {
        transformOrigin: 'center',
        transition: 'transform 0.3s ease',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        maxWidth: '100%',
        maxHeight: '100%',
    },

    // Enhanced Text content styles
    textContentContainer: {
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '100%',
        maxHeight: '100%',
    },
    textContentMobile: {
        borderRadius: '6px',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
    },
    textPage: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
    },
    textHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '16px 20px 12px',
        borderBottom: '1px solid #f3f4f6',
        background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
        flexShrink: 0,
    },
    textIcon: {
        width: '20px',
        height: '20px',
        color: '#2563eb',
    },
    textTitle: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#1f2937',
        margin: 0,
    },
    textContent: {
        flex: 1,
        padding: '20px',
        overflow: 'auto',
        fontSize: '15px',
        lineHeight: '1.6',
        color: '#374151',
        backgroundColor: 'white',
    },

    // Enhanced Page styles (for PDF)
    page: {
        background: 'white',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #e5e7eb',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        borderRadius: '4px',
    },

    // Enhanced PDF Page Content
    pdfPageContent: {
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        padding: 0,
        backgroundColor: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pageImage: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        display: 'block',
    },
    pageNumber: {
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '3px 6px',
        borderRadius: '8px',
        fontSize: '11px',
        fontWeight: '500',
        zIndex: 10,
        userSelect: 'none',
    },
    blankPageContent: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: '#9ca3af',
    },
    blankText: {
        fontSize: '14px',
        fontStyle: 'italic',
    },

    // Enhanced Footer styles với responsive
    footer: {
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px)',
        color: 'white',
        padding: '12px 16px',
        borderTop: '1px solid #374151',
        flexShrink: 0,
    },
    footerMobile: {
        padding: '8px 12px',
    },
    footerContent: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '1280px',
        margin: '0 auto',
        gap: '16px',
        flexWrap: 'wrap',
    },
    footerInfo: {
        fontSize: '13px',
        color: '#d1d5db',
        flex: 1,
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    authorName: {
        fontWeight: '500',
    },
    separator: {
        margin: '0 6px',
    },
    pageNavigation: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexShrink: 0,
    },
    pageNavigationMobile: {
        gap: '8px',
        order: 3,
        width: '100%',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    pageInputGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    pageLabel: {
        fontSize: '12px',
        color: '#9ca3af',
        whiteSpace: 'nowrap',
    },
    pageInputContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: '#374151',
        borderRadius: '6px',
        padding: '3px',
    },
    pageInput: {
        width: '50px',
        padding: '4px 6px',
        backgroundColor: 'transparent',
        color: 'white',
        border: 'none',
        textAlign: 'center',
        fontSize: '12px',
        borderRadius: '3px',
        outline: 'none',
    },
    progressGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    progressBarContainer: {
        width: '120px',
        height: '6px',
        backgroundColor: '#374151',
        borderRadius: '3px',
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        background: 'linear-gradient(to right, #3b82f6, #2563eb)',
        borderRadius: '3px',
        transition: 'width 0.5s ease',
    },
    chapterNavigation: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    chapterNavigationMobile: {
        order: 2,
        width: '100%',
        justifyContent: 'space-between',
    },
    chapterButton: {
        padding: '6px 12px',
        backgroundColor: '#374151',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '12px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        whiteSpace: 'nowrap',
    },
    chapterButtonMobile: {
        padding: '8px 12px',
        fontSize: '11px',
    },
    nextChapterButton: {
        background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
    },

    // Enhanced Mobile navigation buttons
    mobileNavButtons: {
        display: 'flex',
        gap: '8px',
        width: '100%',
        justifyContent: 'space-between',
        order: 4,
        marginTop: '6px',
    },
    mobileNavButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '10px 16px',
        backgroundColor: '#2563eb',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        flex: 1,
        justifyContent: 'center',
        minHeight: '40px',
    },

    // Enhanced Modal styles với responsive
    modalOverlay: {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
        padding: '16px',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: '10px',
        width: '90vw',
        maxWidth: '700px',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
    },
    modalContentMobile: {
        width: '95vw',
        maxHeight: '85vh',
        borderRadius: '8px',
    },
    modalHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f8fafc',
        borderRadius: '10px 10px 0 0',
    },
    modalTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '16px',
        fontWeight: '600',
        color: '#1f2937',
    },
    modalIcon: {
        width: '18px',
        height: '18px',
        color: '#2563eb',
    },
    closeButton: {
        padding: '6px',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        color: '#6b7280',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalBody: {
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
    },
    modalLoading: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '40px',
        color: '#6b7280',
    },
    loadingSpinner: {
        width: '18px',
        height: '18px',
        animation: 'spin 1s linear infinite',
    },
    chaptersList: {
        flex: 1,
        overflow: 'auto',
        padding: '6px',
    },
    chapterItem: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: '12px',
        margin: '4px',
        backgroundColor: '#f9fafb',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        border: '1px solid #e5e7eb',
    },
    chapterItemMobile: {
        padding: '10px',
        margin: '3px',
    },
    currentChapterItem: {
        backgroundColor: '#eff6ff',
        borderColor: '#2563eb',
        boxShadow: '0 1px 3px rgba(37, 99, 235, 0.1)',
    },
    chapterInfo: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        minWidth: 0,
    },
    chapterHeader: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
    },
    chapterIcon: {
        padding: '6px',
        backgroundColor: '#e5e7eb',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    chapterTypeIcon: {
        width: '14px',
        height: '14px',
        color: '#6b7280',
    },
    chapterTitle: {
        flex: 1,
        minWidth: 0,
    },
    chapterName: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#1f2937',
        margin: '0 0 3px 0',
        lineHeight: '1.3',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    chapterMeta: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap',
    },
    chapterOrder: {
        fontSize: '10px',
        color: '#6b7280',
        backgroundColor: '#e5e7eb',
        padding: '2px 4px',
        borderRadius: '3px',
        fontWeight: '500',
    },
    chapterType: {
        fontSize: '10px',
        color: '#059669',
        backgroundColor: '#d1fae5',
        padding: '2px 4px',
        borderRadius: '3px',
        fontWeight: '500',
    },
    wordCount: {
        display: 'flex',
        alignItems: 'center',
        gap: '3px',
        fontSize: '10px',
        color: '#6b7280',
    },
    clockIcon: {
        width: '10px',
        height: '10px',
    },
    chapterPreview: {
        marginTop: '6px',
    },
    previewText: {
        fontSize: '12px',
        color: '#6b7280',
        lineHeight: '1.4',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
    },
    currentBadge: {
        padding: '3px 6px',
        backgroundColor: '#2563eb',
        color: 'white',
        borderRadius: '8px',
        fontSize: '10px',
        fontWeight: '500',
        alignSelf: 'flex-start',
        flexShrink: 0,
    },
};

export default PDFFlipbook;
