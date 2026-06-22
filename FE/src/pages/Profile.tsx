import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Car, Plus, Trash2, Clock, Calendar, Edit2, Check, X, Phone, QrCode, Lock, LayoutDashboard } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import {
  profileSchema,
  changePasswordSchema,
  vehicleSchema,
  type ProfileFormData,
  type ChangePasswordFormData,
  type VehicleFormData,
} from '../schemas/auth';
import FormFieldError from '../components/ui/FormFieldError';

interface Vehicle {
  id: number;
  license_plate: string;
  vehicle_type: string;
}

interface Reservation {
  id: number;
  reservation_code: string;
  reservation_time: string;
  expected_checkout_time: string;
  status: string;
  license_plate: string;
  vehicle_type: string;
  slot_code: string;
  check_in_time?: string;
  check_out_time?: string;
  total_amount?: number;
  payment_status?: string;
  payment_method?: string;
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  
  // Profile state
  const [editProfileMode, setEditProfileMode] = useState(false);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: '', phone: '' },
  });

  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { old_password: '', new_password: '', confirm_new_password: '' },
  });

  const vehicleForm = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: { license_plate: '', vehicle_type: 'car' },
  });

  // Vehicles state
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  
  // Edit vehicle state
  const [editingVehicleId, setEditingVehicleId] = useState<number | null>(null);
  const [editPlate, setEditPlate] = useState('');
  const [editVehicleType, setEditVehicleType] = useState('car');

  // Reservations state
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(true);

  useEffect(() => {
    if (user) {
      fetchVehicles();
      fetchReservations();
      fetchProfile();
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      if (response.data.success) {
        updateUser(response.data.user);
        profileForm.reset({
          full_name: response.data.user.full_name,
          phone: response.data.user.phone || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile', error);
    }
  };

  const onSaveProfile = async (data: ProfileFormData) => {
    try {
      const response = await api.put('/auth/profile', data);
      if (response.data.success) {
        updateUser(response.data.user);
        toast.success('Cập nhật hồ sơ thành công');
        setEditProfileMode(false);
      }
    } catch {
      toast.error('Lỗi khi cập nhật hồ sơ');
    }
  };

  const onChangePassword = async (data: ChangePasswordFormData) => {
    try {
      const response = await api.put('/auth/change-password', {
        old_password: data.old_password,
        new_password: data.new_password,
      });
      if (response.data.success) {
        toast.success('Đổi mật khẩu thành công!');
        passwordForm.reset();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi đổi mật khẩu');
    }
  };

  const openEditProfile = () => {
    if (user) {
      profileForm.reset({ full_name: user.full_name, phone: user.phone || '' });
    }
    setEditProfileMode(true);
  };

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/vehicles');
      if (response.data.success) {
        setVehicles(response.data.data);
      }
    } catch (error) {
      toast.error('Không thể tải danh sách phương tiện');
    } finally {
      setLoadingVehicles(false);
    }
  };

  const fetchReservations = async () => {
    try {
      const response = await api.get('/reservations/my-reservations');
      if (response.data.success) {
        setReservations(response.data.data);
      }
    } catch (error) {
      toast.error('Không thể tải danh sách đặt chỗ');
    } finally {
      setLoadingReservations(false);
    }
  };

  const onAddVehicle = async (data: VehicleFormData) => {
    try {
      await api.post('/vehicles', data);
      toast.success('Thêm phương tiện thành công');
      vehicleForm.reset({ license_plate: '', vehicle_type: 'car' });
      setShowAddVehicle(false);
      fetchVehicles();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi thêm xe');
    }
  };

  const handleDeleteVehicle = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phương tiện này?')) return;
    
    try {
      await api.delete(`/vehicles/${id}`);
      toast.success('Đã xóa phương tiện');
      fetchVehicles();
    } catch (error) {
      toast.error('Lỗi khi xóa xe');
    }
  };

  const handleEditVehicle = (v: Vehicle) => {
    setEditingVehicleId(v.id);
    setEditPlate(v.license_plate);
    setEditVehicleType(v.vehicle_type);
  };

  const handleSaveVehicle = async (id: number) => {
    const parsed = vehicleSchema.safeParse({
      license_plate: editPlate,
      vehicle_type: editVehicleType as 'car' | 'motorbike',
    });
    if (!parsed.success) {
      return toast.error(parsed.error.issues[0]?.message || 'Dữ liệu không hợp lệ');
    }
    try {
      await api.put(`/vehicles/${id}`, { license_plate: editPlate, vehicle_type: editVehicleType });
      toast.success('Cập nhật phương tiện thành công');
      setEditingVehicleId(null);
      fetchVehicles();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật xe');
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'checked_in': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'expired': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'cancelled': return 'bg-slate-800 text-slate-400 border-slate-700';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'pending': return 'Đang chờ';
      case 'checked_in': return 'Đã vào bãi';
      case 'expired': return 'Hết hạn';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  if (!user) {
    return <div className="text-center py-20 bg-slate-950 text-white min-h-screen">Vui lòng đăng nhập để xem hồ sơ.</div>;
  }

  // Find the active booking (status === 'pending') to generate ticket card
  const activeReservation = reservations.find(r => r.status === 'pending');

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10 font-sans">
      <h1 className="text-3xl font-extrabold tracking-wide text-slate-100 mb-8 flex items-center gap-2">
        <User className="text-primary-500 w-8 h-8" />
        Hồ sơ cá nhân
      </h1>
      
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Profile Info & Vehicles */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Profile Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden relative shadow-lg">
            {!editProfileMode && (
              <button 
                onClick={openEditProfile}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors bg-slate-950/60 p-2 rounded-xl border border-slate-850"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            
            <div className="bg-slate-950 px-6 py-8 flex flex-col items-center justify-center text-center border-b border-slate-850">
              <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-primary-500/25 mb-4 border border-primary-400/20">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100">{user.full_name}</h2>
                <div className="flex items-center justify-center gap-1.5 text-slate-400 mt-1.5 text-sm">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{user.email}</span>
                </div>
                <div className="inline-block mt-3 px-3 py-1 rounded-full bg-primary-500/10 text-primary-400 text-xs font-semibold uppercase tracking-wider border border-primary-500/20">
                  {user.role === 'Admin' ? 'Quản trị viên' : user.role === 'Manager' ? 'Quản lý' : user.role === 'Staff' ? 'Nhân viên' : 'Khách hàng'}
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {editProfileMode ? (
                <form className="space-y-4" onSubmit={profileForm.handleSubmit(onSaveProfile)} noValidate>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Họ và tên</label>
                    <input
                      type="text"
                      className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary-500 ${
                        profileForm.formState.errors.full_name ? 'border-red-400' : 'border-slate-800'
                      }`}
                      {...profileForm.register('full_name')}
                    />
                    <FormFieldError message={profileForm.formState.errors.full_name?.message} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Số điện thoại</label>
                    <input
                      type="text"
                      className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary-500 ${
                        profileForm.formState.errors.phone ? 'border-red-400' : 'border-slate-800'
                      }`}
                      {...profileForm.register('phone')}
                    />
                    <FormFieldError message={profileForm.formState.errors.phone?.message} />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={profileForm.formState.isSubmitting}
                      className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg text-sm font-bold active:scale-95 transition-all disabled:opacity-50"
                    >
                      Lưu
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditProfileMode(false);
                        if (user) {
                          profileForm.reset({ full_name: user.full_name, phone: user.phone || '' });
                        }
                      }}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-sm font-bold transition-all"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 text-sm text-slate-300">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-slate-500" /> 
                    <span className="font-semibold">{user.full_name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-slate-500" /> 
                    <span>{user.phone || 'Chưa cập nhật SĐT'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-emerald-500" /> 
                    <span className="text-emerald-400 font-semibold">Tài khoản bảo mật</span>
                  </div>

                  {/* Role Specific Actions List */}
                  <div className="mt-6 pt-6 border-t border-slate-800/60 space-y-3.5 text-left">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Quyền hạn & Chức năng</p>
                    <ul className="space-y-2.5">
                      {user.role === 'Customer' && (
                        <>
                          <li className="flex items-start gap-2 text-xs">
                            <span className="text-primary-500 font-bold">✓</span>
                            <span>Đăng ký thông tin phương tiện đỗ</span>
                          </li>
                          <li className="flex items-start gap-2 text-xs">
                            <span className="text-primary-500 font-bold">✓</span>
                            <span>Đặt trước chỗ trống & chọn thời gian</span>
                          </li>
                          <li className="flex items-start gap-2 text-xs">
                            <span className="text-primary-500 font-bold">✓</span>
                            <span>Hiển thị thẻ vé QR Code động khi vào bãi</span>
                          </li>
                          <li className="flex items-start gap-2 text-xs">
                            <span className="text-primary-500 font-bold">✓</span>
                            <span>Xem lịch sử đỗ xe & hóa đơn đã thanh toán</span>
                          </li>
                        </>
                      )}
                      {user.role === 'Staff' && (
                        <>
                          <li className="flex items-start gap-2 text-xs">
                            <span className="text-primary-500 font-bold">✓</span>
                            <span>Check-in xe vào bãi bằng mã QR / biển số</span>
                          </li>
                          <li className="flex items-start gap-2 text-xs">
                            <span className="text-primary-500 font-bold">✓</span>
                            <span>Check-out xe ra & tính tiền đỗ xe động</span>
                          </li>
                          <li className="flex items-start gap-2 text-xs">
                            <span className="text-primary-500 font-bold">✓</span>
                            <span>Xác nhận thu tiền mặt ngoại tuyến</span>
                          </li>
                          <li className="flex items-start gap-2 text-xs">
                            <span className="text-primary-500 font-bold">✓</span>
                            <span>Ghi chép & theo dõi nhật ký xe ra vào</span>
                          </li>
                        </>
                      )}
                      {user.role === 'Manager' && (
                        <>
                          <li className="flex items-start gap-2 text-xs">
                            <span className="text-primary-500 font-bold">✓</span>
                            <span>Xem thống kê doanh thu & biểu đồ tần suất</span>
                          </li>
                          <li className="flex items-start gap-2 text-xs">
                            <span className="text-primary-500 font-bold">✓</span>
                            <span>Cấu hình số lượng slot của từng tầng đỗ</span>
                          </li>
                          <li className="flex items-start gap-2 text-xs">
                            <span className="text-primary-500 font-bold">✓</span>
                            <span>Điều chỉnh đơn giá theo khung giờ</span>
                          </li>
                        </>
                      )}
                      {user.role === 'Admin' && (
                        <>
                          <li className="flex items-start gap-2 text-xs">
                            <span className="text-primary-500 font-bold">✓</span>
                            <span>Quản lý danh sách tài khoản người dùng</span>
                          </li>
                          <li className="flex items-start gap-2 text-xs">
                            <span className="text-primary-500 font-bold">✓</span>
                            <span>Khóa/mở khóa hoạt động của tài khoản</span>
                          </li>
                          <li className="flex items-start gap-2 text-xs">
                            <span className="text-primary-500 font-bold">✓</span>
                            <span>Phân quyền vai trò người dùng trong hệ thống</span>
                          </li>
                        </>
                      )}
                    </ul>

                    {/* Role dashboard quick links */}
                    {user.role !== 'Customer' && (
                      <div className="pt-3">
                        <Link 
                          to={user.role === 'Admin' ? '/admin' : user.role === 'Manager' ? '/manager' : '/staff'}
                          className="w-full inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white py-2  rounded-xl text-xs font-bold transition-all text-center shadow-md shadow-primary-500/10 active:scale-95"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5" /> 
                          Đi đến Dashboard {user.role === 'Admin' ? 'Admin' : user.role === 'Manager' ? 'Quản lý' : 'Nhân viên'}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Change Password Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-primary-500" /> Đổi mật khẩu
            </h3>
            <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4" noValidate>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Mật khẩu cũ</label>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu hiện tại"
                  className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary-500 ${
                    passwordForm.formState.errors.old_password ? 'border-red-400' : 'border-slate-800'
                  }`}
                  {...passwordForm.register('old_password')}
                />
                <FormFieldError message={passwordForm.formState.errors.old_password?.message} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Mật khẩu mới</label>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu mới"
                  className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary-500 ${
                    passwordForm.formState.errors.new_password ? 'border-red-400' : 'border-slate-800'
                  }`}
                  {...passwordForm.register('new_password')}
                />
                <FormFieldError message={passwordForm.formState.errors.new_password?.message} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  placeholder="Nhập lại mật khẩu mới"
                  className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary-500 ${
                    passwordForm.formState.errors.confirm_new_password ? 'border-red-400' : 'border-slate-800'
                  }`}
                  {...passwordForm.register('confirm_new_password')}
                />
                <FormFieldError message={passwordForm.formState.errors.confirm_new_password?.message} />
              </div>
              <button
                type="submit"
                disabled={passwordForm.formState.isSubmitting}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50 active:scale-95"
              >
                {passwordForm.formState.isSubmitting ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
              </button>
            </form>
          </div>

          {/* Vehicles Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <Car className="w-5 h-5 text-primary-500" /> Phương tiện đỗ
              </h3>
              {!showAddVehicle && (
                <button 
                  onClick={() => setShowAddVehicle(true)}
                  className="text-xs text-primary-400 font-bold hover:text-primary-300 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Đăng ký xe
                </button>
              )}
            </div>

            {showAddVehicle && (
              <form onSubmit={vehicleForm.handleSubmit(onAddVehicle)} className="mb-4 p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3.5" noValidate>
                <div>
                  <input
                    type="text"
                    placeholder="Biển số (VD: 29A-123.45)"
                    className={`w-full px-3 py-2 bg-slate-900 border rounded-lg text-sm text-white focus:outline-none ${
                      vehicleForm.formState.errors.license_plate ? 'border-red-400' : 'border-slate-850'
                    }`}
                    {...vehicleForm.register('license_plate')}
                  />
                  <FormFieldError message={vehicleForm.formState.errors.license_plate?.message} />
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="radio"
                      value="car"
                      className="text-primary-600 bg-slate-900 border-slate-850 focus:ring-0"
                      {...vehicleForm.register('vehicle_type')}
                    /> 🚗 Ô tô
                  </label>
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="radio"
                      value="motorbike"
                      className="text-primary-600 bg-slate-900 border-slate-850 focus:ring-0"
                      {...vehicleForm.register('vehicle_type')}
                    /> 🏍️ Xe máy
                  </label>
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={vehicleForm.formState.isSubmitting} className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50">Lưu lại</button>
                  <button type="button" onClick={() => { setShowAddVehicle(false); vehicleForm.reset(); }} className="flex-1 bg-slate-800 text-slate-400 py-2 rounded-lg text-xs font-bold transition-all">Hủy</button>
                </div>
              </form>
            )}
            
            {loadingVehicles ? (
              <p className="text-slate-500 text-sm">Đang tải danh sách...</p>
            ) : vehicles.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">Chưa có phương tiện đăng ký.</p>
            ) : (
              <ul className="space-y-3">
                {vehicles.map((v) => (
                  <li key={v.id} className="p-3.5 rounded-xl border border-slate-850 bg-slate-950/60">
                    {editingVehicleId === v.id ? (
                      <div className="space-y-3">
                        <input 
                          type="text" 
                          value={editPlate} 
                          onChange={(e) => setEditPlate(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none"
                        />
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <input type="radio" name={`edit_type_${v.id}`} value="car" checked={editVehicleType === 'car'} onChange={(e) => setEditVehicleType(e.target.value)} className="text-primary-600" /> Ô tô
                          </label>
                          <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <input type="radio" name={`edit_type_${v.id}`} value="motorbike" checked={editVehicleType === 'motorbike'} onChange={(e) => setEditVehicleType(e.target.value)} className="text-primary-600" /> Xe máy
                          </label>
                        </div>
                        <div className="flex justify-end gap-2 mt-2 border-t border-slate-800 pt-2">
                          <button onClick={() => setEditingVehicleId(null)} className="p-1 text-slate-500 hover:text-slate-300"><X className="w-4 h-4" /></button>
                          <button onClick={() => handleSaveVehicle(v.id)} className="p-1 text-green-500 hover:text-green-400"><Check className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${v.vehicle_type === 'car' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'}`}>
                            <Car className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-100 text-sm font-mono">{v.license_plate}</p>
                            <p className="text-xs text-slate-400 capitalize">{v.vehicle_type === 'car' ? 'Ô tô' : 'Xe máy'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => handleEditVehicle(v)} className="text-slate-500 hover:text-primary-400 p-1" title="Sửa thông tin">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteVehicle(v.id)} className="text-slate-500 hover:text-rose-500 p-1" title="Xóa xe">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right Column: Ticket / Active Booking and Reservations history */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Booking Ticket Card (User Current Booking Details) */}
          {activeReservation && (
            <div className="glass-morphism border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative bg-gradient-to-r from-slate-900 to-indigo-950/20">
              
              <div className="absolute top-0 right-0 -mr-12 -mt-12 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl pointer-events-none"></div>

              <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-2 text-primary-400 font-bold text-xs uppercase tracking-wider">
                    <QrCode className="w-4 h-4" />
                    <span>Mã vé đỗ xe hiện tại của bạn</span>
                  </div>
                  
                  <div>
                    <h3 className="text-3xl font-black text-slate-100 tracking-tight font-mono">
                      {activeReservation.reservation_code}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Đăng ký vào lúc: {new Date(activeReservation.reservation_time).toLocaleString('vi-VN')}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 text-sm">
                    <div>
                      <span className="text-slate-500 block text-xs uppercase font-semibold">VỊ TRÍ ĐỖ</span>
                      <strong className="text-emerald-400 text-lg font-bold">{activeReservation.slot_code}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs uppercase font-semibold">TẦNG ĐỖ</span>
                      <strong className="text-slate-200 text-lg font-bold">
                        {activeReservation.slot_code.startsWith('B') ? 'Tầng 1 - Xe máy' : 'Tầng 2 - Ô tô'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs uppercase font-semibold">BIỂN SỐ XE</span>
                      <strong className="font-mono text-slate-200 text-lg font-bold">{activeReservation.license_plate}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs uppercase font-semibold">LOẠI XE</span>
                      <span className="capitalize text-slate-300 font-bold">{activeReservation.vehicle_type === 'car' ? 'Ô tô' : 'Xe máy'}</span>
                    </div>
                  </div>
                </div>

                {/* QR Code container */}
                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-lg border border-slate-200 flex-shrink-0">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(activeReservation.reservation_code)}`} 
                    alt="Booking QR Code" 
                    className="w-36 h-36"
                  />
                  <span className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-wider">ĐƯA STAFF QUÉT KHI VÀO</span>
                </div>
              </div>

              {/* Decorative cutouts for ticket card */}
              <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-slate-950 rounded-full border-r border-slate-800"></div>
              <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-6 bg-slate-950 rounded-full border-l border-slate-800"></div>
            </div>
          )}

          {/* History Reservations Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-primary-500" /> Nhật ký đặt chỗ
            </h3>

            {loadingReservations ? (
              <div className="text-center py-12 text-slate-500">Đang tải lịch sử đặt chỗ...</div>
            ) : reservations.length === 0 ? (
              <div className="text-center py-16 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
                <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 font-medium">Bạn chưa thực hiện lượt đặt chỗ nào.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase font-semibold">
                      <th className="pb-3 font-semibold">Mã vé đỗ</th>
                      <th className="pb-3 font-semibold">Vị trí</th>
                      <th className="pb-3 font-semibold">Thông tin xe</th>
                      <th className="pb-3 font-semibold">Thời gian đặt & thực tế</th>
                      <th className="pb-3 font-semibold">Thanh toán</th>
                      <th className="pb-3 font-semibold">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {reservations.map((res) => (
                      <tr key={res.id} className="hover:bg-slate-800/10 transition-colors">
                        <td className="py-4 font-mono text-slate-200">{res.reservation_code}</td>
                        <td className="py-4">
                          <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-lg font-bold font-mono">
                            {res.slot_code}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className="font-bold text-slate-100 block font-mono">{res.license_plate}</span>
                          <span className="text-xs text-slate-400 capitalize">{res.vehicle_type === 'car' ? 'Ô tô' : 'Xe máy'}</span>
                        </td>
                        <td className="py-4 text-xs text-slate-300 space-y-1">
                          <div>
                            <span className="text-slate-500">Đặt: </span> 
                            {new Date(res.reservation_time).toLocaleString('vi-VN')}
                          </div>
                          {res.expected_checkout_time && (
                            <div>
                              <span className="text-slate-500">Dự kiến ra: </span> 
                              {new Date(res.expected_checkout_time).toLocaleString('vi-VN')}
                            </div>
                          )}
                          {res.check_in_time && (
                            <div className="text-blue-400">
                              <span className="text-slate-500">Vào bãi: </span> 
                              {new Date(res.check_in_time).toLocaleString('vi-VN')}
                            </div>
                          )}
                          {res.check_out_time && (
                            <div className="text-emerald-400">
                              <span className="text-slate-500">Ra bãi: </span> 
                              {new Date(res.check_out_time).toLocaleString('vi-VN')}
                            </div>
                          )}
                        </td>
                        <td className="py-4 text-xs text-slate-300">
                          {res.total_amount !== undefined && res.total_amount !== null ? (
                            <div className="space-y-1">
                              <div className="font-bold text-slate-100">{Number(res.total_amount).toLocaleString('vi-VN')}đ</div>
                              <div className="text-[9px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <span className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 uppercase font-semibold">
                                  {res.payment_method === 'cash' ? 'Tiền mặt' : 'Online'}
                                </span>
                                <span className={`px-1.5 py-0.5 rounded font-semibold ${res.payment_status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                                  {res.payment_status === 'paid' ? 'Đã trả' : 'Chưa trả'}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>
                        <td className="py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(res.status)}`}>
                            {getStatusText(res.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
