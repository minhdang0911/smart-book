import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { apiGetMe } from '../../../apis/user';

export const useAuth = () => {
    const [token, setToken] = useState(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        setToken(storedToken);
    }, []);

    const {
        data: user,
        error,
        mutate,
    } = useSWR(token ? ['user', token] : null, ([, token]) => apiGetMe(token), {
        revalidateOnFocus: false,
        onSuccess: (data) => {
            if (!data?.status) {
                throw new Error('Failed to get user info');
            }
            return data.user;
        },
    });

    return {
        user: user?.user,
        loading: !error && !user,
        error,
        mutate,
        token,
    };
};
