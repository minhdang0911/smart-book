import { HeartOutlined, HistoryOutlined, UserAddOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Drawer, Menu } from 'antd';

const MobileDrawer = ({ open, onClose, user, selectedKey, onMenuSelect }) => {
    const menuItems = [
        { key: 'personal', icon: <UserOutlined />, label: 'Thông tin cá nhân' },
        { key: 'favorites', icon: <HeartOutlined />, label: 'Danh sách yêu thích' },
        { key: 'history', icon: <HistoryOutlined />, label: 'Lịch sử mua hàng' },
        { key: 'change-password', icon: <UserAddOutlined />, label: 'Đổi mật khẩu' },
    ];

    const handleMenuClick = ({ key }) => {
        onMenuSelect(key);
        onClose();
    };

    return (
        <Drawer
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Avatar size={40} src={user?.avatar} icon={<UserOutlined />} />
                    <span>{user?.name}</span>
                </div>
            }
            placement="left"
            onClose={onClose}
            open={open}
            bodyStyle={{ padding: 0 }}
            className="mobile-drawer"
        >
            <Menu mode="inline" selectedKeys={[selectedKey]} onClick={handleMenuClick} items={menuItems} />
        </Drawer>
    );
};

export default MobileDrawer;
