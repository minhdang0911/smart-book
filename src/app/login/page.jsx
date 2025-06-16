'use client';

import React, { useState } from 'react';
import { Form, Input, Button } from 'antd';
import { apiLoginUser } from '../../../apis/user';
import CustomNotify from '../components/CustomNotifi/CustomNotify';
import { useRouter } from 'next/navigation';


export default function LoginPage() {
  const [notify, setNotify] = useState(null);
   const router = useRouter();

  const onFinish = async (values) => {
    try {
      const data = await apiLoginUser(values.email, values.password);
      router.push('/')
      localStorage.setItem('token', data.access_token);
      setNotify({ type: 'success', message: 'Đăng nhập thành công!' });
    } catch (error) {
      setNotify({ type: 'error', message: error.message });
    }
  };

  return (
    <>
      {notify && <CustomNotify {...notify} />}
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-6">Đăng nhập</h2>

          <Form name="login_form" onFinish={onFinish} layout="vertical">
            <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Vui lòng nhập email!' }]}>
              <Input placeholder="Email" />
            </Form.Item>
            <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
              <Input.Password placeholder="Mật khẩu" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" className="w-full bg-blue-500 hover:bg-blue-600">
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </>
  );
}
