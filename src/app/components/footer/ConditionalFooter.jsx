'use client';

import { usePathname } from 'next/navigation';

import FooterComponent from './footer';


export default function ConditionalFooter() {
  const pathname = usePathname();
  const isAuthPage = pathname?.includes('/login') || 
                     pathname?.includes('/register') || 
                     pathname?.includes('/auth')||
                      pathname?.includes('/reset-password');
  
  if (isAuthPage) return null;
  return <FooterComponent />;
}


