import { Link } from 'react-router-dom';
import { Shield, Clock, Smartphone, MapPin, ChevronRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
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
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-slate-50">
      {/* Hero Section with Premium AI Image */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero.png" 
            alt="Premium Smart Parking" 
            className="w-full h-full object-cover object-center transform scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-dark/95 via-dark/80 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/20 border border-primary-400/30 text-primary-300 font-medium text-sm mb-6 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse"></span>
                Hệ Thống Đỗ Xe Thông Minh
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
                Đỗ xe <span className="text-gradient">dễ dàng</span>, <br />
                Trải nghiệm <span className="text-gradient">đẳng cấp</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl font-light leading-relaxed">
                Quản lý vị trí thông minh, đặt chỗ trước qua ứng dụng và thanh toán không tiền mặt. An tâm tuyệt đối cho xế yêu của bạn.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/find-slot" className="btn-shine group flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)]">
                  Đặt Chỗ Ngay
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/pricing" className="glass-morphism group flex items-center justify-center gap-2 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/20 transition-all">
                  Xem Bảng Giá
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative -mt-16 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass-card rounded-2xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-gray-200/50"
        >
          <div className="text-center">
            <h3 className="text-4xl font-black text-dark mb-1">500+</h3>
            <p className="text-gray-500 font-medium">Vị trí đỗ xe</p>
          </div>
          <div className="text-center">
            <h3 className="text-4xl font-black text-dark mb-1">24/7</h3>
            <p className="text-gray-500 font-medium">Hoạt động</p>
          </div>
          <div className="text-center">
            <h3 className="text-4xl font-black text-dark mb-1">99%</h3>
            <p className="text-gray-500 font-medium">Khách hài lòng</p>
          </div>
          <div className="text-center">
            <h3 className="text-4xl font-black text-primary-600 mb-1">#1</h3>
            <p className="text-gray-500 font-medium">Công nghệ</p>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-dark mb-6"
            >
              Tại sao chọn <span className="text-primary-600">Smart Parking?</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600"
            >
              Chúng tôi áp dụng công nghệ tiên tiến nhất để mang lại trải nghiệm đỗ xe liền mạch và an toàn.
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
              { icon: Shield, title: 'An ninh tuyệt đối', desc: 'Hệ thống camera giám sát 24/7 cùng đội ngũ bảo vệ chuyên nghiệp, đảm bảo an toàn tối đa cho xe của bạn.', color: 'text-blue-500', bg: 'bg-blue-50' },
              { icon: Clock, title: 'Tiết kiệm thời gian', desc: 'Không cần chạy vòng vòng tìm chỗ. Đặt trước vị trí trên ứng dụng và đi thẳng đến chỗ đỗ của bạn.', color: 'text-primary-500', bg: 'bg-primary-50' },
              { icon: Smartphone, title: 'Quản lý thông minh', desc: 'Theo dõi thời gian đỗ, thanh toán trực tuyến và nhận thông báo ngay trên điện thoại của bạn.', color: 'text-indigo-500', bg: 'bg-indigo-50' }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                variants={itemVariants}
                className="glass-card group p-8 rounded-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-primary-100 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"></div>
                
                <div className={`w-16 h-16 ${feature.bg} ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-dark mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-dark"></div>
        <div className="absolute inset-0 bg-[url('/hero.png')] opacity-20 bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/80 to-transparent"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Bạn đã sẵn sàng trải nghiệm?</h2>
            <p className="text-xl text-gray-300 mb-10">Đăng ký thành viên ngay hôm nay để nhận ưu đãi giảm 20% cho tháng đầu tiên gửi xe.</p>
            <Link to="/register" className="inline-flex items-center gap-2 bg-white text-dark px-10 py-4 rounded-xl text-lg font-bold hover:bg-gray-100 transition-colors shadow-2xl hover:scale-105 duration-300">
              Tạo tài khoản miễn phí
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
