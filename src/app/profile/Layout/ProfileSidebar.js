import { HeartOutlined, HistoryOutlined, UserAddOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Menu, Typography } from 'antd';

const { Title, Text } = Typography;

const ProfileSidebar = ({ user, selectedKey, onMenuSelect }) => {
    const menuItems = [
        { key: 'personal', icon: <UserOutlined />, label: 'Thông tin cá nhân' },
        { key: 'favorites', icon: <HeartOutlined />, label: 'Danh sách yêu thích' },
        { key: 'history1', icon: <HistoryOutlined />, label: 'Lịch sử mua hàng' },
        { key: 'change-password', icon: <UserAddOutlined />, label: 'Đổi mật khẩu' },
    ];

    return (
        <>
            <div className="sider-header">
                <Avatar size={80} src={user?.avatar} icon={<UserOutlined />} className="sider-avatar" />
                <Title level={4} style={{ margin: '0 0 4px 0', color: 'white' }}>
                    {user?.name}
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.8)' }}>Trang cá nhân</Text>
            </div>
            <Menu
                mode="inline"
                selectedKeys={[selectedKey]}
                onClick={({ key }) => onMenuSelect(key)}
                className="sider-menu"
                items={menuItems}
            />
        </>
    );
};

export default ProfileSidebar;
