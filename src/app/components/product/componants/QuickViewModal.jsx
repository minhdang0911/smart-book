import { Button, Col, InputNumber, Modal, Row, Typography } from 'antd';

const { Title, Text, Paragraph } = Typography;

const QuickViewModal = ({
    visible,
    onClose,
    book,
    quantity,
    setQuantity,
    handleAddToCart,
    toggleFavorite,
    isFavorite,
    isAddingToCart = false, // Thêm prop này với default value
}) => {
    if (!book) return null;

    const discount =
        book.discount_price && book.discount_price < book.price
            ? Math.round(((book.price - book.discount_price) / book.price) * 100)
            : 0;

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

                    <Paragraph type="secondary" style={{ fontSize: 15, marginBottom: 24 }}>
                        {book.description || 'Không có mô tả'}
                    </Paragraph>

                    <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 24 }}>
                            <Button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                disabled={isAddingToCart} // Disable khi đang loading
                            >
                                -
                            </Button>
                            <InputNumber
                                min={1}
                                value={quantity}
                                onChange={(value) => setQuantity(value)}
                                style={{ width: 80 }}
                                disabled={isAddingToCart} // Disable khi đang loading
                            />
                            <Button
                                onClick={() => setQuantity(quantity + 1)}
                                disabled={isAddingToCart} // Disable khi đang loading
                            >
                                +
                            </Button>
                            <Button
                                type="primary"
                                danger
                                loading={isAddingToCart} // Thêm loading state
                                onClick={() => handleAddToCart(book, quantity)}
                            >
                                {isAddingToCart ? 'Đang thêm...' : 'Thêm Vào Giỏ Hàng'}
                            </Button>
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
