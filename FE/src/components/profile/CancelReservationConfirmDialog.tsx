import { AlertTriangle } from 'lucide-react';

interface CancelReservationConfirmDialogProps {
  open: boolean;
  reservationCode: string;
  slotCode: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function CancelReservationConfirmDialog({
  open,
  reservationCode,
  slotCode,
  loading = false,
  onConfirm,
  onCancel,
}: CancelReservationConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={loading ? undefined : onCancel}
        aria-label="Đóng"
      />

      <div
        role="alertdialog"
        aria-labelledby="cancel-dialog-title"
        aria-describedby="cancel-dialog-desc"
        className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 pb-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-11 h-11 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 id="cancel-dialog-title" className="text-lg font-bold text-ink">
                Xác nhận hủy đặt chỗ
              </h3>
              <p id="cancel-dialog-desc" className="text-sm text-ink-muted mt-2 leading-relaxed">
                Bạn có chắc muốn hủy đặt chỗ{' '}
                <strong className="text-ink font-mono">{reservationCode}</strong> tại vị trí{' '}
                <strong className="text-emerald-600">{slotCode}</strong>?
              </p>
              <p className="text-xs text-amber-700 mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Chỗ đỗ sẽ được giải phóng ngay. Thao tác này không thể hoàn tác.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 pt-2 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-ink-muted font-semibold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Quay lại
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Đang hủy...' : 'Hủy đặt chỗ'}
          </button>
        </div>
      </div>
    </div>
  );
}
