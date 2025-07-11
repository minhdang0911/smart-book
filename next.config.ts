import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    reactStrictMode: false, // 🚫 Tắt Strict Mode để tránh useEffect bị gọi 2 lần
};

export default nextConfig;
