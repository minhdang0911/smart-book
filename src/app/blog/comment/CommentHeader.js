'use client';

// components/CommentHeader.js
import { Avatar } from 'antd';

const CommentHeader = ({ onMainComment }) => (
    <div
        style={{
            backgroundColor: '#f7f8fc',
            padding: '12px 16px',
            borderRadius: '8px 8px 0 0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
        }}
        onClick={onMainComment}
    >
        <Avatar size={32} style={{ backgroundColor: '#e4e6ea' }}>
            <span style={{ color: '#65676b' }}>👤</span>
        </Avatar>
        <span style={{ color: '#65676b', fontSize: '14px' }}>Nhập bình luận mới của bạn</span>
        <span style={{ color: '#65676b', fontSize: '12px', marginLeft: 'auto' }}>✕</span>
    </div>
);

export default CommentHeader;
