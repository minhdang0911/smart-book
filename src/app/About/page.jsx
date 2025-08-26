'use client';

import { AudioOutlined, BookOutlined, QuestionCircleOutlined, TeamOutlined, TrophyOutlined } from '@ant-design/icons';
import { Card, Col, Collapse, Row, Timeline, Typography } from 'antd';

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

export default function SmartBookLanding() {
    const faqList = [
        {
            question: 'SmartBook là gì?',
            answer: 'SmartBook là nền tảng giúp bạn tìm kiếm, đọc và quản lý sách mọi lúc, mọi nơi.',
        },
        {
            question: 'Làm sao để mua sách trên SmartBook?',
            answer: 'Bạn có thể tìm kiếm sách, thêm vào giỏ hàng và thanh toán trực tuyến hoặc nhận sách giấy tại nhà.',
        },
        {
            question: 'SmartBook có hỗ trợ sách nói (AudioBook) không?',
            answer: 'Có, SmartBook cung cấp cả sách giấy, eBook và AudioBook.',
        },
        {
            question: 'Tôi có thể đọc sách trên điện thoại không?',
            answer: 'Bạn có thể đọc sách trên mọi thiết bị: điện thoại, máy tính bảng, laptop.',
        },
    ];

    const timelineData = [
        {
            color: 'blue',
            year: '2024',
            title: 'Vượt hơn cả phần bản',
            description: 'SmartBook đạt chứng chỉ Vàng của thế giới Đọc Nam Á.',
        },
        {
            color: 'green',
            year: '2023',
            title: 'Thành lập Công ty Cổ phần SmartBook',
            description: 'Thành lập chính thức, ra mắt thương mại điện tử và hợp tác với nhiều nhà xuất bản.',
        },
        {
            color: 'purple',
            year: '2022',
            title: 'Cộng đồng phát triển mạnh',
            description: 'Xây dựng cộng đồng SmartBook với hàng triệu độc giả và hàng trăm nghìn cuốn sách.',
        },
        {
            color: 'red',
            year: '2021',
            title: 'Phát hành ứng dụng di động',
            description: 'Ra mắt ứng dụng trên iOS & Android, trở thành đối tác của China Literature.',
        },
        {
            color: 'orange',
            year: '2020',
            title: 'Thư viện Ebook đầu tiên',
            description: 'Thử nghiệm thư viện Ebook với hơn 1.5 triệu đầu sách, phục vụ hàng triệu người dùng.',
        },
        {
            color: 'cyan',
            year: '2019',
            title: 'Ra mắt nền tảng xuất bản điện tử',
            description: 'Hợp tác với các nhà sách lớn để phát triển ứng dụng đọc sách trực tuyến.',
        },
        {
            color: 'gold',
            year: '2018',
            title: 'Ý tưởng đầu tiên',
            description: 'Nhóm sáng lập bắt đầu xây dựng ý tưởng SmartBook – nền tảng Ebook tại Việt Nam.',
        },
        {
            color: 'gray',
            year: '2017',
            title: 'Khởi đầu hành trình',
            description: 'Nhóm nghiên cứu nhỏ được thành lập, ấp ủ mô hình đưa tri thức số đến gần hơn với mọi người.',
        },
    ];

    return (
        <div style={{ background: '#fff', minHeight: '100vh' }}>
            <style>{baseCss}</style>

            {/* Hero */}
            {/* Hero */}
            <div style={{ width: '100%' }}>
                <img src="/banner.png" alt="Banner" className="hero-banner" />
            </div>

            {/* Features */}
            <section className="features-section">
                <div className="container">
                    <Row gutter={[32, 32]} justify="center" align="stretch">
                        <Col xs={12} sm={6}>
                            <Card className="feature-card" bordered={false}>
                                <div className="feature-icon">
                                    <BookOutlined />
                                </div>
                                <Title level={4}>Giới thiệu</Title>
                            </Card>
                        </Col>
                        <Col xs={12} sm={6}>
                            <Card className="feature-card" bordered={false}>
                                <div className="feature-icon">
                                    <TrophyOutlined />
                                </div>
                                <Title level={4}>Cơ chế đầu tư</Title>
                            </Card>
                        </Col>
                        <Col xs={12} sm={6}>
                            <Card className="feature-card" bordered={false}>
                                <div className="feature-icon">
                                    <AudioOutlined />
                                </div>
                                <Title level={4}>Lĩnh vực hoạt động</Title>
                            </Card>
                        </Col>
                        <Col xs={12} sm={6}>
                            <Card className="feature-card" bordered={false}>
                                <div className="feature-icon">
                                    <TeamOutlined />
                                </div>
                                <Title level={4}>Đối tác</Title>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </section>

            {/* Company Intro */}
            <section className="company-intro">
                <div className="container">
                    <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
                        Giới thiệu chúng tôi
                    </Title>
                    <Paragraph style={introStyle}>
                        Năm 2019, SmartBook chính thức được ra mắt với mục tiêu trở thành nền tảng đọc sách hàng đầu tại
                        Việt Nam. Với sứ mệnh <b>"Mang tri thức đến mọi người"</b>, SmartBook không ngừng đổi mới để
                        mang lại trải nghiệm đọc sách phong phú và tiện lợi.
                    </Paragraph>
                    <Paragraph style={introStyle}>
                        Chúng tôi xây dựng hệ sinh thái bao gồm sách giấy, Ebook và Audiobook, giúp độc giả có thể tiếp
                        cận tri thức ở bất cứ đâu và bất cứ lúc nào. Không chỉ đơn thuần là một ứng dụng, SmartBook còn
                        là cầu nối giữa độc giả và nhà xuất bản, giữa tri thức và cuộc sống.
                    </Paragraph>
                    <Paragraph style={introStyle}>
                        Đến nay, SmartBook đã hợp tác với hàng trăm nhà xuất bản, đưa về hơn <b>50,000 đầu sách</b>,
                        phục vụ cho hàng triệu người dùng thường xuyên. Chúng tôi cũng đang mở rộng hợp tác quốc tế để
                        mang những tinh hoa sách ngoại văn đến gần hơn với độc giả Việt.
                    </Paragraph>
                    <Paragraph style={introStyle}>
                        Trong tương lai, SmartBook hướng đến việc trở thành nền tảng nội dung số toàn diện, không chỉ
                        giới hạn trong sách, mà còn mở rộng ra các loại hình tri thức khác như khoá học online, podcast,
                        và nhiều hình thức sáng tạo khác.
                    </Paragraph>
                </div>
            </section>

            {/* Timeline */}
            <section className="timeline-section">
                <div className="container">
                    <Title level={2} style={{ textAlign: 'center', marginBottom: 48 }}>
                        Lịch sử công ty
                    </Title>
                    <Timeline mode="alternate" className="timeline-custom">
                        {timelineData.map((item, idx) => (
                            <Timeline.Item key={idx} color={item.color} label={item.year}>
                                <div className="tl-card">
                                    <div className="tl-title">{item.title}</div>
                                    <div className="tl-desc">{item.description}</div>
                                </div>
                            </Timeline.Item>
                        ))}
                    </Timeline>
                </div>
            </section>

            {/* FAQ */}
            <section className="faq-section">
                <div className="container">
                    <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
                        Câu hỏi thường gặp
                    </Title>
                    <Collapse accordion expandIconPosition="end" className="faq-collapse">
                        {faqList.map((faq, idx) => (
                            <Panel
                                header={
                                    <span>
                                        <QuestionCircleOutlined style={{ marginRight: 8, color: '#1677ff' }} />
                                        {faq.question}
                                    </span>
                                }
                                key={idx}
                            >
                                <p style={{ margin: 0, color: '#475569' }}>{faq.answer}</p>
                            </Panel>
                        ))}
                    </Collapse>
                </div>
            </section>

            <footer className="about-footer">© {new Date().getFullYear()} SmartBook — All rights reserved.</footer>
        </div>
    );
}

