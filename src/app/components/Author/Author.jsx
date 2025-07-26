'use client';
import React, { useState, useEffect } from 'react';
import { Card, Avatar, Rate } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

const BrandTestimonialSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fake data for brands
  const brands = [
    { name: 'Lady Daddy', logo: 'LD' },
    { name: 'Scandinavia Club', logo: 'SC' },
    { name: 'Mi Casa Es Tu Casa', logo: 'MC' },
    { name: 'Oak & Park', logo: 'OP' },
    { name: 'App & Games', logo: 'AG' },
    { name: 'Bean Shop', logo: 'BS' },
    { name: 'Mi Casa Es Tu Casa', logo: 'MC2' }
  ];

  // Fake testimonial data
  const testimonials = [
    {
      id: 1,
      name: 'Sâm Nguyên',
      role: 'Khách hàng',
      avatar: 'SN',
      rating: 5,
      comment: 'Tôi đã tìm thấy một hương thơm mà tôi đã lâu không thể mua được ở đây. Dịch vụ khách hàng cũng rất tốt, nhân viên hỗ trợ nhiệt tình và nhanh chóng giải đáp mọi thắc mắc của tôi.',
      bgColor: '#ff6b6b'
    },
    {
      id: 2,
      name: 'Bạch Ngân',
      role: 'Khách hàng',
      avatar: 'BN',
      rating: 5,
      comment: 'Giao diện đẹp mắt và dễ sử dụng, tôi dễ dàng tìm kiếm và tìm thấy những sản phẩm nước hoa yêu thích của mình. Thông tin chi tiết về từng sản phẩm giúp tôi hiểu rõ hơn về hương thơm và thành phần.',
      bgColor: '#4ecdc4'
    },
    {
      id: 3,
      name: 'Minh Châu',
      role: 'Khách hàng',
      avatar: 'MC',
      rating: 5,
      comment: 'Chất lượng sản phẩm tuyệt vời, giao hàng nhanh chóng. Tôi đã mua nhiều chai nước hoa ở đây và luôn hài lòng với chất lượng cũng như dịch vụ.',
      bgColor: '#45b7d1'
    },
    {
      id: 4,
      name: 'Thu Hà',
      role: 'Khách hàng',
      avatar: 'TH',
      rating: 5,
      comment: 'Website rất chuyên nghiệp, sản phẩm đa dạng và giá cả hợp lý. Đội ngũ tư vấn nhiệt tình, giúp tôi chọn được những chai nước hoa phù hợp nhất.',
      bgColor: '#f7b731'
    }
  ];

  // Auto slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [testimonials.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const buttonStyle = {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    border: 'none',
    background: '#fff',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    color: '#666',
    transition: 'all 0.3s ease',
    zIndex: 10
  };

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%)',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative elements */}
      <div style={{
        position: 'absolute',
        right: '5%',
        top: '20%',
        width: '100px',
        height: '100px',
        background: 'rgba(156, 39, 176, 0.1)',
        borderRadius: '50%',
        transform: 'rotate(15deg)'
      }} />
      <div style={{
        position: 'absolute',
        right: '10%',
        bottom: '30%',
        width: '80px',
        height: '80px',
        background: 'rgba(142, 68, 173, 0.1)',
        borderRadius: '50%',
        transform: 'rotate(-20deg)'
      }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Brand logos section */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '60px',
          padding: '20px 0'
        }}>
          {brands.map((brand, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '140px',
                height: '50px',
                background: '#fff',
                borderRadius: '25px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                color: '#666',
                border: '1px solid #f0f0f0',
                padding: '0 20px'
              }}
            >
              {brand.name}
            </div>
          ))}
        </div>

        {/* Testimonial slider */}
        <div style={{ 
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px'
        }}>
          {/* Navigation buttons */}
          <button
            onClick={prevSlide}
            style={{
              ...buttonStyle,
              position: 'absolute',
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)'
            }}
          >
            <LeftOutlined />
          </button>

          <button
            onClick={nextSlide}
            style={{
              ...buttonStyle,
              position: 'absolute',
              right: '20px',
              top: '50%',
              transform: 'translateY(-50%)'
            }}
          >
            <RightOutlined />
          </button>

          {/* Testimonial card container */}
          <div style={{ 
            width: '100%',
            maxWidth: '700px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              transform: `translateX(-${currentSlide * 100}%)`,
              transition: 'transform 0.5s ease-in-out'
            }}>
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  style={{
                    minWidth: '100%',
                    padding: '0 20px'
                  }}
                >
                  <Card
                    style={{
                      borderRadius: '20px',
                      background: '#fff',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                      border: 'none'
                    }}
                    bodyStyle={{ 
                      padding: '40px',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ marginBottom: '30px' }}>
                      <Avatar
                        size={80}
                        style={{
                          backgroundColor: testimonial.bgColor,
                          fontSize: '24px',
                          fontWeight: 'bold',
                          color: '#fff'
                        }}
                      >
                        {testimonial.avatar}
                      </Avatar>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <Rate 
                        disabled 
                        defaultValue={testimonial.rating} 
                        style={{ color: '#ffd700', fontSize: '20px' }} 
                      />
                    </div>

                    <p style={{
                      fontSize: '16px',
                      lineHeight: '1.8',
                      color: '#666',
                      marginBottom: '30px',
                      fontStyle: 'italic',
                      textAlign: 'center'
                    }}>
                      "{testimonial.comment}"
                    </p>

                    <div>
                      <h4 style={{ 
                        fontSize: '18px', 
                        color: '#333',
                        marginBottom: '5px',
                        fontWeight: 'bold'
                      }}>
                        {testimonial.name}
                      </h4>
                      <p style={{ 
                        fontSize: '14px', 
                        color: '#999',
                        margin: 0
                      }}>
                        {testimonial.role}
                      </p>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Slide indicators */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          marginTop: '30px'
        }}>
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              style={{
                width: index === currentSlide ? '30px' : '10px',
                height: '10px',
                borderRadius: '5px',
                border: 'none',
                background: index === currentSlide ? '#ff6b6b' : '#ddd',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandTestimonialSlider;