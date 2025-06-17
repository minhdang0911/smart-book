'use client';

import { usePathname } from 'next/navigation';
import Header from './Header/Header';

export default function ConditionalHeader() {
  const pathname = usePathname();
  const isAuthPage = pathname?.includes('/login') || 
                     pathname?.includes('/register') || 
                     pathname?.includes('/auth')||
                      pathname?.includes('/reset-password');
  
  if (isAuthPage) return null;
  return <Header />;
}