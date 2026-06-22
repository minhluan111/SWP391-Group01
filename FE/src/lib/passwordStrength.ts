export interface PasswordStrengthResult {
  score: number;
  label: string;
  barColor: string;
  textColor: string;
}

export function getPasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return { score: 0, label: '', barColor: 'bg-gray-200', textColor: 'text-gray-400' };
  }

  let points = 0;
  if (password.length >= 6) points += 1;
  if (password.length >= 10) points += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) points += 1;
  if (/\d/.test(password)) points += 1;
  if (/[^A-Za-z0-9]/.test(password)) points += 1;

  const score = Math.min(4, points);

  const levels: PasswordStrengthResult[] = [
    { score: 1, label: 'Rất yếu', barColor: 'bg-red-500', textColor: 'text-red-500' },
    { score: 2, label: 'Yếu', barColor: 'bg-orange-500', textColor: 'text-orange-500' },
    { score: 3, label: 'Trung bình', barColor: 'bg-yellow-500', textColor: 'text-yellow-600' },
    { score: 4, label: 'Mạnh', barColor: 'bg-emerald-500', textColor: 'text-emerald-600' },
  ];

  if (score === 0) {
    return { score: 1, label: 'Rất yếu', barColor: 'bg-red-500', textColor: 'text-red-500' };
  }

  return levels[score - 1];
}
