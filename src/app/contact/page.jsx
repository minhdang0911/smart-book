'use client';

import { LoadingOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, Row, Space, Typography, message } from 'antd';
import { gsap } from 'gsap';
import { useEffect, useRef, useState } from 'react';
import banner from '../assets/img/banner.png';

const { Title, Paragraph, Text, Link } = Typography;

export default function ContactPage() {
    // EmailJS
    const EMAIL_SERVICE_ID = 'service_lg81eri';
    const EMAIL_TEMPLATE_ID = 'template_2cxd19m';
    const EMAIL_PUBLIC_KEY = '54mEZG14u54_ru90Y';

    // Refs
    const heroRef = useRef(null);
    const formCardRef = useRef(null);
    const infoCardRef = useRef(null);
    const scrollDotRef = useRef(null);
    const mapRef = useRef(null);
    const leafletMapRef = useRef(null);

    // Form
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // load EmailJS
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
        script.async = true;
        script.onload = () => window.emailjs?.init(EMAIL_PUBLIC_KEY);
        document.head.appendChild(script);
        return () => document.head.removeChild(script);
    }, []);

    // Leaflet map
    useEffect(() => {
        const COORDS = { lat: 10.8532, lng: 106.6278 };
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        script.onload = () => {
            if (!mapRef.current || !window.L) return;
            const L = window.L;
            const map = L.map(mapRef.current).setView([COORDS.lat, COORDS.lng], 16);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; OpenStreetMap',
            }).addTo(map);
            L.marker([COORDS.lat, COORDS.lng])
                .addTo(map)
                .bindPopup('<b>SmartBook</b><br/>QTSC9 (Toà T)<br/>P.Tân Chánh Hiệp, Q.12')
                .openPopup();
            leafletMapRef.current = map;
        };
        document.body.appendChild(script);

        return () => {
            try {
                leafletMapRef.current?.remove();
            } catch {}
            document.head.removeChild(link);
            document.body.removeChild(script);
        };
    }, []);

    // GSAP
    useEffect(() => {
        if (heroRef.current) gsap.from(heroRef.current, { autoAlpha: 0, y: 20, duration: 0.7, ease: 'power2.out' });
        gsap.from([formCardRef.current, infoCardRef.current], {
            autoAlpha: 0,
            y: 30,
            duration: 0.7,
            ease: 'power2.out',
            stagger: 0.12,
            delay: 0.15,
        });
        if (scrollDotRef.current) {
            gsap.timeline({ repeat: -1 })
                .fromTo(scrollDotRef.current, { y: 0, autoAlpha: 0.4 }, { y: 16, autoAlpha: 1, duration: 0.8 })
                .to(scrollDotRef.current, { y: 0, autoAlpha: 0.4, duration: 0.8 });
        }
    }, []);

    // Submit
    const onFinish = async (values) => {
        setLoading(true);
        try {
            if (!window.emailjs) throw new Error('EmailJS not ready');
            const templateParams = {
                from_name: values.name,
                from_email: values.email,
                subject: values.subject,
                message: values.message,
                to_name: 'SmartBook',
            };
            const result = await window.emailjs.send(EMAIL_SERVICE_ID, EMAIL_TEMPLATE_ID, templateParams);
            if (result.status === 200) {
                message.success('Đã gửi! Team sẽ phản hồi sớm nhất.');
                form.resetFields();
            } else throw new Error('Send failed');
        } catch (err) {
            console.error(err);
            message.error('Gửi thất bại. Thử lại nha bro.');
        } finally {
            setLoading(false);
        }
    };

    const onFinishFailed = ({ errorFields }) => form.scrollToField(errorFields?.[0]?.name || []);

    // Banner style: dùng ảnh import
    const heroBg = `linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.55)), url("${
        banner?.src || banner
    }") center/cover no-repeat`;

    return (
        <div style={{ width: '100%', margin: 0, padding: 0 }}>
            <div style={{ width: '100%', overflow: 'hidden', position: 'relative' }}>
                <img
                    src={banner.src}
                    alt="Banner"
                    style={{
                        width: '100%',
                        height: '80%',
                        display: 'block',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: '#fff',
                        textAlign: 'center',
                    }}
                ></div>
            </div>

            {/* CONTENT */}
            <div style={{ background: '#f7f8fa', padding: '48px 0' }}>
                <div style={{ width: 'min(1120px, 92%)', margin: '0 auto' }}>
                    <Row gutter={[24, 24]} align="stretch">
                        {/* FORM */}
                        <Col xs={24} lg={14}>
                            <Card ref={formCardRef} bordered className="ant-card-hoverable">
                                <Title level={3} style={{ marginBottom: 16 }}>
                                    Gửi thông điệp
                                </Title>

                                <Form
                                    form={form}
                                    layout="vertical"
                                    onFinish={onFinish}
                                    onFinishFailed={onFinishFailed}
                                    validateTrigger={['onBlur', 'onSubmit']}
                                    disabled={loading}
                                    scrollToFirstError
                                >
                                    <Form.Item
                                        name="name"
                                        label="Tên của bạn"
                                        rules={[
                                            { required: true, message: 'Xin nhập tên.' },
                                            { min: 2, message: 'Tên tối thiểu 2 ký tự.' },
                                        ]}
                                    >
                                        <Input placeholder="VD: Nguyễn Văn A" />
                                    </Form.Item>

                                    <Form.Item
                                        name="email"
                                        label="Email"
                                        rules={[
                                            { required: true, message: 'Xin nhập email.' },
                                            { type: 'email', message: 'Email không hợp lệ.' },
                                        ]}
                                    >
                                        <Input placeholder="you@example.com" />
                                    </Form.Item>

                                    <Form.Item
                                        name="subject"
                                        label="Chủ đề"
                                        rules={[
                                            { required: true, message: 'Xin nhập chủ đề.' },
                                            { max: 120, message: 'Chủ đề tối đa 120 ký tự.' },
                                        ]}
                                    >
                                        <Input placeholder="Bạn cần hỗ trợ gì?" />
                                    </Form.Item>

                                    <Form.Item
                                        name="message"
                                        label="Nội dung"
                                        rules={[
                                            { required: true, message: 'Xin nhập nội dung.' },
                                            { min: 10, message: 'Nội dung tối thiểu 10 ký tự.' },
                                            { max: 200, message: 'Tối đa 200 ký tự.' },
                                        ]}
                                    >
                                        <Input.TextArea
                                            rows={6}
                                            placeholder="Mô tả chi tiết để tụi mình hỗ trợ nhanh nhất..."
                                            maxLength={200}
                                            showCount={{
                                                formatter: ({ count, maxLength }) => `${count}/${maxLength}`,
                                            }}
                                        />
                                    </Form.Item>

                                    <Form.Item>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            loading={loading}
                                            icon={loading ? <LoadingOutlined /> : null}
                                        >
                                            {loading ? 'Đang gửi...' : 'Gửi'}
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </Card>
                        </Col>

                        {/* INFO + MAP */}
                        <Col xs={24} lg={10}>
                            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                <Card ref={infoCardRef}>
                                    <Title level={4} style={{ marginBottom: 8 }}>
                                        SmartBook
                                    </Title>
                                    <Paragraph type="secondary" style={{ marginBottom: 16 }}>
                                        Tòa nhà QTSC9 (toà T)
                                        <br />
                                        Đường Tô Ký, P.Tân Chánh Hiệp, Q.12
                                    </Paragraph>

                                    <div style={{ marginBottom: 16 }}>
                                        <Text strong>Điện thoại: </Text>
                                        <Link href="tel:+84123456789">+84 123 456 789</Link>
                                    </div>
                                    <div>
                                        <Text strong>Email: </Text>
                                        <Link href="mailto:info@smartbook.com">info@smartbook.com</Link>
                                    </div>
                                </Card>

                                <Card title="Bản đồ" bodyStyle={{ padding: 0 }}>
                                    <div ref={mapRef} style={{ height: 260, width: '100%', borderRadius: 8 }} />
                                </Card>
                            </Space>
                        </Col>
                    </Row>
                </div>
            </div>
        </div>
    );
}
