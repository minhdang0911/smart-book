'use client';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useUser } from './useUser';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const REVIEW_WINDOW_DAYS = 3;

const parseIso = (iso) => (iso ? new Date(iso).getTime() : NaN);
const fmtTime = (ts) => new Date(ts).toLocaleString(); // tuỳ locale, có thể custom

const normalizeBookId = (bookId) => {
    const m = String(bookId).match(/\d+/);
    return m ? Number(m[0]) : NaN;
};

export const useReviewActions = () => {
    const router = useRouter();
    const { user } = useUser();
    const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

    const checkCanReview = async (bookId, customMessage) => {
        if (!user) {
            toast.error(customMessage || '🔒 Vui lòng đăng nhập để thực hiện hành động này!');
            router.push('/login');
            return { canReview: false, message: 'Chưa đăng nhập' };
        }

        const wantedId = normalizeBookId(bookId);
        if (!Number.isFinite(wantedId)) {
            return { canReview: false, message: 'ID sách không hợp lệ!' };
        }

        try {
            let page = 1;
            let lastPage = 1;

            // tìm lần giao GẦN NHẤT của đúng quyển sách
            let latestDeliveredAt = null; // ms
            let latestOrderInfo = null;

            do {
                const res = await fetch(`https://data-smartbook.gamer.gd/api/orders?page=${page}`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                        'Content-Type': 'application/json',
                    },
                });
                const json = await res.json();

                if (!json?.success || !Array.isArray(json?.data?.orders)) {
                    return { canReview: false, message: 'Không thể lấy thông tin đơn hàng!' };
                }

                lastPage = json?.data?.pagination?.last_page ?? 1;

                for (const order of json.data.orders) {
                    if (String(order?.status) !== 'delivered') continue;

                    const deliveredAtMs = parseIso(order?.updated_at) || parseIso(order?.created_at);
                    if (!deliveredAtMs) continue;

                    const items = order?.items ?? [];
                    const hasBook = items.some((it) => normalizeBookId(it?.book?.id ?? it?.book_id) === wantedId);
                    if (!hasBook) continue;

                    if (!latestDeliveredAt || deliveredAtMs > latestDeliveredAt) {
                        latestDeliveredAt = deliveredAtMs;
                        latestOrderInfo = { order_id: order.id, order_code: order.order_code };
                    }
                }

                page += 1;
            } while (page <= lastPage);

            if (!latestDeliveredAt) {
                return {
                    canReview: false,
                    message: 'Bạn cần đơn hàng đã giao của sản phẩm này để có thể đánh giá!',
                };
            }

            const deadline = latestDeliveredAt + REVIEW_WINDOW_DAYS * MS_PER_DAY;
            const now = Date.now();
            const remainingMs = deadline - now;

            if (remainingMs <= 0) {
                return {
                    canReview: false,
                    message: `Đã quá hạn ${REVIEW_WINDOW_DAYS} ngày kể từ khi giao (hết hạn: ${fmtTime(
                        deadline,
                    )}). Không thể đánh giá nữa.`,
                    deadline,
                    order: latestOrderInfo,
                };
            }

            // còn hạn → cho review + trả thời gian còn lại để UI hiển thị
            const remainingDays = Math.floor(remainingMs / MS_PER_DAY);
            const remainingHours = Math.floor((remainingMs % MS_PER_DAY) / (60 * 60 * 1000));
            const note =
                remainingDays > 0
                    ? `Còn ${remainingDays} ngày ${remainingHours} giờ để đánh giá.`
                    : `Còn ~${Math.ceil(remainingMs / (60 * 1000))} phút để đánh giá.`;

            return {
                canReview: true,
                message: `Có thể đánh giá. ${note}`,
                deadline,
                order: latestOrderInfo,
            };
        } catch (error) {
            console.error('Error checking review permission:', error);
            return { canReview: false, message: 'Có lỗi xảy ra khi kiểm tra quyền đánh giá!' };
        }
    };

    const submitReview = async (bookId, rating, comment) => {
        // không đổi API: vẫn gửi như cũ
        const res = await fetch('https://data-smartbook.gamer.gd/api/ratings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getToken()}`,
            },
            body: JSON.stringify({
                book_id: normalizeBookId(bookId),
                rating_star: rating,
                comment,
            }),
        });
        return res.json();
    };

    return { checkCanReview, submitReview };
};
