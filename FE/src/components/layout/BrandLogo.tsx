import { Link } from 'react-router-dom';

type BrandLogoProps = {
  to?: string;
  /** Tên hiển thị bên cạnh logo (để trống nếu chỉ muốn ảnh) */
  title?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Màu chữ: trắng trên nền xanh/navy, navy trên nền sáng */
  textClassName?: string;
  className?: string;
  asLink?: boolean;
  /** Ẩn chữ, chỉ hiện ảnh logo */
  markOnly?: boolean;
};

const SIZE = {
  sm: { img: 'h-9 w-auto', text: 'text-lg font-bold' },
  md: { img: 'h-11 w-auto', text: 'text-xl font-black tracking-wider' },
  lg: { img: 'h-14 w-auto', text: 'text-2xl font-bold' },
} as const;

/**
 * Logo thương hiệu thống nhất — ảnh car + PARKING
 */
export default function BrandLogo({
  to = '/',
  title = 'Smart Parking System',
  size = 'md',
  textClassName = 'text-white',
  className = '',
  asLink = true,
  markOnly = false,
}: BrandLogoProps) {
  const s = SIZE[size];

  const content = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <img
        src="/images/logo-parking.png"
        alt="Smart Parking"
        className={`${s.img} object-contain select-none`}
        draggable={false}
      />
      {!markOnly && title ? (
        <span className={`${s.text} ${textClassName}`}>{title}</span>
      ) : null}
    </span>
  );

  if (!asLink) return content;

  return (
    <Link to={to} className="inline-flex items-center shrink-0">
      {content}
    </Link>
  );
}
