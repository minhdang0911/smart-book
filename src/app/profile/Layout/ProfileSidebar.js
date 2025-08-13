'use client';

import {
    CloseOutlined,
    HeartOutlined,
    HistoryOutlined,
    MenuOutlined,
    UserAddOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';

const ProfileSidebar = ({ user, selectedKey = 'personal', onMenuSelect, children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth <= 768);
            if (window.innerWidth > 768) {
                setIsMobileMenuOpen(false);
            }
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const menuItems = [
        { key: 'personal', icon: <UserOutlined />, label: 'Thông tin cá nhân' },
        { key: 'favorites', icon: <HeartOutlined />, label: 'Danh sách yêu thích' },
        { key: 'history1', icon: <HistoryOutlined />, label: 'Lịch sử mua hàng' },
        { key: 'change-password', icon: <UserAddOutlined />, label: 'Đổi mật khẩu' },
    ];

    const handleMenuSelect = (key) => {
        onMenuSelect?.(key);
        if (isMobile) {
            setIsMobileMenuOpen(false);
        }
    };

    return (
        <div className="profile-container">
            <style jsx>{`
                .profile-container {
                    display: flex;
                    min-height: 100vh;
                    width: 100%;
                    background: #ffffff;
                    position: relative;
                }

                /* Mobile Menu Toggle */
                .mobile-menu-toggle {
                    display: none;
                    position: fixed;
                    top: 20px;
                    left: 20px;
                    z-index: 1001;
                    background: #ffffff;
                    border: 1px solid #e9ecef;
                    border-radius: 8px;
                    padding: 12px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .mobile-menu-toggle:hover {
                    background: #f8f9fa;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }

                /* Sidebar */
                .sidebar {
                    width: 280px;
                    background: #f8f9fa;
                    border-right: 1px solid #e9ecef;
                    height: 100vh;
                    position: sticky;
                    top: 0;
                    display: flex;
                    flex-direction: column;
                    transition: transform 0.3s ease;
                    z-index: 1000;
                }

                .sidebar-header {
                    padding: 24px 20px;
                    border-bottom: 1px solid #e9ecef;
                    background: #ffffff;
                    position: relative;
                }

                .close-mobile-menu {
                    display: none;
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background: none;
                    border: none;
                    font-size: 18px;
                    cursor: pointer;
                    color: #6c757d;
                    padding: 4px;
                    border-radius: 4px;
                    transition: all 0.2s ease;
                }

                .close-mobile-menu:hover {
                    background: #f8f9fa;
                    color: #212529;
                }

                .user-info {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .user-avatar {
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid #ffffff;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                    color: #ffffff;
                    font-size: 24px;
                    position: relative;
                }

                .user-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .user-details h4 {
                    font-size: 18px;
                    font-weight: 700;
                    color: #212529;
                    margin: 0 0 4px 0;
                    line-height: 1.2;
                }

                .user-details p {
                    font-size: 13px;
                    color: #6c757d;
                    margin: 0;
                    font-weight: 500;
                }

                .menu-list {
                    flex: 1;
                    padding: 12px 0;
                    list-style: none;
                    margin: 0;
                }

                .menu-item {
                    display: block;
                    width: 100%;
                    padding: 16px 20px;
                    background: none;
                    border: none;
                    text-align: left;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    color: #495057;
                    font-size: 14px;
                    font-weight: 500;
                    position: relative;
                    margin: 2px 0;
                }

                .menu-item:hover {
                    background: linear-gradient(90deg, rgba(24, 144, 255, 0.05) 0%, rgba(24, 144, 255, 0.02) 100%);
                    color: #1890ff;
                    transform: translateX(4px);
                }

                .menu-item.active {
                    background: linear-gradient(90deg, rgba(24, 144, 255, 0.1) 0%, rgba(24, 144, 255, 0.05) 100%);
                    color: #1890ff;
                    font-weight: 600;
                    transform: translateX(4px);
                }

                .menu-item.active::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 4px;
                    background: linear-gradient(180deg, #1890ff 0%, #40a9ff 100%);
                    border-radius: 0 4px 4px 0;
                }

                .menu-item-content {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .menu-icon {
                    font-size: 18px;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    transition: transform 0.2s ease;
                }

                .menu-item:hover .menu-icon {
                    transform: scale(1.1);
                }

                .content-area {
                    flex: 1;
                    background: #ffffff;
                    overflow-y: auto;
                    padding: 0;
                    margin: 0;
                    min-height: 100vh;
                }

                .content-wrapper {
                    width: 100%;
                    height: 100%;
                    padding: 0;
                    margin: 0;
                }

                /* Mobile Overlay */
                .mobile-overlay {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 999;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .mobile-overlay.active {
                    opacity: 1;
                }

                /* Mobile Styles */
                @media (max-width: 768px) {
                    .mobile-menu-toggle {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }

                    .mobile-overlay {
                        display: block;
                    }

                    .sidebar {
                        position: fixed;
                        top: 0;
                        left: 0;
                        transform: translateX(-100%);
                        width: 320px;
                        max-width: 85vw;
                        box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);
                        border-right: none;
                    }

                    .sidebar.open {
                        transform: translateX(0);
                    }

                    .close-mobile-menu {
                        display: block;
                    }

                    .content-area {
                        width: 100%;
                        padding-top: 60px;
                    }

                    .user-info {
                        gap: 12px;
                        padding-right: 40px;
                    }

                    .user-avatar {
                        width: 48px;
                        height: 48px;
                        font-size: 20px;
                    }

                    .user-details h4 {
                        font-size: 16px;
                    }

                    .user-details p {
                        font-size: 12px;
                    }

                    .menu-item {
                        padding: 18px 20px;
                        font-size: 15px;
                    }

                    .menu-icon {
                        font-size: 20px;
                        width: 26px;
                        height: 26px;
                    }
                }

                /* Tablet Styles */
                @media (max-width: 1024px) and (min-width: 769px) {
                    .sidebar {
                        width: 240px;
                    }

                    .user-details h4 {
                        font-size: 16px;
                    }

                    .menu-item {
                        padding: 14px 16px;
                    }

                    .menu-item-content {
                        gap: 12px;
                    }
                }

                /* Enhanced animations */
                @media (prefers-reduced-motion: no-preference) {
                    .sidebar {
                        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    }

                    .menu-item {
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    }

                    .mobile-overlay {
                        transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    }
                }

                /* Dark mode support (if needed) */
                @media (prefers-color-scheme: dark) {
                    .profile-container {
                        background: #141414;
                    }

                    .sidebar {
                        background: #1f1f1f;
                        border-right-color: #303030;
                    }

                    .sidebar-header {
                        background: #262626;
                        border-bottom-color: #303030;
                    }

                    .user-details h4 {
                        color: #ffffff;
                    }

                    .user-details p {
                        color: #8c8c8c;
                    }

                    .menu-item {
                        color: #d9d9d9;
                    }

                    .menu-item:hover {
                        background: linear-gradient(90deg, rgba(24, 144, 255, 0.1) 0%, rgba(24, 144, 255, 0.05) 100%);
                        color: #40a9ff;
                    }

                    .menu-item.active {
                        color: #40a9ff;
                        background: linear-gradient(90deg, rgba(24, 144, 255, 0.15) 0%, rgba(24, 144, 255, 0.08) 100%);
                    }

                    .mobile-menu-toggle {
                        background: #262626;
                        border-color: #303030;
                        color: #ffffff;
                    }

                    .mobile-menu-toggle:hover {
                        background: #1f1f1f;
                    }

                    .content-area {
                        background: #141414;
                    }
                }
            `}</style>

            {/* Mobile Menu Toggle Button */}
            {isMobile && (
                <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(true)} aria-label="Mở menu">
                    <MenuOutlined />
                </button>
            )}

            {/* Mobile Overlay */}
            {isMobile && (
                <div
                    className={`mobile-overlay ${isMobileMenuOpen ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    {isMobile && (
                        <button
                            className="close-mobile-menu"
                            onClick={() => setIsMobileMenuOpen(false)}
                            aria-label="Đóng menu"
                        >
                            <CloseOutlined />
                        </button>
                    )}

                    <div className="user-info">
                        <div className="user-avatar">
                            {user?.avatar_url || user?.avatar ? (
                                <img
                                    src={user.avatar_url || user.avatar}
                                    alt="Avatar"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentNode.innerHTML =
                                            '<span style="font-size: 24px;"><svg viewBox="64 64 896 896" style="width: 24px; height: 24px; fill: currentColor;"><path d="M858.5 763.6a374 374 0 00-80.6-119.5 375.63 375.63 0 00-119.5-80.6c-.4-.2-.8-.3-1.2-.5C719.5 518 760 444.7 760 362c0-137-111-248-248-248S264 225 264 362c0 82.7 40.5 156 102.8 201.1-.4.2-.8.3-1.2.5-44.8 18.9-85 46-119.5 80.6a375.63 375.63 0 00-80.6 119.5A371.7 371.7 0 00136 901.8a8 8 0 008 8.2h60c4.4 0 7.9-3.5 8-7.8 2-77.2 33-149.5 87.8-204.3 56.7-56.7 132-87.9 212.2-87.9s155.5 31.2 212.2 87.9C779 752.7 810 825 812 902.2c.1 4.4 3.6 7.8 8 7.8h60a8 8 0 008-8.2c-1-47.8-10.9-94.3-29.5-138.2zM512 534c-45.9 0-89.1-17.9-121.6-50.4S340 407.9 340 362c0-45.9 17.9-89.1 50.4-121.6S466.1 190 512 190s89.1 17.9 121.6 50.4S684 316.1 684 362c0 45.9-17.9 89.1-50.4 121.6S557.9 534 512 534z"></path></svg></span>';
                                    }}
                                />
                            ) : (
                                <UserOutlined />
                            )}
                        </div>
                        <div className="user-details">
                            <h4>{user?.name || 'Tên người dùng'}</h4>
                            <p>Quản lý tài khoản</p>
                        </div>
                    </div>
                </div>

                <nav className="menu-list">
                    {menuItems.map((item) => (
                        <button
                            key={item.key}
                            className={`menu-item ${selectedKey === item.key ? 'active' : ''}`}
                            onClick={() => handleMenuSelect(item.key)}
                        >
                            <div className="menu-item-content">
                                <span className="menu-icon">{item.icon}</span>
                                <span>{item.label}</span>
                            </div>
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Content Area */}
            <main className="content-area">
                <div className="content-wrapper">
                    {children || (
                        <div
                            style={{
                                padding: '40px',
                                textAlign: 'center',
                                color: '#6c757d',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                            }}
                        >
                            <h3 style={{ margin: 0 }}>Chọn một mục từ menu để xem nội dung</h3>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ProfileSidebar;
