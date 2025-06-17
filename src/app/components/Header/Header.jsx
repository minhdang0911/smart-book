'use client';
import React, { useState, useEffect } from 'react';
import { MenuOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { Drawer, Button, Input, Dropdown, Space, Avatar } from 'antd';
import { useRouter } from 'next/navigation';
import './Header.css';
import {apiGetMe} from '../../../../apis/user'
const Header = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [user, setUser] = useState(null); // Dữ liệu người dùng

  const navItems = [
    { label: 'Ebooks', path: '/ebooks' },
    { label: 'Sách bán', path: '/buybooks' },
    { label: 'Waka Shop', path: '/shop' },
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    const getUserInfo = async () =>{
      const response = await apiGetMe(token)
      if(response?.status === true){
        setUser(response?.user)
      }
    }
    getUserInfo()
  }, []);
 
  const handleNav = (path) => {
    setOpen(false);
    router.push(path);
  };

  const handleSearch = () => {
    if (search.trim() !== '') {
      router.push(`/search?keyword=${encodeURIComponent(search)}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  const userMenu = {
    items: [
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
            placeholder="Tìm sách..."
            enterButton
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
        </div>

        {/* Hiển thị người dùng hoặc đăng nhập */}
        <div className="auth-section">
          {user ? (
            <Dropdown menu={userMenu} placement="bottomRight">
              <Space style={{ color: 'white', cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                {user.name}
              </Space>
            </Dropdown>
          ) : (
            <Button onClick={() => router.push('/login')}>Đăng nhập</Button>
          )}
        </div>

        {/* Icon mở menu drawer */}
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
        title="Danh mục"
        placement="left"
        onClose={() => setOpen(false)}
        open={open}
      >
        {navItems.map((item) => (
          <p key={item.path} onClick={() => handleNav(item.path)} className="drawer-item">
            {item.label}
          </p>
        ))}
      </Drawer>
    </header>
  );
};

export default Header;
