import { useState, useEffect } from 'react';
import { Car, Bike, Clock, Wrench, ShieldAlert, Sparkles } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import DateTimeInput24 from '../components/ui/DateTimeInput24';
import {
  getFutureDatetimeLocal,
  toDatetimeLocalValue,
} from '../lib/dateTimeFormat';

interface Slot {
  id: string; // The slot_code from db
  db_id: number;
  type: string;
  status: string;
  floor: string;
}

interface Vehicle {
  id: number;
  license_plate: string;
  vehicle_type: string;
}

const MIN_LEAD_HOURS = 2;
const MAX_ADVANCE_DAYS = 3;

interface MyReservation {
  vehicle_id: number;
  status: string;
  check_out_time?: string;
  payment_status?: string;
}

function isVehicleBusy(reservations: MyReservation[], vehicleId: number) {
  return reservations.some((r) => {
    if (r.vehicle_id !== vehicleId) return false;
    if (r.status === 'pending') return true;
    if (r.status === 'checked_in' && !(r.check_out_time && r.payment_status === 'paid')) return true;
    return false;
  });
}

export default function FindSlot() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'available' | 'car' | 'motorbike'>('all');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  
  // Floor suggestion states
  const [selectedVehicleType, setSelectedVehicleType] = useState<'car' | 'motorbike' | ''>('');
  const [suggestedFloor, setSuggestedFloor] = useState<string>('');
  const [selectedFloorName, setSelectedFloorName] = useState<string>('all');

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | ''>('');
  const [reservationTime, setReservationTime] = useState(getFutureDatetimeLocal(MIN_LEAD_HOURS));
  const [expectedCheckoutTime, setExpectedCheckoutTime] = useState(getFutureDatetimeLocal(MIN_LEAD_HOURS + 2));
  const [bookingLoading, setBookingLoading] = useState(false);
  const [myReservations, setMyReservations] = useState<MyReservation[]>([]);
  
  const minReservationTime = getFutureDatetimeLocal(MIN_LEAD_HOURS);
  const maxReservationTime = getFutureDatetimeLocal(MAX_ADVANCE_DAYS * 24);

  const { isAuthenticated } = useAuth();

  const eligibleVehicles = vehicles.filter((v) => {
    if (v.vehicle_type !== selectedSlot?.type) return false;
    return !isVehicleBusy(myReservations, v.id);
  });

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const response = await api.get('/slots');
      if (response.data.success) {
        setSlots(response.data.data);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách chỗ đậu');
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/vehicles');
      if (response.data.success) {
        setVehicles(response.data.data);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách xe');
    }
  };

  const fetchMyReservations = async () => {
    try {
      const response = await api.get('/reservations/my-reservations');
      if (response.data.success) {
        setMyReservations(response.data.data);
      }
    } catch {
      // User may not be logged in
    }
  };

  const handleOpenBookingModal = () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để đặt chỗ');
      return;
    }
    const defaultIn = getFutureDatetimeLocal(MIN_LEAD_HOURS);
    const defaultOut = getFutureDatetimeLocal(MIN_LEAD_HOURS + 2);
    setReservationTime(defaultIn);
    setExpectedCheckoutTime(defaultOut);
    setSelectedVehicleId('');
    fetchVehicles();
    fetchMyReservations();
    setShowBookingModal(true);
  };

  const submitBooking = async () => {
    if (!selectedVehicleId) {
      toast.error('Vui lòng chọn xe để đặt chỗ');
      return;
    }
    
    setBookingLoading(true);
    try {
      const response = await api.post('/reservations', {
        vehicle_id: selectedVehicleId,
        slot_id: selectedSlot?.db_id,
        reservation_time: reservationTime,
        expected_checkout_time: expectedCheckoutTime
      });
      const bookingCode = response.data.data?.reservation_code || 'RES-CODE';
      toast.success(`Đặt chỗ thành công! Mã đặt chỗ: ${bookingCode}`);
      setShowBookingModal(false);
      setSelectedSlot(null);
      fetchSlots(); // Refresh slots
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi đặt chỗ');
    } finally {
      setBookingLoading(false);
    }
  };

  // Trigger floor suggestion when selecting vehicle type
  const handleSelectVehicleType = (type: 'car' | 'motorbike') => {
    setSelectedVehicleType(type);
    if (type === 'motorbike') {
      setSuggestedFloor('Tầng 1 - Xe máy');
      setSelectedFloorName('Tầng 1 - Xe máy');
      setActiveTab('motorbike');
    } else {
      setSuggestedFloor('Tầng 2 - Ô tô');
      setSelectedFloorName('Tầng 2 - Ô tô');
      setActiveTab('car');
    }
    toast.success(`Đã tự động gợi ý và hiển thị tầng phù hợp cho ${type === 'car' ? 'Ô tô' : 'Xe máy'}`);
  };

  // Get distinct floor names
  const floorsList = Array.from(new Set(slots.map(s => s.floor)));

  const filteredSlots = slots.filter(slot => {
    // Filter by floor name if not 'all'
    if (selectedFloorName !== 'all' && slot.floor !== selectedFloorName) {
      return false;
    }

    // Filter by tab
    if (activeTab === 'all') return true;
    if (activeTab === 'available') return slot.status === 'available';
    if (activeTab === 'car') return slot.type === 'car';
    if (activeTab === 'motorbike') return slot.type === 'motorbike';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'available': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'occupied': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'reserved': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'maintenance': return 'bg-slate-800 text-slate-400 border-slate-700';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'available': return 'Trống';
      case 'occupied': return 'Đang đỗ';
      case 'reserved': return 'Đã đặt';
      case 'maintenance': return 'Bảo trì';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 mb-2">Tra cứu & Đặt vị trí</h1>
          <p className="text-sm text-slate-400">Xem sơ đồ 2D và chọn vị trí trống thời gian thực</p>
        </div>
      </div>

      {/* STEP 1: SELECT VEHICLE TYPE & AUTO RECOMMEND FLOOR */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl mb-8">
        <h2 className="text-base font-bold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          Chọn loại xe của bạn để nhận gợi ý tầng đỗ
        </h2>
        <div className="flex flex-wrap gap-4 mb-4">
          <button 
            type="button"
            onClick={() => handleSelectVehicleType('motorbike')}
            className={`flex-1 min-w-[140px] px-6 py-4 rounded-xl border font-bold text-center transition-all ${selectedVehicleType === 'motorbike' ? 'border-primary-500 bg-primary-950/40 text-primary-300' : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'}`}
          >
            🏍️ Xe Máy
            <span className="block text-xs font-normal text-slate-500 mt-1">Gợi ý: Tầng 1</span>
          </button>
          
          <button 
            type="button"
            onClick={() => handleSelectVehicleType('car')}
            className={`flex-1 min-w-[140px] px-6 py-4 rounded-xl border font-bold text-center transition-all ${selectedVehicleType === 'car' ? 'border-primary-500 bg-primary-950/40 text-primary-300' : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'}`}
          >
            🚗 Ô Tô
            <span className="block text-xs font-normal text-slate-500 mt-1">Gợi ý: Tầng 2</span>
          </button>
        </div>

        {suggestedFloor && (
          <div className="bg-primary-950/20 border border-primary-900/40 p-4 rounded-xl flex items-center justify-between text-sm">
            <span className="text-primary-300">
              💡 Hệ thống gợi ý bạn chọn tầng đỗ: <strong>{suggestedFloor}</strong>
            </span>
            <span className="bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">Khuyên dùng</span>
          </div>
        )}
      </div>

      {/* Grid Floor controls */}
      <div className="flex flex-col lg:flex-row gap-8">
        <div className={`w-full ${selectedSlot ? 'lg:w-2/3' : 'lg:w-full'} transition-all duration-300 space-y-6`}>
          
          {/* Controls toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
            {/* Floor Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold uppercase">Chọn Tầng:</span>
              <select
                value={selectedFloorName}
                onChange={(e) => setSelectedFloorName(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-sm rounded-lg px-3 py-1.5 font-bold"
              >
                <option value="all">Tất cả tầng</option>
                {floorsList.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            {/* Availability Filter Tabs */}
            <div className="flex gap-2">
              {(['all', 'available', 'car', 'motorbike'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === tab 
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25' 
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {tab === 'all' && 'Tất cả'}
                  {tab === 'available' && 'Chỗ trống'}
                  {tab === 'car' && 'Chỗ Ô tô'}
                  {tab === 'motorbike' && 'Chỗ Xe máy'}
                </button>
              ))}
            </div>
          </div>

          {/* Sơ đồ bãi đỗ */}
          {loading ? (
             <div className="text-center py-16 text-slate-500">Đang tải sơ đồ bãi đỗ...</div>
          ) : filteredSlots.length === 0 ? (
             <div className="text-center py-16 text-slate-500 border border-dashed border-slate-800 rounded-2xl">
               Không tìm thấy ô đỗ nào phù hợp với bộ lọc hiện tại.
             </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4"
            >
              {filteredSlots.map(slot => (
                <div 
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot)}
                  className={`relative p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                    selectedSlot?.id === slot.id 
                      ? 'border-primary-500 shadow-xl shadow-primary-500/10 bg-primary-950/20 scale-105' 
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                  } flex flex-col items-center justify-center aspect-square group`}
                >
                  <div className={`absolute top-3 right-3 w-3 h-3 rounded-full ${
                    slot.status === 'available' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse' : 
                    slot.status === 'occupied' ? 'bg-rose-500' : 
                    slot.status === 'reserved' ? 'bg-amber-500' : 'bg-slate-600'
                  }`}></div>
                  
                  {slot.type === 'car' ? (
                    <Car className={`w-10 h-10 mb-2 transition-colors duration-300 ${slot.status === 'available' ? 'text-primary-400 group-hover:text-primary-300' : 'text-slate-600 opacity-60'}`} />
                  ) : (
                    <Bike className={`w-10 h-10 mb-2 transition-colors duration-300 ${slot.status === 'available' ? 'text-orange-400 group-hover:text-orange-300' : 'text-slate-600 opacity-60'}`} />
                  )}
                  <span className="font-bold text-lg text-slate-100 group-hover:text-primary-400 transition-colors font-mono">{slot.id}</span>
                  <span className="text-[10px] text-slate-500 mt-1 font-semibold">{slot.floor}</span>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Sidebar details */}
        <AnimatePresence>
        {selectedSlot && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full lg:w-1/3"
          >
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sticky top-24">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-100 mb-1 font-mono">Ô đỗ {selectedSlot.id}</h3>
                  <p className="text-xs text-slate-400 font-semibold">{selectedSlot.floor}</p>
                </div>
                <button onClick={() => setSelectedSlot(null)} className="text-slate-400 hover:text-white bg-slate-950 p-2 rounded-full border border-slate-850">
                  <span className="sr-only">Đóng</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-3 border-b border-slate-850">
                  <span className="text-sm text-slate-400">Trạng thái</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(selectedSlot.status)}`}>
                    {getStatusText(selectedSlot.status)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-850">
                  <span className="text-sm text-slate-400">Loại xe phù hợp</span>
                  <span className="font-bold text-slate-200 capitalize text-sm">{selectedSlot.type === 'car' ? '🚗 Ô tô' : '🏍️ Xe máy'}</span>
                </div>
              </div>

              {selectedSlot.status === 'available' ? (
                <button 
                  onClick={handleOpenBookingModal} 
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary-500/25 active:scale-95 text-sm"
                >
                  Tiến hành Đặt chỗ
                </button>
              ) : selectedSlot.status === 'occupied' ? (
                <div className="w-full bg-rose-500/10 text-rose-400 font-bold py-3.5 rounded-xl text-center flex items-center justify-center gap-2 border border-rose-500/20 text-sm">
                  <Clock className="w-5 h-5" /> Đang có xe đỗ tại đây
                </div>
              ) : selectedSlot.status === 'maintenance' ? (
                 <div className="w-full bg-slate-850 text-slate-500 font-bold py-3.5 rounded-xl text-center flex items-center justify-center gap-2 border border-slate-800 text-sm">
                   <Wrench className="w-5 h-5" /> Vị trí đang bảo trì
                 </div>
              ) : (
                <div className="w-full bg-amber-500/10 text-amber-400 font-bold py-3.5 rounded-xl text-center flex items-center justify-center gap-2 border border-amber-500/20 text-sm">
                  Đã được khách khác đặt
                </div>
              )}
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 text-white">
            <h2 className="text-xl font-bold mb-4">Xác nhận Đặt vị trí</h2>
            
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 mb-6 text-sm space-y-2">
              <p className="text-slate-400">Vị trí: <strong className="text-primary-400 font-mono text-base">{selectedSlot?.id}</strong></p>
              <p className="text-slate-400">Tầng: <strong className="text-slate-200">{selectedSlot?.floor}</strong></p>
              <p className="text-slate-400">Phương tiện: <span className="capitalize font-bold text-slate-200">{selectedSlot?.type === 'car' ? '🚗 Ô tô' : '🏍️ Xe máy'}</span></p>
              <div className="flex gap-2 text-xs text-amber-400 font-medium bg-amber-500/5 p-2 rounded-lg border border-amber-500/10 mt-3">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>Không yêu cầu thanh toán online. Bạn sẽ thanh toán tiền mặt trực tiếp cho nhân viên khi xe ra bãi đỗ.</span>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Chọn biển số xe đỗ</label>
              <select 
                value={selectedVehicleId} 
                onChange={(e) => setSelectedVehicleId(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-850 text-white focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm cursor-pointer"
              >
                <option value="">-- Chọn phương tiện --</option>
                {eligibleVehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.license_plate} ({v.vehicle_type === 'car' ? 'Ô tô' : 'Xe máy'})</option>
                ))}
              </select>
              {vehicles.filter(v => v.vehicle_type === selectedSlot?.type).length > 0 && eligibleVehicles.length === 0 && (
                <p className="text-amber-400 text-xs mt-2.5">
                  Tất cả xe loại này đang có đặt chỗ chờ hoặc đang đỗ trong bãi. Vui lòng hoàn tất lượt hiện tại trước.
                </p>
              )}
              {vehicles.filter(v => v.vehicle_type === selectedSlot?.type).length === 0 && (
                <p className="text-rose-400 text-xs mt-2.5">
                  ⚠️ Bạn chưa đăng ký phương tiện loại này trong hồ sơ cá nhân. Vui lòng thêm phương tiện mới vào trang Profile để tiếp tục đặt chỗ.
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Thời gian vào dự kiến</label>
              <p className="text-amber-400 text-xs mb-2">Đặt trước tối thiểu 2 giờ, tối đa 3 ngày.</p>
              <DateTimeInput24
                value={reservationTime}
                min={minReservationTime}
                max={maxReservationTime}
                onChange={(next) => {
                  setReservationTime(next);
                  if (next >= expectedCheckoutTime) {
                    const bumped = new Date(next);
                    bumped.setHours(bumped.getHours() + 2);
                    setExpectedCheckoutTime(toDatetimeLocalValue(bumped));
                  }
                }}
              />
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Thời gian ra dự kiến</label>
              <DateTimeInput24
                value={expectedCheckoutTime}
                min={reservationTime}
                max={maxReservationTime}
                onChange={setExpectedCheckoutTime}
              />
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowBookingModal(false)}
                className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all text-sm active:scale-95"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={submitBooking}
                disabled={bookingLoading || eligibleVehicles.length === 0}
                className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 text-sm active:scale-95"
              >
                {bookingLoading ? 'Đang đặt...' : 'Xác nhận đặt'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
