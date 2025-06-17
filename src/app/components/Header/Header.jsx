'use client';
import React, { useState, useEffect } from 'react';
import { 
  MenuOutlined, 
  UserOutlined, 
  LogoutOutlined, 
  SearchOutlined,
  BookOutlined,
  ShoppingCartOutlined,
  HomeOutlined,
  ShopOutlined,
  BellOutlined
} from '@ant-design/icons';
import { 
  Drawer, 
  Button, 
  Input, 
  Dropdown, 
  Space, 
  Avatar, 
  Badge,
  Tooltip,
  Divider
} from 'antd';
import { useRouter } from 'next/navigation';
import './Header.css';
import { apiGetMe } from '../../../../apis/user';

const Header = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  const navItems = [
    { 
      label: 'Trang chủ', 
      path: '/', 
      icon: <HomeOutlined />,
      color: '#1890ff'
    },
    { 
      label: 'Ebooks', 
      path: '/ebooks', 
      icon: <BookOutlined />,
      color: '#52c41a'
    },
    { 
      label: 'Sách bán', 
      path: '/buybooks', 
      icon: <ShoppingCartOutlined />,
      color: '#fa8c16'
    },
    { 
      label: 'Tất cả sách', 
      path: '/search', 
      icon: <SearchOutlined />,
      color: '#722ed1'
    },
    { 
      label: 'Waka Shop', 
      path: '/shop', 
      icon: <ShopOutlined />,
      color: '#eb2f96'
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      router.push(`/search?keyword=${encodeURIComponent(search.trim())}`);
      setSearch('');
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
        key: 'notifications',
        icon: <BellOutlined />,
        label: <span onClick={() => router.push('/notifications')}>Thông báo</span>,
      },
      {
        type: 'divider',
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: <span onClick={handleLogout}>Đăng xuất</span>,
        danger: true,
      },
    ],
  };

  return (
    <header className={`header ${scrolled ? 'header-scrolled' : ''}`}>
      <div className="header-container">
        <div className="header-content">
          {/* Logo Section */}
          <div className="logo-section" onClick={() => router.push('/')}>
            <div className="logo">
              <BookOutlined className="logo-icon" />
              <span className="logo-text">
                WAKA<span className="logo-accent">★</span>
              </span>
            </div>
          </div>

          {/* Navigation Desktop */}
          <nav className="navigation-desktop">
            {navItems.map((item) => (
              <Tooltip key={item.path} title={item.label} placement="bottom">
                <div 
                  className="nav-item"
                  onClick={() => handleNav(item.path)}
                  style={{'--item-color': item.color}}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </div>
              </Tooltip>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="search-section">
            <div className="search-wrapper">
              <Input
                placeholder="Tìm sách theo tên, tác giả..."
                value={search}
                onChange={handleSearchInputChange}
                onPressEnter={handleSearchKeyPress}
                className="search-input"
                prefix={<SearchOutlined className="search-icon" />}
                suffix={
                  <Button 
                    type="text" 
                    size="small"
                    onClick={handleSearch}
                    className="search-button"
                  >
                    Tìm
                  </Button>
                }
                allowClear
              />
            </div>
          </div>

          {/* Auth Section */}
          <div className="auth-section">
            {user ? (
              <div className="user-section">
                <Badge count={3} size="small" className="notification-badge">
                  <Button 
                    type="text" 
                    icon={<BellOutlined />} 
                    className="notification-btn"
                    onClick={() => router.push('/notifications')}
                  />
                </Badge>
                
                <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
                  <div className="user-profile">
                    <Avatar 
                      icon={<UserOutlined />} 
                      src={user.avatar}
                      size="default"
                      className="user-avatar"
                    />
                    <div className="user-info">
                      <span className="user-name">{user.name}</span>
                      <span className="user-role">Thành viên</span>
                    </div>
                  </div>
                </Dropdown>
              </div>
            ) : (
              <Space size="middle" className="auth-buttons">
                <Button 
                  type="text" 
                  onClick={() => router.push('/register')}
                  className="register-btn"
                >
                  Đăng ký
                </Button>
                <Button 
                  type="primary" 
                  onClick={() => router.push('/login')}
                  className="login-btn"
                >
                  Đăng nhập
                </Button>
              </Space>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="mobile-menu">
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setOpen(true)}
              className="hamburger-btn"
            />
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <Drawer
        title={
          <div className="drawer-header">
            <BookOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            <span>WAKA Menu</span>
          </div>
        }
        placement="left"
        onClose={() => setOpen(false)}
        open={open}
        width={320}
        className="mobile-drawer"
      >
        <div className="drawer-content">
          {/* Mobile Search */}
          <div className="drawer-search">
            <Input
              placeholder="Tìm sách..."
              value={search}
              onChange={handleSearchInputChange}
              onPressEnter={handleSearch}
              prefix={<SearchOutlined />}
              suffix={
                <Button type="link" size="small" onClick={handleSearch}>
                  Tìm
                </Button>
              }
              allowClear
            />
          </div>

          <Divider />

          {/* Mobile Navigation */}
          <div className="drawer-navigation">
            {navItems.map((item) => (
              <div 
                key={item.path} 
                onClick={() => handleNav(item.path)} 
                className="drawer-nav-item"
                style={{'--item-color': item.color}}
              >
                <span className="drawer-nav-icon">{item.icon}</span>
                <span className="drawer-nav-label">{item.label}</span>
              </div>
            ))}
          </div>

          <Divider />

          {/* Mobile User Section */}
          <div className="drawer-user-section">
            {user ? (
              <div className="drawer-user-logged">
                <div className="drawer-user-profile">
                  <Avatar 
                    icon={<UserOutlined />} 
                    src={user.avatar}
                    size="large"
                  />
                  <div className="drawer-user-info">
                    <div className="drawer-user-name">{user.name}</div>
                    <div className="drawer-user-role">Thành viên</div>
                  </div>
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
                    className="drawer-action-btn"
                  >
                    Thông tin cá nhân
                  </Button>
                  <Button 
                    type="text" 
                    icon={<BellOutlined />}
                    onClick={() => {
                      setOpen(false);
                      router.push('/notifications');
                    }}
                    block
                    className="drawer-action-btn"
                  >
                    Thông báo
                  </Button>
                  <Button 
                    type="text" 
                    icon={<LogoutOutlined />}
                    onClick={handleLogout}
                    block
                    danger
                    className="drawer-action-btn logout-btn"
                  >
                    Đăng xuất
                  </Button>
                </div>
              </div>
            ) : (
              <div className="drawer-auth-section">
                <Button 
                  type="default" 
                  onClick={() => {
                    setOpen(false);
                    router.push('/register');
                  }}
                  block
                  size="large"
                  className="drawer-register-btn"
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
                  size="large"
                  className="drawer-login-btn"
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