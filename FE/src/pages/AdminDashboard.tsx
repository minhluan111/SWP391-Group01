import { useState, useEffect, useMemo } from 'react';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import api from '../services/api';
import toast from 'react-hot-toast';
import { formatDateTime24 } from '../lib/dateTimeFormat';

const ROLE_COLORS: Record<string, string> = {
  Customer: '#6366f1',
  Staff: '#10b981',
  Manager: '#f59e0b',
  Admin: '#ef4444',
};

const ROLE_LABELS: Record<string, string> = {
  Customer: 'Khách hàng',
  Staff: 'Nhân viên',
  Manager: 'Quản lý',
  Admin: 'Admin',
};

interface AdminUser {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  role_name?: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.data);
    } catch {
      toast.error('Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, roleName: string) => {
    setActionLoading(userId);
    try {
      const response = await api.put(`/admin/users/${userId}/role`, { role_name: roleName });
      toast.success(response.data.message);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể đổi vai trò');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusToggle = async (userId: number, currentStatus: boolean) => {
    setActionLoading(userId);
    const newStatus = !currentStatus;
    try {
      const response = await api.put(`/admin/users/${userId}/status`, { is_active: newStatus });
      toast.success(response.data.message);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể thay đổi trạng thái tài khoản');
    } finally {
      setActionLoading(null);
    }
  };

  const roleChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    users.forEach((u) => {
      const role = u.role_name || 'Customer';
      counts[role] = (counts[role] || 0) + 1;
    });
    return Object.entries(counts).map(([role, count]) => ({
      name: ROLE_LABELS[role] || role,
      value: count,
      color: ROLE_COLORS[role] || '#94a3b8',
    }));
  }, [users]);

  const statusChartData = useMemo(() => [
    { name: 'Hoạt động', value: users.filter((u) => u.is_active).length, fill: '#10b981' },
    { name: 'Bị khóa', value: users.filter((u) => !u.is_active).length, fill: '#ef4444' },
  ], [users]);

  const registrationChartData = useMemo(() => {
    const monthCounts: Record<string, number> = {};
    users.forEach((u) => {
      const date = new Date(u.created_at);
      const key = `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
      monthCounts[key] = (monthCounts[key] || 0) + 1;
    });
    return Object.entries(monthCounts)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => {
        const [ma, ya] = a.month.split('/').map(Number);
        const [mb, yb] = b.month.split('/').map(Number);
        return ya !== yb ? ya - yb : ma - mb;
      });
  }, [users]);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-wide text-slate-100 flex items-center gap-2">
            <ShieldCheck className="text-primary-500 w-8 h-8" />
            Quản trị viên (Admin) Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">Quản lý danh sách tài khoản, khóa/mở khóa hoạt động và phân quyền quản trị.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchUsers} 
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-700 rounded-xl hover:bg-slate-800 text-slate-300 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" /> Làm mới danh sách
          </button>
        </div>
      </div>

      {/* Charts overview */}
      {!loading && users.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h3 className="font-bold text-sm text-slate-300 mb-4 border-b border-slate-800 pb-3">Phân bố vai trò</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={roleChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {roleChartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h3 className="font-bold text-sm text-slate-300 mb-4 border-b border-slate-800 pb-3">Trạng thái tài khoản</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                />
                <Bar dataKey="value" name="Số tài khoản" radius={[6, 6, 0, 0]}>
                  {statusChartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h3 className="font-bold text-sm text-slate-300 mb-4 border-b border-slate-800 pb-3">Đăng ký theo tháng</h3>
            {registrationChartData.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-16">Chưa có dữ liệu.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={registrationChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                  />
                  <Bar dataKey="count" name="Tài khoản mới" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-500">Đang tải danh sách người dùng...</div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center text-slate-500">Không có tài khoản nào được ghi nhận.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300 border-collapse">
              <thead className="bg-slate-950 text-slate-400 text-xs uppercase font-semibold border-b border-slate-850">
                <tr>
                  <th className="p-4">Họ Tên & Đăng ký</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Số điện thoại</th>
                  <th className="p-4 text-center">Vai Trò</th>
                  <th className="p-4 text-center">Trạng Thái</th>
                  <th className="p-4 text-center">Hành động khóa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/10 transition-colors">
                    <td className="p-4">
                      <span className="font-bold text-slate-100 block">{u.full_name}</span>
                      <span className="text-xs text-slate-500">
                        Đăng ký: {formatDateTime24(u.created_at)}
                      </span>
                    </td>
                    <td className="p-4 text-slate-200">{u.email}</td>
                    <td className="p-4 text-slate-300">{u.phone || '—'}</td>
                    <td className="p-4 text-center">
                      <select 
                        value={u.role_name || 'Customer'}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={actionLoading === u.id}
                        className="bg-slate-950 border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 font-semibold text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
                      >
                        <option value="Customer">Khách hàng</option>
                        <option value="Staff">Nhân viên</option>
                        <option value="Manager">Quản lý</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-4 text-center">
                      {u.is_active ? (
                        <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2.5 py-1 rounded-full font-bold border border-emerald-500/20">Hoạt động</span>
                      ) : (
                        <span className="bg-rose-500/10 text-rose-500 text-[10px] px-2.5 py-1 rounded-full font-bold border border-rose-500/20">Bị khóa</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleStatusToggle(u.id, u.is_active)}
                        disabled={actionLoading === u.id}
                        className={`font-semibold py-1.5 px-4 text-xs rounded-xl transition-all ${u.is_active 
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20' 
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'}`}
                      >
                        {u.is_active ? 'Khóa Tài Khoản' : 'Kích Hoạt Lại'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
