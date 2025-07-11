'use client';

// components/CommentItem.js
import { MoreOutlined } from '@ant-design/icons';
import { formatTime } from '../../utils/timeUtils';
import ReactionButton from './ReactionButton';
import ReplyItem from './ReplyItem';
import UserAvatar from './UserAvatar';

const CommentItem = ({ comment, onReply }) => (
    <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
            <UserAvatar user={comment.user} />
            <div style={{ flex: 1 }}>
                <div style={{ marginBottom: '4px' }}>
                    <span
                        style={{
                            fontWeight: 'bold',
                            color: '#1877f2',
                            fontSize: '14px',
                            cursor: 'pointer',
                        }}
                    >
                        {comment.user.name}
                    </span>
                    <span
                        style={{
                            color: '#65676b',
                            fontSize: '12px',
                            marginLeft: '8px',
                        }}
                    >
                        {formatTime(comment.created_at)}
                    </span>
                </div>
                <div
                    style={{
                        fontSize: '14px',
                        lineHeight: '1.4',
                        marginBottom: '8px',
                    }}
                >
                    {comment.content}
                </div>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        fontSize: '12px',
                    }}
                >
                    <ReactionButton itemId={comment.id} buttonStyle={{ fontSize: '12px' }} />

                    <button
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#65676b',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '12px',
                        }}
                        onClick={() => onReply(comment)}
                    >
                        Phản hồi
                    </button>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginLeft: 'auto',
                        }}
                    >
                        <MoreOutlined style={{ color: '#65676b', cursor: 'pointer' }} />
                    </div>
                </div>

                {/* Replies */}
                {comment.replies &&
                    comment.replies.map((reply) => <ReplyItem key={reply.id} reply={reply} onReply={onReply} />)}
            </div>
        </div>
    </div>
);

export default CommentItem;
