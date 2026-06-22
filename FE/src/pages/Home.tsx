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
    <div className="flex flex-col min-h-screen font-sans bg-slate-950 text-white">
      {/* Hero Section with Premium Background */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/80 via-slate-950 to-slate-950"></div>
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/20 border border-primary-400/30 text-primary-300 font-medium text-sm mb-6 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse"></span>
                Hệ Thống Đỗ Xe Thông Minh Bách Khoa
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
                Tìm ô đỗ xe <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-indigo-300">Nhanh & Tiện lợi</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl font-light leading-relaxed">
                Đồng bộ vị trí trống thời gian thực. Đặt chỗ trước chỉ với 3 click và xác thực bằng mã QR cực kỳ bảo mật lúc vào/ra bãi đỗ.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/find-slot" className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] active:scale-95 duration-200">
                  Đặt Chỗ Ngay
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <Link to="/pricing" className="glass-morphism group flex items-center justify-center gap-2 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/20 transition-all">
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
          className="glass-morphism border border-slate-800/80 rounded-3xl p-8 shadow-2xl bg-slate-900/60"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
                <Layers className="text-primary-500 w-5 h-5" />
                Mật độ trống hiện tại
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Dữ liệu bãi đỗ tự động cập nhật thời gian thực</p>
            </div>
            <button 
              onClick={fetchSlots} 
              disabled={loading}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Làm mới
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center justify-center p-6 bg-slate-950/60 rounded-2xl border border-slate-850">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">TỔNG SLOT TRỐNG CHUNG</span>
              <strong className="text-5xl font-black text-emerald-400 tracking-tight">
                {totalAvailable} <span className="text-xl text-slate-500 font-medium">/ {totalSlots}</span>
              </strong>
            </div>

            {/* Dynamic Floors breakdown */}
            {Object.keys(floorStats).length === 0 ? (
              <div className="md:col-span-2 flex items-center justify-center p-6 text-slate-500 text-sm">
                Đang nạp dữ liệu tầng đỗ xe...
              </div>
            ) : (
              Object.keys(floorStats).map((floorName) => {
                const stats = floorStats[floorName];
                const percent = stats.total > 0 ? (stats.available / stats.total) * 100 : 0;
                return (
                  <div key={floorName} className="p-6 bg-slate-950/60 rounded-2xl border border-slate-850 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-extrabold text-slate-200 text-sm">{floorName}</h4>
                        <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700 font-medium">
                          {stats.type === 'car' ? '🚗 Ô tô' : '🏍️ Xe máy'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">Trống {stats.available} trên tổng số {stats.total} vị trí</p>
                    </div>
                    <div className="mt-4">
                      <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ${percent > 50 ? 'bg-emerald-500' : percent > 20 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1.5 font-bold">
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
      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-slate-100 mb-6"
            >
              Tại sao chọn <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-indigo-300">Smart Parking?</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-slate-400"
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
              { icon: Shield, title: 'An ninh tuyệt đối', desc: 'Kiểm soát chặt chẽ bằng biển số xe và mã QR xác minh. Camera AI giám sát liên tục.', color: 'text-blue-400', bg: 'bg-blue-950/30' },
              { icon: Clock, title: 'Tiết kiệm thời gian', desc: 'Không cần mất công lòng vòng tìm chỗ. Biết trước và đặt trước ô đỗ chính xác cho xế yêu.', color: 'text-emerald-400', bg: 'bg-emerald-950/30' },
              { icon: Smartphone, title: 'Đặt chỗ siêu tốc', desc: 'Xem sơ đồ 2D trực quan bãi xe, chọn xe, gợi ý tầng phù hợp và tạo mã đặt chỗ tức thì.', color: 'text-indigo-400', bg: 'bg-indigo-950/30' }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                variants={itemVariants}
                className="bg-slate-900 border border-slate-800/80 p-8 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all duration-300"
              >
                <div className={`w-14 h-14 ${feature.bg} ${feature.color} border border-slate-800 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-4">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative py-24 overflow-hidden border-t border-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950 to-slate-950"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">Trải nghiệm dịch vụ gửi xe thông minh ngay hôm nay</h2>
            <p className="text-slate-400 mb-10 text-base">Đăng ký tài khoản nhanh chóng để thực hiện đặt chỗ xe trực tuyến.</p>
            <Link to="/register" className="inline-flex items-center gap-2 bg-white text-slate-950 px-8 py-3.5 rounded-xl font-bold hover:bg-slate-100 transition-colors shadow-xl active:scale-95 duration-200">
              Đăng ký tài khoản
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
