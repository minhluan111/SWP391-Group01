import { useState } from 'react';
import { Search, Car, Clock, Wrench } from 'lucide-react';

const MOCK_SLOTS = [
  { id: 'A01', type: 'car', status: 'available', price: '30,000 VND / giờ' },
  { id: 'A02', type: 'car', status: 'occupied', plate: '59A-123.45', price: '30,000 VND / giờ' },
  { id: 'A03', type: 'car', status: 'reserved', time: 'Đến lúc 14:30', price: '30,000 VND / giờ' },
  { id: 'A04', type: 'car', status: 'available', price: '30,000 VND / giờ' },
  { id: 'A05', type: 'car', status: 'maintenance', price: '30,000 VND / giờ' },
  { id: 'A06', type: 'car', status: 'occupied', plate: '30F-987.65', price: '30,000 VND / giờ' },
  { id: 'A07', type: 'car', status: 'available', price: '30,000 VND / giờ' },
  { id: 'A08', type: 'car', status: 'available', price: '30,000 VND / giờ' },
  { id: 'A09', type: 'car', status: 'occupied', plate: '51K-222.33', price: '30,000 VND / giờ' },
  { id: 'A10', type: 'car', status: 'reserved', time: 'Đến lúc 16:00', price: '30,000 VND / giờ' },
  { id: 'A11', type: 'car', status: 'available', price: '30,000 VND / giờ' },
  { id: 'A12', type: 'car', status: 'available', price: '30,000 VND / giờ' },
];

