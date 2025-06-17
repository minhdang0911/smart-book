'use client';
import React, { useState, useEffect } from 'react';
import { MenuOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { Drawer, Button, Input, Dropdown, Space, Avatar } from 'antd';
import { useRouter } from 'next/navigation';
import './Header.css';
import { apiGetMe } from '../../../../apis/user';

const Header = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [user, setUser] = useState(null);

  const navItems = [
    { label: 'Ebooks', path: '/ebooks' },
    { label: 'Sách bán', path: '/buybooks' },
    { label: 'Tất cả sách', path: '/search' },
    { label: 'Waka Shop', path: '/shop' },
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const getUserInfo = async () => {
        try {
          const response = await apiGetMe(token);
          if (response?.status === true) {
            setUser(response?.user);
          }
        } catch (error) {
          console.error('Error getting user info:', error);
          // Token có thể đã hết hạn, xóa token
          localStorage.removeItem('token');
        }
      };
      getUserInfo();
    }
  }, []);
 
  const handleNav = (path) => {
    setOpen(false);
    router.push(path);
  };

  const handleSearch = () => {
    if (search.trim() !== '') {
      // Điều hướng đến trang search với keyword
      router.push(`/search?keyword=${encodeURIComponent(search.trim())}`);
      setSearch(''); // Clear search input sau khi search
    }
  };

  const handleSearchInputChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  const userMenu = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: <span onClick={() => router.push('/profile')}>Thông tin cá nhân</span>,
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: <span onClick={handleLogout}>Đăng xuất</span>,
      },
    ],
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo" onClick={() => router.push('/')}>
          WAKA <span className="logo-star">★</span>
        </div>

        <nav className="navigation">
          {navItems.map((item) => (
            <a key={item.path} onClick={() => handleNav(item.path)}>
              {item.label}
            </a>
          ))}
        </nav>

        {/* Thanh tìm kiếm */}
        <div className="search-bar">
          <Input.Search
            placeholder="Tìm sách theo tên, tác giả..."
            enterButton="Tìm kiếm"
            value={search}
            onChange={handleSearchInputChange}
            onSearch={handleSearch}
            onPressEnter={handleSearchKeyPress}
            style={{ width: 300 }}
            allowClear
          />
        </div>

        {/* Hiển thị người dùng hoặc đăng nhập */}
        <div className="auth-section">
          {user ? (
            <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
              <Space style={{ color: 'white', cursor: 'pointer' }}>
                <Avatar 
                  icon={<UserOutlined />} 
                  src={user.avatar}
                  size="small"
                />
                <span className="user-name">{user.name}</span>
              </Space>
            </Dropdown>
          ) : (
            <Space>
              <Button type="text" onClick={() => router.push('/register')} style={{ color: 'white' }}>
                Đăng ký
              </Button>
              <Button type="primary" onClick={() => router.push('/login')}>
                Đăng nhập
              </Button>
            </Space>
          )}
        </div>

        {/* Icon mở menu drawer cho mobile */}
        <div className="hamburger">
          <Button
            type="text"
            icon={<MenuOutlined style={{ fontSize: '24px', color: 'white' }} />}
            onClick={() => setOpen(true)}
          />
        </div>
      </div>

      {/* Drawer cho mobile */}
      <Drawer
        title="Menu"
        placement="left"
        onClose={() => setOpen(false)}
        open={open}
        width={280}
      >
        <div className="drawer-content">
          {/* Search trong drawer */}
          <div className="drawer-search">
            <Input.Search
              placeholder="Tìm sách..."
              enterButton
              value={search}
              onChange={handleSearchInputChange}
              onSearch={handleSearch}
              style={{ marginBottom: 20 }}
            />
          </div>

          {/* Navigation items */}
          <div className="drawer-nav">
            {navItems.map((item) => (
              <div 
                key={item.path} 
                onClick={() => handleNav(item.path)} 
                className="drawer-item"
              >
                {item.label}
              </div>
            ))}
          </div>

          {/* User section trong drawer */}
          <div className="drawer-user">
            {user ? (
              <div>
                <div className="drawer-user-info">
                  <Avatar icon={<UserOutlined />} src={user.avatar} />
                  <span>{user.name}</span>
                </div>
                <div className="drawer-user-actions">
                  <Button 
                    type="text" 
                    icon={<UserOutlined />}
                    onClick={() => {
                      setOpen(false);
                      router.push('/profile');
                    }}
                    block
                  >
                    Thông tin cá nhân
                  </Button>
                  <Button 
                    type="text" 
                    icon={<LogoutOutlined />}
                    onClick={handleLogout}
                    block
                    danger
                  >
                    Đăng xuất
                  </Button>
                </div>
              </div>
            ) : (
              <div className="drawer-auth">
                <Button 
                  type="default" 
                  onClick={() => {
                    setOpen(false);
                    router.push('/register');
                  }}
                  block
                  style={{ marginBottom: 8 }}
                >
                  Đăng ký
                </Button>
                <Button 
                  type="primary" 
                  onClick={() => {
                    setOpen(false);
                    router.push('/login');
                  }}
                  block
                >
                  Đăng nhập
                </Button>
              </div>
            )}
          </div>
        </div>
      </Drawer>
    </header>
  );
};

export default Header;