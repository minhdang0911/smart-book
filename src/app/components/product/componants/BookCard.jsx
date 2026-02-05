'use client';

import { EyeOutlined, HeartFilled, HeartOutlined, ShoppingCartOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { Button, Card, Tooltip, Typography } from 'antd'; // bỏ message
import { gsap } from 'gsap';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { apiAddToCart } from '../../../../../apis/cart';
import { apiGetMe } from '../../../../../apis/user';
import { handleAddToCartHelper } from '../../../utils/addToCartHandler';
import { toggleWishlist } from '../../../utils/wishlist';

// 🔔 Toast
import { toast } from 'react-toastify';
// nhớ có <ToastContainer /> ở layout nếu chưa

const { Title, Text } = Typography;

/* =========================
 * API: thêm vào giỏ hàng nhóm
 * ========================= */
const apiAddToGroupCart = async (groupToken, bookId, quantity = 1) => {
    if (!groupToken) {
        throw new Error('Không tìm thấy token giỏ hàng nhóm');
    }
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const response = await fetch(`https://smartbook-backend.tranminhdang.cloud/api/group-orders/${groupToken}/items`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ book_id: bookId, quantity }),
    });

    if (!response.ok) {
        let errorMessage = 'Lỗi khi thêm vào giỏ hàng nhóm';
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch {}
        throw new Error(errorMessage);
    }

    return await response.json();
};

/* =========================
 * Helper: thêm giỏ hàng nhóm (toast như cart thường)
 * ========================= */
const handleAddToGroupCartHelper = async ({
    user,
    groupToken,
    bookId,
    quantity,
    addToGroupCart, // fn gọi API (apiAddToGroupCart)
    setIsAddingToGroupCart = null, // optional
}) => {
    try {
        if (!user || user.length === 0) {
            toast.error('🔒 Vui lòng đăng nhập để mua sách!');
            return;
        }
        if (!groupToken) {
            toast.warn('🔗 Vui lòng tham gia nhóm mua chung trước!');
            return;
        }

        if (setIsAddingToGroupCart) setIsAddingToGroupCart(true);

        const result = await addToGroupCart(groupToken, bookId, quantity);

        // thành công — giữ style giống cart thường
        // (bên cart thường: 🎉 Đã thêm sách vào giỏ hàng!)
        toast.success('🎉 Đã thêm sách vào giỏ hàng nhóm!');

        // Nếu có counter/event riêng cho group cart thì bắn lên
        if (typeof window !== 'undefined') {
            if (window.updateGroupCartCount) window.updateGroupCartCount();
            window.dispatchEvent(new CustomEvent('groupCartUpdated'));
        }

        return result;
    } catch (error) {
        toast.error(`🚨 Lỗi hệ thống: ${error?.response?.data?.message || error?.message || 'Không rõ lỗi'}`);
        throw error;
    } finally {
        if (setIsAddingToGroupCart) setIsAddingToGroupCart(false);
    }
};

