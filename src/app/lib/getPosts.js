export async function getPosts() {
    try {
<<<<<<< HEAD
        const response = await fetch('https://data-smartbook.gamer.gd/api/posts', {
            next: { revalidate: 60 },
=======
        const response = await fetch('http://localhost:8000/api/posts', {
            cache: 'no-store',
>>>>>>> b236b22 (up group order)
        });

        if (!response.ok) throw new Error('Failed to fetch posts');

        const result = await response.json();
        return result.success ? result.data : [];
    } catch (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
}
