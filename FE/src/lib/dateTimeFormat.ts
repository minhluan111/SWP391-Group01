/** Định dạng thống nhất 24h: HH:mm:ss D/M/YYYY */
export function formatDateTime24(value?: string | Date | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

/** Chỉ giờ 24h: HH:mm */
export function formatTime24(value?: string | Date | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function toDatetimeLocalValue(value: string | Date): string {
  const d = new Date(value);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function getNowDatetimeLocal(): string {
  return toDatetimeLocalValue(new Date());
}

export function getFutureDatetimeLocal(hours: number): string {
  return toDatetimeLocalValue(new Date(Date.now() + hours * 60 * 60 * 1000));
}

export function splitDatetimeLocal(value: string): { date: string; time: string } {
  if (!value?.includes('T')) {
    const fallback = getNowDatetimeLocal();
    const [date, time] = fallback.split('T');
    return { date, time: time.slice(0, 5) };
  }
  const [date, timePart] = value.split('T');
  return { date, time: timePart.slice(0, 5) };
}

export function combineDateAndTime(date: string, time: string): string {
  return `${date}T${time.slice(0, 5)}`;
}

export function datetimeLocalToIso(value: string): string {
  return new Date(value).toISOString();
}

/** Giờ checkout mặc định: hiện tại, hoặc sau giờ vào nếu giờ vào còn ở tương lai */
export function getDefaultCheckoutDatetimeLocal(checkInTime: string | Date): string {
  const checkIn = new Date(checkInTime);
  const now = new Date();
  if (isNaN(checkIn.getTime()) || checkIn <= now) {
    return getNowDatetimeLocal();
  }
  const afterCheckIn = new Date(checkIn.getTime() + 60 * 60 * 1000);
  return toDatetimeLocalValue(afterCheckIn);
}

export function isCheckoutBeforeCheckIn(checkInTime: string | Date, checkOutLocal: string): boolean {
  const checkIn = new Date(checkInTime).getTime();
  const checkOut = new Date(checkOutLocal).getTime();
  return !isNaN(checkIn) && !isNaN(checkOut) && checkOut < checkIn;
}

const WALK_IN_TOLERANCE_MS = 5 * 60 * 1000;
const WALK_IN_MAX_FUTURE_MS = 24 * 60 * 60 * 1000;

export function getLocalDateParam(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function getWalkInTimeMin(): string {
  return toDatetimeLocalValue(new Date(Date.now() - WALK_IN_TOLERANCE_MS));
}

export function getWalkInTimeMax(): string {
  return toDatetimeLocalValue(new Date(Date.now() + WALK_IN_MAX_FUTURE_MS));
}

export function isWalkInTimePastStale(localValue: string): boolean {
  const t = new Date(localValue).getTime();
  if (isNaN(t)) return false;
  return t < Date.now() - WALK_IN_TOLERANCE_MS;
}

export function validateWalkInTimeForSubmit(localValue: string): string | null {
  const t = new Date(localValue).getTime();
  if (isNaN(t)) return 'Thời gian check-in không hợp lệ.';
  if (t > Date.now() + WALK_IN_MAX_FUTURE_MS) {
    return 'Giờ vào bãi không được quá 24 giờ trong tương lai.';
  }
  return null;
}

/** Chỉ tự đổi giờ khi quá khứ quá 5 phút; giữ nguyên giờ tương lai staff chọn (tối đa 24h). */
export function resolveWalkInTimeOnSubmit(localValue: string): { time: string; adjusted: boolean } {
  const validationError = validateWalkInTimeForSubmit(localValue);
  if (validationError) {
    throw new Error(validationError);
  }
  if (isWalkInTimePastStale(localValue)) {
    return { time: getNowDatetimeLocal(), adjusted: true };
  }
  return { time: localValue, adjusted: false };
}
