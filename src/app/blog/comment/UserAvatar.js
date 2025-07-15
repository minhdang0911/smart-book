'use client';

// components/UserAvatar.js
import { Avatar } from 'antd';

const UserAvatar = ({ user, size = 40 }) => {
    const getUserAvatar = (user) => {
        if (!user) return 'ẨN';

        if (user.avatar) {
            return user.avatar;
        }

        if (user.name) {
            return user.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase();
        }

        return 'ẨN';
    };

    const avatarContent = getUserAvatar(user);

    return (
        <Avatar
            size={size}
            style={{ backgroundColor: '#1877f2' }}
            src={user?.avatar || undefined} // nếu có ảnh thì hiển thị ảnh
        >
            {!user?.avatar && avatarContent}
        </Avatar>
    );
};

export default UserAvatar;
