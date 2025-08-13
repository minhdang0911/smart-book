'use client';

import { EyeOutlined, HeartFilled, HeartOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Button, Card, Typography, message } from 'antd';
import { gsap } from 'gsap';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { apiAddToCart } from '../../../../../apis/cart';
import { handleAddToCartHelper } from '../../../utils/addToCartHandler';
import { toggleWishlist } from '../../../utils/wishlist';

const { Title, Text } = Typography;

export function BookCard({
  book,
  user,
  wishlist,
  setWishlist,
  onQuickView,
  isAddingToCart,
  setIsAddingToCart,
}) {
  const cardRef = useRef(null);
  const actionsRef = useRef(null);
  const router = useRouter();

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

  const handleToggleWishlist = async (bookId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.warning('Vui lòng đăng nhập để thêm vào danh sách yêu thích');
      return;
    }

    await toggleWishlist({
      bookId,
      token,
      wishlist,
      setWishlist,
    });
  };

  const handleAddToCart = async (book, qty = 1) => {
    await handleAddToCartHelper({
      user,
      bookId: book.id,
      quantity: qty,
      addToCart: apiAddToCart,
      setIsAddingToCart,
      router,
    });
  };

  const discount = calculateDiscount(book.price, book.discount_price);
  const isFavoriteBook = wishlist.includes(book.id);

  useEffect(() => {
    const card = cardRef.current;
    const actions = actionsRef.current;

    if (!card || !actions) return;

    const buttons = actions.querySelectorAll('.ant-btn');

    gsap.set(buttons, {
      y: 30,
      opacity: 0,
      scale: 0.8,
    });

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
            <img
              src={book.cover_image || 'https://via.placeholder.com/300x400?text=No+Image'}
              alt={book.title}
              className="book-image"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/300x400?text=No+Image';
              }}
            />
            <div ref={actionsRef} className="book-actions">
              <Button
                type="text"
                icon={isFavoriteBook ? <HeartFilled /> : <HeartOutlined />}
                className={`favorite-btn ${isFavoriteBook ? 'favorited' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleWishlist(book.id);
                }}
              />
              <Button
                type="text"
                icon={<ShoppingCartOutlined />}
                className="cart-btn"
                loading={isAddingToCart}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(book);
                }}
              />
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
        onClick={() => router.push(`/`)}
      >
        <div className="book-info">
          <Title level={5} className="book-title" ellipsis={{ rows: 2 }}>
            {book.title}
          </Title>
          {book.author && (
            <Text className="book-author" type="secondary">
              {typeof book.author === 'string'
                ? book.author
                : book.author?.name || 'Unknown Author'}
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
        </div>
      </Card>
    </div>
  );
}
