import Banner from './components/banner/banner';
import CouponSlider from './components/coupon/coupon';
import Event from './components/event/page';
import Product from './components/product/product';

export default function Home() {
    return (
        <div>
            <Banner />

            <CouponSlider />
            <Event />
            <Product />
        </div>
    );
}
