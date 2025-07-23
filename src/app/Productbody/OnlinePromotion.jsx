import ProductCard from '@/components/ProductCard'; // sửa path cho đúng thư mục bạn đang để


{displayedBooks.map((book) => (
    <div key={book.id} className="product-slide">
        <ProductCard
            book={book}
            formatPrice={formatPrice}
            calculateDiscountedPrice={calculateDiscountedPrice}
        />
    </div>
))}
