import { UsergroupAddOutlined } from '@ant-design/icons';
import { Button, Col, InputNumber, Modal, Row, Tooltip, Typography, message } from 'antd';

const { Title, Text, Paragraph } = Typography;

// API function để thêm vào giỏ hàng nhóm
const apiAddToGroupCart = async (groupOrderId, bookId, quantity) => {
    const groupToken = localStorage.getItem('group_cart_token');

    if (!groupToken) {
        throw new Error('Không tìm thấy token giỏ hàng nhóm');
    }

    const response = await fetch(`http://localhost:8000/api/group-orders/${groupOrderId}/items`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${groupToken}`,
        },
        body: JSON.stringify({
            book_id: bookId,
            quantity: quantity,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Lỗi khi thêm vào giỏ hàng nhóm');
    }

    return await response.json();
};

const QuickViewModal = ({
    visible,
    onClose,
    book,
    quantity,
    setQuantity,
    handleAddToCart,
    toggleFavorite,
    isFavorite,
    isAddingToCart = false,
    isCartGroup = false, // Thêm prop này
    groupOrderId = null, // Thêm prop này
    setIsAddingToCart, // Thêm prop này để control loading state
}) => {
    if (!book) return null;

    const discount =
        book.discount_price && book.discount_price < book.price
            ? Math.round(((book.price - book.discount_price) / book.price) * 100)
            : 0;

    // Function xử lý thêm vào giỏ hàng nhóm
    const handleAddToGroupCart = async (book, qty) => {
        if (!groupOrderId) {
            message.error('Không tìm thấy thông tin nhóm mua hàng');
            return;
        }

        try {
            setIsAddingToCart && setIsAddingToCart(true);

            const response = await apiAddToGroupCart(groupOrderId, book.id, qty);

            message.success(`Đã thêm "${book.title}" vào giỏ hàng nhóm thành công!`);
            console.log('Group cart response:', response);
        } catch (error) {
            console.error('Error adding to group cart:', error);
            message.error(error.message || 'Lỗi khi thêm vào giỏ hàng nhóm');
        } finally {
            setIsAddingToCart && setIsAddingToCart(false);
        }
    };

    return (
        <Modal open={visible} onCancel={onClose} footer={null} centered width={960} className="quick-view-modal">
            <Row gutter={[32, 0]}>
                {/* Hình ảnh */}
                <Col xs={24} md={12}>
                    <div className="modal-image-wrapper">
                        {discount > 0 && <div className="modal-discount-badge">-{discount}%</div>}
                        <img
                            src={book.cover_image || 'https://via.placeholder.com/400x500?text=No+Image'}
                            alt={book.title}
                            className="modal-image"
                        />
                    </div>
                </Col>

                {/* Thông tin */}
                <Col xs={24} md={12}>
                    <Title level={4}>{book.title}</Title>

                    <div style={{ marginBottom: 16 }}>
                        {book.discount_price && book.discount_price < book.price ? (
                            <>
                                <Text delete style={{ fontSize: 16, marginRight: 8 }}>
                                    {book.price.toLocaleString()} đ
                                </Text>
                                <Text strong style={{ fontSize: 20, color: '#e53935' }}>
                                    {book.discount_price.toLocaleString()} đ
                                </Text>
                            </>
                        ) : (
                            <Text strong style={{ fontSize: 20 }}>
                                {book.price ? book.price.toLocaleString() + ' đ' : 'Miễn phí'}
                            </Text>
                        )}
                    </div>

                    <Paragraph
                        type="secondary"
                        style={{ fontSize: 15, marginBottom: 24 }}
                        dangerouslySetInnerHTML={{
                            __html: book.description || 'Không có mô tả',
                        }}
                    />

                    <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 24 }}>
                            <Button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={isAddingToCart}>
                                -
                            </Button>
                            <InputNumber
                                min={1}
                                value={quantity}
                                onChange={(value) => setQuantity(value)}
                                style={{ width: 80 }}
                                disabled={isAddingToCart}
                            />
                            <Button onClick={() => setQuantity(quantity + 1)} disabled={isAddingToCart}>
                                +
                            </Button>
                            <Button
                                type="primary"
                                danger
                                loading={isAddingToCart}
                                onClick={() => handleAddToCart(book, quantity)}
                            >
                                {isAddingToCart ? 'Đang thêm...' : 'Thêm Vào Giỏ Hàng'}
                            </Button>

                            {/* Button thêm vào giỏ hàng nhóm - chỉ hiển thị khi isCartGroup = true */}
                            {isCartGroup && (
                                <Tooltip title="Thêm vào giỏ hàng nhóm">
                                    <Button
                                        type="primary"
                                        icon={<UsergroupAddOutlined />}
                                        loading={isAddingToCart}
                                        onClick={() => handleAddToGroupCart(book, quantity)}
                                        style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                                        disabled={isAddingToCart}
                                    >
                                        Nhóm
                                    </Button>
                                </Tooltip>
                            )}
                        </div>
                    </div>
                </Col>
            </Row>

            <style jsx>{`
                .modal-image-wrapper {
                    position: relative;
                    background: #f8f8f8;
                    padding: 12px;
                    border-radius: 8px;
                    text-align: center;
                }

                .modal-image {
                    width: 100%;
                    max-height: 440px;
                    object-fit: contain;
                }

                .modal-discount-badge {
                    position: absolute;
                    top: 12px;
                    left: 12px;
                    background: #ff4d4f;
                    color: white;
                    padding: 4px 8px;
                    font-size: 13px;
                    font-weight: bold;
                    border-radius: 4px;
                    z-index: 10;
                }

                .quick-view-modal .ant-modal-content {
                    padding: 32px 24px;
                    border-radius: 12px;
                }

                .quick-view-modal .ant-modal-close {
                    top: 12px;
                    right: 12px;
                }
            `}</style>
        </Modal>
    );
};

export default QuickViewModal;
