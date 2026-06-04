import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, KeyRound, ArrowLeft, ShieldAlert } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: request code, 2: reset password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [receivedOtp, setReceivedOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Vui lòng nhập email');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email });
      toast.success(response.data.message);
      
      // Auto-populate or show the OTP code in a test card for offline convenience
      if (response.data.code) {
        setReceivedOtp(response.data.code);
        setCode(response.data.code); // auto fill for ease of testing
      }
      
      setStep(2);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gửi yêu cầu thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !code || !newPassword) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu nhập lại không khớp');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/reset-password', {
        email,
        code,
        new_password: newPassword
      });
      toast.success(response.data.message);
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Đặt lại mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950">
      <div className="max-w-md w-full glass-morphism border border-slate-700/50 p-8 rounded-2xl shadow-2xl relative overflow-hidden text-white">
        
        {/* Background glowing blobs */}
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
          <form className="space-y-6" onSubmit={handleRequestCode}>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Địa chỉ Email</label>
              <input 
                type="email" 
                placeholder="email@gmail.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <button 
              disabled={loading} 
              type="submit" 
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary-500/25 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : 'Gửi mã xác nhận'}
            </button>
          </form>
        ) : (
          <form className="space-y-5" onSubmit={handleResetPassword}>
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
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white font-mono text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Mật khẩu mới</label>
              <input 
                type="password" 
                placeholder="********" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Nhập lại mật khẩu</label>
              <input 
                type="password" 
                placeholder="********" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                required
              />
            </div>

            <button 
              disabled={loading} 
              type="submit" 
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary-500/25 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Đang cập nhật...' : 'Xác nhận đặt lại mật khẩu'}
            </button>
            
            <button 
              type="button" 
              onClick={() => setStep(1)} 
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
