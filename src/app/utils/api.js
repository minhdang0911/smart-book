export const deleteComment = async (commentId) => {
    try {
<<<<<<< HEAD
        const response = await fetch(`https://data-smartbook.gamer.gd/api/comments/${commentId}`, {
=======
        const response = await fetch(`http://localhost:8000/api/comments/${commentId}`, {
>>>>>>> b236b22 (up group order)
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to delete comment');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error deleting comment:', error);
        throw error;
    }
};
