import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Car, Plus, Trash2, Clock, Calendar, Edit2, Check, X, Phone } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface Vehicle {
  id: number;
  license_plate: string;
  vehicle_type: string;
}

interface Reservation {
  id: number;
  reservation_code: string;
  reservation_time: string;
  status: string;
  license_plate: string;
  vehicle_type: string;
  slot_code: string;
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  
  // Profile state
  const [editProfileMode, setEditProfileMode] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Vehicles state
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [newPlate, setNewPlate] = useState('');
  const [newType, setNewType] = useState('car');
  const [submittingVehicle, setSubmittingVehicle] = useState(false);
  
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
        setEditFullName(response.data.user.full_name);
        setEditPhone(response.data.user.phone || '');
      }
    } catch (error) {
      console.error('Failed to fetch profile', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!editFullName) return toast.error('Vui lòng nhập họ và tên');
    setSavingProfile(true);
    try {
      const response = await api.put('/auth/profile', { full_name: editFullName, phone: editPhone });
      if (response.data.success) {
        updateUser(response.data.user);
        toast.success('Cập nhật hồ sơ thành công');
        setEditProfileMode(false);
      }
    } catch (error) {
      toast.error('Lỗi khi cập nhật hồ sơ');
    } finally {
      setSavingProfile(false);
    }
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

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate) return toast.error('Vui lòng nhập biển số xe');
    
    setSubmittingVehicle(true);
    try {
      await api.post('/vehicles', { license_plate: newPlate, vehicle_type: newType });
      toast.success('Thêm phương tiện thành công');
      setNewPlate('');
      setShowAddVehicle(false);
      fetchVehicles();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi thêm xe');
    } finally {
      setSubmittingVehicle(false);
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
    if (!editPlate) return toast.error('Vui lòng nhập biển số');
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
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'checked_in': return 'bg-blue-100 text-blue-700';
      case 'expired': return 'bg-red-100 text-red-700';
      case 'cancelled': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
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
    return <div className="text-center py-20">Vui lòng đăng nhập để xem hồ sơ.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-dark mb-8">Hồ sơ cá nhân</h1>
      
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Info & Vehicles */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
            {!editProfileMode ? (
              <button 
                onClick={() => setEditProfileMode(true)}
                className="absolute top-4 right-4 text-white hover:text-gray-200"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            ) : null}
            
            <div className="bg-dark px-6 py-8 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center text-3xl font-bold text-white border-2 border-white/20 mb-3">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="text-white">
                <h2 className="text-xl font-bold">{user.full_name}</h2>
                <div className="flex items-center justify-center gap-2 text-slate-300 mt-1 text-sm">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{user.email}</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              {editProfileMode ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                    <input 
                      type="text" 
                      value={editFullName} 
                      onChange={(e) => setEditFullName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                    <input 
                      type="text" 
                      value={editPhone} 
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={handleSaveProfile} 
                      disabled={savingProfile}
                      className="flex-1 bg-primary-600 text-white py-2 rounded-md text-sm font-medium hover:bg-primary-700"
                    >
                      Lưu thay đổi
                    </button>
                    <button 
                      onClick={() => { setEditProfileMode(false); setEditFullName(user.full_name); setEditPhone(user.phone || ''); }}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md text-sm font-medium hover:bg-gray-200"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-sm text-gray-600">
                  <p className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-400" /> 
                    <span className="font-medium text-gray-800">{user.full_name}</span>
                  </p>
                  <p className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" /> 
                    <span className="font-medium text-gray-800">{user.phone || 'Chưa cập nhật'}</span>
                  </p>
                  <p className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-green-500" /> 
                    <span className="text-green-600 font-medium">Đã xác thực</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Vehicles Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-dark flex items-center gap-2">
                <Car className="w-5 h-5 text-primary-600" /> Phương tiện
              </h3>
              {!showAddVehicle && (
                <button 
                  onClick={() => setShowAddVehicle(true)}
                  className="text-sm text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Thêm xe
                </button>
              )}
            </div>

            {showAddVehicle && (
              <form onSubmit={handleAddVehicle} className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="mb-3">
                  <input 
                    type="text" 
                    placeholder="Biển số (VD: 29A-12345)" 
                    value={newPlate}
                    onChange={(e) => setNewPlate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="mb-3 flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="type" value="car" checked={newType === 'car'} onChange={(e) => setNewType(e.target.value)} className="text-primary-600" /> Ô tô
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="type" value="motorbike" checked={newType === 'motorbike'} onChange={(e) => setNewType(e.target.value)} className="text-primary-600" /> Xe máy
                  </label>
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={submittingVehicle} className="flex-1 bg-primary-600 text-white py-2 rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50">Lưu</button>
                  <button type="button" onClick={() => setShowAddVehicle(false)} className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 rounded-md text-sm font-medium hover:bg-gray-50">Hủy</button>
                </div>
              </form>
            )}
            
            {loadingVehicles ? (
              <p className="text-gray-500 text-sm">Đang tải...</p>
            ) : vehicles.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">Chưa có phương tiện nào.</p>
            ) : (
              <ul className="space-y-3">
                {vehicles.map((v) => (
                  <li key={v.id} className="p-3 rounded-lg border border-gray-100 bg-gray-50">
                    {editingVehicleId === v.id ? (
                      <div className="space-y-3">
                        <input 
                          type="text" 
                          value={editPlate} 
                          onChange={(e) => setEditPlate(e.target.value)}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-primary-500"
                        />
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 text-xs">
                            <input type="radio" name={`edit_type_${v.id}`} value="car" checked={editVehicleType === 'car'} onChange={(e) => setEditVehicleType(e.target.value)} className="text-primary-600" /> Ô tô
                          </label>
                          <label className="flex items-center gap-2 text-xs">
                            <input type="radio" name={`edit_type_${v.id}`} value="motorbike" checked={editVehicleType === 'motorbike'} onChange={(e) => setEditVehicleType(e.target.value)} className="text-primary-600" /> Xe máy
                          </label>
                        </div>
                        <div className="flex justify-end gap-2 mt-2 border-t pt-2">
                          <button onClick={() => setEditingVehicleId(null)} className="p-1 text-gray-500 hover:text-gray-700"><X className="w-4 h-4" /></button>
                          <button onClick={() => handleSaveVehicle(v.id)} className="p-1 text-green-600 hover:text-green-700"><Check className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-md ${v.vehicle_type === 'car' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                            <Car className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-dark text-sm">{v.license_plate}</p>
                            <p className="text-xs text-gray-500 capitalize">{v.vehicle_type === 'car' ? 'Ô tô' : 'Xe máy'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleEditVehicle(v)} className="text-gray-400 hover:text-primary-500 p-1">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteVehicle(v.id)} className="text-gray-400 hover:text-red-500 p-1">
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

        {/* Right Column: Reservations */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-full">
            <h3 className="text-lg font-semibold text-dark flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-primary-600" /> Lịch sử Đặt chỗ
            </h3>

            {loadingReservations ? (
              <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
            ) : reservations.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Bạn chưa có lượt đặt chỗ nào.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-sm text-gray-500">
                      <th className="pb-3 font-medium">Mã đặt chỗ</th>
                      <th className="pb-3 font-medium">Vị trí</th>
                      <th className="pb-3 font-medium">Phương tiện</th>
                      <th className="pb-3 font-medium">Thời gian</th>
                      <th className="pb-3 font-medium">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {reservations.map((res) => (
                      <tr key={res.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                        <td className="py-4 font-medium text-dark">{res.reservation_code}</td>
                        <td className="py-4">
                          <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md font-bold">
                            {res.slot_code}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="font-medium">{res.license_plate}</div>
                          <div className="text-xs text-gray-500 capitalize">{res.vehicle_type === 'car' ? 'Ô tô' : 'Xe máy'}</div>
                        </td>
                        <td className="py-4 text-gray-600">
                          {new Date(res.reservation_time).toLocaleString('vi-VN')}
                        </td>
                        <td className="py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(res.status)}`}>
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
