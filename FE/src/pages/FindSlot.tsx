import { useState, useEffect } from 'react';
import { Search, Car, Clock, Wrench } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

interface Slot {
  id: string; // The slot_code from db
  db_id: number;
  type: string;
  status: string;
  floor: string;
}

export default function FindSlot() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
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

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để đặt chỗ');
      return;
    }
    // We will implement booking in Phase 3
    toast.success('Chức năng đặt chỗ đang được phát triển!');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredSlots.map(slot => (
                <div 
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot)}
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedSlot?.id === slot.id ? 'border-primary-500 shadow-md' : 'border-gray-200 hover:border-primary-300'
                  } bg-white flex flex-col items-center justify-center aspect-square`}
                >
                  <div className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ${
                    slot.status === 'available' ? 'bg-green-500' : 
                    slot.status === 'occupied' ? 'bg-red-500' : 
                    slot.status === 'reserved' ? 'bg-orange-500' : 'bg-gray-400'
                  }`}></div>
                  
                  <Car className={`w-10 h-10 mb-2 ${slot.status === 'available' ? 'text-primary-600' : 'text-gray-400 opacity-50'}`} />
                  <span className="font-bold text-lg text-dark">{slot.id}</span>
                  <span className="text-xs text-gray-500 mt-1">{slot.floor}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar details */}
        {selectedSlot && (
          <div className="w-full lg:w-1/3">
            <div className="sticky top-24 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-dark mb-1">Vị trí {selectedSlot.id}</h3>
                  <p className="text-gray-500">{selectedSlot.floor}</p>
                </div>
                <button onClick={() => setSelectedSlot(null)} className="text-gray-400 hover:text-gray-600">
                  <span className="sr-only">Đóng</span>
                  &times;
                </button>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Trạng thái</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(selectedSlot.status)}`}>
                    {getStatusText(selectedSlot.status)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Loại xe</span>
                  <span className="font-medium text-dark capitalize">{selectedSlot.type === 'car' ? 'Ô tô' : 'Xe máy'}</span>
                </div>
              </div>

              {selectedSlot.status === 'available' ? (
                <button onClick={handleBooking} className="w-full bg-primary-600 text-white font-medium py-3 rounded-lg hover:bg-primary-700 transition-colors">
                  Đặt chỗ ngay
                </button>
              ) : selectedSlot.status === 'occupied' ? (
                <div className="w-full bg-gray-100 text-gray-500 font-medium py-3 rounded-lg text-center flex items-center justify-center gap-2">
                  <Clock className="w-5 h-5" /> Đang có xe đỗ
                </div>
              ) : selectedSlot.status === 'maintenance' ? (
                 <div className="w-full bg-gray-100 text-gray-500 font-medium py-3 rounded-lg text-center flex items-center justify-center gap-2">
                   <Wrench className="w-5 h-5" /> Đang bảo trì
                 </div>
              ) : (
                <div className="w-full bg-orange-100 text-orange-700 font-medium py-3 rounded-lg text-center flex items-center justify-center gap-2">
                  Đã được đặt trước
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
