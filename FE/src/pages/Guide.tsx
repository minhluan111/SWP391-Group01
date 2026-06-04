import { BookOpen, Ticket, ShieldCheck, Map } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Guide() {
  const steps = [
    {
      icon: <Map className="w-8 h-8 text-primary-400" />,
      title: '1. Tra cứu & đặt chỗ',
      desc: 'Chọn loại xe của bạn (Xe máy -> gợi ý Tầng 1, Ô tô -> gợi ý Tầng 2). Xem sơ đồ bãi đỗ, bấm chọn ô trống và xác nhận.'
    },
    {
      icon: <Ticket className="w-8 h-8 text-primary-400" />,
      title: '2. Nhận vé QR Code',
      desc: 'Mã Booking được tạo thành công kèm theo một QR Code động xuất hiện ngay tại trang cá nhân Profile của bạn.'
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-primary-400" />,
      title: '3. Nhân viên Check-in',
      desc: 'Khi tới cổng, đưa mã QR hoặc mã đặt chỗ cho nhân viên kiểm tra. Nhân viên quét mã xác nhận xe vào bãi đỗ.'
    },
    {
      icon: <BookOpen className="w-8 h-8 text-primary-400" />,
      title: '4. Check-out thanh toán',
      desc: 'Khi lấy xe ra, nhân viên tìm thông tin xe đỗ, tính thời gian đỗ thực tế và hiển thị số tiền mặt cần trả. Thanh toán xong và barie mở ra.'
    }
  ];

  return (
    <div className="bg-slate-950 min-h-screen py-16 text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-40 -left-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-slate-100 mb-4">Hướng dẫn sử dụng</h1>
          <p className="text-base text-slate-400 max-w-2xl mx-auto">
            Quy trình đỗ xe 4 bước tinh gọn giúp tối ưu thời gian gửi xe của bạn tại bãi đỗ.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              key={idx} 
              className="text-center p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all shadow-lg"
            >
              <div className="w-16 h-16 mx-auto bg-slate-950 border border-slate-850 rounded-full flex items-center justify-center shadow-sm mb-6 text-primary-400">
                {step.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-3">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
