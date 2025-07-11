// utils/timeUtils.js
export const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInMonths = Math.floor(diffInDays / 30);

    if (diffInMonths > 0) {
        return `${diffInMonths} tháng trước`;
    } else if (diffInDays > 0) {
        return `${diffInDays} ngày trước`;
    } else if (diffInHours > 0) {
        return `${diffInHours} giờ trước`;
    } else if (diffInMinutes > 0) {
        return `${diffInMinutes} phút trước`;
    } else {
        return 'Vừa xong';
    }
};
