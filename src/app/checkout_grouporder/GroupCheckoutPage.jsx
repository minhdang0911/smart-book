import { Spin } from 'antd';
import { Suspense } from 'react';
import GroupCheckoutWrapper from './GroupCheckoutWrapper';

export default function GroupCheckoutPage() {
    return (
        <Suspense
            fallback={
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '400px',
                    }}
                >
                    <Spin size="large" />
                </div>
            }
        >
            <GroupCheckoutWrapper />
        </Suspense>
    );
}