const introStyle = { fontSize: 16, lineHeight: 1.8, color: '#475569', textAlign: 'justify', marginBottom: 20 };

const baseCss = `
.hero-banner {
  width: 100%;
  background: url('/banner.png') center top no-repeat;
  background-size: contain;  /* giữ nguyên tỉ lệ */
  background-color: #fff;    /* màu nền 2 bên */
  aspect-ratio: 16/5;        /* hoặc 21/9, set theo tỉ lệ thật của ảnh */
}



.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
}
.features-section { padding: 72px 0; background: #fff; }
.feature-card {
  text-align: center;
  padding: 32px 20px;
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid #e5eefc;
  box-shadow: 0 4px 18px rgba(22,119,255,0.08);

  /* ép đều chiều cao */
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.feature-card:hover { transform: translateY(-6px); box-shadow: 0 10px 24px rgba(22,119,255,0.15); }
.feature-icon {
  width: 70px; height: 70px; background: #eaf3ff; border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px auto; font-size: 28px; color: #1677ff;
}
.company-intro { padding: 72px 0; background: #f7fbff; }

/* Timeline */
.timeline-section { padding: 72px 0; background: #fff; }
.timeline-custom .ant-timeline-item-label { font-weight: 600; color: #1677ff; }
.tl-card { background: #fff; border: 1px solid #e5eefc; padding: 16px 20px;
  border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}
.tl-title { font-weight: 600; margin-bottom: 6px; color: #0f172a; }
.tl-desc { color: #475569; font-size: 15px; line-height: 1.6; }

/* FAQ */
.faq-section { padding: 72px 0; background: #f7fbff; }
.faq-collapse .ant-collapse-item {
  border-radius: 8px; margin-bottom: 12px;
  border: 1px solid #e5eefc !important; overflow: hidden;
}
.faq-collapse .ant-collapse-header {
  font-weight: 600; font-size: 16px; color: #0f172a !important;
}
.faq-collapse .ant-collapse-content-box { padding: 16px; background: #fff; }

.about-footer { margin: 48px 0; text-align: center; color: #64748b; font-size: 14px; }
`;
