export const toggleWishlist = async ({ bookId, token, wishlist, setWishlist }) => {
    try {
        const isFollowed = wishlist.includes(bookId);
        const url = isFollowed
            ? 'https://smartbook.io.vn/api/books/unfollow'
            : 'https://smartbook.io.vn/api/books/follow';

        const response = await fetch(url, {
            method: isFollowed ? 'DELETE' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ book_id: bookId }),
        });

        const result = await response.json();
        if (result.status) {
            setWishlist((prev) => (isFollowed ? prev.filter((id) => id !== bookId) : [...prev, bookId]));
        }
    } catch (error) {
        console.error('Lỗi khi toggle wishlist:', error);
    }
};
