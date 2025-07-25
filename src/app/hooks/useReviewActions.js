export const useReviewActions = () => {
    const token = localStorage.getItem('token');

    const checkCanReview = async (bookId) => {
        try {
            if (!token) {
                return { canReview: false, message: 'Vui lòng đăng nhập để đánh giá!' };
            }

            const response = await fetch('http://localhost:8000/api/orders', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!data.success) {
                return { canReview: false, message: 'Không thể lấy thông tin đơn hàng!' };
            }

            const canReview = data.data.orders.some((order) => {
                if (!order.shipping_code) return false;
                return order.items.some((item) => item.book.id === parseInt(bookId));
            });

            if (!canReview) {
                return {
                    canReview: false,
                    message: 'Bạn cần mua và nhận được sản phẩm này để có thể đánh giá!',
                };
            }

            return { canReview: true, message: 'Có thể đánh giá sản phẩm' };
        } catch (error) {
            console.error('Error checking review permission:', error);
            return { canReview: false, message: 'Có lỗi xảy ra khi kiểm tra quyền đánh giá!' };
        }
    };

    const submitReview = async (bookId, rating, comment) => {
        try {
            const response = await fetch('http://localhost:8000/api/ratings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    book_id: parseInt(bookId),
                    rating_star: rating,
                    comment: comment,
                }),
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error submitting review:', error);
            throw error;
        }
    };

    return {
        checkCanReview,
        submitReview,
    };
};
