import { useState, useEffect } from 'react';
import { ShieldCheck, UserCog, UserMinus, ShieldAlert, Trash2, KeyRound, RefreshCw, UserCheck, Shield } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null); // tracks user ID being updated

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.data);
    } catch (error: any) {
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

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10">
      
      {/* Header section */}
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

      {/* Main user table */}
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
                        Đăng ký: {new Date(u.created_at).toLocaleDateString('vi-VN')}
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
