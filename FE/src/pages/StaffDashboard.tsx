import { useState, useEffect } from 'react';
import { Search, LogIn, LogOut, FileText, ClipboardList, CheckCircle, Car, RefreshCw, X } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function StaffDashboard() {
  const [activeTab, setActiveTab] = useState<'checkin' | 'checkout' | 'logs'>('checkin');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    reservations: any[];
    activeSessions: any[];
  }>({ reservations: [], activeSessions: [] });

  const [dailyLogs, setDailyLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);

  // Checkout Modal/Invoice State
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [checkoutDetail, setCheckoutDetail] = useState<{
    total_hours: number;
    hourly_rate: number;
    total_amount: number;
  } | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchDailyLogs();
    }
  }, [activeTab]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error('Vui lòng nhập mã đặt chỗ, biển số hoặc mã slot');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/sessions/search?query=${searchQuery}`);
      setSearchResults(response.data.data);
      if (response.data.data.reservations.length === 0 && response.data.data.activeSessions.length === 0) {
        toast.error('Không tìm thấy bản ghi nào khớp');
      } else {
        toast.success('Đã tải kết quả tìm kiếm');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi tìm kiếm');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (res: any) => {
    try {
      const payload = {
        vehicle_id: res.vehicle_id,
        slot_id: res.slot_id,
        reservation_id: res.reservation_id
      };
      await api.post('/sessions/checkin', payload);
      toast.success(`Check-in thành công cho xe ${res.license_plate}!`);
      // Clear or refresh search results
      setSearchQuery('');
      setSearchResults({ reservations: [], activeSessions: [] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Check-in thất bại');
    }
  };

  const requestCheckoutInvoice = async (session: any) => {
    setSelectedSession(session);
    setCheckoutLoading(true);
    try {
      // We will perform checkout which calculates fee and saves state in one step, 
      // but to display the fee to staff before confirming cash payment:
      // Let's call checkout. The backend checkOut function completes checkout and calculates the fee.
      // So checking out directly prints the calculated bill.
      const response = await api.post('/sessions/checkout', { session_id: session.session_id });
      setCheckoutDetail(response.data.data);
      toast.success('Check-out thành công, đã xuất hóa đơn thanh toán');
      // Clear query
      setSearchQuery('');
      setSearchResults({ reservations: [], activeSessions: [] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Check-out thất bại');
      setSelectedSession(null);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const fetchDailyLogs = async () => {
    setLogsLoading(true);
    try {
      const response = await api.get('/sessions/daily-log');
      setDailyLogs(response.data.data);
    } catch (error: any) {
      toast.error('Lỗi khi tải nhật ký lượt đỗ');
    } finally {
      setLogsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-wide text-slate-100 flex items-center gap-2">
            <ClipboardList className="text-primary-500 w-8 h-8" />
            Nhân viên Bãi xe Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">Check-in xe vào, thanh toán check-out xe ra và xem nhật ký hoạt động.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setSearchQuery('');
              setSearchResults({ reservations: [], activeSessions: [] });
              if (activeTab === 'logs') fetchDailyLogs();
            }} 
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-700 rounded-xl hover:bg-slate-800 text-slate-300 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" /> Làm mới
          </button>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex gap-4 border-b border-slate-800 pb-px mb-8">
        <button 
          onClick={() => setActiveTab('checkin')} 
          className={`flex items-center gap-2 pb-4 font-semibold text-sm transition-all border-b-2 px-2 ${activeTab === 'checkin' ? 'border-primary-500 text-primary-500' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <LogIn className="w-4 h-4" /> Check-in Xe Vào
        </button>
        <button 
          onClick={() => setActiveTab('checkout')} 
          className={`flex items-center gap-2 pb-4 font-semibold text-sm transition-all border-b-2 px-2 ${activeTab === 'checkout' ? 'border-primary-500 text-primary-500' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <LogOut className="w-4 h-4" /> Check-out & Tính Phí
        </button>
        <button 
          onClick={() => setActiveTab('logs')} 
          className={`flex items-center gap-2 pb-4 font-semibold text-sm transition-all border-b-2 px-2 ${activeTab === 'logs' ? 'border-primary-500 text-primary-500' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <FileText className="w-4 h-4" /> Nhật Ký Hoạt Động
        </button>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 columns - Actions & Search results */}
        <div className="lg:col-span-2 space-y-6">
          
          {activeTab !== 'logs' && (
            <div className="glass-morphism border border-slate-800 p-6 rounded-2xl">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-primary-500" />
                Tìm kiếm thông tin xe
              </h2>
              <form onSubmit={handleSearch} className="flex gap-3">
                <input 
                  type="text"
                  placeholder={activeTab === 'checkin' 
                    ? "Nhập mã đặt chỗ (RES-...), biển số xe, hoặc ô đỗ..." 
                    : "Nhập mã vé đỗ (TICKET-...), biển số xe, hoặc ô đỗ..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-primary-600 hover:bg-primary-700 px-6 py-3 rounded-xl font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 text-sm"
                >
                  {loading ? 'Đang tìm...' : 'Tìm kiếm'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'checkin' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-400 text-sm uppercase tracking-wider">Danh sách đặt chỗ chờ vào bãi</h3>
              {searchResults.reservations.length === 0 ? (
                <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500">
                  <Car className="w-12 h-12 mx-auto mb-3 text-slate-700" />
                  <p className="text-sm">Nhập mã đặt chỗ ở thanh tìm kiếm phía trên để hiển thị thông tin Check-in.</p>
                </div>
              ) : (
                searchResults.reservations.map((res) => (
                  <div key={res.reservation_id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2.5 mb-2">
                        <span className="bg-slate-800 text-xs px-2.5 py-1 rounded-full font-mono text-slate-300 font-semibold border border-slate-700">{res.reservation_code}</span>
                        <span className="bg-yellow-500/10 text-yellow-500 text-[10px] px-2 py-0.5 rounded-full font-bold border border-yellow-500/20 uppercase">Chờ xe vào</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 mt-4 text-sm">
                        <div><span className="text-slate-400">Khách hàng:</span> <strong className="text-slate-200">{res.customer_name}</strong></div>
                        <div><span className="text-slate-400">Số điện thoại:</span> <span className="text-slate-300">{res.customer_phone}</span></div>
                        <div><span className="text-slate-400">Biển số:</span> <strong className="text-primary-400 font-mono">{res.license_plate}</strong></div>
                        <div><span className="text-slate-400">Loại xe:</span> <span className="capitalize text-slate-300">{res.vehicle_type === 'car' ? 'Ô tô' : 'Xe máy'}</span></div>
                        <div><span className="text-slate-400">Vị trí đỗ:</span> <strong className="text-emerald-400">{res.slot_code}</strong></div>
                        <div><span className="text-slate-400">Giờ đặt:</span> <span className="text-slate-300">{new Date(res.reservation_time).toLocaleString('vi-VN')}</span></div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleCheckIn(res)}
                      className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-colors text-sm"
                    >
                      <LogIn className="w-4 h-4" /> Xác nhận xe vào
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'checkout' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-400 text-sm uppercase tracking-wider">Danh sách lượt đỗ xe hoạt động</h3>
              {searchResults.activeSessions.length === 0 ? (
                <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500">
                  <Car className="w-12 h-12 mx-auto mb-3 text-slate-700" />
                  <p className="text-sm">Nhập biển số hoặc mã vé ở thanh tìm kiếm phía trên để hiển thị thông tin tính tiền.</p>
                </div>
              ) : (
                searchResults.activeSessions.map((session) => (
                  <div key={session.session_id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2.5 mb-2">
                        <span className="bg-slate-800 text-xs px-2.5 py-1 rounded-full font-mono text-slate-300 font-semibold border border-slate-700">{session.ticket_code}</span>
                        <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold border border-emerald-500/20 uppercase">Đang đỗ xe</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 mt-4 text-sm">
                        <div><span className="text-slate-400">Chủ xe:</span> <strong className="text-slate-200">{session.customer_name || 'Khách vãng lai'}</strong></div>
                        <div><span className="text-slate-400">Số điện thoại:</span> <span className="text-slate-300">{session.customer_phone || 'N/A'}</span></div>
                        <div><span className="text-slate-400">Biển số:</span> <strong className="text-primary-400 font-mono">{session.license_plate}</strong></div>
                        <div><span className="text-slate-400">Loại xe:</span> <span className="capitalize text-slate-300">{session.vehicle_type === 'car' ? 'Ô tô' : 'Xe máy'}</span></div>
                        <div><span className="text-slate-400">Vị trí đỗ:</span> <strong className="text-yellow-400">{session.slot_code}</strong></div>
                        <div><span className="text-slate-400">Giờ vào:</span> <span className="text-slate-300">{new Date(session.check_in_time).toLocaleString('vi-VN')}</span></div>
                      </div>
                    </div>
                    <button 
                      onClick={() => requestCheckoutInvoice(session)}
                      disabled={checkoutLoading}
                      className="w-full md:w-auto bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 transition-colors text-sm"
                    >
                      <LogOut className="w-4 h-4" /> Tính tiền & Cho ra
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-400 text-sm uppercase tracking-wider">Nhật ký ra vào hôm nay</h3>
                <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700">Tổng: {dailyLogs.length} lượt</span>
              </div>
              {logsLoading ? (
                <div className="p-12 text-center text-slate-500">Đang tải nhật ký...</div>
              ) : dailyLogs.length === 0 ? (
                <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-slate-700" />
                  <p className="text-sm">Chưa có lượt xe ra vào nào được ghi nhận trong hôm nay.</p>
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300 border-collapse">
                      <thead className="bg-slate-950 text-slate-400 text-xs uppercase font-semibold border-b border-slate-800">
                        <tr>
                          <th className="p-4">Mã Vé</th>
                          <th className="p-4">Biển Số / Loại</th>
                          <th className="p-4">Vị Trí</th>
                          <th className="p-4">Giờ Vào</th>
                          <th className="p-4">Giờ Ra</th>
                          <th className="p-4">Tổng Phí</th>
                          <th className="p-4">Trạng Thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {dailyLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="p-4 font-mono text-xs">{log.ticket_code}</td>
                            <td className="p-4">
                              <span className="font-semibold text-slate-100 block font-mono">{log.license_plate}</span>
                              <span className="text-xs text-slate-400 capitalize">{log.vehicle_type === 'car' ? 'Ô tô' : 'Xe máy'}</span>
                            </td>
                            <td className="p-4 font-bold text-slate-200">{log.slot_code}</td>
                            <td className="p-4 text-xs text-slate-400">
                              {new Date(log.check_in_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="p-4 text-xs text-slate-400">
                              {log.check_out_time 
                                ? new Date(log.check_out_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                                : '—'}
                            </td>
                            <td className="p-4 font-bold text-emerald-400">
                              {log.total_amount ? `${parseInt(log.total_amount).toLocaleString('vi-VN')}đ` : '—'}
                            </td>
                            <td className="p-4">
                              {log.status === 'active' ? (
                                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2.5 py-1 rounded-full font-bold border border-emerald-500/20 uppercase">Trong bãi</span>
                              ) : (
                                <span className="bg-slate-800 text-slate-400 text-[10px] px-2.5 py-1 rounded-full font-bold border border-slate-700 uppercase">Hoàn thành</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right column - Summary Cards */}
        <div className="space-y-6">
          
          {/* Quick guide card */}
          <div className="glass-morphism border border-slate-800 p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-indigo-950/40">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-indigo-400" />
              Hướng dẫn nhanh
            </h3>
            <ul className="space-y-3.5 text-sm text-slate-300">
              <li className="flex gap-2">
                <span className="w-5 h-5 bg-indigo-900/60 border border-indigo-700/50 rounded-full flex items-center justify-center text-xs font-bold text-indigo-200">1</span>
                <span>Tìm mã đặt chỗ hoặc biển số xe khi xe tới cổng.</span>
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 bg-indigo-900/60 border border-indigo-700/50 rounded-full flex items-center justify-center text-xs font-bold text-indigo-200">2</span>
                <span>Bấm <strong>Check-in</strong> để cập nhật vị trí sang trạng thái <strong>Đang đỗ xe</strong>.</span>
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 bg-indigo-900/60 border border-indigo-700/50 rounded-full flex items-center justify-center text-xs font-bold text-indigo-200">3</span>
                <span>Khi xe ra, tìm xe đỗ, bấm <strong>Check-out</strong>, hệ thống tự động tính tiền, thu tiền mặt ngoại tuyến và hoàn tất lượt đỗ.</span>
              </li>
            </ul>
          </div>

          {/* Quick Stats overview */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h3 className="font-bold mb-4 text-slate-400 text-sm uppercase tracking-wider">Trạng thái thời gian thực</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-sm">Vị trí xe máy</span>
                <span className="text-sm font-semibold text-primary-400">Tầng 1</span>
              </div>
              <div className="flex justify-between items-center p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-sm">Vị trí ô tô</span>
                <span className="text-sm font-semibold text-primary-400">Tầng 2</span>
              </div>
              <div className="flex justify-between items-center p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-sm">Phương thức trả</span>
                <span className="text-sm font-bold text-slate-200">Tiền mặt (Staff thu)</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Invoice Modal for Checkout */}
      {selectedSession && checkoutDetail && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative text-white">
            
            {/* Header */}
            <div className="bg-slate-950 p-6 border-b border-slate-850 flex justify-between items-center">
              <h3 className="text-lg font-bold flex items-center gap-2 text-rose-500">
                <LogOut className="w-5 h-5" />
                Hóa đơn thanh toán
              </h3>
              <button 
                onClick={() => {
                  setSelectedSession(null);
                  setCheckoutDetail(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="text-center">
                <div className="bg-rose-500/10 text-rose-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h4 className="text-2xl font-black text-rose-400">
                  {parseInt(checkoutDetail.total_amount.toString()).toLocaleString('vi-VN')} VNĐ
                </h4>
                <p className="text-xs text-slate-400 mt-1">Vui lòng thu tiền mặt từ tài xế</p>
              </div>

              <div className="border-t border-b border-slate-800 py-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Biển số xe:</span>
                  <strong className="font-mono text-slate-100">{selectedSession.license_plate}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Loại xe:</span>
                  <span className="capitalize text-slate-200">{selectedSession.vehicle_type === 'car' ? 'Ô tô' : 'Xe máy'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mã vị trí đỗ:</span>
                  <strong className="text-yellow-400">{selectedSession.slot_code}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Giờ vào bãi:</span>
                  <span className="text-slate-300">{new Date(selectedSession.check_in_time).toLocaleString('vi-VN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Giờ ra bãi:</span>
                  <span className="text-slate-300">{new Date().toLocaleString('vi-VN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tổng thời gian:</span>
                  <strong className="text-slate-100">{checkoutDetail.total_hours} giờ</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Đơn giá:</span>
                  <span className="text-slate-200">{parseInt(checkoutDetail.hourly_rate.toString()).toLocaleString('vi-VN')}đ / giờ</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setSelectedSession(null);
                    setCheckoutDetail(null);
                    if (activeTab === 'logs') fetchDailyLogs();
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-700 font-bold py-3 rounded-xl transition-all active:scale-95 text-sm"
                >
                  Đóng & Hoàn tất
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
