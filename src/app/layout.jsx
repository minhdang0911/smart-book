import './globals.css';
import ConditionalHeader from './components/ConditionalHeader';
import ConditionalFooter from './components/footer/ConditionalFooter';

import { ToastContainer, toast } from 'react-toastify';
import { CartProvider } from '../app/contexts/CartContext'

export const metadata = {
  title: 'SmartBook Web',
  description: 'Trang đọc sách SmartBook clone',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <CartProvider>
          <ToastContainer position="top-right" autoClose={3000} />
          <ConditionalHeader />
          <main className="main-content">{children}</main>
          <ConditionalFooter />
        </CartProvider>
      </body>
    </html>
  );
}