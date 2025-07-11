'use client';
// components/CommentCount.js

const CommentCount = ({ count }) => (
    <div
        style={{
            padding: '16px',
            borderBottom: '1px solid #e4e6ea',
        }}
    >
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
            }}
        >
            <span style={{ fontSize: '16px', fontWeight: '600' }}>{count} bình luận</span>
            <span style={{ fontSize: '12px', color: '#65676b' }}>
                Nếu thấy bình luận spam, các bạn báo report giúp admin nhé
            </span>
        </div>
    </div>
);

export default CommentCount;
