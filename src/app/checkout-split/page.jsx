import { Suspense } from 'react';
import CheckoutSplitClient from './CheckoutSplitClient';

export default function Page() {
    return (
        <Suspense fallback={<div style={{ padding: 24 }}>Loading...</div>}>
            <CheckoutSplitClient />
        </Suspense>
    );
}
