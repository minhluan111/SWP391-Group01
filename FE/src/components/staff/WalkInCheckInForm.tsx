import { useEffect, useMemo, useState } from 'react';
import { Upload, Ticket } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import DateTimeInput24 from '../ui/DateTimeInput24';
import FormFieldError from '../ui/FormFieldError';
import {
  datetimeLocalToIso,
  getNowDatetimeLocal,
  getWalkInTimeMax,
  getWalkInTimeMin,
  resolveWalkInTimeOnSubmit,
} from '../../lib/dateTimeFormat';
import { API_ORIGIN } from '../../lib/apiBase';
import {
  normalizeLicensePlate,
  validateLicensePlate,
  validateOptionalPhone,
} from '../../lib/validation';

interface SlotRow {
  id: string;
  db_id: number;
  type: string;
  status: string;
  floor: string;
}

export interface WalkInTicketData {
  ticket_code: string;
  license_plate: string;
  vehicle_type: string;
  slot_code: string;
  floor_name: string;
  check_in_time: string;
  vehicle_photo_url?: string | null;
}

interface WalkInCheckInFormProps {
  onTicketCreated: (ticket: WalkInTicketData) => void;
}

export default function WalkInCheckInForm({ onTicketCreated }: WalkInCheckInFormProps) {
  const [slots, setSlots] = useState<SlotRow[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [licensePlate, setLicensePlate] = useState('');
  const [plateError, setPlateError] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [vehicleType, setVehicleType] = useState<'car' | 'motorbike'>('motorbike');
  const [floor, setFloor] = useState('');
  const [slotDbId, setSlotDbId] = useState('');
  const [checkInTime, setCheckInTime] = useState(getNowDatetimeLocal());
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    api.get('/slots')
      .then((res) => {
        if (res.data.success) setSlots(res.data.data);
      })
      .catch(() => toast.error('Không tải được danh sách ô đỗ'))
      .finally(() => setLoadingSlots(false));
  }, []);

  const floors = useMemo(() => {
    const set = new Set(
      slots.filter((s) => s.type === vehicleType).map((s) => s.floor),
    );
    return Array.from(set);
  }, [slots, vehicleType]);

  const availableSlots = useMemo(() => {
    return slots.filter(
      (s) =>
        s.type === vehicleType &&
        s.status === 'available' &&
        (!floor || s.floor === floor),
    );
  }, [slots, vehicleType, floor]);

  useEffect(() => {
    if (floors.length > 0 && !floors.includes(floor)) {
      setFloor(floors[0]);
    }
  }, [floors, floor]);

  useEffect(() => {
    setSlotDbId('');
  }, [vehicleType, floor]);

  const validatePlateField = (value = licensePlate): boolean => {
    const error = validateLicensePlate(value);
    setPlateError(error ?? '');
    return !error;
  };

  const validatePhoneField = (value = guestPhone): boolean => {
    const error = validateOptionalPhone(value);
    setPhoneError(error ?? '');
    return !error;
  };

  const handlePlateBlur = () => {
    if (!licensePlate.trim()) {
      setPlateError('Vui lòng nhập biển số xe');
      return;
    }
    const error = validateLicensePlate(licensePlate);
    if (!error) {
      setLicensePlate(normalizeLicensePlate(licensePlate));
    }
    setPlateError(error ?? '');
  };

  const handlePhoneBlur = () => {
    validatePhoneField();
  };

  const ensurePlateValidBeforeNextField = (): boolean => {
    if (!licensePlate.trim()) return true;
    return validatePlateField();
  };

  const onPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Chỉ chấp nhận file ảnh');
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const plateOk = validatePlateField();
    const phoneOk = validatePhoneField();
    if (!plateOk || !phoneOk) return;

    if (!slotDbId) {
      toast.error('Vui lòng chọn ô đỗ trống');
      return;
    }

    let timeToUse = checkInTime;
    try {
      const resolved = resolveWalkInTimeOnSubmit(checkInTime);
      timeToUse = resolved.time;
      if (resolved.adjusted) {
        setCheckInTime(timeToUse);
        toast('Giờ vào đã quá hạn — đã cập nhật thành thời điểm hiện tại', { icon: 'ℹ️' });
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Thời gian check-in không hợp lệ');
      return;
    }

    setSubmitting(true);
    try {
      const form = new FormData();
      form.append('license_plate', normalizeLicensePlate(licensePlate));
      form.append('vehicle_type', vehicleType);
      form.append('slot_id', slotDbId);
      form.append('check_in_time', datetimeLocalToIso(timeToUse));
      if (guestPhone.trim()) form.append('guest_phone', guestPhone.trim());
      if (photoFile) form.append('vehicle_photo', photoFile);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ORIGIN}/api/sessions/walk-in-checkin`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.message || 'Check-in trực tiếp thất bại');
      }

      toast.success(json.message || 'Tạo vé thành công');
      onTicketCreated(json.data);
      setLicensePlate('');
      setPlateError('');
      setGuestPhone('');
      setPhoneError('');
      setPhotoFile(null);
      setPhotoPreview(null);
      setCheckInTime(getNowDatetimeLocal());
      setSlotDbId('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Check-in trực tiếp thất bại';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5" noValidate>
      <h3 className="font-bold text-slate-200 flex items-center gap-2">
        <Ticket className="w-5 h-5 text-primary-400" />
        Check-in xe trực tiếp (không đặt chỗ)
      </h3>

      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Upload ảnh xe
        </label>
        <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-primary-500/50 hover:bg-slate-950/50 transition-colors">
          <Upload className="w-6 h-6 text-slate-500 mb-1" />
          <span className="text-xs text-slate-500">Chọn ảnh (JPG, PNG — tối đa 5MB)</span>
          <input type="file" accept="image/*" className="hidden" onChange={onPhotoChange} />
        </label>
        {photoPreview && (
          <div className="mt-3">
            <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">Ảnh preview</p>
            <img src={photoPreview} alt="Xe" className="w-full max-h-40 object-cover rounded-xl border border-slate-800" />
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Biển số</label>
        <input
          type="text"
          value={licensePlate}
          onChange={(e) => {
            setLicensePlate(e.target.value);
            if (plateError) setPlateError('');
          }}
          onBlur={handlePlateBlur}
          placeholder="37A-12345"
          className={`w-full px-4 py-3 rounded-xl bg-slate-950 border text-white font-mono focus:outline-none focus:ring-1 focus:ring-primary-500 ${
            plateError ? 'border-red-400' : 'border-slate-800'
          }`}
        />
        <FormFieldError message={plateError} />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Số điện thoại <span className="text-slate-600 normal-case">(tùy chọn)</span>
        </label>
        <input
          type="tel"
          value={guestPhone}
          onChange={(e) => {
            setGuestPhone(e.target.value);
            if (phoneError) setPhoneError('');
          }}
          onBlur={handlePhoneBlur}
          placeholder="0912345678"
          className={`w-full px-4 py-3 rounded-xl bg-slate-950 border text-white focus:outline-none focus:ring-1 focus:ring-primary-500 ${
            phoneError ? 'border-red-400' : 'border-slate-800'
          }`}
        />
        <FormFieldError message={phoneError} />
        <p className="text-[11px] text-slate-500 mt-1.5">
          Nếu khách cung cấp SĐT, hệ thống lưu theo vé để liên kết lịch sử khi đăng ký tài khoản sau.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Loại xe</label>
          <select
            value={vehicleType}
            onFocus={ensurePlateValidBeforeNextField}
            onChange={(e) => {
              if (!ensurePlateValidBeforeNextField()) return;
              setVehicleType(e.target.value as 'car' | 'motorbike');
            }}
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="motorbike">Xe máy</option>
            <option value="car">Ô tô</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tầng</label>
          <select
            value={floor}
            onFocus={ensurePlateValidBeforeNextField}
            onChange={(e) => {
              if (!ensurePlateValidBeforeNextField()) return;
              setFloor(e.target.value);
            }}
            disabled={loadingSlots || floors.length === 0}
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
          >
            {floors.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Slot</label>
          <select
            value={slotDbId}
            onFocus={ensurePlateValidBeforeNextField}
            onChange={(e) => {
              if (!ensurePlateValidBeforeNextField()) return;
              setSlotDbId(e.target.value);
            }}
            disabled={availableSlots.length === 0}
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
          >
            <option value="">-- Chọn ô trống --</option>
            {availableSlots.map((s) => (
              <option key={s.db_id} value={s.db_id}>{s.id}</option>
            ))}
          </select>
        </div>
      </div>

      <div onFocusCapture={ensurePlateValidBeforeNextField}>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Ngày giờ vào</label>
        <DateTimeInput24
          value={checkInTime}
          onChange={setCheckInTime}
          min={getWalkInTimeMin()}
          max={getWalkInTimeMax()}
        />
        <p className="text-[11px] text-slate-500 mt-1.5">
          Quá khứ quá 5 phút sẽ tự đổi sang giờ hiện tại khi tạo vé. Tương lai tối đa 24 giờ (phù hợp demo).
        </p>
      </div>

      <button
        type="submit"
        disabled={submitting || loadingSlots}
        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
      >
        {submitting ? 'Đang tạo vé...' : 'Tạo vé'}
      </button>
    </form>
  );
}
