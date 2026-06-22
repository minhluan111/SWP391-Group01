import { Link, useNavigate } from 'react-router-dom';
import { Car, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { loginSchema, type LoginFormData } from '../schemas/auth';
import FormFieldError from '../components/ui/FormFieldError';
import { authInputClassLg } from '../lib/formStyles';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await api.post('/auth/login', data);
      toast.success('Đăng nhập thành công!');
      login(response.data.token, response.data.user, rememberMe);
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Đăng nhập thất bại');
    }
  };

  const fillDemo = (roleEmail: string) => {
    setValue('email', roleEmail, { shouldValidate: true });
    setValue('password', '123456', { shouldValidate: true });
    setRememberMe(true);
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
            Hệ thống quản lý bãi đậu xe thông minh
          </h1>
          <p className="text-lg text-slate-300 max-w-md">
            Quản lý phương tiện hiện đại, check-in nhanh chóng và thanh toán tiện lợi trong một nền tảng duy nhất.
          </p>
          
          <div className="mt-12">
             <div className="relative h-64 bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center border border-slate-700">
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

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                placeholder="Nhập email"
                className={authInputClassLg(!!errors.email)}
                {...register('email')}
              />
              <FormFieldError message={errors.email?.message} />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu"
                  className={authInputClassLg(!!errors.password)}
                  {...register('password')}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <FormFieldError message={errors.password?.message} />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-600">Ghi nhớ đăng nhập</span>
              </label>
              <Link to="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-700">Quên mật khẩu?</Link>
            </div>

            <button disabled={isSubmitting} type="submit" className="w-full bg-primary-600 text-white font-medium py-3 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50">
              {isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
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
            <button type="button" className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Google
            </button>
            <button type="button" className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Facebook
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-gray-600">
            Chưa có tài khoản? <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700">Đăng ký ngay</Link>
          </p>

          <div className="mt-8">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Tài khoản demo để kiểm thử</p>
            <div className="grid grid-cols-2 gap-2">
              <div onClick={() => fillDemo('customer@gmail.com')} className="p-2 border border-gray-200 rounded-lg text-xs cursor-pointer hover:bg-gray-50">
                <div className="font-semibold text-gray-700">Khách hàng</div>
                <div className="text-gray-500">customer@gmail.com</div>
              </div>
              <div onClick={() => fillDemo('staff@gmail.com')} className="p-2 border border-gray-200 rounded-lg text-xs cursor-pointer hover:bg-gray-50">
                <div className="font-semibold text-gray-700">Nhân viên (Staff)</div>
                <div className="text-gray-500">staff@gmail.com</div>
              </div>
              <div onClick={() => fillDemo('manager@gmail.com')} className="p-2 border border-gray-200 rounded-lg text-xs cursor-pointer hover:bg-gray-50">
                <div className="font-semibold text-gray-700">Quản lý (Manager)</div>
                <div className="text-gray-500">manager@gmail.com</div>
              </div>
              <div onClick={() => fillDemo('admin@gmail.com')} className="p-2 border border-gray-200 rounded-lg text-xs cursor-pointer hover:bg-gray-50">
                <div className="font-semibold text-gray-700">Admin</div>
                <div className="text-gray-500">admin@gmail.com</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
