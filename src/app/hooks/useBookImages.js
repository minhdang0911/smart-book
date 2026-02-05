import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => res.json());

export const useBookImages = (bookId) => {
    const { data, error, isLoading } = useSWR(
<<<<<<< HEAD
        bookId ? `https://data-smartbook.gamer.gd/api/books/${bookId}/images` : null,
=======
        bookId ? `http://localhost:8000/api/books/${bookId}/images` : null,
>>>>>>> b236b22 (up group order)
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 3600000, //  1hour
        },
    );

    return {
        images: data?.data || [],
        isLoading,
        error,
    };
};
