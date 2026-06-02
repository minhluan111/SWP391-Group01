import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle2, QrCode, CreditCard, ShieldCheck, MapPin, Clock, BarChart3, Car } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: <MapPin className="w-6 h-6 text-primary-600" />,
      title: 'Quản lý chỗ đậu',
      description: 'Hệ thống theo dõi thời gian thực, cập nhật chính xác vị trí trống.'
    },
    {
      icon: <Clock className="w-6 h-6 text-primary-600" />,
      title: 'Đặt chỗ trước',
      description: 'Đảm bảo vị trí đỗ xe của bạn luôn sẵn sàng trước khi đến.'
    },
    {
      icon: <QrCode className="w-6 h-6 text-primary-600" />,
      title: 'Mã vé QR',
      description: 'Check-in và check-out không chạm bằng mã QR tiện lợi.'
    },
    {
      icon: <CreditCard className="w-6 h-6 text-primary-600" />,
      title: 'Thanh toán tiện lợi',
      description: 'Hỗ trợ thanh toán qua tiền mặt, chuyển khoản ngân hàng nhanh chóng.'
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-primary-600" />,
      title: 'Báo cáo thống kê',
      description: 'Hệ thống báo cáo chi tiết về doanh thu và lưu lượng xe ra vào.'
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-primary-600" />,
      title: 'An toàn phương tiện',
      description: 'Lưu hình ảnh xe và nhận diện biển số tự động khi ra vào.'
    }
  ];

  const stats = [
    { label: 'TỔNG SỐ CHỖ ĐẬU', value: '500' },
    { label: 'CHỖ CÒN TRỐNG', value: '124' },
    { label: 'XE ĐANG GỬI', value: '376' },
    { label: 'TỔNG LƯỢT HÔM NAY', value: '1.245' }
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-dark leading-tight mb-6">
              Hệ thống quản lý bãi đậu xe thông minh
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-lg">
              Đặt chỗ nhanh chóng, quản lý phương tiện hiệu quả và thanh toán tiện lợi trong tòa nhà giữ xe hiện đại.
            </p>
            <div className="flex flex-wrap gap-4 mb-10">
              <Link to="/find-slot" className="bg-dark text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                Đặt chỗ ngay
              </Link>
              <Link to="/find-slot" className="bg-white text-dark border border-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Xem chỗ trống
              </Link>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                <CheckCircle2 className="w-5 h-5 text-primary-600" />
                Theo dõi chỗ trống theo thời gian thực
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                <QrCode className="w-5 h-5 text-primary-600" />
                Quét mã QR vé xe
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                <CreditCard className="w-5 h-5 text-primary-600" />
                Thanh toán nhanh chóng
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                <Car className="w-5 h-5 text-primary-600" />
                Quản lý xe hiện đại
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative h-[400px] md:h-[500px] bg-primary-50 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner"
          >
            {/* Placeholder for Hero Image */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-50 opacity-50"></div>
            <Car className="w-48 h-48 text-primary-200" />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-dark mb-4">Tính năng nổi bật</h2>
            <p className="text-gray-600">Giải pháp toàn diện cho việc quản lý và sử dụng bãi đỗ xe thông minh.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow border border-gray-100"
              >
                <div className="bg-white w-12 h-12 rounded-lg flex items-center justify-center mb-6 shadow-sm">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-dark mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-dark py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-slate-800/50 rounded-2xl p-8 text-center border border-slate-700">
                <p className="text-primary-400 text-sm font-semibold mb-2 uppercase tracking-wider">{stat.label}</p>
                <p className="text-4xl md:text-5xl font-bold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
