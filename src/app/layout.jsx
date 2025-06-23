import './globals.css';
import ConditionalHeader from './components/ConditionalHeader';

export const metadata = {
  title: 'SmartBook Web',
  description: 'Trang đọc sách SmartBook clone',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <ConditionalHeader />
        <main className="main-content">{children}</main>
      </body>
    </html>
  );
}