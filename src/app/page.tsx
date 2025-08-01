import Author from './components/Author/Author';
import Banner from './components/banner/banner';
import Blog from './components/blog/blog';
import CouponSlider from './components/coupon/coupon';
import Event from './components/event/page';
import Gift from './components/Gift/gift';
import Product from './components/product/product';
export default function Home() {
    return (
        <div>
            <Banner />

            <CouponSlider />
            <Event />
            <Product />
            <Author />
            <Blog />
            <Gift />
        </div>
    );
}
