import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Plus, Trash2, Clock, Calendar, Edit2, Check, X, Phone, QrCode, Ticket, Lock, LayoutDashboard, Search, RotateCcw } from 'lucide-react';
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
import PasswordInput from '../components/ui/PasswordInput';
import PasswordStrengthBar from '../components/ui/PasswordStrengthBar';
import PasswordMatchIndicator from '../components/ui/PasswordMatchIndicator';
import { VehicleTypeIcon, VehiclesSectionIcon } from '../components/ui/VehicleTypeIcon';
import ReservationTicketModal from '../components/profile/ReservationTicketModal';
import ListPagination from '../components/ui/ListPagination';
import { formatDateTime24 } from '../lib/dateTimeFormat';
import { paginateList } from '../lib/pagination';
import {
  countInLotReservations,
  countPendingReservations,
  filterReservations,
  getDisplayTicketCode,
  getReservationBannerContent,
  getStatusColor,
  getStatusText,
  getTicketGlassClass,
  RESERVATION_BANNER_SUFFIX,
  shouldShowTicketQr,
  type StatusFilter,
  type TimePreset,
  type VehicleFilter,
} from '../lib/reservationUtils';

interface Vehicle {
  id: number;
  license_plate: string;
  vehicle_type: string;
}

interface Reservation {
  id: number;
  reservation_code: string;
  ticket_code?: string;
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
  is_walkin_history?: number;
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

  const newPasswordValue = passwordForm.watch('new_password');
  const confirmNewPasswordValue = passwordForm.watch('confirm_new_password');

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
  const [editPlateError, setEditPlateError] = useState('');
  const [editVehicleType, setEditVehicleType] = useState('car');

  // Reservations state
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Reservation | null>(null);

