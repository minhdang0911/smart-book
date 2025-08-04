// app/bookstore/page.tsx (Server Component)
import { apiGetAllBook } from '../../../../apis/allbook';
import { BookStoreClient } from './componants/BookStoreClient.jsx';

// Server Component - chạy trên server, không có interactivity
async function BookStorePage() {
    // Fetch data trên server
    let initialBooks = {
        featured: [],
        topRated: [],
        mostViewed: [],
        ebooks: [],
        paperBooks: [],
    };

    try {
        const response = await apiGetAllBook();
        if (response?.status === 'success') {
            initialBooks = {
                featured: response.latest_ebooks?.slice(0, 5) || [],
                topRated: response.top_rated_books || [],
                mostViewed: response.top_viewed_books || [],
                ebooks: response.latest_ebooks || [],
                paperBooks: response.latest_paper_books || [],
            };
        }
    } catch (error) {
        console.error('Error fetching initial data:', error);
        // Có thể throw error hoặc redirect đến error page
    }

    return (
        <div>
            {/* Pass initial data xuống Client Component */}
            <BookStoreClient initialBooks={initialBooks} />
        </div>
    );
}

export default BookStorePage;
