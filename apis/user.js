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