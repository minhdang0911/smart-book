import axios from "axios";

export const apiLoginUser = async (email, password) => {
  try {
    const response = await axios.post('http://127.0.0.1:8000/api/login', {
      email,
      password,
    });

    console.log('Đăng nhập thành công:', response.data);
    return response.data;

  } catch (error) {
    if (error.response) {
      console.error('Lỗi đăng nhập:', error.response.data);
      throw new Error(error.response.data.message || 'Đăng nhập thất bại');
    } else {
      console.error('Lỗi kết nối:', error.message);
      throw new Error('Không thể kết nối đến server');
    }
  }
};


export const apiGetMe = async (token) => {

  try {
    const response = await axios.get('http://127.0.0.1:8000/api/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;

  } catch (error) {
    console.error('Lỗi lấy thông tin người dùng:', error.response?.data || error.message);
    throw new Error('Không thể lấy thông tin người dùng');
  }
};


 

export const apiRegisterUser = async (name, email, password, password_confirmation) => {
  const res = await axios.post('http://127.0.0.1:8000/api/register', {
    name,
    email,
    password,
    password_confirmation,
  });
  return res.data;
};


export const apiForgotPassword = async (email) => {
  try {
    const response = await axios.post('http://127.0.0.1:8000/api/forgot-password', {
      email,
    });

    console.log('Gửi yêu cầu khôi phục thành công:', response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Lỗi khôi phục mật khẩu:', error.response.data);
      throw new Error(error.response.data.message || 'Khôi phục mật khẩu thất bại');
    } else {
      console.error('Lỗi kết nối:', error.message);
      throw new Error('Không thể kết nối đến server');
    }
  }
};



export const apiResetPassword = async ({ email, token, password, password_confirmation }) => {
  try {
    const response = await axios.post('http://127.0.0.1:8000/api/reset-password', {
      email,
      token,
      password,
      password_confirmation,
    });

    console.log('Đặt lại mật khẩu thành công:', response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Lỗi đặt lại mật khẩu:', error.response.data);
      throw new Error(error.response.data.message || 'Đặt lại mật khẩu thất bại');
    } else {
      console.error('Lỗi kết nối:', error.message);
      throw new Error('Không thể kết nối đến server');
    }
  }
};
