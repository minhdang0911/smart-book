'use client';
import React, { useState, useEffect } from 'react';
import { Input, Button, Menu, Dropdown } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import './Header.css';
import { apiGetMe } from '../../../../apis/user';
import Product from '../product/product'

const { Search } = Input;

const Header = () => {
  const [activeMenu, setActiveMenu] = useState('');
  const [user, setUser] = useState(null); // ✅ thông tin user
  const router = useRouter();

  const navigationItems = [
    'Sách điện tử', 'Sách hội viên', 'Sách hiệu số',
    'Waka Shop', 'Sách nói', 'Sách mua lẻ',
    'Sách ngoại văn', 'Sách tóm tắt', 'Podcast', 'Xem thêm'
  ];

  // ✅ Gọi API lấy thông tin user nếu đã login
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      apiGetMe(token)
        .then(data => setUser(data.user))
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        });
    }
  }, []);
  
 

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile">
        <UserOutlined /> Hồ sơ
      </Menu.Item>
      <Menu.Item key="settings">Cài đặt</Menu.Item>
      <Menu.Item key="logout" onClick={handleLogout}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );


  return (
    <div className="waka-homepage">
      <header className="header">
        <div className="container">
          <div className="header-content">
            {/* Logo */}
            <div className="logo-section">
              <div className="logo">WAKA <span className="logo-star">★</span></div>
            </div>

            {/* Navigation */}
            <nav className="navigation">
              {navigationItems.map((item, index) => (
                <a key={index} href="#" className="nav-item"
                   onMouseEnter={() => setActiveMenu(item)}
                   onMouseLeave={() => setActiveMenu('')}>
                  {item}
                </a>
              ))}
            </nav>

            {/* Right actions */}
            <div className="right-actions">
              <div className="search-desktop">
                <Search placeholder="Tìm kiếm sách..." allowClear style={{ width: 200 }} className="waka-search" />
              </div>

              <Button type="text" icon={<SearchOutlined />} className="search-mobile" />

              <Button type="default" className="package-btn" size="small">⚡ Gói cước</Button>

              <div className="user-actions">
                {user ? (
                  <>
                    <span className="register-text">Chào, {user.name || user.email}</span>
                    <Dropdown overlay={userMenu}>
                      <Button type="primary" size="small" className="login-btn">Tài khoản</Button>
                    </Dropdown>
                  </>
                ) : (
                  <>
                    <span className="register-text">Đăng ký</span>
                    <Button type="primary" size="small" className="login-btn" onClick={() => router.push('/login')}>
                      Đăng nhập
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content giữ nguyên */}
      <main className="main-content">
        <div className="content-wrapper">
          <h1 className="main-title">Chào mừng đến với Waka</h1>
          <p className="main-subtitle">Khám phá thế giới sách số với hàng ngàn đầu sách phong phú</p>
               <Product />
        </div>
      </main>
    </div>
  );
};

export default Header;
