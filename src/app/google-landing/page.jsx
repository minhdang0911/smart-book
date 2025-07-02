'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GoogleLandingPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('access_token');

    if (token) {
      localStorage.setItem('token', token); // 👉 Lưu token vào localStorage
      console.log('✅ Token saved to localStorage:', token);
      router.push('/'); // 👉 Quay về trang chủ
    }
  }, []);

  return <div>Đang đăng nhập, vui lòng chờ...</div>;
}
