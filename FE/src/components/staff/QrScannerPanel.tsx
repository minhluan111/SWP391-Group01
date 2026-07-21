import { useEffect, useId, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CameraOff } from 'lucide-react';

interface QrScannerPanelProps {
  onScan: (decodedText: string) => void;
  className?: string;
}

async function pickWebcamId(): Promise<string | { facingMode: string }> {
  const cameras = await Html5Qrcode.getCameras();
  if (!cameras?.length) {
    return { facingMode: 'user' };
  }
  // Laptop: ưu tiên webcam tích hợp / camera đầu tiên
  const integrated = cameras.find((c) =>
    /integrated|facetime|webcam|usb.*cam|hd.*pro/i.test(c.label),
  );
  return (integrated ?? cameras[0]).id;
}

export default function QrScannerPanel({ onScan, className = '' }: QrScannerPanelProps) {
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const startingRef = useRef(false);
  const onScanRef = useRef(onScan);
  const containerId = useId().replace(/:/g, '');

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  const stopScanner = async () => {
    startingRef.current = false;
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2 /* SCANNING */) {
          await scannerRef.current.stop();
        }
      } catch {
        /* ignore */
      }
      try {
        scannerRef.current.clear();
      } catch {
        /* ignore */
      }
      scannerRef.current = null;
    }
    setActive(false);
  };

  const startScanner = async () => {
    if (startingRef.current || scannerRef.current) return;
    startingRef.current = true;
    setError(null);

    try {
      const cameraId = await pickWebcamId();
      const scanner = new Html5Qrcode(containerId, { verbose: false });
      scannerRef.current = scanner;

      await scanner.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.333,
        },
        (decoded) => {
          const text = decoded.trim();
          if (text) {
            onScanRef.current(text);
            void stopScanner();
          }
        },
        () => {},
      );

      setActive(true);
    } catch (err) {
      console.error('QR scanner error:', err);
      setError(
        'Không giữ được camera. Đóng Zoom/Teams nếu đang mở, bật quyền Camera (công tắc xanh), F5 trang rồi thử lại.',
      );
      await stopScanner();
    } finally {
      startingRef.current = false;
    }
  };

  useEffect(() => {
    return () => {
      void stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`rounded-xl border border-slate-200 bg-slate-50 p-4 ${className}`}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Quét mã QR</p>
        <button
          type="button"
          onClick={() => (active ? void stopScanner() : void startScanner())}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
            active
              ? 'border-rose-500/40 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20'
              : 'border-primary-500/40 bg-primary-500/10 text-primary-500 hover:bg-primary-500/20'
          }`}
        >
          {active ? <CameraOff className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5" />}
          {active ? 'Tắt camera' : 'Bật camera'}
        </button>
      </div>

      {/* Container camera: KHÔNG đặt React children bên trong — html5-qrcode tự inject video */}
      <div className="relative w-full rounded-lg overflow-hidden bg-black min-h-[280px]">
        <div id={containerId} className="w-full min-h-[280px]" />

        {!active && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 pointer-events-none">
            <p className="text-xs text-slate-300 text-center">
              Bật camera → đưa <strong className="text-white">màn hình điện thoại</strong> (mã QR) vào trước webcam laptop, cách khoảng 15–25 cm.
            </p>
            <p className="text-[10px] text-slate-400 text-center">
              Tăng độ sáng màn hình điện thoại, giữ yên 1–2 giây để quét.
            </p>
          </div>
        )}
      </div>

      {active && (
        <p className="text-xs text-emerald-600 mt-2">Camera đang bật — căn mã QR vào khung vuông giữa hình.</p>
      )}
      {error && <p className="text-xs text-rose-600 mt-2">{error}</p>}
    </div>
  );
}
