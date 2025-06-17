'use client';

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Modal, Card, Typography, Space, Divider, Progress, Tooltip, List } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, EyeInvisibleOutlined, EyeTwoTone, KeyOutlined, CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { apiLoginUser, apiForgotPassword, apiRegisterUser } from '../../../../apis/user';

const { Title, Text } = Typography;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgot, setShowForgot] = useState(false);
  const [notify, setNotify] = useState(null);
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, suggestions: [] });
  const [showPasswordGenerator, setShowPasswordGenerator] = useState(false);
  const [generatedPasswords, setGeneratedPasswords] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hàm kiểm tra độ mạnh mật khẩu
  const checkPasswordStrength = (password) => {
    if (!password) return { score: 0, suggestions: [] };

    let score = 0;
    const suggestions = [];
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      noCommon: !['password', '123456', 'qwerty', 'admin'].includes(password.toLowerCase())
    };

    // Tính điểm
    if (checks.length) score += 20;
    else suggestions.push('Ít nhất 8 ký tự');

    if (checks.lowercase) score += 15;
    else suggestions.push('Ít nhất 1 chữ thường');

    if (checks.uppercase) score += 15;
    else suggestions.push('Ít nhất 1 chữ hoa');

    if (checks.number) score += 15;
    else suggestions.push('Ít nhất 1 số');

    if (checks.special) score += 20;
    else suggestions.push('Ít nhất 1 ký tự đặc biệt (!@#$%^&*)');

    if (checks.noCommon) score += 15;
    else suggestions.push('Tránh mật khẩu phổ biến');

    return { score, suggestions };
  };

  // Hàm tạo mật khẩu ngẫu nhiên
  const generatePassword = (length = 12, includeSpecial = true) => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let chars = lowercase + uppercase + numbers;
    if (includeSpecial) chars += special;
    
    let password = '';
    
    // Đảm bảo có ít nhất 1 ký tự từ mỗi loại
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    if (includeSpecial) {
      password += special[Math.floor(Math.random() * special.length)];
    }
    
    // Tạo phần còn lại
    for (let i = password.length; i < length; i++) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }
    
    // Trộn ngẫu nhiên
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  // Tạo danh sách mật khẩu gợi ý
  const generatePasswordSuggestions = () => {
    const passwords = [
      generatePassword(12, true),
      generatePassword(14, true),
      generatePassword(16, true),
      generatePassword(10, false),
    ];
    setGeneratedPasswords(passwords);
  };

  // Xử lý thay đổi mật khẩu
  const handlePasswordChange = (e) => {
    const password = e.target.value;
    const strength = checkPasswordStrength(password);
    setPasswordStrength(strength);
  };

  // Áp dụng mật khẩu được chọn
  const applyPassword = (password) => {
    form.setFieldsValue({ password, password_confirmation: '' });
    setPasswordStrength(checkPasswordStrength(password));
    setShowPasswordGenerator(false);
  };

  // Lấy màu và text cho thanh tiến trình
  const getPasswordStrengthColor = (score) => {
    if (score < 30) return '#ff4d4f';
    if (score < 60) return '#faad14';
    if (score < 80) return '#1890ff';
    return '#52c41a';
  };

  const getPasswordStrengthText = (score) => {
    if (score < 30) return 'Yếu';
    if (score < 60) return 'Trung bình';
    if (score < 80) return 'Mạnh';
    return 'Rất mạnh';
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      if (isLogin) {
        const data = await apiLoginUser(values.email, values.password);
        localStorage.setItem('token', data.access_token);
        setNotify({ type: 'success', message: 'Đăng nhập thành công!' });
        
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        await apiRegisterUser(values.name, values.email, values.password, values.password_confirmation);
        setNotify({ type: 'success', message: 'Đăng ký thành công, hãy đăng nhập!' });
        setIsLogin(true);
      }
    } catch (error) {
      setNotify({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (values) => {
    setForgotLoading(true);
    try {
      const res = await apiForgotPassword(values.email);
      setNotify({ type: 'success', message: 'Hãy kiểm tra email để đặt lại mật khẩu!' });
      setShowForgot(false);
    } catch (err) {
      setNotify({ type: 'error', message: err.message });
    } finally {
      setForgotLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setPasswordStrength({ score: 0, suggestions: [] });
    form.resetFields();
  };

  useEffect(() => {
    if (notify) {
      const timer = setTimeout(() => {
        setNotify(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notify]);

  return (
    <>
      <style jsx>{`
        .auth-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
          overflow: hidden;
          width: 100%;
        }

        .auth-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
                      radial-gradient(circle at 40% 80%, rgba(120, 219, 255, 0.3) 0%, transparent 50%);
          animation: backgroundFloat 20s ease-in-out infinite;
          width: 100%;
        }

        @keyframes backgroundFloat {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.1) rotate(180deg); }
        }

        .floating-shapes {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
        }

        .shape {
          position: absolute;
          opacity: 0.1;
          animation: float 6s ease-in-out infinite;
        }

        .shape:nth-child(1) {
          top: 10%;
          left: 10%;
          width: 80px;
          height: 80px;
          background: white;
          border-radius: 50%;
          animation-delay: 0s;
        }

        .shape:nth-child(2) {
          top: 20%;
          right: 10%;
          width: 60px;
          height: 60px;
          background: white;
          border-radius: 30%;
          animation-delay: 2s;
        }

        .shape:nth-child(3) {
          bottom: 10%;
          left: 20%;
          width: 40px;
          height: 40px;
          background: white;
          border-radius: 50%;
          animation-delay: 4s;
        }

        .shape:nth-child(4) {
          bottom: 30%;
          right: 20%;
          width: 100px;
          height: 100px;
          background: white;
          border-radius: 20%;
          animation-delay: 1s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        .auth-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          width: 100%;
          max-width: 450px;
          padding: 40px;
          position: relative;
          z-index: 1;
          animation: ${mounted ? 'slideInUp' : 'none'} 0.8s ease-out;
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .auth-title {
          text-align: center;
          margin-bottom: 32px;
          color: #1a1a1a;
          position: relative;
        }

        .auth-title::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 3px;
          background: linear-gradient(90deg, #667eea, #764ba2);
          border-radius: 2px;
        }

        .form-container {
          animation: ${mounted ? 'fadeIn' : 'none'} 1s ease-out 0.3s both;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .ant-form-item {
          margin-bottom: 20px;
        }

        .ant-input-affix-wrapper, .ant-input {
          border-radius: 12px;
          border: 2px solid #f0f0f0;
          padding: 12px 16px;
          font-size: 16px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .ant-input-affix-wrapper:hover, .ant-input:hover {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .ant-input-affix-wrapper:focus, .ant-input:focus,
        .ant-input-affix-wrapper-focused, .ant-input-focused {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
        }

        .submit-btn {
          width: 100%;
          height: 50px;
          border-radius: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          font-size: 16px;
          font-weight: 600;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .submit-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s;
        }

        .submit-btn:hover::before {
          left: 100%;
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
        }

        .submit-btn:active {
          transform: translateY(0);
        }

        .switch-mode {
          text-align: center;
          margin-top: 24px;
          color: #666;
        }

        .switch-link {
          color: #667eea;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .switch-link:hover {
          color: #764ba2;
          text-decoration: underline;
        }

        .forgot-link {
          color: #667eea;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .forgot-link:hover {
          color: #764ba2;
          text-decoration: underline;
        }

        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 16px 24px;
          border-radius: 12px;
          color: white;
          font-weight: 500;
          z-index: 1000;
          animation: slideInRight 0.5s ease-out;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

        .notification.success {
          background: linear-gradient(135deg, #48bb78, #38a169);
        }

        .notification.error {
          background: linear-gradient(135deg, #f56565, #e53e3e);
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .modal-content {
          border-radius: 16px;
        }

        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 24px;
          z-index: 10;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .form-transition {
          animation: slideInLeft 0.5s ease-out;
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .password-strength-container {
          margin-top: 8px;
          padding: 12px;
          background: rgba(102, 126, 234, 0.05);
          border-radius: 8px;
          border: 1px solid rgba(102, 126, 234, 0.1);
        }

        .password-generator-btn {
          background: linear-gradient(135deg, #52c41a, #389e0d);
          border: none;
          border-radius: 8px;
          color: white;
          padding: 8px 16px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .password-generator-btn:hover {
          background: linear-gradient(135deg, #389e0d, #237804);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(82, 196, 26, 0.3);
        }

        .generated-password-item {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .generated-password-item:hover {
          background: #e3f2fd;
          border-color: #667eea;
          transform: translateX(4px);
        }

        .password-text {
          font-family: 'Courier New', monospace;
          font-weight: 600;
          color: #1a1a1a;
        }

        .password-strength-label {
          font-size: 12px;
          color: #666;
          margin-bottom: 4px;
        }

        .suggestions-list {
          margin-top: 8px;
        }

        .suggestion-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #666;
          margin-bottom: 4px;
        }

        .suggestion-item.met {
          color: #52c41a;
        }

        .suggestion-item.not-met {
          color: #ff4d4f;
        }
      `}</style>

      <div className="auth-container">
        <div className="floating-shapes">
          <div className="shape"></div>
          <div className="shape"></div>
          <div className="shape"></div>
          <div className="shape"></div>
        </div>

        {notify && (
          <div className={`notification ${notify.type}`}>
            {notify.message}
          </div>
        )}

        <div className="auth-card">
          {(loading || forgotLoading) && (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
            </div>
          )}

          <Title level={2} className="auth-title">
            {isLogin ? '🌟 Chào mừng trở lại' : '🚀 Tạo tài khoản mới'}
          </Title>

          <div className="form-container">
            <div className="form-transition">
              <Form 
                form={form}
                name="auth_form" 
                onFinish={onFinish} 
                layout="vertical"
                size="large"
                autoComplete="off"
              >
                {!isLogin && (
                  <Form.Item 
                    name="name" 
                    rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                  >
                    <Input 
                      prefix={<UserOutlined style={{ color: '#667eea' }} />}
                      placeholder="Họ và tên"
                      autoComplete="name"
                    />
                  </Form.Item>
                )}

                <Form.Item 
                  name="email" 
                  rules={[
                    { required: true, message: 'Vui lòng nhập email!' },
                    { type: 'email', message: 'Email không hợp lệ!' }
                  ]}
                >
                  <Input 
                    prefix={<MailOutlined style={{ color: '#667eea' }} />}
                    placeholder="Email"
                    autoComplete="email"
                  />
                </Form.Item>

                <Form.Item 
                  name="password" 
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu!' },
                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                    ...(isLogin ? [] : [
                      () => ({
                        validator(_, value) {
                          if (!value || passwordStrength.score >= 60) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('Mật khẩu chưa đủ mạnh!'));
                        },
                      })
                    ])
                  ]}
                >
                  <Input.Password 
                    prefix={<LockOutlined style={{ color: '#667eea' }} />}
                    placeholder="Mật khẩu"
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    onChange={handlePasswordChange}
                  />
                </Form.Item>

                {!isLogin && (
                  <>
                    {/* Hiển thị độ mạnh mật khẩu */}
                    <div className="password-strength-container">
                      <div className="password-strength-label">
                        Độ mạnh mật khẩu: <strong style={{ color: getPasswordStrengthColor(passwordStrength.score) }}>
                          {getPasswordStrengthText(passwordStrength.score)}
                        </strong>
                      </div>
                      <Progress 
                        percent={passwordStrength.score} 
                        strokeColor={getPasswordStrengthColor(passwordStrength.score)}
                        showInfo={false}
                        size="small"
                      />
                      
                      {/* Danh sách yêu cầu */}
                      <div className="suggestions-list">
                        {[
                          { text: 'Ít nhất 8 ký tự', met: form.getFieldValue('password')?.length >= 8 },
                          { text: 'Chữ thường (a-z)', met: /[a-z]/.test(form.getFieldValue('password') || '') },
                          { text: 'Chữ hoa (A-Z)', met: /[A-Z]/.test(form.getFieldValue('password') || '') },
                          { text: 'Số (0-9)', met: /\d/.test(form.getFieldValue('password') || '') },
                          { text: 'Ký tự đặc biệt (!@#$%^&*)', met: /[!@#$%^&*(),.?":{}|<>]/.test(form.getFieldValue('password') || '') }
                        ].map((req, index) => (
                          <div key={index} className={`suggestion-item ${req.met ? 'met' : 'not-met'}`}>
                            {req.met ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                            {req.text}
                          </div>
                        ))}
                      </div>

                      {/* Nút tạo mật khẩu */}
                      <button 
                        type="button"
                        className="password-generator-btn"
                        onClick={() => {
                          generatePasswordSuggestions();
                          setShowPasswordGenerator(true);
                        }}
                      >
                        <KeyOutlined /> Tạo mật khẩu mạnh
                      </button>
                    </div>

                    <Form.Item
                      name="password_confirmation"
                      dependencies={['password']}
                      rules={[
                        { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('password') === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                          },
                        }),
                      ]}
                    >
                      <Input.Password 
                        prefix={<LockOutlined style={{ color: '#667eea' }} />}
                        placeholder="Xác nhận mật khẩu"
                        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        autoComplete="new-password"
                      />
                    </Form.Item>
                  </>
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
                  >
                    {isLogin ? '🔑 Đăng nhập' : '📝 Đăng ký'}
                  </Button>
                </Form.Item>
              </Form>
            </div>

            <Divider style={{ margin: '24px 0', borderColor: '#e8e8e8' }}>
              <Text type="secondary" style={{ fontSize: '14px' }}>hoặc</Text>
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

        {/* Modal quên mật khẩu */}
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
                { type: 'email', message: 'Email không hợp lệ!' }
              ]}
            >
              <Input 
                prefix={<MailOutlined style={{ color: '#667eea' }} />}
                placeholder="Nhập email của bạn"
                autoComplete="email"
              />
            </Form.Item>
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                className="submit-btn"
                loading={forgotLoading}
              >
                📧 Gửi yêu cầu đặt lại
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal tạo mật khẩu */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <KeyOutlined style={{ color: '#667eea' }} />
              🔐 Chọn mật khẩu mạnh
            </div>
          }
          open={showPasswordGenerator}
          onCancel={() => setShowPasswordGenerator(false)}
          footer={[
            <Button 
              key="regenerate" 
              icon={<ReloadOutlined />} 
              onClick={generatePasswordSuggestions}
            >
              Tạo lại
            </Button>,
            <Button key="cancel" onClick={() => setShowPasswordGenerator(false)}>
              Đóng
            </Button>
          ]}
          width={600}
          centered
        >
          <div style={{ marginBottom: '16px' }}>
            <Text type="secondary">
              Chọn một trong các mật khẩu được tạo tự động bên dưới. Các mật khẩu này đều đảm bảo độ bảo mật cao.
            </Text>
          </div>

          <Space direction="vertical" style={{ width: '100%' }}>
            {generatedPasswords.map((password, index) => {
              const strength = checkPasswordStrength(password);
              return (
                <div
                  key={index}
                  className="generated-password-item"
                  onClick={() => applyPassword(password)}
                >
                  <div>
                    <div className="password-text">{password}</div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      Độ mạnh: <span style={{ color: getPasswordStrengthColor(strength.score), fontWeight: 'bold' }}>
                        {getPasswordStrengthText(strength.score)} ({strength.score}%)
                      </span>
                    </div>
                  </div>
                  <Button 
                    type="primary" 
                    size="small"
                    style={{ 
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      border: 'none'
                    }}
                  >
                    Chọn
                  </Button>
                </div>
              );
            })}
          </Space>

          <div style={{ marginTop: '16px', padding: '12px', background: '#f8f9fa', borderRadius: '8px' }}>
            <Text style={{ fontSize: '12px', color: '#666' }}>
              💡 <strong>Lưu ý:</strong> Hãy lưu mật khẩu ở nơi an toàn. Các mật khẩu này được tạo ngẫu nhiên và có độ bảo mật cao.
            </Text>
          </div>
        </Modal>
      </div>
    </>
  );
}