export function BookCard({
    book,
    user,
    wishlist,
    setWishlist,
    onQuickView,
    isAddingToCart,
    setIsAddingToCart,
    isCartGroup = false, // bật/tắt giỏ hàng nhóm
}) {
    const cardRef = useRef(null);
    const actionsRef = useRef(null);
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState(user);
    const [isAddingToGroupCart, setIsAddingToGroupCart] = useState(false);

    // Lấy user nếu chưa có & đang ở chế độ group
    useEffect(() => {
        const fetchUserInfo = async () => {
            if (!currentUser && isCartGroup && typeof window !== 'undefined') {
                const token = localStorage.getItem('token');
                if (token) {
                    try {
                        const userData = await apiGetMe(token);
                        setCurrentUser(userData.data || userData);
                    } catch (error) {
                        console.error('Lỗi lấy thông tin người dùng:', error);
                    }
                }
            }
        };
        fetchUserInfo();
    }, [currentUser, isCartGroup]);

    const formatPrice = (price) => {
        if (!price) return '';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    const calculateDiscount = (originalPrice, discountPrice) => {
        if (!originalPrice || !discountPrice) return 0;
        return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
    };

    // Kiểm tra stock
    const checkStock = (book, requestedQty = 1) => {
        const stock = parseInt(book?.stock ?? 0, 10);
        if (stock <= 0) {
            return { canAdd: false, code: 'OUT', stock, message: 'Sản phẩm đã hết hàng' };
        }
        if (requestedQty > stock) {
            return { canAdd: false, code: 'LIMIT', stock, message: `Chỉ còn ${stock} sản phẩm trong kho` };
        }
        return { canAdd: true, code: 'OK', stock, message: '' };
    };

    // Điều kiện hiển thị
    const isPhysicalBook = book.is_physical === 1 || book.is_physical === true;
    const isOutOfStock = parseInt(book?.stock ?? 0, 10) <= 0;

    const handleToggleWishlist = async (bookId) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
            toast.warn('Vui lòng đăng nhập để thêm vào danh sách yêu thích');
            return;
        }
        await toggleWishlist({ bookId, token, wishlist, setWishlist });
        const isFav = wishlist.includes(bookId);
        isFav ? toast.info('Đã xoá khỏi danh sách yêu thích') : toast.success('Đã thêm vào danh sách yêu thích');
    };

    // CART THƯỜNG — dùng helper của mày (toast có sẵn)
    const handleAddToCart = async (b, qty = 1) => {
        const stockCheck = checkStock(b, qty);
        if (!stockCheck.canAdd) {
            if (stockCheck.code === 'OUT') {
                toast.error(`🚫 Hết hàng rồi nha\n${b.title}`);
            } else if (stockCheck.code === 'LIMIT') {
                toast.warn(`⚠️ Chỉ còn ${stockCheck.stock} cái trong kho. Giảm số lượng rồi thêm lại nha.`);
            }
            return;
        }

        await handleAddToCartHelper({
            user: currentUser,
            bookId: b.id,
            quantity: qty,
            addToCart: apiAddToCart,
            setIsAddingToCart,
            router,
        });
    };

    // CART NHÓM — toast giống cart thường
    const handleAddToGroupCart = async (b, qty = 1) => {
        const stockCheck = checkStock(b, qty);
        if (!stockCheck.canAdd) {
            if (stockCheck.code === 'OUT') {
                toast.error(`🚫 Hết hàng rồi nha\n${b.title}`);
            } else if (stockCheck.code === 'LIMIT') {
                toast.warn(`⚠️ Chỉ còn ${stockCheck.stock} cái trong kho. Giảm số lượng rồi thêm lại giúp nhóm.`);
            }
            return;
        }

        const groupToken = typeof window !== 'undefined' ? localStorage.getItem('group_cart_token') : null;

        await handleAddToGroupCartHelper({
            user: currentUser,
            groupToken,
            bookId: b.id,
            quantity: qty,
            addToGroupCart: apiAddToGroupCart,
            setIsAddingToGroupCart,
        });
    };

    // Hover animations
    useEffect(() => {
        const card = cardRef.current;
        const actions = actionsRef.current;
        if (!card || !actions) return;

        const buttons = actions.querySelectorAll('.ant-btn');
        gsap.set(buttons, { y: 30, opacity: 0, scale: 0.8 });

        const handleMouseEnter = () => {
            gsap.to(buttons, {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.4,
                ease: 'back.out(1.7)',
                stagger: 0.1,
            });
        };
        const handleMouseLeave = () => {
            gsap.to(buttons, {
                y: 30,
                opacity: 0,
                scale: 0.8,
                duration: 0.3,
                ease: 'power2.in',
                stagger: 0.05,
            });
        };

        card.addEventListener('mouseenter', handleMouseEnter);
        card.addEventListener('mouseleave', handleMouseLeave);
        return () => {
            card.removeEventListener('mouseenter', handleMouseEnter);
            card.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    const discount = calculateDiscount(book.price, book.discount_price);
    const isFavoriteBook = wishlist.includes(book.id);
    const isOutOfStockBadge = isPhysicalBook && isOutOfStock;

    return (
        <div className="book-card-wrapper">
            <Card
                ref={cardRef}
                className="book-card"
                style={{ width: '100%', margin: '0 auto' }}
                cover={
                    <div className="book-image-container">
                        {book.discount_price > 0 && book.discount_price < book.price && (
                            <div className="discount-badge">-{discount}%</div>
                        )}
                        {/* Badge hết hàng */}
                        {isOutOfStockBadge && <div className="out-of-stock-badge">Hết hàng</div>}
                        {/* Badge sách điện tử */}
                        {!isPhysicalBook && <div className="digital-badge">Sách điện tử</div>}

                        <img
                            src={book.cover_image || 'https://via.placeholder.com/300x400?text=No+Image'}
                            alt={book.title}
                            className="book-image"
                            onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/300x400?text=No+Image';
                            }}
                        />

                        <div ref={actionsRef} className="book-actions">
                            {/* Yêu thích */}
                            <Button
                                type="text"
                                icon={isFavoriteBook ? <HeartFilled /> : <HeartOutlined />}
                                className={`favorite-btn ${isFavoriteBook ? 'favorited' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleWishlist(book.id);
                                }}
                            />

                            {/* Thêm giỏ cá nhân */}
                            {isPhysicalBook && (
                                <Button
                                    type="text"
                                    icon={<ShoppingCartOutlined />}
                                    className="cart-btn"
                                    loading={isAddingToCart}
                                    disabled={isAddingToGroupCart || isOutOfStock}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddToCart(book);
                                    }}
                                />
                            )}

                            {/* Thêm giỏ nhóm */}
                            {isPhysicalBook && currentUser?.is_group_cart === true && (
                                <Tooltip title="Thêm vào giỏ hàng nhóm">
                                    <Button
                                        type="text"
                                        icon={<UsergroupAddOutlined />}
                                        className="group-cart-btn"
                                        loading={isAddingToGroupCart}
                                        disabled={isAddingToCart || isOutOfStock}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddToGroupCart(book);
                                        }}
                                        style={{ color: '#52c41a' }}
                                    />
                                </Tooltip>
                            )}

                            {/* Xem nhanh */}
                            <Button
                                type="text"
                                icon={<EyeOutlined />}
                                className="view-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onQuickView(book);
                                }}
                            />
                        </div>
                    </div>
                }
                onClick={() => router.push(`/book/${book.id}`)}
            >
                <div className="book-info">
                    <Title level={5} className="book-title" ellipsis={{ rows: 2 }}>
                        {book.title}
                    </Title>
                    {book.author && (
                        <Text className="book-author" type="secondary">
                            {typeof book.author === 'string' ? book.author : book.author?.name || 'Unknown Author'}
                        </Text>
                    )}

                    <div className="price-container">
                        {book.discount_price > 0 && book.discount_price < book.price ? (
                            <>
                                <Text delete className="original-price">
                                    {formatPrice(book.price)}
                                </Text>
                                <Text strong className="discount-price">
                                    {formatPrice(book.discount_price)}
                                </Text>
                            </>
                        ) : book.price ? (
                            <Text strong className="current-price">
                                {formatPrice(book.price)}
                            </Text>
                        ) : (
                            <Text className="free-text">Miễn phí</Text>
                        )}
                    </div>

                    {/* Stock info */}
                    {isPhysicalBook && (
                        <div className="stock-info" style={{ marginTop: '8px' }}>
                            {isOutOfStock ? (
                                <Text type="danger" style={{ fontSize: '12px' }}>
                                    Hết hàng
                                </Text>
                            ) : (
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                    Còn lại: {book.stock} sản phẩm
                                </Text>
                            )}
                        </div>
                    )}
                </div>
            </Card>

            <style jsx>{`
                .book-card-wrapper .group-cart-btn:hover {
                    color: #389e0d !important;
                    background-color: rgba(82, 196, 26, 0.1) !important;
                }
                .book-card-wrapper .group-cart-btn.ant-btn-loading {
                    color: #52c41a !important;
                }
                .out-of-stock-badge {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    background: #ff4d4f;
                    color: #fff;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: bold;
                    z-index: 2;
                }
                .digital-badge {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    background: #722ed1;
                    color: #fff;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: bold;
                    z-index: 2;
                }
                .discount-badge {
                    position: absolute;
                    top: 8px;
                    left: 8px;
                    background: #ff4d4f;
                    color: #fff;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: bold;
                    z-index: 2;
                }
            `}</style>
        </div>
    );
}
