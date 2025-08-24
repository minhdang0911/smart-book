'use client';

import { ArrowUpOutlined, AudioOutlined, BookOutlined, TeamOutlined, TrophyOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Modal, Input, Button, Spin } from 'antd';
import { Card, Col, Row, Typography } from 'antd';
import { useEffect, useState } from 'react';

const { Title, Paragraph, Text } = Typography;

export default function SmartBookLanding() {
    // Danh sách câu hỏi thường gặp
    const faqList = [
        {
            question: 'SmartBook là gì?',
            answer: 'SmartBook là nền tảng giúp bạn tìm kiếm, đọc và quản lý sách mọi lúc, mọi nơi.'
        },
        {
            question: 'Làm sao để mua sách trên SmartBook?',
            answer: 'Bạn có thể tìm kiếm sách, thêm vào giỏ hàng và thanh toán trực tuyến hoặc nhận sách giấy tại nhà.'
        },
        {
            question: 'SmartBook có hỗ trợ sách nói (AudioBook) không?',
            answer: 'Có, SmartBook cung cấp cả sách giấy, eBook và AudioBook.'
        },
        {
            question: 'Tôi có thể đọc sách trên điện thoại không?',
            answer: 'Bạn có thể đọc sách trên mọi thiết bị: điện thoại, máy tính bảng, laptop.'
        },
    ];
    const [scrollTop, setScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrollTop(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleScrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const timelineData = [
        {
            color: '#FF6B35',
            title: 'Vượt hơn cả phần bản',
            description:
                'Tháng 8/2024: SmartBook đạt chứng chỉ Vàng của thế giới Đọc Nam Á với kỳ thành mình phân chia chính điều kiện số 1.',
            year: '2024',
        },
        {
            color: '#E74C3C',
            title: 'Thành lập Công ty Cổ phần SmartBook',
            description:
                '04/2023: Công ty Cổ phần SmartBook chính thức được thành lập sau tám tháng xin phép và thành SmartBook hiện có 1 triệu người dùng. 10/2023: SmartBook ra mắt Thương mại điện tử và 12/2023: SmartBook phối hợp với các nhà sách tên lớn để mở kho sách với hàng nghìn đầu sách mới.',
            year: '2023',
        },
        {
            color: '#8E44AD',
            title: 'Sự hỗ trợ nhiều cấp độ người dùng tăm nhìn MKH',
            description:
                'Xây dựng ứng dụng SmartBook với cộng đồng người yêu thích đọc sách, lên 3.5 triệu độc giả với hàng 5 triệu người dùng hoạt động tích cực hàng tháng dự kiến.',
            year: '2022',
        },
        {
            color: '#3498DB',
            title: 'Chính thức phát hành ứng dụng đọc sách trên các nền tảng di động',
            description:
                'SmartBook chính thức trở thành đối tác chính thức của Việt Nam cho China Literature (Tập đoàn cung cấp nội dung số lớn nhất Trung Quốc).',
            year: '2021',
        },
        {
            color: '#1ABC9C',
            title: 'Thử nghiệm Thư viện Ebook đầu tiên tại Việt Nam với 1.5 triệu sách',
            description:
                '7/2020: SmartBook hợp với NXB Giáo Trung Ương Tân và mở rộng kế hoạch chuyển ngành 10/2020: Thư viện Ebook SmartBook có cơ sở 16,000 Ebooks, 1.5 triệu độc giả mỗi sách, tại hơn 2 triệu cuốn sách trên cùng dương',
            year: '2020',
        },
        {
            color: '#27AE60',
            title: 'SmartBook ra mắt thân thiện xuất bản điện tử SmartBook',
            description:
                'Cung cấp giải pháp sách Woocriff toàn cao, mật độ âm chính dạng, website 6/2019: SmartBook hợp với các nhà sách Alphanbooks & Saonbooks ra mắt các ứng dụng thích thích thương mại điện tử truyền thống',
            year: '2019',
        },
        {
            color: '#F39C12',
            title: 'Ra mắt thân thương xuất bản điện tử SmartBook',
            description:
                'Xây dựng website, ứng dụng SmartBook - Nền tảng Ebook đầu tiên tại Việt Nam với cộng đồng người dùng yêu thích đọc Ebook với hơn 500,000 lượt xem.',
            year: '2018',
        },
    ];

    return (
    <div style={{ background: ' center/cover no-repeat', minHeight: '100vh', position: 'relative' }}>
            <style>
                {`
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }
          
          .hero-section {
            background: Dark Green(135deg, #2C5F2D 0%, #1E4A29 50%, #0F2E18 100%);
            min-height: 100vh;
            position: relative;
            overflow: hidden;
            padding: -10px 0;
            color: white;
          }
          
          .hero-sun {
            position: absolute;
            top: 60px;
            right: 80px;
                <div style={{ background: 'url(/banner.png) center/cover no-repeat', minHeight: '100vh' }}>
            height: 120px;
            background: Dark Green(45deg, #FFA500, #FF8C00);
            border-radius: 50%;
            box-shadow: 0 0 50px rgba(255, 165, 0, 0.6);
            animation: sunGlow 4s ease-in-out infinite;
          }
          
          @keyframes sunGlow {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          
          .hero-tree {
            position: absolute;
            bottom: 0;
            left: 8%;
            width: 350px;
            height: 400px;
            z-index: 1;
          }
          
          .tree-trunk {
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 20px;
            height: 160px;
            background: linear-gradient(to bottom, #8B4513, #654321);
            border-radius: 10px 10px 0 0;
          }
          
          .tree-crown {
            position: absolute;
            bottom: 120px;
            left: 50%;
            transform: translateX(-50%);
            width: 280px;
            height: 240px;
            background: radial-gradient(ellipse, #228B22 0%, #006400 70%);
            border-radius: 50% 50% 45% 45%;
          }
          
          .tree-leaves {
            position: absolute;
            bottom: 140px;
            left: 50%;
            transform: translateX(-50%);
            width: 260px;
            height: 200px;
          }
          
          .leaf {
            position: absolute;
            width: 15px;
            height: 15px;
            background: #32CD32;
            border-radius: 50% 0;
            animation: leafFloat 3s ease-in-out infinite;
          }
          
          @keyframes leafFloat {
            0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.8; }
            50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
          }
          
          .character-sitting {
            position: absolute;
            bottom: 100px;
            left: 13%;
            width: 80px;
            height: 100px;
            background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
            border-radius: 25px 25px 12px 12px;
            z-index: 3;
          }
          
          .floating-icons {
            position: absolute;
            bottom: 180px;
            left: 25%;
            z-index: 2;
          }
          
          .icon-float {
            position: absolute;
            width: 50px;
            height: 50px;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            animation: iconFloat 4s ease-in-out infinite;
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.2);
          }
          
          @keyframes iconFloat {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-25px) scale(1.1); }
          }
          
          .book-showcase {
            display: flex;
            gap: 20px;
            justify-content: center;
            align-items: flex-end;
            margin-top: 60px;
            z-index: 4;
            position: relative;
          }
          
          .book-item {
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
            transition: transform 0.3s ease;
            overflow: hidden;
            position: relative;
          }
          
          .book-item:hover {
            transform: translateY(-15px) rotateY(15deg);
          }
          
          .book-1 {
            width: 110px;
            height: 150px;
            background: linear-gradient(135deg, #DC143C, #8B0000);
          }
          
          .book-2 {
            width: 150px;
            height: 210px;
            background: linear-gradient(135deg, #FF8C00, #FF4500);
          }
          
          .book-3 {
            width: 170px;
            height: 240px;
            background: linear-gradient(135deg, #FFD700, #FFA500);
          }
          
          .book-4 {
            width: 130px;
            height: 180px;
            background: linear-gradient(135deg, #32CD32, #228B22);
          }
          
          .social-icons {
            position: fixed;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            flex-direction: column;
            gap: 12px;
            z-index: 999;
          }
          
          .social-icon {
            width: 55px;
            height: 55px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 22px;
            cursor: pointer;
            transition: transform 0.3s ease;
            text-decoration: none;
            font-weight: bold;
          }
          
          .social-icon:hover {
            transform: scale(1.15);
          }
          
          .social-icon.teal { background: #20B2AA; }
          .social-icon.orange { background: #FF8C00; }
          .social-icon.yellow { background: #FFD700; color: #333; }
          .social-icon.blue { background: #4169E1; }
          .social-icon.purple { background: #9370DB; }
          
          .scroll-top {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 55px;
            height: 55px;
            background: #87CEEB;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 999;
            transition: all 0.3s ease;
            font-size: 20px;
          }
          
          .scroll-top:hover {
            background: #4682B4;
            transform: scale(1.1);
          }
          
          .features-section {
            padding: 80px 0;
            background: #ffffff;
          }
          
          .feature-card {
            text-align: center;
            padding: 40px 20px;
            border-radius: 15px;
            transition: all 0.3s ease;
            border: none;
            background: #ffffff;
            box-shadow: 0 5px 25px rgba(135, 206, 235, 0.15);
            height: 100%;
          }
          
          .feature-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 15px 35px rgba(135, 206, 235, 0.25);
          }
          
          .feature-icon {
            width: 90px;
            height: 90px;
            background: linear-gradient(135deg, #87CEEB, #4682B4);
            border-radius: 22px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 28px auto;
            font-size: 36px;
            color: white;
            box-shadow: 0 8px 20px rgba(135, 206, 235, 0.3);
          }
          
          .company-intro {
            padding: 80px 0;
            background: #f8fbff;
          }
          
          .timeline-section {
            padding: 80px 0;
            background: #ffffff;
          }
          
          .timeline-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 50px;
            padding: 30px;
            background: white;
            border-radius: 15px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
            transition: all 0.3s ease;
            border-left: 5px solid transparent;
          }
          
          .timeline-item:hover {
            transform: translateX(15px);
            box-shadow: 0 12px 35px rgba(0, 0, 0, 0.12);
          }
          
          .timeline-year {
            width: 90px;
            height: 90px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            font-weight: bold;
            color: white;
            margin-right: 30px;
            flex-shrink: 0;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
          }
          
          .timeline-content {
            flex: 1;
          }
          
          .timeline-title {
            color: #333;
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 15px;
            line-height: 1.4;
          }
          
          .timeline-description {
            color: #666;
            font-size: 15px;
            line-height: 1.7;
            margin: 0;
          }
        `}
            </style>

            {/* Hero Section */}
            <img src="/banner.png" alt="Banner" style={{ width: '100%', height: '800px', display: 'block' }} />

            {/* Features Section */}
            <section className="features-section">
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
                    <Row gutter={[40, 40]} justify="center">
                        <Col xs={12} sm={6} lg={6}>
                            <Card className="feature-card" bordered={false}>
                                <div className="feature-icon">
                                    <BookOutlined />
                                </div>
                                <Title level={4} style={{ color: '#333', marginBottom: '8px', fontSize: '18px' }}>
                                    Giới thiệu
                                </Title>
                            </Card>
                        </Col>
                        <Col xs={12} sm={6} lg={6}>
                            <Card className="feature-card" bordered={false}>
                                <div className="feature-icon">
                                    <TrophyOutlined />
                                </div>
                                <Title level={4} style={{ color: '#333', marginBottom: '8px', fontSize: '18px' }}>
                                    Cơ chế đầu tư
                                </Title>
                            </Card>
                        </Col>
                        <Col xs={12} sm={6} lg={6}>
                            <Card className="feature-card" bordered={false}>
                                <div className="feature-icon">
                                    <AudioOutlined />
                                </div>
                                <Title level={4} style={{ color: '#333', marginBottom: '8px', fontSize: '18px' }}>
                                    Lĩnh vực hoạt động
                                </Title>
                            </Card>
                        </Col>
                        <Col xs={12} sm={6} lg={6}>
                            <Card className="feature-card" bordered={false}>
                                <div className="feature-icon">
                                    <TeamOutlined />
                                </div>
                                <Title level={4} style={{ color: '#333', marginBottom: '8px', fontSize: '18px' }}>
                                    Đội tác
                                </Title>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </section>

            {/* Company Introduction */}
            <section className="company-intro">
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
                    <Title level={2} style={{ color: '#333', marginBottom: '48px', fontSize: '32px' }}>
                        Giới thiệu chúng tôi
                    </Title>
                    <Row gutter={[48, 32]}>
                        <Col xs={24}>
                            <Paragraph
                                style={{
                                    fontSize: '16px',
                                    lineHeight: 1.8,
                                    color: '#666',
                                    textAlign: 'justify',
                                    marginBottom: '24px',
                                }}
                            >
                                Năm 2019, SmartBook từ một sản phẩm của Viet Corporation được chính thức ra mắt với mục
                                tiêu trở thành một nền tảng đọc sách hàng đầu tại Việt Nam. Với sứ mệnh "Mang tri thức
                                đến mọi người", SmartBook không ngừng phát triển và cải tiến để mang đến trải nghiệm đọc
                                sách tốt nhất cho người dùng, đích chúng cũng sánh với các nền tảng khác như thế để cung
                                cấp nội dung chất lượng.
                            </Paragraph>
                            <Paragraph
                                style={{
                                    fontSize: '16px',
                                    lineHeight: 1.8,
                                    color: '#666',
                                    textAlign: 'justify',
                                    marginBottom: '24px',
                                }}
                            >
                                Hiện tại, Công ty Cổ phần SmartBook ra mắt để SmartBook tùy hành về đăng ký phòng hoạt
                                động chính ngành nghề đăng ký ở châu Ebooks các giai đê về hoạt chủ lạ ban và SmartBook.
                                Điều chúng có thể nhờ hỗ trợ dữ liệu hoạt động ở trong ngoại khu đóng dạng tính năng về
                                động thông qua thành sao dành cho SmartBooks tôn trong về đờg lại hỗ trợ dưới thằng.
                            </Paragraph>
                            <Paragraph
                                style={{
                                    fontSize: '16px',
                                    lineHeight: 1.8,
                                    color: '#666',
                                    textAlign: 'justify',
                                    marginBottom: '24px',
                                }}
                            >
                                Với sự biểu hiện, SmartBook hơi những rằng làm với hoạt SmartBook thành cộng ở chỗ và
                                điều hoạt cộng với khác thành người dùng về khác nguyên thì đưa nào cũng với hơn 18,000
                                sản phẩm sách đã và chọn rằn 1,900 sản phẩm lẫn cả về. Giá bán thành công và có thành
                                đưa với số hoạt động nghệ hoạt sách điện tử hàng đầu với số lượt người dùng uy tín về 30
                                triệu.
                            </Paragraph>
                            <Paragraph
                                style={{ fontSize: '16px', lineHeight: 1.8, color: '#666', textAlign: 'justify' }}
                            >
                                Ngoài ra, Công ty Cổ phần SmartBook cũng đã từng thành công là nhánh trong số các
                                platform hoạt nơi hoạt gì nhau sách điện tử các sách, lách vụ hoạt nội dung trong việc
                                nghiệm với hoạt động báo cáo người dùng mắm mọi lúc với hoạt nổi tại 100,000 hoạt điều
                                chúng hoạt động tại ngành với hoạt động 15,000 các với số hoạt động người. PrimeBook,
                                VoxBook, BookWise, VastmoveBook, MemBook, NaBook, Lenoct...
                            </Paragraph>
                        </Col>
                    </Row>
                </div>
            </section>

            {/* Timeline Section */}
            <section className="timeline-section">
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
                    <Title
                        level={2}
                        style={{ textAlign: 'center', marginBottom: '60px', color: '#333', fontSize: '32px' }}
                    >
                        Lịch sử công ty
                    </Title>

                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        {timelineData.map((item, index) => (
                            <div key={index} className="timeline-item" style={{ borderLeftColor: item.color }}>
                                <div className="timeline-year" style={{ backgroundColor: item.color }}>
                                    {item.year}
                                </div>
                                <div className="timeline-content">
                                    <div className="timeline-title" style={{ color: item.color }}>
                                        {item.title}
                                    </div>
                                    <div className="timeline-description">{item.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        {/* Bảng gợi ý câu hỏi thường gặp - cuối trang */}
        <div style={{ maxWidth: 650, margin: '32px auto', background: '#fff', borderRadius: 18, boxShadow: '0 2px 16px #b2dfdb22', padding: 32 }}>
            <h2 style={{ color: '#27ae60', marginBottom: 24, textAlign: 'center', fontWeight: 700 }}>Câu hỏi thường gặp</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                    {faqList.map((faq, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #e8f5e9' }}>
                            <td style={{ padding: '16px 12px', fontWeight: 600, color: '#219150', width: '45%' }}>{faq.question}</td>
                            <td style={{ padding: '16px 12px', color: '#333' }}>{faq.answer}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
    );
}
