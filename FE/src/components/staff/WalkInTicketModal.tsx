import { X, QrCode, Ticket } from 'lucide-react';
import { formatDateTime24 } from '../../lib/dateTimeFormat';
import { assetUrl } from '../../lib/apiBase';
import type { WalkInTicketData } from './WalkInCheckInForm';

interface WalkInTicketModalProps {
  ticket: WalkInTicketData | null;
  onClose: () => void;
}

export default function WalkInTicketModal({ ticket, onClose }: WalkInTicketModalProps) {
  if (!ticket) return null;

  const photoSrc = assetUrl(ticket.vehicle_photo_url);
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(ticket.ticket_code)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full bg-slate-100 text-ink-muted hover:text-ink z-10"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-primary-500 font-bold text-sm uppercase tracking-wider">
            <Ticket className="w-4 h-4" />
            Vé gửi xe
          </div>

          <p className="text-2xl font-black font-mono text-ink">{ticket.ticket_code}</p>

          <div className="text-sm text-left space-y-1 bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p><span className="text-ink-muted">Biển số:</span> <strong className="font-mono text-ink">{ticket.license_plate}</strong></p>
            <p><span className="text-ink-muted">Loại xe:</span> <strong className="text-ink">{ticket.vehicle_type === 'car' ? 'Ô tô' : 'Xe máy'}</strong></p>
            <p><span className="text-ink-muted">Vị trí:</span> <strong className="text-emerald-600">{ticket.slot_code}</strong> ({ticket.floor_name})</p>
            <p><span className="text-ink-muted">Giờ vào:</span> <strong className="text-ink">{formatDateTime24(ticket.check_in_time)}</strong></p>
          </div>

          {photoSrc && (
            <img src={photoSrc} alt="Ảnh xe" className="w-full max-h-36 object-cover rounded-xl border border-slate-200" />
          )}

          <div className="inline-flex flex-col items-center p-4 bg-white rounded-xl border border-slate-200">
            <img src={qrSrc} alt="QR vé" className="w-40 h-40" />
            <span className="text-[10px] text-ink-muted mt-2 font-bold uppercase flex items-center gap-1">
              <QrCode className="w-3 h-3" /> Quét khi ra bãi
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
