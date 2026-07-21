import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Ticket, X, Ban } from 'lucide-react';
import {
  getFloorLabel,
  getQrCodeCaption,
  getQrCodeValue,
  getStatusText,
  hasSessionTicket,
  isInLotReservation,
  isReservationCompleted,
  shouldShowTicketQr,
  type ReservationLike,
} from '../../lib/reservationUtils';
import { formatDateTime24 } from '../../lib/dateTimeFormat';
import {
  getCancelEligibility,
} from '../../lib/reservationCancelPolicy';
import CancelReservationConfirmDialog from './CancelReservationConfirmDialog';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface ReservationTicketModalProps {
  reservation: (ReservationLike & { id: number }) | null;
  onClose: () => void;
  onCancelled?: () => void;
}

function formatDateTime(value?: string) {
  return formatDateTime24(value);
}

export default function ReservationTicketModal({ reservation, onClose, onCancelled }: ReservationTicketModalProps) {
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    if (!reservation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showCancelConfirm) setShowCancelConfirm(false);
        else onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [reservation, onClose, showCancelConfirm]);

  const showQr = reservation ? shouldShowTicketQr(reservation) : false;
  const qrValue = reservation ? getQrCodeValue(reservation) : null;
  const completed = reservation ? isReservationCompleted(reservation) : false;
  const inLot = reservation ? isInLotReservation(reservation) : false;
  const sessionTicket = reservation ? hasSessionTicket(reservation) : false;
  const isWalkInHistory = Boolean(reservation?.is_walkin_history);
  const cancelInfo = reservation ? getCancelEligibility(reservation) : null;
  const isPending = reservation?.status === 'pending';

  const handleCancel = async () => {
    if (!reservation || !cancelInfo?.canCancel) return;

    setCancelling(true);
    try {
      const response = await api.post(`/reservations/${reservation.id}/cancel`);
      toast.success(response.data.message || 'Đã hủy đặt chỗ thành công');
      setShowCancelConfirm(false);
      onCancelled?.();
      onClose();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Không thể hủy đặt chỗ');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <AnimatePresence>
      {reservation && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Đóng"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ticket-modal-title"
            className="relative w-full max-w-2xl border border-slate-200 rounded-3xl overflow-hidden shadow-2xl bg-white"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 border border-slate-200 text-ink-muted hover:text-ink transition-colors"
              aria-label="Đóng vé"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />

            <div
              className={`p-6 md:p-8 flex flex-col ${showQr && qrValue ? 'md:flex-row items-center justify-between' : ''} gap-8`}
            >
              <div className="space-y-4 flex-1 w-full">
                <div className="flex items-center gap-2 text-primary-500 font-bold text-xs uppercase tracking-wider">
                  {showQr ? <QrCode className="w-4 h-4" /> : <Ticket className="w-4 h-4" />}
                  <span>{showQr ? 'Vé đỗ xe của bạn' : 'Chi tiết vé đỗ xe'}</span>
                </div>

                <div className="space-y-3">
                  {isWalkInHistory ? (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 block mb-1">
                        Loại vé
                      </span>
                      <h3
                        id="ticket-modal-title"
                        className="text-lg md:text-xl font-bold text-emerald-800"
                      >
                        Vé check-in trực tiếp
                      </h3>
                      {reservation.check_in_time && (
                        <p className="text-xs text-ink-muted mt-1">
                          Giờ vào bãi: {formatDateTime(reservation.check_in_time)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div
                      className={`rounded-xl border px-4 py-3 ${
                        sessionTicket
                          ? 'border-slate-200 bg-surface'
                          : 'border-amber-200 bg-amber-50'
                      }`}
                    >
                      <span className="text-[10px] uppercase tracking-wider font-bold text-ink-muted block mb-1">
                        Mã đặt chỗ
                      </span>
                      <h3
                        id="ticket-modal-title"
                        className="text-xl md:text-2xl font-black text-ink tracking-tight font-mono break-all"
                      >
                        {reservation.reservation_code}
                      </h3>
                      <p className="text-xs text-ink-muted mt-1">
                        Giờ vào dự kiến: {formatDateTime(reservation.reservation_time)}
                      </p>
                    </div>
                  )}

                  {sessionTicket && (
                    <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-blue-700 block mb-1">
                        Mã vé vào bãi
                      </span>
                      <p className="text-xl md:text-2xl font-black text-blue-800 tracking-tight font-mono break-all">
                        {reservation.ticket_code}
                      </p>
                      {reservation.check_in_time && (
                        <p className="text-xs text-ink-muted mt-1">
                          Check-in lúc: {formatDateTime(reservation.check_in_time)}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 text-sm">
                  <div>
                    <span className="text-ink-muted block text-xs uppercase font-semibold">Vị trí đỗ</span>
                    <strong className="text-emerald-600 text-lg font-bold">{reservation.slot_code}</strong>
                  </div>
                  <div>
                    <span className="text-ink-muted block text-xs uppercase font-semibold">Tầng đỗ</span>
                    <strong className="text-ink text-lg font-bold">
                      {getFloorLabel(reservation.slot_code)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-ink-muted block text-xs uppercase font-semibold">Biển số xe</span>
                    <strong className="font-mono text-ink text-lg font-bold">{reservation.license_plate}</strong>
                  </div>
                  <div>
                    <span className="text-ink-muted block text-xs uppercase font-semibold">Loại xe</span>
                    <span className="text-ink font-bold">
                      {reservation.vehicle_type === 'car' ? 'Ô tô' : 'Xe máy'}
                    </span>
                  </div>
                </div>

                {completed && (
                  <div className="grid grid-cols-2 gap-4 pt-1 text-sm border-t border-slate-200">
                    {reservation.check_in_time && (
                      <div>
                        <span className="text-ink-muted block text-xs uppercase font-semibold">Giờ vào bãi</span>
                        <strong className="text-blue-600 font-bold">
                          {formatDateTime(reservation.check_in_time)}
                        </strong>
                      </div>
                    )}
                    {reservation.check_out_time && (
                      <div>
                        <span className="text-ink-muted block text-xs uppercase font-semibold">Giờ ra bãi</span>
                        <strong className="text-emerald-600 font-bold">
                          {formatDateTime(reservation.check_out_time)}
                        </strong>
                      </div>
                    )}
                    {reservation.total_amount !== undefined && reservation.total_amount !== null && (
                      <div>
                        <span className="text-ink-muted block text-xs uppercase font-semibold">Tổng tiền</span>
                        <strong className="text-ink text-lg font-bold">
                          {Number(reservation.total_amount).toLocaleString('vi-VN')}đ
                        </strong>
                      </div>
                    )}
                    {reservation.payment_method && (
                      <div>
                        <span className="text-ink-muted block text-xs uppercase font-semibold">
                          Phương thức thanh toán
                        </span>
                        <strong className="text-ink font-bold">
                          {reservation.payment_method === 'cash' ? 'Tiền mặt' : 'Online'}
                        </strong>
                        {reservation.payment_status && (
                          <span
                            className={`ml-2 text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase ${
                              reservation.payment_status === 'paid'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                            }`}
                          >
                            {reservation.payment_status === 'paid' ? 'Đã trả' : 'Chưa trả'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {inLot && (
                  <p className="text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                    Xe đã vào bãi — dùng mã QR bên cạnh (mã vé vào bãi) khi ra bãi.
                  </p>
                )}

                {isPending && cancelInfo && (
                  <div
                    className={`text-xs rounded-lg px-3 py-2 border ${
                      cancelInfo.canCancel
                        ? 'text-amber-700 bg-amber-50 border-amber-200'
                        : 'text-orange-700 bg-orange-50 border-orange-200'
                    }`}
                  >
                    {cancelInfo.message}
                  </div>
                )}

                {reservation.status === 'cancelled' && (
                  <p className="text-xs text-ink-muted bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                    Đặt chỗ đã hủy — chỉ xem lại thông tin vé.
                  </p>
                )}

                {completed && (
                  <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                    Vé đã hoàn tất — chỉ xem lại thông tin, không còn mã QR.
                  </p>
                )}

                {!showQr && !completed && reservation.status !== 'cancelled' && (
                  <p className="text-xs text-ink-muted bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                    Trạng thái: {getStatusText(reservation.status, reservation)} — chỉ xem lại thông tin vé.
                  </p>
                )}

                {isPending && cancelInfo?.canCancel && (
                  <button
                    type="button"
                    onClick={() => setShowCancelConfirm(true)}
                    disabled={cancelling}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-300 bg-rose-50 text-rose-600 hover:bg-rose-100 font-semibold text-sm transition-colors disabled:opacity-50"
                  >
                    <Ban className="w-4 h-4" />
                    Hủy đặt chỗ
                  </button>
                )}
              </div>

              {showQr && qrValue && (
                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-lg border border-slate-200 flex-shrink-0">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrValue)}`}
                    alt="Mã QR vé đỗ xe"
                    className="w-36 h-36"
                  />
                  <span className="text-[10px] text-ink-muted mt-2 font-bold uppercase tracking-wider text-center max-w-[9rem]">
                    {getQrCodeCaption(reservation)}
                  </span>
                  <span className="text-[9px] text-ink-muted mt-1 font-mono text-center break-all max-w-[9rem]">
                    {qrValue}
                  </span>
                </div>
              )}
            </div>

            <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-surface rounded-full border-r border-slate-200" />
            <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-6 bg-surface rounded-full border-l border-slate-200" />

            <CancelReservationConfirmDialog
              open={showCancelConfirm}
              reservationCode={reservation.reservation_code}
              slotCode={reservation.slot_code}
              loading={cancelling}
              onConfirm={handleCancel}
              onCancel={() => setShowCancelConfirm(false)}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