  // Reservation filters
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState<VehicleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [timePreset, setTimePreset] = useState<TimePreset>('all');
  const [reservationPage, setReservationPage] = useState(1);

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
    setEditPlateError('');
    setEditVehicleType(v.vehicle_type);
  };

  const handleSaveVehicle = async (id: number) => {
    const parsed = vehicleSchema.safeParse({
      license_plate: editPlate,
      vehicle_type: editVehicleType as 'car' | 'motorbike',
    });
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || 'Dữ liệu không hợp lệ';
      setEditPlateError(message);
      return toast.error(message);
    }
    setEditPlateError('');
    try {
      await api.put(`/vehicles/${id}`, {
        license_plate: parsed.data.license_plate,
        vehicle_type: parsed.data.vehicle_type,
      });
      toast.success('Cập nhật phương tiện thành công');
      setEditingVehicleId(null);
      fetchVehicles();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật xe');
    }
  };

  const pendingCount = useMemo(() => countPendingReservations(reservations), [reservations]);

  const inLotCount = useMemo(() => countInLotReservations(reservations), [reservations]);

  const bannerContent = useMemo(
    () => getReservationBannerContent(pendingCount, inLotCount),
    [pendingCount, inLotCount],
  );

  const filteredReservations = useMemo(
    () =>
      filterReservations(reservations, {
        searchQuery,
        vehicleFilter,
        statusFilter,
        timePreset,
      }),
    [reservations, searchQuery, vehicleFilter, statusFilter, timePreset],
  );

  const reservationPagination = useMemo(
    () => paginateList(filteredReservations, reservationPage),
    [filteredReservations, reservationPage],
  );

  useEffect(() => {
    setReservationPage(1);
  }, [searchQuery, vehicleFilter, statusFilter, timePreset, reservations.length]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    vehicleFilter !== 'all' ||
    statusFilter !== 'all' ||
    timePreset !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setVehicleFilter('all');
    setStatusFilter('all');
    setTimePreset('all');
  };

  const filterChipClass = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
      active
        ? 'border-primary-500 bg-primary-500 text-white shadow-sm shadow-primary-500/25'
        : 'border-slate-200 bg-white text-ink-muted hover:text-primary-600 hover:border-primary-300'
    }`;

  if (!user) {
    return <div className="text-center py-20 bg-surface text-ink min-h-screen">Vui lòng đăng nhập để xem hồ sơ.</div>;
  }

  return (
    <div className="min-h-screen bg-surface text-ink p-6 md:p-10 font-sans">
      <ReservationTicketModal
        reservation={selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onCancelled={fetchReservations}
      />
      <h1 className="text-3xl font-extrabold tracking-wide text-brand-navy mb-8 flex items-center gap-2">
        <User className="text-primary-500 w-8 h-8" />
        Hồ sơ cá nhân
      </h1>
      
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Profile Info & Vehicles */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Profile Card */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden relative shadow-sm">
            <div className="h-2 bg-gradient-to-r from-[#003366] to-primary-500" />
            {!editProfileMode && (
              <button 
                onClick={openEditProfile}
                className="absolute top-4 right-4 text-ink-muted hover:text-primary-500 transition-colors bg-white p-2 rounded-xl border border-slate-200 shadow-sm z-10"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            
            <div className="bg-gradient-to-b from-primary-50 to-white px-6 py-8 flex flex-col items-center justify-center text-center border-b border-slate-200">
              <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-primary-500/30 mb-4 border-4 border-white">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-brand-navy">{user.full_name}</h2>
                <div className="flex items-center justify-center gap-1.5 text-ink-muted mt-1.5 text-sm">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{user.email}</span>
                </div>
                <div className="inline-block mt-3 px-3 py-1 rounded-full bg-primary-500 text-white text-xs font-semibold uppercase tracking-wider shadow-sm">
                  {user.role === 'Admin' ? 'Quản trị viên' : user.role === 'Manager' ? 'Quản lý' : user.role === 'Staff' ? 'Nhân viên' : 'Khách hàng'}
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {editProfileMode ? (
                <form className="space-y-4" onSubmit={profileForm.handleSubmit(onSaveProfile)} noValidate>
                  <div>
                    <label className="block text-xs font-semibold text-ink-muted uppercase mb-1.5">Họ và tên</label>
                    <input
                      type="text"
                      className={`w-full px-3 py-2 bg-white border rounded-lg text-sm text-ink focus:outline-none focus:ring-1 focus:ring-primary-500 ${
                        profileForm.formState.errors.full_name ? 'border-red-400' : 'border-slate-200'
                      }`}
                      {...profileForm.register('full_name')}
                    />
                    <FormFieldError message={profileForm.formState.errors.full_name?.message} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink-muted uppercase mb-1.5">Số điện thoại</label>
                    <input
                      type="text"
                      className={`w-full px-3 py-2 bg-white border rounded-lg text-sm text-ink focus:outline-none focus:ring-1 focus:ring-primary-500 ${
                        profileForm.formState.errors.phone ? 'border-red-400' : 'border-slate-200'
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
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-ink-muted py-2 rounded-lg text-sm font-bold transition-all"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 text-sm text-ink">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-ink-muted" /> 
                    <span className="font-semibold">{user.full_name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-ink-muted" /> 
                    <span>{user.phone || 'Chưa cập nhật SĐT'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-emerald-500" /> 
                    <span className="text-emerald-600 font-semibold">Tài khoản bảo mật</span>
                  </div>

                  {/* Role Specific Actions List */}
                  <div className="mt-6 pt-6 border-t border-slate-200 space-y-3.5 text-left">
                    <p className="text-[10px] text-ink-muted font-bold uppercase tracking-wider">Quyền hạn & Chức năng</p>
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
                          className="w-full inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-xl text-xs font-bold transition-all text-center shadow-md shadow-primary-500/10 active:scale-95"
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
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-ink flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-primary-500" /> Đổi mật khẩu
            </h3>
            <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4" noValidate>
              <div>
                <label className="block text-xs font-semibold text-ink-muted uppercase mb-1.5">Mật khẩu cũ</label>
                <PasswordInput
                  placeholder="Nhập mật khẩu hiện tại"
                  hasError={!!passwordForm.formState.errors.old_password}
                  {...passwordForm.register('old_password')}
                />
                <FormFieldError message={passwordForm.formState.errors.old_password?.message} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-muted uppercase mb-1.5">Mật khẩu mới</label>
                <PasswordInput
                  placeholder="Nhập mật khẩu mới"
                  hasError={!!passwordForm.formState.errors.new_password}
                  {...passwordForm.register('new_password')}
                />
                <PasswordStrengthBar password={newPasswordValue} />
                <FormFieldError message={passwordForm.formState.errors.new_password?.message} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-muted uppercase mb-1.5">Xác nhận mật khẩu mới</label>
                <PasswordInput
                  placeholder="Nhập lại mật khẩu mới"
                  hasError={!!passwordForm.formState.errors.confirm_new_password}
                  {...passwordForm.register('confirm_new_password')}
                />
                <PasswordMatchIndicator password={newPasswordValue} confirmPassword={confirmNewPasswordValue} />
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
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-ink flex items-center gap-2">
                <VehiclesSectionIcon /> Phương tiện đỗ
              </h3>
              {!showAddVehicle && (
                <button 
                  onClick={() => setShowAddVehicle(true)}
                  className="text-xs text-primary-500 font-bold hover:text-primary-600 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Đăng ký xe
                </button>
              )}
            </div>

            {showAddVehicle && (
              <form onSubmit={vehicleForm.handleSubmit(onAddVehicle)} className="mb-4 p-4 bg-surface border border-slate-200 rounded-xl space-y-3.5" noValidate>
                <div>
                  <input
                    type="text"
                    placeholder="Biển số (VD: 29A-123.45)"
                    className={`w-full px-3 py-2 bg-white border rounded-lg text-sm text-ink focus:outline-none ${
                      vehicleForm.formState.errors.license_plate ? 'border-red-400' : 'border-slate-200'
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
                      className="text-primary-600 bg-white border-slate-200 focus:ring-0"
                      {...vehicleForm.register('vehicle_type')}
                    /> 🚗 Ô tô
                  </label>
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="radio"
                      value="motorbike"
                      className="text-primary-600 bg-white border-slate-200 focus:ring-0"
                      {...vehicleForm.register('vehicle_type')}
                    /> 🏍️ Xe máy
                  </label>
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={vehicleForm.formState.isSubmitting} className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50">Lưu lại</button>
                  <button type="button" onClick={() => { setShowAddVehicle(false); vehicleForm.reset(); }} className="flex-1 bg-slate-100 hover:bg-slate-200 text-ink-muted py-2 rounded-lg text-xs font-bold transition-all">Hủy</button>
                </div>
              </form>
            )}
            
            {loadingVehicles ? (
              <p className="text-ink-muted text-sm">Đang tải danh sách...</p>
            ) : vehicles.length === 0 ? (
              <p className="text-ink-muted text-sm text-center py-4">Chưa có phương tiện đăng ký.</p>
            ) : (
              <ul className="space-y-3">
                {vehicles.map((v) => (
                  <li key={v.id} className="p-3.5 rounded-xl border border-slate-200 bg-surface">
                    {editingVehicleId === v.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editPlate}
                          onChange={(e) => {
                            setEditPlate(e.target.value);
                            setEditPlateError('');
                          }}
                          className={`w-full px-3 py-1.5 bg-white border rounded-lg text-sm text-ink focus:outline-none ${
                            editPlateError ? 'border-red-400' : 'border-slate-200'
                          }`}
                        />
                        <FormFieldError message={editPlateError} />
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <input type="radio" name={`edit_type_${v.id}`} value="car" checked={editVehicleType === 'car'} onChange={(e) => setEditVehicleType(e.target.value)} className="text-primary-600" /> Ô tô
                          </label>
                          <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <input type="radio" name={`edit_type_${v.id}`} value="motorbike" checked={editVehicleType === 'motorbike'} onChange={(e) => setEditVehicleType(e.target.value)} className="text-primary-600" /> Xe máy
                          </label>
                        </div>
                        <div className="flex justify-end gap-2 mt-2 border-t border-slate-200 pt-2">
                          <button onClick={() => setEditingVehicleId(null)} className="p-1 text-ink-muted hover:text-ink"><X className="w-4 h-4" /></button>
                          <button onClick={() => handleSaveVehicle(v.id)} className="p-1 text-green-600 hover:text-green-700"><Check className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <VehicleTypeIcon vehicleType={v.vehicle_type} />
                          <div>
                            <p className="font-bold text-ink text-sm font-mono">{v.license_plate}</p>
                            <p className="text-xs text-ink-muted capitalize">{v.vehicle_type === 'car' ? 'Ô tô' : 'Xe máy'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => handleEditVehicle(v)} className="text-ink-muted hover:text-primary-500 p-1" title="Sửa thông tin">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteVehicle(v.id)} className="text-ink-muted hover:text-rose-500 p-1" title="Xóa xe">
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

        {/* Right Column: Reservations history */}
        <div className="lg:col-span-2 space-y-6">

          {/* History Reservations Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="h-1.5 bg-gradient-to-r from-[#003366] to-primary-500" />
            <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h3 className="text-lg font-bold text-brand-navy flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-500" /> Nhật ký đặt chỗ
              </h3>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-primary-500 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Xóa bộ lọc
                </button>
              )}
            </div>

            {bannerContent && (
              <div className="reservation-banner mb-5 flex items-start gap-3 p-4 pl-5 rounded-xl text-base text-primary-700">
                <QrCode className="w-6 h-6 flex-shrink-0 mt-0.5 text-primary-500 animate-pulse" />
                <p className="leading-relaxed">
                  Bạn có{' '}
                  {bannerContent.bookingPhrase && (
                    <strong className="text-primary-800 font-bold">{bannerContent.bookingPhrase}</strong>
                  )}
                  {bannerContent.bookingPhrase && bannerContent.inLotPhrase && ' và '}
                  {bannerContent.inLotPhrase && (
                    <strong className="text-primary-800 font-bold">{bannerContent.inLotPhrase}</strong>
                  )}
                  <span className="block mt-1 text-sm text-primary-600/90">
                    — {RESERVATION_BANNER_SUFFIX}
                  </span>
                </p>
              </div>
            )}

            {/* Filters */}
            <div className="space-y-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm mã vé, vị trí, biển số..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] uppercase tracking-wider text-ink-muted font-bold self-center mr-1">Loại xe</span>
                {([
                  ['all', 'Tất cả'],
                  ['motorbike', 'Xe máy'],
                  ['car', 'Ô tô'],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setVehicleFilter(value)}
                    className={filterChipClass(vehicleFilter === value)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] uppercase tracking-wider text-ink-muted font-bold self-center mr-1">Trạng thái</span>
                {([
                  ['all', 'Tất cả'],
                  ['pending', 'Đang chờ'],
                  ['checked_in', 'Đã vào bãi'],
                  ['completed', 'Đã hoàn tất'],
                  ['cancelled', 'Đã hủy'],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStatusFilter(value)}
                    className={filterChipClass(statusFilter === value)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] uppercase tracking-wider text-ink-muted font-bold self-center mr-1">Thời gian</span>
                {([
                  ['all', 'Tất cả'],
                  ['7d', '7 ngày'],
                  ['30d', '30 ngày'],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTimePreset(value)}
                    className={filterChipClass(timePreset === value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {loadingReservations ? (
              <div className="text-center py-12 text-ink-muted">Đang tải lịch sử gửi xe...</div>
            ) : reservations.length === 0 ? (
              <div className="text-center py-16 bg-surface rounded-xl border border-dashed border-slate-200">
                <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-ink-muted font-medium">Chưa có lịch sử gửi xe.</p>
              </div>
            ) : filteredReservations.length === 0 ? (
              <div className="text-center py-16 bg-surface rounded-xl border border-dashed border-slate-200">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-ink-muted font-medium">Không tìm thấy lượt gửi xe phù hợp bộ lọc.</p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-3 text-sm text-primary-500 hover:text-primary-600 font-semibold"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <p className="text-xs text-ink-muted mb-3">
                  <span className="text-ink-muted">Trang {reservationPagination.page}</span>
                  {' · '}
                  <span className="text-ink font-medium">
                    {reservationPagination.rangeStart}–{reservationPagination.rangeEnd}
                  </span>
                  {' / '}
                  <span className="text-ink font-medium">{reservationPagination.total}</span>
                  {' lượt gửi xe'}
                </p>
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-ink-muted text-xs uppercase font-semibold">
                      <th className="pb-3 font-semibold">Mã vé đỗ</th>
                      <th className="pb-3 font-semibold">Vị trí</th>
                      <th className="pb-3 font-semibold">Thông tin xe</th>
                      <th className="pb-3 font-semibold">Thời gian đặt & thực tế</th>
                      <th className="pb-3 font-semibold">Thanh toán</th>
                      <th className="pb-3 font-semibold">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {reservationPagination.items.map((res) => {
                      const showQr = shouldShowTicketQr(res);
                      const ticketGlassClass = getTicketGlassClass(res);
                      const TicketIcon = showQr ? QrCode : Ticket;
                      return (
                        <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 font-mono">
                            <button
                              type="button"
                              onClick={() => setSelectedTicket(res)}
                              className={`inline-flex items-center gap-1.5 ${ticketGlassClass}`}
                              title={showQr ? 'Xem chi tiết vé và mã QR' : 'Xem chi tiết vé'}
                            >
                              <TicketIcon className="w-3.5 h-3.5" />
                              {getDisplayTicketCode(res)}
                            </button>
                          </td>
                          <td className="py-4">
                            <span className="bg-slate-100 text-ink border border-slate-200 px-2.5 py-1 rounded-lg font-bold font-mono">
                              {res.slot_code}
                            </span>
                          </td>
                          <td className="py-4">
                            <span className="font-bold text-ink block font-mono">{res.license_plate}</span>
                            <span className="text-xs text-ink-muted capitalize">{res.vehicle_type === 'car' ? 'Ô tô' : 'Xe máy'}</span>
                          </td>
                          <td className="py-4 text-xs text-ink-muted space-y-1">
                            {res.is_walkin_history ? (
                              <>
                                {res.check_in_time && (
                                  <div className="text-blue-600">
                                    <span className="text-ink-muted">Vào bãi: </span>
                                    {formatDateTime24(res.check_in_time)}
                                  </div>
                                )}
                                {res.check_out_time && (
                                  <div className="text-emerald-600">
                                    <span className="text-ink-muted">Ra bãi: </span>
                                    {formatDateTime24(res.check_out_time)}
                                  </div>
                                )}
                              </>
                            ) : (
                              <>
                            <div>
                              <span className="text-ink-muted">Đặt: </span>
                              {formatDateTime24(res.reservation_time)}
                            </div>
                            {res.expected_checkout_time && (
                              <div>
                                <span className="text-ink-muted">Dự kiến ra: </span>
                                {formatDateTime24(res.expected_checkout_time)}
                              </div>
                            )}
                            {res.check_in_time && (
                              <div className="text-blue-600">
                                <span className="text-ink-muted">Vào bãi: </span>
                                {formatDateTime24(res.check_in_time)}
                              </div>
                            )}
                            {res.check_out_time && (
                              <div className="text-emerald-600">
                                <span className="text-ink-muted">Ra bãi: </span>
                                {formatDateTime24(res.check_out_time)}
                              </div>
                            )}
                              </>
                            )}
                          </td>
                          <td className="py-4 text-xs text-ink-muted">
                            {res.total_amount !== undefined && res.total_amount !== null ? (
                              <div className="space-y-1">
                                <div className="font-bold text-amber-600 text-base">{Number(res.total_amount).toLocaleString('vi-VN')}đ</div>
                                <div className="text-[9px] text-ink-muted flex items-center gap-1.5 mt-0.5">
                                  <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 uppercase font-semibold text-ink">
                                    {res.payment_method === 'cash' ? 'Tiền mặt' : 'Online'}
                                  </span>
                                  <span className={`px-1.5 py-0.5 rounded font-semibold ${res.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
                                    {res.payment_status === 'paid' ? 'Đã trả' : 'Chưa trả'}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-ink-muted">—</span>
                            )}
                          </td>
                          <td className="py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(res.status, res)}`}>
                              {getStatusText(res.status, res)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <ListPagination
                  page={reservationPagination.page}
                  totalPages={reservationPagination.totalPages}
                  onPageChange={setReservationPage}
                />
              </div>
            )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