export default function FindSlot() {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const stats = [
    { label: 'TỔNG SỐ CHỖ', value: '500', icon: '🚙', color: 'text-dark', bg: 'bg-white' },
    { label: 'CÒN TRỐNG', value: '124', icon: '✅', color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'ĐÃ ĐẶT TRƯỚC', value: '38', icon: '⏱️', color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'ĐANG SỬ DỤNG', value: '338', icon: '🚗', color: 'text-red-500', bg: 'bg-red-50' },
    { label: 'TỶ LỆ LẤP ĐẦY', value: '76%', icon: '📊', color: 'text-dark', bg: 'bg-white' }
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-dark">Chỗ đậu khả dụng</h1>
          <p className="text-gray-500 text-sm mt-1">Theo dõi trạng thái chỗ đậu theo thời gian thực</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-gray-500">{stat.label}</span>
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${stat.bg}`}>{stat.icon}</span>
              </div>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Tầng</label>
            <select className="w-full border-gray-300 rounded-lg text-sm p-2.5 bg-gray-50 border focus:ring-primary-500 focus:border-primary-500">
              <option>B1</option>
              <option>B2</option>
              <option>B3</option>
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Khu vực</label>
            <select className="w-full border-gray-300 rounded-lg text-sm p-2.5 bg-gray-50 border focus:ring-primary-500 focus:border-primary-500">
              <option>Khu A</option>
              <option>Khu B</option>
              <option>Khu C</option>
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Loại phương tiện</label>
            <select className="w-full border-gray-300 rounded-lg text-sm p-2.5 bg-gray-50 border focus:ring-primary-500 focus:border-primary-500">
              <option>Ô tô</option>
              <option>Xe máy</option>
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Trạng thái</label>
            <select className="w-full border-gray-300 rounded-lg text-sm p-2.5 bg-gray-50 border focus:ring-primary-500 focus:border-primary-500">
              <option>Tất cả</option>
              <option>Còn trống</option>
              <option>Đang sử dụng</option>
            </select>
          </div>
          <div className="flex-[2] min-w-[200px] relative">
            <input type="text" placeholder="Nhập mã chỗ đậu..." className="w-full border-gray-300 rounded-lg text-sm p-2.5 pl-9 bg-gray-50 border focus:ring-primary-500 focus:border-primary-500" />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </div>
          <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
            Tìm kiếm
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Slot Grid */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h3 className="font-bold text-dark">Sơ đồ Tầng B1 - Khu A</h3>
              <div className="flex gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-500"></div> Còn trống</span>
                <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> Đang sử dụng</span>
                <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-orange-400"></div> Đã đặt trước</span>
                <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div> Không khả dụng</span>
              </div>
            </div>

            <div className="mb-2 text-sm font-medium text-gray-500">Dãy 1</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {MOCK_SLOTS.slice(0, 6).map((slot) => (
                <SlotCard key={slot.id} slot={slot} isSelected={selectedSlot === slot.id} onClick={() => setSelectedSlot(slot.id)} />
              ))}
            </div>

            <div className="mb-2 text-sm font-medium text-gray-500">Dãy 2</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {MOCK_SLOTS.slice(6, 12).map((slot) => (
                <SlotCard key={slot.id} slot={slot} isSelected={selectedSlot === slot.id} onClick={() => setSelectedSlot(slot.id)} />
              ))}
            </div>
          </div>

          {/* Details Sidebar */}
          {selectedSlot && (
            <div className="w-full lg:w-80 bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-dark">Chi tiết chỗ đậu</h3>
                <button onClick={() => setSelectedSlot(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              {MOCK_SLOTS.filter(s => s.id === selectedSlot).map(slot => (
                <div key={slot.id}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`text-2xl font-bold w-16 h-16 rounded-xl flex items-center justify-center
                      ${slot.status === 'available' ? 'bg-green-100 text-green-700' : ''}
                      ${slot.status === 'occupied' ? 'bg-red-100 text-red-700' : ''}
                      ${slot.status === 'reserved' ? 'bg-orange-100 text-orange-700' : ''}
                      ${slot.status === 'maintenance' ? 'bg-gray-100 text-gray-700' : ''}
                    `}>
                      {slot.id}
                    </div>
                    <div>
                      <div className={`text-sm font-bold uppercase ${
                        slot.status === 'available' ? 'text-green-600' :
                        slot.status === 'occupied' ? 'text-red-500' :
                        slot.status === 'reserved' ? 'text-orange-500' : 'text-gray-500'
                      }`}>
                        {slot.status === 'available' ? 'Còn trống' :
                         slot.status === 'occupied' ? 'Đang sử dụng' :
                         slot.status === 'reserved' ? 'Đã đặt trước' : 'Bảo trì'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Khu vực tiêu chuẩn</div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-50">
                      <span className="text-gray-500">Tầng</span>
                      <span className="font-medium text-dark">Tầng B1</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-50">
                      <span className="text-gray-500">Khu vực</span>
                      <span className="font-medium text-dark">Khu A</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-50">
                      <span className="text-gray-500">Loại xe</span>
                      <span className="font-medium text-dark">Ô tô (4-7 chỗ)</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-50">
                      <span className="text-gray-500">Khoảng cách tới cổng</span>
                      <span className="font-medium text-dark">15m</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-50">
                      <span className="text-gray-500">Đơn giá</span>
                      <span className="font-medium text-dark">{slot.price}</span>
                    </div>
                  </div>

                  {slot.status === 'available' && (
                    <div className="bg-primary-50 rounded-xl p-4 border border-primary-100 mb-4">
                      <h4 className="font-bold text-primary-900 mb-1">Đặt chỗ nhanh</h4>
                      <p className="text-xs text-primary-700 mb-3">Giữ chỗ này trong 30 phút</p>
                      <button className="w-full bg-primary-600 text-white font-medium py-2.5 rounded-lg hover:bg-primary-700 transition-colors text-sm">
                        Xác nhận đặt chỗ
                      </button>
                    </div>
                  )}
                  {slot.status === 'occupied' && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-4">
                      <p className="text-xs text-gray-500 mb-1">Biển số xe đang đỗ</p>
                      <p className="font-bold text-dark text-lg">{slot.plate}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SlotCard({ slot, isSelected, onClick }: { slot: any, isSelected: boolean, onClick: () => void }) {
  const getColors = () => {
    switch (slot.status) {
      case 'available': return 'border-green-200 bg-white hover:border-green-400';
      case 'occupied': return 'border-red-200 bg-red-50 text-red-500';
      case 'reserved': return 'border-orange-200 bg-orange-50 text-orange-500';
      case 'maintenance': return 'border-gray-200 bg-gray-50 text-gray-400';
      default: return 'border-gray-200';
    }
  };

  return (
    <div 
      onClick={onClick}
      className={`relative h-28 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center p-2
        ${getColors()} 
        ${isSelected ? 'ring-2 ring-primary-500 ring-offset-2' : ''}
      `}
    >
      <span className="absolute top-2 left-3 text-xs font-bold text-gray-400">{slot.id}</span>
      <span className="absolute top-2 right-2 text-[10px] text-gray-400">Tầng B1</span>
      
      <div className="mt-2">
        {slot.status === 'available' && <Car className="w-8 h-8 text-green-500 mx-auto" />}
        {slot.status === 'occupied' && <Car className="w-8 h-8 text-red-500 mx-auto" />}
        {slot.status === 'reserved' && <Clock className="w-8 h-8 text-orange-400 mx-auto" />}
        {slot.status === 'maintenance' && <Wrench className="w-8 h-8 text-gray-400 mx-auto" />}
      </div>
      
      <div className="mt-2 text-xs font-semibold uppercase text-center w-full truncate">
        {slot.status === 'available' && <span className="text-green-600">Còn trống</span>}
        {slot.status === 'occupied' && <span className="text-red-600">{slot.plate}</span>}
        {slot.status === 'reserved' && <span className="text-orange-500">{slot.time}</span>}
        {slot.status === 'maintenance' && <span>Bảo trì</span>}
      </div>
    </div>
  );
}
