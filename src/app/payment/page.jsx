import CheckoutPageContent from './CheckoutPageContent'
const CheckoutPage = () => {
    return (
        <Suspense fallback={
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '400px' 
            }}>
                <Spin size="large" />
            </div>
        }>
            <CheckoutPageContent />
        </Suspense>
    );
};

export default CheckoutPage;