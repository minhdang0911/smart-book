'use client';
import { Book, ChevronLeft, ChevronRight, Home, Loader, Menu, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import HTMLFlipBook from 'react-pageflip';

const PDFFlipbook = () => {
    const [chapterData, setChapterData] = useState(null);
    const [numPages, setNumPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [zoom, setZoom] = useState(1);
    const [pdfPages, setPdfPages] = useState([]);
    const [pdfDoc, setPdfDoc] = useState(null);
    const [bookId, setBookId] = useState(null);
    const [chapterId, setChapterId] = useState(null);
    const [pdfCache, setPdfCache] = useState({}); // Cache cho PDF pages
    const flipBookRef = useRef();

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

            if (typeof window !== 'undefined' && !window.pdfjsLib) {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
                script.onload = () => {
                    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
                        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                    fetchChapterData(storedBookId, storedChapterId);
                };
                document.head.appendChild(script);
            } else if (window.pdfjsLib) {
                fetchChapterData(storedBookId, storedChapterId);
            }
        };
        loadPDFJS();
    }, []);

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

            // Load PDF with caching
            if (data.chapter.pdf_url) {
                await loadPDF(data.chapter.pdf_url, data.chapter.id);
            }
        } catch (error) {
            console.error('Error fetching chapter data:', error);
            setLoading(false);
        }
    };

    // Load PDF with PDF.js and caching
    const loadPDF = async (pdfUrl, chapterIdForCache) => {
        try {
            // Check cache first
            const cacheKey = `${chapterIdForCache}_${pdfUrl}`;
            if (pdfCache[cacheKey]) {
                console.log('Using cached PDF pages for chapter:', chapterIdForCache);
                setPdfPages(pdfCache[cacheKey].pages);
                setNumPages(pdfCache[cacheKey].numPages);
                setLoading(false);

                // Force flipbook to reset về trang đầu sau khi load
                setTimeout(() => {
                    if (flipBookRef.current && flipBookRef.current.pageFlip) {
                        flipBookRef.current.pageFlip().flip(0);
                    }
                }, 100);
                return;
            }

            console.log('Loading PDF from URL:', pdfUrl);
            const loadingTask = window.pdfjsLib.getDocument(pdfUrl);
            const pdf = await loadingTask.promise;
            setPdfDoc(pdf);
            setNumPages(pdf.numPages);

            // Render all pages as images
            const pages = [];
            for (let i = 1; i <= pdf.numPages; i++) {
                const pageImage = await renderPageToImage(pdf, i);
                pages.push({
                    pageNumber: i,
                    imageUrl: pageImage,
                    width: 600,
                    height: 800,
                });
            }

            setPdfPages(pages);
            console.log('PDF Pages loaded:', pages.length);

            // Cache the pages
            setPdfCache((prev) => ({
                ...prev,
                [cacheKey]: {
                    pages,
                    numPages: pdf.numPages,
                    timestamp: Date.now(),
                },
            }));

            setLoading(false);

            // Force flipbook to start at page 0 after loading
            setTimeout(() => {
                if (flipBookRef.current && flipBookRef.current.pageFlip) {
                    flipBookRef.current.pageFlip().flip(0);
                }
            }, 100);
        } catch (error) {
            console.error('Error loading PDF:', error);
            setLoading(false);
        }
    };

    // Render PDF page to image
    const renderPageToImage = async (pdf, pageNumber) => {
        try {
            const page = await pdf.getPage(pageNumber);
            const scale = 2; // Higher quality
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
            return canvas.toDataURL('image/jpeg', 0.8);
        } catch (error) {
            console.error(`Error rendering page ${pageNumber}:`, error);
            return null;
        }
    };

    // Navigation functions for react-pageflip (sử dụng API đúng)
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
        const targetPDFPage = Math.max(1, Math.min(pageNum, numPages));
        // Convert PDF page to flipbook index (page 1 = index 0)
        const flipBookPageIndex = targetPDFPage - 1;
        if (flipBookRef.current && flipBookRef.current.pageFlip) {
            flipBookRef.current.pageFlip().flip(flipBookPageIndex);
        }
    };

    // Handle page flip events
    const onFlip = (e) => {
        // Điều chỉnh logic trang cho spread view
        // e.data là index của trang trong flipbook
        // Cần convert về page number thực của PDF
        const flipBookPageIndex = e.data;
        let actualPDFPage;

        if (flipBookPageIndex <= 1) {
            // Cover và blank page
            actualPDFPage = 0;
        } else {
            // PDF pages bắt đầu từ index 2 trong flipbook
            actualPDFPage = flipBookPageIndex - 1;
        }

        setCurrentPage(Math.min(actualPDFPage, numPages - 1));
    };

    // Navigation functions for chapters
    const goToPreviousChapter = async () => {
        if (chapterData?.previous) {
            setLoading(true);
            try {
                const response = await fetch(
                    `https://smartbook.io.vn/api/admin/books/${chapterData.chapter.book_id}/chapters/${chapterData.previous.id}/detail`,
                );
                const data = await response.json();
                setChapterData(data);
                setCurrentPage(0);

                // Load PDF của chapter mới với cache
                if (data.chapter.pdf_url) {
                    await loadPDF(data.chapter.pdf_url, data.chapter.id);
                }

                // Reset flipbook về trang đầu
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
            try {
                const response = await fetch(
                    `https://smartbook.io.vn/api/admin/books/${chapterData.chapter.book_id}/chapters/${chapterData.next.id}/detail`,
                );
                const data = await response.json();
                setChapterData(data);
                setCurrentPage(0);

                // Load PDF của chapter mới với cache
                if (data.chapter.pdf_url) {
                    await loadPDF(data.chapter.pdf_url, data.chapter.id);
                }

                // Reset flipbook về trang đầu
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

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.loadingContent}>
                    <Loader style={styles.loadingIcon} />
                    <p style={styles.loadingText}>Đang tải PDF...</p>
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
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <div style={styles.bookInfo}>
                        <Book style={styles.bookIcon} />
                        <div>
                            <h1 style={styles.bookTitle}>{chapterData?.chapter?.book?.title}</h1>
                            <p style={styles.chapterTitle}>Chương {chapterData?.chapter?.title}</p>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div style={styles.headerRight}>
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

                    <button style={styles.headerButton} title="Trang chủ">
                        <Home style={styles.controlIcon} />
                    </button>
                    <button style={styles.headerButton} title="Menu">
                        <Menu style={styles.controlIcon} />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div style={styles.mainContent}>
                {/* Background Pattern */}
                <div style={styles.backgroundPattern}>
                    <div style={styles.backgroundGradient}></div>
                </div>

                <div style={styles.contentWrapper}>
                    {/* Navigation Buttons */}
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

                    {/* Flipbook Container */}
                    <div
                        style={{
                            ...styles.flipbookWrapper,
                            transform: `scale(${zoom})`,
                        }}
                    >
                        {pdfPages.length > 0 && (
                            <HTMLFlipBook
                                ref={flipBookRef}
                                width={700}
                                height={900}
                                size="fixed"
                                minWidth={500}
                                maxWidth={1200}
                                minHeight={600}
                                maxHeight={1400}
                                maxShadowOpacity={0.5}
                                showCover={true}
                                mobileScrollSupport={false}
                                onFlip={onFlip}
                                className="flipbook"
                                startPage={0}
                                drawShadow={true}
                                flippingTime={800}
                                usePortrait={false}
                                startZIndex={0}
                                autoSize={false}
                                clickEventForward={true}
                                useMouseEvents={true}
                                swipeDistance={30}
                                showPageCorners={true}
                                disableFlipByClick={false}
                            >
                                {/* Cover Page */}
                                <div style={styles.page}>
                                    <div style={styles.coverPage}>
                                        <Book style={styles.coverIcon} />
                                        <h1 style={styles.coverTitle}>{chapterData?.chapter?.book?.title}</h1>
                                        <p style={styles.coverChapter}>Chương {chapterData?.chapter?.title}</p>
                                        <p style={styles.coverAuthor}>{chapterData?.chapter?.book?.author?.name}</p>
                                    </div>
                                </div>

                                {/* Blank page sau cover để tạo spread đúng */}
                                <div style={styles.page}>
                                    <div style={styles.blankPage}>
                                        <p style={styles.blankText}>Trang trắng</p>
                                    </div>
                                </div>

                                {/* PDF Pages */}
                                {pdfPages.map((page, index) => (
                                    <div key={page.pageNumber} style={styles.page}>
                                        <div style={styles.pdfPageContent}>
                                            <img
                                                src={page.imageUrl}
                                                alt={`Trang ${page.pageNumber}`}
                                                style={styles.pageImage}
                                                loading="lazy"
                                            />
                                            <div style={styles.pageNumber}>{page.pageNumber}</div>
                                        </div>
                                    </div>
                                ))}
                            </HTMLFlipBook>
                        )}
                    </div>

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
                </div>
            </div>

            {/* Footer */}
            <div style={styles.footer}>
                <div style={styles.footerContent}>
                    <div style={styles.footerInfo}>
                        <span style={styles.authorName}>{chapterData?.chapter?.book?.author?.name}</span>
                        <span style={styles.separator}>•</span>
                        <span>{chapterData?.chapter?.book?.title}</span>
                    </div>

                    {/* Page Navigation */}
                    <div style={styles.pageNavigation}>
                        <div style={styles.pageInputGroup}>
                            <span style={styles.pageLabel}>Trang:</span>
                            <div style={styles.pageInputContainer}>
                                <input
                                    type="number"
                                    min="1"
                                    max={numPages}
                                    value={currentPage}
                                    onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
                                    style={styles.pageInput}
                                />
                                <span style={styles.pageLabel}>/ {numPages}</span>
                            </div>
                        </div>

                        {/* Progress Bar */}
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
                            <span style={styles.pageLabel}>{Math.round((currentPage / numPages) * 100)}%</span>
                        </div>
                    </div>

                    {/* Chapter Navigation */}
                    <div style={styles.chapterNavigation}>
                        {chapterData?.previous && (
                            <button style={styles.chapterButton} onClick={goToPreviousChapter} disabled={loading}>
                                ← Chương trước
                            </button>
                        )}
                        {chapterData?.next && (
                            <button
                                style={{ ...styles.chapterButton, ...styles.nextChapterButton }}
                                onClick={goToNextChapter}
                                disabled={loading}
                            >
                                Chương tiếp →
                            </button>
                        )}
                    </div>
                </div>
            </div>
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
    },

    // Header styles
    header: {
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px)',
        color: 'white',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #374151',
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    bookInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    bookIcon: {
        width: '24px',
        height: '24px',
        color: '#60a5fa',
    },
    bookTitle: {
        fontSize: '18px',
        fontWeight: 'bold',
        margin: 0,
    },
    chapterTitle: {
        fontSize: '14px',
        color: '#d1d5db',
        margin: 0,
    },
    headerRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
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
        padding: '8px',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: '4px',
        color: 'white',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    controlIcon: {
        width: '16px',
        height: '16px',
    },
    zoomDisplay: {
        fontSize: '14px',
        padding: '4px 12px',
        minWidth: '60px',
        textAlign: 'center',
        color: 'white',
    },
    headerButton: {
        padding: '8px',
        backgroundColor: '#374151',
        border: 'none',
        borderRadius: '4px',
        color: 'white',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },

    // Main content styles
    mainContent: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
        position: 'relative',
        overflow: 'hidden',
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
    },
    navButton: {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 20,
        padding: '16px',
        background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        cursor: 'pointer',
        boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
        transition: 'all 0.3s ease',
    },
    prevButton: {
        left: '-80px',
    },
    nextButton: {
        right: '-80px',
    },
    disabledButton: {
        opacity: 0.3,
        cursor: 'not-allowed',
    },
    navIcon: {
        width: '24px',
        height: '24px',
    },
    flipbookWrapper: {
        transformOrigin: 'center',
        transition: 'transform 0.3s ease',
    },

    // Page styles
    page: {
        background: 'white',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #ddd',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    },
    coverPage: {
        flex: 1,
        background: 'linear-gradient(135deg, #1e3a8a, #7c3aed)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        padding: '32px',
        borderRadius: '8px',
    },
    coverIcon: {
        width: '64px',
        height: '64px',
        marginBottom: '16px',
        color: '#93c5fd',
    },
    coverTitle: {
        fontSize: '30px',
        fontWeight: 'bold',
        marginBottom: '8px',
        textAlign: 'center',
        margin: 0,
    },
    coverChapter: {
        fontSize: '20px',
        marginBottom: '16px',
        margin: 0,
    },
    coverAuthor: {
        fontSize: '18px',
        color: '#d1d5db',
        margin: 0,
    },
    pdfPageContent: {
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        padding: 0,
        backgroundColor: 'white',
    },
    pageImage: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
    },
    pageNumber: {
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 500,
        zIndex: 10,
    },

    // Footer styles
    footer: {
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px)',
        color: 'white',
        padding: '16px',
        borderTop: '1px solid #374151',
    },
    footerContent: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '1280px',
        margin: '0 auto',
        gap: '24px',
        flexWrap: 'wrap',
    },
    footerInfo: {
        fontSize: '14px',
        color: '#d1d5db',
    },
    authorName: {
        fontWeight: 500,
    },
    separator: {
        margin: '0 8px',
    },
    pageNavigation: {
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
    },
    pageInputGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    pageLabel: {
        fontSize: '14px',
        color: '#9ca3af',
    },
    pageInputContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: '#374151',
        borderRadius: '8px',
        padding: '4px',
    },
    pageInput: {
        width: '64px',
        padding: '4px 8px',
        backgroundColor: 'transparent',
        color: 'white',
        border: 'none',
        textAlign: 'center',
        fontSize: '14px',
        borderRadius: '4px',
    },
    progressGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    progressBarContainer: {
        width: '160px',
        height: '8px',
        backgroundColor: '#374151',
        borderRadius: '4px',
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        background: 'linear-gradient(to right, #3b82f6, #2563eb)',
        borderRadius: '4px',
        transition: 'width 0.5s ease',
    },
    chapterNavigation: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    chapterButton: {
        padding: '8px 16px',
        backgroundColor: '#374151',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    nextChapterButton: {
        background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
    },
    chapterButtonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
    blankPage: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
    },
    blankText: {
        color: '#6c757d',
        fontSize: '14px',
        fontStyle: 'italic',
        margin: 0,
    },
};

export default PDFFlipbook;
