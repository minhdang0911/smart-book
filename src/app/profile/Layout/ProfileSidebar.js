'use client';

import { HeartOutlined, HistoryOutlined, UserAddOutlined, UserOutlined } from '@ant-design/icons';

const ProfileSidebar = ({ user, selectedKey = 'personal', onMenuSelect, children }) => {
    const menuItems = [
        { key: 'personal', icon: <UserOutlined />, label: 'Thông tin cá nhân' },
        { key: 'favorites', icon: <HeartOutlined />, label: 'Danh sách yêu thích' },
        { key: 'history1', icon: <HistoryOutlined />, label: 'Lịch sử mua hàng' },
        { key: 'change-password', icon: <UserAddOutlined />, label: 'Đổi mật khẩu' },
    ];

    // Debug để kiểm tra user data
    console.log('ProfileSidebar user data:', user);
    console.log('Avatar URL:', user?.avatar_url);

    return (
        <div className="profile-layout">
            <style jsx>{`
                :root {
                    --bg: #f7f9fc;
                    --card: #ffffff;
                    --ink: #0f172a; /* slate-900 */
                    --muted: #64748b; /* slate-500/600 */
                    --line: #e5e7eb; /* gray-200 */
                    --accent: #4f46e5; /* indigo-600 */
                    --accent-50: #eef2ff; /* indigo-50 */
                }

                .profile-layout {
                    display: flex;
                    min-height: 100vh;
                    background: var(--bg);
                    color: var(--ink);
                }

                /* Sidebar (light) */
                .sidebar {
                    width: 300px;
                    background: var(--card);
                    border-right: 1px solid var(--line);
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    position: sticky;
                    top: 0;
                }

                .sidebar-header {
                    padding: 24px 20px;
                    border-bottom: 1px solid var(--line);
                }

                .user-box {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }

                .user-avatar {
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    background: #f1f5f9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid var(--line);
                    overflow: hidden;
                    color: #334155;
                    font-size: 24px;
                    position: relative;
                }

                .user-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 50%;
                }

                .user-name {
                    font-size: 16px;
                    font-weight: 700;
                    margin: 0;
                }
                .user-subtitle {
                    font-size: 12px;
                    color: var(--muted);
                    margin-top: 2px;
                }

                .wallet {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: 14px;
                }
                .coin {
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: #facc15;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: 700;
                    color: #1f2937;
                }
                .wallet small {
                    color: var(--muted);
                }

                .actions {
                    display: flex;
                    gap: 8px;
                    margin-top: 14px;
                }
                .btn {
                    flex: 1;
                    font-size: 12px;
                    padding: 8px 10px;
                    border-radius: 999px;
                    border: 1px solid var(--line);
                    background: #fff;
                    color: #111;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.02);
                }
                .btn:hover {
                    border-color: #c7d2fe;
                    background: var(--accent-50);
                }

                .menu-section {
                    padding: 8px 8px;
                    overflow-y: auto;
                }
                .menu-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 12px;
                    width: 100%;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    border-radius: 10px;
                    color: #334155;
                    transition: background 0.15s, color 0.15s;
                }
                .menu-item:hover {
                    background: #f3f4f6;
                }
                .menu-item.active {
                    background: var(--accent-50);
                    color: #1e1b4b; /* deep indigo text */
                    box-shadow: inset 0 0 0 1px #c7d2fe;
                }
                .menu-icon :global(svg) {
                    color: var(--accent);
                }

                /* Main content card */
                .main {
                    flex: 1;
                    padding: 24px;
                    display: flex;
                }
                .card {
                    flex: 1;
                    background: var(--card);
                    border: 1px solid var(--line);
                    border-radius: 16px;
                    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
                    padding: 16px;
                }

                /* Mobile */
                @media (max-width: 768px) {
                    .profile-layout {
                        flex-direction: column;
                    }
                    .sidebar {
                        width: 100%;
                        height: auto;
                        position: relative;
                    }
                    .menu-section {
                        display: flex;
                        overflow-x: auto;
                        padding: 8px;
                    }
                    .menu-item {
                        min-width: 160px;
                        justify-content: flex-start;
                    }
                    .main {
                        padding: 16px;
                    }
                    .card {
                        padding: 12px;
                    }
                }
            `}</style>

            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="user-box">
                        <div className="user-avatar">
                            {user?.avatar_url ? (
                                <img
                                    src={user.avatar_url}
                                    alt="Avatar"
                                    onError={(e) => {
                                        console.log('Image failed to load:', user.avatar_url);
                                        e.target.style.display = 'none';
                                        // Show icon when image fails
                                        const iconElement = document.createElement('span');
                                        iconElement.innerHTML =
                                            '<svg viewBox="64 64 896 896" focusable="false" data-icon="user" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M858.5 763.6a374 374 0 00-80.6-119.5 375.63 375.63 0 00-119.5-80.6c-.4-.2-.8-.3-1.2-.5C719.5 518 760 444.7 760 362c0-137-111-248-248-248S264 225 264 362c0 82.7 40.5 156 102.8 201.1-.4.2-.8.3-1.2.5-44.8 18.9-85 46-119.5 80.6a375.63 375.63 0 00-80.6 119.5A371.7 371.7 0 00136 901.8a8 8 0 008 8.2h60c4.4 0 7.9-3.5 8-7.8 2-77.2 33-149.5 87.8-204.3 56.7-56.7 132-87.9 212.2-87.9s155.5 31.2 212.2 87.9C779 752.7 810 825 812 902.2c.1 4.4 3.6 7.8 8 7.8h60a8 8 0 008-8.2c-1-47.8-10.9-94.3-29.5-138.2zM512 534c-45.9 0-89.1-17.9-121.6-50.4S340 407.9 340 362c0-45.9 17.9-89.1 50.4-121.6S466.1 190 512 190s89.1 17.9 121.6 50.4S684 316.1 684 362c0 45.9-17.9 89.1-50.4 121.6S557.9 534 512 534z"></path></svg>';
                                        iconElement.style.fontSize = '24px';
                                        iconElement.style.color = '#334155';
                                        e.target.parentNode.appendChild(iconElement);
                                    }}
                                />
                            ) : (
                                <UserOutlined />
                            )}
                        </div>
                        <div>
                            <p className="user-name">{user?.name || 'Tên người dùng'}</p>
                            <p className="user-subtitle">Quản lý tài khoản</p>
                        </div>
                    </div>
                </div>

                <div className="menu-section">
                    {menuItems.map((item) => (
                        <button
                            key={item.key}
                            className={`menu-item ${selectedKey === item.key ? 'active' : ''}`}
                            onClick={() => onMenuSelect?.(item.key)}
                        >
                            <span className="menu-icon">{item.icon}</span>
                            <span className="menu-label">{item.label}</span>
                        </button>
                    ))}
                </div>
            </aside>

            {/* Content */}
            <main className="main">
                <div className="card">
                    {children || (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                            <h3 style={{ margin: 0 }}>Chọn một mục từ menu để xem nội dung</h3>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ProfileSidebar;
