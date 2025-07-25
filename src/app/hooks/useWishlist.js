import useSWR from 'swr';
const authenticatedFetcher = async (url) => {
    const token = localStorage.getItem('token');
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });
    return response.json();
};

export const useWishlist = () => {
    const token = localStorage.getItem('token');

    const { data, error, isLoading, mutate } = useSWR(
        token ? 'http://localhost:8000/api/books/followed' : null,
        authenticatedFetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 60000, // 1 minute
        },
    );

    const wishlist = data?.status && data.followed_books ? data.followed_books.map((book) => book.id) : [];

    const toggleWishlist = async (bookId) => {
        try {
            const isFollowed = wishlist.includes(bookId);
            const url = isFollowed
                ? 'http://localhost:8000/api/books/unfollow'
                : 'http://localhost:8000/api/books/follow';

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
                // Optimistic update
                mutate();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Lỗi khi toggle wishlist:', error);
            return false;
        }
    };

    return {
        wishlist,
        isLoading,
        error,
        toggleWishlist,
        mutate,
    };
};
