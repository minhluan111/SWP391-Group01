export interface ReservationLike {
  id?: number;
  status: string;
  reservation_code: string;
  reservation_time: string;
  slot_code: string;
  license_plate: string;
  vehicle_type: string;
  ticket_code?: string;
  check_in_time?: string;
  check_out_time?: string;
  total_amount?: number;
  payment_status?: string;
  payment_method?: string;
  is_walkin_history?: number | boolean;
}

export type VehicleFilter = 'all' | 'car' | 'motorbike';
export type StatusFilter = 'all' | 'pending' | 'checked_in' | 'completed' | 'cancelled';
export type TimePreset = 'all' | '7d' | '30d';

export function isReservationCompleted(res: ReservationLike) {
  return !!res.check_out_time && res.payment_status === 'paid';
}

export function isInLotReservation(res: ReservationLike) {
  return res.status === 'checked_in' && !isReservationCompleted(res);
}

export type TicketGlassVariant = 'pending' | 'in_lot' | 'neutral';

export function getTicketGlassVariant(res: ReservationLike): TicketGlassVariant {
  if (res.status === 'pending') return 'pending';
  if (isInLotReservation(res)) return 'in_lot';
  return 'neutral';
}

export function shouldShowTicketQr(res: ReservationLike) {
  return res.status === 'pending' || isInLotReservation(res);
}

/** @deprecated Dùng shouldShowTicketQr */
export function canShowQrModal(res: ReservationLike) {
  return shouldShowTicketQr(res);
}

export function getTicketGlassClass(res: ReservationLike): string {
  const variant = getTicketGlassVariant(res);
  if (variant === 'pending') return 'ticket-glass-pending';
  if (variant === 'in_lot') return 'ticket-glass-in-lot';
  return 'ticket-glass-neutral';
}

export function hasSessionTicket(res: ReservationLike) {
  return !!res.ticket_code;
}

/** Mã hiển thị chính trên bảng: TICKET khi đã check-in, ngược lại RES */
export function getDisplayTicketCode(res: ReservationLike): string {
  return res.ticket_code ?? res.reservation_code;
}

/** Giá trị encode vào QR — RES khi đang chờ, TICKET khi đã vào bãi */
export function getQrCodeValue(res: ReservationLike): string | null {
  if (!shouldShowTicketQr(res)) return null;
  if (isInLotReservation(res)) return res.ticket_code ?? null;
  if (res.status === 'pending') return res.reservation_code;
  return null;
}

export function getQrCodeCaption(res: ReservationLike): string {
  if (isInLotReservation(res)) return 'Đưa staff quét khi ra';
  return 'Đưa staff quét khi vào';
}

const BANNER_SUFFIX = 'Bấm mã vé bên dưới để xem chi tiết vé và mã QR.';

export { BANNER_SUFFIX as RESERVATION_BANNER_SUFFIX };

function formatBookingCount(count: number) {
  return count === 1 ? '1 mã vé đặt chỗ' : `${count} mã vé đặt chỗ`;
}

function formatInLotCount(count: number) {
  return count === 1
    ? '1 phương tiện đang đỗ trong bãi'
    : `${count} phương tiện đang đỗ trong bãi`;
}

export interface ReservationBannerContent {
  bookingPhrase: string | null;
  inLotPhrase: string | null;
}

export function getReservationBannerContent(
  pendingCount: number,
  inLotCount: number,
): ReservationBannerContent | null {
  if (pendingCount === 0 && inLotCount === 0) return null;
  return {
    bookingPhrase: pendingCount > 0 ? formatBookingCount(pendingCount) : null,
    inLotPhrase: inLotCount > 0 ? formatInLotCount(inLotCount) : null,
  };
}

export function buildReservationBannerMessage(pendingCount: number, inLotCount: number): string | null {
  const content = getReservationBannerContent(pendingCount, inLotCount);
  if (!content) return null;

  const parts: string[] = [];
  if (content.bookingPhrase) parts.push(content.bookingPhrase);
  if (content.inLotPhrase) parts.push(content.inLotPhrase);

  const main =
    parts.length === 2 ? `Bạn có ${parts[0]} và ${parts[1]}` : `Bạn có ${parts[0]}`;

  return `${main} — ${BANNER_SUFFIX}`;
}

export function countPendingReservations<T extends ReservationLike>(reservations: T[]) {
  return reservations.filter((r) => r.status === 'pending').length;
}

export function countInLotReservations<T extends ReservationLike>(reservations: T[]) {
  return reservations.filter((r) => isInLotReservation(r)).length;
}

export function getDisplayStatus(res: ReservationLike): StatusFilter | 'expired' | 'other' {
  if (isReservationCompleted(res)) return 'completed';
  if (res.status === 'cancelled') return 'cancelled';
  if (res.status === 'pending') return 'pending';
  if (res.status === 'checked_in') return 'checked_in';
  if (res.status === 'expired') return 'expired';
  return 'other';
}

export function getStatusColor(status: string, res?: ReservationLike) {
  if (res && isReservationCompleted(res)) {
    return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25';
  }
  switch (status) {
    case 'pending':
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'checked_in':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'expired':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    case 'cancelled':
      return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
    case 'completed':
      return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25';
    default:
      return 'bg-slate-800 text-slate-400 border-slate-700';
  }
}

export function getStatusText(status: string, res?: ReservationLike) {
  if (res && isReservationCompleted(res)) return 'Đã hoàn tất';
  switch (status) {
    case 'pending':
      return 'Đang chờ';
    case 'checked_in':
      return 'Đã vào bãi';
    case 'expired':
      return 'Hết hạn';
    case 'cancelled':
      return 'Đã hủy';
    case 'completed':
      return 'Đã hoàn tất';
    default:
      return status;
  }
}

export function getFloorLabel(slotCode: string) {
  return slotCode.startsWith('B') ? 'Tầng 1 - Xe máy' : 'Tầng 2 - Ô tô';
}

export function filterReservations<T extends ReservationLike>(
  reservations: T[],
  options: {
    searchQuery: string;
    vehicleFilter: VehicleFilter;
    statusFilter: StatusFilter;
    timePreset: TimePreset;
  },
): T[] {
  const query = options.searchQuery.trim().toLowerCase();
  const now = Date.now();

  return reservations.filter((res) => {
    if (options.vehicleFilter !== 'all' && res.vehicle_type !== options.vehicleFilter) {
      return false;
    }

    if (options.statusFilter !== 'all' && getDisplayStatus(res) !== options.statusFilter) {
      return false;
    }

    if (options.timePreset !== 'all') {
      const days = options.timePreset === '7d' ? 7 : 30;
      const cutoff = now - days * 24 * 60 * 60 * 1000;
      if (new Date(res.reservation_time).getTime() < cutoff) return false;
    }

    if (query) {
      const haystack = [res.reservation_code, res.ticket_code, res.slot_code, res.license_plate]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    return true;
  });
}
