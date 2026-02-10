'use client';

import {
    EyeInvisibleOutlined,
    EyeTwoTone,
    GoogleOutlined,
    LockOutlined,
    MailOutlined,
    PhoneOutlined,
    SafetyCertificateOutlined,
    SendOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Button, Divider, Form, Input, message, Modal, Typography } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { apiForgotPassword, apiLoginUser, apiRegisterUser, apiSendOtp, apiVerifyOtp } from '../../../../apis/user';
import './AuthPage.css';
import CustomNotification from './Notifi';

const { Title, Text } = Typography;

/* ================= Google Callback ================= */
const GoogleCallback = () => {
    const router = useRouter();
    const [processing, setProcessing] = useState(true);

    useEffect(() => {
        const handleGoogleCallback = async () => {
            try {
                const params = new URLSearchParams(window.location.search);
                const token = params.get('access_token');
                const error = params.get('error');

                if (error) {
                    message.error('Đăng nhập Google thất bại');
                    router.push('/login?mode=login');
                    return;
                }

                if (token) {
                    localStorage.setItem('token', token);
                    message.success('Đăng nhập Google thành công');
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 1200);
                } else {
                    message.error('Không nhận được token từ Google');
                    router.push('/login?mode=login');
                }
            } catch (err) {
                console.error(err);
                message.error('Có lỗi khi xử lý đăng nhập Google');
                router.push('/login?mode=login');
            } finally {
                setProcessing(false);
            }
        };

        handleGoogleCallback();
    }, [router]);

    if (!processing) return null;

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                </div>

                <div className="auth-processing">
                    <GoogleOutlined className="auth-processing__icon" />
                    <Title level={3} className="auth-processing__title">
                        Đang xử lý đăng nhập Google
                    </Title>
                    <Text type="secondary">Vui lòng đợi trong giây lát</Text>
                </div>
            </div>
        </div>
    );
};

const handleGoogleLogin = () => {
    localStorage.setItem('redirect_after_login', '/');
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://https://smartbook-backend.tranminhdang.cloud/';
    const apiUrl = `${
        process.env.NEXT_PUBLIC_API_URL || 'https://smartbook-backend.tranminhdang.cloud/'
    }api/login/google?frontend_url=${encodeURIComponent(frontendUrl)}`;
    window.location.href = apiUrl;
};

