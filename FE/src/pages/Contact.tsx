import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function Contact() {
  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-dark mb-4">Liên hệ với chúng tôi</h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giải đáp mọi thắc mắc của bạn 24/7.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 md:p-12 bg-primary-900 text-white">
            <h2 className="text-2xl font-bold mb-6">Thông tin liên hệ</h2>
            <p className="text-primary-200 mb-12">Điền vào biểu mẫu bên cạnh hoặc liên hệ trực tiếp với chúng tôi qua các kênh dưới đây.</p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-primary-400 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-lg mb-1">Địa chỉ</h4>
                  <p className="text-primary-200">123 Lê Lợi, Phường Bến Thành,<br/>Quận 1, TP. Hồ Chí Minh</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 text-primary-400 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-lg mb-1">Hotline</h4>
                  <p className="text-primary-200">1900 6789</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-primary-400 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-lg mb-1">Email</h4>
                  <p className="text-primary-200">contact@smartparking.vn</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Clock className="w-6 h-6 text-primary-400 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-lg mb-1">Giờ làm việc</h4>
                  <p className="text-primary-200">Hỗ trợ trực tuyến 24/7</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-8 md:p-12">
            <h2 className="text-2xl font-bold text-dark mb-6">Gửi tin nhắn</h2>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                <input type="text" className="w-full border-gray-300 rounded-lg p-3 bg-gray-50 border focus:ring-primary-500 focus:border-primary-500" placeholder="Nhập họ tên của bạn" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" className="w-full border-gray-300 rounded-lg p-3 bg-gray-50 border focus:ring-primary-500 focus:border-primary-500" placeholder="Địa chỉ email" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tin nhắn</label>
                <textarea rows={4} className="w-full border-gray-300 rounded-lg p-3 bg-gray-50 border focus:ring-primary-500 focus:border-primary-500" placeholder="Nhập nội dung cần hỗ trợ..."></textarea>
              </div>
              <button type="button" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-lg transition-colors">
                Gửi yêu cầu
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
