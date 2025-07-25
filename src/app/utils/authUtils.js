// utils/checkUser.js - Version đã sửa
export const checkUser = async ({ user, router, toast, setUser, apiGetMe }) => {
    // Nếu chưa có user (null, undefined hoặc mảng rỗng)
    if (!user || user.length === 0) {
        toast.error('🔒 Vui lòng đăng nhập để thực hiện hành động này!');
        if (router) {
            router.push('/login');
        }
        return false;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        toast.error('🔒 Token không tồn tại. Vui lòng đăng nhập lại!');
        if (router) {
            router.push('/login');
        }
        return false;
    }

    try {
        const userResponse = await apiGetMe(token);
        if (userResponse?.status === true && userResponse.user) {
            if (setUser) {
                setUser(userResponse.user);
            }
            return true;
        } else {
            toast.error('❌ Phiên đăng nhập không hợp lệ!');
            if (router) {
                router.push('/login');
            }
            return false;
        }
    } catch (error) {
        console.error('❌ Lỗi khi lấy thông tin người dùng:', error);
        toast.error('❌ Có lỗi xảy ra. Vui lòng thử lại!');
        if (router) {
            router.push('/login');
        }
        return false;
    }
};
