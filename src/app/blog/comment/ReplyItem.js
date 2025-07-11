'use client';

// components/ReplyItem.js
import { formatTime } from '../../utils/timeUtils';
import ReactionButton from './ReactionButton';
import UserAvatar from './UserAvatar';

const ReplyItem = ({ reply, onReply }) => {
    return (
        <div style={{ marginTop: '12px', marginLeft: '52px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
                <UserAvatar user={reply.user} size={32} />
                <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: '4px' }}>
                        <span
                            style={{
                                fontWeight: 'bold',
                                color: '#1877f2',
                                fontSize: '13px',
                                cursor: 'pointer',
                            }}
                        >
                            {reply.user.name}
                        </span>
                        <span
                            style={{
                                color: '#65676b',
                                fontSize: '11px',
                                marginLeft: '8px',
                            }}
                        >
                            {formatTime(reply.created_at)}
                        </span>
                    </div>
                    <div
                        style={{
                            fontSize: '13px',
                            lineHeight: '1.4',
                            marginBottom: '6px',
                        }}
                    >
                        {reply.content}
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            fontSize: '11px',
                            position: 'relative',
                        }}
                    >
                        <ReactionButton itemId={reply.id} buttonStyle={{ fontSize: '11px' }} />

                        <button
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#65676b',
                                cursor: 'pointer',
                                fontWeight: '500',
                                fontSize: '11px',
                                padding: '4px 8px',
                                borderRadius: '4px',
                            }}
                            onClick={() => onReply(reply)}
                        >
                            Phản hồi
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReplyItem;
