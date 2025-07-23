import useSWR from 'swr';
import { fetchCategories } from '../../../apis/category';

const useCategories = () => {
    const { data, error, isLoading, mutate } = useSWR('categories', fetchCategories, {
        revalidateOnFocus: false,
    });

    const categories = data?.data || [];

    return {
        categories,
        isLoading,
        isError: error,
        mutate,
    };
};

export default useCategories;
