import { useState, useEffect } from 'react';
import { Settings, DollarSign, BarChart3, TrendingUp, ShieldAlert, Award, RefreshCw, Car, ChevronRight, Save } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState<'capacity' | 'pricing' | 'stats'>('stats');
  
  // Floor Capacity State
  const [floors, setFloors] = useState<any[]>([]);
  const [capacityInput, setCapacityInput] = useState<{ [key: number]: number }>({});
  const [capacityLoading, setCapacityLoading] = useState(false);

  // Pricing State
  const [pricingRules, setPricingRules] = useState<any[]>([]);
  const [pricingInput, setPricingInput] = useState<{ [key: number]: number }>({});
  const [pricingLoading, setPricingLoading] = useState(false);

  // Stats State
  const [stats, setStats] = useState<any | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    fetchFloors();
    fetchPricingRules();
    fetchStats();
  }, []);

  const fetchFloors = async () => {
    try {
      const response = await api.get('/manager/capacity');
      setFloors(response.data.data);
      const inputs: { [key: number]: number } = {};
      response.data.data.forEach((f: any) => {
        inputs[f.id] = f.slot_count;
      });
      setCapacityInput(inputs);
    } catch (error: any) {
      toast.error('Lỗi khi tải thông tin tầng');
    }
  };

  const fetchPricingRules = async () => {
    try {
      const response = await api.get('/manager/pricing');
      setPricingRules(response.data.data);
      const inputs: { [key: number]: number } = {};
      response.data.data.forEach((p: any) => {
        inputs[p.id] = p.hourly_rate;
      });
      setPricingInput(inputs);
    } catch (error: any) {
      toast.error('Lỗi khi tải bảng giá');
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const response = await api.get('/manager/statistics');
      setStats(response.data.data);
    } catch (error: any) {
      toast.error('Lỗi khi tải thống kê');
    } finally {
      setStatsLoading(false);
    }
  };

  const handleUpdateCapacity = async (floorId: number) => {
    const val = capacityInput[floorId];
    if (val === undefined || val <= 0) {
      toast.error('Vui lòng nhập số lượng slot hợp lệ');
      return;
    }

    setCapacityLoading(true);
    try {
      const response = await api.put(`/manager/floors/${floorId}/capacity`, { capacity: val });
      toast.success(response.data.message);
      fetchFloors();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Cập nhật dung lượng thất bại');
    } finally {
      setCapacityLoading(false);
    }
  };

  const handleUpdatePricing = async (ruleId: number) => {
    const val = pricingInput[ruleId];
    if (val === undefined || val < 0) {
      toast.error('Giá trị tiền không hợp lệ');
      return;
    }

    setPricingLoading(true);
    try {
      const response = await api.put(`/manager/pricing/${ruleId}`, { hourly_rate: val });
      toast.success(response.data.message);
      fetchPricingRules();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Cập nhật giá thất bại');
    } finally {
      setPricingLoading(false);
    }
  };

  // Helper translations
  const translatePeriod = (period: string) => {
    switch (period) {
      case 'weekday_day': return 'Ngày thường - Ban ngày (06:00 - 22:00)';
      case 'weekday_night': return 'Ngày thường - Ban đêm (22:00 - 06:00)';
      case 'weekend_day': return 'Cuối tuần - Ban ngày (06:00 - 22:00)';
      case 'weekend_night': return 'Cuối tuần - Ban đêm (22:00 - 06:00)';
      default: return period;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-wide text-slate-100 flex items-center gap-2">
            <BarChart3 className="text-primary-500 w-8 h-8" />
            Quản lý Bãi xe Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">Thay đổi dung lượng các tầng, cấu hình biểu giá đỗ xe và xem báo cáo tài chính.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              fetchFloors();
              fetchPricingRules();
              fetchStats();
              toast.success('Đã cập nhật dữ liệu mới nhất');
            }} 
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-700 rounded-xl hover:bg-slate-800 text-slate-300 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" /> Đồng bộ
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex gap-4 border-b border-slate-800 pb-px mb-8">
        <button 
          onClick={() => setActiveTab('stats')} 
          className={`flex items-center gap-2 pb-4 font-semibold text-sm transition-all border-b-2 px-2 ${activeTab === 'stats' ? 'border-primary-500 text-primary-500' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <BarChart3 className="w-4 h-4" /> Báo cáo thống kê
        </button>
        <button 
          onClick={() => setActiveTab('capacity')} 
          className={`flex items-center gap-2 pb-4 font-semibold text-sm transition-all border-b-2 px-2 ${activeTab === 'capacity' ? 'border-primary-500 text-primary-500' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <Settings className="w-4 h-4" /> Cấu hình ô đỗ (Slots)
        </button>
        <button 
          onClick={() => setActiveTab('pricing')} 
          className={`flex items-center gap-2 pb-4 font-semibold text-sm transition-all border-b-2 px-2 ${activeTab === 'pricing' ? 'border-primary-500 text-primary-500' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <DollarSign className="w-4 h-4" /> Cấu hình giá tiền
        </button>
      </div>

      {activeTab === 'stats' && (
        <div className="space-y-8">
          {statsLoading ? (
            <div className="p-12 text-center text-slate-500">Đang phân tích dữ liệu thống kê...</div>
          ) : stats ? (
            <>
              {/* Stat Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-6 -mt-6 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl"></div>
                  <span className="text-slate-400 text-xs uppercase tracking-wider block font-semibold mb-1">Tổng doanh thu</span>
                  <strong className="text-3xl font-black text-emerald-400">
                    {parseInt(stats.totalRevenue).toLocaleString('vi-VN')}đ
                  </strong>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-500 mt-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Thu qua Tiền mặt ngoại tuyến</span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-6 -mt-6 w-16 h-16 bg-blue-500/10 rounded-full blur-xl"></div>
                  <span className="text-slate-400 text-xs uppercase tracking-wider block font-semibold mb-1">Lượt đỗ hoàn thành</span>
                  <strong className="text-3xl font-black text-blue-400">
                    {stats.checkinsCount} lượt
                  </strong>
                  <p className="text-xs text-slate-500 mt-2.5">Tổng số xe check-in thực tế</p>
                </div>

                <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-6 -mt-6 w-16 h-16 bg-purple-500/10 rounded-full blur-xl"></div>
                  <span className="text-slate-400 text-xs uppercase tracking-wider block font-semibold mb-1">Lượt đặt chỗ trước</span>
                  <strong className="text-3xl font-black text-purple-400">
                    {stats.reservationsCount} đơn
                  </strong>
                  <p className="text-xs text-slate-500 mt-2.5">Khách đặt chỗ trước qua website</p>
                </div>

                <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-6 -mt-6 w-16 h-16 bg-amber-500/10 rounded-full blur-xl"></div>
                  <span className="text-slate-400 text-xs uppercase tracking-wider block font-semibold mb-1">Vị trí đỗ đang dùng</span>
                  <strong className="text-3xl font-black text-amber-400">
                    {stats.slotStats.find((s: any) => s.status === 'occupied')?.count || 0} ô
                  </strong>
                  <p className="text-xs text-slate-500 mt-2.5">
                    Tổng số ô đỗ hiện có: {stats.slotStats.reduce((sum: number, item: any) => sum + item.count, 0)} ô
                  </p>
                </div>

              </div>

              {/* Data breakdowns */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Revenue by vehicle type */}
                <div className="lg:col-span-1 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <h3 className="font-bold text-base mb-6 text-slate-200 border-b border-slate-800 pb-3">Phân tích theo loại xe</h3>
                  <div className="space-y-5">
                    {stats.revenueByVehicle.map((v: any) => {
                      const total = parseFloat(v.total);
                      const percent = stats.totalRevenue > 0 ? (total / stats.totalRevenue) * 100 : 0;
                      return (
                        <div key={v.vehicle_type} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize font-semibold text-slate-300">
                              {v.vehicle_type === 'car' ? '🚗 Ô tô' : '🏍️ Xe máy'}
                            </span>
                            <span className="font-bold text-slate-100">
                              {parseInt(v.total).toLocaleString('vi-VN')}đ ({percent.toFixed(0)}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-850">
                            <div 
                              className={`h-full rounded-full ${v.vehicle_type === 'car' ? 'bg-primary-500' : 'bg-amber-500'}`}
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                    {stats.revenueByVehicle.length === 0 && (
                      <p className="text-sm text-slate-500 text-center py-6">Chưa có dữ liệu phân tích doanh thu.</p>
                    )}
                  </div>
                </div>

                {/* Monthly Revenue chart list */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <h3 className="font-bold text-base mb-6 text-slate-200 border-b border-slate-800 pb-3 flex items-center justify-between">
                    <span>Doanh thu theo tháng</span>
                    <span className="text-xs text-primary-400">Hoạt động tài khóa</span>
                  </h3>
                  {stats.monthlyRevenue.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-12">Chưa có thống kê doanh thu tháng.</p>
                  ) : (
                    <div className="space-y-4">
                      {stats.monthlyRevenue.map((item: any) => {
                        const total = parseFloat(item.total);
                        const maxVal = Math.max(...stats.monthlyRevenue.map((m: any) => parseFloat(m.total))) || 1;
                        const barWidth = (total / maxVal) * 100;
                        return (
                          <div key={item.month} className="flex items-center gap-4 text-sm">
                            <span className="w-16 font-semibold text-slate-400">{item.month}</span>
                            <div className="flex-1 bg-slate-950 h-8 rounded-lg overflow-hidden border border-slate-850 flex items-center relative">
                              <div 
                                className="bg-gradient-to-r from-primary-600 to-indigo-500 h-full transition-all duration-500"
                                style={{ width: `${barWidth}%` }}
                              ></div>
                              <span className="absolute left-3 font-bold text-xs text-white">
                                {parseInt(item.total).toLocaleString('vi-VN')}đ
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            </>
          ) : (
            <div className="text-center text-slate-500 py-12">Không có dữ liệu thống kê.</div>
          )}
        </div>
      )}

      {activeTab === 'capacity' && (
        <div className="max-w-3xl space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h3 className="font-bold text-base mb-4 text-slate-200 border-b border-slate-800 pb-3">
              Quản lý sức chứa tầng (Capacity)
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              Bạn có thể điều chỉnh trực tiếp số lượng ô đỗ cho từng tầng. Khi tăng sức chứa, hệ thống tự động thêm các slot mới. Khi giảm sức chứa, hệ thống tự động xóa bớt các ô đỗ trống cao nhất.
            </p>
            <div className="space-y-6">
              {floors.map((floor) => (
                <div key={floor.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-slate-950 border border-slate-850 rounded-xl gap-4">
                  <div>
                    <h4 className="font-bold text-slate-100 flex items-center gap-2">
                      <Car className="w-5 h-5 text-indigo-400" />
                      {floor.floor_name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 capitalize">
                      Loại xe phục vụ: {floor.vehicle_type === 'car' ? '🚗 Ô tô (Tầng 2)' : '🏍️ Xe máy (Tầng 1)'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="flex items-center">
                      <span className="text-xs text-slate-400 mr-2">Số slot:</span>
                      <input 
                        type="number"
                        min="1"
                        value={capacityInput[floor.id] || ''}
                        onChange={(e) => setCapacityInput({ ...capacityInput, [floor.id]: parseInt(e.target.value) })}
                        className="w-20 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-center font-bold text-slate-100 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                      />
                    </div>
                    <button 
                      onClick={() => handleUpdateCapacity(floor.id)}
                      disabled={capacityLoading}
                      className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-1.5 transition-colors"
                    >
                      <Save className="w-4 h-4" /> Lưu
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pricing' && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h3 className="font-bold text-base mb-6 text-slate-200 border-b border-slate-800 pb-3">
            Cấu hình đơn giá theo giờ (Pricing rules)
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300 border-collapse">
              <thead className="bg-slate-950 text-slate-400 text-xs uppercase font-semibold border-b border-slate-850">
                <tr>
                  <th className="p-4">Phương tiện</th>
                  <th className="p-4">Khung thời gian</th>
                  <th className="p-4 text-center">Đơn giá hiện tại (đ/h)</th>
                  <th className="p-4 text-center">Thay đổi giá</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {pricingRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="p-4 font-bold text-slate-100 flex items-center gap-2">
                      {rule.vehicle_type === 'car' ? '🚗 Ô tô' : '🏍️ Xe máy'}
                    </td>
                    <td className="p-4 text-slate-300">{translatePeriod(rule.pricing_period)}</td>
                    <td className="p-4 font-black text-center text-primary-400 text-base">
                      {parseInt(rule.hourly_rate).toLocaleString('vi-VN')} VNĐ
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <input 
                          type="number"
                          step="1000"
                          min="0"
                          value={pricingInput[rule.id] !== undefined ? pricingInput[rule.id] : ''}
                          onChange={(e) => setPricingInput({ ...pricingInput, [rule.id]: parseFloat(e.target.value) })}
                          className="w-28 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-right font-bold text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        />
                        <button 
                          onClick={() => handleUpdatePricing(rule.id)}
                          disabled={pricingLoading}
                          className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold p-2 rounded-lg transition-colors"
                          title="Lưu thay đổi giá"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
