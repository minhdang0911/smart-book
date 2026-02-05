import useSWR from 'swr';

const fetcher = async (url) => {
    console.log('🔗 Fetching URL:', url);
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('📡 API Response:', data);
    return data;
};

export const useSameCategoryBooks = (category, currentBookId) => {
    console.log('🔍 useSameCategoryBooks params:', { category, currentBookId });

    // Tạo URL dựa trên loại dữ liệu category
    let searchUrl = null;

    if (category && category !== 'Không rõ') {
        if (typeof category === 'string') {
            // Nếu là string thì search theo name
<<<<<<< HEAD
            searchUrl = `https://data-smartbook.gamer.gd/api/books/search?category=${encodeURIComponent(category)}`;
=======
            searchUrl = `http://localhost:8000/api/books/search?category=${encodeURIComponent(category)}`;
>>>>>>> b236b22 (up group order)
        } else if (typeof category === 'object') {
            // Nếu là object thì ưu tiên ID, fallback về name
            const categoryId = category._id || category.id;
            const categoryName = category.name;

            if (categoryId) {
                // Thử search theo ID trước
<<<<<<< HEAD
                searchUrl = `https://data-smartbook.gamer.gd/api/books/search?category=${encodeURIComponent(
                    categoryId,
                )}`;
            } else if (categoryName) {
                // Fallback về name
                searchUrl = `https://data-smartbook.gamer.gd/api/books/search?category=${encodeURIComponent(
                    categoryName,
                )}`;
=======
                searchUrl = `http://localhost:8000/api/books/search?category=${encodeURIComponent(categoryId)}`;
            } else if (categoryName) {
                // Fallback về name
                searchUrl = `http://localhost:8000/api/books/search?category=${encodeURIComponent(categoryName)}`;
>>>>>>> b236b22 (up group order)
            }
        }
    }

    console.log('🔗 Category search URL:', searchUrl);

    const { data, error, isLoading } = useSWR(searchUrl, fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 600000,
        onError: (error) => {
            console.error('❌ useSameCategoryBooks error:', error);
        },
    });

    let books = [];

    if (data) {
        if (data.data && Array.isArray(data.data)) {
            books = data.data;
        } else if (data.books && Array.isArray(data.books)) {
            books = data.books;
        } else if (Array.isArray(data)) {
            books = data;
        }

        books = books.filter((book) => book.id !== currentBookId);
        console.log('📂 Final sameCategoryBooks:', books.length, 'books');
    }

    return { books, isLoading, error };
};
