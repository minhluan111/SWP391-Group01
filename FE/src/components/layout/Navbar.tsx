import { Link } from 'react-router-dom';
import { Car } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary-600 text-white p-2 rounded-lg">
                <Car className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-dark">Smart Parking</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">Trang chủ</Link>
            <Link to="/find-slot" className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">Tra cứu chỗ đậu</Link>
            <Link to="/pricing" className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">Bảng giá</Link>
            <Link to="/guide" className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">Hướng dẫn</Link>
            <Link to="/contact" className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">Liên hệ</Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-primary-600">Đăng nhập</Link>
            <Link to="/register" className="text-sm font-medium bg-dark text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">Đăng ký</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
