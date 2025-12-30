export async function getPosts() {
    try {
        const response = await fetch('https://data-smartbook.gamer.gd/api/posts', {
            next: { revalidate: 60 },
        });

        if (!response.ok) throw new Error('Failed to fetch posts');

        const result = await response.json();
        return result.success ? result.data : [];
    } catch (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
}
