import { useEffect, useState } from 'react';

// Icons as SVG components
const CheckIcon = () => (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
        <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
        />
    </svg>
);

const ErrorIcon = () => (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
        <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
        />
    </svg>
);

const WarningIcon = () => (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
        <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
        />
    </svg>
);

const InfoIcon = () => (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
        <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
        />
    </svg>
);

const LoadingIcon = () => (
    <svg
        width="16"
        height="16"
        fill="currentColor"
        viewBox="0 0 24 24"
        style={{ animation: 'spin 1s linear infinite' }}
    >
        <circle
            cx="12"
            cy="12"
            r="3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="16"
            strokeDashoffset="16"
            style={{ animation: 'dash 1.5s ease-in-out infinite' }}
        />
    </svg>
);

// Single Message Component
const Message = ({ type = 'info', content, duration = 3000, onClose }) => {
    const [visible, setVisible] = useState(true);
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                setIsLeaving(true);
                setTimeout(() => {
                    setVisible(false);
                    onClose && onClose();
                }, 300);
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    if (!visible) return null;

    const getTypeConfig = () => {
        const configs = {
            success: {
                backgroundColor: '#f6ffed',
                borderColor: '#b7eb8f',
                color: '#52c41a',
                icon: <CheckIcon />,
            },
            error: {
                backgroundColor: '#fff2f0',
                borderColor: '#ffccc7',
                color: '#ff4d4f',
                icon: <ErrorIcon />,
            },
            warning: {
                backgroundColor: '#fffbe6',
                borderColor: '#ffe58f',
                color: '#faad14',
                icon: <WarningIcon />,
            },
            info: {
                backgroundColor: '#f6ffff',
                borderColor: '#87e8de',
                color: '#13c2c2',
                icon: <InfoIcon />,
            },
            loading: {
                backgroundColor: '#fafafa',
                borderColor: '#d9d9d9',
                color: '#595959',
                icon: <LoadingIcon />,
            },
        };
        return configs[type] || configs.info;
    };

    const config = getTypeConfig();

    const messageStyle = {
        position: 'fixed',
        top: '24px',
        left: '50%',
        transform: isLeaving ? 'translateX(-50%) translateY(-100%)' : 'translateX(-50%) translateY(0)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',

        border: `1px solid ${config.borderColor}`,
        borderRadius: '6px',
        color: config.color,
        fontSize: '14px',
        fontWeight: '400',
        boxShadow:
            '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.3s ease',
        opacity: isLeaving ? 0 : 1,
        minWidth: '200px',
        maxWidth: '400px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    };

    const keyframes = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes dash {
      0% { stroke-dashoffset: 16; }
      50% { stroke-dashoffset: 0; }
      100% { stroke-dashoffset: -16; }
    }
  `;

    return (
        <>
            <style>{keyframes}</style>
            <div style={messageStyle}>
                {config.icon}
                <span>{content}</span>
            </div>
        </>
    );
};

// Message Container to manage multiple messages
const MessageContainer = () => {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        // Expose message methods to global scope
        window.message = {
            success: (content, duration = 3000) => addMessage('success', content, duration),
            error: (content, duration = 3000) => addMessage('error', content, duration),
            warning: (content, duration = 3000) => addMessage('warning', content, duration),
            info: (content, duration = 3000) => addMessage('info', content, duration),
            loading: (content, duration = 0) => addMessage('loading', content, duration),
            destroy: () => setMessages([]),
        };
    }, []);

    const addMessage = (type, content, duration) => {
        const id = Date.now() + Math.random();
        const newMessage = { id, type, content, duration };

        setMessages((prev) => [...prev, newMessage]);
    };

    const removeMessage = (id) => {
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
    };

    const containerStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        pointerEvents: 'none',
    };

    return (
        <div style={containerStyle}>
            {messages.map((msg, index) => (
                <div
                    key={msg.id}
                    style={{
                        position: 'absolute',
                        top: `${24 + index * 50}px`,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        pointerEvents: 'auto',
                    }}
                >
                    <Message
                        type={msg.type}
                        content={msg.content}
                        duration={msg.duration}
                        onClose={() => removeMessage(msg.id)}
                    />
                </div>
            ))}
        </div>
    );
};

export default MessageContainer;
