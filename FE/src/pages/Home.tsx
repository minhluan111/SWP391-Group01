import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Clock, Smartphone, ChevronRight, RefreshCw, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';

export default function Home() {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const response = await api.get('/slots');
      setSlots(response.data.data);
    } catch (error) {
      console.error('Error fetching slots:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group slots by floor and count available slots
  const floorStats = slots.reduce((acc: any, slot: any) => {
    const floor = slot.floor;
    if (!acc[floor]) {
      acc[floor] = { total: 0, available: 0, type: slot.type };
    }
    acc[floor].total += 1;
    if (slot.status === 'available') {
      acc[floor].available += 1;
    }
    return acc;
  }, {});

  const totalSlots = slots.length || 40;
  const totalAvailable = slots.filter(s => s.status === 'available').length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-surface text-ink">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-50/80 via-surface to-surface"></div>
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-500/8 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-primary-500 font-medium text-sm mb-6 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
                Hệ Thống Đỗ Xe Thông Minh Bách Khoa
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold text-ink leading-tight mb-6">
                Tìm ô đỗ xe <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#003366] to-primary-500">Nhanh & Tiện lợi</span>
              </h1>
              <p className="text-lg md:text-xl text-ink-muted mb-10 max-w-2xl font-light leading-relaxed">
                Đồng bộ vị trí trống thời gian thực. Đặt chỗ trước chỉ với 3 click và xác thực bằng mã QR cực kỳ bảo mật lúc vào/ra bãi đỗ.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/find-slot" className="flex items-center justify-center gap-2 bg-brand-primary hover:opacity-90 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-[0_0_20px_rgba(0,123,255,0.25)] active:scale-95 duration-200">
                  Đặt Chỗ Ngay
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <Link to="/pricing" className="group flex items-center justify-center gap-2 border border-slate-200 text-ink px-8 py-4 rounded-xl text-lg font-semibold hover:bg-slate-50 transition-all">
                  Xem Bảng Giá
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
 
      {/* Real-time Vacant Slots Stats Section */}
      <section className="relative -mt-20 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 w-full">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white border border-slate-200 rounded-3xl p-8 shadow-lg"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-extrabold text-ink flex items-center gap-2">
                <Layers className="text-primary-500 w-5 h-5" />
                Mật độ trống hiện tại
              </h3>
              <p className="text-xs text-ink-muted mt-0.5">Dữ liệu bãi đỗ tự động cập nhật thời gian thực</p>
            </div>
            <button 
              onClick={fetchSlots} 
              disabled={loading}
              className="text-xs text-ink-muted hover:text-ink flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Làm mới
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center justify-center p-6 bg-surface rounded-2xl border border-slate-200">
              <span className="text-ink-muted text-xs font-semibold uppercase tracking-wider mb-2">TỔNG SLOT TRỐNG CHUNG</span>
              <strong className="text-5xl font-black text-emerald-500 tracking-tight">
                {totalAvailable} <span className="text-xl text-ink-muted font-medium">/ {totalSlots}</span>
              </strong>
            </div>

            {/* Dynamic Floors breakdown */}
            {Object.keys(floorStats).length === 0 ? (
              <div className="md:col-span-2 flex items-center justify-center p-6 text-ink-muted text-sm">
                Đang nạp dữ liệu tầng đỗ xe...
              </div>
            ) : (
              Object.keys(floorStats).map((floorName) => {
                const stats = floorStats[floorName];
                const percent = stats.total > 0 ? (stats.available / stats.total) * 100 : 0;
                return (
                  <div key={floorName} className="p-6 bg-surface rounded-2xl border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-extrabold text-ink text-sm">{floorName}</h4>
                        <span className="text-xs bg-slate-100 text-ink-muted px-2 py-0.5 rounded-full border border-slate-200 font-medium">
                          {stats.type === 'car' ? '🚗 Ô tô' : '🏍️ Xe máy'}
                        </span>
                      </div>
                      <p className="text-xs text-ink-muted">Trống {stats.available} trên tổng số {stats.total} vị trí</p>
                    </div>
                    <div className="mt-4">
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ${percent > 50 ? 'bg-emerald-500' : percent > 20 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-ink-muted mt-1.5 font-bold">
                        <span>HẾT CHỖ</span>
                        <span>CÒN {percent.toFixed(0)}% TRỐNG</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-ink mb-6"
            >
              Tại sao chọn <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#003366] to-primary-500">Smart Parking?</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-ink-muted"
            >
              Nền tảng công nghệ thông minh, minh bạch và an toàn 24/7.
            </motion.p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              { icon: Shield, title: 'An ninh tuyệt đối', desc: 'Kiểm soát chặt chẽ bằng biển số xe và mã QR xác minh. Camera AI giám sát liên tục.', color: 'text-primary-500', bg: 'bg-primary-50' },
              { icon: Clock, title: 'Tiết kiệm thời gian', desc: 'Không cần mất công lòng vòng tìm chỗ. Biết trước và đặt trước ô đỗ chính xác cho xế yêu.', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { icon: Smartphone, title: 'Đặt chỗ siêu tốc', desc: 'Xem sơ đồ 2D trực quan bãi xe, chọn xe, gợi ý tầng phù hợp và tạo mã đặt chỗ tức thì.', color: 'text-primary-500', bg: 'bg-primary-50' }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                variants={itemVariants}
                className="bg-white border border-slate-200 p-8 rounded-2xl relative overflow-hidden group hover:border-slate-300 hover:shadow-md transition-all duration-300"
              >
                <div className={`w-14 h-14 ${feature.bg} ${feature.color} border border-slate-200 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-ink mb-4">{feature.title}</h3>
                <p className="text-ink-muted text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative py-24 overflow-hidden border-t border-slate-200">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary-50/40 via-surface to-surface"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-ink mb-6">Trải nghiệm dịch vụ gửi xe thông minh ngay hôm nay</h2>
            <p className="text-ink-muted mb-10 text-base">Đăng ký tài khoản nhanh chóng để thực hiện đặt chỗ xe trực tuyến.</p>
            <Link to="/register" className="inline-flex items-center gap-2 bg-brand-primary text-white px-8 py-3.5 rounded-xl font-bold hover:opacity-90 transition-colors shadow-lg active:scale-95 duration-200">
              Đăng ký tài khoản
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