/* ================= Main Component ================= */
export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [showForgot, setShowForgot] = useState(false);
    const [showOtp, setShowOtp] = useState(false);

    const [otpEmail, setOtpEmail] = useState('');
    const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);

    const [loading, setLoading] = useState(false);
    const [forgotLoading, setForgotLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [sendOtpLoading, setSendOtpLoading] = useState(false);

    const [mounted, setMounted] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const [showNotif, setShowNotif] = useState(false);
    const [notifContent, setNotifContent] = useState({ message: '', description: '' });

    const [otpSent, setOtpSent] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();

    const otpInputRefs = useRef([]);
    const submittingRef = useRef(false);

    const isGoogleCallback = searchParams.get('access_token') || searchParams.get('error');

    useEffect(() => {
        const mode = searchParams.get('mode');
        if (mode === 'register') setIsLogin(false);
        else if (mode === 'login') setIsLogin(true);
    }, [searchParams]);

    useEffect(() => {
        let timer;
        if (countdown > 0) timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    useEffect(() => setMounted(true), []);

    if (isGoogleCallback) return <GoogleCallback />;

    /* ================= Submit ================= */
    const onFinish = async (values) => {
        if (submittingRef.current) return;
        submittingRef.current = true;

        setLoading(true);
        try {
            if (isLogin) {
                const data = await apiLoginUser(values.email, values.password);

                if (!data.email_verified) {
                    setOtpEmail(values.email);
                    setNotifContent({
                        message: 'Chưa xác thực email',
                        description: 'Vui lòng kiểm tra email và nhập mã OTP.',
                    });
                    setShowNotif(true);

                    const waitSec =
                        typeof data?.resend_after === 'number' && data.resend_after > 0 ? data.resend_after : 60;
                    setCountdown(waitSec);
                    setShowOtp(true);
                } else {
                    localStorage.setItem('token', data.access_token);
                    setNotifContent({
                        message: 'Đăng nhập thành công',
                        description: `Chào mừng trở lại, ${data.user?.name || 'người dùng'}.`,
                    });
                    setShowNotif(true);
                    setTimeout(() => (window.location.href = '/'), 1200);
                }
            } else {
                const registerResult = await apiRegisterUser(
                    values.name,
                    values.email,
                    values.password,
                    values.password_confirmation,
                    values.phone,
                );

                setOtpEmail(values.email);
                setNotifContent({
                    message: 'Đăng ký thành công',
                    description: 'Vui lòng kiểm tra email và nhập mã OTP để xác thực.',
                });
                setShowNotif(true);

                const waitSec =
                    typeof registerResult?.resend_after === 'number' && registerResult.resend_after > 0
                        ? registerResult.resend_after
                        : 60;

                setCountdown(waitSec);
                setShowOtp(true);
            }
        } catch (err) {
            const errorData = err?.response?.data;
            const errorMessage = errorData?.message || err.message || 'Có lỗi xảy ra';
            const errorDetails = errorData?.errors ? Object.values(errorData.errors).flat().join(', ') : '';
            setNotifContent({
                message: 'Không thể thực hiện',
                description: `${errorMessage}${errorDetails ? `: ${errorDetails}` : ''}`,
            });
            setShowNotif(true);
        } finally {
            setLoading(false);
            submittingRef.current = false;
        }
    };

    /* ================= Resend OTP ================= */
    const handleResendOtpClick = async () => {
        if (countdown > 0 || otpSent || sendOtpLoading) return;

        setSendOtpLoading(true);
        setOtpSent(true);
        try {
            await apiSendOtp(otpEmail);
            setNotifContent({
                message: 'Đã gửi lại OTP',
                description: 'Vui lòng kiểm tra email để lấy mã mới.',
            });
            setShowNotif(true);
            setCountdown(60);
        } catch (err) {
            setNotifContent({
                message: 'Không thể gửi lại OTP',
                description: err?.message || 'Vui lòng thử lại.',
            });
            setShowNotif(true);
            setOtpSent(false);
        } finally {
            setSendOtpLoading(false);
        }
    };

    /* ================= OTP Input ================= */
    const handleOtpChange = (index, value) => {
        if (!/^\d?$/.test(value)) return;
        const next = [...otpValues];
        next[index] = value.slice(0, 1);
        setOtpValues(next);
        if (value && index < 5) otpInputRefs.current[index + 1]?.focus();
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            if (otpValues[index]) {
                const next = [...otpValues];
                next[index] = '';
                setOtpValues(next);
            } else if (index > 0) otpInputRefs.current[index - 1]?.focus();
        }

        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
            navigator.clipboard.readText().then((text) => {
                const numbers = text.replace(/\D/g, '').slice(0, 6);
                if (numbers.length === 6) {
                    setOtpValues(numbers.split(''));
                    otpInputRefs.current[5]?.focus();
                }
            });
        }
    };

    /* ================= Verify OTP ================= */
    const handleVerifyOtp = async () => {
        const otpCode = otpValues.join('');
        if (otpCode.length !== 6) {
            setNotifContent({ message: 'Thiếu mã OTP', description: 'Vui lòng nhập đủ 6 số.' });
            setShowNotif(true);
            return;
        }

        setOtpLoading(true);
        try {
            const result = await apiVerifyOtp(otpEmail, otpCode);
            setNotifContent({
                message: 'Xác thực thành công',
                description: `${result.message}${result.user?.name ? ` - ${result.user.name}` : ''}`,
            });
            setShowNotif(true);

            setShowOtp(false);
            resetOtpModal();

            if (isLogin) window.location.href = '/login?mode=login';
            else {
                setIsLogin(true);
                router.push('/login?mode=login');
            }
        } catch (err) {
            setNotifContent({
                message: 'Xác thực thất bại',
                description: err?.message || 'OTP không đúng.',
            });
            setShowNotif(true);
        } finally {
            setOtpLoading(false);
        }
    };

    /* ================= Helpers ================= */
    const resetOtpModal = () => {
        setOtpValues(['', '', '', '', '', '']);
        setCountdown(0);
        setOtpSent(false);
    };

    const switchMode = () => {
        const newMode = isLogin ? 'register' : 'login';
        setIsLogin(!isLogin);
        router.push(`/login?mode=${newMode}`);
    };

    const apiForgotPasswordSubmit = async (values) => {
        setForgotLoading(true);
        try {
            await apiForgotPassword(values.email);
            setNotifContent({ message: 'Gửi thành công', description: 'Hãy kiểm tra email để đặt lại mật khẩu.' });
            setShowNotif(true);
            setShowForgot(false);
        } catch (err) {
            setNotifContent({ message: 'Gửi thất bại', description: 'Email không tồn tại hoặc có lỗi.' });
            setShowNotif(true);
        } finally {
            setForgotLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="floating-shapes" aria-hidden="true">
                <div className="shape"></div>
                <div className="shape"></div>
                <div className="shape"></div>
                <div className="shape"></div>
            </div>

            <div className={`auth-card ${mounted ? 'slide-in' : ''}`}>
                {(loading || forgotLoading) && (
                    <div className="loading-overlay">
                        <div className="loading-spinner"></div>
                    </div>
                )}

                <Title level={2} className="auth-title">
                    {isLogin ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}
                </Title>

                <div className="form-container">
                    <Form name="auth_form" onFinish={onFinish} layout="vertical" size="large" autoComplete="off">
                        {!isLogin && (
                            <>
                                <Form.Item name="name" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                                    <Input prefix={<UserOutlined />} placeholder="Họ và tên" autoComplete="name" />
                                </Form.Item>

                                <Form.Item
                                    name="phone"
                                    label="Số điện thoại"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập số điện thoại' },
                                        {
                                            pattern: /^(0[3|5|7|8|9])+([0-9]{8})$/,
                                            message: 'Số điện thoại không hợp lệ (10 số, bắt đầu 03/05/07/08/09)',
                                        },
                                    ]}
                                >
                                    <Input
                                        prefix={<PhoneOutlined />}
                                        placeholder="Nhập số điện thoại"
                                        autoComplete="tel"
                                    />
                                </Form.Item>
                            </>
                        )}

                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email' },
                                { type: 'email', message: 'Email không hợp lệ' },
                            ]}
                        >
                            <Input prefix={<MailOutlined />} placeholder="Email" autoComplete="email" />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu' },
                                { min: 6, message: 'Mật khẩu ít nhất 6 ký tự' },
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Mật khẩu"
                                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                autoComplete={isLogin ? 'current-password' : 'new-password'}
                            />
                        </Form.Item>

                        {!isLogin && (
                            <Form.Item
                                name="password_confirmation"
                                dependencies={['password']}
                                rules={[
                                    { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('password') === value) return Promise.resolve();
                                            return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password
                                    prefix={<SafetyCertificateOutlined />}
                                    placeholder="Xác nhận mật khẩu"
                                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                    autoComplete="new-password"
                                />
                            </Form.Item>
                        )}

                        {isLogin && (
                            <div className="auth-actionsRow">
                                <span className="forgot-link" onClick={() => setShowForgot(true)}>
                                    Quên mật khẩu
                                </span>
                            </div>
                        )}

                        <Form.Item className="auth-btnGroup">
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="submit-btn"
                                loading={loading}
                                disabled={loading}
                            >
                                {isLogin ? 'Đăng nhập' : 'Đăng ký'}
                            </Button>

                            <Button type="default" onClick={handleGoogleLogin} className="google-btn">
                                <GoogleOutlined />
                                Đăng nhập với Google
                            </Button>
                        </Form.Item>
                    </Form>

                    <Divider>
                        <Text type="secondary" className="auth-dividerText">
                            hoặc
                        </Text>
                    </Divider>

                    <div className="switch-mode">
                        {isLogin ? (
                            <Text>
                                Bạn chưa có tài khoản?{' '}
                                <span className="switch-link" onClick={switchMode}>
                                    Đăng ký ngay
                                </span>
                            </Text>
                        ) : (
                            <Text>
                                Đã có tài khoản?{' '}
                                <span className="switch-link" onClick={switchMode}>
                                    Đăng nhập
                                </span>
                            </Text>
                        )}
                    </div>
                </div>
            </div>

            {/* Forgot Password Modal */}
            <Modal
                title="Khôi phục mật khẩu"
                open={showForgot}
                onCancel={() => setShowForgot(false)}
                footer={null}
                centered
                className="modal-content"
            >
                <Form layout="vertical" onFinish={apiForgotPasswordSubmit} size="large" autoComplete="off">
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email' },
                            { type: 'email', message: 'Email không hợp lệ' },
                        ]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="Nhập email của bạn" autoComplete="email" />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" className="submit-btn" loading={forgotLoading}>
                        <SendOutlined />
                        Gửi yêu cầu đặt lại
                    </Button>
                </Form>
            </Modal>

            {/* OTP Modal */}
            <Modal
                title="Xác thực OTP"
                open={showOtp}
                onCancel={() => {
                    setShowOtp(false);
                    resetOtpModal();
                }}
                footer={null}
                centered
                className="modal-content"
                closable={false}
                maskClosable={false}
            >
                <div className="otp-desc">
                    <Text type="secondary">
                        Chúng tôi đã gửi mã OTP 6 số đến email:
                        <br />
                        <strong>{otpEmail}</strong>
                    </Text>
                </div>

                <div className="otp-container">
                    {otpValues.map((value, index) => (
                        <Input
                            key={index}
                            ref={(el) => (otpInputRefs.current[index] = el)}
                            value={value}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            onFocus={(e) => e.target.select()}
                            className="otp-input"
                            maxLength={1}
                            placeholder="0"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                        />
                    ))}
                </div>

                <div className="otp-actions">
                    <Button
                        type="primary"
                        onClick={handleVerifyOtp}
                        loading={otpLoading}
                        disabled={otpValues.join('').length !== 6}
                        className="otp-verifyBtn"
                    >
                        Xác thực OTP
                    </Button>

                    <Button
                        type="link"
                        onClick={handleResendOtpClick}
                        loading={sendOtpLoading}
                        disabled={countdown > 0 || otpSent}
                        className="otp-resendBtn"
                    >
                        {countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại mã OTP'}
                    </Button>
                </div>
            </Modal>

            {showNotif && (
                <CustomNotification
                    message={notifContent.message}
                    description={notifContent.description}
                    onClose={() => setShowNotif(false)}
                />
            )}
        </div>
    );
}
