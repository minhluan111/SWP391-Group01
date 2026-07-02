import { formatDateTime24 } from './dateTimeFormat';
import type { ReservationLike } from './reservationUtils';

/** Đồng bộ với BE/utils/reservationRules.js — CANCEL_DEADLINE_HOURS */
export const CANCEL_DEADLINE_HOURS = 1;
export const GRACE_PERIOD_MINUTES = 15;

export function getCancelDeadline(reservationTime: string): Date {
  const deadline = new Date(reservationTime);
  deadline.setHours(deadline.getHours() - CANCEL_DEADLINE_HOURS);
  return deadline;
}

export type CancelBlockReason =
  | 'not_pending'
  | 'too_late'
  | 'already_cancelled'
  | 'expired'
  | 'checked_in';

export interface CancelEligibility {
  canCancel: boolean;
  reason?: CancelBlockReason;
  message: string;
  cancelDeadline?: Date;
}

export function getCancelEligibility(
  res: ReservationLike,
  now: Date = new Date(),
): CancelEligibility {
  if (res.status === 'cancelled') {
    return {
      canCancel: false,
      reason: 'already_cancelled',
      message: 'Đặt chỗ này đã được hủy trước đó.',
    };
  }

  if (res.status === 'expired') {
    return {
      canCancel: false,
      reason: 'expired',
      message: 'Đặt chỗ đã hết hạn — không thể hủy.',
    };
  }

  if (res.status === 'checked_in') {
    return {
      canCancel: false,
      reason: 'checked_in',
      message: 'Xe đã vào bãi — không thể hủy đặt chỗ. Vui lòng checkout tại quầy nhân viên.',
    };
  }

  if (res.status !== 'pending') {
    return {
      canCancel: false,
      reason: 'not_pending',
      message: 'Chỉ có thể hủy đặt chỗ đang chờ check-in.',
    };
  }

  const deadline = getCancelDeadline(res.reservation_time);
  if (now >= deadline) {
    return {
      canCancel: false,
      reason: 'too_late',
      cancelDeadline: deadline,
      message:
        `Không thể hủy: còn dưới ${CANCEL_DEADLINE_HOURS} giờ trước giờ vào dự kiến ` +
        `(${formatDateTime24(res.reservation_time)}). Vui lòng đến check-in đúng giờ hoặc để hệ thống tự hết hạn ` +
        `sau ${GRACE_PERIOD_MINUTES} phút kể từ giờ vào.`,
    };
  }

  return {
    canCancel: true,
    cancelDeadline: deadline,
    message:
      `Có thể hủy miễn phí trước ${formatDateTime24(deadline)} ` +
      `(ít nhất ${CANCEL_DEADLINE_HOURS} giờ trước giờ vào dự kiến).`,
  };
}

export const CANCEL_POLICY_SUMMARY =
  `Có thể hủy miễn phí trước giờ vào dự kiến ít nhất ${CANCEL_DEADLINE_HOURS} giờ (chỉ vé đang chờ).`;

export function getCancelConfirmMessage(res: ReservationLike): string {
  return (
    `Bạn có chắc muốn hủy đặt chỗ ${res.reservation_code} tại vị trí ${res.slot_code}? ` +
    'Chỗ đỗ sẽ được giải phóng ngay. Thao tác này không thể hoàn tác.'
  );
}
