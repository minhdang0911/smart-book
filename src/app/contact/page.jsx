"use client"
import React, { useState, useEffect } from 'react';
import { Input, Button, Row, Col, Typography, Card, Space, message } from 'antd';
import { MenuOutlined, LoadingOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  // EmailJS configuration - Replace with your actual values
  const EMAIL_SERVICE_ID = 'service_lg81eri';
  const EMAIL_TEMPLATE_ID = 'template_2cxd19m';
  const EMAIL_PUBLIC_KEY = '54mEZG14u54_ru90Y';

  useEffect(() => {
    // Load EmailJS script
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
    script.async = true;
    script.onload = () => {
      // Initialize EmailJS
      if (window.emailjs) {
        window.emailjs.init(EMAIL_PUBLIC_KEY);
      }
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [EMAIL_PUBLIC_KEY]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      message.error('Xin hãy cho chúng tôi biết tên quý danh của bạn');
      return false;
    }
    if (!formData.email.trim()) {
      message.error('Xin hãy để lại địa chỉ email để chúng tôi có thể liên hệ');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      message.error('Xin hãy nhập một địa chỉ email hợp lệ');
      return false;
    }
    if (!formData.subject.trim()) {
      message.error('Xin hãy cho chúng tôi biết chủ đề bạn muốn trao đổi');
      return false;
    }
    if (!formData.message.trim()) {
      message.error('Xin hãy chia sẻ những suy nghĩ của bạn với chúng tôi');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      if (!window.emailjs) {
        throw new Error('Hệ thống email chưa sẵn sàng');
      }

      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message,
        to_name: 'Tháp Thiên Niên Kỷ San Francisco',
      };

      const result = await window.emailjs.send(
        EMAIL_SERVICE_ID,
        EMAIL_TEMPLATE_ID,
        templateParams
      );

      if (result.status === 200) {
        message.success('Thư của bạn đã được gửi đi như cánh chim bay xa! Chúng tôi sẽ phản hồi sớm nhất có thể.');
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        throw new Error('Gửi thư thất bại');
      }
    } catch (error) {
      console.error('EmailJS Error:', error);
      message.error('Có chút trục trặc trong quá trình gửi thư. Xin hãy thử lại sau một chút nhé.');
    } finally {
      setLoading(false);
    }
  };

  const headerStyle = {
    position: 'relative',
    height: '100vh',
    maxWidth:'100%',
    background: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    textAlign: 'center',
    margin: 0,
    padding: 0
  };

  const navStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: '20px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10
  };

  const logoStyle = {
    color: 'white',
    fontSize: '14px',
    fontWeight: '300',
    letterSpacing: '2px'
  };

  const contentStyle = {
    padding: '80px 20px',
    backgroundColor: '#f8f9fa'
  };

  return (
    <div style={{ margin: 0, padding: 0, width: '100%' }}>
      {/* Header Section */}
      <div style={headerStyle}>
        {/* Navigation */}
        <div style={navStyle}>
          <div style={logoStyle}>
            <div style={{ fontWeight: 'bold' }}>THÁP THIÊN NIÊN KỶ</div>
            <div style={{ fontSize: '12px', marginTop: '2px' }}>SAN FRANCISCO</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Button type="text" style={{ color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
              ĐĂNG NHẬP CƯ DÂN
            </Button>
            <MenuOutlined style={{ color: 'white', fontSize: '20px' }} />
          </div>
        </div>

        {/* Hero Content */}
        <div style={{ maxWidth: '600px', padding: '0 20px' }}>
          <Title level={1} style={{ color: 'white', fontSize: '64px', fontWeight: '300', margin: 0, letterSpacing: '4px' }}>
            LIÊN HỆ
          </Title>
          <Paragraph style={{ color: 'white', fontSize: '16px', marginTop: '30px', lineHeight: '1.6' }}>
            Hành trình khám phá Tháp Thiên Niên Kỷ San Francisco của bạn bắt đầu từ đây. 
            Chúng tôi rất vinh dự được chia sẻ những điều kỳ diệu về tòa tháp độc đáo và 
            ngoạn mục này cùng bạn.
          </Paragraph>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)' }}>
          <div style={{ width: '2px', height: '40px', backgroundColor: 'white', opacity: 0.7 }}></div>
        </div>
      </div>

      {/* Content Section */}
      <div style={contentStyle}>
        <div style={{ maxWidth: '100%', margin: '0 auto' }}>
          {/* Notice */}
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <Text style={{ fontSize: '16px', color: '#666', lineHeight: '1.6' }}>
              Đối với các yêu cầu thuê và mua bán, xin hãy liên hệ với một nhà môi giới địa phương<br />
              để được hỗ trợ, vì hiện tại không còn đội ngũ bán hàng/cho thuê tại chỗ ở Tháp Thiên Niên Kỷ San Francisco.
            </Text>
          </div>

          <Row gutter={[60, 40]}>
            {/* Contact Form */}
            <Col xs={24} lg={14}>
              <Card style={{ 
                border: 'none', 
                boxShadow: '0 8px 32px rgba(91, 179, 204, 0.15)',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)'
              }}>
                <Title level={3} style={{ 
                  color: '#2c5aa0', 
                  marginBottom: '30px', 
                  fontWeight: '400',
                  textAlign: 'center'
                }}>
                  GỬI THÔNG ĐIỆP ĐẾN CHÚNG TÔI
                </Title>
                
                <div>
                  <Input 
                    placeholder="Tên quý danh của bạn*" 
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    style={{ 
                      backgroundColor: 'rgba(91, 179, 204, 0.05)', 
                      border: '2px solid rgba(91, 179, 204, 0.2)',
                      borderRadius: '8px',
                      padding: '15px',
                      marginBottom: '20px',
                      fontSize: '15px',
                      transition: 'all 0.3s ease'
                    }} 
                    size="large"
                    disabled={loading}
                    onFocus={(e) => e.target.style.borderColor = '#5cb3cc'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(91, 179, 204, 0.2)'}
                  />

                  <Input 
                    placeholder="Địa chỉ email của bạn*" 
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    style={{ 
                      backgroundColor: 'rgba(91, 179, 204, 0.05)', 
                      border: '2px solid rgba(91, 179, 204, 0.2)',
                      borderRadius: '8px',
                      padding: '15px',
                      marginBottom: '20px',
                      fontSize: '15px',
                      transition: 'all 0.3s ease'
                    }} 
                    size="large"
                    disabled={loading}
                    onFocus={(e) => e.target.style.borderColor = '#5cb3cc'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(91, 179, 204, 0.2)'}
                  />

                  <Input 
                    placeholder="Chủ đề bạn muốn trao đổi*" 
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    style={{ 
                      backgroundColor: 'rgba(91, 179, 204, 0.05)', 
                      border: '2px solid rgba(91, 179, 204, 0.2)',
                      borderRadius: '8px',
                      padding: '15px',
                      marginBottom: '20px',
                      fontSize: '15px',
                      transition: 'all 0.3s ease'
                    }} 
                    size="large"
                    disabled={loading}
                    onFocus={(e) => e.target.style.borderColor = '#5cb3cc'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(91, 179, 204, 0.2)'}
                  />

                  <Input.TextArea 
                    placeholder="Chia sẻ những suy nghĩ của bạn với chúng tôi*" 
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    rows={6}
                    style={{ 
                      backgroundColor: 'rgba(91, 179, 204, 0.05)', 
                      border: '2px solid rgba(91, 179, 204, 0.2)',
                      borderRadius: '8px',
                      padding: '15px',
                      marginBottom: '30px',
                      fontSize: '15px',
                      transition: 'all 0.3s ease'
                    }}
                    disabled={loading}
                    onFocus={(e) => e.target.style.borderColor = '#5cb3cc'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(91, 179, 204, 0.2)'}
                  />

                  <div style={{ textAlign: 'center' }}>
                    <Button 
                      type="primary" 
                      onClick={handleSubmit}
                      loading={loading}
                      disabled={loading}
                      style={{
                        background: loading ? 'linear-gradient(135deg, #ccc 0%, #aaa 100%)' : 'linear-gradient(135deg, #5cb3cc 0%, #4a9fb8 100%)',
                        border: 'none',
                        borderRadius: '25px',
                        padding: '15px 50px',
                        height: 'auto',
                        fontSize: '14px',
                        fontWeight: '600',
                        letterSpacing: '1px',
                        boxShadow: loading ? 'none' : '0 4px 15px rgba(91, 179, 204, 0.4)',
                        transition: 'all 0.3s ease'
                      }}
                      size="large"
                      icon={loading ? <LoadingOutlined /> : null}
                    >
                      {loading ? 'ĐANG GỬI...' : 'GỬI THÔNG ĐIỆP'}
                    </Button>
                  </div>
                </div>
              </Card>
            </Col>

            {/* Contact Information */}
            <Col xs={24} lg={10}>
              <div style={{ padding: '20px 0' }}>
                <Paragraph style={{ fontSize: '16px', color: '#666', marginBottom: '40px', lineHeight: '1.6' }}>
                  Hãy liên hệ trực tiếp với chúng tôi, hoặc điền vào mẫu đơn với những thắc mắc 
                  và quan tâm của bạn. Chúng tôi luôn sẵn lòng lắng nghe.
                </Paragraph>

                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  {/* Address */}
                  <div>
                    <Title level={5} style={{ color: '#999', fontSize: '12px', letterSpacing: '1px', marginBottom: '8px' }}>
                      ĐỊA CHỈ
                    </Title>
                    <Text style={{ fontSize: '16px', color: '#333' }}>301 Mission Street</Text><br />
                    <Text style={{ fontSize: '16px', color: '#333' }}>San Francisco, CA 94105</Text>
                  </div>

                  {/* Contact */}
                  <div>
                    <Title level={5} style={{ color: '#999', fontSize: '12px', letterSpacing: '1px', marginBottom: '8px' }}>
                      LIÊN HỆ
                    </Title>
                    <div style={{ marginBottom: '8px' }}>
                      <a href="mailto:management@301mission.com" style={{ color: '#5cb3cc', fontSize: '16px' }}>
                        management@301mission.com
                      </a>
                    </div>
                    <Text style={{ fontSize: '16px', color: '#333' }}>415.874.4700</Text>
                  </div>

                  {/* Public Relations */}
                  <div>
                    <Title level={5} style={{ color: '#999', fontSize: '12px', letterSpacing: '1px', marginBottom: '8px' }}>
                      QUAN HỆ CÔNG CHÚNG
                    </Title>
                    <div style={{ marginBottom: '8px' }}>
                      <a href="#" style={{ color: '#5cb3cc', fontSize: '16px' }}>
                        BerqDavis Public Affairs
                      </a>
                    </div>
                    <Text style={{ fontSize: '16px', color: '#333', display: 'block' }}>Evette Davis</Text>
                    <a href="mailto:EDavis@bergdavis.com" style={{ color: '#5cb3cc', fontSize: '16px' }}>
                      EDavis@bergdavis.com
                    </a>
                  </div>
                </Space>
              </div>
            </Col>
          </Row>
        </div>
      </div>

    
    </div>
  );
};

export default ContactPage;