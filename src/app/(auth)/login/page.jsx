import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Spin } from 'antd';

const AuthPage = dynamic(() => import('./AuthPageContent'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center min-h-screen">
      <Spin size="large" />
    </div>
  ),
});

export default function AuthPageWrapper() {
  return (
    <Suspense fallback={<div className="text-center mt-20">Đang tải...</div>}>
      <AuthPage />
    </Suspense>
  );
}