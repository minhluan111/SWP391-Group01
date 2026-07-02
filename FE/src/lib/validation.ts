export const VIETNAMESE_PHONE_REGEX = /^(0)(3|5|7|8|9)[0-9]{8}$/;
export const LICENSE_PLATE_REGEX = /^[0-9]{2}[A-Z]{1,2}[0-9]?-(?:[0-9]{4,5}|[0-9]{3}\.[0-9]{2})$/;

export const LICENSE_PLATE_ERROR =
  'Biển số không đúng định dạng (VD: 59X-12345, 51F-1234 hoặc 29A-123.45)';
export const PHONE_ERROR = 'Số điện thoại không hợp lệ (VD: 0912345678)';

export function normalizeLicensePlate(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, '');
}

export function validateLicensePlate(value: string): string | null {
  if (!value.trim()) return 'Vui lòng nhập biển số xe';
  if (!LICENSE_PLATE_REGEX.test(normalizeLicensePlate(value))) return LICENSE_PLATE_ERROR;
  return null;
}

export function validateOptionalPhone(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!VIETNAMESE_PHONE_REGEX.test(trimmed)) return PHONE_ERROR;
  return null;
}
