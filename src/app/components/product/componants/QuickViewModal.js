'use client';

import { HeartFilled, HeartOutlined, ShoppingCartOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { Button, InputNumber, message, Modal, Tooltip, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { apiAddToCart } from '../../../../../apis/cart';
import { handleAddToCartHelper } from '../../../utils/addToCartHandler';
import { toggleWishlist } from '../../../utils/wishlist';

const { Title, Text } = Typography;

/** =========================
 *  HTML Clamp (Xem thêm / Thu gọn)
 *  ========================= */
function HtmlClamp({ html, rows = 4, expandLabel = 'Xem thêm', collapseLabel = 'Thu gọn' }) {
    const [expanded, setExpanded] = useState(false);
    const safeHtml = useMemo(() => html || 'Không có mô tả', [html]);

    return (
        <div>
            <div className={expanded ? '' : 'clamp'} dangerouslySetInnerHTML={{ __html: safeHtml }} />
            <a onClick={() => setExpanded((v) => !v)} style={{ color: '#1677ff', cursor: 'pointer' }}>
                {expanded ? collapseLabel : expandLabel}
            </a>

            <style jsx>{`
                .clamp {
                    display: -webkit-box;
                    -webkit-line-clamp: ${rows};
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
}

// API function để thêm vào giỏ hàng nhóm
const apiAddToGroupCart = async (groupOrderId, bookId, quantity) => {
    const groupToken = typeof window !== 'undefined' ? localStorage.getItem('group_cart_token') : null;
    if (!groupToken) throw new Error('Không tìm thấy token giỏ hàng nhóm');

    const response = await fetch(`http://localhost:8000/api/group-orders/${groupOrderId}/items`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${groupToken}`,
        },
        body: JSON.stringify({ book_id: bookId, quantity }),
    });

    if (!response.ok) {
        let msg = 'Lỗi khi thêm vào giỏ hàng nhóm';
        try {
            const errorData = await response.json();
            msg = errorData?.message || msg;
        } catch {}
        throw new Error(msg);
    }

    return await response.json();
};

export function QuickViewModal({
    visible,
    onClose,
    book,
    quantity,
    setQuantity,
    user,
    wishlist = [],
    setWishlist,
    isAddingToCart,
    setIsAddingToCart,
    isCartGroup = false,
    groupOrderId = null,
}) {
    if (!book) return null;

    const formatPrice = (price) => {
        const val = Number(price);
        if (!val) return '';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(val);
    };

    const calculateDiscount = (originalPrice, discountPrice) => {
        const op = Number(originalPrice);
        const dp = Number(discountPrice);
        if (!op || !dp || dp >= op) return 0;
        return Math.round(((op - dp) / op) * 100);
    };

    const handleToggleWishlist = async (bookId) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
            message.warning('Vui lòng đăng nhập để thêm vào danh sách yêu thích');
            return;
        }
        await toggleWishlist({ bookId, token, wishlist, setWishlist });
    };

    const handleAddToCart = async (book, qty) => {
        await handleAddToCartHelper({
            user,
            bookId: book.id,
            quantity: qty,
            addToCart: apiAddToCart,
            setIsAddingToCart,
            router: null,
        });
    };

    // Thêm vào giỏ hàng nhóm
    const handleAddToGroupCart = async (book, qty) => {
        if (!groupOrderId) {
            message.error('Không tìm thấy thông tin nhóm mua hàng');
            return;
        }
        try {
            setIsAddingToCart(true);
            await apiAddToGroupCart(groupOrderId, book.id, qty);
            message.success(`Đã thêm "${book.title}" vào giỏ hàng nhóm thành công!`);
            // optional: onGroupCartUpdated?.();
        } catch (error) {
            console.error('Error adding to group cart:', error);
            message.error(error.message || 'Lỗi khi thêm vào giỏ hàng nhóm');
        } finally {
            setIsAddingToCart(false);
        }
    };

    const discount = calculateDiscount(book.price, book.discount_price);
    const isFavorite = Array.isArray(wishlist) && wishlist.includes(book.id);

    return (
        <Modal
            title="Xem nhanh sản phẩm"
            open={visible}
            onCancel={onClose}
            footer={null}
            width={800}
            className="quick-view-modal"
        >
            <div style={{ display: 'flex', gap: '24px' }}>
                {/* Hình ảnh */}
                <div style={{ flex: '0 0 300px' }}>
                    <div style={{ position: 'relative' }}>
                        {discount > 0 && <div className="discount-badge">-{discount}%</div>}
                        <img
                            src={book.cover_image || 'https://via.placeholder.com/300x400?text=No+Image'}
                            alt={book.title}
                            style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                            onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/300x400?text=No+Image';
                            }}
                        />
                    </div>
                </div>

                {/* Thông tin */}
                <div style={{ flex: 1 }}>
                    <Title level={3}>{book.title}</Title>

                    {book.author && (
                        <Text type="secondary" style={{ fontSize: 16, display: 'block', marginBottom: 16 }}>
                            Tác giả:{' '}
                            {typeof book.author === 'string' ? book.author : book.author?.name || 'Unknown Author'}
                        </Text>
                    )}

                    <div style={{ marginBottom: 16 }}>
                        {Number(book.discount_price) > 0 && Number(book.discount_price) < Number(book.price) ? (
                            <>
                                <Text delete style={{ fontSize: 16, marginRight: 12 }}>
                                    {formatPrice(book.price)}
                                </Text>
                                <Text strong style={{ fontSize: 24, color: '#ff4d4f' }}>
                                    {formatPrice(book.discount_price)}
                                </Text>
                            </>
                        ) : Number(book.price) ? (
                            <Text strong style={{ fontSize: 24 }}>
                                {formatPrice(book.price)}
                            </Text>
                        ) : (
                            <Text style={{ fontSize: 24, color: '#52c41a' }}>Miễn phí</Text>
                        )}
                    </div>

                    {!!book.description && (
                        <div style={{ marginBottom: 24 }}>
                            <Title level={5} style={{ marginBottom: 8 }}>
                                Mô tả:
                            </Title>
                            {/* Tóm tắt 4 dòng, bấm xem thêm mới bung ra */}
                            <HtmlClamp html={book.description} rows={4} />
                        </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                        <Text>Số lượng:</Text>
                        <InputNumber
                            min={1}
                            max={99}
                            value={quantity || 1}
                            onChange={(value) => setQuantity(value || 1)}
                            style={{ width: 80 }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        {/* Thêm vào giỏ hàng cá nhân */}
                        <Button
                            type="primary"
                            icon={<ShoppingCartOutlined />}
                            size="large"
                            loading={isAddingToCart}
                            onClick={() => handleAddToCart(book, quantity || 1)}
                        >
                            Thêm vào giỏ hàng
                        </Button>

                        {/* Thêm vào giỏ hàng nhóm */}
                        {isCartGroup && (
                            <Tooltip title="Thêm vào giỏ hàng nhóm">
                                <Button
                                    type="primary"
                                    icon={<UsergroupAddOutlined />}
                                    size="large"
                                    loading={isAddingToCart}
                                    onClick={() => handleAddToGroupCart(book, quantity || 1)}
                                    style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                                >
                                    Giỏ hàng nhóm
                                </Button>
                            </Tooltip>
                        )}

                        {/* Yêu thích */}
                        <Button
                            type={isFavorite ? 'primary' : 'default'}
                            icon={isFavorite ? <HeartFilled /> : <HeartOutlined />}
                            size="large"
                            onClick={() => handleToggleWishlist(book.id)}
                            danger={isFavorite}
                        >
                            {isFavorite ? 'Đã yêu thích' : 'Yêu thích'}
                        </Button>
                    </div>
                </div>
            </div>

            <style jsx>{`
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
                    z-index: 1;
                }
            `}</style>
        </Modal>
    );
}
