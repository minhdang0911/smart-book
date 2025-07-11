'use client';
// components/ToolbarButton.js

const ToolbarButton = ({ icon, title }) => (
    <button
        style={{
            background: 'none',
            border: 'none',
            padding: '4px 6px',
            borderRadius: '4px',
            cursor: 'pointer',
            color: '#65676b',
            display: 'flex',
            alignItems: 'center',
            fontSize: '14px',
        }}
        title={title}
    >
        {icon}
    </button>
);

export default ToolbarButton;
