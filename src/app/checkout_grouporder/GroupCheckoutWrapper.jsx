'use client';

import { useSearchParams } from 'next/navigation';
import GroupCheckoutPageContent from './GroupCheckoutPageContent';

export default function GroupCheckoutWrapper() {
    const searchParams = useSearchParams();
    const urlToken = searchParams.get('token');

    return <GroupCheckoutPageContent urlToken={urlToken} />;
}
