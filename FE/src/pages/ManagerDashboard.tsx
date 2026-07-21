import { useState, useEffect, useMemo } from 'react';
import { Settings, DollarSign, BarChart3, TrendingUp, RefreshCw, Car, Save } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import api from '../services/api';
import toast from 'react-hot-toast';

const CHART_COLORS = ['#007BFF', '#f59e0b', '#10b981', '#003366'];

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

  const translatePeriod = (period: string) => {
    switch (period) {
      case 'weekday_day': return 'Ngày thường - Ban ngày (06:00 - 22:00)';
      case 'weekday_night': return 'Ngày thường - Ban đêm (22:00 - 06:00)';
      case 'weekend_day': return 'Cuối tuần - Ban ngày (06:00 - 22:00)';
      case 'weekend_night': return 'Cuối tuần - Ban đêm (22:00 - 06:00)';
      default: return period;
    }
  };

  const monthlyChartData = useMemo(() => {
    if (!stats?.monthlyRevenue) return [];
    return stats.monthlyRevenue.map((item: { month: string; total: string }) => ({
      month: item.month,
      revenue: parseFloat(item.total),
    }));
  }, [stats]);

  const vehicleRevenueData = useMemo(() => {
    if (!stats?.revenueByVehicle) return [];
    return stats.revenueByVehicle.map((v: { vehicle_type: string; total: string }) => ({
      name: v.vehicle_type === 'car' ? 'Ô tô' : 'Xe máy',
      value: parseFloat(v.total),
    }));
  }, [stats]);

  const slotChartData = useMemo(() => {
    if (!stats?.slotStats) return [];
    const statusLabels: Record<string, string> = {
      available: 'Trống',
      occupied: 'Đang dùng',
      reserved: 'Đã đặt',
      maintenance: 'Bảo trì',
    };
    return stats.slotStats.map((s: { status: string; count: number }) => ({
      name: statusLabels[s.status] || s.status,
      value: s.count,
    }));
  }, [stats]);

  const formatCurrency = (value: number) =>
    `${value.toLocaleString('vi-VN')}đ`;

  return (
    <div className="min-h-screen bg-surface text-ink p-6 md:p-10">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-wide text-ink flex items-center gap-2">
            <BarChart3 className="text-primary-500 w-8 h-8" />
            Quản lý Bãi xe Dashboard
          </h1>
          <p className="text-sm text-ink-muted mt-1">Thay đổi dung lượng các tầng, cấu hình biểu giá đỗ xe và xem báo cáo tài chính.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              fetchFloors();
              fetchPricingRules();
              fetchStats();
              toast.success('Đã cập nhật dữ liệu mới nhất');
            }} 
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-100 text-ink-muted transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" /> Đồng bộ
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex gap-4 border-b border-slate-200 pb-px mb-8">
        <button 
          onClick={() => setActiveTab('stats')} 
          className={`flex items-center gap-2 pb-4 font-semibold text-sm transition-all border-b-2 px-2 ${activeTab === 'stats' ? 'border-primary-500 text-primary-500' : 'border-transparent text-ink-muted hover:text-ink'}`}
        >
          <BarChart3 className="w-4 h-4" /> Báo cáo thống kê
        </button>
        <button 
          onClick={() => setActiveTab('capacity')} 
          className={`flex items-center gap-2 pb-4 font-semibold text-sm transition-all border-b-2 px-2 ${activeTab === 'capacity' ? 'border-primary-500 text-primary-500' : 'border-transparent text-ink-muted hover:text-ink'}`}
        >
          <Settings className="w-4 h-4" /> Cấu hình ô đỗ (Slots)
        </button>
        <button 
          onClick={() => setActiveTab('pricing')} 
          className={`flex items-center gap-2 pb-4 font-semibold text-sm transition-all border-b-2 px-2 ${activeTab === 'pricing' ? 'border-primary-500 text-primary-500' : 'border-transparent text-ink-muted hover:text-ink'}`}
        >
          <DollarSign className="w-4 h-4" /> Cấu hình giá tiền
        </button>
      </div>

      {activeTab === 'stats' && (
        <div className="space-y-8">
          {statsLoading ? (
            <div className="p-12 text-center text-ink-muted">Đang phân tích dữ liệu thống kê...</div>
          ) : stats ? (
            <>
              {/* Stat Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-6 -mt-6 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl"></div>
                  <span className="text-ink-muted text-xs uppercase tracking-wider block font-semibold mb-1">Tổng doanh thu</span>
                  <strong className="text-3xl font-black text-emerald-600">
                    {parseInt(stats.totalRevenue).toLocaleString('vi-VN')}đ
                  </strong>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Thu qua Tiền mặt ngoại tuyến</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-6 -mt-6 w-16 h-16 bg-blue-500/10 rounded-full blur-xl"></div>
                  <span className="text-ink-muted text-xs uppercase tracking-wider block font-semibold mb-1">Lượt đỗ hoàn thành</span>
                  <strong className="text-3xl font-black text-primary-500">
                    {stats.checkinsCount} lượt
                  </strong>
                  <p className="text-xs text-ink-muted mt-2.5">Tổng số xe check-in thực tế</p>
                </div>

                <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-6 -mt-6 w-16 h-16 bg-purple-500/10 rounded-full blur-xl"></div>
                  <span className="text-ink-muted text-xs uppercase tracking-wider block font-semibold mb-1">Lượt đặt chỗ trước</span>
                  <strong className="text-3xl font-black text-purple-600">
                    {stats.reservationsCount} đơn
                  </strong>
                  <p className="text-xs text-ink-muted mt-2.5">Khách đặt chỗ trước qua website</p>
                </div>

                <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-6 -mt-6 w-16 h-16 bg-amber-500/10 rounded-full blur-xl"></div>
                  <span className="text-ink-muted text-xs uppercase tracking-wider block font-semibold mb-1">Vị trí đỗ đang dùng</span>
                  <strong className="text-3xl font-black text-amber-600">
                    {stats.slotStats.find((s: any) => s.status === 'occupied')?.count || 0} ô
                  </strong>
                  <p className="text-xs text-ink-muted mt-2.5">
                    Tổng số ô đỗ hiện có: {stats.slotStats.reduce((sum: number, item: any) => sum + item.count, 0)} ô
                  </p>
                </div>

              </div>

              {/* Data breakdowns with Recharts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Revenue by vehicle type - PieChart */}
                <div className="lg:col-span-1 bg-white border border-slate-200 shadow-sm p-6 rounded-2xl">
                  <h3 className="font-bold text-base mb-4 text-ink border-b border-slate-200 pb-3">Phân tích theo loại xe</h3>
                  {vehicleRevenueData.length === 0 ? (
                    <p className="text-sm text-ink-muted text-center py-12">Chưa có dữ liệu phân tích doanh thu.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={vehicleRevenueData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={90}
                          paddingAngle={4}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                        >
                          {vehicleRevenueData.map((_: unknown, index: number) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Monthly Revenue - BarChart */}
                <div className="lg:col-span-2 bg-white border border-slate-200 shadow-sm p-6 rounded-2xl">
                  <h3 className="font-bold text-base mb-4 text-ink border-b border-slate-200 pb-3 flex items-center justify-between">
                    <span>Doanh thu theo tháng</span>
                    <span className="text-xs text-primary-500">Recharts</span>
                  </h3>
                  {monthlyChartData.length === 0 ? (
                    <p className="text-sm text-ink-muted text-center py-12">Chưa có thống kê doanh thu tháng.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="month" stroke="#44474E" fontSize={12} />
                        <YAxis
                          stroke="#44474E"
                          fontSize={12}
                          tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
                        />
                        <Tooltip
                          formatter={(value) => formatCurrency(Number(value))}
                          contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                          labelStyle={{ color: '#1A1C1E' }}
                        />
                        <Bar dataKey="revenue" name="Doanh thu" fill="#007BFF" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

              </div>

              {/* Slot status chart */}
              {slotChartData.length > 0 && (
                <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl">
                  <h3 className="font-bold text-base mb-4 text-ink border-b border-slate-200 pb-3">Tình trạng ô đỗ</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={slotChartData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                      <XAxis type="number" stroke="#44474E" fontSize={12} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" stroke="#44474E" fontSize={12} width={80} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                      />
                      <Bar dataKey="value" name="Số ô" fill="#10b981" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-ink-muted py-12">Không có dữ liệu thống kê.</div>
          )}
        </div>
      )}

      {activeTab === 'capacity' && (
        <div className="max-w-3xl space-y-6">
          <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl">
            <h3 className="font-bold text-base mb-4 text-ink border-b border-slate-200 pb-3">
              Quản lý sức chứa tầng (Capacity)
            </h3>
            <p className="text-sm text-ink-muted mb-6">
              Bạn có thể điều chỉnh trực tiếp số lượng ô đỗ cho từng tầng. Khi tăng sức chứa, hệ thống tự động thêm các slot mới. Khi giảm sức chứa, hệ thống tự động xóa bớt các ô đỗ trống cao nhất.
            </p>
            <div className="space-y-6">
              {floors.map((floor) => (
                <div key={floor.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-slate-50 border border-slate-200 rounded-xl gap-4">
                  <div>
                    <h4 className="font-bold text-ink flex items-center gap-2">
                      <Car className="w-5 h-5 text-primary-500" />
                      {floor.floor_name}
                    </h4>
                    <p className="text-xs text-ink-muted mt-1 capitalize">
                      Loại xe phục vụ: {floor.vehicle_type === 'car' ? '🚗 Ô tô (Tầng 2)' : '🏍️ Xe máy (Tầng 1)'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="flex items-center">
                      <span className="text-xs text-ink-muted mr-2">Số slot:</span>
                      <input 
                        type="number"
                        min="1"
                        value={capacityInput[floor.id] || ''}
                        onChange={(e) => setCapacityInput({ ...capacityInput, [floor.id]: parseInt(e.target.value) })}
                        className="w-20 px-3 py-2 rounded-lg bg-white border border-slate-200 text-center font-bold text-ink text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
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
        <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl">
          <h3 className="font-bold text-base mb-6 text-ink border-b border-slate-200 pb-3">
            Cấu hình đơn giá theo giờ (Pricing rules)
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-ink border-collapse">
              <thead className="bg-slate-50 text-ink-muted text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-4">Phương tiện</th>
                  <th className="p-4">Khung thời gian</th>
                  <th className="p-4 text-center">Đơn giá hiện tại (đ/h)</th>
                  <th className="p-4 text-center">Thay đổi giá</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {pricingRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-ink flex items-center gap-2">
                      {rule.vehicle_type === 'car' ? '🚗 Ô tô' : '🏍️ Xe máy'}
                    </td>
                    <td className="p-4 text-ink-muted">{translatePeriod(rule.pricing_period)}</td>
                    <td className="p-4 font-black text-center text-primary-500 text-base">
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
                          className="w-28 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-right font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
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
