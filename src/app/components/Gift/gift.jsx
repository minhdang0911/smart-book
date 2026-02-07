'use client';

import { CheckCircleFilled, MailOutlined } from '@ant-design/icons';
import { Button, Input, Typography, message } from 'antd';
import { useMemo, useState } from 'react';
import './newsletter.css';

const { Title, Paragraph, Text } = Typography;

export default function NewsletterSignup() {
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const isValidEmail = useMemo(() => {
        if (!email) return false;
        // validate đủ dùng, không quá gắt
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email.trim());
    }, [email]);

    const handleSubmit = async () => {
        const value = email.trim();

        if (!value) {
            message.warning('Vui lòng nhập email');
            return;
        }
        if (!isValidEmail) {
            message.error('Email không hợp lệ');
            return;
        }

        try {
            setSubmitting(true);

            // TODO: gọi API subscribe nếu có
            // await apiSubscribeNewsletter(value);

            message.success({
                content: (
                    <span className="nl-toast">
                        <CheckCircleFilled className="nl-toast__icon" />
                        Đăng ký thành công. Bạn sẽ nhận ưu đãi 10%
                    </span>
                ),
                duration: 2.5,
            });

            setEmail('');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="nl-wrapper">
            <div className="nl-container">
                <div className="nl-content">
                    <Text className="nl-badge">BẢN TIN</Text>

                    <Title level={2} className="nl-title">
                        Đăng ký và nhận giảm giá 10%
                    </Title>

                    <Paragraph className="nl-desc">
                        Nhận thông báo sách mới, chương trình giảm giá và gợi ý đọc phù hợp mỗi tuần.
                    </Paragraph>

                    <div className="nl-form">
                        <Input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onPressEnter={handleSubmit}
                            placeholder="Email..."
                            size="large"
                            prefix={<MailOutlined />}
                            status={email.length > 0 && !isValidEmail ? 'error' : ''}
                            className="nl-input"
                            disabled={submitting}
                            allowClear
                        />

                        <Button
                            type="primary"
                            size="large"
                            onClick={handleSubmit}
                            loading={submitting}
                            disabled={!email.trim() || !isValidEmail}
                            className="nl-btn"
                        >
                            Đăng ký
                        </Button>
                    </div>

                    <Text className="nl-note">Bạn có thể hủy đăng ký bất cứ lúc nào.</Text>
                </div>

                <div className="nl-visual" aria-hidden="true">
                    <div className="nl-visual__inner">
                        <div className="nl-person" />
                        <div className="nl-k1" />
                        <div className="nl-k2" />
                        <div className="nl-k3" />
                    </div>
                </div>
            </div>
        </div>
    );
}
