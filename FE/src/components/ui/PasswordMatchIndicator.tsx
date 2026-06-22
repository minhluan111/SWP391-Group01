interface PasswordMatchIndicatorProps {
  password: string;
  confirmPassword: string;
}

export default function PasswordMatchIndicator({ password, confirmPassword }: PasswordMatchIndicatorProps) {
  if (!confirmPassword) return null;

  const isMatch = password === confirmPassword;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        <div className={`h-1.5 flex-1 rounded-full transition-colors ${isMatch ? 'bg-emerald-500' : 'bg-red-400'}`} />
        <div className={`h-1.5 flex-1 rounded-full transition-colors ${isMatch ? 'bg-emerald-500' : 'bg-gray-200'}`} />
        <div className={`h-1.5 flex-1 rounded-full transition-colors ${isMatch ? 'bg-emerald-500' : 'bg-gray-200'}`} />
        <div className={`h-1.5 flex-1 rounded-full transition-colors ${isMatch ? 'bg-emerald-500' : 'bg-gray-200'}`} />
      </div>
      <p className={`text-xs font-medium ${isMatch ? 'text-emerald-600' : 'text-red-500'}`}>
        {isMatch ? 'Mật khẩu khớp' : 'Mật khẩu chưa khớp'}
      </p>
    </div>
  );
}
