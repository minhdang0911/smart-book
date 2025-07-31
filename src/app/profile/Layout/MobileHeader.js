import { MenuOutlined } from '@ant-design/icons';
import { Button, Typography } from 'antd';

const { Title } = Typography;

const MobileHeader = ({ onMenuToggle }) => {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px',
            }}
        >
            <Title level={4} style={{ margin: 0, color: '#1a1a1a' }}>
                Trang cá nhân
            </Title>
            <Button
                className="mobile-menu-btn"
                icon={<MenuOutlined />}
                onClick={onMenuToggle}
                style={{ display: 'block' }}
            />
        </div>
    );
};

export default MobileHeader;
