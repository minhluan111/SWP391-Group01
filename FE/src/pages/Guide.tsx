import { BookOpen, Ticket, ShieldCheck, Map } from 'lucide-react';

export default function Guide() {
  const steps = [
    {
      icon: <Map className="w-8 h-8 text-primary-600" />,
      title: '1. Tra cứu và đặt chỗ',
      desc: 'Tìm kiếm vị trí đỗ xe khả dụng theo khu vực mong muốn. Chọn "Đặt chỗ ngay" và điền thông tin phương tiện để giữ chỗ trong 30 phút.'
    },
    {
      icon: <Ticket className="w-8 h-8 text-primary-600" />,
      title: '2. Nhận vé QR',
      desc: 'Sau khi đặt chỗ hoặc khi đến cổng, hệ thống sẽ cấp cho bạn một mã QR định danh duy nhất.'
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-primary-600" />,
      title: '3. Check-in tự động',
      desc: 'Quét mã QR tại cổng. Hệ thống camera sẽ tự động nhận diện biển số và mở barie cho bạn vào bãi.'
    },
    {
      icon: <BookOpen className="w-8 h-8 text-primary-600" />,
      title: '4. Thanh toán & Check-out',
      desc: 'Khi ra về, quét mã QR lần nữa. Ứng dụng sẽ hiển thị số tiền cần thanh toán. Bạn có thể thanh toán trực tuyến hoặc tiền mặt.'
    }
  ];

  return (
    <div className="bg-white min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-dark mb-4">Hướng dẫn sử dụng</h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">4 bước đơn giản để trải nghiệm hệ thống gửi xe thông minh, an toàn và tiện lợi nhất.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="text-center p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center shadow-sm mb-6 text-primary-600">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-dark mb-3">{step.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
