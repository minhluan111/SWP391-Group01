import { useState, useEffect } from 'react';
import { Search, Car, Clock, Wrench } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

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

export default function FindSlot() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | ''>('');
  const [bookingLoading, setBookingLoading] = useState(false);
  
  const { isAuthenticated } = useAuth();

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
      toast.error('Lỗi khi tải danh sách xe của bạn');
    }
  };

  const handleOpenBookingModal = () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để đặt chỗ');
      return;
    }
    fetchVehicles();
    setShowBookingModal(true);
  };

  const submitBooking = async () => {
    if (!selectedVehicleId) {
      toast.error('Vui lòng chọn xe để đặt chỗ');
      return;
    }
    
    setBookingLoading(true);
    try {
      await api.post('/reservations', {
        vehicle_id: selectedVehicleId,
        slot_id: selectedSlot?.db_id
      });
      toast.success('Đặt chỗ thành công!');
      setShowBookingModal(false);
      setSelectedSlot(null);
      fetchSlots(); // Refresh slots to show new status
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi đặt chỗ');
    } finally {
      setBookingLoading(false);
    }
  };

  const filteredSlots = slots.filter(slot => {
    if (activeTab === 'all') return true;
    if (activeTab === 'available') return slot.status === 'available';
    if (activeTab === 'car') return slot.type === 'car';
    if (activeTab === 'motorbike') return slot.type === 'motorbike';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'available': return 'bg-green-100 text-green-700 border-green-200';
      case 'occupied': return 'bg-red-100 text-red-700 border-red-200';
      case 'reserved': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'maintenance': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark mb-2">Tra Cứu Chỗ Đậu</h1>
          <p className="text-gray-500">Xem sơ đồ bãi đỗ xe theo thời gian thực</p>
        </div>
        
        <div className="relative w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Tìm theo mã (vd: A01)..." 
            className="w-full md:w-80 pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main content - Grid */}
        <div className={`w-full ${selectedSlot ? 'lg:w-2/3' : 'lg:w-full'} transition-all duration-300`}>
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-6 p-1 bg-gray-100 rounded-lg inline-flex">
            {['all', 'available', 'car', 'motorbike'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab 
                    ? 'bg-white text-dark shadow-sm' 
                    : 'text-gray-500 hover:text-dark'
                }`}
              >
                {tab === 'all' && 'Tất cả'}
                {tab === 'available' && 'Chỗ trống'}
                {tab === 'car' && 'Ô tô'}
                {tab === 'motorbike' && 'Xe máy'}
              </button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
             <div className="text-center py-12 text-gray-500">Đang tải danh sách...</div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4"
            >
              {filteredSlots.map(slot => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot)}
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                    selectedSlot?.id === slot.id 
                      ? 'border-primary-500 shadow-[0_0_15px_rgba(79,70,229,0.3)] bg-primary-50/50 transform scale-105' 
                      : 'border-gray-200 hover:border-primary-300 hover:shadow-md bg-white hover:-translate-y-1'
                  } flex flex-col items-center justify-center aspect-square group`}
                >
                  <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
                    slot.status === 'available' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] pulse-glow' : 
                    slot.status === 'occupied' ? 'bg-red-500' : 
                    slot.status === 'reserved' ? 'bg-orange-500' : 'bg-gray-400'
                  }`}></div>
                  
                  <Car className={`w-10 h-10 mb-2 transition-colors duration-300 ${slot.status === 'available' ? 'text-primary-600 group-hover:text-primary-500' : 'text-gray-400 opacity-50'}`} />
                  <span className="font-bold text-lg text-dark group-hover:text-primary-600 transition-colors">{slot.id}</span>
                  <span className="text-xs text-gray-500 mt-1">{slot.floor}</span>
                </motion.div>
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
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full lg:w-1/3"
          >
            <div className="sticky top-24 glass-card rounded-xl p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-dark mb-1">Vị trí {selectedSlot.id}</h3>
                  <p className="text-gray-500">{selectedSlot.floor}</p>
                </div>
                <button onClick={() => setSelectedSlot(null)} className="text-gray-400 hover:text-red-500 transition-colors bg-gray-100 hover:bg-red-50 p-2 rounded-full">
                  <span className="sr-only">Đóng</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-3 border-b border-gray-100/50">
                  <span className="text-gray-600">Trạng thái</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(selectedSlot.status)}`}>
                    {getStatusText(selectedSlot.status)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100/50">
                  <span className="text-gray-600">Loại xe</span>
                  <span className="font-medium text-dark capitalize">{selectedSlot.type === 'car' ? 'Ô tô' : 'Xe máy'}</span>
                </div>
              </div>

              {selectedSlot.status === 'available' ? (
                <button onClick={handleOpenBookingModal} className="btn-shine w-full bg-primary-600 text-white font-medium py-3.5 rounded-xl hover:bg-primary-700 transition-colors shadow-lg hover:shadow-primary-500/30">
                  Đặt chỗ ngay
                </button>
              ) : selectedSlot.status === 'occupied' ? (
                <div className="w-full bg-red-50 text-red-600 font-medium py-3.5 rounded-xl text-center flex items-center justify-center gap-2 border border-red-100">
                  <Clock className="w-5 h-5" /> Đang có xe đỗ
                </div>
              ) : selectedSlot.status === 'maintenance' ? (
                 <div className="w-full bg-gray-100 text-gray-500 font-medium py-3.5 rounded-xl text-center flex items-center justify-center gap-2 border border-gray-200">
                   <Wrench className="w-5 h-5" /> Đang bảo trì
                 </div>
              ) : (
                <div className="w-full bg-orange-50 text-orange-600 font-medium py-3.5 rounded-xl text-center flex items-center justify-center gap-2 border border-orange-100">
                  Đã được đặt trước
                </div>
              )}
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold text-dark mb-4">Xác nhận đặt chỗ</h2>
            <p className="text-gray-600 mb-6">Bạn đang đặt vị trí <span className="font-bold">{selectedSlot?.id}</span> ({selectedSlot?.type === 'car' ? 'Ô tô' : 'Xe máy'})</p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Chọn biển số xe của bạn</label>
              <select 
                value={selectedVehicleId} 
                onChange={(e) => setSelectedVehicleId(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="">-- Chọn xe --</option>
                {vehicles.filter(v => v.vehicle_type === selectedSlot?.type).map(v => (
                  <option key={v.id} value={v.id}>{v.license_plate} - {v.vehicle_type === 'car' ? 'Ô tô' : 'Xe máy'}</option>
                ))}
              </select>
              {vehicles.filter(v => v.vehicle_type === selectedSlot?.type).length === 0 && (
                <p className="text-red-500 text-sm mt-2">Bạn chưa có loại xe này trong tài khoản. Vui lòng thêm xe vào hồ sơ.</p>
              )}
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setShowBookingModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={submitBooking}
                disabled={bookingLoading || vehicles.filter(v => v.vehicle_type === selectedSlot?.type).length === 0}
                className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {bookingLoading ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
