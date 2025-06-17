export const metadata = {
  title: 'Trang Đăng Nhập',
};

export default function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
       
      <main>{children}</main>
    </div>
  );
}
