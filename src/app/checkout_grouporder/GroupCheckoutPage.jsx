import { Spin } from 'antd';
import { Suspense } from 'react';
import GroupCheckoutPageContent from './GroupCheckoutPageContent';

const GroupCheckoutPage = () => {
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
            <GroupCheckoutPageContent />
        </Suspense>
    );
};

export default GroupCheckoutPage;
