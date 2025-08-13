export async function getPosts() {
    try {
        const response = await fetch('https://smartbook.io.vn/api/posts', {
            cache: 'no-store',
        });

        if (!response.ok) throw new Error('Failed to fetch posts');

        const result = await response.json();
        return result.success ? result.data : [];
    } catch (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
}
