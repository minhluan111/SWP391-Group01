import { Link, useNavigate } from 'react-router-dom';
import { Car, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email || !formData.password) {
      toast.error('Vui lòng điền đủ họ tên, email và mật khẩu');
      return;
    }
    if (formData.password !== formData.confirm_password) {
      toast.error('Mật khẩu nhập lại không khớp');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/register', formData);
      toast.success('Đăng ký thành công!');
      login(response.data.token, response.data.user);
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

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
            Tạo tài khoản để sử dụng hệ thống giữ xe thông minh
          </h1>
          <p className="text-lg text-slate-300 max-w-md mb-8">
            Đăng ký tài khoản để đặt chỗ, quản lý vé xe và theo dõi lịch sử gửi xe nhanh chóng.
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-12">
             <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
               <span className="text-sm font-medium text-slate-200">Đặt chỗ trước dễ dàng</span>
             </div>
             <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
               <span className="text-sm font-medium text-slate-200">Theo dõi vé thông minh</span>
             </div>
             <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
               <span className="text-sm font-medium text-slate-200">Thanh toán tiện lợi</span>
             </div>
             <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
               <span className="text-sm font-medium text-slate-200">Quản lý lịch sử gửi xe</span>
             </div>
          </div>

          <div className="relative h-48 bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center border border-slate-700">
            <Car className="w-24 h-24 text-slate-600" />
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
            <div className="text-3xl font-bold text-white mb-1">24/7</div>
            <div className="text-sm text-slate-400">Hoạt động</div>
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="max-w-md w-full py-8">
          {/* Mobile Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden justify-center">
            <div className="bg-primary-600 text-white p-2 rounded-lg">
              <Car className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-dark">Smart Parking</span>
          </Link>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-dark mb-2">Đăng ký tài khoản</h2>
            <p className="text-gray-500">Tạo tài khoản mới để sử dụng hệ thống</p>
          </div>

          <form className="space-y-5" onSubmit={handleRegister}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                <input name="full_name" value={formData.full_name} onChange={handleChange} type="text" placeholder="Nhập họ và tên..." className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input name="phone" value={formData.phone} onChange={handleChange} type="tel" placeholder="Nhập số điện thoại..." className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input name="email" value={formData.email} onChange={handleChange} type="email" placeholder="example@gmail.com" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                <div className="relative">
                  <input 
                    name="password" value={formData.password} onChange={handleChange}
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="********" 
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nhập lại mật khẩu</label>
                <div className="relative">
                  <input 
                    name="confirm_password" value={formData.confirm_password} onChange={handleChange}
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="********" 
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
            </div>
            
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span className="w-3 h-3 inline-block rounded-full border border-gray-400 text-center leading-3 text-[8px]">i</span>
              Mật khẩu phải có ít nhất 6 ký tự
            </p>

            <button disabled={loading} type="submit" className="w-full bg-primary-600 text-white font-medium py-3 rounded-lg hover:bg-primary-700 transition-colors mt-6 disabled:opacity-50">
              {loading ? 'Đang xử lý...' : 'Tạo tài khoản'}
            </button>
          </form>

          <div className="mt-8 mb-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Hoặc đăng ký bằng</span>
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
            Đã có tài khoản? <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">Đăng nhập ngay</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
