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
