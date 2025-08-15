'use client';
import { Collapse } from 'antd';
import 'antd/dist/reset.css';
import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
    const faqItems = [
        {
            key: '1',
            label: 'SmartBook là gì?',
            children: <p>SmartBook là nền tảng giúp bạn tìm kiếm, đọc và quản lý sách mọi lúc, mọi nơi.</p>,
        },
        {
            key: '2',
            label: 'Làm sao để mua sách trên SmartBook?',
            children: (
                <p>Bạn có thể tìm kiếm sách, thêm vào giỏ hàng và thanh toán trực tuyến hoặc nhận sách giấy tại nhà.</p>
            ),
        },
        {
            key: '3',
            label: 'SmartBook có hỗ trợ sách nói (AudioBook) không?',
            children: <p>Có, SmartBook cung cấp cả sách giấy, eBook và AudioBook.</p>,
        },
        {
            key: '4',
            label: 'Tôi có thể đọc sách trên điện thoại không?',
            children: <p>Bạn có thể đọc sách trên mọi thiết bị: điện thoại, máy tính bảng, laptop.</p>,
        },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e8f5e9 0%, #f8fffc 100%)' }}>
            {/* Header */}
            <header
                style={{
                    background: 'linear-gradient(90deg, #27ae60 60%, #219150 100%)',
                    color: 'white',
                    padding: '18px 0 18px 0',
                    boxShadow: '0 2px 12px #b2dfdb44',
                    borderBottomLeftRadius: 30,
                    borderBottomRightRadius: 30,
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 24,
                        maxWidth: 900,
                        margin: 'auto',
                    }}
                >
                    <Image
                        src="/images/logom.png"
                        alt="SmartBook Logo"
                        width={60}
                        height={60}
                        style={{ height: '60px', width: '60px', filter: 'drop-shadow(0 2px 8px #27ae6044)' }}
                        priority
                    />
                    <div style={{ textAlign: 'left' }}>
                        <span style={{ letterSpacing: 3, fontSize: '2.1rem', fontWeight: 'bold', lineHeight: 1 }}>
                            SmartBook
                        </span>
                        <span style={{ display: 'block', fontSize: 18, fontWeight: 400, marginLeft: 2, marginTop: 2 }}>
                            - Nền tảng sách thông minh cho người Việt
                        </span>
                    </div>
                </div>
            </header>

            {/* Container */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px 10px 10px 10px',
                    gap: '40px',
                    maxWidth: '1100px',
                    margin: 'auto',
                    flexWrap: 'wrap',
                    background: 'rgba(255,255,255,0.95)',
                    borderRadius: 24,
                    boxShadow: '0 4px 32px #b2dfdb33',
                }}
            >
                {/* Logo */}
                <div
                    style={{
                        flex: '1',
                        minWidth: 260,
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transform: 'translateY(-20px)', // Dịch logo lên 20px
                    }}
                >
                    <Image
                        src="/images/logom.png"
                        alt="SmartBook Logo"
                        width={200}
                        height={200}
                        style={{
                            height: 'auto',
                            width: '100%',
                            maxWidth: '200px',
                            marginBottom: 12,
                            marginTop: -300, // Dịch logo lên 80px
                            filter: 'drop-shadow(0 2px 8px #27ae6044)',
                        }}
                        priority
                    />
                    <span style={{ color: '#27ae60', fontWeight: 600, fontSize: 18, marginTop: 4 }}>
                        SmartBook - Sách cho mọi nhà
                    </span>
                    {/* Dải thông tin nổi bật */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 10,
                            marginTop: 24,
                            width: '100%',
                            alignItems: 'center',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                gap: 16,
                                flexWrap: 'wrap',
                                justifyContent: 'center',
                            }}
                        >
                            <div
                                style={{
                                    background: '#e8f5e9',
                                    borderRadius: 8,
                                    padding: '10px 18px',
                                    color: '#27ae60',
                                    fontWeight: 600,
                                    fontSize: 15,
                                    minWidth: 160,
                                    boxShadow: '0 1px 4px #b2dfdb22',
                                }}
                            >
                                📚 Hơn 10.000+ đầu sách
                            </div>
                            <div
                                style={{
                                    background: '#e8f5e9',
                                    borderRadius: 8,
                                    padding: '10px 18px',
                                    color: '#27ae60',
                                    fontWeight: 600,
                                    fontSize: 15,
                                    minWidth: 160,
                                    boxShadow: '0 1px 4px #b2dfdb22',
                                }}
                            >
                                🤝 50+ nhà xuất bản uy tín
                            </div>
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                gap: 16,
                                flexWrap: 'wrap',
                                justifyContent: 'center',
                            }}
                        >
                            <div
                                style={{
                                    background: '#e8f5e9',
                                    borderRadius: 8,
                                    padding: '10px 18px',
                                    color: '#27ae60',
                                    fontWeight: 600,
                                    fontSize: 15,
                                    minWidth: 160,
                                    boxShadow: '0 1px 4px #b2dfdb22',
                                }}
                            >
                                👥 100.000+ độc giả
                            </div>
                            <div
                                style={{
                                    background: '#e8f5e9',
                                    borderRadius: 8,
                                    padding: '10px 18px',
                                    color: '#27ae60',
                                    fontWeight: 600,
                                    fontSize: 15,
                                    minWidth: 160,
                                    boxShadow: '0 1px 4px #b2dfdb22',
                                }}
                            >
                                ⭐ Đánh giá 4.9/5 từ người dùng
                            </div>
                        </div>
                    </div>
                </div>

                {/* Nội dung */}
                <div style={{ flex: '2', minWidth: '320px', padding: '0 10px' }}>
                    <h2 style={{ color: '#27ae60', marginBottom: '18px', fontSize: 28, fontWeight: 700 }}>
                        Về SmartBook
                    </h2>
                    <p style={{ fontSize: 17, lineHeight: 1.7, marginBottom: 12 }}>
                        <b>SmartBook</b> là nền tảng đọc sách hiện đại, kết nối cộng đồng yêu sách Việt Nam với kho sách
                        đa dạng từ sách giấy, eBook đến AudioBook. Chúng tôi mang đến trải nghiệm đọc sách tiện lợi, cá
                        nhân hóa và thân thiện trên mọi thiết bị.
                    </p>
                    <p style={{ fontSize: 17, lineHeight: 1.7, marginBottom: 12 }}>
                        Với <b>SmartBook</b>, bạn có thể:
                        <ul style={{ margin: '8px 0 8px 24px', fontSize: 16, color: '#333' }}>
                            <li>Tìm kiếm, đọc thử và mua sách nhanh chóng chỉ với vài thao tác.</li>
                            <li>Quản lý tủ sách cá nhân, đánh dấu trang, ghi chú và chia sẻ cảm nhận với cộng đồng.</li>
                            <li>Tham gia các sự kiện, nhận ưu đãi độc quyền và cập nhật tin tức sách mới mỗi ngày.</li>
                            <li>
                                Trải nghiệm đọc sách không giới hạn trên mọi thiết bị: điện thoại, máy tính bảng,
                                laptop.
                            </li>
                            <li>
                                Hỗ trợ nhiều hình thức: sách giấy, eBook, AudioBook, đáp ứng mọi nhu cầu đọc của bạn.
                            </li>
                        </ul>
                    </p>
                    <p style={{ fontSize: 17, lineHeight: 1.7, marginBottom: 12 }}>
                        Đội ngũ <b>SmartBook</b> luôn nỗ lực phát triển công nghệ, hợp tác với các nhà xuất bản uy tín
                        để mang lại giá trị thực cho cộng đồng độc giả Việt. Chúng tôi tin rằng mỗi cuốn sách là một
                        hành trình, và SmartBook sẽ đồng hành cùng bạn trên hành trình tri thức ấy.
                    </p>

                    {/* FAQ - Hỏi đáp */}
                    <div style={{ marginTop: 40, marginBottom: 24 }}>
                        <h3 style={{ color: '#27ae60', marginBottom: 16, fontSize: 22 }}>Câu hỏi thường gặp</h3>
                        <Collapse
                            items={faqItems}
                            accordion
                            style={{ background: '#f4fff7', borderRadius: 8, border: '1px solid #b2dfdb55' }}
                        />
                    </div>

                    {/* Nút quay lại trang chủ */}
                    <Link
                        href="/"
                        style={{
                            display: 'inline-block',
                            marginTop: '10px',
                            background: 'linear-gradient(90deg, #27ae60 60%, #219150 100%)',
                            color: 'white',
                            padding: '12px 28px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            fontSize: 17,
                            boxShadow: '0 2px 8px #b2dfdb44',
                            transition: 'background 0.2s',
                        }}
                    >
                        ← Về Trang Chủ
                    </Link>
                </div>
            </div>
        </div>
    );
}
