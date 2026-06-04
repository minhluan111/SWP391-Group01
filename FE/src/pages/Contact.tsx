import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Contact() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Đã gửi tin nhắn liên hệ! Đội ngũ hỗ trợ sẽ phản hồi bạn sớm nhất.');
  };

  return (
    <div className="bg-slate-950 min-h-screen py-16 text-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-40 -left-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-slate-100 mb-4">Liên hệ với chúng tôi</h1>
          <p className="text-base text-slate-400 max-w-2xl mx-auto">
            Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giải đáp mọi thắc mắc của bạn 24/7.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          
          <div className="p-8 md:p-12 bg-slate-950 flex flex-col justify-between border-r border-slate-850">
            <div>
              <h2 className="text-2xl font-black mb-6 text-slate-100">Thông tin liên hệ</h2>
              <p className="text-slate-400 mb-12 text-sm">
                Bạn có thể gửi yêu cầu hỗ trợ hoặc liên hệ trực tiếp với chúng tôi qua các kênh dưới đây.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-primary-400 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-200 text-sm mb-1">Địa chỉ</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      123 Lê Lợi, Phường Bến Thành,<br/>Quận 1, TP. Hồ Chí Minh
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-primary-400 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-200 text-sm mb-1">Hotline</h4>
                    <p className="text-slate-400 text-xs">1900 6789</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-primary-400 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-200 text-sm mb-1">Email</h4>
                    <p className="text-slate-400 text-xs">contact@smartparking.vn</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-primary-400 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-200 text-sm mb-1">Giờ làm việc</h4>
                    <p className="text-slate-400 text-xs">Hỗ trợ trực tuyến 24/7</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-8 md:p-12">
            <h2 className="text-2xl font-black text-slate-100 mb-6">Gửi tin nhắn</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Họ và tên</label>
                <input required type="text" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm focus:outline-none" placeholder="Nhập họ tên của bạn" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email liên hệ</label>
                <input required type="email" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm focus:outline-none" placeholder="Địa chỉ email" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Nội dung hỗ trợ</label>
                <textarea required rows={4} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm focus:outline-none" placeholder="Nhập nội dung cần hỗ trợ..."></textarea>
              </div>
              <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-95 text-sm">
                Gửi yêu cầu
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
