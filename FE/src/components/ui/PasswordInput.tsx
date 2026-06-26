import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
  variant?: 'profile' | 'forgot';
}

export default function PasswordInput({
  hasError = false,
  variant = 'profile',
  className = '',
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const variantClass =
    variant === 'forgot'
      ? `w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-800/80 border text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
          hasError ? 'border-red-400' : 'border-slate-700'
        }`
      : `w-full px-3 py-2 pr-10 bg-slate-950 border rounded-lg text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500 ${
          hasError ? 'border-red-400' : 'border-slate-800'
        }`;

  return (
    <div className="relative">
      <input
        type={showPassword ? 'text' : 'password'}
        className={`${variantClass} ${className}`}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
        tabIndex={-1}
        aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
      >
        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}
