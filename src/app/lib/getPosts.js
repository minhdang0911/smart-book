export async function getPosts() {
    try {
        const response = await fetch('http://localhost:8000/api/posts', {
            cache: 'force-cache',
        });

        if (!response.ok) throw new Error('Failed to fetch posts');

        const result = await response.json();

        // Trả về mảng data thay vì toàn bộ response object
        return result.success ? result.data : [];
    } catch (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
}
