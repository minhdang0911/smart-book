export const apiAddToCart = async (bookId, quantity) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/api/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                book_id: bookId,
                quantity: quantity,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error('Lỗi khi thêm vào giỏ hàng:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};
