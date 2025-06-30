import React from 'react';
import { Layout, Row, Col, Space, Divider } from 'antd';
import {
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  LinkedinOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';

const { Footer } = Layout;

const FooterComponent = () => {

  return (
    <Footer style={footerStyles.footer}>
      <div style={footerStyles.container}>
        {/* Main Footer Content */}
        <Row gutter={[32, 32]}>
          {/* Company Info */}
          <Col xs={24} sm={12} md={6}>
            <div style={footerStyles.section}>
              <h3 style={footerStyles.title}>SmartBook</h3>
              <p style={footerStyles.description}>
                Nền tảng đọc sách trực tuyến hàng đầu Việt Nam, mang đến 
                trải nghiệm đọc sách tuyệt vời với kho tàng tri thức phong phú.
              </p>
              <Space size="middle" style={footerStyles.socialLinks}>
                <FacebookOutlined 
                  style={footerStyles.socialIcon}
                  onMouseEnter={(e) => e.target.style.color = '#1890ff'}
                  onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.75)'}
                />
                <TwitterOutlined 
                  style={footerStyles.socialIcon}
                  onMouseEnter={(e) => e.target.style.color = '#1890ff'}
                  onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.75)'}
                />
                <InstagramOutlined 
                  style={footerStyles.socialIcon}
                  onMouseEnter={(e) => e.target.style.color = '#1890ff'}
                  onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.75)'}
                />
                <LinkedinOutlined 
                  style={footerStyles.socialIcon}
                  onMouseEnter={(e) => e.target.style.color = '#1890ff'}
                  onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.75)'}
                />
              </Space>
            </div>
          </Col>

          {/* Quick Links */}
          <Col xs={24} sm={12} md={6}>
            <div style={footerStyles.section}>
              <h4 style={footerStyles.sectionTitle}>Liên kết nhanh</h4>
              <ul style={footerStyles.linkList}>
                <li>
                  <a href="/" 
                     style={footerStyles.link}
                     onMouseEnter={(e) => e.target.style.color = '#1890ff'}
                     onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.75)'}
                  >
                    Trang chủ
                  </a>
                </li>
                <li>
                  <a href="/books" 
                     style={footerStyles.link}
                     onMouseEnter={(e) => e.target.style.color = '#1890ff'}
                     onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.75)'}
                  >
                    Sách
                  </a>
                </li>
                <li>
                  <a href="/categories" 
                     style={footerStyles.link}
                     onMouseEnter={(e) => e.target.style.color = '#1890ff'}
                     onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.75)'}
                  >
                    Thể loại
                  </a>
                </li>
                <li>
                  <a href="/authors" 
                     style={footerStyles.link}
                     onMouseEnter={(e) => e.target.style.color = '#1890ff'}
                     onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.75)'}
                  >
                    Tác giả
                  </a>
                </li>
                <li>
                  <a href="/about" 
                     style={footerStyles.link}
                     onMouseEnter={(e) => e.target.style.color = '#1890ff'}
                     onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.75)'}
                  >
                    Giới thiệu
                  </a>
                </li>
                <li>
                  <a href="/contact" 
                     style={footerStyles.link}
                     onMouseEnter={(e) => e.target.style.color = '#1890ff'}
                     onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.75)'}
                  >
                    Liên hệ
                  </a>
                </li>
              </ul>
            </div>
          </Col>

          {/* Services */}
          <Col xs={24} sm={12} md={6}>
            <div style={footerStyles.section}>
              <h4 style={footerStyles.sectionTitle}>Dịch vụ</h4>
              <ul style={footerStyles.linkList}>
                <li>
                  <a href="#" 
                     style={footerStyles.link}
                     onMouseEnter={(e) => e.target.style.color = '#1890ff'}
                     onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.75)'}
                  >
                    Đọc online
                  </a>
                </li>
                <li>
                  <a href="#" 
                     style={footerStyles.link}
                     onMouseEnter={(e) => e.target.style.color = '#1890ff'}
                     onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.75)'}
                  >
                    Tải xuống
                  </a>
                </li>
                <li>
                  <a href="#" 
                     style={footerStyles.link}
                     onMouseEnter={(e) => e.target.style.color = '#1890ff'}
                     onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.75)'}
                  >
                    Audiobook
                  </a>
                </li>
                <li>
                  <a href="#" 
                     style={footerStyles.link}
                     onMouseEnter={(e) => e.target.style.color = '#1890ff'}
                     onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.75)'}
                  >
                    Gói premium
                  </a>
                </li>
                <li>
                  <a href="#" 
                     style={footerStyles.link}
                     onMouseEnter={(e) => e.target.style.color = '#1890ff'}
                     onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.75)'}
                  >
                    Hỗ trợ
                  </a>
                </li>
              </ul>
            </div>
          </Col>

          {/* Contact Info */}
          <Col xs={24} sm={12} md={6}>
            <div style={footerStyles.section}>
              <h4 style={footerStyles.sectionTitle}>Thông tin liên hệ</h4>
              <div style={footerStyles.contactInfo}>
                <div style={footerStyles.contactItem}>
                  <EnvironmentOutlined style={footerStyles.contactIcon} />
                  <span>123 Đường ABC, Quận 1, TP.HCM</span>
                </div>
                <div style={footerStyles.contactItem}>
                  <PhoneOutlined style={footerStyles.contactIcon} />
                  <span>+84 123 456 789</span>
                </div>
                <div style={footerStyles.contactItem}>
                  <MailOutlined style={footerStyles.contactIcon} />
                  <span>info@smartbook.com</span>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        <Divider style={footerStyles.divider} />

        {/* Bottom Footer */}
        <Row justify="space-between" align="middle" style={footerStyles.bottomFooter}>
          <Col xs={24} md={12}>
            <p style={footerStyles.copyright}>
              © 2024 SmartBook. Tất cả quyền được bảo lưu.
            </p>
          </Col>
          <Col xs={24} md={12}>
            <div style={footerStyles.bottomLinks}>
              <a href="#" 
                 style={footerStyles.bottomLink}
                 onMouseEnter={(e) => e.target.style.color = '#1890ff'}
                 onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.65)'}
              >
                Chính sách bảo mật
              </a>
              <span style={footerStyles.separator}>|</span>
              <a href="#" 
                 style={footerStyles.bottomLink}
                 onMouseEnter={(e) => e.target.style.color = '#1890ff'}
                 onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.65)'}
              >
                Điều khoản sử dụng
              </a>
              <span style={footerStyles.separator}>|</span>
              <a href="#" 
                 style={footerStyles.bottomLink}
                 onMouseEnter={(e) => e.target.style.color = '#1890ff'}
                 onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.65)'}
              >
                Cookies
              </a>
            </div>
          </Col>
        </Row>
      </div>
    </Footer>
  );
};

