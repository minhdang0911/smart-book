// components/CommentInterface.js - Main component
import { Avatar, Button, Spin, message } from 'antd';
import { useState } from 'react';
import { useComments } from '../../hooks/useComments';
import CommentCount from './CommentCount';
import CommentEditor from './CommentEditor';
import CommentHeader from './CommentHeader';
import CommentItem from './CommentItem';

const CommentInterface = ({ postId }) => {
    const [commentText, setCommentText] = useState('');
    const [replyText, setReplyText] = useState('');
    const [showReplyBox, setShowReplyBox] = useState(false);
    const [showMainCommentBox, setShowMainCommentBox] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [showAll, setShowAll] = useState(false);

    const { comments, loading, submitting, submitComment } = useComments(postId);

    // Handle reply
    const handleReply = (comment) => {
        setReplyingTo(comment);
        setReplyText(`@${comment.user.name} `);
        setShowReplyBox(true);
        setShowMainCommentBox(false);
    };

    // Handle main comment
    const handleMainComment = () => {
        setShowMainCommentBox(true);
        setShowReplyBox(false);
        setReplyingTo(null);
        setCommentText('');
    };

    // Handle submit reply
    const handleSubmitReply = async () => {
        if (!replyText.trim()) {
            message.warning('Vui lòng nhập nội dung bình luận');
            return;
        }

        const success = await submitComment(replyText, replyingTo?.id);
        if (success) {
            setShowReplyBox(false);
            setReplyText('');
            setReplyingTo(null);
        }
    };

    // Handle submit main comment
    const handleSubmitMainComment = async () => {
        if (!commentText.trim()) {
            message.warning('Vui lòng nhập nội dung bình luận');
            return;
        }

        const success = await submitComment(commentText);
        if (success) {
            setShowMainCommentBox(false);
            setCommentText('');
        }
    };

    // Display comments (show only 4 latest or all)
    const displayComments = showAll ? comments : comments.slice(0, 4);
    const hasMoreComments = comments.length > 4;

    if (loading) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '40px',
                }}
            >
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div
            style={{
                maxWidth: '1200px',
                backgroundColor: 'white',
                fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
        >
            {/* Header */}
            <CommentHeader onMainComment={handleMainComment} />

            {/* Comment count and spam notice */}
            <CommentCount count={comments.length} />

            {/* Main Comment Box */}
            {showMainCommentBox && (
                <div
                    style={{
                        padding: '16px',
                        borderBottom: '1px solid #e4e6ea',
                        display: 'flex',
                        gap: '12px',
                    }}
                >
                    <Avatar size={40} style={{ backgroundColor: '#1877f2' }}>
                        U
                    </Avatar>
                    <CommentEditor
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onSubmit={handleSubmitMainComment}
                        onCancel={() => {
                            setShowMainCommentBox(false);
                            setCommentText('');
                        }}
                        placeholder="Nhập bình luận mới..."
                        submitting={submitting}
                    />
                </div>
            )}

            {/* Comments */}
            <div style={{ padding: '16px' }}>
                {displayComments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} onReply={handleReply} />
                ))}

                {/* Show more button */}
                {hasMoreComments && !showAll && (
                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                        <Button
                            type="link"
                            onClick={() => setShowAll(true)}
                            style={{ color: '#1877f2', fontWeight: '500' }}
                        >
                            Xem thêm bình luận
                        </Button>
                    </div>
                )}

                {/* Reply Box */}
                {showReplyBox && (
                    <div
                        style={{
                            marginTop: '16px',
                            display: 'flex',
                            gap: '12px',
                        }}
                    >
                        <Avatar size={40} style={{ backgroundColor: '#1877f2' }}>
                            U
                        </Avatar>
                        <CommentEditor
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onSubmit={handleSubmitReply}
                            onCancel={() => {
                                setShowReplyBox(false);
                                setReplyText('');
                                setReplyingTo(null);
                            }}
                            placeholder="Nhập phản hồi..."
                            submitting={submitting}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentInterface;
