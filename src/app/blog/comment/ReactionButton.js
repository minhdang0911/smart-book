'use client';
// components/ReactionButton.js
import useReaction from '../../hooks/useReaction';

const ReactionButton = ({ itemId, buttonStyle, reactionStyle }) => {
    const {
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
        setShowReactions,
        setHoveredReaction,
    } = useReaction();

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <button
                style={{
                    background: 'none',
                    border: 'none',
                    color: '#65676b',
                    cursor: 'pointer',
                    fontWeight: '500',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    transition: 'background-color 0.2s',
                    ...buttonStyle,
                }}
                onMouseDown={handleMouseDown}
                onMouseUp={(e) => handleMouseUp(e, itemId)}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleTouchStart}
                onTouchEnd={(e) => handleTouchEnd(e, itemId)}
                onContextMenu={(e) => e.preventDefault()} // Ngăn context menu
            >
                Thích
            </button>

            {showReactions && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: '0',
                        backgroundColor: 'white',
                        border: '1px solid #dadde1',
                        borderRadius: '25px',
                        padding: '8px 12px',
                        display: 'flex',
                        gap: '6px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        zIndex: 1000,
                        marginBottom: '8px',
                        animation: 'reactionPopup 0.2s ease-out',
                        ...reactionStyle,
                    }}
                    onMouseLeave={() => {
                        setShowReactions(false);
                        setHoveredReaction(null);
                    }}
                >
                    {reactions.map((reaction) => (
                        <div
                            key={reaction.type}
                            style={{
                                width: '38px',
                                height: '38px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '50%',
                                transition: 'transform 0.15s ease-out',
                                transform: hoveredReaction === reaction.type ? 'scale(1.4)' : 'scale(1)',
                                cursor: 'pointer',
                            }}
                            onMouseEnter={() => handleReactionHover(reaction.type)}
                            onMouseLeave={() => setHoveredReaction(null)}
                            onClick={() => handleReactionClick(itemId, reaction.type)}
                            title={reaction.label}
                        >
                            <span
                                style={{
                                    fontSize: '22px',
                                    lineHeight: '1',
                                    userSelect: 'none',
                                }}
                            >
                                {reaction.emoji}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            <style jsx>{`
                @keyframes reactionPopup {
                    0% {
                        opacity: 0;
                        transform: translateY(10px) scale(0.8);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
            `}</style>
        </div>
    );
};

export default ReactionButton;
