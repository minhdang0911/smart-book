import Author from './components/Author/Author';
import VoyageSlider from './components/banner/banner';
import Blog from './components/blog/blog';
import BookAIChatbot from './components/Chatbot/BookAIChatbot';
import CouponSlider from './components/coupon/coupon';
import Event from './components/event/page';
import Gift from './components/Gift/gift';
import Product from './components/product/page';
import BookRunningBanner from './components/RunningBookBanner';

export default function Home() {
    return (
        <div>
            <VoyageSlider />
            <CouponSlider />
            <Event />
            <Author />
            <Product />
            <Gift />
            <Blog />
            <BookAIChatbot />
            <div style={{ width: '100%' }}>
                <BookRunningBanner />
            </div>
        </div>
    );
}
