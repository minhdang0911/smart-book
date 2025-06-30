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
      message.error('Vui lòng nhập tên của bạn');
      return false;
    }
    if (!formData.email.trim()) {
      message.error('Vui lòng nhập email của bạn');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      message.error('Vui lòng nhập email hợp lệ');
      return false;
    }
    if (!formData.subject.trim()) {
      message.error('Vui lòng nhập tiêu đề');
      return false;
    }
    if (!formData.message.trim()) {
      message.error('Vui lòng nhập nội dung tin nhắn');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      if (!window.emailjs) {
        throw new Error('EmailJS chưa được tải');
      }

      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message,
        to_name: 'Millennium Tower San Francisco',
      };

      const result = await window.emailjs.send(
        EMAIL_SERVICE_ID,
        EMAIL_TEMPLATE_ID,
        templateParams
      );

      if (result.status === 200) {
        message.success('Tin nhắn đã được gửi thành công!');
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        throw new Error('Gửi email thất bại');
      }
    } catch (error) {
      console.error('EmailJS Error:', error);
      message.error('Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.');
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
            <div style={{ fontWeight: 'bold' }}>MILLENNIUM TOWER</div>
            <div style={{ fontSize: '12px', marginTop: '2px' }}>SAN FRANCISCO</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Button type="text" style={{ color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
              RESIDENT LOGIN
            </Button>
            <MenuOutlined style={{ color: 'white', fontSize: '20px' }} />
          </div>
        </div>

        {/* Hero Content */}
        <div style={{ maxWidth: '600px', padding: '0 20px' }}>
          <Title level={1} style={{ color: 'white', fontSize: '64px', fontWeight: '300', margin: 0, letterSpacing: '4px' }}>
            CONTACT
          </Title>
          <Paragraph style={{ color: 'white', fontSize: '16px', marginTop: '30px', lineHeight: '1.6' }}>
            Your Millennium Tower San Francisco journey starts here. We welcome the opportunity to tell 
            you more about this singular and spectacular property.
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
              For lease and sales inquiries, please contact a local realtor for assistance, as there<br />
              is no longer a sales/leasing team on-site at Millennium Tower San Francisco.
            </Text>
          </div>

          <Row gutter={[60, 40]}>
            {/* Contact Form */}
            <Col xs={24} lg={14}>
              <Card style={{ border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <Title level={3} style={{ color: '#333', marginBottom: '30px', fontWeight: '300' }}>
                  GENERAL INQUIRIES
                </Title>
                
                <div>
                  <Input 
                    placeholder="Name*" 
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    style={{ 
                      backgroundColor: '#f8f9fa', 
                      border: 'none',
                      borderRadius: '0',
                      padding: '15px',
                      marginBottom: '20px'
                    }} 
                    size="large"
                    disabled={loading}
                  />

                  <Input 
                    placeholder="Email*" 
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    style={{ 
                      backgroundColor: '#f8f9fa', 
                      border: 'none',
                      borderRadius: '0',
                      padding: '15px',
                      marginBottom: '20px'
                    }} 
                    size="large"
                    disabled={loading}
                  />

                  <Input 
                    placeholder="Subject*" 
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    style={{ 
                      backgroundColor: '#f8f9fa', 
                      border: 'none',
                      borderRadius: '0',
                      padding: '15px',
                      marginBottom: '20px'
                    }} 
                    size="large"
                    disabled={loading}
                  />

                  <Input.TextArea 
                    placeholder="Message*" 
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    rows={6}
                    style={{ 
                      backgroundColor: '#f8f9fa', 
                      border: 'none',
                      borderRadius: '0',
                      padding: '15px',
                      marginBottom: '30px'
                    }}
                    disabled={loading}
                  />

                  <Button 
                    type="primary" 
                    onClick={handleSubmit}
                    loading={loading}
                    disabled={loading}
                    style={{
                      backgroundColor: loading ? '#ccc' : '#5cb3cc',
                      border: 'none',
                      borderRadius: '0',
                      padding: '15px 40px',
                      height: 'auto',
                      fontSize: '14px',
                      fontWeight: '500',
                      letterSpacing: '1px'
                    }}
                    size="large"
                    icon={loading ? <LoadingOutlined /> : null}
                  >
                    {loading ? 'SENDING...' : 'SUBMIT'}
                  </Button>
                </div>
              </Card>
            </Col>

            {/* Contact Information */}
            <Col xs={24} lg={10}>
              <div style={{ padding: '20px 0' }}>
                <Paragraph style={{ fontSize: '16px', color: '#666', marginBottom: '40px', lineHeight: '1.6' }}>
                  Contact us directly, or complete the form with your question or concern.
                </Paragraph>

                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  {/* Address */}
                  <div>
                    <Title level={5} style={{ color: '#999', fontSize: '12px', letterSpacing: '1px', marginBottom: '8px' }}>
                      ADDRESS
                    </Title>
                    <Text style={{ fontSize: '16px', color: '#333' }}>301 Mission Street</Text><br />
                    <Text style={{ fontSize: '16px', color: '#333' }}>San Francisco, CA 94105</Text>
                  </div>

                  {/* Contact */}
                  <div>
                    <Title level={5} style={{ color: '#999', fontSize: '12px', letterSpacing: '1px', marginBottom: '8px' }}>
                      CONTACT
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
                      PUBLIC RELATIONS
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

      {/* Footer */}
      <div style={{ 
        backgroundColor: '#2c3e50', 
        color: 'white', 
        textAlign: 'center', 
        padding: '40px 20px',
        fontSize: '12px'
      }}>
        <Text style={{ color: 'rgba(255,255,255,0.7)' }}>
          © Copyright 2025 Millennium Tower San Francisco. All Rights Reserved. | Website by Mediaroom
        </Text>
        <br />
        <a href="#" style={{ color: '#5cb3cc', marginTop: '10px', display: 'inline-block' }}>
          Privacy Policy
        </a>
      </div>
    </div>
  );
};

export default ContactPage;