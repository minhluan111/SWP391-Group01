import { getPasswordStrength } from '../../lib/passwordStrength';

interface PasswordStrengthBarProps {
  password: string;
}

export default function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {
  const { score, label, barColor, textColor } = getPasswordStrength(password);

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              level <= score ? barColor : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${textColor}`}>Độ mạnh: {label}</p>
    </div>
  );
}
