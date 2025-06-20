import Product from './components/product/product'
import Banner from './components/banner/banner'
export default function Home() {
  return (
    <>
      <Banner />
      <div>
        <h1>Chào mừng đến với Waka</h1>
        <p>Khám phá thế giới sách số với hàng ngàn đầu sách</p>
        <Product />
      </div>
    </>

  );
}
