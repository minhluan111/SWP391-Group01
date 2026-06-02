import { Link } from 'react-router-dom';
import { Car, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 bg-dark flex-col justify-between p-12 text-white">
        <div>
          <Link to="/" className="flex items-center gap-2 mb-16">
            <div className="bg-primary-600 text-white p-2 rounded-lg">
              <Car className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold">Smart Parking System</span>
          </Link>
          
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
            Hệ thống quản lý bãi đậu xe thông minh
          </h1>
          <p className="text-lg text-slate-300 max-w-md">
            Quản lý phương tiện hiện đại, check-in nhanh chóng và thanh toán tiện lợi trong một nền tảng duy nhất.
          </p>
          
          <div className="mt-12">
             <div className="relative h-64 bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center border border-slate-700">
               {/* Placeholder for left panel image */}
               <Car className="w-32 h-32 text-slate-600" />
               <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                 <span className="bg-slate-900/80 backdrop-blur-sm text-xs px-3 py-1.5 rounded-full border border-slate-700">Quản lý thời gian thực</span>
                 <span className="bg-slate-900/80 backdrop-blur-sm text-xs px-3 py-1.5 rounded-full border border-slate-700">Vé QR thông minh</span>
               </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8 pt-12 border-t border-slate-800">
          <div>
            <div className="text-3xl font-bold text-white mb-1">500+</div>
            <div className="text-sm text-slate-400">Chỗ đậu</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-1">1,200+</div>
            <div className="text-sm text-slate-400">Lượt xe/ngày</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-1">99%</div>
            <div className="text-sm text-slate-400">Độ chính xác</div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="max-w-md w-full">
          {/* Mobile Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden justify-center">
            <div className="bg-primary-600 text-white p-2 rounded-lg">
              <Car className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-dark">Smart Parking</span>
          </Link>

          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-dark mb-2">Đăng nhập</h2>
            <p className="text-gray-500">Chào mừng quay trở lại hệ thống quản lý.</p>
          </div>

          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
              <input 
                type="tel" 
                placeholder="Nhập số điện thoại" 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Nhập mật khẩu" 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm text-gray-600">Ghi nhớ đăng nhập</span>
              </label>
              <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-700">Quên mật khẩu?</a>
            </div>

            <button type="submit" className="w-full bg-primary-600 text-white font-medium py-3 rounded-lg hover:bg-primary-700 transition-colors">
              Đăng nhập
            </button>
          </form>

          <div className="mt-8 mb-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Hoặc</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Google
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Facebook
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-gray-600">
            Chưa có tài khoản? <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700">Đăng ký ngay</Link>
          </p>

          <div className="mt-12">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Tài khoản demo</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border border-gray-200 rounded-lg text-xs">
                <div className="font-semibold text-gray-700">Người dùng</div>
                <div className="text-gray-500">user@gmail.com</div>
              </div>
              <div className="p-3 border border-gray-200 rounded-lg text-xs">
                <div className="font-semibold text-gray-700">Nhân viên</div>
                <div className="text-gray-500">staff@gmail.com</div>
              </div>
              <div className="p-3 border border-gray-200 rounded-lg text-xs">
                <div className="font-semibold text-gray-700">Quản lý</div>
                <div className="text-gray-500">manager@gmail.com</div>
              </div>
              <div className="p-3 border border-gray-200 rounded-lg text-xs">
                <div className="font-semibold text-gray-700">Quản trị viên</div>
                <div className="text-gray-500">admin@gmail.com</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
