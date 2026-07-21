import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User as UserIcon, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from './BrandLogo';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-brand-primary border-b border-blue-600 shadow-md shadow-blue-500/20 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <BrandLogo title="Smart Parking System" size="md" textClassName="text-white" />
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated && user ? (
              <>
                <Link to="/" className="text-sm font-medium text-white/90 hover:text-white transition-colors">Trang chủ</Link>
                <Link to="/find-slot" className="text-sm font-medium text-white/90 hover:text-white transition-colors">Đặt chỗ đỗ xe</Link>
                <Link to="/pricing" className="text-sm font-medium text-white/90 hover:text-white transition-colors">Bảng giá</Link>
              </>
            ) : (
              <>
                <Link to="/" className="text-sm font-medium text-white/90 hover:text-white transition-colors">Trang chủ</Link>
                <Link to="/find-slot" className="text-sm font-medium text-white/90 hover:text-white transition-colors">Tra cứu chỗ đậu</Link>
                <Link to="/pricing" className="text-sm font-medium text-white/90 hover:text-white transition-colors">Bảng giá</Link>
                <Link to="/guide" className="text-sm font-medium text-white/90 hover:text-white transition-colors">Hướng dẫn</Link>
                <Link to="/contact" className="text-sm font-medium text-white/90 hover:text-white transition-colors">Liên hệ</Link>
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 text-sm font-semibold text-white hover:bg-white/15 transition-colors bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/25 focus:outline-none"
                >
                  <div className="bg-white/20 text-white p-1 rounded-lg">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className="hidden sm:inline">{user.full_name}</span>
                  <svg className={`w-4 h-4 ml-1 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2.5 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl shadow-slate-900/10 overflow-hidden z-50">
                    <div className="h-1.5 gradient-brand" />
                    <div className="p-2.5 space-y-1.5">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1.5 text-left">
                      <p className="text-[10px] text-brand-muted font-bold uppercase tracking-wider">Tài khoản</p>
                      <p className="text-sm font-extrabold text-brand-navy truncate mt-0.5">{user.full_name}</p>
                      <span className="inline-block text-[9px] bg-brand-primary text-white font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1.5">
                        {user.role === 'Admin' ? 'Quản trị viên' : user.role === 'Manager' ? 'Quản lý' : user.role === 'Staff' ? 'Nhân viên' : 'Khách hàng'}
                      </span>
                    </div>

                    <Link 
                      to="/profile" 
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-sm text-ink-muted hover:bg-surface hover:text-ink transition-all font-semibold"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      Hồ sơ cá nhân
                    </Link>

                    {user.role === 'Admin' && (
                      <Link 
                        to="/admin" 
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-sm text-ink-muted hover:bg-surface hover:text-ink transition-all font-semibold"
                      >
                        <LayoutDashboard className="w-4 h-4 text-primary-500" />
                        Dashboard Admin
                      </Link>
                    )}

                    {user.role === 'Manager' && (
                      <Link 
                        to="/manager" 
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-sm text-ink-muted hover:bg-surface hover:text-ink transition-all font-semibold"
                      >
                        <LayoutDashboard className="w-4 h-4 text-primary-500" />
                        Dashboard Manager
                      </Link>
                    )}

                    {user.role === 'Staff' && (
                      <Link 
                        to="/staff" 
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-sm text-ink-muted hover:bg-surface hover:text-ink transition-all font-semibold"
                      >
                        <LayoutDashboard className="w-4 h-4 text-primary-500" />
                        Dashboard Nhân viên
                      </Link>
                    )}

                    <div className="border-t border-slate-100 pt-1.5 mt-1.5">
                      <button 
                        onClick={() => { setShowDropdown(false); handleLogout(); }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-sm text-rose-600 hover:bg-rose-50 transition-all font-semibold text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Đăng xuất
                      </button>
                    </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold text-white/90 hover:text-white">Đăng nhập</Link>
                <Link to="/register" className="text-sm font-bold bg-brand-navy hover:opacity-90 text-white px-4 py-2 rounded-xl transition-all shadow-md">Đăng ký</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
