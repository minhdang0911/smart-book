'use client';
import { message } from 'antd';
import { useEffect, useState } from 'react';

export const useComments = (postId) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Fetch comments from API
    const fetchComments = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/api/comments/${postId}`);
            const data = await response.json();
            if (data.success) {
                setComments(data.data);
            }
        } catch (error) {
            message.error('Không thể tải bình luận');
        } finally {
            setLoading(false);
        }
    };

    // Submit comment to API
    const submitComment = async (content, parentId = null) => {
        setSubmitting(true);
        const token = localStorage.getItem('token');

        try {
            const response = await fetch('http://localhost:8000/api/comments', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    post_id: postId,
                    parent_id: parentId,
                    content: content,
                }),
            });

            const data = await response.json();
            if (data.success || response.ok) {
                message.success('Bình luận đã được gửi!');
                await fetchComments();
                return true;
            } else {
                throw new Error(data.message || 'Lỗi khi gửi bình luận');
            }
        } catch (error) {
            message.error('Không thể gửi bình luận: ' + error.message);
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (postId) {
            fetchComments();
        }
    }, [postId]);

    return {
        comments,
        loading,
        submitting,
        fetchComments,
        submitComment,
    };
};
