'use client';

import { DeleteOutlined, EditOutlined, FlagOutlined, MoreOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { formatTime } from '../../utils/timeUtils';
import ReactionButton from './ReactionButton';
import ReplyItem from './ReplyItem';
import UserAvatar from './UserAvatar';

const CommentItem = ({ comment, postId, onReply, onCommentUpdate, onCommentDelete }) => {
    const [replies, setReplies] = useState([]);
    const [showReplies, setShowReplies] = useState(false);
    const [loadingReplies, setLoadingReplies] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [showReactionDetails, setShowReactionDetails] = useState(false);
    const [commentData, setCommentData] = useState(comment);

    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const loadReplies = async () => {
        if (!showReplies && replies.length === 0) {
            setLoadingReplies(true);
            try {
                const res = await fetch(`http://localhost:8000/api/comments/replies?parent_id=${comment.id}`);
                const data = await res.json();
                if (data.success) {
                    setReplies(data.data);
                }
            } catch (err) {
                console.error('Lỗi khi tải replies:', err);
            } finally {
                setLoadingReplies(false);
            }
        }
        setShowReplies(!showReplies);
    };

    const handleReactionUpdate = (updatedData, dataType) => {
        if (dataType === 'comments') {
            const updatedComment = updatedData.find((c) => c.id === commentData.id);
            if (updatedComment) {
                setCommentData(updatedComment);
                if (onCommentUpdate) {
                    onCommentUpdate(updatedComment);
                }
            }
        } else if (dataType === 'replies') {
            setReplies(updatedData);
        } else {
            setCommentData(updatedData);
            if (onCommentUpdate) {
                onCommentUpdate(updatedData);
            }
        }
    };

    const handleRepliesUpdate = (updatedReplies) => {
        if (Array.isArray(updatedReplies)) {
            setReplies(updatedReplies);
        }
    };

    const handleEditComment = async () => {
        if (editContent.trim() === '') {
            alert('Nội dung bình luận không được để trống');
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch(`http://localhost:8000/api/comments/${commentData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ content: editContent.trim() }),
            });

            const data = await res.json();

            if (data.success) {
                setCommentData((prev) => ({
                    ...prev,
                    content: data.data.content,
                    updated_at: data.data.updated_at,
                }));

                if (onCommentUpdate) {
                    onCommentUpdate({
                        ...commentData,
                        content: data.data.content,
                        updated_at: data.data.updated_at,
                    });
                }

                setIsEditing(false);
            } else {
                alert(data.message || 'Có lỗi xảy ra khi cập nhật bình luận');
            }
        } catch (err) {
            console.error('Lỗi khi cập nhật bình luận:', err);
            alert('Lỗi kết nối server!');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteComment = async () => {
        setIsDeleting(true);
        try {
            const res = await fetch(`http://localhost:8000/api/comments/${commentData.id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            const data = await res.json();

            if (data.success) {
                // Gọi callback để thông báo cho component cha xóa comment này khỏi danh sách
                if (onCommentDelete) {
                    onCommentDelete(commentData.id);
                }
                setShowDeleteConfirm(false);
                setShowOptions(false);
            } else {
                alert(data.message || 'Có lỗi xảy ra khi xóa bình luận');
            }
        } catch (err) {
            console.error('Lỗi khi xóa bình luận:', err);
            alert('Lỗi kết nối server!');
        } finally {
            setIsDeleting(false);
        }
    };

    const openEditMode = () => {
        setEditContent(commentData.content);
        setIsEditing(true);
        setShowOptions(false);
    };

    const cancelEdit = () => {
        setEditContent(commentData.content);
        setIsEditing(false);
    };

    const openDeleteConfirm = () => {
        setShowDeleteConfirm(true);
        setShowOptions(false);
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
    };

    const renderReactionsSummary = () => {
        const reactionSummary = commentData.reaction_summary || {};
        const totalReactions = Object.values(reactionSummary).reduce((sum, count) => sum + count, 0);

        if (totalReactions === 0) return null;

        const reactionEmojis = {
            like: '👍',
            love: '❤️',
            haha: '😂',
            wow: '😮',
            sad: '😢',
            angry: '😡',
        };

        return (
            <div style={{ position: 'relative', display: 'inline-block' }}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        marginTop: '4px',
                        cursor: 'pointer',
                        padding: '2px 6px',
                        borderRadius: '12px',
                        backgroundColor: '#f0f2f5',
                        width: 'fit-content',
                        transition: 'background-color 0.2s',
                    }}
                    onClick={() => setShowReactionDetails(!showReactionDetails)}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = '#e4e6ea')}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = '#f0f2f5')}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
                        {Object.keys(reactionSummary).map((type) => (
                            <span key={type} style={{ fontSize: '12px' }}>
                                {reactionEmojis[type]}
                            </span>
                        ))}
                    </div>
                    <span style={{ color: '#65676b', marginLeft: '4px', fontSize: '12px' }}>{totalReactions}</span>
                </div>

                {showReactionDetails && (
                    <>
                        <div
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                zIndex: 998,
                            }}
                            onClick={() => setShowReactionDetails(false)}
                        />
                        <div
                            style={{
                                position: 'absolute',
                                top: '100%',
                                left: '0',
                                backgroundColor: 'white',
                                border: '1px solid #dadde1',
                                borderRadius: '8px',
                                padding: '12px',
                                boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                                zIndex: 999,
                                minWidth: '200px',
                                maxWidth: '300px',
                                maxHeight: '300px',
                                overflowY: 'auto',
                            }}
                        >
                            <div
                                style={{
                                    fontWeight: 'bold',
                                    marginBottom: '8px',
                                    fontSize: '14px',
                                    color: '#1c1e21',
                                }}
                            >
                                Những người đã thả cảm xúc
                            </div>
                            {commentData.reactions?.data?.map((reaction) => (
                                <div
                                    key={reaction.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '4px 0',
                                        borderBottom: '1px solid #f0f2f5',
                                    }}
                                >
                                    <UserAvatar user={reaction.user} size={24} />
                                    <span style={{ fontSize: '13px', flex: 1 }}>{reaction.user.name}</span>
                                    <span style={{ fontSize: '16px' }}>{reactionEmojis[reaction.type]}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        );
    };

    return (
        <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
                <UserAvatar user={commentData.user} />
                <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: '4px' }}>
                        <span style={{ fontWeight: 'bold', color: '#1877f2', fontSize: '14px' }}>
                            {commentData.user.name}
                        </span>
                        <span style={{ color: '#65676b', fontSize: '14px', marginLeft: '8px' }}>
                            {formatTime(commentData.created_at)}
                        </span>
                        {commentData.updated_at !== commentData.created_at && (
                            <span
                                style={{ color: '#65676b', fontSize: '12px', marginLeft: '8px', fontStyle: 'italic' }}
                            >
                                (đã chỉnh sửa)
                            </span>
                        )}
                    </div>

                    {/* Nội dung bình luận hoặc form chỉnh sửa */}
                    {isEditing ? (
                        <div style={{ marginBottom: '12px' }}>
                            {/* Thanh công cụ */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 12px',
                                    backgroundColor: '#f0f2f5',
                                    borderRadius: '8px 8px 0 0',
                                    borderBottom: '1px solid #e4e6ea',
                                }}
                            >
                                <button
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        color: '#65676b',
                                        transition: 'background-color 0.2s',
                                    }}
                                    onMouseEnter={(e) => (e.target.style.backgroundColor = '#e4e6ea')}
                                    onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                                >
                                    B
                                </button>
                                <button
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        fontStyle: 'italic',
                                        color: '#65676b',
                                        transition: 'background-color 0.2s',
                                    }}
                                    onMouseEnter={(e) => (e.target.style.backgroundColor = '#e4e6ea')}
                                    onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                                >
                                    I
                                </button>
                                <button
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        color: '#65676b',
                                        transition: 'background-color 0.2s',
                                    }}
                                    onMouseEnter={(e) => (e.target.style.backgroundColor = '#e4e6ea')}
                                    onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                                >
                                    ""
                                </button>
                                <button
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        color: '#65676b',
                                        transition: 'background-color 0.2s',
                                    }}
                                    onMouseEnter={(e) => (e.target.style.backgroundColor = '#e4e6ea')}
                                    onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                                >
                                    &lt;/&gt;
                                </button>
                                <button
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        color: '#65676b',
                                        transition: 'background-color 0.2s',
                                    }}
                                    onMouseEnter={(e) => (e.target.style.backgroundColor = '#e4e6ea')}
                                    onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                                >
                                    🖼️
                                </button>
                                <button
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        color: '#65676b',
                                        transition: 'background-color 0.2s',
                                    }}
                                    onMouseEnter={(e) => (e.target.style.backgroundColor = '#e4e6ea')}
                                    onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                                >
                                    🔗
                                </button>
                            </div>

                            {/* Textarea */}
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                style={{
                                    width: '100%',
                                    minHeight: '80px',
                                    padding: '12px',
                                    border: '1px solid #e4e6ea',
                                    borderTop: 'none',
                                    borderRadius: '0 0 8px 8px',
                                    fontSize: '14px',
                                    fontFamily: 'inherit',
                                    resize: 'vertical',
                                    outline: 'none',
                                    backgroundColor: '#fff',
                                }}
                                placeholder="Nhập nội dung bình luận..."
                                autoFocus
                            />

                            {/* Nút action */}
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    gap: '8px',
                                    marginTop: '8px',
                                }}
                            >
                                <button
                                    onClick={cancelEdit}
                                    disabled={isSaving}
                                    style={{
                                        padding: '8px 16px',
                                        border: '1px solid #e4e6ea',
                                        borderRadius: '6px',
                                        backgroundColor: '#f8f9fa',
                                        color: '#65676b',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: isSaving ? 'not-allowed' : 'pointer',
                                        opacity: isSaving ? 0.6 : 1,
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={(e) => !isSaving && (e.target.style.backgroundColor = '#e4e6ea')}
                                    onMouseLeave={(e) => !isSaving && (e.target.style.backgroundColor = '#f8f9fa')}
                                >
                                    HỦY
                                </button>
                                <button
                                    onClick={handleEditComment}
                                    disabled={isSaving || editContent.trim() === ''}
                                    style={{
                                        padding: '8px 16px',
                                        border: 'none',
                                        borderRadius: '6px',
                                        backgroundColor: isSaving || editContent.trim() === '' ? '#e4e6ea' : '#1877f2',
                                        color: isSaving || editContent.trim() === '' ? '#bcc0c4' : '#fff',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: isSaving || editContent.trim() === '' ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {isSaving ? (
                                        <>
                                            <div
                                                style={{
                                                    width: '12px',
                                                    height: '12px',
                                                    border: '2px solid #bcc0c4',
                                                    borderTop: '2px solid #1877f2',
                                                    borderRadius: '50%',
                                                    animation: 'spin 1s linear infinite',
                                                }}
                                            />
                                            Đang lưu...
                                        </>
                                    ) : (
                                        'LƯU LẠI'
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ color: '#65676b', fontSize: '14px', marginBottom: '8px' }}>
                            {commentData?.content}
                        </div>
                    )}

                    {!isEditing && (
                        <div style={{ fontSize: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <ReactionButton
                                    itemId={commentData.id}
                                    postId={postId}
                                    buttonStyle={{ fontSize: '14px' }}
                                    reactionSummary={commentData.reaction_summary}
                                    reactions={commentData.reactions}
                                    onReactionUpdate={handleReactionUpdate}
                                />
                                <button
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#65676b',
                                        cursor: 'pointer',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        transition: 'background-color 0.2s',
                                    }}
                                    onClick={() => onReply(commentData)}
                                    onMouseEnter={(e) => (e.target.style.backgroundColor = '#f0f2f5')}
                                    onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                                >
                                    Phản hồi
                                </button>

                                <div style={{ marginLeft: 'auto', position: 'relative' }}>
                                    <div
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '50%',
                                            cursor: 'pointer',
                                            backgroundColor: showOptions ? '#e4e6ea' : 'transparent',
                                            transition: 'background-color 0.2s',
                                        }}
                                        onClick={() => setShowOptions(!showOptions)}
                                        onMouseEnter={(e) =>
                                            !showOptions && (e.target.style.backgroundColor = '#f0f2f5')
                                        }
                                        onMouseLeave={(e) =>
                                            !showOptions && (e.target.style.backgroundColor = 'transparent')
                                        }
                                    >
                                        <MoreOutlined style={{ color: '#65676b', fontSize: '16px' }} />
                                    </div>

                                    {showOptions && (
                                        <>
                                            <div
                                                style={{
                                                    position: 'fixed',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    zIndex: 998,
                                                }}
                                                onClick={() => setShowOptions(false)}
                                            />
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: '100%',
                                                    right: 0,
                                                    background: '#fff',
                                                    border: '1px solid #dadde1',
                                                    borderRadius: '8px',
                                                    padding: '8px 0',
                                                    zIndex: 999,
                                                    minWidth: '150px',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        padding: '12px 16px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        fontSize: '14px',
                                                        transition: 'background-color 0.2s',
                                                    }}
                                                    onClick={openEditMode}
                                                    onMouseEnter={(e) => (e.target.style.backgroundColor = '#f0f2f5')}
                                                    onMouseLeave={(e) =>
                                                        (e.target.style.backgroundColor = 'transparent')
                                                    }
                                                >
                                                    <EditOutlined style={{ color: '#65676b' }} />
                                                    Chỉnh sửa
                                                </div>
                                                <div
                                                    style={{
                                                        padding: '12px 16px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        fontSize: '14px',
                                                        transition: 'background-color 0.2s',
                                                        color: '#d73502',
                                                    }}
                                                    onClick={openDeleteConfirm}
                                                    onMouseEnter={(e) => (e.target.style.backgroundColor = '#f0f2f5')}
                                                    onMouseLeave={(e) =>
                                                        (e.target.style.backgroundColor = 'transparent')
                                                    }
                                                >
                                                    <DeleteOutlined style={{ color: '#d73502' }} />
                                                    Xóa
                                                </div>
                                                <div
                                                    style={{
                                                        padding: '12px 16px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        fontSize: '14px',
                                                        transition: 'background-color 0.2s',
                                                    }}
                                                    onClick={() => {
                                                        setShowOptions(false);
                                                        // Future: Báo cáo
                                                    }}
                                                    onMouseEnter={(e) => (e.target.style.backgroundColor = '#f0f2f5')}
                                                    onMouseLeave={(e) =>
                                                        (e.target.style.backgroundColor = 'transparent')
                                                    }
                                                >
                                                    <FlagOutlined style={{ color: '#65676b' }} />
                                                    Báo cáo
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {renderReactionsSummary()}

                            {commentData.replies_count > 0 && (
                                <div style={{ marginTop: '8px' }}>
                                    <button
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#65676b',
                                            cursor: 'pointer',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '13px',
                                            fontWeight: '500',
                                            transition: 'background-color 0.2s',
                                        }}
                                        onClick={loadReplies}
                                        onMouseEnter={(e) => (e.target.style.backgroundColor = '#f0f2f5')}
                                        onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                                    >
                                        {showReplies ? 'Ẩn phản hồi' : `Xem phản hồi (${commentData.replies_count})`}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {showReplies && (
                        <div style={{ marginTop: '12px' }}>
                            {loadingReplies ? (
                                <div style={{ fontSize: '12px', color: '#999' }}>Đang tải phản hồi...</div>
                            ) : (
                                replies.map((reply) => (
                                    <ReplyItem
                                        key={reply.id}
                                        reply={reply}
                                        parentId={commentData.id}
                                        postId={postId}
                                        onReply={onReply}
                                        onRepliesUpdate={handleRepliesUpdate}
                                    />
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal xác nhận xóa */}
            {showDeleteConfirm && (
                <>
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            zIndex: 1000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onClick={cancelDelete}
                    >
                        <div
                            style={{
                                backgroundColor: '#fff',
                                borderRadius: '8px',
                                padding: '24px',
                                minWidth: '400px',
                                maxWidth: '500px',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ marginBottom: '16px' }}>
                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1c1e21' }}>
                                    Xác nhận xóa bình luận
                                </h3>
                            </div>
                            <div
                                style={{ marginBottom: '24px', fontSize: '14px', color: '#65676b', lineHeight: '1.4' }}
                            >
                                Bạn có chắc chắn muốn xóa bình luận này không? Hành động này không thể hoàn tác.
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button
                                    onClick={cancelDelete}
                                    disabled={isDeleting}
                                    style={{
                                        padding: '8px 16px',
                                        border: '1px solid #e4e6ea',
                                        borderRadius: '6px',
                                        backgroundColor: '#f8f9fa',
                                        color: '#65676b',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: isDeleting ? 'not-allowed' : 'pointer',
                                        opacity: isDeleting ? 0.6 : 1,
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={(e) => !isDeleting && (e.target.style.backgroundColor = '#e4e6ea')}
                                    onMouseLeave={(e) => !isDeleting && (e.target.style.backgroundColor = '#f8f9fa')}
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleDeleteComment}
                                    disabled={isDeleting}
                                    style={{
                                        padding: '8px 16px',
                                        border: 'none',
                                        borderRadius: '6px',
                                        backgroundColor: isDeleting ? '#f5c6cb' : '#d73502',
                                        color: isDeleting ? '#721c24' : '#fff',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: isDeleting ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={(e) => !isDeleting && (e.target.style.backgroundColor = '#c52707')}
                                    onMouseLeave={(e) => !isDeleting && (e.target.style.backgroundColor = '#d73502')}
                                >
                                    {isDeleting ? (
                                        <>
                                            <div
                                                style={{
                                                    width: '12px',
                                                    height: '12px',
                                                    border: '2px solid #721c24',
                                                    borderTop: '2px solid #d73502',
                                                    borderRadius: '50%',
                                                    animation: 'spin 1s linear infinite',
                                                }}
                                            />
                                            Đang xóa...
                                        </>
                                    ) : (
                                        'Xóa'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* CSS Animation */}
            <style jsx>{`
                @keyframes spin {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
        </div>
    );
};

export default CommentItem;
