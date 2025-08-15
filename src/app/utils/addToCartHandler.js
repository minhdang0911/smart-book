import { toast } from 'react-toastify';

export const handleAddToCartHelper = async ({ user, bookId, quantity, addToCart, price, setIsAddingToCart = null }) => {
    try {
        if (!user || user.length === 0) {
            toast.error('🔒 Vui lòng đăng nhập để mua sách!');
            if (router) {
                router.push('/login');
            }
            return;
        }

        // Chỉ gọi setIsAddingToCart nếu nó tồn tại
        if (setIsAddingToCart) {
            setIsAddingToCart(true);
        }

        const result = await addToCart(bookId, quantity, price);

        if (result.success) {
            toast.success('🎉 Đã thêm sách vào giỏ hàng!');
            // Cập nhật cart count nếu có
            if (window.updateCartCount) {
                window.updateCartCount();
            }
            window.dispatchEvent(new CustomEvent('cartUpdated'));
        } else {
            // toast.error(`🚫 ${result.message || result.error || 'Không thể thêm vào giỏ hàng'}`);
        }
    } catch (error) {
        toast.error(`🚨 Lỗi hệ thống: ${error?.response?.data?.message || error.message || 'Không rõ lỗi'}`);
        console.error('Lỗi khi gọi API addToCart:', error);
    } finally {
        // Chỉ gọi setIsAddingToCart nếu nó tồn tại
        if (setIsAddingToCart) {
            setIsAddingToCart(false);
        }
    }
};
