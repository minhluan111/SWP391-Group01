import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { loginSchema, type LoginFormData } from '../schemas/auth';
import FormFieldError from '../components/ui/FormFieldError';
import { authInputClassLg } from '../lib/formStyles';
import BrandLogo from '../components/layout/BrandLogo';

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
    setValue('email', roleEmail, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    setValue('password', '123456', { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    setRememberMe(true);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — navy #003366 (CSS brand class, luôn hiện) */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-navy flex-col justify-between p-12 text-white">
        <div>
          <div className="mb-16">
            <BrandLogo title="Smart Parking System" size="lg" textClassName="text-white" />
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6 text-white">
            Hệ thống quản lý bãi đậu xe thông minh
          </h1>
          <p className="text-lg text-white/80 max-w-md">
            Quản lý phương tiện hiện đại, check-in nhanh chóng và thanh toán tiện lợi trong một nền tảng duy nhất.
          </p>
          
          <div className="mt-12">
             <div className="relative h-64 rounded-xl overflow-hidden border border-white/20 shadow-lg shadow-black/20">
               <img
                 src="/images/auth-parking.png"
                 alt="Bãi đỗ xe thông minh"
                 className="absolute inset-0 w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-[#003366]/75 via-[#003366]/20 to-transparent" />
               <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                 <span className="bg-brand-primary text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-sm">Quản lý thời gian thực</span>
                 <span className="bg-white/15 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full border border-white/30">Vé QR thông minh</span>
               </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8 pt-12 border-t border-white/20">
          <div>
            <div className="text-3xl font-bold text-white mb-1">500+</div>
            <div className="text-sm text-white/70">Chỗ đậu</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-1">1,200+</div>
            <div className="text-sm text-white/70">Lượt xe/ngày</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-1">99%</div>
            <div className="text-sm text-white/70">Độ chính xác</div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="max-w-md w-full">
          <div className="mb-8 lg:hidden flex justify-center">
            <BrandLogo title="Smart Parking System" size="lg" textClassName="text-brand-navy" />
          </div>

          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-brand-navy mb-2">Đăng nhập</h2>
            <p className="text-brand-muted">Chào mừng quay trở lại hệ thống quản lý.</p>
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

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                />
                Ghi nhớ đăng nhập
              </label>
              <Link to="/forgot-password" className="text-brand-primary font-medium hover:underline">
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-primary hover:opacity-90 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/25 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-brand-primary font-semibold hover:underline">
              Đăng ký ngay
            </Link>
          </p>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 text-center">Tài khoản demo</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Customer', email: 'customer@gmail.com' },
                { label: 'Staff', email: 'staff@gmail.com' },
                { label: 'Manager', email: 'manager@gmail.com' },
                { label: 'Admin', email: 'admin@gmail.com' },
              ].map((demo) => (
                <button
                  key={demo.email}
                  type="button"
                  onClick={() => fillDemo(demo.email)}
                  className="text-left px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  <span className="block text-xs font-bold text-brand-navy">{demo.label}</span>
                  <span className="block text-[10px] text-gray-500 truncate">{demo.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
