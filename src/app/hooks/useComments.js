'use client';

import { message } from 'antd';
import { useEffect, useState } from 'react';

export const useComments = (postId) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Lấy bình luận cha
    const fetchComments = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8000/api/comments?post_id=${postId}`);
            const data = await res.json();
            if (data.success) {
                setComments(data.data);
            }
        } catch (error) {
            message.error('Không thể tải bình luận');
        } finally {
            setLoading(false);
        }
    };

    // Gửi comment hoặc reply
    const submitComment = async (content, parentId = null) => {
        setSubmitting(true);
        const token = localStorage.getItem('token');

        try {
            const res = await fetch('http://localhost:8000/api/comments', {
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

            const data = await res.json();
            if (data.success || res.ok) {
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
        if (postId) fetchComments();
    }, [postId]);

    return {
        comments,
        loading,
        submitting,
        fetchComments,
        submitComment,
    };
};
