'use client'
import React, { useEffect, useRef, useState } from 'react';
import { Layout, Row, Col, Space, Divider, Button, Modal, Select, message } from 'antd';
import {
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  LinkedinOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CloseOutlined
} from '@ant-design/icons';

const { Footer } = Layout;
const { Option } = Select;

const FooterComponent = () => {
  const footerRef = useRef(null);
  const socialRef = useRef(null);
  const sectionsRef = useRef([]);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('qtsc9');
  const [userLocation, setUserLocation] = useState(null);
  const [map, setMap] = useState(null);
  const mapRef = useRef(null);

  // Địa chỉ các văn phòng
  const locations = {
    qtsc9: {
      name: 'Tòa nhà QTSC9 (toà T)',
      address: 'Đường Tô Ký, phường Tân Chánh Hiệp, quận 12, TP HCM',
      coords: [10.8358, 106.6232],
      phone: '+84 123 456 789'
    },
    phuNhuan: {
      name: 'Chi nhánh Phú Nhuận',
      address: '778/B1 Nguyễn Kiệm, phường 04, quận Phú Nhuận, TP HCM',
      coords: [10.8014, 106.6814],
      phone: '+84 987 654 321'
    }
  };

  useEffect(() => {
    // Load GSAP và Leaflet scripts
    const loadScripts = async () => {
      // Load GSAP
      if (!window.gsap) {
        const gsapScript = document.createElement('script');
        gsapScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
        gsapScript.onload = initAnimations;
        document.head.appendChild(gsapScript);
      } else {
        initAnimations();
      }

      // Load Leaflet
      if (!window.L) {
        const leafletCSS = document.createElement('link');
        leafletCSS.rel = 'stylesheet';
        leafletCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
        document.head.appendChild(leafletCSS);

        const leafletScript = document.createElement('script');
        leafletScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
        document.head.appendChild(leafletScript);
      }
    };

    loadScripts();
  }, []);

  const initAnimations = () => {
    if (!window.gsap) return;

    const { gsap } = window;

    // Animation khi footer xuất hiện
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Animate sections từ dưới lên
          gsap.fromTo(sectionsRef.current,
            { y: 50, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              stagger: 0.2,
              ease: "power2.out"
            }
          );

          // Animate social icons
          gsap.fromTo(socialRef.current?.children || [],
            { scale: 0, rotation: 180 },
            {
              scale: 1,
              rotation: 0,
              duration: 0.6,
              stagger: 0.1,
              ease: "back.out(1.7)",
              delay: 0.5
            }
          );
        }
      });
    }, { threshold: 0.2 });

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    // Hover animations cho social icons
    const socialIcons = socialRef.current?.children || [];
    Array.from(socialIcons).forEach(icon => {
      icon.addEventListener('mouseenter', () => {
        gsap.to(icon, { scale: 1.2, rotation: 10, duration: 0.3 });
      });
      icon.addEventListener('mouseleave', () => {
        gsap.to(icon, { scale: 1, rotation: 0, duration: 0.3 });
      });
    });
  };

  const initMap = () => {
    if (!window.L || !mapRef.current) return;

    const { L } = window;

    // Tạo map centered ở TP.HCM
    const mapInstance = L.map(mapRef.current).setView([10.8231, 106.6297], 12);

    // Thêm tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance);

    // Thêm markers cho các địa điểm
    Object.keys(locations).forEach(key => {
      const location = locations[key];
      const marker = L.marker(location.coords).addTo(mapInstance);
      marker.bindPopup(`
        <div style="font-family: Arial, sans-serif;">
          <h4 style="margin: 0 0 8px 0; color: #001529;">${location.name}</h4>
          <p style="margin: 0 0 4px 0; font-size: 13px;">${location.address}</p>
          <p style="margin: 0; font-size: 13px; color: #1890ff;">${location.phone}</p>
        </div>
      `);
    });

    setMap(mapInstance);
  };

  const handleShowMap = () => {
    setIsMapVisible(true);
    setTimeout(initMap, 100); // Delay để modal render xong
  };

  const handleGetDirections = () => {
    if (!navigator.geolocation) {
      message.error('Trình duyệt không hỗ trợ định vị!');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);

        const destination = locations[selectedLocation];
        const googleMapsUrl = `https://www.google.com/maps/dir/${latitude},${longitude}/${destination.coords[0]},${destination.coords[1]}`;

        window.open(googleMapsUrl, '_blank');
        message.success('Đã mở Google Maps với đường đi!');
      },
      (error) => {
        message.error('Không thể lấy vị trí của bạn!');
        console.error('Geolocation error:', error);
      }
    );
  };

  const addRefToSection = (el) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  // Render particle với style riêng biệt
  const renderParticle = (index) => {
    const isOdd = index % 2 === 1;
    return (
      <div
        key={index}
        style={{
          ...footerStyles.particle,
          backgroundColor: isOdd
            ? 'rgba(64, 169, 255, 0.3)'
            : 'rgba(24, 144, 255, 0.3)',
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 20}s`,
          animationDuration: `${15 + Math.random() * 10}s`
        }}
      />
    );
  };

  return (
    <>
      <Footer ref={footerRef} style={footerStyles.footer}>
        <div style={footerStyles.container}>
          {/* Floating particles background */}
          <div style={footerStyles.particlesContainer}>
            {Array.from({ length: 20 }, (_, i) => renderParticle(i))}
          </div>

          {/* Main Footer Content */}
          <Row gutter={[32, 32]}>
            {/* Company Info */}
            <Col xs={24} sm={12} md={6}>
              <div ref={addRefToSection} style={footerStyles.section}>
                <h3 style={footerStyles.title}>SmartBook</h3>
                <p style={footerStyles.description}>
                  Nền tảng đọc sách trực tuyến hàng đầu Việt Nam, mang đến
                  trải nghiệm đọc sách tuyệt vời với kho tàng tri thức phong phú.
                </p>
                <Space ref={socialRef} size="middle" style={footerStyles.socialLinks}>
                  <FacebookOutlined style={footerStyles.socialIcon} />
                  <TwitterOutlined style={footerStyles.socialIcon} />
                  <InstagramOutlined style={footerStyles.socialIcon} />
                  <LinkedinOutlined style={footerStyles.socialIcon} />
                </Space>
              </div>
            </Col>

            {/* Quick Links */}
            <Col xs={24} sm={12} md={6}>
              <div ref={addRefToSection} style={footerStyles.section}>
                <h4 style={footerStyles.sectionTitle}>Liên kết nhanh</h4>
                <ul style={footerStyles.linkList}>
                  {['Trang chủ', 'Sách', 'Thể loại', 'Tác giả', 'Giới thiệu', 'Liên hệ'].map((item, index) => (
                    <li key={index}>
                      {item === 'Liên hệ' ? (
                        <a
                          href="/contact"
                          style={footerStyles.link}
                          className="footer-link"
                        >
                          {item}
                        </a>
                      ) : (
                        <a
                          href="#"
                          style={footerStyles.link}
                          className="footer-link"
                        >
                          {item}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </Col>


            {/* Services */}
            <Col xs={24} sm={12} md={6}>
              <div ref={addRefToSection} style={footerStyles.section}>
                <h4 style={footerStyles.sectionTitle}>Dịch vụ</h4>
                <ul style={footerStyles.linkList}>
                  {['Đọc online', 'Tải xuống', 'Audiobook', 'Gói premium', 'Hỗ trợ'].map((item, index) => (
                    <li key={index}>
                      <a href="#" style={footerStyles.link} className="footer-link">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </Col>

            {/* Contact Info */}
            <Col xs={24} sm={12} md={6}>
              <div ref={addRefToSection} style={footerStyles.section}>
                <h4 style={footerStyles.sectionTitle}>Thông tin liên hệ</h4>
                <div style={footerStyles.contactInfo}>
                  <div style={footerStyles.contactItem}>
                    <EnvironmentOutlined style={footerStyles.contactIcon} />
                    <div>
                      <div>Tòa nhà QTSC9 (toà T)</div>
                      <div style={{ fontSize: '12px', opacity: 0.8 }}>
                        Đường Tô Ký, P.Tân Chánh Hiệp, Q.12
                      </div>
                    </div>
                  </div>
                  <div style={footerStyles.contactItem}>
                    <EnvironmentOutlined style={footerStyles.contactIcon} />
                    <div>
                      <div>778/B1 Nguyễn Kiệm</div>
                      <div style={{ fontSize: '12px', opacity: 0.8 }}>
                        P.04, Q.Phú Nhuận, TP.HCM
                      </div>
                    </div>
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

                {/* Map and Directions Buttons */}
                <div style={footerStyles.actionButtons}>
                  <Button
                    type="primary"
                    icon={<EnvironmentOutlined />}
                    size="small"
                    onClick={handleShowMap}
                    style={footerStyles.actionButton}
                  >
                    Xem bản đồ
                  </Button>
                  <Button
                    type="default"
                    size="small"
                    onClick={handleGetDirections}
                    style={{ ...footerStyles.actionButton, marginTop: '8px' }}
                  >
                    Chỉ đường
                  </Button>
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
                {['Chính sách bảo mật', 'Điều khoản sử dụng', 'Cookies'].map((item, index, arr) => (
                  <React.Fragment key={index}>
                    <a href="#" style={footerStyles.bottomLink} className="footer-link">
                      {item}
                    </a>
                    {index < arr.length - 1 && <span style={footerStyles.separator}>|</span>}
                  </React.Fragment>
                ))}
              </div>
            </Col>
          </Row>
        </div>
      </Footer>

      {/* Map Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <EnvironmentOutlined style={{ color: '#1890ff' }} />
            <span>Vị trí văn phòng SmartBook</span>
          </div>
        }
        open={isMapVisible}
        onCancel={() => setIsMapVisible(false)}
        footer={null}
        width={800}
        style={{ top: 20 }}
        closeIcon={<CloseOutlined />}
      >
        <div style={{ marginBottom: '16px' }}>
          <Row gutter={16} align="middle">
            <Col span={12}>
              <Select
                value={selectedLocation}
                onChange={setSelectedLocation}
                style={{ width: '100%' }}
                placeholder="Chọn địa điểm"
              >
                <Option value="qtsc9">QTSC9 - Quận 12</Option>
                <Option value="phuNhuan">Chi nhánh Phú Nhuận</Option>
              </Select>
            </Col>
            <Col span={12}>
              <Button
                type="primary"
                onClick={handleGetDirections}
                block
              >
                Chỉ đường tới đây
              </Button>
            </Col>
          </Row>
        </div>

        <div
          ref={mapRef}
          style={{
            height: '400px',
            width: '100%',
            borderRadius: '8px',
            border: '1px solid #d9d9d9'
          }}
        />

        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#001529' }}>
            {locations[selectedLocation].name}
          </h4>
          <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}>
            📍 {locations[selectedLocation].address}
          </p>
          <p style={{ margin: '0', fontSize: '14px', color: '#1890ff' }}>
            📞 {locations[selectedLocation].phone}
          </p>
        </div>
      </Modal>

      <style jsx>{`
        .footer-link {
          position: relative;
          transition: all 0.3s ease !important;
        }
        
        .footer-link:hover {
          color: #1890ff !important;
          transform: translateX(4px);
        }
        
        .footer-link::before {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #1890ff, #40a9ff);
          transition: width 0.3s ease;
        }
        
        .footer-link:hover::before {
          width: 100%;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </>
  );
};

const footerStyles = {
  footer: {
    backgroundColor: '#001529',
    color: 'rgba(255, 255, 255, 0.85)',
    padding: '48px 0 24px',
    marginTop: 'auto',
    position: 'relative',
    overflow: 'hidden'
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 1
  },
  particle: {
    position: 'absolute',
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    animation: 'float infinite ease-in-out'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    position: 'relative',
    zIndex: 2
  },
  section: {
    marginBottom: '24px'
  },
  title: {
    color: '#fff',
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '16px',
    margin: '0 0 16px 0',
    background: 'linear-gradient(135deg, #fff, #40a9ff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
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
    transition: 'all 0.3s ease'
  },
  socialLinks: {
    marginTop: '16px'
  },
  socialIcon: {
    fontSize: '20px',
    color: 'rgba(255, 255, 255, 0.75)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    padding: '8px',
    borderRadius: '50%',
    background: 'rgba(24, 144, 255, 0.1)'
  },
  contactInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  contactItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.75)'
  },
  contactIcon: {
    fontSize: '16px',
    color: '#1890ff',
    marginTop: '2px'
  },
  actionButtons: {
    marginTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  actionButton: {
    background: 'linear-gradient(135deg, #1890ff, #40a9ff)',
    border: 'none',
    borderRadius: '6px',
    transition: 'all 0.3s ease'
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
    textAlign: 'right',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexWrap: 'wrap'
  },
  bottomLink: {
    color: 'rgba(255, 255, 255, 0.65)',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'all 0.3s ease'
  },
  separator: {
    color: 'rgba(255, 255, 255, 0.45)',
    margin: '0 4px'
  }
};

export default FooterComponent;