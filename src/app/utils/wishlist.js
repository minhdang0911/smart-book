export const toggleWishlist = async ({ bookId, token, wishlist, setWishlist }) => {
    try {
        const isFollowed = wishlist.includes(bookId);
<<<<<<< HEAD
        const url = isFollowed
            ? 'https://data-smartbook.gamer.gd/api/books/unfollow'
            : 'https://data-smartbook.gamer.gd/api/books/follow';
=======
        const url = isFollowed ? 'http://localhost:8000/api/books/unfollow' : 'http://localhost:8000/api/books/follow';
>>>>>>> b236b22 (up group order)

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