const footerStyles = {
  footer: {
    backgroundColor: '#001529',
    color: 'rgba(255, 255, 255, 0.85)',
    padding: '48px 0 24px',
    marginTop: 'auto'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px'
  },
  section: {
    marginBottom: '24px'
  },
  title: {
    color: '#fff',
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '16px',
    margin: '0 0 16px 0'
  },
  sectionTitle: {
    color: '#fff',
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px',
    margin: '0 0 16px 0'
  },
  description: {
    color: 'rgba(255, 255, 255, 0.75)',
    lineHeight: '1.6',
    marginBottom: '20px',
    fontSize: '14px'
  },
  linkList: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  link: {
    color: 'rgba(255, 255, 255, 0.75)',
    textDecoration: 'none',
    fontSize: '14px',
    lineHeight: '2.2',
    display: 'block',
    transition: 'color 0.3s ease'
  },
  socialLinks: {
    marginTop: '16px'
  },
  socialIcon: {
    fontSize: '20px',
    color: 'rgba(255, 255, 255, 0.75)',
    cursor: 'pointer',
    transition: 'color 0.3s ease'
  },
  contactInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.75)'
  },
  contactIcon: {
    fontSize: '16px',
    color: '#1890ff'
  },
  divider: {
    borderColor: 'rgba(255, 255, 255, 0.15)',
    margin: '32px 0 24px'
  },
  bottomFooter: {
    flexWrap: 'wrap'
  },
  copyright: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: '14px',
    margin: 0,
    textAlign: 'left'
  },
  bottomLinks: {
    textAlign: 'right'
  },
  bottomLink: {
    color: 'rgba(255, 255, 255, 0.65)',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'color 0.3s ease'
  },
  separator: {
    color: 'rgba(255, 255, 255, 0.45)',
    margin: '0 12px'
  }
};

export default FooterComponent;