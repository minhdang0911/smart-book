import useSWR from 'swr';
import { apiGetMe } from '../../../apis/user';

export const useUser = () => {
    const token = localStorage.getItem('token');

    const { data, error, isLoading, mutate } = useSWR(
        token ? ['user-info', token] : null,
        async ([, token]) => {
            const response = await apiGetMe(token);
            return response;
        },
        {
            revalidateOnFocus: false,
            dedupingInterval: 300000, // 5 minutes
            errorRetryCount: 2,
        },
    );

    // DEBUG: Log ra tất cả để check
    console.log('🔍 DEBUG useUser:', {
        token: token ? 'có token' : 'không có token',
        data,
        error,
        isLoading,
        'data.status': data?.status,
        'data.user': data?.user,
    });

    const user = data?.status ? data.user : null;
    const isLoggedIn = !!user && !!token;

    // Thêm các helper methods
    const isValidUser = () => {
        return user && user.id && !error;
    };

    const getUserStatus = () => {
        if (isLoading) return 'loading';
        if (error) return 'error';
        if (!token) return 'no_token';
        if (!user) return 'no_user';
        return 'authenticated';
    };

    console.log('🎯 RESULT:', { user, isLoggedIn, status: getUserStatus() });

    return {
        user,
        isLoggedIn,
        isLoading,
        error,
        mutate,
        hasToken: !!token,
        isValidUser,
        getUserStatus,
        // Thêm raw data để debug
        rawData: data,
    };
};
