const BASE_URL = 'https://smartbook-backend.tranminhdang.cloud/api';

export const fetchBooks = async () => {
    const response = await fetch(`${BASE_URL}/books`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const data = await response.json();

    if (!response.ok || data.result === 0) {
        throw new Error(data.msg || 'Lỗi khi lấy danh sách sách');
    }

    return data;
};
