import './globals.css';
import ConditionalHeader from './components/ConditionalHeader';
   import { ToastContainer, toast } from 'react-toastify';
export const metadata = {
  title: 'SmartBook Web',
  description: 'Trang đọc sách SmartBook clone',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
    
      <ToastContainer position="top-right" autoClose={3000} />
        <ConditionalHeader />
        <main className="main-content">{children}</main>
      </body>
    </html>
  );
}