'use client';

// components/UserAvatar.js
import { Avatar } from 'antd';

const UserAvatar = ({ user, size = 40 }) => {
    const getUserAvatar = (user) => {
        if (user.avatar) {
            return user.avatar;
        }
        return user.name
            ?.split(' ')
            .map((name) => name[0])
            .join('')
            .toUpperCase();
    };

    return (
        <Avatar size={size} style={{ backgroundColor: '#1877f2' }}>
            {getUserAvatar(user)}
        </Avatar>
    );
};

export default UserAvatar;
