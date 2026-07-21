import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { registerSchema, type RegisterFormData } from '../schemas/auth';
import FormFieldError from '../components/ui/FormFieldError';
import PasswordStrengthBar from '../components/ui/PasswordStrengthBar';
import PasswordMatchIndicator from '../components/ui/PasswordMatchIndicator';
import { authInputClass } from '../lib/formStyles';
import BrandLogo from '../components/layout/BrandLogo';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: '',
      phone: '',
      email: '',
      password: '',
      confirm_password: '',
    },
  });

  const passwordValue = watch('password');
  const confirmPasswordValue = watch('confirm_password');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await api.post('/auth/register', data);
      toast.success('Đăng ký thành công!');
      login(response.data.token, response.data.user);
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Đăng ký thất bại');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — navy #003366 */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-navy flex-col justify-between p-12 text-white">
        <div>
          <div className="mb-16">
            <BrandLogo title="Smart Parking System" size="lg" textClassName="text-white" />
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6 text-white">
            Tạo tài khoản để sử dụng hệ thống giữ xe thông minh
          </h1>
          <p className="text-lg text-white/80 max-w-md mb-8">
            Đăng ký tài khoản để đặt chỗ, quản lý vé xe và theo dõi lịch sử gửi xe nhanh chóng.
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-12">
             <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg border border-white/20">
               <span className="text-sm font-medium text-white">Đặt chỗ trước dễ dàng</span>
             </div>
             <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg border border-white/20">
               <span className="text-sm font-medium text-white">Theo dõi vé thông minh</span>
             </div>
             <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg border border-white/20">
               <span className="text-sm font-medium text-white">Thanh toán tiện lợi</span>
             </div>
             <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg border border-white/20">
               <span className="text-sm font-medium text-white">Quản lý lịch sử gửi xe</span>
             </div>
          </div>

          <div className="relative h-48 rounded-xl overflow-hidden border border-white/20 shadow-lg shadow-black/20">
            <img
              src="/images/auth-parking.png"
              alt="Bãi đỗ xe thông minh"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#003366]/55 via-transparent to-transparent" />
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
            <div className="text-3xl font-bold text-white mb-1">24/7</div>
            <div className="text-sm text-white/70">Hoạt động</div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="max-w-md w-full py-8">
          <div className="mb-8 lg:hidden flex justify-center">
            <BrandLogo title="Smart Parking System" size="lg" textClassName="text-brand-navy" />
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-brand-navy mb-2">Đăng ký tài khoản</h2>
            <p className="text-brand-muted">Tạo tài khoản mới để sử dụng hệ thống</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                <input
                  type="text"
                  placeholder="Nhập họ và tên..."
                  className={authInputClass(!!errors.full_name)}
                  {...register('full_name')}
                />
                <FormFieldError message={errors.full_name?.message} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  placeholder="Nhập số điện thoại..."
                  className={authInputClass(!!errors.phone)}
                  {...register('phone')}
                />
                <FormFieldError message={errors.phone?.message} />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="example@gmail.com"
                className={authInputClass(!!errors.email)}
                {...register('email')}
              />
              <FormFieldError message={errors.email?.message} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu..."
                  className={authInputClass(!!errors.password)}
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
              <PasswordStrengthBar password={passwordValue} />
              <FormFieldError message={errors.password?.message} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nhập lại mật khẩu</label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Nhập lại mật khẩu..."
                className={authInputClass(!!errors.confirm_password)}
                {...register('confirm_password')}
              />
              <PasswordMatchIndicator password={passwordValue} confirmPassword={confirmPasswordValue} />
              <FormFieldError message={errors.confirm_password?.message} />
            </div>
            
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span className="w-3 h-3 inline-block rounded-full border border-gray-400 text-center leading-3 text-[8px]">i</span>
              Mật khẩu phải có ít nhất 6 ký tự
            </p>

            <button disabled={isSubmitting} type="submit" className="w-full bg-brand-primary text-white font-medium py-3 rounded-lg hover:opacity-90 transition-colors mt-6 disabled:opacity-50">
              {isSubmitting ? 'Đang xử lý...' : 'Tạo tài khoản'}
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
            <button type="button" className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Google
            </button>
            <button type="button" className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Facebook
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-gray-600">
            Đã có tài khoản? <Link to="/login" className="font-medium text-brand-primary hover:underline">Đăng nhập ngay</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
