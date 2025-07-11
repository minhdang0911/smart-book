// hooks/useReaction.js
import { useCallback, useRef, useState } from 'react';

const useReaction = () => {
    const [showReactions, setShowReactions] = useState(false);
    const [hoveredReaction, setHoveredReaction] = useState(null);
    const pressTimerRef = useRef(null);
    const isLongPressRef = useRef(false);

    const reactions = [
        { emoji: '👍', label: 'Like', type: 'like' },
        { emoji: '❤️', label: 'Love', type: 'love' },
        { emoji: '😂', label: 'Haha', type: 'haha' },
        { emoji: '😮', label: 'Wow', type: 'wow' },
        { emoji: '😢', label: 'Sad', type: 'sad' },
        { emoji: '😡', label: 'Angry', type: 'angry' },
    ];

    const handleReaction = async (itemId, reactionType) => {
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`http://localhost:8000/api/comments/${itemId}/react`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reaction_type: reactionType }),
            });

            if (response.ok) {
                console.log('Reaction added successfully');
                // Có thể return data để component cha xử lý cập nhật UI
                const data = await response.json();
                return data;
            }
        } catch (error) {
            console.error('Error adding reaction:', error);
            throw error;
        }
    };

    const startPressTimer = useCallback(() => {
        isLongPressRef.current = false;
        pressTimerRef.current = setTimeout(() => {
            isLongPressRef.current = true;
            setShowReactions(true);
        }, 500); // 0.5s để hiện reactions
    }, []);

    const clearPressTimer = useCallback(() => {
        if (pressTimerRef.current) {
            clearTimeout(pressTimerRef.current);
            pressTimerRef.current = null;
        }
    }, []);

    const handleMouseDown = useCallback(
        (e) => {
            e.preventDefault();
            startPressTimer();
        },
        [startPressTimer],
    );

    const handleMouseUp = useCallback(
        async (e, itemId) => {
            e.preventDefault();
            clearPressTimer();

            if (!isLongPressRef.current) {
                // Click nhanh - thực hiện like
                await handleReaction(itemId, 'like');
            } else if (hoveredReaction) {
                // Long press và có reaction được hover
                await handleReaction(itemId, hoveredReaction);
            }

            setShowReactions(false);
            setHoveredReaction(null);
        },
        [clearPressTimer, hoveredReaction],
    );

    const handleMouseLeave = useCallback(() => {
        clearPressTimer();
        if (!showReactions) {
            // Chỉ ẩn reactions nếu không đang trong chế độ chọn
            setShowReactions(false);
        }
    }, [clearPressTimer, showReactions]);

    const handleTouchStart = useCallback(
        (e) => {
            e.preventDefault();
            startPressTimer();
        },
        [startPressTimer],
    );

    const handleTouchEnd = useCallback(
        async (e, itemId) => {
            e.preventDefault();
            clearPressTimer();

            if (!isLongPressRef.current) {
                // Tap nhanh - thực hiện like
                await handleReaction(itemId, 'like');
            } else if (hoveredReaction) {
                // Long press và có reaction được chọn
                await handleReaction(itemId, hoveredReaction);
            }

            setShowReactions(false);
            setHoveredReaction(null);
        },
        [clearPressTimer, hoveredReaction],
    );

    const handleReactionHover = useCallback((reactionType) => {
        setHoveredReaction(reactionType);
    }, []);

    const handleReactionClick = useCallback(async (itemId, reactionType) => {
        await handleReaction(itemId, reactionType);
        setShowReactions(false);
        setHoveredReaction(null);
    }, []);

    const resetReactions = useCallback(() => {
        setShowReactions(false);
        setHoveredReaction(null);
    }, []);

    return {
        reactions,
        showReactions,
        hoveredReaction,
        handleMouseDown,
        handleMouseUp,
        handleMouseLeave,
        handleTouchStart,
        handleTouchEnd,
        handleReactionHover,
        handleReactionClick,
        resetReactions,
        setShowReactions,
        setHoveredReaction,
    };
};

export default useReaction;
