'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Modal, Typography, Divider, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, EyeInvisibleOutlined, EyeTwoTone, PhoneOutlined } from '@ant-design/icons';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiLoginUser, apiForgotPassword, apiRegisterUser, apiSendOtp, apiVerifyOtp } from '../../../../apis/user';
import './AuthPage.css';
import CustomNotification from './Notifi';

const { Title, Text } = Typography;

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
  const [otpSent, setOtpSent] = useState(false); // 🔒 Flag chống gửi OTP duplicate

  const router = useRouter();
  const searchParams = useSearchParams();
  const otpInputRefs = useRef([]);

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'register') setIsLogin(false);
    else if (mode === 'login') setIsLogin(true);
  }, [searchParams]);

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const onFinish = async (values) => {
    if (loading) return; // 🔒 Chặn double submit

    setLoading(true);
    try {
      if (isLogin) {
        const data = await apiLoginUser(values.email, values.password);

        if (!data.email_verified) {
          setOtpEmail(values.email);
          setNotifContent({
            message: '⚠️ Chưa xác thực email',
            description: 'Vui lòng kiểm tra email và nhập mã OTP!'
          });
          setShowNotif(true);

          console.log('📩 Gửi OTP đến:', values.email);
          await handleSendOtp(values.email);
          setShowOtp(true);
        } else {
          localStorage.setItem('token', data.access_token);
          setNotifContent({
            message: '🎉 Đăng nhập thành công!',
            description: `Chào mừng trở lại, ${data.user?.name || 'người dùng'}!`
          });
          setShowNotif(true);
          setTimeout(() => window.location.href = '/', 1500);
        }
      } else {
        // 🔥 REGISTER - Kiểm tra xem API có tự gửi OTP không
        const registerResult = await apiRegisterUser(
          values.name,
          values.email,
          values.password,
          values.password_confirmation,
          values.phone
        );

        setOtpEmail(values.email);
        setNotifContent({
          message: '🎉 Đăng ký thành công!',
          description: 'Vui lòng kiểm tra email và nhập mã OTP để xác thực.'
        });
        setShowNotif(true);

        // ✅ CHỈ GỬI OTP NÉU API REGISTER CHƯA TỰ GỬI
        if (!registerResult?.otp_sent && !registerResult?.otp_already_sent) {
          console.log('📩 Gửi OTP đến:', values.email);
          await handleSendOtp(values.email);
        } else {
          console.log('📩 OTP đã được gửi tự động từ API register');
          setCountdown(60); // Set countdown ngay cả khi không gọi handleSendOtp
        }

        setShowOtp(true);
      }
    } catch (err) {
      console.log('❌ Error caught:', err); // Debug log

      let errorMessage = '❌ Lỗi';
      let errorDescription = 'Có lỗi xảy ra, vui lòng thử lại!';

      // 🔥 XỬ LÝ LỖI VALIDATION TỪ API
      if (err.response && err.response.data) {
        const errorData = err.response.data;

        // Kiểm tra format lỗi validation: { status: false, errors: {...} }
        if (errorData.status === false && errorData.errors) {
          const errors = errorData.errors;
          const errorMessages = [];

          // Lấy tất cả lỗi từ object errors
          Object.keys(errors).forEach(field => {
            if (Array.isArray(errors[field])) {
              errorMessages.push(...errors[field]);
            } else {
              errorMessages.push(errors[field]);
            }
          });

          errorMessage = '❌ Lỗi xác thực';
          errorDescription = errorMessages.join('\n');
        }
        // Kiểm tra các format lỗi khác
        else if (errorData.message) {
          errorDescription = errorData.message;
        }
      }
      // Fallback cho lỗi network hoặc không có response
      else if (err.message) {
        errorDescription = err.message;
      }

      setNotifContent({
        message: errorMessage,
        description: errorDescription
      });
      setShowNotif(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (email) => {
    // 🔒 Chặn gửi duplicate trong thời gian ngắn
    if (otpSent || sendOtpLoading) {
      console.log('🚫 OTP đã được gửi, bỏ qua request duplicate');
      return;
    }

    setSendOtpLoading(true);
    setOtpSent(true);

    try {
      await apiSendOtp(email);
      setNotifContent({
        message: '📤 OTP đã gửi',
        description: 'Vui lòng kiểm tra email để lấy mã OTP.'
      });
      setShowNotif(true);
      setCountdown(60);
    } catch (err) {
      setNotifContent({
        message: '❌ Không thể gửi OTP',
        description: err.message || 'Vui lòng thử lại!'
      });
      setShowNotif(true);
    } finally {
      setSendOtpLoading(false);
      // Reset flag sau 3 giây để cho phép gửi lại
      setTimeout(() => setOtpSent(false), 3000);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value.slice(0, 1);
    setOtpValues(newOtpValues);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  useEffect(() => {
    if (showOtp) {
      setTimeout(() => otpInputRefs.current[0]?.focus(), 300);
    }
  }, [showOtp]);

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (otpValues[index]) {
        const newOtp = [...otpValues];
        newOtp[index] = '';
        setOtpValues(newOtp);
      } else if (index > 0) {
        otpInputRefs.current[index - 1]?.focus();
      }
    }

    // Dán OTP (Ctrl + V)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
      navigator.clipboard.readText().then((text) => {
        const numbers = text.replace(/\D/g, '').slice(0, 6);
        if (numbers.length === 6) {
          const newOtp = numbers.split('');
          setOtpValues(newOtp);
          otpInputRefs.current[5]?.focus();
        }
      });
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otpValues.join('');
    if (otpCode.length !== 6) {
      setNotifContent({
        message: '⚠️ Thiếu mã',
        description: 'Vui lòng nhập đủ 6 số.'
      });
      setShowNotif(true);
      return;
    }

    setOtpLoading(true);
    try {
      const result = await apiVerifyOtp(otpEmail, otpCode);
      setNotifContent({
        message: '✅ Xác thực thành công!',
        description: `${result.message}\nChào mừng ${result.user.name}!`
      });
      setShowNotif(true);
      setShowOtp(false);
      resetOtpModal();

      if (isLogin) {
        window.location.href = '/login';
      } else {
        setIsLogin(true);
        router.push('/login?mode=login');
      }
    } catch (err) {
      setNotifContent({
        message: '❌ Xác thực thất bại!',
        description: err.message || 'OTP không đúng!'
      });
      setShowNotif(true);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = () => {
    if (countdown > 0 || otpSent) return;
    handleSendOtp(otpEmail);
  };

  const resetOtpModal = () => {
    setOtpValues(['', '', '', '', '', '']);
    setCountdown(0);
    setOtpSent(false); // Reset flag khi đóng modal
  };

  const handleForgotPassword = async (values) => {
    setForgotLoading(true);
    try {
      await apiForgotPassword(values.email);
      setNotifContent({
        message: '📧 Gửi thành công',
        description: 'Hãy kiểm tra email để đặt lại mật khẩu.'
      });
      setShowNotif(true);
      setShowForgot(false);
    } catch (err) {
      setNotifContent({
        message: '❌ Gửi thất bại',
        description: err.message || 'Có lỗi xảy ra, vui lòng thử lại!'
      });
      setShowNotif(true);
    } finally {
      setForgotLoading(false);
    }
  };

  const switchMode = () => {
    const newMode = isLogin ? 'register' : 'login';
    setIsLogin(!isLogin);
    router.push(`/login?mode=${newMode}`);
  };

  useEffect(() => setMounted(true), []);

  return (
    <div className="auth-container">
      <div className="floating-shapes">
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
          {isLogin ? '🌟 Chào mừng trở lại' : '🚀 Tạo tài khoản mới'}
        </Title>

        <div className="form-container fade-in">
          <Form name="auth_form" onFinish={onFinish} layout="vertical" size="large" autoComplete="off">
            {!isLogin && (
              <>
                <Form.Item name="name" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
                  <Input prefix={<UserOutlined />} placeholder="Họ và tên" autoComplete="name" />
                </Form.Item>
                <Form.Item
                  name="phone"
                  label="Số điện thoại"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số điện thoại' },
                    {
                      pattern: /^(0[3|5|7|8|9])+([0-9]{8})$/,
                      message: 'Số điện thoại không hợp lệ (phải gồm 10 chữ số và bắt đầu bằng 03, 05, 07, 08 hoặc 09)'
                    }
                  ]}
                >
                  <Input placeholder="Nhập số điện thoại" />
                </Form.Item>

              </>
            )}

            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Email" autoComplete="email" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
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
                  { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) return Promise.resolve();
                      return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Xác nhận mật khẩu"
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  autoComplete="new-password"
                />
              </Form.Item>
            )}

            {isLogin && (
              <div style={{ textAlign: 'right', marginBottom: 16 }}>
                <span className="forgot-link" onClick={() => setShowForgot(true)}>
                  Quên mật khẩu?
                </span>
              </div>
            )}

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="submit-btn"
                loading={loading}
                disabled={loading}
              >
                {isLogin ? '🔑 Đăng nhập' : '📝 Đăng ký'}
              </Button>
            </Form.Item>
          </Form>

          <Divider>
            <Text type="secondary" style={{ fontSize: '14px' }}>
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
        title="🔐 Khôi phục mật khẩu"
        open={showForgot}
        onCancel={() => setShowForgot(false)}
        footer={null}
        centered
        className="modal-content"
      >
        <Form layout="vertical" onFinish={handleForgotPassword} size="large">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Nhập email của bạn" autoComplete="email" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="submit-btn" loading={forgotLoading}>
              📧 Gửi yêu cầu đặt lại
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* OTP Verification Modal */}
      <Modal
        title="🔐 Xác thực OTP"
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
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Text type="secondary">
            Chúng tôi đã gửi mã OTP 6 số đến email:<br />
            <strong>{otpEmail}</strong>
          </Text>
        </div>

        <div className="otp-container" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: 24 }}>
          {otpValues.map((value, index) => (
            <Input
              key={index}
              ref={el => otpInputRefs.current[index] = el}
              value={value}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              onFocus={(e) => e.target.select()}
              style={{
                width: '45px',
                height: '45px',
                textAlign: 'center',
                fontSize: '18px',
                fontWeight: 'bold',
                borderRadius: '8px'
              }}
              maxLength={1}
              placeholder="0"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
            />
          ))}
        </div>

        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <Button
            type="primary"
            onClick={handleVerifyOtp}
            loading={otpLoading}
            style={{ width: '100%', marginBottom: 12 }}
            disabled={otpValues.join('').length !== 6}
          >
            ✅ Xác thực OTP
          </Button>

          <Button
            type="link"
            onClick={handleResendOtp}
            loading={sendOtpLoading}
            disabled={countdown > 0 || otpSent}
            style={{ padding: 0 }}
          >
            {countdown > 0 ? `📤 Gửi lại sau ${countdown}s` : '📤 Gửi lại mã OTP'}
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