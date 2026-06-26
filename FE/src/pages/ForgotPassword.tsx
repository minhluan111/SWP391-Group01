import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  forgotPasswordRequestSchema,
  resetPasswordSchema,
  type ForgotPasswordRequestData,
  type ResetPasswordFormData,
} from '../schemas/auth';
import FormFieldError from '../components/ui/FormFieldError';
import PasswordInput from '../components/ui/PasswordInput';
import PasswordStrengthBar from '../components/ui/PasswordStrengthBar';
import PasswordMatchIndicator from '../components/ui/PasswordMatchIndicator';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [receivedOtp, setReceivedOtp] = useState('');

  const navigate = useNavigate();

  const requestForm = useForm<ForgotPasswordRequestData>({
    resolver: zodResolver(forgotPasswordRequestSchema),
    defaultValues: { email: '' },
  });

  const resetForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { code: '', new_password: '', confirm_password: '' },
  });

  const newPasswordValue = resetForm.watch('new_password');
  const confirmPasswordValue = resetForm.watch('confirm_password');

  const onRequestCode = async (data: ForgotPasswordRequestData) => {
    try {
      const response = await api.post('/auth/forgot-password', data);
      toast.success(response.data.message);
      setEmail(data.email);

      if (response.data.code) {
        setReceivedOtp(response.data.code);
        resetForm.setValue('code', response.data.code);
      }

      setStep(2);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gửi yêu cầu thất bại');
    }
  };

  const onResetPassword = async (data: ResetPasswordFormData) => {
    try {
      const response = await api.post('/auth/reset-password', {
        email,
        code: data.code,
        new_password: data.new_password,
      });
      toast.success(response.data.message);
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Đặt lại mật khẩu thất bại');
    }
  };

  const handleBackToStep1 = () => {
    setStep(1);
    resetForm.reset();
    setReceivedOtp('');
  };

  const darkInputClass = (hasError: boolean) =>
    `w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
      hasError ? 'border-red-400' : 'border-slate-700'
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950">
      <div className="max-w-md w-full glass-morphism border border-slate-700/50 p-8 rounded-2xl shadow-2xl relative overflow-hidden text-white">
        
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-primary-500/20 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2 mb-6 text-white">
            <div className="bg-primary-600 p-2.5 rounded-xl shadow-lg shadow-primary-500/30">
              <Car className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-wider">Smart Parking</span>
          </Link>
          <h2 className="text-2xl font-extrabold mb-2 text-center text-slate-100">Quên mật khẩu?</h2>
          <p className="text-sm text-slate-400 text-center">
            {step === 1 
              ? 'Nhập email của bạn để nhận mã khôi phục mật khẩu.' 
              : 'Nhập mã OTP đã nhận và thiết lập mật khẩu mới.'}
          </p>
        </div>

        {step === 1 ? (
          <form className="space-y-6" onSubmit={requestForm.handleSubmit(onRequestCode)} noValidate>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Địa chỉ Email</label>
              <input
                type="email"
                placeholder="email@gmail.com"
                className={darkInputClass(!!requestForm.formState.errors.email)}
                {...requestForm.register('email')}
              />
              <FormFieldError message={requestForm.formState.errors.email?.message} />
            </div>

            <button 
              disabled={requestForm.formState.isSubmitting} 
              type="submit" 
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary-500/25 active:scale-95 disabled:opacity-50"
            >
              {requestForm.formState.isSubmitting ? 'Đang xử lý...' : 'Gửi mã xác nhận'}
            </button>
          </form>
        ) : (
          <form className="space-y-5" onSubmit={resetForm.handleSubmit(onResetPassword)} noValidate>
            {receivedOtp && (
              <div className="bg-primary-950/40 border border-primary-800/60 p-4 rounded-xl flex gap-3 text-sm text-primary-300 mb-2">
                <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Mã OTP thử nghiệm:</p>
                  <p className="text-lg font-mono tracking-widest text-primary-200 mt-1 select-all">{receivedOtp}</p>
                  <p className="text-xs text-slate-400 mt-1">(Chúng tôi tự động hiển thị mã OTP tại đây để bạn tiện kiểm thử)</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Mã số OTP</label>
              <input
                type="text"
                placeholder="Nhập 6 số OTP"
                maxLength={6}
                className={`${darkInputClass(!!resetForm.formState.errors.code)} font-mono text-center text-lg tracking-widest`}
                {...resetForm.register('code')}
              />
              <FormFieldError message={resetForm.formState.errors.code?.message} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Mật khẩu mới</label>
              <PasswordInput
                variant="forgot"
                placeholder="Nhập mật khẩu mới..."
                hasError={!!resetForm.formState.errors.new_password}
                {...resetForm.register('new_password')}
              />
              <PasswordStrengthBar password={newPasswordValue} />
              <FormFieldError message={resetForm.formState.errors.new_password?.message} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Nhập lại mật khẩu</label>
              <PasswordInput
                variant="forgot"
                placeholder="Nhập lại mật khẩu..."
                hasError={!!resetForm.formState.errors.confirm_password}
                {...resetForm.register('confirm_password')}
              />
              <PasswordMatchIndicator password={newPasswordValue} confirmPassword={confirmPasswordValue} />
              <FormFieldError message={resetForm.formState.errors.confirm_password?.message} />
            </div>

            <button 
              disabled={resetForm.formState.isSubmitting} 
              type="submit" 
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary-500/25 active:scale-95 disabled:opacity-50"
            >
              {resetForm.formState.isSubmitting ? 'Đang cập nhật...' : 'Xác nhận đặt lại mật khẩu'}
            </button>
            
            <button 
              type="button" 
              onClick={handleBackToStep1} 
              className="w-full text-center text-sm text-slate-400 hover:text-slate-200 mt-2 block"
            >
              Gửi lại yêu cầu mã OTP
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-slate-800 flex justify-center text-sm text-slate-400">
          <Link to="/login" className="flex items-center gap-1.5 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Quay lại Đăng nhập
          </Link>
        </div>

      </div>
    </div>
  );
}
