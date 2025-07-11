'use client';

import { formatTime } from '../../utils/timeUtils';
import CommentEditor from './CommentEditor';
import ReactionButton from './ReactionButton';
import UserAvatar from './UserAvatar';

const ReplyItem = ({
    reply,
    parentId,
    postId,
    onReply,
    onRepliesUpdate,
    replyingTo,
    replyText,
    setReplyText,
    handleSubmitReply,
    submitting,
}) => {
    const handleReactionUpdate = (updatedData, dataType) => {
        if (dataType === 'replies' && onRepliesUpdate) {
            onRepliesUpdate(updatedData);
        }
    };

    return (
        <div style={{ marginTop: '12px', marginLeft: '52px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
                <UserAvatar user={reply.user} size={32} />
                <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: '4px' }}>
                        <span style={{ fontWeight: 'bold', color: '#1877f2', fontSize: '13px' }}>
                            {reply.user.name}
                        </span>
                        <span style={{ color: '#65676b', fontSize: '11px', marginLeft: '8px' }}>
                            {formatTime(reply.created_at)}
                        </span>
                    </div>
                    <div style={{ fontSize: '13px', marginBottom: '6px' }}>{reply.content}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px' }}>
                        <ReactionButton
                            itemId={reply.id}
                            parentId={parentId}
                            postId={postId}
                            buttonStyle={{ fontSize: '11px' }}
                            reactionSummary={reply.reaction_summary}
                            reactions={reply.reactions}
                            onReactionUpdate={handleReactionUpdate}
                        />
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
                                transition: 'background-color 0.2s',
                            }}
                            onClick={() => onReply(reply)}
                            onMouseEnter={(e) => (e.target.style.backgroundColor = '#f0f2f5')}
                            onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                        >
                            Phản hồi
                        </button>
                    </div>

                    {/* 👉 Khung nhập phản hồi cho reply này */}
                    {replyingTo?.id === reply.id && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                            <UserAvatar user={{ name: 'U' }} size={28} />
                            <CommentEditor
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                onSubmit={handleSubmitReply}
                                onCancel={() => {
                                    setReplyText('');
                                }}
                                placeholder="Nhập phản hồi..."
                                submitting={submitting}
                            />
                        </div>
                    )}

                    {/* Render replies cấp cháu nếu có */}
                    {reply.replies &&
                        reply.replies.map((subReply) => (
                            <ReplyItem
                                key={subReply.id}
                                reply={subReply}
                                parentId={parentId}
                                postId={postId}
                                onReply={onReply}
                                onRepliesUpdate={onRepliesUpdate}
                                replyingTo={replyingTo}
                                replyText={replyText}
                                setReplyText={setReplyText}
                                handleSubmitReply={handleSubmitReply}
                                submitting={submitting}
                            />
                        ))}
                </div>
            </div>
        </div>
    );
};

export default ReplyItem;
