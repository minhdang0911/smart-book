'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Modal } from 'antd';
import { apiLoginUser, apiRegisterUser, apiForgotPassword } from '../../../apis/user';
import { useRouter } from 'next/navigation';
import CustomNotify from '../components/CustomNotifi/CustomNotify';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgot, setShowForgot] = useState(false);
  const [notify, setNotify] = useState(null);
  const router = useRouter();

  const onFinish = async (values) => {
    try {
      if (isLogin) {
        const data = await apiLoginUser(values.email, values.password);
        localStorage.setItem('token', data.access_token);
        setNotify({ type: 'success', message: 'Đăng nhập thành công!' });
        router.push('/');
      } else {
        await apiRegisterUser(values.name, values.email, values.password, values.password_confirmation);
        setNotify({ type: 'success', message: 'Đăng ký thành công, hãy đăng nhập!' });
        setIsLogin(true);
      }
    } catch (error) {
      setNotify({ type: 'error', message: error.message });
    }
  };

  const handleForgotPassword = async (values) => {
    try {
      const res = await apiForgotPassword(values.email);
      setNotify({ type: 'success', message: 'Hãy kiểm tra email để đặt lại mật khẩu!' });
      setShowForgot(false);
    } catch (err) {
      setNotify({ type: 'error', message: err.message });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      {notify && <CustomNotify {...notify} />}
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isLogin ? 'Đăng nhập' : 'Đăng ký'}
        </h2>

        <Form name="auth_form" onFinish={onFinish} layout="vertical">
          {!isLogin && (
            <Form.Item name="name" label="Họ tên" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}> 
              <Input placeholder="Họ và tên" />
            </Form.Item>
          )}

          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Vui lòng nhập email!' }]}> 
            <Input placeholder="Email" />
          </Form.Item>

          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}> 
            <Input.Password placeholder="Mật khẩu" />
          </Form.Item>

          {!isLogin && (
            <Form.Item
              name="password_confirmation"
              label="Xác nhận mật khẩu"
              rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu!' }]}
            >
              <Input.Password placeholder="Xác nhận mật khẩu" />
            </Form.Item>
          )}

          {isLogin && (
            <p className="text-right text-sm mb-2">
              <span className="text-blue-500 cursor-pointer" onClick={() => setShowForgot(true)}>
                Quên mật khẩu?
              </span>
            </p>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full bg-blue-500 hover:bg-blue-600">
              {isLogin ? 'Đăng nhập' : 'Đăng ký'}
            </Button>
          </Form.Item>
        </Form>

        <p className="text-center text-sm">
          {isLogin ? (
            <>Bạn chưa có tài khoản?{' '}
              <span className="text-blue-500 cursor-pointer" onClick={() => setIsLogin(false)}>Đăng ký ngay</span>
            </>
          ) : (
            <>Đã có tài khoản?{' '}
              <span className="text-blue-500 cursor-pointer" onClick={() => setIsLogin(true)}>Đăng nhập</span>
            </>
          )}
        </p>
      </div>

      {/* Modal nhập email quên mật khẩu */}
      <Modal
        title="Quên mật khẩu"
        open={showForgot}
        onCancel={() => setShowForgot(false)}
        footer={null}
      >
        <Form layout="vertical" onFinish={handleForgotPassword}>
          <Form.Item
            name="email"
            label="Nhập email của bạn"
            rules={[{ required: true, message: 'Vui lòng nhập email!' }]}
          >
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="bg-blue-500 hover:bg-blue-600 w-full">
              Gửi yêu cầu đặt lại mật khẩu
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
