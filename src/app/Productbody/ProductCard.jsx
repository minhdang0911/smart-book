// components/ProductCard.jsx
'use client';

import { FireOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Button, Card } from 'antd';

const ProductCard = ({ book, formatPrice, calculateDiscountedPrice }) => {
    return (
        <Card className="product-card">
            <div className="product-image-container">
                <img
                    src={book?.thumb || 'https://via.placeholder.com/300x400?text=No+Image'}
                    alt={book.title}
                    className="w-[300px] h-[400px] object-cover rounded shadow-md"
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x400?text=No+Image';
                    }}
                />
                {/* <div className="product-badges">
                    <Badge className="flash-sale-badge" text="FLASH SALE" />
                    <Badge className="discount-badge" text="ƯU ĐÃI ĐẾN 50%" />
                </div> */}
            </div>

            <div className="product-info">
                <div className="product-specs">
                    <div className="spec-item">
                        <span className="spec-label">Số lượng:</span>
                        <span className="spec-value">{book.quantity_limit}</span>
                    </div>
                    <div className="spec-item">
                        <span className="spec-label">Đã bán:</span>
                        <span className="spec-value">{book.sold_quantity}</span>
                    </div>
                </div>

                <h3 className="product-title">{book.title}</h3>

                <div className="product-pricing">
                    <div className="price-container">
                        <span className="current-price">
                            {formatPrice(calculateDiscountedPrice(book.price, book.discount_percent))}
                        </span>
                        <span className="original-price">{formatPrice(book.price)}</span>
                        <span className="discount-percent">-{book.discount_percent}%</span>
                    </div>
                </div>

                <div className="product-actions">
                    <div className="fire-icon">
                        <FireOutlined />
                    </div>
                    <span className="stock-status">Vừa mở bán</span>
                    <Button type="primary" icon={<ShoppingCartOutlined />} className="add-to-cart-btn" size="small" />
                </div>
            </div>
        </Card>
    );
};

export default ProductCard;
