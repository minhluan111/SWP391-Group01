import { Link, useNavigate } from 'react-router-dom';
import { Car, User as UserIcon, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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
            {isAuthenticated && user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <div className="bg-primary-100 text-primary-700 p-1.5 rounded-full">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  {user.full_name}
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Đăng xuất
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-primary-600">Đăng nhập</Link>
                <Link to="/register" className="text-sm font-medium bg-dark text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">Đăng ký</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
