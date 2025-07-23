'use client';
import {
    BellOutlined,
    BookOutlined,
    HomeOutlined,
    LogoutOutlined,
    MenuOutlined,
    SearchOutlined,
    ShopOutlined,
    ShoppingCartOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Avatar, Badge, Button, Divider, Drawer, Dropdown, Input, Space, Tooltip } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiGetMe } from '../../../../apis/user';
import useCategories from '../../hooks/useCategories';
import './Header.css';

const Header = () => {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [user, setUser] = useState(null);
    const [scrolled, setScrolled] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const { categories, isLoading: loadingCategories } = useCategories();

    const navItems = [
        {
            label: 'Trang chủ',
            path: '/',
            icon: <HomeOutlined />,
            color: '#1890ff',
        },
        {
            label: 'Ebooks',
            path: '/ebooks',
            icon: <BookOutlined />,
            color: '#52c41a',
        },
        {
            label: 'Sách bán',
            path: '/buybooks',
            icon: <ShoppingCartOutlined />,
            color: '#fa8c16',
        },
        {
            label: 'Bộ lọc',
            path: '/search',
            icon: <SearchOutlined />,
            color: '#722ed1',
        },
        {
            label: 'Bài viết',
            path: '/blog',
            icon: <ShopOutlined />,
            color: '#eb2f96',
        },
    ];

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Fetch cart count từ API count
    const fetchCartCount = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await fetch('http://localhost:8000/api/cart/count', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json(); // ✅ Thiếu dòng này

                if (data) {
                    setCartCount(data?.data?.count); // sẽ là 7 như kỳ vọng
                }
            } catch (error) {
                console.error('Error fetching cart count:', error);
            }
        }
    };

    // Tạo function để update cart count từ component khác
    const updateCartCount = () => {
        fetchCartCount();
    };

    // Expose updateCartCount function globally
    useEffect(() => {
        window.updateCartCount = updateCartCount;
        return () => {
            delete window.updateCartCount;
        };
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const getUserInfo = async () => {
                try {
                    const response = await apiGetMe(token);
                    if (response?.status === true) {
                        setUser(response?.user);
                        // Fetch cart count when user is logged in
                        fetchCartCount();
                    }
                } catch (error) {
                    console.error('Error getting user info:', error);
                }
            };
            getUserInfo();
        }
    }, []);

    // Listen for cart update events
    useEffect(() => {
        const handleCartUpdate = () => {
            fetchCartCount();
        };

        window.addEventListener('cartUpdated', handleCartUpdate);
        return () => {
            window.removeEventListener('cartUpdated', handleCartUpdate);
        };
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
        setCartCount(0);
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
                                SmartBook<span className="logo-accent">★</span>
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
                                    style={{ '--item-color': item.color }}
                                >
                                    <span className="nav-icon">{item.icon}</span>
                                    <span className="nav-label">{item.label}</span>
                                </div>
                            </Tooltip>
                        ))}

                        {/* Tách Dropdown ra ngoài map */}
                        <Dropdown
                            trigger={['hover']}
                            placement="bottom"
                            dropdownRender={() => (
                                <div className="dropdown-categories">
                                    {categories?.length > 0 ? (
                                        categories.map((cate) => (
                                            <div
                                                key={cate.id}
                                                className="dropdown-item"
                                                onClick={() => handleNav(`/search?category=${cate.id}`)}
                                            >
                                                {cate.name}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="dropdown-empty">Không có dữ liệu</div>
                                    )}
                                </div>
                            )}
                        >
                            <div className="nav-item" style={{ '--item-color': '#13c2c2' }}>
                                <span className="nav-icon">
                                    <ShopOutlined />
                                </span>
                                <span className="nav-label">Thể loại</span>
                            </div>
                        </Dropdown>
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
                                    <Button type="text" size="small" onClick={handleSearch} className="search-button">
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
                                {/* Cart Icon */}
                                <Badge count={cartCount} size="small" className="cart-badge">
                                    <Tooltip title="Giỏ hàng">
                                        <Button
                                            type="text"
                                            icon={<ShoppingCartOutlined />}
                                            className="cart-btn"
                                            onClick={() => router.push('/cart')}
                                        />
                                    </Tooltip>
                                </Badge>

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
                                            src={user?.avatar}
                                            size="default"
                                            className="user-avatar"
                                        />
                                        <div className="user-info">
                                            <span className="user-name">{user?.name}</span>
                                            <span className="user-role">Thành viên</span>
                                        </div>
                                    </div>
                                </Dropdown>
                            </div>
                        ) : (
                            <Space size="middle" className="auth-buttons">
                                <Button
                                    type="text"
                                    onClick={() => router.push('/login?mode=register')}
                                    className="register-btn"
                                >
                                    Đăng ký
                                </Button>

                                <Button type="primary" onClick={() => router.push('/login')} className="login-btn">
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
                        <span>SmarkBook</span>
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
                                style={{ '--item-color': item.color }}
                            >
                                <span className="drawer-nav-icon">{item.icon}</span>
                                <span className="drawer-nav-label">{item.label}</span>
                            </div>
                        ))}

                        {/* Cart in mobile menu */}
                        {user && (
                            <div
                                onClick={() => handleNav('/cart')}
                                className="drawer-nav-item"
                                style={{ '--item-color': '#fa541c' }}
                            >
                                <span className="drawer-nav-icon">
                                    <Badge count={cartCount} size="small">
                                        <ShoppingCartOutlined />
                                    </Badge>
                                </span>
                                <span className="drawer-nav-label">Giỏ hàng</span>
                            </div>
                        )}
                    </div>

                    <Divider />

                    {/* Mobile User Section */}
                    <div className="drawer-user-section">
                        {user ? (
                            <div className="drawer-user-logged">
                                <div className="drawer-user-profile">
                                    <Avatar icon={<UserOutlined />} src={user?.avatar} size="large" />
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
