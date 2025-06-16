'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Form, Input, Button } from 'antd';
import { apiResetPassword } from '../../../apis/user';
import CustomNotify from '../components/CustomNotifi/CustomNotify';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const token = searchParams.get('token');
  const [notify, setNotify] = useState(null);
  const router = useRouter();

  const onFinish = async (values) => {
    try {
      await apiResetPassword({
        email,
        token,
        password: values.password,
        password_confirmation: values.password_confirmation,
      });
      setNotify({ type: 'success', message: 'Đặt lại mật khẩu thành công!' });
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setNotify({ type: 'error', message: err.message });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      {notify && <CustomNotify {...notify} />}
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Đặt lại mật khẩu</h2>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="password"
            label="Mật khẩu mới"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }]}
          >
            <Input.Password placeholder="Nhập mật khẩu mới" />
          </Form.Item>
          <Form.Item
            name="password_confirmation"
            label="Xác nhận mật khẩu"
            rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu!' }]}
          >
            <Input.Password placeholder="Xác nhận lại mật khẩu" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="bg-blue-500 w-full hover:bg-blue-600">
              Đặt lại mật khẩu
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
