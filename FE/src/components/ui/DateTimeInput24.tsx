import { combineDateAndTime, splitDatetimeLocal } from '../../lib/dateTimeFormat';

interface DateTimeInput24Props {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  className?: string;
}

const inputClass =
  'px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500';

export default function DateTimeInput24({ value, onChange, min, max, className = '' }: DateTimeInput24Props) {
  const { date, time } = splitDatetimeLocal(value);
  const minParts = min ? splitDatetimeLocal(min) : null;
  const maxParts = max ? splitDatetimeLocal(max) : null;

  return (
    <div className={`flex flex-col sm:flex-row gap-2 ${className}`}>
      <input
        type="date"
        value={date}
        min={minParts?.date}
        max={maxParts?.date}
        onChange={(e) => onChange(combineDateAndTime(e.target.value, time))}
        className={`${inputClass} flex-1`}
      />
      <input
        type="time"
        value={time}
        step={60}
        lang="vi-VN"
        onChange={(e) => onChange(combineDateAndTime(date, e.target.value))}
        className={`${inputClass} sm:w-36 [color-scheme:dark]`}
      />
    </div>
  );
}
